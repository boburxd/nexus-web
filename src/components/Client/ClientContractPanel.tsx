"use client"

import {useState} from "react"
import {DocumentUpload} from "@/components/app/DocumentUpload"
import {confirmDialog} from "@/lib/dialog-store"
import {Icon} from "@/components/ui/icon"
import {stripBx} from "@/lib/icon-map"

export type ContractStatus = "DRAFT" | "SENT" | "SIGNED" | "CONFIRMED" | "CANCELLED"

/** Договор, уже отфильтрованный по нужной стороне (специалист/заказчик) на сервере. */
export type PartyContract = {
    id: string
    number: string
    status: ContractStatus
    s3Key: string | null
    signedS3Key: string | null
    sentAt: string | null
    signedAt: string | null
    confirmedAt: string | null
}

interface Props {
    contract: PartyContract | null
    orderId: string
    userRole: "CLIENT" | "SPECIALIST"
    onUploadSigned?: (file: File) => Promise<{ success: boolean; error?: string }>
    title?: string
}

const STATUS_ACTIONS: Record<ContractStatus, { label: string; icon: string }> = {
    DRAFT: {label: "Не создан", icon: "bx bx-file-blank"},
    SENT: {label: "Требует вашей подписи", icon: "bx bx-edit"},
    SIGNED: {label: "Ожидает подтверждения", icon: "bx bx-check-circle"},
    CONFIRMED: {label: "Договор активен", icon: "bx bx-check-double"},
    CANCELLED: {label: "Отменен", icon: "bx bx-x-circle"},
}

function formatDate(dateString: string | null): string {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleString("ru-RU", {
        day: "2-digit", month: "2-digit", year: "numeric",
    })
}

// Модальное окно загрузки файла
function UploadModal({
                         open,
                         onClose,
                         onUpload,
                         title,
                         description,
                     }: {
    open: boolean
    onClose: () => void
    onUpload?: (file: File) => Promise<{ success: boolean; error?: string }>
    title: string
    description: string
}) {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (!file || !onUpload) return
        const ok = await confirmDialog({
            title: "Отправить подписанный договор?",
            description: "Это действие нельзя отменить.",
            variant: "warning",
        })
        if (!ok) return
        setLoading(true)
        setError(null)
        const result = await onUpload(file)
        setLoading(false)
        if (result.success) {
            onClose()
            setFile(null)
        } else {
            setError(result.error || "Ошибка загрузки")
        }
    }

    if (!open) return null

    return (
        <div
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
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "#1a1a1a",
                    borderRadius: 12,
                    padding: 24,
                    width: 420,
                    maxWidth: "90vw",
                    color: "#fff",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16}}>
                    <h3 style={{margin: 0, fontSize: "1.1rem"}}>{title}</h3>
                    <button onClick={onClose} style={{
                        background: "none",
                        border: "none",
                        color: "#999",
                        cursor: "pointer",
                        fontSize: "1.2rem"
                    }}>×
                    </button>
                </div>
                <p style={{color: "#999", fontSize: "0.85rem", marginBottom: 16}}>{description}</p>
                <div style={{marginBottom: 16}}>
                    <DocumentUpload
                        file={file}
                        onFileChange={(f) => {
                            setFile(f)
                            setError(null)
                        }}
                        disabled={loading}
                        error={error}
                    />
                </div>
                <div style={{display: "flex", gap: 8, justifyContent: "flex-end"}}>
                    <button onClick={() => {
                        setFile(null)
                        setError(null)
                        onClose()
                    }} disabled={loading}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 6,
                                border: "1px solid #444",
                                background: "#222",
                                color: "#999",
                                cursor: "pointer",
                                fontSize: "0.85rem"
                            }}>
                        Отмена
                    </button>
                    <button onClick={handleSubmit} disabled={!file || loading}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 6,
                                border: "none",
                                background: "#34d399",
                                color: "#fff",
                                cursor: !file || loading ? "not-allowed" : "pointer",
                                opacity: !file || loading ? 0.6 : 1,
                                fontSize: "0.85rem",
                                fontWeight: 600
                            }}>
                        {loading ? "Отправка…" : "Отправить"}
                    </button>
                </div>
            </div>
        </div>
    )
}

