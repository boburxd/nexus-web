"use client"

import type {Designer} from "./types"

interface ProfileHeaderProps {
    designer: Designer
    compact?: boolean
}

export function ProfileHeader({designer: d, compact}: ProfileHeaderProps) {
    const avatarSize = compact ? 56 : 72
    const nameSize = compact ? "1.05rem" : "1.3rem"
    const specSize = compact ? "0.8rem" : "0.82rem"

    return (
        <div style={{
            display: "flex",
            alignItems: compact ? "center" : "flex-end",
            gap: compact ? 14 : 16,
            marginBottom: compact ? 20 : 0
        }}>
            {d.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    src={d.avatar}
                    alt={d.name}
                    style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: "50%",
                    border: compact ? "2px solid rgba(255,255,255,0.35)" : "3px solid rgba(255,255,255,0.5)",
                    objectFit: "cover",
                    flexShrink: 0,
                    }}
                />
            ) : (
                <div
                    aria-hidden
                    style={{
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: "50%",
                        background: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--primary-foreground)",
                        fontSize: compact ? "1.1rem" : "1.35rem",
                        fontWeight: 700,
                        flexShrink: 0,
                    }}
                >
                    {d.name.trim().charAt(0).toUpperCase() || "Д"}
                </div>
            )}
            <div style={{minWidth: 0}}>
                <h2
                    style={{
                        color: "#fff",
                        fontSize: nameSize,
                        fontWeight: 700,
                        margin: "0 0 2px",
                        fontFamily: "'PP Neue Montreal', Inter, sans-serif",
                    }}
                >
                    {d.name}
                </h2>
                <p style={{color: "rgba(255,255,255,0.6)", fontSize: specSize, margin: 0}}>
                    {d.levelTitle && (
                        <span
                            style={{
                                display: "inline-block",
                                marginRight: 8,
                                padding: "2px 8px",
                                borderRadius: 10,
                                background: d.level === "L4"
                                    ? "color-mix(in oklab, var(--warning) 18%, transparent)"
                                    : "rgba(255,255,255,0.12)",
                                color: d.level === "L4" ? "var(--warning)" : "rgba(255,255,255,0.85)",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                verticalAlign: "middle",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {d.levelTitle}
                        </span>
                    )}
                    {d.specialty}
                </p>
            </div>
        </div>
    )
}
