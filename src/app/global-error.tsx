"use client"

import "./globals.css"
import * as Sentry from "@sentry/nextjs"
import {useEffect} from "react"
import {Button} from "@/components/ui/button"

export default function GlobalError({error}: { error: Error & { digest?: string } }) {
    useEffect(() => {
        Sentry.captureException(error)
    }, [error])

    return (
        <html lang="ru">
        <body style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily: "sans-serif",
            background: "var(--background)",
            color: "var(--foreground)"
        }}>
        <div style={{textAlign: "center"}}>
            <h1 style={{fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem"}}>Что-то пошло не так</h1>
            <p style={{color: "var(--muted-foreground)", fontSize: "0.875rem"}}>Ошибка зафиксирована. Попробуйте обновить
                страницу.</p>
            <Button
                type="button"
                variant="secondary"
                size="lg"
                className="mt-6"
                onClick={() => window.location.reload()}
            >
                Обновить
            </Button>
        </div>
        </body>
        </html>
    )
}
