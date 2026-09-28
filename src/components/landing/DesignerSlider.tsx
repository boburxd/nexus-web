"use client"

import {useCallback, useEffect, useRef, useState} from "react"
import {Button} from "@/components/ui/button"
import {Icon} from "@/components/ui/icon"
import {DesignerProfileModal, type DesignerSlide} from "./DesignerProfileModal"

function sampleBrightness(src: string, cb: (lightBg: boolean) => void) {
    const img = new window.Image()
    // crossOrigin только для same-origin: иначе S3 без CORS-бакета ломает загрузку (GET blocked).
    // Без crossOrigin картинка грузится; getImageData может не пройти — тогда светлый текст шапки по умолчанию.
    const fallback = () => cb(false)
    try {
        if (src.startsWith("/") || src.startsWith(window.location.origin)) {
            img.crossOrigin = "anonymous"
        }
    } catch {
        /* SSR */
    }
    img.onerror = fallback
    img.onload = () => {
        try {
            const canvas = document.createElement("canvas")
            canvas.width = 80
            canvas.height = 40
            const ctx = canvas.getContext("2d")
            if (!ctx) return fallback()
            ctx.drawImage(img, 0, 0, 80, 40)
            const {data} = ctx.getImageData(0, 0, 80, 40)
            let sum = 0
            for (let i = 0; i < data.length; i += 4) {
                sum += (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000
            }
            cb(sum / (data.length / 4) > 140)
        } catch {
            fallback()
        }
    }
    img.src = src
}

interface DesignerSliderProps {
    slides: DesignerSlide[]
    onBrightnessChange?: (lightBg: boolean) => void
}

/** Подтверждённый уровень квалификации — главный аргумент подборки на главной. */
function LevelBadge({slide}: { slide: DesignerSlide }) {
    if (!slide.levelTitle) return null
    return (
        <span className={`ds-level${slide.level === "L4" ? " ds-level--elite" : ""}`}>
            {slide.levelTitle}
        </span>
    )
}


function slideKey(s: DesignerSlide, i: number) {
    return s.id ?? `${s.name}-${s.avatar}-${i}`
}

function ActiveDesignerContent({
                                   slide,
                                   onOpenProfile,
                               }: {
    slide: DesignerSlide
    onOpenProfile: () => void
}) {
    return (
        <>
            <div className="ds-designer-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="ds-avatar" src={slide.avatar ?? undefined} alt={slide.name} decoding="async"/>
                <div>
                    <h2 className="ds-name">{slide.name}</h2>
                    {slide.levelTitle && <div className="ds-specialty"><LevelBadge slide={slide}/></div>}
                </div>
            </div>
            <div className="ds-meta">
                <span>{slide.experience} лет опыта</span>
                {slide.has3d && <span>3D</span>}
                {slide.hasRd && <span>Чертежи</span>}
            </div>
            <div className="ds-meta" style={{marginBottom: 4}}>
                <span>Реализовано {slide.sqm} м²</span>
            </div>
            <Button type="button" size="lg" className="ds-see-more" onClick={e => {
                e.stopPropagation()
                onOpenProfile()
            }}>
                Открыть профиль
            </Button>
        </>
    )
}

export function DesignerSlider({slides, onBrightnessChange}: DesignerSliderProps) {
    const [activeDesigner, setActiveDesigner] = useState<DesignerSlide | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const activeSlide = slides[activeIndex] ?? slides[0]
    const previewSlides = Array.from({length: Math.min(3, Math.max(0, slides.length - 1))}, (_, offset) => {
        const index = (activeIndex + offset + 1) % slides.length
        return {slide: slides[index], index}
    })

    const handleNext = useCallback(() => {
        setActiveIndex((current) => (current + 1) % slides.length)
    }, [slides.length])

    const handlePrev = useCallback(() => {
        setActiveIndex((current) => (current - 1 + slides.length) % slides.length)
    }, [slides.length])

    // ── Drag / swipe ──────────────────────────────────────────
    const dragRef = useRef({active: false, startX: 0})

    useEffect(() => {
        if (activeSlide?.work && onBrightnessChange) sampleBrightness(activeSlide.work, onBrightnessChange)
    }, [activeSlide?.work, onBrightnessChange])

    useEffect(() => {
        const THRESHOLD = 80

        function onStart(x: number) {
            dragRef.current = {active: true, startX: x}
        }

        function onEnd(x: number) {
            if (!dragRef.current.active) return
            dragRef.current.active = false
            const dx = x - dragRef.current.startX
            if (dx < -THRESHOLD) handleNext()
            else if (dx > THRESHOLD) handlePrev()
        }

        // Mouse
        const onMouseDown = (e: MouseEvent) => onStart(e.clientX)
        const onMouseUp = (e: MouseEvent) => onEnd(e.clientX)

        // Touch
        const onTouchStart = (e: TouchEvent) => onStart(e.touches[0].clientX)
        const onTouchEnd = (e: TouchEvent) => onEnd(e.changedTouches[0].clientX)

        const target = document.querySelector<HTMLElement>(".ds-wrap")
        if (!target) return
        target.addEventListener("mousedown", onMouseDown)
        window.addEventListener("mouseup", onMouseUp)
        target.addEventListener("touchstart", onTouchStart, {passive: true})
        target.addEventListener("touchend", onTouchEnd)

        return () => {
            target.removeEventListener("mousedown", onMouseDown)
            window.removeEventListener("mouseup", onMouseUp)
            target.removeEventListener("touchstart", onTouchStart)
            target.removeEventListener("touchend", onTouchEnd)
        }
    }, [handleNext, handlePrev])
    // ─────────────────────────────────────────────────────────

    return (
        <>
            <DesignerProfileModal
                designer={activeDesigner}
                onClose={() => setActiveDesigner(null)}
            />

            <div className="ds-wrap">
                <div className="ds-slide">
                    {activeSlide && (
                        <div
                            key={`active-${slideKey(activeSlide, activeIndex)}`}
                            className="ds-slide-item ds-slide-item--active"
                        >
                            <div
                                className="ds-work-layer"
                                style={{
                                    backgroundImage: `url('${activeSlide.work}')`,
                                    backgroundPosition: activeSlide.workPos,
                                }}
                            />
                            <div className="ds-content">
                                <ActiveDesignerContent
                                    slide={activeSlide}
                                    onOpenProfile={() => setActiveDesigner(activeSlide)}
                                />
                            </div>
                        </div>
                    )}

                    {previewSlides.length > 0 && (
                        <div className="ds-preview-rail" aria-label="Выбор специалиста">
                            {previewSlides.map(({slide: preview, index}) => (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    key={`preview-${slideKey(preview, index)}`}
                                    className="ds-slide-item ds-slide-item--preview"
                                    style={preview.avatar ? {backgroundImage: `url('${preview.avatar}')`} : undefined}
                                    onClick={() => setActiveIndex(index)}
                                    aria-label={`Показать специалиста ${preview.name}`}
                                >
                                    <div className="ds-card-label">
                                        <div className="ds-card-name">{preview.name}</div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    )}

                </div>

                {slides[activeIndex] && (
                    <div className="ds-active-overlay" key={activeIndex}>
                        <ActiveDesignerContent
                            slide={slides[activeIndex]}
                            onOpenProfile={() => setActiveDesigner(slides[activeIndex])}
                        />
                    </div>
                )}

                {slides.length > 1 && <div className="ds-nav">
                    <Button variant="secondary" size="icon-lg" onClick={handlePrev} aria-label="Предыдущий дизайнер">
                        <Icon name="left-arrow-alt" size={20}/>
                    </Button>
                    <Button variant="secondary" size="icon-lg" onClick={handleNext} aria-label="Следующий дизайнер">
                        <Icon name="right-arrow-alt" size={20}/>
                    </Button>
                </div>}

            </div>

            <style>{`
        .ds-wrap {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .ds-slide {
          position: relative;
          width: 100%;
          height: 100%;
        }

        /* ── Базовая карточка (маленькая, справа) ── */
        .ds-slide-item {
          width: 14vw;
          height: 62vh;
          position: absolute;
          top: 50%;
          transform: translate(0, -50%);
          background-size: cover;
          background-position: center top;
          display: inline-block;
          transition: box-shadow 0.3s ease-out;
          overflow: hidden;
        }

        /* ── Слой с работой (показывается только на full screen) ── */
        .ds-work-layer {
          position: absolute;
          inset: 0;
          background-size: cover;
          opacity: 0;
          transition: opacity 0.3s ease-out;
        }

        /* ── Контент активной карточки ── */
        .ds-slide-item .ds-content {
          position: absolute;
          bottom: 80px;
          left: 12vw;
          width: 34vw;
          color: var(--card-foreground);
          display: none;
          z-index: 2;
        }

        .ds-designer-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
          opacity: 0;
          animation: ds-animate 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0s 1 forwards;
        }

        .ds-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.6);
          flex-shrink: 0;
        }

        .ds-name {
          margin: 0;
          font-size: clamp(1.4rem, 2.5vw, 2.8rem);
          font-weight: bold;
          line-height: 1.1;
          color: var(--card-foreground);
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
        }

        .ds-level {
          display: inline-block;
          margin-right: 8px;
          padding: 2px 8px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.12);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          vertical-align: middle;
          white-space: nowrap;
        }

        .ds-level--elite {
          background: color-mix(in oklab, var(--warning) 18%, transparent);
          color: var(--warning);
        }

        .ds-specialty {
          font-size: clamp(0.75rem, 1vw, 1rem);
          color: rgba(255, 255, 255, 0.92);
          margin-top: 2px;
          text-shadow:
            0 0 1px rgba(0, 0, 0, 0.9),
            0 1px 2px rgba(0, 0, 0, 0.85),
            -1px 0 0 rgba(0, 0, 0, 0.65),
            1px 0 0 rgba(0, 0, 0, 0.65),
            0 1px 0 rgba(0, 0, 0, 0.65);
        }

        .ds-meta {
          display: flex;
          gap: 20px;
          font-size: clamp(0.8rem, 1vw, 1rem);
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 6px;
          text-shadow:
            0 0 1px rgba(0, 0, 0, 0.85),
            0 1px 2px rgba(0, 0, 0, 0.75);
          opacity: 0;
          animation: ds-animate 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.08s 1 forwards;
        }

        .ds-see-more {
          opacity: 0;
          animation: ds-animate 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.16s 1 forwards;
          pointer-events: auto;
        }

        /* ── Подпись на маленькой карточке ── */
        .ds-card-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 12px 14px;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          display: block;
        }

        .ds-card-name {
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-shadow:
            0 0 1px rgba(0, 0, 0, 0.9),
            0 1px 2px rgba(0, 0, 0, 0.8),
            -1px 0 0 rgba(0, 0, 0, 0.6),
            1px 0 0 rgba(0, 0, 0, 0.6);
        }

        /* ── Анимация контента ── */
        @keyframes ds-animate {
          from {
            opacity: 0;
            transform: translate(0, 8px);
          }
          to {
            opacity: 1;
            transform: translate(0);
          }
        }

        /* ── Кнопки навигации ── */
        .ds-nav {
          display: flex;
          flex-direction: row;
          gap: 14px;
          position: absolute;
          bottom: 28px;
          left: 45%;
          pointer-events: auto;
          z-index: 10;
        }

        /* Explicit state-driven layout: one active specialist + up to three previews. */
        .ds-slide .ds-slide-item--active {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform: none;
          background-color: var(--card);
          cursor: grab;
          animation: ds-active-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .ds-slide .ds-slide-item--active .ds-work-layer {
          opacity: 1;
        }

        .ds-slide .ds-slide-item--active .ds-work-layer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.38);
        }

        .ds-slide .ds-slide-item--active .ds-content {
          display: block;
        }

        .ds-slide .ds-slide-item--active .ds-card-label {
          display: none;
        }

        /* Превью — квадратная карточка с фото профиля: клик переключает специалиста. */
        .ds-slide .ds-slide-item--preview {
          top: 50%;
          width: clamp(120px, 12vw, 220px);
          height: auto;
          aspect-ratio: 1 / 1;
          transform: translateY(-50%);
          background-position: center;
          cursor: pointer;
          text-align: left;
          z-index: 4;
        }

        .ds-slide .ds-slide-item--preview .ds-card-label { display: block; }

        .ds-slide .ds-slide-item--preview:hover {
          box-shadow: 0 40px 60px rgba(0, 0, 0, 0.5);
        }

        .ds-preview-rail {
          position: absolute;
          top: 50%;
          right: 0 !important;
          left: auto !important;
          z-index: 4;
          display: flex;
          flex-direction: row-reverse;
          align-items: center;
          gap: 0;
          transform: translateY(-50%);
          margin: 0;
          padding: 0;
          width: max-content;
        }

        .ds-slide .ds-preview-rail .ds-slide-item--preview {
          position: relative !important;
          inset: auto !important;
          flex: 0 0 clamp(120px, 12vw, 220px);
          width: clamp(120px, 12vw, 220px);
          transform: none;
          margin: 0;
          animation: ds-preview-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .ds-slide .ds-preview-rail .ds-slide-item--preview:nth-child(2) {
          animation-delay: 0.08s;
        }

        /* Больше одной карточки в очереди — первую в DOM (row-reverse кладёт её крайней у правого края экрана)
           уводим наполовину за край, подсказка, что список длиннее видимого. Остальные карточки сдвигаем
           следом на тот же шаг (8%), чтобы зазоры между всеми карточками остались одинаковыми — при gap:0
           зазор между соседями равен разнице их translate, поэтому весь ряд шагает синхронно. CSS-свойство
           translate отдельное от transform, поэтому не перетирается анимацией ds-preview-in (она анимирует
           именно transform) и складывается с ней. */
        .ds-slide .ds-preview-rail .ds-slide-item--preview:not(:only-child):nth-child(1) {
          translate: 50% 0;
        }

        .ds-slide .ds-preview-rail .ds-slide-item--preview:nth-child(2) {
          translate: 42% 0;
        }

        .ds-slide .ds-preview-rail .ds-slide-item--preview:nth-child(3) {
          translate: 34% 0;
        }

        @keyframes ds-active-in {
          from { opacity: 0; transform: scale(1.035); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes ds-preview-in {
          from { opacity: 0; transform: translateX(48px) scale(0.96); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }

        /* ── Оверлей активного дизайнера (только мобильный) ── */
        .ds-active-overlay {
          display: none;
        }

        @media (max-width: 768px) {
          .ds-slide-item {
            width: 28vw;
          }

          .ds-slide .ds-slide-item--preview {
            width: 24vw;
          }

          .ds-preview-rail {
            gap: 0;
          }

          .ds-slide .ds-preview-rail .ds-slide-item--preview {
            flex-basis: 24vw;
            width: 24vw;
          }

          .ds-slide .ds-slide-item .ds-card-label {
            display: none !important;
          }

          .ds-slide .ds-slide-item .ds-content {
            display: none !important;
          }

          .ds-active-overlay {
            display: block;
            position: absolute;
            z-index: 15;
            bottom: 96px;
            left: 20px;
            right: 56px;
            pointer-events: none;
            color: var(--card-foreground);
          }

          .ds-active-overlay .ds-see-more {
            pointer-events: auto;
          }

          .ds-active-overlay .ds-name {
            font-size: clamp(1.25rem, 5.5vw, 1.75rem);
          }

          .ds-active-overlay .ds-specialty {
            font-size: 0.75rem;
          }

          .ds-active-overlay .ds-meta {
            flex-wrap: wrap;
            gap: 10px 16px;
            font-size: 0.75rem;
          }
        }
      `}</style>
        </>
    )
}
