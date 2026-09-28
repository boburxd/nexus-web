"use client"
import React, {useCallback, useEffect} from "react"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"
import {stripBx} from "@/lib/icon-map"

// ─── Card ────────────────────────────────────────────────────────────────────

interface AppCardProps {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
    /**
     * Самодостаточная карточка (непрозрачный фон --card, инлайн-стили), не завязанная на
     * `sneat/core.css` — нужна на страницах онбординга, где этот стиль не подключён.
     */
    glass?: boolean
}

export function AppCard({children, className = "", style, glass = false}: AppCardProps) {
    if (glass) {
        return (
            <div
                className={className}
                style={{
                    background: "var(--card)",
                    borderRadius: 14,
                    padding: "1.5rem",
                    ...style,
                }}
            >
                {children}
            </div>
        )
    }
    return (
        <div className={`card ${className}`} style={style}>
            <div className="card-body">
                {children}
            </div>
        </div>
    )
}

// ─── Section label ───────────────────────────────────────────────────────────

export function SectionLabel({children}: { children: React.ReactNode }) {
    return (
        <p className="text-muted fw-semibold mb-3"
           style={{fontSize: "0.75rem"}}>
            {children}
        </p>
    )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

export type StatusVariant = "active" | "pending" | "done" | "rejected" | "current"

const BADGE_CLASS: Record<StatusVariant, string> = {
    current: "bg-label-warning",
    active: "bg-label-info",
    done: "bg-label-success",
    pending: "bg-label-secondary",
    rejected: "bg-label-danger",
}

export function StatusBadge({variant, label, className}: { variant: StatusVariant; label: string; className?: string }) {
    return (
        <span className={`badge rounded-pill ${BADGE_CLASS[variant]}${className ? ` ${className}` : ""}`}>
      {label}
    </span>
    )
}

// ─── Info row ─────────────────────────────────────────────────────────────────

export function InfoRow({icon, label, value, href}: { icon: string; label: string; value: string; href?: string }) {
    return (
        <div className="d-flex align-items-start gap-2 mb-2">
            <Icon name={stripBx(icon)} className="text-muted mt-1"/>
            <div>
                <div className="text-muted"
                     style={{fontSize: "0.75rem"}}>{label}</div>
                {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary"
                       style={{fontSize: "0.875rem"}}>{value}</a>
                ) : (
                    <div style={{fontSize: "0.875rem"}}>{value}</div>
                )}
            </div>
        </div>
    )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface AppModalProps {
    open: boolean
    onClose: () => void
    children: React.ReactNode
    maxWidth?: number
    /** Тёмная панель (кабинет); по умолчанию светлая как в админских формах. */
    variant?: "light" | "dark"
}

export function AppModal({open, onClose, children, maxWidth = 900, variant = "light"}: AppModalProps) {
    const handleKey = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose()
    }, [onClose])

    useEffect(() => {
        if (open) {
            document.addEventListener("keydown", handleKey)
            document.body.style.overflow = "hidden"
        }
        return () => {
            document.removeEventListener("keydown", handleKey)
            document.body.style.overflow = ""
        }
    }, [open, handleKey])

    if (!open) return null

    return (
        <div
            onClick={onClose}
            role="presentation"
            style={{
                position: "fixed", inset: 0, zIndex: "var(--z-modal)",
                background: "rgba(0,0,0,0.72)", display: "flex",
                alignItems: "center", justifyContent: "center", padding: 16,
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={
                    variant === "dark"
                        ? {
                            background: "var(--popover)",
                            color: "var(--popover-foreground)",
                            borderRadius: 14,
                            width: "100%",
                            maxWidth,
                            maxHeight: "92vh",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            animation: "modal-in 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                        }
                        : {
                            background: "#fff",
                            borderRadius: 14,
                            width: "100%",
                            maxWidth,
                            maxHeight: "92vh",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            animation: "modal-in 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                        }
                }
            >
                {children}
                <style>{`@keyframes modal-in { from { transform: scale(0.93); opacity: 0 } to { transform: scale(1); opacity: 1 } }`}</style>
            </div>
        </div>
    )
}

// ─── Action button ────────────────────────────────────────────────────────────

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost" | "danger"
    icon?: string
    children: React.ReactNode
}

const ACTION_BUTTON_VARIANT = {primary: "default", danger: "destructive", ghost: "outline"} as const

export function ActionButton({variant = "ghost", icon, children, className = "", ...props}: ActionButtonProps) {
    return (
        <Button {...props} variant={ACTION_BUTTON_VARIANT[variant]} className={className}>
            {icon && <Icon name={stripBx(icon)}/>}
            {children}
        </Button>
    )
}
