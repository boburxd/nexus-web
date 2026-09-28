"use client"

import {type ChangeEvent, useRef, useState} from "react"
import type {FileUploadModalProps} from "./types"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"

export function FileUploadModal({
                                    open,
                                    onClose,
                                    onUpload,
                                    title,
                                    description,
                                    accept = ".pdf",
                                }: FileUploadModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = async () => {
        if (!file) return
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

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (f) {
            if (!f.name.toLowerCase().endsWith(".pdf") && f.type !== "application/pdf") {
                setError("Загрузите файл в формате PDF")
                return
            }
            if (f.size > 10 * 1024 * 1024) {
                setError("Размер файла не должен превышать 10МБ")
                return
            }
            setFile(f)
            setError(null)
        }
    }

    if (!open) return null

    return (
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
            onClick={onClose}
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
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <h3 style={{margin: 0, fontSize: "1.125rem"}}>{title}</h3>
                    <Button variant="ghost" size="icon-sm" aria-label="Закрыть" onClick={onClose}>
                        ×
                    </Button>
                </div>
                <p style={{color: "var(--adm-muted)", fontSize: "0.875rem", marginBottom: 16}}>{description}</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    style={{display: "none"}}
                />
                <Button
                    variant="outline"
                    size="lg"
                    className="mb-3 w-full"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Icon name="upload"/>
                    {file ? file.name : "Выберите файл (PDF, до 10МБ)"}
                </Button>
                {error && <p style={{color: "var(--destructive)", fontSize: "0.875rem", marginBottom: 12}}>{error}</p>}
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                    }}
                >
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit} disabled={!file || loading}>
                        {loading ? "Загрузка…" : "Загрузить"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
