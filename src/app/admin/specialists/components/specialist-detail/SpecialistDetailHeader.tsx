"use client"

import {useEffect, useRef, useState} from "react"
import {StatusBadge} from "@/components/app/AppCard"
import {
    ONBOARDING_STATUS_LABEL,
    ONBOARDING_STATUS_VARIANT,
    type OnboardingStatus,
} from "@/components/app/SpecialistCard"
import {formatEdoProvidersLabel} from "@/lib/edo-providers"
import {ADVANCE_LABEL, ONBOARDING_STEPS_UI} from "./constants"
import type {RawSpecialist, SpecialistDetailTab} from "../../types"
import {ImageLightbox} from "@/components/ui/ImageLightbox"
import type {SpecialistOnboardingAdminAction} from "../SpecialistDetail"
import {confirmDialog} from "@/lib/dialog-store"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"

export function SpecialistDetailHeader({
                                           specialist,
                                           avatarUrl,
                                           displayName,
                                           status,
                                           formData: fd,
                                           canAdvance,
                                           canReject,
                                           acting,
                                           onAct,
                                           onToggleArchive,
                                           onRevokeSession,
                                           doneCount,
                                           detailTab,
                                           setDetailTab,
                                           regulationsStepStatus,
                                       }: {
    specialist: RawSpecialist
    avatarUrl?: string | null
    displayName: string
    status: OnboardingStatus
    formData: Record<string, string> | null | undefined
    canAdvance: boolean
    canReject: boolean
    acting: string | null
    onAct: (userId: string, action: SpecialistOnboardingAdminAction) => void
    onToggleArchive: (userId: string, archived: boolean) => void
    onRevokeSession: (userId: string) => void
    doneCount: number
    detailTab: SpecialistDetailTab
    setDetailTab: (tab: SpecialistDetailTab) => void
    regulationsStepStatus: string | null
}) {
    const sp = specialist
    const isArchived = !!sp.archivedAt
    const edoLabel = formatEdoProvidersLabel(typeof fd?.edoProviders === "string" ? fd.edoProviders : undefined)
    const isRevoking = acting === sp.id + "revoke-session"

    const [rejectMenuOpen, setRejectMenuOpen] = useState(false)
    const rejectMenuRef = useRef<HTMLDivElement>(null)
    const isRejecting = acting === sp.id + "reject_no_education" || acting === sp.id + "reject_no_experience"

    useEffect(() => {
        if (!rejectMenuOpen) return
        const onPointerDown = (e: PointerEvent) => {
            if (!rejectMenuRef.current?.contains(e.target as Node)) setRejectMenuOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setRejectMenuOpen(false)
        }
        document.addEventListener("pointerdown", onPointerDown)
        document.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("pointerdown", onPointerDown)
            document.removeEventListener("keydown", onKey)
        }
    }, [rejectMenuOpen])

    const selectRejectReason = (action: SpecialistOnboardingAdminAction) => {
        setRejectMenuOpen(false)
        onAct(sp.id, action)
    }

    return (
        <div className="sp-detail-sticky">
            <div className="sp-profile-header">
                <div className="sp-av-xl">
                    {avatarUrl
                        ? <ImageLightbox src={avatarUrl} alt="Аватар"><img src={avatarUrl} alt="" style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                        }}/></ImageLightbox>
                        : displayName[0].toUpperCase()}
                </div>
                <div className="sp-profile-info">
                    <h4 className="sp-profile-name">{displayName}</h4>
                    <div className="sp-profile-meta">
                        <StatusBadge variant={ONBOARDING_STATUS_VARIANT[status]}
                                     label={ONBOARDING_STATUS_LABEL[status]}
                                     className="sp-status-badge"/>
                        {isArchived && <span className="sp-badge">В архиве</span>}
                        <span className="sp-profile-email">{sp.email}</span>
                        {sp.phone && <span className="sp-profile-email">{sp.phone}</span>}
                        {sp.files.length > 0 && (
                            <span className="sp-badge"><Icon name="paperclip"
                                                          style={{marginRight: 4}}/>{sp.files.length} файл(ов)</span>
                        )}
                    </div>
                    {fd?.city && (
                        <div className="sp-profile-location">
                            <Icon name="map"/> {fd.city}
                            {fd.experience ? ` · ${fd.experience} лет опыта` : ""}
                            {fd.software ? ` · ${fd.software}` : ""}
                        </div>
                    )}
                    <div className="sp-profile-edo" title={edoLabel || "не указано"}>
                        <Icon name="transfer-alt"/> ЭДО: {edoLabel || "не указано"}
                    </div>
                </div>
                <div className="sp-profile-right">
                    <div className="sp-profile-actions">
                        {canAdvance && (
                            <>
                                <Button type="button" onClick={() => onAct(sp.id, "advance")} disabled={acting !== null}>
                                    {acting === sp.id + "advance" ? "…" : ADVANCE_LABEL[status]}
                                </Button>
                                {status === "REGULATIONS" && regulationsStepStatus !== "PASSED" && (
                                    <span style={{
                                        fontSize: "0.75rem",
                                        color: "rgba(255,200,100,0.85)",
                                        alignSelf: "center"
                                    }}>
                    <Icon name="error" style={{marginRight: 4}}/>
                    {regulationsStepStatus === "IN_PROGRESS"
                        ? "Специалист проходит тест"
                        : "Специалист ещё не прошёл тест регламентов"}
                  </span>
                                )}
                            </>
                        )}
                        {canReject && status === "PENDING" && (
                            <div className="sp-reject-dropdown" ref={rejectMenuRef}>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setRejectMenuOpen(v => !v)}
                                    disabled={acting !== null}
                                    aria-haspopup="menu"
                                    aria-expanded={rejectMenuOpen}
                                    title="Отклонить анкету"
                                >
                                    {isRejecting ? "…" : "Отклонить"}
                                    <Icon name="chevron-down"/>
                                </Button>
                                <div className="sp-reject-menu" role="menu" hidden={!rejectMenuOpen}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        role="menuitem"
                                        className="w-full justify-start"
                                        onClick={() => selectRejectReason("reject_no_education")}
                                    >
                                        Нет профильного образования
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        role="menuitem"
                                        className="w-full justify-start"
                                        onClick={() => selectRejectReason("reject_no_experience")}
                                    >
                                        Недостаточно опыта
                                    </Button>
                                </div>
                            </div>
                        )}
                        {canReject && status !== "PENDING" && (
                            <Button type="button" variant="destructive" onClick={() => onAct(sp.id, "reject")}
                                    disabled={acting !== null}>
                                {acting === sp.id + "reject" ? "…" : "Отклонить"}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={async () => {
                                if (!(await confirmDialog({
                                    title: isArchived ? "Восстановить специалиста из архива?" : "Перенести специалиста в архив?",
                                    variant: "destructive",
                                }))) return
                                onToggleArchive(sp.id, !isArchived)
                            }}
                            disabled={acting !== null}
                        >
                            {isArchived ? "Восстановить" : "В архив"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                if (!(await confirmDialog({
                                    title: "Отозвать все сессии этого специалиста?",
                                    description: "Он будет перенаправлен на вход.",
                                    variant: "destructive",
                                }))) return
                                onRevokeSession(sp.id)
                            }}
                            disabled={acting !== null}
                            title="Принудительно разлогинить специалиста"
                        >
                            <Icon name="log-out"/>Отозвать сессии
                        </Button>
                    </div>
                    <div className="sp-profile-stat">
                        <div className="sp-profile-stat__label">Онбординг:</div>
                        <div className="sp-profile-stat__value">{doneCount}/{ONBOARDING_STEPS_UI.length}</div>
                    </div>
                </div>
            </div>
            <div className="sp-detail-tabs">
                <Button
                    type="button"
                    size="sm"
                    variant={detailTab === "main" ? "secondary" : "ghost"}
                    aria-current={detailTab === "main" ? "page" : undefined}
                    onClick={() => setDetailTab("main")}
                >
                    Основной
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={detailTab === "contract" ? "secondary" : "ghost"}
                    aria-current={detailTab === "contract" ? "page" : undefined}
                    onClick={() => setDetailTab("contract")}
                    title="Договор с платформой"
                >
                    Договор
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={detailTab === "onboarding" ? "secondary" : "ghost"}
                    aria-current={detailTab === "onboarding" ? "page" : undefined}
                    onClick={() => setDetailTab("onboarding")}
                    title="Шаги онбординга"
                >
                    Онбординг
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={detailTab === "rating" ? "secondary" : "ghost"}
                    aria-current={detailTab === "rating" ? "page" : undefined}
                    onClick={() => setDetailTab("rating")}
                    title="Оценка и лендинг"
                >
                    Оценка
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={detailTab === "files" ? "secondary" : "ghost"}
                    aria-current={detailTab === "files" ? "page" : undefined}
                    onClick={() => setDetailTab("files")}
                >
                    Файлы
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={detailTab === "portfolio" ? "secondary" : "ghost"}
                    aria-current={detailTab === "portfolio" ? "page" : undefined}
                    onClick={() => setDetailTab("portfolio")}
                >
                    Портфолио
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={detailTab === "orders" ? "secondary" : "ghost"}
                    aria-current={detailTab === "orders" ? "page" : undefined}
                    onClick={() => setDetailTab("orders")}
                >
                    Заказы
                </Button>
            </div>
        </div>
    )
}
