"use client"

import {useEffect, useMemo, useRef, useState} from "react"
import {Modal} from "@/components/ui/modal"
import {Icon} from "@/components/ui/icon"
import {userDisplayName} from "@/lib/user-name"
import {parseMultiValue} from "@/lib/specialist-options"
import type {SpecialistForAssignment} from "../types"

const DEFAULT_VISIBLE_COUNT = 10

/** «Специализация · Специализация · Метод · Метод» — коротко под именем в карточке. */
function specialistTags(s: SpecialistForAssignment): string {
    const fd = s.specialistProfile?.formData
    const specialty = parseMultiValue(fd?.specialty)
    const methods = parseMultiValue(fd?.methods)
    return [...specialty, ...methods].join(" · ")
}

function StarRating({rating}: { rating: number | null }) {
    const filled = Math.round(rating ?? 0)
    return (
        <span style={{display: "inline-flex", gap: 1, fontSize: "0.8rem", lineHeight: 1, flexShrink: 0}} aria-hidden>
            {Array.from({length: 5}, (_, i) => (
                <span key={i} style={{color: i < filled ? "#f59e0b" : "var(--adm-sidebar-border)"}}>★</span>
            ))}
        </span>
    )
}

function SpecialistAvatar({name, avatarUrl, size = 44}: { name: string; avatarUrl?: string; size?: number }) {
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

/**
 * Назначение специалиста на заказ — диалог с поиском и карточками вместо инлайн-блока
 * на вкладке «Управление». Без поиска показываются последние 10 (specialists уже
 * отсортированы бэкендом по createdAt desc — см. /api/admin/specialists).
 */
export function AssignSpecialistModal({
                                           open,
                                           onClose,
                                           specialists,
                                           avatarUrls,
                                           assigningSpecialistId,
                                           onAssign,
                                       }: {
    open: boolean
    onClose: () => void
    specialists: SpecialistForAssignment[]
    avatarUrls: Record<string, string>
    /** id специалиста, для которого сейчас идёт запрос — блокирует все карточки, крутилка на выбранной. */
    assigningSpecialistId: string | null
    onAssign: (specialistId: string) => void
}) {
    const [query, setQuery] = useState("")
    const searchRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (open) {
            setQuery("")
            requestAnimationFrame(() => searchRef.current?.focus())
        }
    }, [open])

    const trimmed = query.trim().toLowerCase()
    const filtered = useMemo(() => {
        if (!trimmed) return specialists
        return specialists.filter((s) => {
            if (userDisplayName(s).toLowerCase().includes(trimmed)) return true
            return specialistTags(s).toLowerCase().includes(trimmed)
        })
    }, [specialists, trimmed])

    const isDefaultView = !trimmed
    const visible = isDefaultView ? filtered.slice(0, DEFAULT_VISIBLE_COUNT) : filtered
    const assigning = assigningSpecialistId !== null

    return (
        <Modal open={open} onClose={onClose} maxWidth={640}>
            <div style={{padding: "24px 24px 20px", display: "flex", flexDirection: "column", minHeight: 0}}>
                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12}}>
                    <h5 style={{fontWeight: 600, margin: 0}}>Назначить специалиста</h5>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Закрыть"
                        style={{
                            flexShrink: 0,
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            border: "none",
                            background: "transparent",
                            color: "var(--adm-muted)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1rem",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--adm-hover-bg)"
                            e.currentTarget.style.color = "var(--adm-text)"
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent"
                            e.currentTarget.style.color = "var(--adm-muted)"
                        }}
                    >
                        <Icon name="x"/>
                    </button>
                </div>

                <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск по имени, специализации…"
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "0.55em 0.8em",
                        borderRadius: 8,
                        border: "1px solid var(--adm-sidebar-border)",
                        background: "var(--adm-outer)",
                        color: "var(--adm-text)",
                        fontSize: "0.85rem",
                        fontFamily: "inherit",
                        outline: "none",
                        marginBottom: 6,
                    }}
                />

                <p style={{fontSize: "0.72rem", color: "var(--adm-muted)", margin: "0 0 14px"}}>
                    {isDefaultView
                        ? `Показаны последние ${Math.min(DEFAULT_VISIBLE_COUNT, filtered.length)} из ${filtered.length} специалистов — введите имя или специализацию для поиска.`
                        : `Найдено: ${filtered.length}`}
                </p>

                <div style={{
                    maxHeight: "55vh",
                    overflowY: "auto",
                    overflowX: "hidden",
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr)",
                    gap: 8,
                    marginRight: -4,
                    paddingRight: 4,
                }}>
                    {visible.length === 0 && (
                        <div style={{padding: "1.5em 0", textAlign: "center", fontSize: "0.85rem", color: "var(--adm-muted)"}}>
                            Ничего не найдено
                        </div>
                    )}
                    {visible.map((s) => {
                        const name = userDisplayName(s)
                        const tags = specialistTags(s)
                        const isAssigningThis = assigningSpecialistId === s.id
                        return (
                            <div
                                key={s.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    minWidth: 0,
                                    padding: "10px 12px",
                                    borderRadius: 10,
                                    border: "1px solid var(--adm-sidebar-border)",
                                    background: "var(--adm-sidebar)",
                                }}
                            >
                                <SpecialistAvatar name={name} avatarUrl={avatarUrls[s.id]}/>
                                <div style={{flex: 1, minWidth: 0}}>
                                    <div style={{display: "flex", alignItems: "center", gap: 8}}>
                                        <span style={{
                                            fontWeight: 600,
                                            fontSize: "0.86rem",
                                            color: "var(--adm-text)",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}>{name}</span>
                                        <StarRating rating={s.specialistProfile?.rating ?? null}/>
                                    </div>
                                    {tags && (
                                        <div style={{
                                            fontSize: "0.72rem",
                                            color: "var(--adm-muted)",
                                            marginTop: 2,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}>{tags}</div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="sp-btn sp-btn-primary"
                                    disabled={assigning}
                                    onClick={() => onAssign(s.id)}
                                    style={{flexShrink: 0}}
                                >
                                    {isAssigningThis ? "…" : "Назначить"}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </Modal>
    )
}
