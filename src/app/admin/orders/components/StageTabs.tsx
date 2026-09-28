"use client"

import type {Stage} from "../types"
import {STAGE_LABEL} from "../types"
import {Button} from "@/components/ui/button"

export function StageTabs({
                              orderedStages,
                              activeStageId,
                              onSelectStage,
                          }: {
    orderedStages: Stage[]
    activeStageId: string
    onSelectStage: (stageId: string) => void
}) {
    return (
        <div
            style={{
                padding: "10px 12px",
                borderBottom: "1px solid var(--adm-sidebar-border)",
                background: "var(--adm-outer)",
                overflowX: "auto",
            }}
        >
            <div style={{display: "flex", gap: 6, flexWrap: "nowrap", minWidth: "max-content"}}>
                {orderedStages.map((s) => {
                    const isOn = s.id === activeStageId
                    const hasMod = s.status === "MOD_REVIEW"
                    const actNeedsAdmin = s.act?.status === "SPECIALIST_UPLOADED" || s.act?.status === "CLIENT_SIGNED"
                    return (
                        <Button
                            key={`tab-${s.id}`}
                            type="button"
                            size="sm"
                            variant={isOn ? "default" : "outline"}
                            aria-pressed={isOn}
                            onClick={() => onSelectStage(s.id)}
                        >
                            {STAGE_LABEL[s.type]}
                            {hasMod ? <span className="sp-badge sp-badge--danger"
                                            style={{fontSize: "0.75rem"}}>!</span> : null}
                            {!hasMod && actNeedsAdmin ? (
                                <span className="sp-badge sp-badge--warn" style={{fontSize: "0.75rem"}}
                                      title="Акт ждёт действия">
                  акт
                </span>
                            ) : null}
                        </Button>
                    )
                })}
            </div>
        </div>
    )
}

