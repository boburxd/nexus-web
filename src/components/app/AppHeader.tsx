"use client"

import Link from "next/link"
import {SignOutButton} from "@/components/auth/SignOutButton"
import {Icon} from "@/components/ui/icon"

interface AppHeaderProps {
    title: string
    backHref?: string
    backLabel?: string
}

export function AppHeader({title, backHref, backLabel}: AppHeaderProps) {
    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
            style={{
                padding: "0 48px",
                height: 64,
                background: "var(--card)",
                fontFamily: "var(--font-sans)",
            }}
        >
            <div className="flex items-center gap-6">
                <Link href="/" className="no-underline"
                      style={{color: "var(--foreground)", fontSize: "1.125rem", fontWeight: 500, lineHeight: 1.3}}>
                    NEXUS
                </Link>
                {backHref && (
                    <>
                        <span style={{color: "rgba(255,255,255,0.2)"}}>/</span>
                        <Link href={backHref} className="no-underline hover:opacity-70 transition-opacity"
                              style={{color: "rgba(255,255,255,0.5)", fontSize: "0.875rem"}}>
                            {backLabel}
                        </Link>
                    </>
                )}
                {title && (
                    <>
                        <span style={{color: "rgba(255,255,255,0.2)"}}>/</span>
                        <span style={{color: "var(--foreground)", fontSize: "0.875rem"}}>{title}</span>
                    </>
                )}
            </div>

            <SignOutButton
                title="Выйти из аккаунта"
                className="flex items-center gap-2 no-underline hover:opacity-70 transition-opacity"
                style={{background: "none", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem"}}
            >
                <Icon name="power-off" aria-hidden/>
                Выйти
            </SignOutButton>
        </header>
    )
}
