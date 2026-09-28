"use client"

import {useMemo, useRef, useState} from "react"
import {useRouter} from "next/navigation"
import {OnboardingShell} from "@/components/app/OnboardingShell"
import {AppCard} from "@/components/app/AppCard"
import {Markdown} from "@/components/ui/Markdown"
import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"

export default function RegulationsReadClient({title, content}: { title: string; content: string }) {
    const router = useRouter()
    const [confirmed, setConfirmed] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const wrapRef = useRef<HTMLDivElement | null>(null)
    const [scrolledToEnd, setScrolledToEnd] = useState(false)

    const pages = useMemo(() => Math.max(1, Math.round(content.length / 1800)), [content])

    const onScroll = () => {
        const el = wrapRef.current
        if (!el) return
        const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24
        if (nearBottom) setScrolledToEnd(true)
    }

    const onContinue = async () => {
        if (!confirmed || !scrolledToEnd || submitting) return
        setSubmitting(true)
        try {
            const res = await fetch("/api/onboarding/regulations-read", {method: "POST"})
            if (res.ok) router.push("/onboarding/regulations")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <OnboardingShell title="Регламент" backHref="/onboarding" backLabel="Онбординг" withBg>
            <div className="mx-auto max-w-3xl px-6 py-12">
                <div className="mb-8">
                    <h1 style={{color: "var(--foreground)", fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 500, margin: 0}}>
                        Шаг 4. Ознакомление с регламентом
                    </h1>
                    <p style={{
                        color: "rgba(255,255,255,0.45)",
                        marginTop: "8px",
                        fontSize: "0.875rem",
                        lineHeight: 1.55
                    }}>
                        Перед тестом прочитайте регламент платформы. Пролистайте текст до конца и подтвердите
                        ознакомление.
                    </p>
                    <p style={{color: "rgba(255,255,255,0.35)", marginTop: "6px", fontSize: "0.75rem"}}>
                        {title} · объём: ~{pages} стр.
                    </p>
                </div>

                <AppCard glass>
                    <div
                        ref={wrapRef}
                        onScroll={onScroll}
                        style={{
                            maxHeight: "62vh",
                            overflow: "auto",
                            paddingRight: 8,
                            scrollBehavior: "smooth",
                            color: "rgba(255,255,255,0.72)",
                        }}
                    >
                        <Markdown content={content} className="reg-read-md"/>
                        <style>{`
                            .reg-read-md h1, .reg-read-md h2, .reg-read-md h3, .reg-read-md h4 { color: var(--foreground); }
                            .reg-read-md strong { color: rgba(255,255,255,0.92); }
                            .reg-read-md a { color: var(--primary); }
                        `}</style>
                    </div>

                    <div style={{marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14}}>
                        <label style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            cursor: scrolledToEnd ? "pointer" : "not-allowed"
                        }}>
                            <Checkbox
                                checked={confirmed}
                                disabled={!scrolledToEnd}
                                onChange={(e) => setConfirmed(e.target.checked)}
                                className="mt-1"
                            />
                            <span style={{
                                color: scrolledToEnd ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)",
                                fontSize: "0.875rem",
                                lineHeight: 1.45
                            }}>
                Я ознакомился(ась) с регламентом и обязуюсь соблюдать правила платформы.
                                {!scrolledToEnd && (
                                    <span style={{
                                        display: "block",
                                        marginTop: 4,
                                        color: "rgba(255,255,255,0.28)",
                                        fontSize: "0.75rem"
                                    }}>
                    Пролистайте текст до конца, чтобы активировать подтверждение.
                  </span>
                                )}
              </span>
                        </label>

                        <Button
                            type="button"
                            size="lg"
                            onClick={onContinue}
                            disabled={!confirmed || !scrolledToEnd || submitting}
                            className="mt-3 w-full"
                        >
                            {submitting ? "Сохранение…" : "Перейти к тесту →"}
                        </Button>
                    </div>
                </AppCard>
            </div>
        </OnboardingShell>
    )
}
