"use client"

import Link from "next/link"
import {adminClientHref, adminOrderHref, adminSpecialistHref} from "@/lib/admin-routes"
import type {Order} from "../types"

export function OrderInfoCards({order}: { order: Order }) {
    return (
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16}}>
            <div className="sp-card" style={{padding: "10px 12px"}}>
                <div style={{
                    fontSize: "0.75rem",
                    color: "var(--adm-muted)",
                    marginBottom: 4
                }}>
                    Заказчик
                </div>
                <Link
                    href={adminClientHref(order.client.id)}
                    style={{fontSize: "0.875rem", fontWeight: 500, color: "inherit", textDecoration: "none"}}
                >
                    {order.client.name ?? order.client.email}
                </Link>
                <div style={{fontSize: "0.75rem", color: "var(--adm-muted)"}}>{order.client.email}</div>
            </div>

            <div className="sp-card" style={{padding: "10px 12px"}}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 4
                }}>
                    <div style={{fontSize: "0.75rem", color: "var(--adm-muted)"}}>
                        Специалист
                    </div>
                    {!order.specialist && (
                        <Link
                            href={adminOrderHref(order.id, "manage")}
                            style={{
                                background: "none",
                                border: "1px solid var(--adm-sidebar-border)",
                                borderRadius: 6,
                                padding: "2px 8px",
                                fontSize: "0.75rem",
                                color: "var(--adm-active-color)",
                                textDecoration: "none",
                                whiteSpace: "nowrap"
                            }}
                        >
                            Назначить специалиста
                        </Link>
                    )}
                </div>
                {order.specialist ? (
                    <>
                        <Link
                            href={adminSpecialistHref(order.specialist.id)}
                            style={{fontSize: "0.875rem", fontWeight: 500, color: "inherit", textDecoration: "none"}}
                        >
                            {order.specialist.name ?? order.specialist.email}
                        </Link>
                        <div style={{fontSize: "0.75rem", color: "var(--adm-muted)"}}>{order.specialist.email}</div>
                    </>
                ) : (
                    <span style={{fontSize: "0.875rem", color: "var(--bs-danger)"}}>Не назначен</span>
                )}
            </div>
        </div>
    )
}

