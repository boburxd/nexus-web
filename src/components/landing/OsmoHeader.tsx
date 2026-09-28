"use client"

import {useEffect, useRef} from "react"
import {gsap} from "gsap"
import Link from "next/link"
import {useSession} from "next-auth/react"
import {buttonVariants} from "@/components/ui/button"

interface OsmoHeaderProps {
    visible: boolean
    lightBg: boolean
}

export function OsmoHeader({visible, lightBg}: OsmoHeaderProps) {
    const ref = useRef<HTMLDivElement>(null)
    const {status} = useSession()
    const signedIn = status === "authenticated"
    const entryHref = signedIn ? "/auth/continue" : "/login"
    const entryLabel = signedIn ? "Кабинет" : "Войти"

    useEffect(() => {
        if (!visible) return
        gsap.fromTo(
            ref.current,
            {opacity: 0, y: -16},
            {opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.1}
        )
    }, [visible])

    if (!visible) return null

    const color = lightBg ? "var(--background)" : "var(--card-foreground)"

    return (
        <nav
            ref={ref}
            className="fixed top-0 left-0 right-0 z-50 flex items-start justify-between font-sans"
            style={{padding: "40px 48px", opacity: 0}}
        >
            <h1 className="m-0" style={{fontSize: "clamp(1.5rem, 3vw, 2.6rem)", lineHeight: 1.2, fontWeight: 600}}>
                <Link
                    href="/"
                    className="no-underline"
                    style={{
                        color,
                        transition: "color 0.3s ease",
                        textShadow: lightBg ? "none" : "0 2px 12px rgba(0,0,0,0.4)",
                    }}
                >
                    NEXUS
                </Link>
            </h1>

            <Link href={entryHref} className={buttonVariants({size: "lg"})}>
                {entryLabel}
            </Link>
        </nav>
    )
}
