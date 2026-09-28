"use client"

import {useEffect, useRef, useState} from "react"
import {useRouter} from "next/navigation"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"

interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string | null;
    link: string | null
    readAt: string | null;
    createdAt: string
}

export default function NotificationBell({buttonClassName}: {
    /** Свой класс кнопки-колокольчика — тогда встроенные размеры и отступы не применяются. */
    buttonClassName?: string
} = {}) {
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState<NotificationItem[]>([])
    const [unread, setUnread] = useState(0)
    const ref = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Initial load of existing notifications.
    const load = async () => {
        const res = await fetch("/api/notifications")
        if (!res.ok) return
        const data = await res.json()
        setItems(data.items)
        setUnread(data.unread)
    }

    useEffect(() => {
        load()

        // SSE connection for real-time pushes.
        const es = new EventSource("/api/notifications/stream")

        es.onmessage = (e) => {
            const msg = JSON.parse(e.data) as { type: string } & Partial<NotificationItem>
            if (msg.type === "ping" || msg.type === "connected") return

            // Prepend the new notification and increment unread counter.
            const item = msg as NotificationItem
            setItems(prev => {
                if (prev.some(n => n.id === item.id)) return prev
                return [item, ...prev].slice(0, 50)
            })
            setUnread(prev => prev + 1)
        }

        es.onerror = () => {
            // Browser automatically reconnects on error — no action needed.
        }

        return () => es.close()
    }, [])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const markAllRead = async () => {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({all: true})
        })
        setItems(prev => prev.map(i => ({...i, readAt: i.readAt ?? new Date().toISOString()})))
        setUnread(0)
    }

    const handleClick = async (item: NotificationItem) => {
        if (!item.readAt) {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: item.id})
            })
            setItems(prev => prev.map(i => i.id === item.id ? {...i, readAt: new Date().toISOString()} : i))
            setUnread(prev => Math.max(0, prev - 1))
        }
        if (item.link) router.push(item.link)
    }

    return (
        <div ref={ref} style={{position: "relative"}}>
            <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}
                    className={buttonClassName ?? "relative"} aria-label="Уведомления" aria-expanded={open}>
                <Icon name="bell"/>
                {unread > 0 && (
                    <span style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "var(--dash-danger, var(--destructive))",
                        color: "#fff",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
            {unread > 9 ? "9+" : unread}
          </span>
                )}
            </Button>

            {open && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    width: 340,
                    maxHeight: 420,
                    overflowY: "auto",
                    background: "var(--dash-surface3, var(--popover))",
                    borderRadius: 14,
                    zIndex: 100
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--dash-border, var(--border))"
                    }}>
                        <span style={{fontWeight: 600, fontSize: "0.875rem"}}>Уведомления</span>
                        {unread > 0 && (
                            <Button variant="link" size="xs" onClick={markAllRead}>
                                Прочитать все
                            </Button>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div style={{
                            padding: "32px 16px",
                            textAlign: "center",
                            color: "var(--dash-muted, var(--muted-foreground))",
                            fontSize: "0.875rem"
                        }}>
                            Нет уведомлений
                        </div>
                    ) : items.map(item => (
                        <div key={item.id} onClick={() => handleClick(item)} role={item.link ? "button" : undefined}
                             tabIndex={item.link ? 0 : undefined} onKeyDown={item.link ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleClick(item)
                            }
                        } : undefined} style={{
                            padding: "10px 16px", cursor: item.link ? "pointer" : "default",
                            borderBottom: "1px solid var(--dash-border, var(--border))",
                            background: item.readAt ? "transparent" : "color-mix(in oklab, var(--dash-accent, var(--primary)) 6%, transparent)",
                        }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 8
                            }}>
                                <div style={{flex: 1, minWidth: 0}}>
                                    <p style={{
                                        margin: 0,
                                        fontSize: "0.875rem",
                                        fontWeight: item.readAt ? 400 : 600,
                                        color: "var(--dash-text, var(--foreground))"
                                    }}>{item.title}</p>
                                    {item.message && <p style={{
                                        margin: "2px 0 0",
                                        fontSize: "0.75rem",
                                        color: "var(--dash-muted, var(--muted-foreground))"
                                    }}>{item.message}</p>}
                                </div>
                                {!item.readAt && <div style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "var(--dash-accent, var(--primary))",
                                    flexShrink: 0,
                                    marginTop: 6
                                }}/>}
                            </div>
                            <p style={{margin: "4px 0 0", fontSize: "0.75rem", color: "var(--dash-muted, var(--muted-foreground))"}}>
                                {new Date(item.createdAt).toLocaleString("ru-RU", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
