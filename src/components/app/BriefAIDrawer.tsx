"use client"

import {useEffect, useState} from "react"
import {AiIcon} from "@/components/app/AiIcon"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Icon} from "@/components/ui/icon"

interface Suggestion {
    field: string | null
    tip: string
    reason: string
    example: string
}

const FIELD_LABELS: Record<string, string> = {
    objectType: "Тип объекта",
    area: "Площадь",
    address: "Адрес",
    style: "Стиль",
    materials: "Материалы и цвета",
    vision: "Образ и атмосфера",
    budget: "Бюджет",
    deadline: "Срок",
    rooms: "Помещения",
    notes: "Особые требования",
}

interface BriefAIDrawerProps {
    briefData: Record<string, string>
    onApply: (field: string, value: string) => void
}

export function BriefAIDrawer({briefData, onApply}: BriefAIDrawerProps) {
    const [open, setOpen] = useState(false)
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [applied, setApplied] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchSuggestions = async () => {
        setOpen(true)
        setLoading(true)
        setError(null)
        setSuggestions([])
        setApplied(new Set())
        try {
            const res = await fetch("/api/ai/brief-suggest", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({briefData}),
            })
            const json = await res.json()
            if (json.error) throw new Error(json.error)
            setSuggestions(json.suggestions ?? [])
        } catch {
            setError("Не удалось получить подсказки. Попробуйте позже.")
        } finally {
            setLoading(false)
        }
    }

    const close = () => setOpen(false)

    const apply = (idx: number, field: string | null, example: string) => {
        if (field) onApply(field, example)
        setApplied(prev => new Set(prev).add(idx))
    }

    // Закрытие по Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    return (
        <>
            {/* Кнопка-триггер */}
            <Button type="button" variant="outline" onClick={fetchSuggestions}>
                <AiIcon size="0.95em"/>
                Подсказки AI
            </Button>

            {/* Drawer root */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    overflow: "hidden",
                    pointerEvents: open ? "auto" : "none",
                    zIndex: 50,
                }}
            >
                {/* Backdrop */}
                <div
                    role="presentation"
                    onClick={close}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.25)",
                        opacity: open ? 1 : 0,
                        transition: "opacity 0.3s ease",
                    }}
                />

                {/* Панель */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: "min(400px, 92vw)",
                        background: "var(--popover)",
                        color: "var(--popover-foreground)",
                        display: "flex",
                        flexDirection: "column" as const,
                        transform: open ? "translateX(0)" : "translateX(100%)",
                        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                        boxShadow: "-8px 0 32px rgba(0,0,0,0.08)",
                    }}
                >
                    {/* Шапка */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "20px 24px",
                        borderBottom: "1px solid var(--border)",
                        flexShrink: 0,
                    }}>
                        <div style={{display: "flex", alignItems: "center", gap: 8}}>
                            <AiIcon size="1.05rem"/>
                            <span style={{color: "var(--foreground)", fontSize: "1rem", fontWeight: 600}}>
                AI-подсказки
              </span>
                            <Badge variant="secondary">только советы</Badge>
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label="Закрыть" onClick={close}>
                            <Icon name="x"/>
                        </Button>
                    </div>

                    {/* Контент */}
                    <div style={{flex: 1, overflowY: "auto", padding: "20px 24px"}}>

                        {/* Скелетон загрузки */}
                        {loading && (
                            <div style={{display: "flex", flexDirection: "column" as const, gap: 12}}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse" style={{
                                        background: "var(--card)",
                                        borderRadius: 10,
                                        padding: "16px 16px",
                                    }}>
                                        <div style={{
                                            background: "var(--muted)",
                                            borderRadius: 4,
                                            height: 9,
                                            width: "35%",
                                            marginBottom: 10
                                        }}/>
                                        <div style={{
                                            background: "var(--muted)",
                                            borderRadius: 4,
                                            height: 8,
                                            width: "80%",
                                            marginBottom: 8
                                        }}/>
                                        <div style={{
                                            background: "var(--muted)",
                                            borderRadius: 4,
                                            height: 8,
                                            width: "60%"
                                        }}/>
                                    </div>
                                ))}
                                <p style={{
                                    color: "var(--muted-foreground)",
                                    fontSize: "0.75rem",
                                    textAlign: "center",
                                    margin: "8px 0 0"
                                }}>
                                    Анализирую бриф…
                                </p>
                            </div>
                        )}

                        {/* Ошибка */}
                        {error && !loading && (
                            <div style={{
                                background: "color-mix(in oklab, var(--destructive) 8%, transparent)",
                                borderRadius: 10,
                                padding: "16px 16px",
                            }}>
                                <p style={{color: "var(--destructive)", fontSize: "0.875rem", margin: "0 0 8px"}}>{error}</p>
                                <Button type="button" variant="link" size="xs" onClick={fetchSuggestions}>
                                    Попробовать снова
                                </Button>
                            </div>
                        )}

                        {/* Карточки подсказок */}
                        {!loading && !error && suggestions.map((s, i) => {
                            const isApplied = applied.has(i)
                            const label = s.field ? FIELD_LABELS[s.field] : null
                            return (
                                <div
                                    key={i}
                                    style={{
                                        background: isApplied ? "color-mix(in oklab, var(--success) 8%, transparent)" : "var(--card)",
                                        borderRadius: 10,
                                        marginBottom: 12,
                                        opacity: isApplied ? 0.6 : 1,
                                        padding: "16px 16px",
                                        transition: "opacity 0.3s",
                                    }}
                                >
                                    {label && (
                                        <div style={{
                                            color: "var(--muted-foreground)",
                                            fontSize: "0.75rem",
                                            fontWeight: 700,
                                            marginBottom: 6,
                                        }}>
                                            {label}
                                        </div>
                                    )}
                                    <p style={{
                                        color: "var(--card-foreground)",
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        margin: "0 0 4px"
                                    }}>
                                        {s.tip}
                                    </p>
                                    <p style={{
                                        color: "var(--muted-foreground)",
                                        fontSize: "0.75rem",
                                        margin: "0 0 10px",
                                        lineHeight: 1.5
                                    }}>
                                        {s.reason}
                                    </p>
                                    <div style={{
                                        background: "var(--muted)",
                                        borderRadius: 8,
                                        marginBottom: 12,
                                        padding: "10px 14px",
                                    }}>
                                        <p style={{
                                            color: "var(--muted-foreground)",
                                            fontSize: "0.75rem",
                                            fontStyle: "italic",
                                            margin: 0,
                                            lineHeight: 1.5
                                        }}>
                                            «{s.example}»
                                        </p>
                                    </div>
                                    <div style={{display: "flex", justifyContent: "flex-end"}}>
                                        {isApplied ? (
                                            <span style={{color: "var(--success)", fontSize: "0.75rem", fontWeight: 500}}>✓ Применено</span>
                                        ) : s.field ? (
                                            <Button type="button" variant="secondary" size="xs"
                                                    onClick={() => apply(i, s.field, s.example)}>
                                                Применить →
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Подвал */}
                    {!loading && suggestions.length > 0 && (
                        <div style={{
                            borderTop: "1px solid var(--border)",
                            flexShrink: 0,
                            padding: "16px 24px",
                        }}>
                            <Button type="button" variant="outline" className="w-full" onClick={fetchSuggestions}>
                                ↺ Обновить подсказки
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
