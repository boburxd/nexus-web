"use client"

import {useState} from "react"
import {toast} from "sonner"
import {StatusBadge} from "@/components/app/AppCard"
import {confirmDialog} from "@/lib/dialog-store"
import type {ActStatus, Stage, StageAct} from "@/app/admin/orders/types"
import {ACT_STATUS_LABEL, ACT_STATUS_VARIANT} from "@/app/admin/orders/types"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"

function formatDate(dateString: string | null): string {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

function ActFileLink({stageId, s3Key, label}: { stageId: string; s3Key: string | null; label: string }) {
    if (!s3Key) return null
    return (
        <a
            href={`/api/stages/${stageId}/act/download`}
            target="_blank"
            rel="noreferrer"
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: "var(--success)",
                fontSize: "0.875rem",
                textDecoration: "none",
            }}
        >
            <Icon name="download"/>
            {label}
        </a>
    )
}

/** Карточка акта для одного этапа (админ-модерация). */
export function StageActAdminCard({
                                      stage,
                                      act,
                                      onApproveAct,
                                      onRejectAct,
                                      onConfirmAct,
                                  }: {
    stage: Stage
    act: StageAct
    onApproveAct: (stageId: string, actId: string) => void | Promise<void>
    onRejectAct: (stageId: string, actId: string, comment: string) => void | Promise<void>
    onConfirmAct: (stageId: string, actId: string) => void | Promise<void>
}) {
    const [rejecting, setRejecting] = useState(false)
    const [rejectComment, setRejectComment] = useState("")
    const [acting, setActing] = useState(false)

    const statusLabel = ACT_STATUS_LABEL[act.status as ActStatus] || act.status
    const variant = ACT_STATUS_VARIANT[act.status as ActStatus] || "pending"

    const handleApprove = async () => {
        if (!(await confirmDialog({title: "Одобрить акт и отправить заказчику для подписания?"}))) return
        setActing(true)
        try {
            await onApproveAct(stage.id, act.id)
        } finally {
            setActing(false)
        }
    }

    const submitReject = async () => {
        if (!rejectComment.trim()) {
            toast.error("Пожалуйста, укажите причину отклонения")
            return
        }
        setActing(true)
        setRejecting(false)
        try {
            await onRejectAct(stage.id, act.id, rejectComment)
        } finally {
            setActing(false)
        }
    }

    const handleConfirm = async () => {
        const ok = await confirmDialog({
            title: "Подтвердить акт? Это активирует следующий этап (если есть).",
            variant: "destructive",
        })
        if (!ok) return
        setActing(true)
        try {
            await onConfirmAct(stage.id, act.id)
        } finally {
            setActing(false)
        }
    }

    return (
        <>
            <div
                style={{
                    borderRadius: 8,
                    padding: "12px",
                    marginTop: 10,
                    background:
                        act.status === "REJECTED"
                            ? "color-mix(in oklab, var(--destructive) 6%, transparent)"
                            : act.status === "CONFIRMED"
                                ? "color-mix(in oklab, var(--success) 6%, transparent)"
                                : "rgba(255,255,255,0.02)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                        flexWrap: "wrap",
                        gap: "8px",
                    }}
                >
                    <div style={{display: "flex", alignItems: "center", gap: 8}}>
                        <Icon name="file-blank" style={{fontSize: "1.125rem", color: "var(--adm-muted)"}}/>
                        <span style={{fontWeight: 600, fontSize: "0.875rem"}}>Акт этапа</span>
                    </div>
                    <StatusBadge variant={variant} label={statusLabel}/>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        marginBottom: 8,
                        fontSize: "0.75rem",
                    }}
                >
                    <div>
                        <div style={{color: "var(--adm-muted)", marginBottom: 2}}>Статус</div>
                        <div style={{fontWeight: 500}}>{statusLabel}</div>
                    </div>
                    {act.specialistUploadedAt ? (
                        <div>
                            <div style={{color: "var(--adm-muted)", marginBottom: 2}}>Загружен</div>
                            <div>{formatDate(act.specialistUploadedAt)}</div>
                        </div>
                    ) : null}
                    {act.adminApprovedAt ? (
                        <div>
                            <div style={{color: "var(--adm-muted)", marginBottom: 2}}>Проверен</div>
                            <div>{formatDate(act.adminApprovedAt)}</div>
                        </div>
                    ) : null}
                    {act.clientSignedAt ? (
                        <div>
                            <div style={{color: "var(--adm-muted)", marginBottom: 2}}>Подписан клиентом</div>
                            <div>{formatDate(act.clientSignedAt)}</div>
                        </div>
                    ) : null}
                    {act.adminConfirmedAt ? (
                        <div>
                            <div style={{color: "var(--adm-muted)", marginBottom: 2}}>Подтверждён</div>
                            <div>{formatDate(act.adminConfirmedAt)}</div>
                        </div>
                    ) : null}
                </div>

                <div style={{display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8, fontSize: "0.75rem"}}>
                    <ActFileLink stageId={stage.id} s3Key={act.specialistActS3Key} label="Акт от дизайнера"/>
                    <ActFileLink stageId={stage.id} s3Key={act.clientActS3Key} label="Акт от заказчика"/>
                </div>

                <div style={{display: "flex", flexDirection: "column", gap: 8}}>
                    {act.status === "SPECIALIST_UPLOADED" && (
                        <p style={{fontSize: "0.75rem", color: "var(--adm-muted)", margin: 0, lineHeight: 1.35}}>
                            «Одобрить» открывает заказчику скачивание акта и загрузку подписанного PDF. «Подтвердить»
                            (финально): только после того, как заказчик загрузит подпись.
                        </p>
                    )}
                    {act.status === "CLIENT_SIGNED" && (
                        <p style={{fontSize: "0.75rem", color: "var(--adm-muted)", margin: 0, lineHeight: 1.35}}>
                            Заказчик загрузил подписанный акт: проверьте и подтвердите.
                        </p>
                    )}
                    <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
                        {act.status === "SPECIALIST_UPLOADED" && (
                            <>
                                <Button size="sm" variant="success" onClick={() => void handleApprove()} disabled={acting}>
                                    {acting ? "…" : "Одобрить"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        setRejecting(true)
                                        setRejectComment("")
                                    }}
                                    disabled={acting}
                                >
                                    На доработку
                                </Button>
                            </>
                        )}
                        {act.status === "CLIENT_SIGNED" && (
                            <Button size="sm" variant="success" onClick={() => void handleConfirm()} disabled={acting}>
                                {acting ? "…" : "Подтвердить"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {rejecting && (
                <div
                    role="presentation"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: "var(--z-dropdown)",
                    }}
                    onClick={() => setRejecting(false)}
                >
                    <div
                        style={{
                            background: "var(--adm-sidebar)",
                            borderRadius: 14,
                            padding: 24,
                            width: 420,
                            maxWidth: "90vw",
                            color: "var(--adm-text)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16
                        }}>
                            <h3 style={{margin: 0, fontSize: "1.125rem"}}>Акт на доработку</h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Закрыть"
                                onClick={() => setRejecting(false)}
                            >
                                ×
                            </Button>
                        </div>
                        <p style={{color: "var(--adm-muted)", fontSize: "0.875rem", marginBottom: 16}}>Укажите причину возврата акта
                            на доработку</p>
                        <textarea
                            className="sp-textarea"
                            rows={4}
                            placeholder="Причина возврата…"
                            value={rejectComment}
                            onChange={(e) => setRejectComment(e.target.value)}
                            autoFocus
                            style={{marginBottom: 16}}
                        />
                        <div style={{display: "flex", gap: 8, justifyContent: "flex-end"}}>
                            <Button type="button" variant="ghost" onClick={() => setRejecting(false)} disabled={acting}>
                                Отмена
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => void submitReject()}
                                disabled={!rejectComment.trim() || acting}
                            >
                                Отправить
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
