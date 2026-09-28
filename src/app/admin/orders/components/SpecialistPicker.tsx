"use client"

import {useEffect, useMemo, useRef, useState} from "react"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"
import {userDisplayName} from "@/lib/user-name"
import {parseMultiValue} from "@/lib/specialist-options"
import type {SpecialistForAssignment} from "../types"

/** «Специализация · Специализация · Метод · Метод» — коротко под именем в списке. */
function specialistTags(s: SpecialistForAssignment): string {
    const fd = s.specialistProfile?.formData
    const specialty = parseMultiValue(fd?.specialty)
    const methods = parseMultiValue(fd?.methods)
    return [...specialty, ...methods].join(" · ")
}

function StarRating({rating}: { rating: number | null }) {
    const filled = Math.round(rating ?? 0)
    return (
        <span style={{display: "inline-flex", gap: 2, fontSize: "0.75rem", lineHeight: 1}} aria-hidden>
            {Array.from({length: 5}, (_, i) => (
                <span key={i} style={{color: i < filled ? "var(--bs-warning)" : "var(--adm-sidebar-border)"}}>★</span>
            ))}
        </span>
    )
}

function SpecialistAvatar({name, avatarUrl, size = 28}: { name: string; avatarUrl?: string; size?: number }) {
    return (
        <span
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--adm-active-bg)",
                color: "var(--adm-active-color)",
                fontWeight: 600,
                fontSize: size * 0.4,
            }}
        >
            {avatarUrl
                ? <img src={avatarUrl} alt="" style={{width: "100%", height: "100%", objectFit: "cover"}}/>
                : (name[0] ?? "?").toUpperCase()}
        </span>
    )
}

/** Кастомный селектор специалиста для назначения на заказ: аватар, имя, рейтинг звёздами вместо числа. */
export function SpecialistPicker({
                                      specialists,
                                      avatarUrls,
                                      value,
                                      onChange,
                                      disabled = false,
                                  }: {
    specialists: SpecialistForAssignment[]
    avatarUrls: Record<string, string>
    value: string
    onChange: (specialistId: string) => void
    disabled?: boolean
}) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const wrapRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const selected = useMemo(() => specialists.find((s) => s.id === value) ?? null, [specialists, value])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return specialists
        return specialists.filter((s) => userDisplayName(s).toLowerCase().includes(q))
    }, [specialists, query])

    useEffect(() => {
        if (!open) return
        const onDocClick = (e: MouseEvent) => {
            if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }
        document.addEventListener("mousedown", onDocClick)
        document.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("mousedown", onDocClick)
            document.removeEventListener("keydown", onKey)
        }
    }, [open])

    useEffect(() => {
        if (open) searchRef.current?.focus()
        else setQuery("")
    }, [open])

    return (
        <div ref={wrapRef} style={{position: "relative", flex: 1, minWidth: 0}}>
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-expanded={open}
                onClick={() => !disabled && setOpen((v) => !v)}
                onKeyDown={(e) => {
                    if (disabled) return
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setOpen((v) => !v)
                    }
                }}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minHeight: 42,
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "6px 32px 6px 8px",
                    borderRadius: 8,
                    background: open ? "var(--adm-hover-bg)" : "var(--adm-sidebar)",
                    color: "var(--adm-text)",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    cursor: disabled ? "default" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                    position: "relative",
                }}
            >
                {selected ? (
                    <>
                        <SpecialistAvatar name={userDisplayName(selected)} avatarUrl={avatarUrls[selected.id]}/>
                        <span style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                            {userDisplayName(selected)}
                        </span>
                        <StarRating rating={selected.specialistProfile?.rating ?? null}/>
                    </>
                ) : (
                    <span style={{color: "var(--adm-muted)"}}>Выберите…</span>
                )}
                <Icon
                    name={open ? "chevron-up" : "chevron-down"}
                    style={{position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--adm-muted)"}}
                />
            </div>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        zIndex: 40,
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        borderRadius: 8,
                        background: "var(--adm-sidebar)",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
                        overflow: "hidden",
                    }}
                >
                    <div style={{padding: 8, borderBottom: "1px solid var(--adm-sidebar-border)"}}>
                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            placeholder="Поиск специалиста…"
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "6px 10px",
                                borderRadius: 6,
                                border: "1px solid var(--adm-sidebar-border)",
                                background: "transparent",
                                color: "var(--adm-text)",
                                fontSize: "0.875rem",
                                fontFamily: "inherit",
                                outline: "none",
                            }}
                        />
                    </div>

                    <div style={{maxHeight: 280, overflowY: "auto", padding: 4}}>
                        {filtered.length === 0 && (
                            <div style={{padding: 8, fontSize: "0.75rem", color: "var(--adm-muted)"}}>
                                Ничего не найдено
                            </div>
                        )}
                        {filtered.map((s) => {
                            const name = userDisplayName(s)
                            const tags = specialistTags(s)
                            const isSelected = s.id === value
                            return (
                                <Button
                                    key={s.id}
                                    type="button"
                                    variant={isSelected ? "secondary" : "ghost"}
                                    aria-pressed={isSelected}
                                    className="h-auto w-full items-start justify-start gap-2 py-1.5 text-left"
                                    onClick={() => {
                                        onChange(s.id)
                                        setOpen(false)
                                    }}
                                >
                                    <SpecialistAvatar name={name} avatarUrl={avatarUrls[s.id]}/>
                                    <span style={{flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2}}>
                                        <span style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }}>
                                            <span style={{
                                                flex: 1,
                                                minWidth: 0,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap"
                                            }}>{name}</span>
                                            <StarRating rating={s.specialistProfile?.rating ?? null}/>
                                        </span>
                                        {tags && (
                                            <span style={{
                                                fontSize: "0.75rem",
                                                color: isSelected ? "inherit" : "var(--adm-muted)",
                                                opacity: isSelected ? 0.85 : 1,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap"
                                            }}>{tags}</span>
                                        )}
                                    </span>
                                </Button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
