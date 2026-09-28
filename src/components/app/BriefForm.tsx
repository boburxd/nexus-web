"use client"

import {useState} from "react"
import {AiIcon} from "@/components/app/AiIcon"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Icon} from "@/components/ui/icon"
import {Input} from "@/components/ui/input"

// ─── Типы ────────────────────────────────────────────────────────────────────

interface Suggestion {
    field: string | null
    tip: string
    reason: string
    example: string
}

interface BriefFormProps {
    orderId: string
    initialData: Record<string, string>
    editable?: boolean
}

// ─── Поля брифа ──────────────────────────────────────────────────────────────

const BRIEF_FIELDS = [
    {key: "area", label: "Площадь", placeholder: "Например: 65 м²", hint: "Общая площадь помещения"},
    {key: "style", label: "Стиль", placeholder: "Скандинавский, лофт, классика…", hint: "Желаемый стиль интерьера"},
    {key: "budget", label: "Бюджет", placeholder: "Например: 500 000 – 800 000 руб.", hint: "Общий бюджет на проект"},
    {key: "rooms", label: "Помещения", placeholder: "Гостиная, спальня, кухня…", hint: "Перечислите все комнаты"},
    {key: "deadline", label: "Срок", placeholder: "Например: 3 месяца", hint: "Желаемый срок выполнения"},
    {key: "address", label: "Адрес", placeholder: "Город, район или полный адрес", hint: "Для выезда дизайнера"},
    {key: "notes", label: "Особые требования", placeholder: "Дети, животные, аллергии…", hint: "Любые важные детали"},
]

// ─── Стили ────────────────────────────────────────────────────────────────────

const S = {
    card: {
        background: "var(--card)",
        borderRadius: 14,
        padding: "1.5rem",
        marginBottom: "1rem",
    } as React.CSSProperties,

    label: {
        display: "block",
        color: "var(--muted-foreground)",
        fontSize: "0.75rem",
        fontWeight: 600,
        marginBottom: 6,
    } as React.CSSProperties,

    hint: {
        color: "var(--muted-foreground)",
        fontSize: "0.75rem",
        marginTop: 4,
    } as React.CSSProperties,

    suggestionCard: {
        background: "var(--secondary)",
        borderRadius: 10,
        padding: "16px 16px",
        marginBottom: 12,
    } as React.CSSProperties,

    appliedCard: {
        background: "color-mix(in oklab, var(--success) 8%, transparent)",
        borderRadius: 10,
        padding: "16px 16px",
        marginBottom: 12,
        opacity: 0.6,
    } as React.CSSProperties,
}

// ─── Компонент ───────────────────────────────────────────────────────────────

