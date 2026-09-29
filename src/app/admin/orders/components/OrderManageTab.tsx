"use client"

import type {Order, OrderStatus} from "../types"
import {ORDER_LABEL} from "../types"

export function OrderManageTab({
                                   order,
                                   statusTargets,
                                   onChangeStatus,
                               }: {
    order: Order
    statusTargets: OrderStatus[]
    onChangeStatus: (orderId: string, status: OrderStatus) => void
}) {
    return (
        <>
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
                                fontSize: "0.8rem",
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
                                fontSize: "0.8rem",
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
                                fontSize: "0.8rem",
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
                                fontSize: "0.8rem",
                                color: "var(--adm-muted)",
                                margin: "0 0 12px",
                                lineHeight: 1.45
                            }}>
                                «Активен» — в работу. «Бриф» — вернуть на доработку заказчику. Либо отмена.
                            </p>
                        )}
                        <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
                            {statusTargets.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => onChangeStatus(order.id, s)}
                                    className={`sp-btn ${s === "CANCELLED" ? "sp-btn-ghost" : "sp-btn-primary"}`}
                                    style={s === "CANCELLED" ? {
                                        borderColor: "rgba(239,68,68,0.45)",
                                        color: "#ef4444"
                                    } : undefined}
                                >
                                    {ORDER_LABEL[s]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
