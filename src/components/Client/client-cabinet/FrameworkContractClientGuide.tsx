"use client"

import type {CSSProperties} from "react"
import {
    FRAMEWORK_CONTRACT_CLIENT_GUIDE,
    FRAMEWORK_CONTRACT_SIGNED_CLIENT_SUMMARY,
    isFrameworkContractEffectiveSigned,
} from "@/lib/framework-contract"

const blockTitleStyle: CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "var(--dash-accent)",
    margin: 0,
}

const blockBodyStyle: CSSProperties = {
    margin: "6px 0 0",
    fontSize: "0.875rem",
    lineHeight: 1.55,
    color: "var(--dash-text2)",
}

export function FrameworkContractClientGuide({
                                                 compact,
                                                 showIntro = true,
                                                 contractStatus,
                                             }: {
    /** Узкая колонка на /orders/new */
    compact?: boolean
    showIntro?: boolean
    /** Если подпись уже учтена — короткое резюме вместо трёх блоков. */
    contractStatus?: string | null
}) {
    if (contractStatus != null && isFrameworkContractEffectiveSigned(contractStatus)) {
        return (
            <p
                style={{
                    margin: "0 0 " + (compact ? 12 : 16) + "px",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                    color: "var(--dash-text2)",
                }}
            >
                {FRAMEWORK_CONTRACT_SIGNED_CLIENT_SUMMARY}
            </p>
        )
    }

    const gap = compact ? 14 : 20
    return (
        <div
            style={{
                marginBottom: compact ? 4 : 8,
                padding: compact ? "0 0 4px" : "0 0 8px",
                borderBottom: compact ? "none" : "1px solid var(--dash-border)",
            }}
        >
            {showIntro ? (
                <p
                    style={{
                        margin: "0 0 " + (compact ? 14 : 20) + "px",
                        fontSize: "0.875rem",
                        lineHeight: 1.55,
                        color: "var(--dash-text)",
                        fontWeight: 500,
                    }}
                >
                    {FRAMEWORK_CONTRACT_CLIENT_GUIDE.intro}
                </p>
            ) : null}
            <ul style={{margin: 0, padding: 0, listStyle: "none"}}>
                {FRAMEWORK_CONTRACT_CLIENT_GUIDE.blocks.map(b => (
                    <li key={b.title} style={{marginBottom: gap}}>
                        <h4 style={blockTitleStyle}>{b.title}</h4>
                        <p style={blockBodyStyle}>{b.body}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}
