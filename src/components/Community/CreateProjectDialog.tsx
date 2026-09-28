"use client"

import {createPortal} from "react-dom"
import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"

interface Props {
    open: boolean
    onCreate: (name: string) => void
    onCancel: () => void
    error?: string | null
}

export function CreateProjectDialog({open, onCreate, onCancel, error}: Props) {
    const [mounted, setMounted] = useState(false)
    const [name, setName] = useState("")

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (open) setName("")
    }, [open])

    useEffect(() => {
        if (!open) return
        const h = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel()
        }
        window.addEventListener("keydown", h)
        return () => window.removeEventListener("keydown", h)
    }, [open, onCancel])

    if (!mounted || !open) return null

    const trimmed = name.trim()
    const submit = () => {
        if (trimmed) onCreate(trimmed)
    }

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
                <h3 style={{margin: "0 0 8px", fontSize: "1rem", color: "var(--dash-text, var(--foreground))"}}>
                    Новый проект
                </h3>
                <p style={{
                    margin: "0 0 14px",
                    fontSize: "0.875rem",
                    color: "var(--dash-muted, var(--muted-foreground))",
                    lineHeight: 1.45
                }}>
                    Название папки: например, «Квартира Сокольники».
                </p>
                <Input
                    autoFocus
                    placeholder="Название проекта"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") submit()
                    }}
                    aria-label="Название нового проекта"
                />
                {error && <small className="text-danger d-block mt-2">{error}</small>}
                <div style={{display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20}}>
                    <Button variant="outline" onClick={onCancel}>Отмена</Button>
                    <Button onClick={submit} disabled={!trimmed}>Добавить проект</Button>
                </div>
            </div>
        </div>,
        document.body
    )
}
