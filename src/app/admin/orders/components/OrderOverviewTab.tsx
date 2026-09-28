"use client"

import {AdminBriefSummaryPanel} from "@/components/admin/AdminBriefSummaryPanel"
import {ContractPanel} from "@/components/admin/ContractPanel"
import type {Order} from "../types"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"

export function OrderOverviewTab({
                                     order,
                                     acting,
                                     onOpenBriefEditor,
                                     onBriefApprove,
                                     onBriefReject,
                                     onBriefSaved,
                                     onGenerateContract,
                                     onSendContractToClient,
                                     onConfirmContract,
                                 }: {
    order: Order
    acting: string | null
    onOpenBriefEditor: () => void
    onBriefApprove: (orderId: string) => void
    onBriefReject: (orderId: string) => void
    onBriefSaved?: () => void
    onGenerateContract: (orderId: string) => void
    onSendContractToClient: (orderId: string) => void
    onConfirmContract: (orderId: string) => void
}) {
    const bd = order.briefData
    const hasContract = order.contracts.length > 0

    return (
        <>
            {!hasContract && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "color-mix(in oklab, var(--bs-warning) 10%, transparent)",
                        color: "var(--bs-warning)",
                        borderRadius: 6,
                        padding: "8px 12px",
                        fontSize: "0.875rem",
                        marginBottom: 12,
                    }}
                >
                    <Icon name="error"/>
                    По этому заказу ещё нет договора со специалистом
                </div>
            )}

            <AdminBriefSummaryPanel
                orderId={order.id}
                briefData={bd}
                briefHelpRequested={order.briefHelpRequested}
                briefStep={order.briefStep}
                briefVideoFile={order.briefVideoFile ?? null}
                showWizardStep={order.status === "DRAFT"}
                onOpenFullEditor={onOpenBriefEditor}
            />

            {order.status === "BRIEF_REVIEW" && (
                <div className="sp-brief-actions">
                    <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 8}}>
                        <Icon name="file" style={{color: "var(--adm-active-color)", fontSize: "1.125rem"}}/>
                        <span style={{fontWeight: 500, fontSize: "0.875rem"}}>Бриф на проверке</span>
                    </div>
                    <div style={{display: "flex", gap: 8}}>
                        <Button type="button" size="sm" onClick={() => onBriefApprove(order.id)}
                                disabled={acting !== null}>
                            {acting === "brief-approve" ? "…" : "Одобрить бриф"}
                        </Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => onBriefReject(order.id)}
                                disabled={acting !== null}>
                            Вернуть бриф
                        </Button>
                    </div>
                </div>
            )}

            {order.status !== "DRAFT" && (
                <ContractPanel
                    contract={order.contracts?.[0] ?? null}
                    orderId={order.id}
                    canGenerate={true}
                    canSendToClient={true}
                    canConfirm={true}
                    onGenerate={() => onGenerateContract(order.id)}
                    onSendToClient={() => onSendContractToClient(order.id)}
                    onConfirm={() => onConfirmContract(order.id)}
                />
            )}

            {order.payments.length > 0 && (
                <div className="sp-card" style={{padding: "10px 12px", marginBottom: 16}}>
                    <div style={{
                        fontSize: "0.75rem",
                        color: "var(--adm-muted)",
                        marginBottom: 6
                    }}>
                        Платежи
                    </div>
                    <div style={{display: "flex", gap: 16, fontSize: "0.875rem"}}>
                        {[
                            {s: "HELD", l: "Удержано", c: "var(--adm-active-color)"},
                            {s: "RELEASED", l: "Выплачено", c: "var(--bs-success)"},
                            {s: "PENDING", l: "Ожидает", c: "var(--bs-warning)"},
                        ].map((p) => {
                            const sum = order.payments.filter((x) => x.status === p.s).reduce((a, x) => a + x.amount, 0)
                            return sum > 0 ? (
                                <div key={p.s}>
                                    <span style={{color: "var(--adm-muted)"}}>{p.l}: </span>
                                    <span style={{
                                        fontWeight: 600,
                                        color: p.c
                                    }}>{(sum / 100).toLocaleString("ru-RU")} руб.</span>
                                </div>
                            ) : null
                        })}
                    </div>
                </div>
            )}

            {/* keep prop for consistency; used by parent refresh */}
            {onBriefSaved ? null : null}
        </>
    )
}

