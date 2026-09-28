"use client"

import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react"
import {createPortal} from "react-dom"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"

export type HintStep = {
    /** CSS-селектор подсвечиваемого элемента. Шаг пропускается, если элемента нет в DOM. */
    target: string
    title: string
    /** Короткое пояснение — одна-две строки, длинные тексты убивают смысл подсветки. */
    text: string
    /** Подготовка перед показом: переключить вкладку, раскрыть блок и т.п. */
    /** Подготовка шага. `true` — начат переход на другой адрес, цель появится после загрузки. */
    before?: () => void | boolean
}

type Rect = { top: number; left: number; width: number; height: number }
type Viewport = {top: number; left: number; width: number; height: number}

/** Отступ подсветки вокруг элемента. */
const PAD = 8
const CARD_WIDTH = 320
const CARD_GAP = 14
/** Пауза после before(): даём React отрисовать вкладку, прежде чем мерить элемент. */
const BEFORE_DELAY_MS = 220
/**
 * before() может переключать раздел переходом на другой адрес — тогда цель появляется
 * только после загрузки страницы. Ждём её столько, прежде чем пропустить шаг.
 */
const BEFORE_TARGET_TIMEOUT_MS = 3000
const TARGET_POLL_MS = 100

function readViewport(): Viewport {
    const vv = window.visualViewport
    return vv
        ? {top: vv.offsetTop, left: vv.offsetLeft, width: vv.width, height: vv.height}
        : {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight}
}

function readRect(selector: string): Rect | null {
    if (typeof document === "undefined") return null
    const el = document.querySelector<HTMLElement>(selector)
    if (!el) return null
    const style = window.getComputedStyle(el)
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return null
    const r = el.getBoundingClientRect()
    if (r.width <= 0 || r.height <= 0 || el.getClientRects().length === 0) return null
    const viewport = readViewport()
    const right = Math.min(r.right + PAD, viewport.left + viewport.width)
    const bottom = Math.min(r.bottom + PAD, viewport.top + viewport.height)
    const left = Math.max(r.left - PAD, viewport.left)
    const top = Math.max(r.top - PAD, viewport.top)
    if (right <= left || bottom <= top) return null
    return {top, left, width: right - left, height: bottom - top}
}

function seenKey(storageKey: string): string {
    return `nexus-hint-tour:${storageKey}`
}

export function hasSeenHintTour(storageKey: string): boolean {
    try {
        return window.localStorage.getItem(seenKey(storageKey)) === "1"
    } catch {
        return true // приватный режим/заблокированное хранилище — не навязываем подсказки
    }
}

export function markHintTourSeen(storageKey: string): void {
    try {
        window.localStorage.setItem(seenKey(storageKey), "1")
    } catch {
        /* хранилище недоступно — подсказка просто покажется снова */
    }
}

/** Сбросить отметку о просмотре (кнопка «Показать подсказки» в кабинете). */
export function resetHintTour(storageKey: string): void {
    try {
        window.localStorage.removeItem(seenKey(storageKey))
    } catch {
        /* ignore */
    }
}

/**
 * Слой-подсказка: затемняет всё, кроме объясняемого элемента.
 * Затемнение даёт «дырка» из четырёх панелей вокруг цели: сама цель остаётся открытой.
 */
