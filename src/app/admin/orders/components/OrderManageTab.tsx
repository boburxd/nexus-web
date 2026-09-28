"use client"

import type {Order, OrderStatus, SpecialistForAssignment} from "../types"
import {ORDER_LABEL} from "../types"
import {SpecialistPicker} from "./SpecialistPicker"
import {Button} from "@/components/ui/button"

export function OrderManageTab({
                                   order,
                                   specialists,
                                   specialistAvatarUrls,
                                   assignMap,
                                   assigning,
                                   needsAssign,
                                   statusTargets,
                                   onAssignMapChange,
                                   onAssign,
                                   onChangeStatus,
                               }: {
    order: Order
    specialists: SpecialistForAssignment[]
    specialistAvatarUrls: Record<string, string>
    assignMap: Record<string, string>
    assigning: string | null
    needsAssign: boolean
    statusTargets: OrderStatus[]
    onAssignMapChange: (orderId: string, specId: string) => void
    onAssign: (orderId: string) => void
    onChangeStatus: (orderId: string, status: OrderStatus) => void
}) {
    return (
        <>
            {needsAssign && order.status !== "DRAFT" && (
                <div className="sp-card" style={{marginTop: 12}}>
                    <div className="sp-card-hd">
                        <span className="sp-label">Назначить специалиста</span>
                    </div>
                    <div className="sp-card-bd">
                        <div style={{display: "flex", gap: 8}}>
                            <SpecialistPicker
                                specialists={specialists}
                                avatarUrls={specialistAvatarUrls}
                                value={assignMap[order.id] ?? ""}
                                onChange={(specId) => onAssignMapChange(order.id, specId)}
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => onAssign(order.id)}
                                disabled={!assignMap[order.id] || assigning === order.id}
                            >
                                {assigning === order.id ? "…" : "Назначить"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {statusTargets.length > 0 && (
                <div className="sp-card" style={{marginTop: 12}}>
                    <div className="sp-card-hd">
            <span className="sp-label">
              {order.status === "DRAFT" ? "Черновик" : order.status === "ACTIVE" ? "Завершение или отмена" : "Управление статусом"}
            </span>
                    </div>
                    <div className="sp-card-bd">
                        {order.status === "DRAFT" && (
                            <p style={{
                                fontSize: "0.75rem",
                                color: "var(--adm-muted)",
                                margin: "0 0 12px",
                                lineHeight: 1.45
                            }}>
                                После отправки брифа клиентом заказ сам перейдет в «Бриф». Здесь можно только отменить
                                незавершенный черновик.
                            </p>
                        )}
                        {order.status === "ACTIVE" && (
                            <p style={{
                                fontSize: "0.75rem",
                                color: "var(--adm-muted)",
                                margin: "0 0 12px",
                                lineHeight: 1.45
                            }}>
                                Отметьте проект завершенным или отмените заказ. Вернуть в черновик из этой панели нельзя
                                — только через отдельные действия в процессе.
                            </p>
                        )}
                        {order.status === "BRIEFING" && (
                            <p style={{
                                fontSize: "0.75rem",
                                color: "var(--adm-muted)",
                                margin: "0 0 12px",
                                lineHeight: 1.45
                            }}>
                                Отправьте бриф на проверку или отмените заказ. Принятие брифа и перевод в работу —
                                блоком «Бриф на проверке», когда статус станет «Проверка брифа».
                            </p>
                        )}
                        {order.status === "BRIEF_REVIEW" && (
                            <p style={{
                                fontSize: "0.75rem",
                                color: "var(--adm-muted)",
                                margin: "0 0 12px",
                                lineHeight: 1.45
                            }}>
                                «Активен» — в работу. «Бриф» — вернуть на доработку заказчику. Либо отмена.
                            </p>
                        )}
                        <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
                            {statusTargets.map((s) => (
                                <Button
                                    key={s}
                                    type="button"
                                    size="sm"
                                    variant={s === "CANCELLED" ? "destructive" : "default"}
                                    onClick={() => onChangeStatus(order.id, s)}
                                >
                                    {ORDER_LABEL[s]}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

