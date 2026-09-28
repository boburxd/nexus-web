import {OrderStage, STAGE_LABEL, STAGE_ORDER, STAGE_STATUS} from "./types"

export function StagePipelineView({stages}: { stages: OrderStage[] }) {
    return (
        <div style={{display: "flex", gap: "0.75rem", flexWrap: "wrap"}}>
            {STAGE_ORDER.map((type, i) => {
                const stage = stages.find(s => s.type === type)
                if (!stage) return null
                const st = STAGE_STATUS[stage.status]
                const isDone = stage.status === "APPROVED"
                const isActive = stage.status !== "PENDING" && stage.status !== "APPROVED"
                return (
                    <div key={type} style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                        <div style={{
                            padding: "6px 14px",
                            borderRadius: 14,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            background: isDone ? "var(--dash-success-bg)" : isActive ? "var(--dash-warn-bg)" : "var(--dash-surface2)",
                            color: isDone ? "var(--dash-success)" : isActive ? "var(--dash-warn)" : "var(--dash-muted)",
                        }}>
                            <span style={{marginRight: "6px"}}>{i + 1}.</span>
                            {STAGE_LABEL[type]}
                            <span style={{marginLeft: "6px", fontSize: "0.75rem", opacity: 0.75}}>({st.label})</span>
                        </div>
                        {i < STAGE_ORDER.length - 1 &&
                            <span style={{color: "var(--dash-muted)", fontSize: "0.75rem"}}>→</span>}
                    </div>
                )
            })}
        </div>
    )
}
