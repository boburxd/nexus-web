/**
 * Явный выбор темы из профильного меню админки (data-theme на .adm-root, см.
 * useAdminTheme() в src/components/admin/AdminLayout.tsx). Компоненты, которые рендерятся
 * порталом за пределами .adm-root (Modal, DialogHost, Toaster — все они монтируются в
 * document.body), не видят --adm-* через обычное CSS-наследование, поэтому читают выбор
 * напрямую через DOM и дублируют тему инлайн-стилями.
 */

export type AdminThemeChoice = "light" | "dark" | null

export const ADMIN_THEME_CHANGE_EVENT = "adm-theme-change"

export function readAdminThemeChoice(): AdminThemeChoice {
    if (typeof document === "undefined") return null
    const attr = document.querySelector(".adm-root")?.getAttribute("data-theme")
    return attr === "light" || attr === "dark" ? attr : null
}

/** Компоненты вне .adm-root не получают уведомление о смене темы иначе — вызывать после её изменения. */
export function notifyAdminThemeChange(): void {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_THEME_CHANGE_EVENT))
}

/**
 * Полный набор --adm-* (должен совпадать с .adm-root в AdminLayout.tsx). Порталы (Modal,
 * DialogHost, Toaster) рендерятся в document.body — вне .adm-root, поэтому CSS-переменные
 * туда не наследуются. Любой child-контент внутри модалки, который использует var(--adm-*)
 * (например .sp-btn-primary в orders.css), молча теряет их и рендерится сломанным — белый
 * текст на прозрачном/белом фоне и т.п., а не просто «не в той теме». Переобъявляя весь
 * набор на корне портала инлайн-стилями, чиним это для ЛЮБОГО текущего и будущего
 * var(--adm-*) внутри модалки одним местом, а не патчим каждый потребитель по отдельности.
 */
export const ADM_VARS_LIGHT = {
    "--adm-outer": "#f3f4f6",
    "--adm-sidebar": "#ffffff",
    "--adm-sidebar-border": "#e5e7eb",
    "--adm-text": "#111827",
    "--adm-muted": "#9ca3af",
    "--adm-active-bg": "rgba(99,102,241,0.10)",
    "--adm-active-color": "#6366f1",
    "--adm-hover-bg": "rgba(99,102,241,0.06)",
    "--adm-content-bg": "#ffffff",
    "--adm-card-bg": "#f7f8fa",
    "--adm-name-color": "#4b5563",
} as const

export const ADM_VARS_DARK = {
    "--adm-outer": "#0f172a",
    "--adm-sidebar": "#1e293b",
    "--adm-sidebar-border": "#334155",
    "--adm-text": "#f1f5f9",
    "--adm-muted": "#94a3b8",
    "--adm-active-bg": "rgba(129,140,248,0.18)",
    "--adm-active-color": "#818cf8",
    "--adm-hover-bg": "rgba(129,140,248,0.10)",
    "--adm-content-bg": "#0f172a",
    "--adm-card-bg": "#16213c",
    "--adm-name-color": "#cbd5e1",
} as const
