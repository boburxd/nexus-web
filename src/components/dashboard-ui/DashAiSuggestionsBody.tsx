"use client"

import {Button} from "@/components/ui/button"

export type DashAiSuggestion = {
    field: string | null
    tip: string
    reason: string
    example: string
}

export type AiApplyMode = "brief" | "message"

export function DashAiSuggestionsBody({
                                          loading,
                                          loadingHint,
                                          error,
                                          onRetry,
                                          suggestions,
                                          applied,
                                          fieldLabels,
                                          applyMode,
                                          onApplyExample,
                                          applyButtonLabel,
                                      }: {
    loading: boolean
    loadingHint?: string
    error: string | null
    onRetry: () => void
    suggestions: DashAiSuggestion[]
    applied: Set<number>
    fieldLabels?: Record<string, string>
    applyMode: AiApplyMode
    onApplyExample: (index: number, field: string | null, example: string) => void
    applyButtonLabel: string
}) {
    const showApplyButton = (s: DashAiSuggestion) => {
        if (!s.example.trim()) return false
        if (applyMode === "brief") return Boolean(s.field)
        return true
    }

    return (
        <>
            {loading && (
                <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            style={{
                                background: "var(--dash-surface2)",
                                borderRadius: 10,
                                padding: "1rem",
                                animation: "dash-ai-suggestions-pulse 1.4s ease-in-out infinite",
                            }}
                        >
                            <div style={{
                                background: "var(--dash-border)",
                                borderRadius: 4,
                                height: 8,
                                width: "32%",
                                marginBottom: 10
                            }}/>
                            <div style={{
                                background: "var(--dash-border)",
                                borderRadius: 4,
                                height: 7,
                                width: "88%",
                                marginBottom: 8,
                                opacity: 0.7
                            }}/>
                            <div style={{
                                background: "var(--dash-border)",
                                borderRadius: 4,
                                height: 7,
                                width: "55%",
                                opacity: 0.5
                            }}/>
                        </div>
                    ))}
                    <p style={{
                        color: "var(--dash-muted)",
                        fontSize: "0.75rem",
                        textAlign: "center",
                        margin: "0.25rem 0 0"
                    }}>
                        {loadingHint ?? "Загрузка…"}
                    </p>
                </div>
            )}

            {error && !loading && (
                <div
                    style={{
                        background: "var(--dash-danger-bg)",
                        borderRadius: 10,
                        padding: "1rem",
                    }}
                >
                    <p style={{color: "var(--dash-danger)", fontSize: "0.875rem", margin: "0 0 8px"}}>{error}</p>
                    <Button type="button" variant="link" size="xs" onClick={onRetry}>
                        Попробовать снова
                    </Button>
                </div>
            )}

            {!loading &&
                !error &&
                suggestions.map((s, i) => {
                    const isApplied = applied.has(i)
                    const label = s.field && fieldLabels ? fieldLabels[s.field] ?? s.field : null
                    return (
                        <div
                            key={i}
                            style={{
                                background: isApplied ? "var(--dash-success-bg)" : "var(--dash-surface2)",
                                ...(isApplied ? {border: "1px solid var(--dash-success)"} : {}),
                                borderRadius: 10,
                                marginBottom: "0.75rem",
                                opacity: isApplied ? 0.72 : 1,
                                padding: "16px 1rem",
                            }}
                        >
                            {label ? (
                                <div
                                    style={{
                                        color: "var(--dash-muted)",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        marginBottom: 4,
                                    }}
                                >
                                    {label}
                                </div>
                            ) : null}
                            <p style={{
                                color: "var(--dash-text)",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                margin: "0 0 4px",
                                lineHeight: 1.35
                            }}>
                                {s.tip}
                            </p>
                            <p style={{
                                color: "var(--dash-text2)",
                                fontSize: "0.75rem",
                                margin: "0 0 10px",
                                lineHeight: 1.5
                            }}>
                                {s.reason}
                            </p>
                            {s.example.trim() ? (
                                <div
                                    style={{
                                        background: "var(--dash-surface)",
                                        border: "1px solid var(--dash-border)",
                                        borderRadius: 8,
                                        marginBottom: "10px",
                                        padding: "8px 0.75rem",
                                    }}
                                >
                                    <p
                                        style={{
                                            color: "var(--dash-text2)",
                                            fontSize: "0.75rem",
                                            fontStyle: "italic",
                                            margin: 0,
                                            lineHeight: 1.5,
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {s.example}
                                    </p>
                                </div>
                            ) : null}
                            <div style={{display: "flex", justifyContent: "flex-end"}}>
                                {isApplied ? (
                                    <span style={{
                                        color: "var(--dash-success)",
                                        fontSize: "0.75rem",
                                        fontWeight: 600
                                    }}>
                    ✓ {applyMode === "message" ? "Вставлено" : "Применено"}
                  </span>
                                ) : showApplyButton(s) ? (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => onApplyExample(i, s.field, s.example)}
                                    >
                                        {applyButtonLabel}
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    )
                })}

            <style>{`
        @keyframes dash-ai-suggestions-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
        </>
    )
}
