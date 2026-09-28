"use client"

import type {CSSProperties, ReactNode} from "react"

export function DashProjectCard({
                                    hue,
                                    watermark,
                                    title,
                                    label,
                                    subtitle,
                                    className = "",
                                    onClick,
                                    topLeftContent,
                                    children,
                                }: {
    hue: number
    watermark: string
    title: string
    /** Доступное имя кнопки-карточки, если `title` пустой (заголовок выводится в children). */
    label?: string
    subtitle?: ReactNode
    className?: string
    onClick?: () => void
    topLeftContent?: ReactNode
    children?: ReactNode
}) {
    const cls = className ? `dash-card dash-project-card ${className}` : "dash-card dash-project-card"
    return (
        <li
            className={cls}
            style={{"--hue": hue, cursor: onClick ? "pointer" : undefined} as CSSProperties}
        >
            {onClick ? (
                <button
                    type="button"
                    className="dash-card__hit"
                    aria-label={label || title || watermark}
                    onClick={onClick}
                />
            ) : null}
            <div className="dash-card__img">{watermark}</div>
            <div className="dash-card__img-overlay"/>
            {topLeftContent ? <div className="dash-card__top-left">{topLeftContent}</div> : null}
            <div className="dash-card__body">
                <h3 className="dash-card__heading">{title}</h3>
                {subtitle ? <p className="dash-card__sub">{subtitle}</p> : null}
                {children}
            </div>
        </li>
    )
}
