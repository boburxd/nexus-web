"use client"

import {toast} from "sonner"
import type {Stage} from "../types"
import {STAGE_LABEL} from "../types"
import {confirmDialog} from "@/lib/dialog-store"
import {Button} from "@/components/ui/button"

export function StageExtraPaymentActions({
                                             stage,
                                             acting,
                                             onExtraPayment,
                                         }: {
    stage: Stage
    acting: string | null
    onExtraPayment: (stageId: string, stageName: string) => void
}) {
    if (stage.status !== "EXTRA_PAYMENT") return null

    return (
        <div style={{marginTop: 8, display: "flex", gap: 6, alignItems: "center"}}>
            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onExtraPayment(stage.id, STAGE_LABEL[stage.type])}
                disabled={acting !== null}
            >
                Выставить счет
            </Button>
            <Button
                type="button"
                size="sm"
                onClick={async () => {
                    const ok = await confirmDialog({
                        title: "Разблокировать этап без оплаты? Специалист сможет продолжить работу.",
                        variant: "destructive",
                    })
                    if (!ok) return
                    const res = await fetch(`/api/admin/stages/${stage.id}/unlock`, {method: "POST"})
                    if (res.ok) window.location.reload()
                    else toast.error("Ошибка разблокировки")
                }}
                disabled={acting !== null}
            >
                Разблокировать вручную
            </Button>
        </div>
    )
}
