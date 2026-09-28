"use client"

import React from "react"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"
import {stripBx} from "@/lib/icon-map"

export type UploadItemStatus = "pending" | "uploading" | "done" | "error"

export type UploadItem = {
    id: string
    name: string
    /** Размер в байтах; null — когда он неизвестен (например, файл собран из data-url). */
    size?: number | null
    mimeType?: string | null
    /** 0–100. null — прогресс неизвестен, рисуем бегущую полосу. */
    progress?: number | null
    status: UploadItemStatus
    error?: string | null
    /** Превью-картинка (blob: или data:) для изображений. */
    previewUrl?: string | null
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} Б`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} ГБ`
}

function kindOf(item: UploadItem): "image" | "video" | "archive" | "doc" {
    const mime = item.mimeType ?? ""
    if (mime.startsWith("image/")) return "image"
    if (mime.startsWith("video/")) return "video"
    const ext = item.name.split(".").pop()?.toLowerCase() ?? ""
    if (["jpg", "jpeg", "png", "webp", "avif", "gif", "heic"].includes(ext)) return "image"
    if (["mp4", "webm", "mov", "m4v"].includes(ext)) return "video"
    if (["zip", "rar", "7z"].includes(ext)) return "archive"
    return "doc"
}

const ICON: Record<ReturnType<typeof kindOf>, string> = {
    image: "bx-image",
    video: "bx-movie-play",
    archive: "bx-archive",
    doc: "bx-file",
}

const STATUS_LABEL: Record<UploadItemStatus, string> = {
    pending: "В очереди",
    uploading: "Загружается",
    done: "Загружен",
    error: "Ошибка",
}

/** Одна карточка загрузки: превью/иконка, имя, размер, полоса прогресса, статус. */
export function UploadingCard({item, onRemove}: { item: UploadItem; onRemove?: (id: string) => void }) {
    const kind = kindOf(item)
    const isUploading = item.status === "uploading" || item.status === "pending"
    const indeterminate = isUploading && (item.progress == null)
    const percent = Math.max(0, Math.min(100, item.progress ?? 0))

    return (
        <div className={`upload-card upload-card--${item.status}`}>
            <div className="upload-card__thumb">
                {item.previewUrl && kind === "image"
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={item.previewUrl} alt="" className="upload-card__thumb-img"/>
                    : <Icon name={stripBx(ICON[kind])}/>}
                {isUploading && <span className="upload-card__thumb-veil"><Icon name="loader-alt" className="bx-spin"/></span>}
            </div>

            <div className="upload-card__body">
                <div className="upload-card__name" title={item.name}>{item.name}</div>
                <div className="upload-card__meta">
                    {typeof item.size === "number" && <span>{formatFileSize(item.size)}</span>}
                    {typeof item.size === "number" && <span className="upload-card__dot">·</span>}
                    <span className={`upload-card__status upload-card__status--${item.status}`}>
                        {item.status === "error" ? (item.error ?? STATUS_LABEL.error) : STATUS_LABEL[item.status]}
                    </span>
                </div>
                {item.status !== "error" && (
                    <div className="upload-card__track">
                        <div
                            className={`upload-card__bar ${indeterminate ? "upload-card__bar--indeterminate" : ""}`}
                            style={indeterminate ? undefined : {width: `${item.status === "done" ? 100 : percent}%`}}
                        />
                    </div>
                )}
            </div>

            <div className="upload-card__tail">
                {item.status === "done" && <Icon name="check-circle" className="upload-card__ok"/>}
                {item.status === "error" && <Icon name="error-circle" className="upload-card__fail"/>}
                {isUploading && !indeterminate && <span className="upload-card__pct">{percent}%</span>}
                {onRemove && item.status !== "uploading" && (
                    <Button type="button" variant="ghost" size="icon-xs" onClick={() => onRemove(item.id)}
                            aria-label="Убрать из списка">
                        <Icon name="x"/>
                    </Button>
                )}
            </div>
        </div>
    )
}

