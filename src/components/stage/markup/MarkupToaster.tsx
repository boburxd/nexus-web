import React from "react"
import type {MarkupToastVariant} from "./types"

export function MarkupToaster({
                                  toast,
                              }: {
    toast: { message: string; variant: MarkupToastVariant } | null
}) {
    if (!toast) return null
    const bg =
        toast.variant === "success"
            ? "var(--success)"
            : toast.variant === "error"
                ? "var(--destructive)"
                : "var(--primary)"
    const fg = toast.variant === "error" ? "#fff" : "var(--primary-foreground)"
    return (
        <div
            role="status"
            style={{
                position: "fixed",
                top: 24,
                right: 24,
                maxWidth: 360,
                zIndex: "var(--z-toast)",
                padding: "12px 16px",
                borderRadius: 10,
                background: bg,
                color: fg,
                fontSize: "0.875rem",
                lineHeight: 1.45,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                animation: "markup-toast-in 0.25s ease",
            }}
        >
            {toast.message}
            <style>{`@keyframes markup-toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    )
}