export function HintTour({
                             steps,
                             storageKey,
                             enabled = true,
                             open,
                             onClose,
                         }: {
    steps: readonly HintStep[]
    /** Ключ в localStorage: обычно `${role}:v1:${email}`. */
    storageKey: string
    /** Автозапуск при первом визите. */
    enabled?: boolean
    /** Ручной запуск (кнопка «Подсказки»): переопределяет автозапуск. */
    open?: boolean
    onClose?: () => void
}) {
    const [mounted, setMounted] = useState(false)
    const [active, setActive] = useState(false)
    const [index, setIndex] = useState(0)
    const [rect, setRect] = useState<Rect | null>(null)
    const [viewport, setViewport] = useState<Viewport | null>(null)
    const [cardHeight, setCardHeight] = useState(180)
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => setMounted(true), [])

    // Автозапуск: только при первом визите и только если есть что показывать.
    useEffect(() => {
        if (!mounted || open !== undefined) return
        if (!enabled || steps.length === 0) return
        if (hasSeenHintTour(storageKey)) return
        setIndex(0)
        setActive(true)
    }, [mounted, enabled, steps.length, storageKey, open])

    useEffect(() => {
        if (open === undefined) return
        setActive(open)
        if (open) setIndex(0)
    }, [open])

    const step = active ? steps[index] : undefined

    const finish = useCallback(() => {
        setActive(false)
        setRect(null)
        markHintTourSeen(storageKey)
        onClose?.()
    }, [storageKey, onClose])

    const goTo = useCallback((next: number) => {
        if (next >= steps.length) {
            finish()
            return
        }
        setIndex(next)
    }, [steps.length, finish])

    // Измерение цели: после before(), с пересчётом на скролл/ресайз.
    useEffect(() => {
        if (!step) return
        let cancelled = false
        let raf = 0
        let resizeObserver: ResizeObserver | null = null

        const navigating = step.before?.() === true

        const measure = () => {
            if (cancelled) return
            const next = readRect(step.target)
            setRect(next)
            setViewport(readViewport())
        }

        const startedAt = Date.now()
        let timer = 0
        const locate = () => {
            if (cancelled) return
            const el = document.querySelector<HTMLElement>(step.target)
            if (!el) {
                if (navigating && Date.now() - startedAt < BEFORE_TARGET_TIMEOUT_MS) {
                    timer = window.setTimeout(locate, TARGET_POLL_MS)
                    return
                }
                // Цели нет (вкладка пустая, блок не отрисован) — шаг пропускаем.
                goTo(index + 1)
                return
            }
            const targetStyle = window.getComputedStyle(el)
            if (targetStyle.display === "none" || targetStyle.visibility === "hidden" || targetStyle.opacity === "0") {
                goTo(index + 1)
                return
            }
            // Instant scrolling avoids measuring halfway through a smooth nested-container scroll.
            el.scrollIntoView({block: "center", inline: "nearest", behavior: "auto"})
            if (typeof ResizeObserver !== "undefined") {
                resizeObserver = new ResizeObserver(measure)
                resizeObserver.observe(el)
            }
            raf = window.requestAnimationFrame(() => {
                raf = window.requestAnimationFrame(measure)
            })
        }
        timer = window.setTimeout(locate, step.before ? BEFORE_DELAY_MS : 0)

        const onViewportChange = () => {
            window.cancelAnimationFrame(raf)
            raf = window.requestAnimationFrame(measure)
        }
        window.addEventListener("resize", onViewportChange)
        window.addEventListener("scroll", onViewportChange, true)
        window.visualViewport?.addEventListener("resize", onViewportChange)
        window.visualViewport?.addEventListener("scroll", onViewportChange)

        return () => {
            cancelled = true
            window.clearTimeout(timer)
            window.cancelAnimationFrame(raf)
            resizeObserver?.disconnect()
            window.removeEventListener("resize", onViewportChange)
            window.removeEventListener("scroll", onViewportChange, true)
            window.visualViewport?.removeEventListener("resize", onViewportChange)
            window.visualViewport?.removeEventListener("scroll", onViewportChange)
        }
    }, [step, index, goTo])

    useEffect(() => {
        if (!active) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") finish()
            if (e.key === "ArrowRight" || e.key === "Enter") goTo(index + 1)
            if (e.key === "ArrowLeft" && index > 0) goTo(index - 1)
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [active, index, goTo, finish])

    useLayoutEffect(() => {
        if (!cardRef.current) return
        const update = () => setCardHeight(cardRef.current?.getBoundingClientRect().height ?? 180)
        update()
        if (typeof ResizeObserver === "undefined") return
        const observer = new ResizeObserver(update)
        observer.observe(cardRef.current)
        return () => observer.disconnect()
    }, [step])

    const cardPosition = useMemo(() => {
        const vp = viewport
        if (!vp) return {top: 24, left: 16}
        const minLeft = vp.left + 16
        const maxLeft = Math.max(minLeft, vp.left + vp.width - CARD_WIDTH - 16)
        const minTop = vp.top + 16
        const maxTop = Math.max(minTop, vp.top + vp.height - cardHeight - 16)
        if (!rect) {
            return {
                top: Math.min(maxTop, Math.max(minTop, vp.top + (vp.height - cardHeight) / 2)),
                left: Math.min(maxLeft, Math.max(minLeft, vp.left + (vp.width - CARD_WIDTH) / 2)),
            }
        }
        const candidates = [
            {top: rect.top + rect.height + CARD_GAP, left: rect.left},
            {top: rect.top - cardHeight - CARD_GAP, left: rect.left},
            {top: rect.top, left: rect.left + rect.width + CARD_GAP},
            {top: rect.top, left: rect.left - CARD_WIDTH - CARD_GAP},
        ]
        const fits = candidates.find(({top, left}) =>
            top >= minTop && top <= maxTop && left >= minLeft && left <= maxLeft,
        )
        const chosen = fits ?? candidates
            .map((candidate) => ({
                ...candidate,
                penalty:
                    Math.abs(candidate.top - Math.min(maxTop, Math.max(minTop, candidate.top))) +
                    Math.abs(candidate.left - Math.min(maxLeft, Math.max(minLeft, candidate.left))),
            }))
            .sort((a, b) => a.penalty - b.penalty)[0]
        return {
            top: Math.min(maxTop, Math.max(minTop, chosen.top)),
            left: Math.min(maxLeft, Math.max(minLeft, chosen.left)),
        }
    }, [rect, viewport, cardHeight])

    if (!mounted || !active || !step) return null

    const dim = "rgba(10,10,18,0.55)"
    const dimPanel: React.CSSProperties = {
        position: "fixed",
        background: dim,
        zIndex: "var(--z-tour)",
    }

    return createPortal(
        <div role="dialog" aria-modal="true" aria-label={step.title}>
            {rect ? (
                <>
                    {/* Четыре панели вокруг цели: сама цель остаётся резкой и кликабельной. */}
                    <div style={{...dimPanel, top: 0, left: 0, right: 0, height: Math.max(0, rect.top)}}/>
                    <div style={{...dimPanel, top: rect.top + rect.height, left: 0, right: 0, bottom: 0}}/>
                    <div style={{...dimPanel, top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.height}}/>
                    <div style={{...dimPanel, top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height}}/>
                    <div
                        style={{
                            position: "fixed",
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height,
                            borderRadius: 10,
                            boxShadow: "0 0 0 3px var(--dash-accent, var(--ring))",
                            pointerEvents: "none",
                            zIndex: "calc(var(--z-tour) + 1)",
                        }}
                    />
                </>
            ) : (
                <div style={{...dimPanel, inset: 0}}/>
            )}

            <div
                ref={cardRef}
                style={{
                    position: "fixed",
                    top: cardPosition.top,
                    left: cardPosition.left,
                    width: CARD_WIDTH,
                    maxWidth: "calc(100vw - 32px)",
                    zIndex: "calc(var(--z-tour) + 2)",
                    borderRadius: 14,
                    background: "var(--dash-surface2, var(--popover))",
                    padding: "14px 16px",
                    color: "var(--dash-text, var(--popover-foreground))",
                    fontFamily: "inherit",
                }}
            >
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
                    <Icon name="info-circle" style={{color: "var(--dash-accent, var(--primary))", fontSize: 16}}/>
                    <span style={{fontWeight: 600, fontSize: "0.875rem"}}>{step.title}</span>
                    <span style={{marginLeft: "auto", fontSize: "0.75rem", color: "var(--dash-muted, var(--muted-foreground))"}}>
                        {index + 1}/{steps.length}
                    </span>
                </div>

                <p style={{margin: "0 0 12px", fontSize: "0.875rem", lineHeight: 1.5, color: "var(--dash-text2, var(--popover-foreground))"}}>
                    {step.text}
                </p>

                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                    <Button type="button" variant="ghost" size="xs" onClick={finish}>
                        Пропустить
                    </Button>
                    <div style={{marginLeft: "auto", display: "flex", gap: 8}}>
                        {index > 0 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => goTo(index - 1)}>
                                Назад
                            </Button>
                        )}
                        <Button type="button" size="sm" onClick={() => goTo(index + 1)}>
                            {index === steps.length - 1 ? "Понятно" : "Дальше"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    )
}

/**
 * Плавающая кнопка «?» — вернуть подсказки после того, как их закрыли.
 *
 * Не прячется на время экскурсии намеренно: последний шаг подсвечивает именно её
 * (`data-tour="btn-hints"`), а шаг с отсутствующей целью HintTour молча пропускает —
 * при ручном перезапуске тур обрывался на шаг раньше. Прятать и не нужно: z-index
 * кнопки (900) ниже затемняющих панелей (10000), поэтому во время тура она видна
 * только тогда, когда сама является подсвеченной целью.
 */
export function HintTourLauncher({onClick}: { onClick: () => void }) {
    return (
        <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            onClick={onClick}
            title="Показать подсказки по кабинету"
            aria-label="Показать подсказки по кабинету"
            data-tour="btn-hints"
            className="fixed right-5 bottom-5"
            style={{zIndex: "var(--z-hint)"}}
        >
            <Icon name="help-circle"/>
        </Button>
    )
}
