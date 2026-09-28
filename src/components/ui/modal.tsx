"use client"

import {useCallback, useEffect, useRef} from "react"
import {createPortal} from "react-dom"
import {cn} from "@/lib/utils"
import {ADM_VARS_DARK, ADM_VARS_LIGHT, readAdminThemeChoice} from "@/lib/admin-theme"

interface ModalProps {
    open: boolean
    onClose: () => void
    children: React.ReactNode
    maxWidth?: number | string
    theme?: "light" | "dark"
    /** solid — непрозрачная; glass — полупрозрачная с blur; transparent — без фона панели */
    variant?: "solid" | "glass" | "transparent"
    className?: string
}

export function Modal({open, onClose, children, maxWidth = 720, theme, variant = "solid", className}: ModalProps) {
    const handleKey = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose()
    }, [onClose])

    useEffect(() => {
        if (!open) return
        document.addEventListener("keydown", handleKey)
        document.body.style.overflow = "hidden"
        return () => {
            document.removeEventListener("keydown", handleKey)
            document.body.style.overflow = ""
        }
    }, [open, handleKey])

    const panelRef = useRef<HTMLDivElement>(null)

    if (!open || typeof document === "undefined") return null

    // Портал рендерится в document.body — вне .adm-root, поэтому CSS-переменные туда не
    // наследуются. Если явную тему не передали, читаем выбор из профильного меню админки
    // (data-theme на .adm-root) напрямую через DOM, а не только системную схему.
    const admThemeChoice = theme ? null : readAdminThemeChoice()
    const isDark = theme === "dark" || admThemeChoice === "dark"
        || (!theme && !admThemeChoice && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    const isGlass = variant === "glass"
    const isTransparent = variant === "transparent"

    const panelBackground = isTransparent
        ? "transparent"
        : isGlass
            ? (isDark ? "rgba(17, 18, 24, 0.35)" : "rgba(255, 255, 255, 0.65)")
            : (isDark ? "var(--adm-sidebar, #1e293b)" : "var(--adm-sidebar, #fff)")

    return createPortal(
        <div
            onClick={onClose}
            className="adm-modal-backdrop"
            style={{
                position: "fixed", inset: 0, zIndex: 1100,
                background: isGlass || isTransparent ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.72)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 16,
            }}
        >
            <div
                ref={panelRef}
                onClick={e => e.stopPropagation()}
                className={cn("adm-modal-panel", className)}
                style={{
                    width: "100%",
                    maxWidth,
                    maxHeight: "92vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: isTransparent ? "visible" : "hidden",
                    borderRadius: 16,
                    boxShadow: isTransparent
                        ? (isDark ? "0 32px 80px rgba(0,0,0,0.7)" : "0 24px 80px rgba(0,0,0,0.35)")
                        : undefined,
                    background: panelBackground,
                    backdropFilter: isGlass ? "blur(24px) saturate(1.15)" : undefined,
                    WebkitBackdropFilter: isGlass ? "blur(24px) saturate(1.15)" : undefined,
                    color: isDark ? "var(--adm-text, #f1f5f9)" : "var(--adm-text, #111827)",
                    animation: "modal-in 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                    // Переобъявляем весь набор --adm-* на корне портала, чтобы произвольный
                    // admin-контент в children (например .sp-btn-primary из orders.css) не
                    // молча ломался из-за отсутствующего наследования CSS-переменных через
                    // границу портала — см. комментарий в src/lib/admin-theme.ts.
                    ...(isDark ? ADM_VARS_DARK : ADM_VARS_LIGHT),
                } as React.CSSProperties}
            >
                {children}
            </div>
            <style>{`
        @keyframes modal-in {
          from { transform: scale(0.94); opacity: 0 }
          to   { transform: scale(1);    opacity: 1 }
        }
      `}</style>
        </div>,
        document.body
    )
}
