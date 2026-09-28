"use client"

import {MAX_FREE_CLIENT_REVISIONS} from "@/lib/stage-constants"
import {confirmDialog} from "@/lib/dialog-store"
import type {OrderStage} from "../types"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"
import {Textarea} from "@/components/ui/textarea"

export function StageClientActionsSection({
                                              stage,
                                              acting,
                                              showRevision,
                                              setShowRevision,
                                              comment,
                                              setComment,
                                              onApprove,
                                              onRevision,
                                              onOpenRevisionChat,
                                              revisionViaChatOnly,
                                          }: {
    stage: OrderStage
    acting: boolean
    showRevision: boolean
    setShowRevision: (v: boolean) => void
    comment: string
    setComment: (v: string) => void
    onApprove: () => void
    onRevision: () => void
    onOpenRevisionChat?: () => void
    revisionViaChatOnly?: boolean
}) {
    const isClientReview = stage.status === "CLIENT_REVIEW"
    if (!isClientReview) return null

    return (
        <div style={{marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--dash-border)"}}>
            {!showRevision ? (
                <div style={{display: "flex", gap: "0.75rem"}}>
                    <Button type="button" size="lg" onClick={onApprove} disabled={acting}>
                        {acting ? "…" : "✓ Принять этап"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={async () => {
                            if (stage.clientRound >= MAX_FREE_CLIENT_REVISIONS - 1) {
                                const ok = await confirmDialog({
                                    title: "Это последний бесплатный раунд правок",
                                    description: "После него потребуется доплата. Продолжить?",
                                    variant: "warning",
                                })
                                if (!ok) return
                            }
                            onOpenRevisionChat?.()
                            setShowRevision(true)
                        }}
                        disabled={acting}
                    >
                        На доработку
                    </Button>
                </div>
            ) : revisionViaChatOnly ? (
                <div>
                    <p style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--dash-text)",
                        marginBottom: "0.5rem"
                    }}>
                        Что нужно доработать?
                    </p>
                    <p style={{
                        fontSize: "0.75rem",
                        color: "var(--dash-muted)",
                        margin: "0 0 0.75rem",
                        lineHeight: 1.45
                    }}>
                        Опишите замечания в чате, дизайнер получит уведомление. Когда закончите, отправьте этап на
                        доработку.
                    </p>
                    <Button type="button" variant="secondary" size="lg" onClick={() => onOpenRevisionChat?.()}>
                        <Icon name="message-dots" aria-hidden/>
                        Открыть чат
                    </Button>
                    <div style={{display: "flex", gap: "0.5rem", marginTop: "0.875rem", flexWrap: "wrap"}}>
                        <Button type="button" size="lg" onClick={onRevision} disabled={acting}>
                            {acting ? "…" : "Отправить на доработку"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="lg"
                            onClick={() => {
                                setShowRevision(false)
                                setComment("")
                            }}
                        >
                            Отмена
                        </Button>
                    </div>
                </div>
            ) : (
                <div>
                    <p style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--dash-text)",
                        marginBottom: "0.5rem"
                    }}>
                        Что нужно доработать?
                    </p>
                    <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Опишите замечания…"
                        rows={3}
                        className="mb-3"
                    />
                    <div style={{display: "flex", gap: "0.5rem"}}>
                        <Button type="button" size="lg" onClick={onRevision} disabled={acting}>
                            {acting ? "…" : "Отправить замечания"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="lg"
                            onClick={() => {
                                setShowRevision(false)
                                setComment("")
                            }}
                        >
                            Отмена
                        </Button>
                    </div>
                </div>
            )}
            {stage.clientRound >= MAX_FREE_CLIENT_REVISIONS - 1 && (
                <p style={{fontSize: "0.75rem", color: "var(--dash-danger)", marginTop: "0.5rem", marginBottom: 0}}>
                    <Icon name="error-circle" aria-hidden/> Последний бесплатный раунд правок.
                </p>
            )}
        </div>
    )
}

