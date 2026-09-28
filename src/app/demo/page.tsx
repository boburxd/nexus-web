"use client"

import {useState} from "react"
import {confirmDialog} from "@/lib/dialog-store"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {stripBx} from "@/lib/icon-map"

const ROLES = [
    {
        role: "CLIENT",
        label: "Заказчик",
        icon: "bx-briefcase",
        color: "var(--primary)",
        desc: "Создание проекта, заполнение брифа, согласование этапов"
    },
    {
        role: "SPECIALIST",
        label: "Специалист",
        icon: "bx-palette",
        color: "var(--warning)",
        desc: "Онбординг с нуля, тест, интервью, выполнение заказов"
    },
    {
        role: "ADMIN",
        label: "Администратор",
        icon: "bx-shield",
        color: "var(--success)",
        desc: "Текущий аккаунт админа — управление платформой"
    },
] as const

const ROLE_REDIRECT: Record<string, string> = {
    CLIENT: "/orders",
    SPECIALIST: "/onboarding",
    ADMIN: "/admin",
}

export default function DemoPage() {
    const [key, setKey] = useState("")
    const [loading, setLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [resetting, setResetting] = useState(false)
    const [resetDone, setResetDone] = useState(false)

    const handleLogin = async (role: string) => {
        if (!key.trim()) {
            setError("Введите ключ доступа");
            return
        }
        setLoading(role);
        setError(null)
        try {
            const res = await fetch("/api/demo/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({key: key.trim(), role}),
            })
            if (!res.ok) {
                const d = await res.json().catch(() => ({}))
                setError(d.error ?? "Ошибка входа")
                setLoading(null)
                return
            }
            window.location.href = ROLE_REDIRECT[role] ?? "/"
        } catch {
            setError("Ошибка сети")
            setLoading(null)
        }
    }

    const handleReset = async () => {
        if (!key.trim()) {
            setError("Введите ключ доступа");
            return
        }
        const ok = await confirmDialog({
            title: "Удалить все demo-аккаунты (заказчик + специалист) и их данные?",
            description: "Это необратимо.",
            variant: "destructive",
        })
        if (!ok) return
        setResetting(true);
        setError(null);
        setResetDone(false)
        try {
            const res = await fetch("/api/demo/reset", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({key: key.trim()}),
            })
            if (!res.ok) {
                const d = await res.json().catch(() => ({}))
                setError(d.error ?? "Ошибка сброса")
            } else {
                setResetDone(true)
            }
        } catch {
            setError("Ошибка сети")
        } finally {
            setResetting(false)
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "var(--background)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem"
        }}>
            <div style={{maxWidth: 720, width: "100%"}}>
                <div style={{textAlign: "center", marginBottom: 40}}>
                    <h1 style={{
                        color: "var(--foreground)",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        margin: "0 0 8px",
                        letterSpacing: "0.04em"
                    }}>NEXUS Demo</h1>
                    <p style={{color: "var(--muted-foreground)", fontSize: "0.875rem"}}>Выберите роль для входа на
                        платформу</p>
                </div>

                <div style={{display: "flex", justifyContent: "center", marginBottom: 32}}>
                    <Input
                        type="password"
                        placeholder="Ключ доступа"
                        value={key}
                        onChange={e => {
                            setKey(e.target.value);
                            setError(null)
                        }}
                        className="w-70 text-center"
                    />
                </div>

                <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32}}>
                    {ROLES.map(r => (
                        <Button
                            key={r.role}
                            type="button"
                            variant="outline"
                            disabled={!!loading}
                            onClick={() => handleLogin(r.role)}
                            className="h-auto flex-col whitespace-normal"
                            style={{cursor: loading ? "wait" : "pointer", textAlign: "center"}}
                        >
                            <div style={{padding: "32px 10px"}}>
                                <Icon name={stripBx(r.icon)}
                                   style={{fontSize: "1.5rem", color: r.color, display: "block", marginBottom: 12}}/>
                                <div style={{
                                    color: "var(--foreground)",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                    marginBottom: 6
                                }}>{r.label}</div>
                                <div style={{
                                    color: "var(--muted-foreground)",
                                    fontSize: "0.75rem",
                                    lineHeight: 1.4
                                }}>{r.desc}</div>
                                {loading === r.role &&
                                    <div style={{color: r.color, fontSize: "0.75rem", marginTop: 10}}>Вход…</div>}
                            </div>
                        </Button>
                    ))}
                </div>

                {error && (
                    <div style={{
                        textAlign: "center",
                        color: "var(--destructive)",
                        fontSize: "0.875rem",
                        marginBottom: 16
                    }}>{error}</div>
                )}
                {resetDone && (
                    <div style={{textAlign: "center", color: "var(--success)", fontSize: "0.875rem", marginBottom: 16}}>✓
                        Demo-данные удалены</div>
                )}

                <div style={{textAlign: "center"}}>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={resetting}
                        onClick={handleReset}
                        style={{cursor: resetting ? "wait" : "pointer"}}
                    >
                        <Icon name="trash"/>
                        {resetting ? "Удаление…" : "Сбросить demo-данные"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
