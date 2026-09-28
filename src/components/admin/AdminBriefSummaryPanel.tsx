"use client"

import {useMemo, useState} from "react"
import {ADMIN_BRIEF_FIELD_GROUPS, getAdminBriefCompletion} from "@/lib/adminBriefFields"
import {formatBriefWizardProgress} from "@/lib/clientBriefDisplay"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"
import {stripBx} from "@/lib/icon-map"

function trunc(s: string, n: number): string {
    const t = s.replace(/\s+/g, " ").trim()
    if (t.length <= n) return t
    return `${t.slice(0, n - 1)}…`
}

interface Props {
    orderId: string
    briefData: Record<string, string> | null
    briefHelpRequested: boolean
    briefStep: number
    briefVideoFile?: { id: string; s3Key: string; filename: string; mimeType: string | null; createdAt: string } | null
    /** Показывать позицию в мастере (черновик) */
    showWizardStep: boolean
    onOpenFullEditor: () => void
}

export function AdminBriefSummaryPanel({
                                           orderId,
                                           briefData,
                                           briefHelpRequested,
                                           briefStep,
                                           briefVideoFile,
                                           showWizardStep,
                                           onOpenFullEditor,
                                       }: Props) {
    const [briefFiles, setBriefFiles] = useState<Array<{
        id: string;
        s3Key: string;
        filename: string;
        mimeType: string | null;
        size: number | null;
        createdAt: string
    }>>([])
    const [filesLoaded, setFilesLoaded] = useState(false)

    const loadBriefFiles = async () => {
        try {
            const r = await fetch(`/api/orders/${orderId}/brief/files`)
            if (!r.ok) return
            const body = await r.json() as { files?: typeof briefFiles }
            setBriefFiles(Array.isArray(body.files) ? body.files : [])
            setFilesLoaded(true)
        } catch {
            // ignore
        }
    }

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(ADMIN_BRIEF_FIELD_GROUPS.map(g => [g.label, false])),
    )
    const toggle = (label: string) => setOpenGroups(p => ({...p, [label]: !p[label]}))

    const {filled, total, rows, extraEntries} = useMemo(() => getAdminBriefCompletion(briefData), [briefData])
    const missing = total - filled

    const rowsByGroup = useMemo(() => {
        const m = new Map<string, typeof rows>()
        for (const r of rows) {
            const list = m.get(r.groupLabel) ?? []
            list.push(r)
            m.set(r.groupLabel, list)
        }
        return m
    }, [rows])

    return (
        <div className="sp-card" style={{marginBottom: 16}}>
            <div className="sp-card-hd" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8
            }}>
                <span className="sp-label">Бриф заказчика</span>
                <Button type="button" size="xs" onClick={onOpenFullEditor}>
                    <Icon name="expand-alt"/>
                    Полный бриф
                </Button>
            </div>
            <div className="sp-card-bd" style={{paddingTop: 4}}>
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                    fontSize: "0.75rem"
                }}>
          <span style={{fontWeight: 600, color: filled === total ? "var(--success)" : "var(--adm-text, currentColor)"}}>
            Заполнено: {filled}/{total}
          </span>
                    {missing > 0 && (
                        <span style={{color: "var(--warning)", fontWeight: 500}}>Пустых полей: {missing}</span>
                    )}
                    {showWizardStep && (
                        <span style={{color: "var(--adm-muted)"}}>
              В мастере: {formatBriefWizardProgress(briefStep)}
            </span>
                    )}
                </div>
                <p style={{fontSize: "0.75rem", color: "var(--adm-muted)", margin: "0 0 12px", lineHeight: 1.45}}>
                    Блоки брифа по умолчанию свернуты. Разверните нужный раздел.
                </p>

                {briefVideoFile?.s3Key && (
                    <div style={{
                        marginBottom: 12,
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid var(--adm-sidebar-border, rgba(0,0,0,0.08))"
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            marginBottom: 8
                        }}>
                            <div style={{display: "flex", alignItems: "center", gap: 8}}>
                                <Icon name="video" style={{color: "var(--adm-active-color)"}}/>
                                <div>
                                    <div style={{fontSize: "0.75rem", fontWeight: 600}}>Видео к брифу</div>
                                    <div style={{
                                        fontSize: "0.75rem",
                                        color: "var(--adm-muted)"
                                    }}>{briefVideoFile.filename}</div>
                                </div>
                            </div>
                            <a
                                href={`/api/files/download?key=${encodeURIComponent(briefVideoFile.s3Key)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="sp-btn sp-btn-ghost"
                                style={{fontSize: "0.75rem", padding: "4px 8px"}}
                            >
                                <Icon name="download" style={{marginRight: 4}}/>
                                Скачать
                            </a>
                        </div>
                        <video
                            src={`/api/files/download?key=${encodeURIComponent(briefVideoFile.s3Key)}`}
                            controls
                            style={{width: "100%", maxHeight: 320, borderRadius: 10, background: "rgba(0,0,0,0.6)"}}
                        />
                    </div>
                )}

                <div style={{
                    marginBottom: 12,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--adm-sidebar-border, rgba(0,0,0,0.08))"
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 8
                    }}>
                        <div style={{display: "flex", alignItems: "center", gap: 8}}>
                            <Icon name="paperclip" style={{color: "var(--adm-active-color)"}}/>
                            <div>
                                <div style={{fontSize: "0.75rem", fontWeight: 600}}>Документы к брифу</div>
                                <div style={{fontSize: "0.75rem", color: "var(--adm-muted)"}}>
                                    {filesLoaded ? `Файлов: ${briefFiles.length}` : "Нажмите «Показать»"}
                                </div>
                            </div>
                        </div>
                        <Button
                            type="button"
                            size="xs"
                            variant="ghost"
                            onClick={() => void loadBriefFiles()}
                        >
                            <Icon name="refresh"/>
                            Показать
                        </Button>
                    </div>
                    {filesLoaded && briefFiles.length > 0 ? (
                        <div style={{display: "grid", gap: 6}}>
                            {briefFiles.map((f) => (
                                <div key={f.id} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12
                                }}>
                  <span style={{
                      fontSize: "0.75rem",
                      color: "var(--adm-text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                  }}>
                    {f.filename}
                  </span>
                                    <a
                                        href={`/api/files/download?key=${encodeURIComponent(f.s3Key)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="sp-btn sp-btn-ghost"
                                        style={{fontSize: "0.75rem", padding: "2px 6px", flexShrink: 0}}
                                    >
                                        <Icon name="download" style={{marginRight: 4}}/>
                                        Скачать
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : filesLoaded ? (
                        <div style={{fontSize: "0.75rem", color: "var(--adm-muted)"}}>Нет прикрепленных файлов.</div>
                    ) : null}
                </div>

                {briefHelpRequested && (
                    <div
                        style={{
                            marginBottom: 12,
                            padding: "8px 12px",
                            borderRadius: 8,
                            background: "color-mix(in oklab, var(--destructive) 8%, transparent)",
                            fontSize: "0.75rem",
                            color: "var(--destructive)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <Icon name="support" style={{fontSize: "1.125rem"}}/>
                        <span>
              <strong>Запрошена помощь менеджера.</strong> Ниже видно, что уже введено и что осталось пустым: так проще понять, чем помочь.
            </span>
                    </div>
                )}

                {ADMIN_BRIEF_FIELD_GROUPS.map(group => {
                    const groupRows = rowsByGroup.get(group.label) ?? []
                    const groupFilled = groupRows.filter(r => r.filled).length
                    const expanded = openGroups[group.label] === true
                    return (
                        <div key={group.label} style={{
                            marginBottom: 10,
                            border: "1px solid var(--adm-sidebar-border, rgba(0,0,0,0.08))",
                            borderRadius: 8,
                            overflow: "hidden"
                        }}>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-between"
                                aria-expanded={expanded}
                                onClick={() => toggle(group.label)}
                            >
                <span style={{display: "flex", alignItems: "center", gap: 6}}>
                  <Icon name={stripBx(group.icon)} style={{color: "var(--adm-active-color)"}}/>
                    {group.label}
                    <span style={{fontWeight: 500, opacity: 0.85}}>
                    ({groupFilled}/{groupRows.length})
                  </span>
                </span>
                                <Icon name={stripBx(expanded ? "bx-chevron-up" : "bx-chevron-down")}/>
                            </Button>
                            {expanded && (
                                <div style={{padding: "6px 10px 10px"}}>
                                    {groupRows.map((r, ri) => (
                                        <div
                                            key={r.key}
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "22px 140px 1fr",
                                                gap: 8,
                                                alignItems: "start",
                                                padding: "4px 0",
                                                borderBottom: ri === groupRows.length - 1 ? "none" : "1px solid var(--adm-sidebar-border, rgba(0,0,0,0.06))",
                                                fontSize: "0.75rem",
                                            }}
                                        >
                      <span style={{
                          color: r.filled ? "var(--success)" : "var(--adm-muted)",
                          fontWeight: 700,
                          textAlign: "center"
                      }}>
                        {r.filled ? "✓" : "·"}
                      </span>
                                            <span style={{color: "var(--adm-muted)", fontWeight: 500}}>{r.label}</span>
                                            <span style={{
                                                color: r.filled ? "var(--adm-text)" : "var(--muted-foreground)",
                                                wordBreak: "break-word"
                                            }}>
                        {r.filled ? trunc(r.preview, 120) : "не заполнено"}
                      </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}

                {extraEntries.length > 0 && (
                    <div style={{
                        marginTop: 8,
                        padding: 10,
                        borderRadius: 8,
                        background: "var(--adm-hover-bg, rgba(0,0,0,0.03))",
                        fontSize: "0.75rem"
                    }}>
                        <div style={{fontWeight: 600, marginBottom: 6, color: "var(--adm-muted)"}}>Доп. поля (не из
                            мастера)
                        </div>
                        {extraEntries.map(({key, value}) => (
                            <div key={key} style={{marginBottom: 4}}>
                                <span style={{color: "var(--adm-muted)"}}>{key}: </span>
                                {trunc(value, 200)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
