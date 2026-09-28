"use client"

import {useCallback, useState} from "react"
import {DashRightDrawer} from "./DashRightDrawer"
import {type DashAiSuggestion, DashAiSuggestionsBody} from "./DashAiSuggestionsBody"
import {AiIcon} from "@/components/app/AiIcon"
import {Button} from "@/components/ui/button"

export function StageChatAiAssist({
                                      orderId,
                                      stageId,
                                      draft,
                                      onInsert,
                                  }: {
    orderId: string
    stageId: string
    draft: string
    onInsert: (text: string) => void
}) {
    const [open, setOpen] = useState(false)
    const [suggestions, setSuggestions] = useState<DashAiSuggestion[]>([])
    const [applied, setApplied] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchSuggestions = useCallback(async () => {
        setOpen(true)
        setLoading(true)
        setError(null)
        setSuggestions([])
        setApplied(new Set())
        try {
            const res = await fetch("/api/ai/stage-chat-suggest", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({orderId, stageId, draft}),
            })
            let json: { error?: string; suggestions?: DashAiSuggestion[] } = {}
            try {
                json = (await res.json()) as { error?: string; suggestions?: DashAiSuggestion[] }
            } catch {
                throw new Error("Ошибка ответа сервера")
            }
            if (!res.ok) throw new Error(json.error || `Ошибка ${res.status}`)
            if (json.error) throw new Error(json.error)
            setSuggestions(json.suggestions ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось получить подсказки. Попробуйте позже.")
        } finally {
            setLoading(false)
        }
    }, [orderId, stageId, draft])

    const close = () => setOpen(false)

    const apply = useCallback(
        (idx: number, _field: string | null, example: string) => {
            const t = example.trim()
            if (!t) return
            onInsert(t)
            setApplied(prev => new Set(prev).add(idx))
        },
        [onInsert],
    )

    return (
        <>
            <Button type="button" variant="outline" size="sm" className="shrink-0"
                    onClick={() => void fetchSuggestions()}>
                <AiIcon/>
                ИИ для текста
            </Button>

            <DashRightDrawer
                open={open}
                onClose={close}
                title="ИИ для сообщения"
                titleIcon={<AiIcon/>}
                badge={
                    <span
                        style={{
                            background: "var(--dash-surface)",
                            borderRadius: 10,
                            color: "var(--dash-muted)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "2px 6px",
                        }}
                    >
            черновик
          </span>
                }
                zIndex={12100}
                panelWidth="min(400px, 94vw)"
                lockBodyWhenOpen={false}
                ariaLabelledBy="stage-chat-ai-drawer-title"
                footer={
                    !loading && suggestions.length > 0 ? (
                        <div
                            style={{
                                borderTop: "1px solid var(--dash-border)",
                                padding: "14px 1.25rem",
                                background: "var(--dash-surface2)",
                            }}
                        >
                            <Button type="button" variant="outline" size="sm" className="w-full"
                                    onClick={() => void fetchSuggestions()}>
                                ↻ Обновить варианты
                            </Button>
                        </div>
                    ) : undefined
                }
            >
                <DashAiSuggestionsBody
                    loading={loading}
                    loadingHint="Подбираем формулировки…"
                    error={error}
                    onRetry={() => void fetchSuggestions()}
                    suggestions={suggestions}
                    applied={applied}
                    applyMode="message"
                    onApplyExample={apply}
                    applyButtonLabel="Вставить в сообщение"
                />
            </DashRightDrawer>
        </>
    )
}
