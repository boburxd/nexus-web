"use client"

import {useState} from "react"
import type {ContractFileLinkProps, ContractPanelProps} from "./types"
import {CONTRACT_ACTIONS, CONTRACT_AUDIENCE_LABEL} from "./types"
import {formatDate} from "./utils"
import {ContractFileLink} from "./ContractFileLink"
import {confirmDialog} from "@/lib/dialog-store"
import {Icon} from "@/components/ui/icon"
import {stripBx} from "@/lib/icon-map"
import {DocumentUpload} from "@/components/app/DocumentUpload"

export function ContractPanel({contract, orderId, audience, onGenerate, onConfirm}: ContractPanelProps) {
    const [file, setFile] = useState<File | null>(null)
    const [generating, setGenerating] = useState(false)
    const {title, party, genitive} = CONTRACT_AUDIENCE_LABEL[audience]

    const handleGenerate = async () => {
        if (!file) return
        const ok = await confirmDialog({
            title: `Создать и отправить договор ${party}?`,
            description: "Это действие нельзя отменить.",
            variant: "warning",
        })
        if (!ok) return
        setGenerating(true)
        try {
            const success = await onGenerate(file)
            if (success) setFile(null)
        } finally {
            setGenerating(false)
        }
    }

    const handleConfirm = async () => {
        const ok = await confirmDialog({
            title: `Подтвердить подписанный договор ${genitive}?`,
            description: "Это действие нельзя отменить.",
            variant: "destructive",
        })
        if (ok) {
            await onConfirm()
        }
    }

    if (!contract) {
        return (
            <div className="sp-card" style={{marginTop: 12}}>
                <div className="sp-card-hd">
                    <span className="sp-label">{title}</span>
                </div>
                <div className="sp-card-bd">
                    <p style={{color: "var(--adm-muted)", margin: 0, fontSize: "0.85rem"}}>
                        Договор не создан
                    </p>
                    <div style={{marginTop: 12, display: "flex", flexDirection: "column", gap: 10}}>
                        <DocumentUpload
                            tone="admin"
                            size="sm"
                            label="PDF договора"
                            file={file}
                            onFileChange={setFile}
                            disabled={generating}
                        />
                        <div>
                            <button
                                onClick={handleGenerate}
                                disabled={!file || generating}
                                className="sp-btn sp-btn-primary"
                            >
                                {generating ? "…" : `Создать и отправить договор ${party}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const {label, icon} = CONTRACT_ACTIONS[contract.status]

    return (
        <div className="sp-card" style={{marginTop: 12}}>
            <div className="sp-card-hd">
                <span className="sp-label">{title}</span>
            </div>
            <div className="sp-card-bd">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                        fontSize: "0.85rem",
                    }}
                >
                    <Icon name={stripBx(icon)}/>
                    <span style={{color: "var(--adm-muted)"}}>{label}</span>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        marginBottom: 12,
                        fontSize: "0.75rem",
                    }}
                >
                    <div>
                        <div style={{color: "var(--adm-muted)", marginBottom: 2}}>Номер</div>
                        <div style={{fontWeight: 500}}>{contract.number}</div>
                    </div>
                    <div>
                        <div style={{color: "var(--adm-muted)", marginBottom: 2}}>Создан</div>
                        <div>{formatDate(contract.createdAt)}</div>
                    </div>
                    {contract.sentAt && (
                        <div>
                            <div style={{color: "var(--adm-muted)", marginBottom: 2}}>Отправлен</div>
                            <div>{formatDate(contract.sentAt)}</div>
                        </div>
                    )}
                    {contract.signedAt && (
                        <div>
                            <div style={{color: "var(--adm-muted)", marginBottom: 2}}>Подписан</div>
                            <div>{formatDate(contract.signedAt)}</div>
                        </div>
                    )}
                    {contract.confirmedAt && (
                        <div>
                            <div style={{color: "var(--adm-muted)", marginBottom: 2}}>Подтвержден</div>
                            <div>{formatDate(contract.confirmedAt)}</div>
                        </div>
                    )}
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 12,
                        fontSize: "0.8rem",
                    }}
                >
                    {contract.s3Key && (
                        <ContractFileLink contractId={contract.id} s3Key={contract.s3Key} kind="original"
                                          label="Оригинал"/>
                    )}
                    {contract.signedS3Key && (
                        <ContractFileLink contractId={contract.id} s3Key={contract.signedS3Key} kind="signed"
                                          label="Подписанный скан"/>
                    )}
                </div>

                {contract.status === "SIGNED" && (
                    <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
                        <button
                            onClick={handleConfirm}
                            className="sp-btn sp-btn-success sp-btn-sm"
                        >
                            Подтвердить
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export {formatDate} from "./utils"
export type {ContractPanelProps, ContractFileLinkProps} from "./types"
