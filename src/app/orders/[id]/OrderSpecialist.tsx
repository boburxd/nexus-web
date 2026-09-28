"use client"

import {useState} from "react"
import {DesignerProfileModal} from "@/components/landing/designer-profile-modal/DesignerProfileModal"
import type {OrderData} from "./types"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"

export function OrderSpecialist({specialist}: {
    specialist: NonNullable<OrderData["specialist"]>
}) {
    const [showProfile, setShowProfile] = useState(false)
    const displayName = specialist.name ?? "Дизайнер"
    return (
        <>
        <div style={{
            background: "var(--dash-surface)",
            borderRadius: 14,
            padding: "1.25rem 1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "1rem"
        }}>
            {specialist.avatarUrl ? (
                <img src={specialist.avatarUrl} alt=""
                     style={{width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0}}/>
            ) : (
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "var(--dash-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    color: "var(--dash-bg)",
                    flexShrink: 0
                }}>
                    {displayName[0].toUpperCase()}
                </div>
            )}
            <div style={{flex: 1}}>
                <p style={{fontSize: "0.75rem", color: "var(--dash-muted)", margin: "0 0 2px"}}>Ваш дизайнер</p>
                <p style={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "var(--dash-text)",
                    margin: 0
                }}>{displayName}</p>
            </div>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 8,
                background: "var(--dash-success-bg)",
                color: "var(--dash-success)",
                fontSize: "0.75rem",
                fontWeight: 500
            }}>
                <Icon name="check-circle"/>Назначен
            </div>
            {specialist.profile && (
                <>
                    <div style={{
                        width: "100%",
                        paddingTop: 12,
                        borderTop: "1px solid var(--dash-border)",
                        display: "grid",
                        gap: 8,
                    }}>
                        {(specialist.profile.levelTitle || specialist.profile.specialty) && (
                            <p style={{margin: 0, color: "var(--dash-text2)", fontSize: "0.75rem", lineHeight: 1.45}}>
                                {[specialist.profile.levelTitle, specialist.profile.specialty].filter(Boolean).join(" · ")}
                            </p>
                        )}
                        <div style={{display: "flex", flexWrap: "wrap", gap: "6px 14px"}}>
                            <span style={{fontSize: "0.75rem", color: "var(--dash-muted)"}}>
                                <Icon name="briefcase" style={{marginRight: 4}}/>
                                {specialist.profile.experience} лет опыта
                            </span>
                            <span style={{fontSize: "0.75rem", color: "var(--dash-muted)"}}>
                                <Icon name="area" style={{marginRight: 4}}/>
                                {specialist.profile.sqm} м² реализовано
                            </span>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowProfile(true)}
                        className="w-full"
                    >
                        Профиль и портфолио
                    </Button>
                </>
            )}
        </div>
        {showProfile && specialist.profile && (
            <DesignerProfileModal designer={specialist.profile} onClose={() => setShowProfile(false)}/>
        )}
        </>
    )
}
