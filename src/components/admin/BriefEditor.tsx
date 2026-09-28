"use client"

import {useState} from "react"
import {ADMIN_BRIEF_FIELD_GROUPS} from "@/lib/adminBriefFields"
import styles from "./BriefEditor.module.css"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"
import {stripBx} from "@/lib/icon-map"

export interface BriefEditorOrder {
    id: string;
    briefData: Record<string, string> | null;
    briefHelpRequested: boolean
}

const BRIEF_GROUPS = ADMIN_BRIEF_FIELD_GROUPS

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "4px 8px", borderRadius: 6, fontSize: "0.875rem", fontFamily: "inherit",
    border: 0,
    background: "var(--adm-outer, rgba(0,0,0,0.15))", color: "inherit",
}

/** Редактор рендерится в Modal (портал в body, вне .adm-root): Button берёт цвета из --adm-*,
 *  а без них — из текста модалки, чтобы читаться и в светлой, и в тёмной теме. */
const buttonTokens = {
    "--background": "transparent",
    "--foreground": "var(--adm-text, currentColor)",
    "--muted": "var(--adm-hover-bg, color-mix(in oklab, currentColor 8%, transparent))",
    "--border": "var(--adm-sidebar-border, color-mix(in oklab, currentColor 20%, transparent))",
    "--input": "var(--adm-sidebar-border, color-mix(in oklab, currentColor 20%, transparent))",
} as React.CSSProperties

function BriefField({f, value, onChange}: {
    f: import("@/lib/adminBriefFields").AdminBriefField
    value: string
    onChange: (v: string) => void
}) {
    const type = f.type ?? "text"

    if (type === "textarea") {
        return <textarea value={value} onChange={e => onChange(e.target.value)}
                         style={{...inputStyle, resize: "vertical", minHeight: 50}}/>
    }

    if (type === "select" && f.options) {
        return (
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className={styles.nativeSelect}
                style={{...inputStyle, appearance: "auto"}}
            >
                <option value="">— выберите —</option>
                {f.options.map(o => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
        )
    }

    if (type === "chips" && f.options) {
        const active = new Set(value.split(",").map(s => s.trim()).filter(Boolean))
        const toggle = (opt: string) => {
            const next = new Set(active)
            next.has(opt) ? next.delete(opt) : next.add(opt)
            onChange([...next].join(", "))
        }
        return (
            <div style={{display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2}}>
                {f.options.map(opt => {
                    const on = active.has(opt)
                    return (
                        <Button key={opt} type="button" size="xs" variant={on ? "default" : "outline"}
                                aria-pressed={on} onClick={() => toggle(opt)}>
                            {on && "✓ "}{opt}
                        </Button>
                    )
                })}
            </div>
        )
    }

    return <input type={type === "number" ? "number" : type === "date" ? "date" : "text"} value={value}
                  onChange={e => onChange(e.target.value)} style={inputStyle}/>
}

export function BriefEditor({order, onClose, onSaved}: {
    order: BriefEditorOrder;
    onClose: () => void;
    onSaved: () => void
}) {
    const [bd, setBd] = useState<Record<string, string>>(order.briefData ?? {})
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const set = (k: string, v: string) => setBd(p => ({...p, [k]: v}))

    const handleSave = async () => {
        setSaving(true)
        await fetch(`/api/admin/orders/${order.id}/brief`, {
            method: "PATCH", headers: {"Content-Type": "application/json"},
            body: JSON.stringify(bd),
        })
        setSaving(false);
        setSaved(true);
        onSaved()
        setTimeout(() => setSaved(false), 2000)
    }

    const filled = Object.values(bd).filter(Boolean).length
    const total = BRIEF_GROUPS.reduce((s, g) => s + g.fields.length, 0)

    return (
        <div style={{padding: "20px 24px", maxHeight: "80vh", overflowY: "auto", ...buttonTokens}}>
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16}}>
                <div>
                    <h5 style={{margin: "0 0 2px", fontWeight: 600, fontSize: "1rem"}}>Бриф
                        #{order.id.slice(-6).toUpperCase()}</h5>
                    <span style={{
                        fontSize: "0.75rem",
                        color: "var(--adm-muted)"
                    }}>{filled} из {total} полей заполнено</span>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="Закрыть" onClick={onClose}><Icon name="x"/></Button>
            </div>

            {order.briefHelpRequested && (
                <div style={{
                    marginBottom: 14,
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "color-mix(in oklab, var(--destructive) 6%, transparent)",
                    border: "1px solid color-mix(in oklab, var(--destructive) 20%, transparent)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.75rem"
                }}>
                    <Icon name="support" style={{color: "var(--destructive)"}}/>
                    <span style={{color: "var(--destructive)", fontWeight: 600}}>Заказчик запросил помощь менеджера</span>
                </div>
            )}

            {BRIEF_GROUPS.map(group => (
                <div key={group.label} style={{marginBottom: 14}}>
                    <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 8}}>
                        <Icon name={stripBx(group.icon)}
                           style={{fontSize: "0.875rem", color: "var(--adm-active-color, var(--bs-primary))"}}/>
                        <span style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "var(--adm-muted)"
                        }}>{group.label}</span>
                    </div>
                    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px"}}>
                        {group.fields.map(f => (
                            <div key={f.key}
                                 style={{gridColumn: f.type === "chips" || f.type === "textarea" ? "1 / -1" : undefined}}>
                                <label style={{
                                    display: "block",
                                    fontSize: "0.75rem",
                                    color: "var(--adm-muted)",
                                    marginBottom: 2,
                                    fontWeight: 500
                                }}>{f.label}</label>
                                <BriefField f={f} value={bd[f.key] ?? ""} onChange={v => set(f.key, v)}/>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div style={{display: "flex", gap: 8, marginTop: 12}}>
                <Button onClick={handleSave} disabled={saving}>
                    {saved ? "\u2713 Сохранено" : saving ? "Сохранение\u2026" : "Сохранить бриф"}
                </Button>
                <Button variant="outline" onClick={onClose}>Закрыть</Button>
            </div>
        </div>
    )
}
