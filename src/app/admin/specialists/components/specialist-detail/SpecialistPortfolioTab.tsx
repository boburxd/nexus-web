"use client"

import {SpecialistPortfolioTreeCard} from "./cards/SpecialistPortfolioTreeCard"

export function SpecialistPortfolioTab({specialistId}: { specialistId: string }) {
    return (
        <div style={{maxWidth: 920}}>
            <p style={{fontSize: "0.875rem", color: "var(--adm-muted)", margin: "0 0 16px", lineHeight: 1.5}}>
                Объекты (папки), работы и материалы так, как специалист собрал их в разделе «Сообщество». Только
                просмотр, без редактирования отсюда.
            </p>
            <SpecialistPortfolioTreeCard specialistId={specialistId}/>
        </div>
    )
}
