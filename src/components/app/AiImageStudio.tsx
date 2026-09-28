"use client"

import React, {useCallback, useEffect, useRef, useState} from "react"
import {createPortal} from "react-dom"
import {AiIcon} from "@/components/app/AiIcon"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"
import {Textarea} from "@/components/ui/textarea"
import {stripBx} from "@/lib/icon-map"

export type AiImageStudioSource = {
    /** Исходник как data-url (аватар — свежий кадр из кроппера). */
    dataUrl?: string
    /** Либо id уже загруженного UserFile — тогда картинку читает сервер. */
    fileId?: string
    /** Что показывать в превью до первой генерации. */
    previewUrl: string
}

export type AiImageResult = { dataUrl: string; mimeType: string }

type Turn = { id: string; prompt: string; dataUrl: string; mimeType: string }

type Props = {
    open: boolean
    source: AiImageStudioSource
    /** Подмешивает на сервере правила кадра (квадрат для аватара). */
    context?: "avatar"
    title?: string
    /** Подпись кнопки применения. */
    applyLabel?: string
    /** Родитель сам грузит результат — пока промис не разрешится, показываем «Сохраняем…». */
    onApply: (result: AiImageResult) => void | Promise<void>
    onClose: () => void
}

const SUGGESTIONS = [
    "Сделай официальный деловой портрет: строгая одежда, светло-серый фон, мягкий студийный свет",
    "Нарисуй в стиле тёплой акварельной анимации: мягкие линии, природный свет, спокойный светлый фон",
    "Футуристичный портрет: минималистичный тёмный фон, тонкие сине-фиолетовые световые акценты",
    "Замени фон на ровный светлый студийный, остальное не трогай",
    "Выровняй свет и цвет кожи, убери лишние тени",
]

const MAX_PROMPT = 600

