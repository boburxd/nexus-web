"use client"

import {StatusBadge} from "@/components/app/AppCard"
import {formatBriefWizardProgress} from "@/lib/clientBriefDisplay"
import type {Order} from "../types"
import {ORDER_LABEL, ORDER_VARIANT} from "../types"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"

export function OrderHeader({
                                order,
                                title,
                                acting,
                                onResolveHelp,
                                onOpenChat,
                                unreadChatCount,
                                chatOpen,
                            }: {
    order: Order
    title: string
    acting: string | null
    onResolveHelp: (orderId: string) => void
    onOpenChat: () => void
    unreadChatCount: number
    chatOpen: boolean
}) {
    return (
        <div style={{marginBottom: 20}}>
            <div style={{display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4}}>
                <h5 style={{fontWeight: 600, margin: 0}}>{title}</h5>
                <StatusBadge variant={ORDER_VARIANT[order.status]} label={ORDER_LABEL[order.status]}/>
                <span style={{flex: 1}}/>
                <Button
                    type="button"
                    size="sm"
                    onClick={onOpenChat}
                >
                    <Icon name="message-dots" aria-hidden/>
                    Чат
                    {!chatOpen && unreadChatCount > 0 && (
                        <span
                            title={`Непрочитанные: ${unreadChatCount}`}
                            style={{
                                minWidth: 18,
                                height: 18,
                                padding: "0 6px",
                                borderRadius: 10,
                                background: "var(--bs-danger)",
                                color: "#fff",
                                fontSize: "0.75rem",
                                fontWeight: 800,
                                lineHeight: "18px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {unreadChatCount > 99 ? "99+" : unreadChatCount}
                        </span>
                    )}
                </Button>
            </div>
            <small style={{color: "var(--adm-muted)"}}>
                <Icon name="user" style={{marginRight: 4}}/>
                {order.client.name ?? order.client.email}
                {" → "}
                <Icon name="brush" style={{marginRight: 4}}/>
                {order.specialist ? (
                    order.specialist.name ?? order.specialist.email
                ) : (
                    <span style={{color: "var(--bs-danger)"}}>не назначен</span>
                )}
                {" · "}
                {new Date(order.createdAt).toLocaleDateString("ru-RU")}
            </small>

            {order.status === "DRAFT" && (
                <div
                    style={{
                        marginTop: 10,
                        fontSize: "0.875rem",
                        color: "var(--adm-text)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                    }}
                >
          <span style={{display: "inline-flex", alignItems: "center", gap: 6}}>
            <Icon name="list-ul" style={{color: "var(--adm-active-color)"}}/>
            <strong>Заполнение брифа:</strong> {formatBriefWizardProgress(order.briefStep)}
          </span>
                    {order.briefHelpRequested && (
                        <span className="sp-badge sp-badge--danger" style={{fontSize: "0.75rem"}}>
              <Icon name="support" style={{marginRight: 4}}/>
              нужна помощь
            </span>
                    )}
                    {order.briefHelpRequested && (
                        <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => onResolveHelp(order.id)}
                            disabled={acting !== null}
                        >
                            <Icon name="check"/>
                            Закрыть запрос
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
