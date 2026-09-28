"use client"

import {createPortal} from "react-dom"
import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"

interface Props {
    open: boolean
    title: string
    message?: string
    confirmLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({open, title, message, confirmLabel = "Удалить", onConfirm, onCancel}: Props) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!open) return
        const h = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel()
        }
        window.addEventListener("keydown", h)
        return () => window.removeEventListener("keydown", h)
    }, [open, onCancel])

    if (!mounted || !open) return null

    return createPortal(
        <div onClick={onCancel} role="presentation" style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: "var(--z-dialog)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" style={{
                background: "var(--dash-surface, var(--card))",
                border: "1px solid var(--dash-border, var(--border))",
                borderRadius: 14,
                padding: 24,
                maxWidth: 380,
                width: "90vw"
            }}>
                <h3 style={{margin: "0 0 8px", fontSize: "1rem", color: "var(--dash-text, var(--foreground))"}}>{title}</h3>
                {message && <p style={{
                    margin: "0 0 20px",
                    fontSize: "0.875rem",
                    color: "var(--dash-muted, var(--muted-foreground))",
                    lineHeight: 1.45
                }}>{message}</p>}
                <div style={{display: "flex", gap: 8, justifyContent: "flex-end"}}>
                    <Button variant="outline" onClick={onCancel}>Отмена</Button>
                    <Button variant="destructive" onClick={onConfirm}>{confirmLabel}</Button>
                </div>
            </div>
        </div>,
        document.body
    )
}