export default function AiImageStudio({open, source, context, title, applyLabel, onApply, onClose}: Props) {
    const [mounted, setMounted] = useState(false)
    const [turns, setTurns] = useState<Turn[]>([])
    const [activeId, setActiveId] = useState<string>("original")
    const [prompt, setPrompt] = useState("")
    const [loading, setLoading] = useState(false)
    const [applying, setApplying] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [notice, setNotice] = useState<string | null>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const stripRef = useRef<HTMLDivElement>(null)

    useEffect(() => setMounted(true), [])

    // Новый исходник — новый диалог.
    useEffect(() => {
        if (!open) return
        setTurns([])
        setActiveId("original")
        setPrompt("")
        setError(null)
        setNotice(null)
        const t = window.setTimeout(() => inputRef.current?.focus(), 60)
        return () => window.clearTimeout(t)
    }, [open, source.dataUrl, source.fileId])

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !loading && !applying) onClose()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open, loading, applying, onClose])

    const activeTurn = turns.find((t) => t.id === activeId) ?? null
    const activePreview = activeTurn?.dataUrl ?? source.previewUrl

    const generate = useCallback(async (rawPrompt: string) => {
        const text = rawPrompt.replace(/\s+/g, " ").trim()
        if (!text || loading) return
        if (text.length > MAX_PROMPT) {
            setError(`Запрос длиннее ${MAX_PROMPT} символов`)
            return
        }
        setLoading(true)
        setError(null)
        try {
            // Правим то, что сейчас на экране: цепочка правок, а не всегда исходник.
            const body: Record<string, unknown> = {prompt: text, context}
            if (activeTurn) body.image = activeTurn.dataUrl
            else if (source.dataUrl) body.image = source.dataUrl
            else if (source.fileId) body.fileId = source.fileId
            else throw new Error("Нет исходного изображения")

            const res = await fetch("/api/ai/image-edit", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            })
            const data = await res.json().catch(() => ({})) as {
                image?: AiImageResult
                error?: string
                sourceImageUsed?: boolean
            }
            if (!res.ok) throw new Error(data.error ?? "Не удалось обработать изображение")
            if (!data.image?.dataUrl) throw new Error("Модель не вернула изображение")

            const turn: Turn = {
                id: `${Date.now()}-${turns.length}`,
                prompt: text,
                dataUrl: data.image.dataUrl,
                mimeType: data.image.mimeType || "image/jpeg",
            }
            setTurns((prev) => [...prev, turn])
            setActiveId(turn.id)
            setPrompt("")
            setNotice(data.sourceImageUsed === false
                ? "Текущий AI-провайдер рисует картинку с нуля по описанию и не использует исходное фото."
                : null)
        } catch (e) {
            setError(e instanceof Error ? e.message : "Не удалось обработать изображение")
        } finally {
            setLoading(false)
        }
    }, [activeTurn, context, loading, source.dataUrl, source.fileId, turns.length])

    // Новый результат — прокручиваем ленту к нему.
    useEffect(() => {
        if (turns.length === 0) return
        stripRef.current?.scrollTo({left: stripRef.current.scrollWidth, behavior: "smooth"})
    }, [turns.length])

    const handleApply = async () => {
        if (!activeTurn || applying) return
        setApplying(true)
        try {
            await onApply({dataUrl: activeTurn.dataUrl, mimeType: activeTurn.mimeType})
        } catch (e) {
            setError(e instanceof Error ? e.message : "Не удалось сохранить изображение")
        } finally {
            setApplying(false)
        }
    }

    if (!mounted || !open) return null

    const busy = loading || applying

    return createPortal(
        <div className="ai-studio__backdrop" role="presentation" onClick={() => !busy && onClose()}>
            <AiImageStudioStyles/>
            <div className="ai-studio" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <header className="ai-studio__hd">
                    <div className="ai-studio__hd-title">
                        <AiIcon/>
                        <span>{title ?? "Редактор фото с ИИ"}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} disabled={busy}
                            aria-label="Закрыть">
                        <Icon name="x"/>
                    </Button>
                </header>

                <div className="ai-studio__stage">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activePreview} alt="" className="ai-studio__stage-img"/>
                    {loading && (
                        <div className="ai-studio__stage-veil">
                            <Icon name="loader-alt" className="bx-spin"/>
                            <span>Генерируем…</span>
                            <small>Это занимает до полуминуты</small>
                        </div>
                    )}
                </div>

                <div className="ai-studio__strip" ref={stripRef}>
                    <Button type="button" variant={activeId === "original" ? "secondary" : "ghost"}
                            aria-pressed={activeId === "original"}
                            className="ai-studio__thumb h-auto w-16 shrink-0 flex-col gap-0 overflow-hidden p-0"
                            onClick={() => setActiveId("original")} disabled={busy} title="Исходное фото">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={source.previewUrl} alt=""/>
                        <span>Оригинал</span>
                    </Button>
                    {turns.map((turn, i) => (
                        <Button key={turn.id} type="button" variant={activeId === turn.id ? "secondary" : "ghost"}
                                aria-pressed={activeId === turn.id}
                                className="ai-studio__thumb h-auto w-16 shrink-0 flex-col gap-0 overflow-hidden p-0"
                                onClick={() => setActiveId(turn.id)} disabled={busy} title={turn.prompt}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={turn.dataUrl} alt=""/>
                            <span>Шаг {i + 1}</span>
                        </Button>
                    ))}
                </div>

                {activeTurn && <p className="ai-studio__echo" title={activeTurn.prompt}>«{activeTurn.prompt}»</p>}

                {notice && <div className="ai-studio__notice"><Icon name="info-circle"/>{notice}</div>}
                {error && <div className="ai-studio__error"><Icon name="error-circle"/>{error}</div>}

                <div className="ai-studio__suggest">
                    {SUGGESTIONS.map((s) => (
                        <Button key={s} type="button" variant="secondary" size="xs" className="shrink-0"
                                disabled={busy} onClick={() => void generate(s)} title={s}>
                            {s.split(":")[0].split(",")[0]}
                        </Button>
                    ))}
                </div>

                <form
                    className="ai-studio__composer"
                    onSubmit={(e) => {
                        e.preventDefault()
                        void generate(prompt)
                    }}
                >
                    <Textarea
                        ref={inputRef}
                        value={prompt}
                        maxLength={MAX_PROMPT}
                        rows={2}
                        disabled={busy}
                        placeholder={activeTurn
                            ? "Что поправить в этом варианте? Например: «сделай фон темнее»"
                            : "Опишите, что сделать с фото. Например: «деловой портрет на светлом фоне»"}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                e.preventDefault()
                                void generate(prompt)
                            }
                        }}
                    />
                    <Button type="submit" variant="secondary" size="sm" className="self-start"
                            disabled={busy || prompt.trim().length === 0}>
                        <Icon name={stripBx(loading ? "bx-loader-alt bx-spin" : "bx-send")}/>
                        <span>{loading ? "Генерируем…" : "Применить запрос"}</span>
                    </Button>
                </form>

                <footer className="ai-studio__ft">
                    <span className="ai-studio__hint">
                        {activeTurn ? "Выбран результат ИИ" : "Выберите или создайте вариант"}
                    </span>
                    <div className="ai-studio__ft-actions">
                        <Button type="button" variant="outline" className="ai-studio__ft-btn" onClick={onClose}
                                disabled={busy}>
                            Отмена
                        </Button>
                        <Button type="button" className="ai-studio__ft-btn" onClick={() => void handleApply()}
                                disabled={busy || !activeTurn}>
                            <Icon name={stripBx(applying ? "bx-loader-alt bx-spin" : "bx-check")}/>
                            {applying ? "Сохраняем…" : (applyLabel ?? "Применить")}
                        </Button>
                    </div>
                </footer>
            </div>
        </div>,
        document.body,
    )
}

