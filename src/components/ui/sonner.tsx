"use client"

import {useEffect, useState} from "react"
import {usePathname} from "next/navigation"
import {useTheme} from "next-themes"
import {Toaster as Sonner, type ToasterProps} from "sonner"
import {Icon} from "@/components/ui/icon"
import {ADMIN_THEME_CHANGE_EVENT, readAdminThemeChoice} from "@/lib/admin-theme"

const ADM_TOAST_LIGHT_VARS = {
    "--normal-bg": "#ffffff",
    "--normal-text": "#0f172a",
    "--normal-border": "rgba(15, 23, 42, 0.12)",
} as React.CSSProperties

const ADM_TOAST_DARK_VARS = {
    "--normal-bg": "#070c29",
    "--normal-text": "#d3d7dc",
    "--normal-border": "rgba(255, 255, 255, 0.15)",
} as React.CSSProperties

const Toaster = ({...props}: ToasterProps) => {
    const {theme = "system"} = useTheme()
    const pathname = usePathname()
    // Toaster монтируется один раз в Providers и не перерисовывается при смене темы/страницы
    // сам по себе — как и модалки/диалоги (см. src/lib/admin-theme.ts), тосты рендерятся
    // порталом вне .adm-root и не наследуют --adm-*, поэтому явно переопределяем токены,
    // подписавшись на смену темы и маршрута. Помимо --normal-* (нейтральный тост), у sonner
    // свои встроенные цвета для success/error/warning/info, завязанные на переданный проп
    // theme, а не на CSS-переменные — поэтому его тоже пересчитываем, а не только vars.
    const [admThemeChoice, setAdmThemeChoice] = useState<"light" | "dark" | null>(null)

    useEffect(() => {
        const sync = () => setAdmThemeChoice(readAdminThemeChoice())
        sync()
        window.addEventListener(ADMIN_THEME_CHANGE_EVENT, sync)
        return () => window.removeEventListener(ADMIN_THEME_CHANGE_EVENT, sync)
    }, [pathname])

    const admThemeVars = admThemeChoice === "light" ? ADM_TOAST_LIGHT_VARS : admThemeChoice === "dark" ? ADM_TOAST_DARK_VARS : undefined

    return (
        <Sonner
            theme={(admThemeChoice ?? theme) as ToasterProps["theme"]}
            className="toaster group"
            icons={{
                success: (
                    <Icon name="check-circle" className="size-4"/>
                ),
                info: (
                    <Icon name="info-circle" className="size-4"/>
                ),
                warning: (
                    <Icon name="error" className="size-4"/>
                ),
                error: (
                    <Icon name="x-circle" className="size-4"/>
                ),
                loading: (
                    <Icon name="loader-alt" className="size-4 animate-spin"/>
                ),
            }}
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                    "--border-radius": "var(--radius)",
                    ...admThemeVars,
                } as React.CSSProperties
            }
            toastOptions={{
                classNames: {
                    toast: "cn-toast",
                },
            }}
            {...props}
        />
    )
}

export {Toaster}
