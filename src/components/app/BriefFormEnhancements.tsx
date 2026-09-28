// Компонент для визуализации индикаторов загрузки ИИ в полях брифа
import React from "react"
import {Button} from "@/components/ui/button"
import {Icon} from "@/components/ui/icon"

interface AILoadingIndicatorProps {
    isLoading: boolean
    fieldKey: string
    position?: "right" | "bottom"
}

/** Статичная точка статуса рядом с подписью (без зацикленной пульсации). */
const dot = (size: number, opacity: number): React.CSSProperties => ({
    display: "inline-block",
    width: size,
    height: size,
    borderRadius: "50%",
    background: "var(--primary)",
    opacity,
})

export function AILoadingIndicator({isLoading, fieldKey, position = "right"}: AILoadingIndicatorProps) {
    if (!isLoading) return null

    if (position === "bottom") {
        return (
            <div
                style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.75rem",
                    color: "var(--primary)",
                }}
            >
                <div style={dot(4, 0.7)}/>
                <div style={dot(4, 0.5)}/>
                <div style={dot(4, 0.3)}/>
                <span>ИИ анализирует…</span>
            </div>
        )
    }

    return (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginLeft: 8,
                padding: "4px 10px",
                background: "color-mix(in oklab, var(--primary) 10%, transparent)",
                borderRadius: 4,
                fontSize: "0.75rem",
                color: "var(--primary)",
            }}
        >
            <div style={dot(3, 0.8)}/>
            <span>Анализирую…</span>
        </div>
    )
}

// CSS для анимации пульса
export const pulseKeyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
`

// Компонент для отображения статуса применения подсказки
interface SuggestionStatusProps {
    isApplied: boolean
    isLoading?: boolean
}

export function SuggestionStatus({isApplied, isLoading}: SuggestionStatusProps) {
    if (isLoading) {
        return (
            <div
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "0.75rem",
                    color: "var(--primary)",
                }}
            >
                <div style={dot(3, 0.7)}/>
                Применение…
            </div>
        )
    }

    if (isApplied) {
        return (
            <span style={{color: "var(--success)", fontSize: "0.75rem", fontWeight: 600}}>
        ✓ Применено
      </span>
        )
    }

    return null
}

// Компонент для отображения ошибки ИИ
interface AIErrorProps {
    error: string | null
    onDismiss?: () => void
}

export function AIError({error, onDismiss}: AIErrorProps) {
    if (!error) return null

    return (
        <div
            style={{
                background: "color-mix(in oklab, var(--destructive) 10%, transparent)",
                borderRadius: 8,
                padding: "14px 16px",
                marginBottom: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "var(--destructive)",
                fontSize: "0.875rem",
            }}
        >
            <div style={{display: "flex", alignItems: "center", gap: 8}}>
                <Icon name="error-circle"/>
                <span>{error}</span>
            </div>
            {onDismiss && (
                <Button type="button" variant="ghost" size="icon-xs" aria-label="Закрыть" onClick={onDismiss}>
                    <Icon name="x"/>
                </Button>
            )}
        </div>
    )
}

// Компонент для отображения подсказки ИИ с анимацией
interface AnimatedSuggestionProps {
    suggestion: {
        field: string | null
        tip: string
        reason: string
        example: string
    }
    index: number
    isApplied: boolean
    onApply: () => void
    editable: boolean
    fieldLabel?: string | null
}

export function AnimatedSuggestion({
                                       suggestion,
                                       index,
                                       isApplied,
                                       onApply,
                                       editable,
                                       fieldLabel,
                                   }: AnimatedSuggestionProps) {
    const S = {
        suggestionCard: {
            background: "var(--secondary)",
            borderRadius: 10,
            padding: "16px 16px",
            marginBottom: 12,
            animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
        } as React.CSSProperties,
        appliedCard: {
            background: "color-mix(in oklab, var(--success) 8%, transparent)",
            borderRadius: 10,
            padding: "16px 16px",
            marginBottom: 12,
            opacity: 0.6,
            animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
        } as React.CSSProperties,
    }

    return (
        <div style={isApplied ? S.appliedCard : S.suggestionCard}>
            {fieldLabel && (
                <div style={{
                    color: "var(--primary)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    marginBottom: 6
                }}>
                    {fieldLabel}
                </div>
            )}
            <p style={{color: "var(--card-foreground)", fontSize: "0.875rem", fontWeight: 500, margin: "0 0 4px"}}>
                {suggestion.tip}
            </p>
            <p style={{color: "var(--muted-foreground)", fontSize: "0.75rem", margin: "0 0 10px"}}>
                {suggestion.reason}
            </p>
            <div style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16}}>
                <p style={{
                    color: "var(--muted-foreground)",
                    fontSize: "0.75rem",
                    fontStyle: "italic",
                    margin: 0,
                    flex: 1
                }}>
                    «{suggestion.example}»
                </p>
                {!isApplied && editable && suggestion.field && (
                    <Button type="button" variant="secondary" size="xs" className="shrink-0" onClick={onApply}>
                        Применить →
                    </Button>
                )}
                {isApplied && (
                    <span style={{color: "var(--success)", fontSize: "0.75rem", flexShrink: 0}}>
            ✓ Применено
          </span>
                )}
            </div>
        </div>
    )
}

// CSS для анимации слайда
export const slideInKeyframes = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
