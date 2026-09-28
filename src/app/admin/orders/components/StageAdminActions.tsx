"use client"

import type {Stage} from "../types"
import {STAGE_LABEL} from "../types"
import {Button} from "@/components/ui/button"

export function StageAdminActions({
                                      stage,
                                      acting,
                                      onReviewStage,
                                      onExtraPayment,
                                      onClientRevision,
                                  }: {
    stage: Stage
    acting: string | null
    onReviewStage: (stageId: string, action: "modApprove" | "modRevision", stageName: string) => void
    onExtraPayment: (stageId: string, stageName: string) => void
    onClientRevision?: (stageId: string, action: "accept" | "reject", stageName: string) => void
}) {
    const isMod = stage.status === "MOD_REVIEW"
    const isClientRevision = stage.status === "CLIENT_REVISION"

    if (isClientRevision) {
        return (
            <div style={{marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap"}}>
                <Button
                    type="button"
                    size="sm"
                    onClick={() => onClientRevision?.(stage.id, "accept", STAGE_LABEL[stage.type])}
                    disabled={acting !== null || !onClientRevision}
                >
                    Принять правки клиента
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => onClientRevision?.(stage.id, "reject", STAGE_LABEL[stage.type])}
                    disabled={acting !== null || !onClientRevision}
                >
                    Отклонить правки (с причиной)
                </Button>
            </div>
        )
    }

    if (!isMod) {
        // Explicit hint for admins: why there are no approve/reject buttons.
        // This reduces confusion when the stage is UPLOADED/CLIENT_REVIEW/etc.
        return (
            <div style={{marginTop: 8, fontSize: "0.75rem", color: "var(--adm-muted)"}}>
                Действия модератора (одобрить / вернуть на доработку) доступны только в статусе «MOD_REVIEW».
            </div>
        )
    }

    return (
        <div style={{marginTop: 8, display: "flex", gap: 6}}>
            <Button
                type="button"
                size="sm"
                onClick={() => onReviewStage(stage.id, "modApprove", STAGE_LABEL[stage.type])}
                disabled={acting !== null}
            >
                Одобрить
            </Button>
            <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => onReviewStage(stage.id, "modRevision", STAGE_LABEL[stage.type])}
                disabled={acting !== null}
            >
                Отклонить (с причиной)
            </Button>
            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onExtraPayment(stage.id, STAGE_LABEL[stage.type])}
            >
                Доп. оплата
            </Button>
        </div>
    )
}