function AiImageStudioStyles() {
    return (
        <style>{`
      .ai-studio__backdrop {
        position: fixed; inset: 0; z-index: var(--z-studio);
        background: rgba(12,13,20,0.72);
        display: flex; align-items: center; justify-content: center; padding: 16px;
      }
      .ai-studio {
        width: min(560px, 100%); max-height: min(92vh, 880px);
        display: flex; flex-direction: column; gap: 10px;
        padding: 14px 16px 16px;
        border-radius: 14px; overflow-y: auto;
        background: var(--dash-surface, var(--card));
        color: var(--dash-text, var(--card-foreground));
        box-shadow: var(--dash-shadow-md, 0 24px 60px rgba(0,0,0,0.45));
      }
      .ai-studio__hd { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .ai-studio__hd-title { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 1rem; }
      .ai-studio__hd-title svg { color: var(--dash-accent, var(--primary)); width: 1.1rem; height: 1.1rem; }

      .ai-studio__stage {
        position: relative; border-radius: 10px; overflow: hidden;
        background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;
        min-height: 200px; max-height: 42vh;
      }
      .ai-studio__stage-img { max-width: 100%; max-height: 42vh; object-fit: contain; display: block; }
      .ai-studio__stage-veil {
        position: absolute; inset: 0; display: flex; flex-direction: column; gap: 4px;
        align-items: center; justify-content: center; background: rgba(10,10,16,0.72); text-align: center;
      }
      .ai-studio__stage-veil i { font-size: 1.5rem; color: var(--dash-accent, var(--primary)); }
      .ai-studio__stage-veil span { font-size: 0.875rem; font-weight: 500; }
      .ai-studio__stage-veil small { font-size: 0.75rem; color: var(--dash-muted, var(--muted-foreground)); }

      .ai-studio__strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
      .ai-studio__thumb img { width: 100%; height: 60px; object-fit: cover; display: block; }
      .ai-studio__thumb span {
        display: block; width: 100%; font-size: 0.75rem; padding: 2px; text-align: center;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .ai-studio__echo {
        margin: 0; font-size: 0.75rem; color: var(--dash-muted, var(--muted-foreground)); font-style: italic;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }

      .ai-studio__notice, .ai-studio__error {
        display: flex; align-items: flex-start; gap: 6px;
        padding: 8px 10px; border-radius: 8px; font-size: 0.75rem; line-height: 1.45;
      }
      .ai-studio__notice { background: var(--dash-warn-bg, color-mix(in oklab, var(--warning) 14%, transparent)); color: var(--dash-warn, var(--warning)); }
      .ai-studio__error { background: var(--dash-danger-bg, color-mix(in oklab, var(--destructive) 14%, transparent)); color: var(--dash-danger, var(--destructive)); }

      .ai-studio__suggest { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }

      .ai-studio__composer { display: flex; flex-direction: column; gap: 8px; }

      .ai-studio__ft {
        display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;
        border-top: 1px solid var(--dash-border, var(--border)); padding-top: 10px;
      }
      .ai-studio__hint { font-size: 0.75rem; color: var(--dash-muted, var(--muted-foreground)); }
      .ai-studio__ft-actions { display: flex; gap: 8px; margin-left: auto; }

      @media (max-width: 480px) {
        .ai-studio { padding: 12px; border-radius: 14px; }
        .ai-studio__ft-actions { width: 100%; }
        .ai-studio__ft-btn { flex: 1 1 0; }
      }
    `}</style>
    )
}
