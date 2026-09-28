"use client"

import type {AdminPendingDraft, AdminStageReleaseWave, AudienceSetter, PreviewOpener} from "./types"
import {WaveFiles} from "./WaveFiles"
import {Icon} from "@/components/ui/icon"
import {stripBx} from "@/lib/icon-map"

function formatStageDt(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

type UnifiedCard =
    | { kind: "draft"; pendingDraft: AdminPendingDraft }
    | { kind: "released"; wave: AdminStageReleaseWave }

function isVideoFilename(name: string) {
    return /\.(mp4|webm|mov)$/i.test(name)
}

function isImageFilename(name: string) {
    return /\.(png|jpe?g|webp|gif)$/i.test(name)
}

export function WaveCardUnified({
                                    stageId,
                                    card,
                                    onOpenPreview,
                                    onSetAudience,
                                }: {
    stageId: string
    card: UnifiedCard
    onOpenPreview: PreviewOpener
    onSetAudience?: AudienceSetter
}) {
    const isReleased = card.kind === "released"
    const title = isReleased ? `Выпуск ${card.wave.displayNumber}` : "Черновик"
    const badge = isReleased ? "Показано заказчику" : "Ожидает проверки"
    const releasedAt = isReleased ? card.wave.releasedAt : null

    const moderatorRejections = isReleased ? card.wave.moderatorRejections : card.pendingDraft.moderatorRejections
    const clientRejections = isReleased ? card.wave.clientRejections : card.pendingDraft.clientRejections
    const files = isReleased ? card.wave.files : card.pendingDraft.files
    const bundles = isReleased ? (card.wave.bundles ?? null) : (card.pendingDraft.bundles ?? null)

    const hasModerator = moderatorRejections.length > 0
    const hasClient = clientRejections.length > 0
    const hasBundles = Boolean(bundles && bundles.length > 0)

    return (
        <div
            className={`sp-stage-wave-card${isReleased && card.wave.isFinalAcceptedBundle ? " sp-stage-wave-card--final" : ""}`}>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap"
            }}>
                <div style={{fontWeight: 700, fontSize: "0.875rem"}}>
                    {title}
                    {releasedAt ? (
                        <span style={{fontWeight: 600, fontSize: "0.75rem", color: "var(--adm-muted)", marginLeft: 8}}>
              · {formatStageDt(releasedAt)}
            </span>
                    ) : null}
                </div>
                <div style={{display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap"}}>
                    {isReleased && card.wave.isFinalAcceptedBundle ? (
                        <span className="sp-badge sp-badge--success" style={{fontSize: "0.75rem"}}>
              Принято заказчиком
            </span>
                    ) : null}
                    {isReleased && card.wave.isAtClientReview ? (
                        <span className="sp-badge sp-badge--warn" style={{fontSize: "0.75rem"}}>
              На согласовании
            </span>
                    ) : null}
                    <span className={`sp-badge ${isReleased ? "sp-badge--info" : "sp-badge--warn"}`}
                          style={{fontSize: "0.75rem"}}>
            {badge}
          </span>
                </div>
            </div>

            <div style={{fontSize: "0.75rem", color: "var(--adm-muted)", marginTop: 4}}>
                {isReleased ? "Эта версия показана заказчику (после одобрения администратором)" : "После последнего выпуска — ещё не одобрено для показа заказчику"}
            </div>

            <details open={hasModerator || hasClient} style={{marginTop: 10}}>
                <summary
                    style={{
                        listStyle: "none",
                        cursor: "pointer",
                        userSelect: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: "var(--adm-outer)",
                        color: "var(--adm-text)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                    }}
                >
          <span style={{display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0}}>
            <Icon name="message-square-dots" style={{color: "var(--adm-muted)"}}/>
            Замечания и решения
            <span style={{color: "var(--adm-muted)", fontWeight: 600, fontSize: "0.75rem"}}>
              · модератор {moderatorRejections.length} · заказчик {clientRejections.length}
            </span>
          </span>
                    <Icon name="chevron-down" style={{color: "var(--adm-muted)"}}/>
                </summary>

                <div style={{marginTop: 10}}>
                    <div>
                        <div style={{
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            color: "var(--adm-muted)",
                        }}>
                            <span aria-hidden style={{display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--bs-warning)", marginRight: 6, verticalAlign: "middle"}}/>
                            Модератор
                        </div>
                        {moderatorRejections.length === 0 ? (
                            <div style={{fontSize: "0.75rem", marginTop: 4, color: "var(--adm-text)"}}>Замечаний
                                нет</div>
                        ) : (
                            <ul style={{
                                margin: "6px 0 0",
                                paddingLeft: 16,
                                fontSize: "0.75rem",
                                lineHeight: 1.45,
                                color: "var(--adm-text)"
                            }}>
                                {moderatorRejections.map((x, i) => (
                                    <li key={`m-${x.createdAt}-${i}`}>
                                        {x.comment?.trim() ? x.comment : "(без текста)"}
                                        <span style={{
                                            color: "var(--adm-muted)",
                                            marginLeft: 6
                                        }}>{formatStageDt(x.createdAt)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div style={{marginTop: 10}}>
                        <div style={{
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            color: "var(--adm-muted)",
                        }}>
                            <span aria-hidden style={{display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--adm-active-color)", marginRight: 6, verticalAlign: "middle"}}/>
                            {isReleased ? "Заказчик (до выпуска)" : "Заказчик"}
                        </div>
                        {clientRejections.length === 0 ? (
                            <div style={{fontSize: "0.75rem", marginTop: 4, color: "var(--adm-text)"}}>Замечаний
                                нет</div>
                        ) : (
                            <ul style={{
                                margin: "6px 0 0",
                                paddingLeft: 16,
                                fontSize: "0.75rem",
                                lineHeight: 1.45,
                                color: "var(--adm-text)"
                            }}>
                                {clientRejections.map((x, i) => (
                                    <li key={`c-${x.createdAt}-${i}`}>
                                        {x.comment?.trim() ? x.comment : "(без текста)"}
                                        <span style={{
                                            color: "var(--adm-muted)",
                                            marginLeft: 6
                                        }}>{formatStageDt(x.createdAt)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </details>

            <div style={{fontSize: "0.75rem", color: "var(--adm-muted)", marginTop: 10}}>
                Файлов в комплекте:{" "}
                <strong style={{color: "var(--adm-text)"}}>{files.length}</strong>
            </div>

            {hasBundles && bundles ? (
                <>
                    {bundles.map((b) => {
                        const isRejected = Boolean(b.moderatorRejectedAt || (b as {
                            moderatorRejection?: unknown
                        }).moderatorRejection)
                        const moderatorRejection = (b as {
                            moderatorRejection?: { createdAt: string; comment: string | null } | null
                        }).moderatorRejection ?? null

                        const mediaCount = b.files.filter((f) => isVideoFilename(f.filename) || isImageFilename(f.filename)).length
                        const docsCount = b.files.length - mediaCount
                        const whatRejected =
                            mediaCount > 0 && docsCount > 0
                                ? `Отклонено: ${mediaCount} медиа + ${docsCount} файл(ов)`
                                : mediaCount > 0
                                    ? `Отклонено: ${mediaCount} медиа`
                                    : docsCount > 0
                                        ? `Отклонено: ${docsCount} файл(ов)`
                                        : "Отклонено"

                        return (
                            <div key={`b-${b.bundleIndex}`} style={{marginTop: 10}}>
                                <details open={!isRejected} style={{margin: 0}}>
                                    <summary
                                        style={{
                                            listStyle: "none",
                                            cursor: "pointer",
                                            userSelect: "none",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 10,
                                            padding: "8px 10px",
                                            borderRadius: 8,
                                            border: "1px solid var(--adm-sidebar-border)",
                                            background: "transparent",
                                            color: "var(--adm-text)",
                                            fontSize: "0.75rem",
                                            fontWeight: 800,
                                            marginBottom: 6,
                                        }}
                                    >
                    <span style={{display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0}}>
                      <Icon name={stripBx(isRejected ? "bx-x-circle" : "bx-layer-plus")}
                         style={{color: isRejected ? "var(--bs-danger)" : "var(--adm-muted)"}}/>
                        {b.label}
                        <span style={{
                            color: "var(--adm-muted)",
                            fontWeight: 700,
                            fontSize: "0.75rem"
                        }}>· файлов {b.files.length}</span>
                    </span>
                                        <span
                                            className={`sp-badge ${isRejected ? "sp-badge--danger" : "sp-badge--warn"}`}
                                            style={{fontSize: "0.75rem"}}>
                      {isRejected ? "Отклонено" : "Ожидает проверки"}
                    </span>
                                    </summary>

                                    {isRejected ? (
                                        <div style={{fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 8}}>
                                            {whatRejected}
                                        </div>
                                    ) : null}

                                    <WaveFiles stageId={stageId} files={b.files} onOpenPreview={onOpenPreview}
                                               onSetAudience={onSetAudience}/>

                                    {isRejected ? (
                                        <div style={{marginTop: 10}}>
                                            <div style={{
                                                fontSize: "0.75rem",
                                                fontWeight: 800,
                                                color: "var(--adm-muted)",
                                            }}>
                                                <span aria-hidden style={{display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--bs-danger)", marginRight: 6, verticalAlign: "middle"}}/>
                                                Причина
                                            </div>
                                            <div style={{
                                                marginTop: 6,
                                                fontSize: "0.75rem",
                                                color: "var(--adm-text)",
                                                lineHeight: 1.45
                                            }}>
                                                {moderatorRejection?.comment?.trim() ? moderatorRejection.comment : "(без текста комментария)"}
                                                {moderatorRejection?.createdAt ? (
                                                    <span style={{color: "var(--adm-muted)", marginLeft: 6}}>
                          {formatStageDt(moderatorRejection.createdAt)}
                        </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    ) : null}
                                </details>
                            </div>
                        )
                    })}
                </>
            ) : (
                <WaveFiles stageId={stageId} files={files} onOpenPreview={onOpenPreview} onSetAudience={onSetAudience}/>
            )}
        </div>
    )
}