function ContractFileLink({contractId, s3Key, label}: { contractId: string; s3Key: string | null; label: string }) {
    if (!s3Key) return null
    return (
        <a
            href={`/api/contracts/${contractId}/download`}
            target="_blank"
            rel="noreferrer"
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: "#34d399",
                fontSize: "0.85rem",
                textDecoration: "none"
            }}
        >
            <Icon name="download"/>
            {label}
        </a>
    )
}

// Основной компонент для клиента и специалиста
export function ClientContractPanel({contract, orderId, userRole, onUploadSigned, title = "Договор"}: Props) {
    const [uploadModalOpen, setUploadModalOpen] = useState(false)

    if (!contract) {
        return (
            <div style={{
                background: "var(--dash-surface)",
                borderRadius: 10,
                padding: 16,
                border: "1px solid var(--dash-border)",
                marginBottom: 16
            }}>
                <div style={{
                    fontSize: "0.75rem",
                    color: "var(--dash-muted)",
                    textTransform: "uppercase",
                    marginBottom: 8
                }}>{title}
                </div>
                <p style={{margin: 0, color: "var(--dash-text2)", fontSize: "0.85rem"}}>
                    {userRole === "CLIENT" ? "Дождитесь, пока администратор сгенерирует договор." : "Дождитесь, пока администратор отправит вам договор."}
                </p>
            </div>
        )
    }

    const {label, icon} = STATUS_ACTIONS[contract.status]

    // Загрузка открыта ровно в том статусе, который принимает сервер (…/contract/<role>/sign).
    const canUpload = contract.status === "SENT"
    // Подпись уже отправлена — форма остаётся видимой, но заблокированной.
    const ownSubmitted = !canUpload && Boolean(contract.signedS3Key)

    return (
        <div style={{
            background: "var(--dash-surface)",
            borderRadius: 10,
            padding: 16,
            border: "1px solid var(--dash-border)",
            marginBottom: 16
        }}>
            <div style={{
                fontSize: "0.75rem",
                color: "var(--dash-muted)",
                textTransform: "uppercase",
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <span>{title}</span>
                <span style={{fontWeight: 500, color: "var(--dash-text2)"}}>{contract.number}</span>
            </div>

            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: "0.85rem"}}>
                <Icon name={stripBx(icon)} style={{color: "var(--dash-accent)"}}/>
                <span style={{color: "var(--dash-text2)"}}>{label}</span>
            </div>

            <div style={{display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, fontSize: "0.8rem"}}>
                {contract.s3Key && (
                    <ContractFileLink contractId={contract.id} s3Key={contract.s3Key} label="Скачать"/>
                )}
            </div>

            {ownSubmitted && (
                <DocumentUpload
                    size="sm"
                    file={null}
                    onFileChange={() => undefined}
                    submitted={{
                        title: "Подписанный договор отправлен",
                        submittedAt: contract.signedAt,
                        hint: contract.status === "CONFIRMED" ? "Договор подтверждён" : "Ожидает проверки администратором",
                    }}
                />
            )}

            {canUpload && onUploadSigned && (
                <div style={{marginTop: 8}}>
                    <button
                        onClick={() => setUploadModalOpen(true)}
                        style={{
                            width: "100%",
                            padding: "0.55em 1em",
                            borderRadius: 8,
                            border: "1px solid var(--dash-accent-border)",
                            background: "var(--dash-accent-bg)",
                            color: "var(--dash-accent)",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            fontFamily: "inherit",
                        }}
                    >
                        Загрузить подписанный договор
                    </button>
                </div>
            )}

            {onUploadSigned ? (
                <UploadModal
                    open={uploadModalOpen}
                    onClose={() => setUploadModalOpen(false)}
                    onUpload={onUploadSigned}
                    title={userRole === "SPECIALIST" ? "Подпишите договор" : "Подпишите договор"}
                    description={userRole === "SPECIALIST"
                        ? "Скачайте договор, подпишите его и загрузите скан обратно в систему."
                        : "Скачайте договор, подпишите его и загрузите скан обратно в систему."}
                />
            ) : null}
        </div>
    )
}