/** Список карточек + стили. Рендерит null, когда грузить нечего. */
export function UploadingCards({items, title, onRemove, className}: {
    items: UploadItem[]
    title?: string
    onRemove?: (id: string) => void
    className?: string
}) {
    if (items.length === 0) return null
    const active = items.filter((i) => i.status === "uploading" || i.status === "pending").length

    return (
        <div className={`upload-cards ${className ?? ""}`}>
            <UploadingCardStyles/>
            {title && (
                <div className="upload-cards__head">
                    <span>{title}</span>
                    {active > 0 && <span className="upload-cards__count">{active} в работе</span>}
                </div>
            )}
            {items.map((item) => <UploadingCard key={item.id} item={item} onRemove={onRemove}/>)}
        </div>
    )
}

export function UploadingCardStyles() {
    return (
        <style>{`
      .upload-cards { display: flex; flex-direction: column; gap: 8px; }
      .upload-cards__head {
        display: flex; align-items: center; justify-content: space-between;
        font-size: 0.75rem;
        color: var(--dash-muted, var(--muted-foreground)); font-weight: 600;
      }
      .upload-cards__count { font-weight: 500; opacity: 0.85; }

      .upload-card {
        display: flex; align-items: center; gap: 10px;
        padding: 8px 10px; border-radius: 10px;
        border: 0;
        background: var(--dash-surface2, rgba(127,127,127,0.06));
      }
      .upload-card--error { background: var(--dash-danger-bg, color-mix(in oklab, var(--destructive) 8%, transparent)); }
      .upload-card--done { background: var(--dash-success-bg, color-mix(in oklab, var(--success) 10%, transparent)); }

      .upload-card__thumb {
        position: relative; flex: 0 0 auto;
        width: 40px; height: 40px; border-radius: 8px; overflow: hidden;
        display: flex; align-items: center; justify-content: center;
        background: rgba(127,127,127,0.16); color: var(--dash-muted, var(--muted-foreground)); font-size: 1.125rem;
      }
      .upload-card__thumb-img { width: 100%; height: 100%; object-fit: cover; }
      .upload-card__thumb-veil {
        position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.42); color: #fff; font-size: 1rem;
      }

      .upload-card__body { flex: 1 1 auto; min-width: 0; }
      .upload-card__name {
        font-size: 0.875rem; font-weight: 500; color: var(--dash-text, inherit);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .upload-card__meta {
        display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
        margin-top: 2px; font-size: 0.75rem; color: var(--dash-muted, var(--muted-foreground));
      }
      .upload-card__dot { opacity: 0.5; }
      .upload-card__status--uploading, .upload-card__status--pending { color: var(--dash-accent, var(--primary)); }
      .upload-card__status--done { color: var(--dash-success, var(--success)); }
      .upload-card__status--error { color: var(--dash-danger, var(--destructive)); }

      .upload-card__track {
        margin-top: 6px; height: 4px; border-radius: 4px; overflow: hidden;
        background: rgba(127,127,127,0.22);
      }
      .upload-card__bar {
        height: 100%; border-radius: 4px;
        background: var(--dash-accent, var(--primary));
      }
      .upload-card--done .upload-card__bar { background: var(--dash-success, var(--success)); }
      .upload-card__bar--indeterminate { width: 40%; animation: upload-card-slide 1.1s ease-in-out infinite; }
      @keyframes upload-card-slide {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(250%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .upload-card__bar--indeterminate { animation: none; }
      }

      .upload-card__tail { flex: 0 0 auto; display: flex; align-items: center; gap: 6px; font-size: 0.75rem; }
      .upload-card__pct { color: var(--dash-muted, var(--muted-foreground)); font-variant-numeric: tabular-nums; min-width: 34px; text-align: right; }
      .upload-card__ok { color: var(--dash-success, var(--success)); font-size: 1.125rem; }
      .upload-card__fail { color: var(--dash-danger, var(--destructive)); font-size: 1.125rem; }
    `}</style>
    )
}