export function BriefForm({orderId, initialData, editable = true}: BriefFormProps) {
    const [data, setData] = useState<Record<string, string>>(initialData)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [applied, setApplied] = useState<Set<number>>(new Set())
    const [loadingAI, setLoadingAI] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)
    const [showAI, setShowAI] = useState(false)

    const handleChange = (key: string, value: string) => {
        setData(prev => ({...prev, [key]: value}))
        setSaved(false)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await fetch(`/api/orders/${orderId}/brief`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            })
            setSaved(true)
        } finally {
            setSaving(false)
        }
    }

    const handleAI = async () => {
        setLoadingAI(true)
        setAiError(null)
        setSuggestions([])
        setApplied(new Set())
        setShowAI(true)

        try {
            const res = await fetch("/api/ai/brief-suggest", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({briefData: data}),
            })
            const json = await res.json()
            if (json.error) throw new Error(json.error)
            setSuggestions(json.suggestions ?? [])
        } catch {
            setAiError("Не удалось получить подсказки. Попробуйте позже.")
        } finally {
            setLoadingAI(false)
        }
    }

    const applySuggestion = (idx: number, field: string | null, example: string) => {
        if (field && editable) handleChange(field, example)
        setApplied(prev => new Set(prev).add(idx))
    }

    const fieldLabel = (key: string | null) =>
        BRIEF_FIELDS.find(f => f.key === key)?.label ?? null

    return (
        <div>
            {/* ── Заголовок ── */}
            <div style={{marginBottom: 24}}>
                <h2 style={{color: "var(--foreground)", fontSize: "1.125rem", fontWeight: 500, margin: 0}}>
                    Бриф проекта
                </h2>
                <p style={{color: "var(--muted-foreground)", fontSize: "0.875rem", marginTop: 4}}>
                    {editable
                        ? "Заполните детали: чем точнее бриф, тем лучше результат"
                        : "Бриф передан дизайнеру"}
                </p>
            </div>

            {/* ── Поля ── */}
            <div style={S.card}>
                {BRIEF_FIELDS.map(({key, label, placeholder, hint}) => (
                    <div key={key} style={{marginBottom: 20}}>
                        <label style={S.label}>{label}</label>
                        <Input
                            value={data[key] ?? ""}
                            onChange={e => handleChange(key, e.target.value)}
                            disabled={!editable}
                            placeholder={placeholder}
                        />
                        <p style={S.hint}>{hint}</p>
                    </div>
                ))}
            </div>

            {/* ── Кнопки действий ── */}
            {editable && (
                <div style={{display: "flex", gap: 12, marginBottom: 24}}>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Сохранение…" : saved ? "Сохранено ✓" : "Сохранить"}
                    </Button>

                    <Button variant="outline" onClick={handleAI} disabled={loadingAI}>
                        <AiIcon/>
                        {loadingAI ? "Анализирую…" : "Подсказки AI"}
                    </Button>
                </div>
            )}

            {/* ── AI-подсказки ── */}
            {showAI && (
                <div>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 14
                    }}>
                        <div style={{display: "flex", alignItems: "center", gap: 8}}>
                            <AiIcon size="1rem"/>
                            <span style={{
                                color: "var(--muted-foreground)",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                            }}>
                AI-предложения
              </span>
                            <Badge variant="secondary">только подсказки</Badge>
                        </div>
                        <Button variant="ghost" size="icon-sm" aria-label="Закрыть" onClick={() => setShowAI(false)}>
                            <Icon name="x"/>
                        </Button>
                    </div>

                    {loadingAI && (
                        <div style={{...S.card, textAlign: "center", padding: "2rem"}}>
                            <div style={{color: "var(--muted-foreground)", fontSize: "0.875rem"}}>
                                Анализирую бриф…
                            </div>
                        </div>
                    )}

                    {aiError && (
                        <div style={{
                            ...S.card,
                            background: "color-mix(in oklab, var(--destructive) 8%, transparent)"
                        }}>
                            <p style={{color: "var(--destructive)", fontSize: "0.875rem", margin: 0}}>{aiError}</p>
                        </div>
                    )}

                    {suggestions.map((s, i) => {
                        const isApplied = applied.has(i)
                        const label = fieldLabel(s.field)

                        return (
                            <div key={i} style={isApplied ? S.appliedCard : S.suggestionCard}>
                                {label && (
                                    <div style={{
                                        color: "var(--primary)",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        marginBottom: 6
                                    }}>
                                        {label}
                                    </div>
                                )}
                                <p style={{
                                    color: "var(--card-foreground)",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    margin: "0 0 4px"
                                }}>
                                    {s.tip}
                                </p>
                                <p style={{color: "var(--muted-foreground)", fontSize: "0.75rem", margin: "0 0 10px"}}>
                                    {s.reason}
                                </p>
                                <div style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    gap: 16
                                }}>
                                    <p style={{
                                        color: "var(--muted-foreground)",
                                        fontSize: "0.75rem",
                                        fontStyle: "italic",
                                        margin: 0,
                                        flex: 1
                                    }}>
                                        «{s.example}»
                                    </p>
                                    {!isApplied && editable && s.field && (
                                        <Button variant="secondary" size="xs" className="shrink-0"
                                                onClick={() => applySuggestion(i, s.field, s.example)}>
                                            Применить →
                                        </Button>
                                    )}
                                    {isApplied && (
                                        <span
                                            style={{color: "var(--success)", fontSize: "0.75rem", flexShrink: 0}}>✓ Применено</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
