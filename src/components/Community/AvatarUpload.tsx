"use client"
import {useCallback, useEffect, useRef, useState} from "react"
import {createPortal} from "react-dom"
import ReactCrop, {centerCrop, Crop, makeAspectCrop, PixelCrop} from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import AiImageStudio, {type AiImageResult} from "@/components/app/AiImageStudio"
import {UploadingCards, type UploadItem} from "@/components/app/UploadingCard"
import {uploadJsonWithProgress} from "@/lib/upload-progress"
import {AiIcon} from "@/components/app/AiIcon"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"
import {stripBx} from "@/lib/icon-map"

interface AvatarUploadProps {
    initials: string
    currentUrl?: string | null
    onUploaded?: (url: string) => void
    heroMode?: boolean
    /** id скрытого input — чтобы открыть выбор фото из другого места страницы через <label htmlFor>. */
    inputId?: string
}

function centerAspectCrop(w: number, h: number): Crop {
    return centerCrop(makeAspectCrop({unit: "%", width: 90}, 1, w, h), w, h)
}

const AVATAR_SIZE = 256

async function getCroppedBlob(img: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
    const canvas = document.createElement("canvas")
    const size = AVATAR_SIZE
    canvas.width = size;
    canvas.height = size
    const ctx = canvas.getContext("2d")!
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height
    ctx.drawImage(img, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, size, size)
    return new Promise(res => canvas.toBlob(b => res(b!), "image/jpeg", 0.9))
}

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error("Не удалось прочитать изображение"))
        reader.readAsDataURL(blob)
    })
}

export default function AvatarUpload({initials, currentUrl, onUploaded, heroMode, inputId}: AvatarUploadProps) {
    const [srcUrl, setSrcUrl] = useState<string | null>(null)
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(currentUrl ?? null)
    const [mounted, setMounted] = useState(false)
    // Диалог с ИИ: кадр уходит в студию, оттуда возвращается готовая картинка.
    const [studioSource, setStudioSource] = useState<string | null>(null)
    const [aiResult, setAiResult] = useState<AiImageResult | null>(null)
    const [aiError, setAiError] = useState<string | null>(null)
    const [uploadItem, setUploadItem] = useState<UploadItem | null>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Кроппер всегда работает по актуальной картинке: исходной или, если выбран вариант ИИ, по нему —
    // так пользователь кадрирует результат ИИ так же, как обычное загруженное фото.
    const cropSrc = aiResult ? aiResult.dataUrl : srcUrl

    useEffect(() => {
        setMounted(true)
    }, [])

    const resetAi = useCallback(() => {
        setStudioSource(null)
        setAiResult(null)
        setAiError(null)
    }, [])

    /** Сбрасывает выделение кроппера — вызывается при смене картинки под ним (исходник ↔ вариант ИИ). */
    const resetCropSelection = () => {
        setCrop(undefined)
        setCompletedCrop(undefined)
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        resetAi()
        const reader = new FileReader()
        reader.onload = () => setSrcUrl(reader.result as string)
        reader.readAsDataURL(file)
    }

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const {width, height} = e.currentTarget
        setCrop(centerAspectCrop(width, height))
    }, [])

    /** Открывает диалог с ИИ по текущему кадру кроппера. */
    const openStudio = async () => {
        if (!imgRef.current || !completedCrop) return
        setAiError(null)
        try {
            const blob = await getCroppedBlob(imgRef.current, completedCrop)
            setStudioSource(await blobToDataUrl(blob))
        } catch (e) {
            setAiError(e instanceof Error ? e.message : "Не удалось подготовить кадр")
        }
    }

    const handleApply = async () => {
        if (!imgRef.current || !completedCrop) return
        setUploading(true)
        setAiError(null)
        const filename = "avatar.jpg"
        try {
            const blob = await getCroppedBlob(imgRef.current, completedCrop)

            setUploadItem({
                id: "avatar",
                name: filename,
                size: blob.size,
                mimeType: "image/jpeg",
                progress: 0,
                status: "uploading",
                previewUrl: URL.createObjectURL(blob),
            })

            // Получаем presigned URL
            const res = await fetch("/api/files", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    filename,
                    mimeType: "image/jpeg",
                    size: blob.size,
                    category: "AVATAR",
                    title: "avatar"
                }),
            })
            if (!res.ok) throw new Error((await res.json()).error)
            const {file} = await res.json()

            // Загружаем через backend, чтобы не зависеть от CORS браузера на S3
            await uploadJsonWithProgress(`/api/files/${file.id}/upload`, blob, {
                headers: {"Content-Type": "image/jpeg"},
                fallbackError: "Не удалось загрузить аватар",
                onProgress: ({percent}) =>
                    setUploadItem((prev) => (prev ? {...prev, progress: percent} : prev)),
            })
            setUploadItem((prev) => (prev ? {...prev, progress: 100, status: "done"} : prev))

            // Получаем URL для отображения
            const urlRes = await fetch(`/api/files/${file.id}/url`)
            const {url} = await urlRes.json()

            setAvatarUrl(url)
            onUploaded?.(url)
            setSrcUrl(null)
            resetAi()
            setUploadItem(null)
            if (inputRef.current) inputRef.current.value = ""
        } catch (e) {
            const message = e instanceof Error ? e.message : "Не удалось загрузить аватар"
            setAiError(message)
            setUploadItem((prev) => (prev ? {...prev, status: "error", error: message} : prev))
        } finally {
            setUploading(false)
        }
    }

    /** Кнопка запуска диалога с ИИ — в подвале диалога, сразу после «Применить». */
    const renderAiButton = (variant: "modal" | "inline") => {
        const disabled = uploading || !completedCrop
        return (
            <Button
                type="button"
                variant="outline"
                size={variant === "modal" ? "lg" : "sm"}
                onClick={() => void openStudio()}
                disabled={disabled}
            >
                <AiIcon/>
                {aiResult ? "Изменить запрос к ИИ" : "Редактировать с ИИ"}
            </Button>
        )
    }

    /** Состояние работы с ИИ в теле диалога: выбранный результат, подсказка, ошибка, загрузка. */
    const renderAiBlock = (variant: "modal" | "inline") => {
        const muted = variant === "modal" ? "rgba(255,255,255,0.55)" : "var(--bs-secondary-color, var(--muted-foreground))"
        if (!aiResult && completedCrop && !aiError && !uploadItem) return null

        return (
            <div style={{marginTop: 12}}>
                <div style={{display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap"}}>
                    {aiResult && (
                        <div style={{display: "flex", alignItems: "center", gap: 8}}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={aiResult.dataUrl} alt="Результат ИИ" style={{
                                width: 44, height: 44, borderRadius: 8, objectFit: "cover",
                                border: "2px solid var(--dash-accent, var(--primary))",
                            }}/>
                            <span style={{fontSize: "0.75rem", color: muted}}>Выбран результат ИИ</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => {
                                    setAiResult(null)
                                    resetCropSelection()
                                }}
                                title="Вернуть исходный кадр"
                                aria-label="Вернуть исходный кадр"
                            >
                                <Icon name="x"/>
                            </Button>
                        </div>
                    )}
                </div>

                {!completedCrop && (
                    <p style={{margin: "6px 0 0", fontSize: "0.75rem", color: muted}}>
                        Сначала выделите область кадра.
                    </p>
                )}

                {aiError && (
                    <div style={{
                        marginTop: 8,
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: "var(--dash-danger-bg, color-mix(in oklab, var(--destructive) 10%, transparent))",
                        color: "var(--dash-danger, var(--destructive))",
                        fontSize: "0.75rem",
                        lineHeight: 1.45,
                    }}>
                        {aiError}
                    </div>
                )}

                {uploadItem && (
                    <div style={{marginTop: 10}}>
                        <UploadingCards items={[uploadItem]} title="Загрузка аватара"/>
                    </div>
                )}
            </div>
        )
    }

    /** Диалог с ИИ — общий для hero- и инлайн-режима. */
    const studio = studioSource && (
        <AiImageStudio
            open
            source={{dataUrl: studioSource, previewUrl: studioSource}}
            context="avatar"
            title="Аватар с ИИ"
            applyLabel="Выбрать этот вариант"
            onApply={(result) => {
                setAiResult(result)
                setStudioSource(null)
                resetCropSelection()
            }}
            onClose={() => setStudioSource(null)}
        />
    )

    // ── Hero mode: кликабельный аватар в шапке col-1 ─────────────
    if (heroMode) {
        return (
            <>
                <div
                    className="dash-col1-avatar dash-avatar-btn"
                    role="button"
                    tabIndex={0}
                    aria-label="Сменить фото профиля"
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            inputRef.current?.click()
                        }
                    }}
                    title="Сменить фото профиля"
                >
                    {avatarUrl
                        ? <img src={avatarUrl} alt="avatar" className="dash-avatar-btn__img"/>
                        : <span className="dash-avatar-btn__initials">{initials}</span>
                    }
                    <div className="dash-avatar-btn__overlay">
                        <Icon name="pencil"/>
                    </div>
                </div>
                <input
                    ref={inputRef}
                    id={inputId}
                    type="file"
                    accept="image/jpeg,image/png"
                    style={{display: "none"}}
                    onChange={onFileChange}
                />

                {/* Кроппер — модальное окно */}
                {mounted && srcUrl && createPortal(
                    <div className="dash-crop-backdrop" onClick={() => setSrcUrl(null)} role="presentation">
                        <div className="dash-crop-panel" onClick={e => e.stopPropagation()} role="dialog"
                             aria-modal="true">
                            <div className="dash-crop-panel__hd">
                                <span>Обрезать фото</span>
                                <Button variant="ghost" size="icon-sm" className="dash-crop-panel__close"
                                        onClick={() => setSrcUrl(null)} aria-label="Закрыть">
                                    <Icon name="x"/>
                                </Button>
                            </div>
                            <div className="dash-crop-panel__body">
                                <ReactCrop
                                    crop={crop}
                                    onChange={c => setCrop(c)}
                                    onComplete={c => setCompletedCrop(c)}
                                    aspect={1}
                                    circularCrop
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img key={cropSrc} ref={imgRef} src={cropSrc ?? undefined} alt="crop" onLoad={onImageLoad}
                                         style={{maxWidth: "100%"}}/>
                                </ReactCrop>
                                {renderAiBlock("modal")}
                            </div>
                            <div className="dash-crop-panel__ft">
                                <Button
                                    className="dash-crop-panel__apply"
                                    onClick={handleApply}
                                    disabled={uploading || !completedCrop}
                                >
                                    <Icon name={stripBx(uploading ? "bx-loader-alt bx-spin" : "bx-check")}/>
                                    {uploading ? "Загрузка…" : aiResult ? "Применить вариант ИИ" : "Применить"}
                                </Button>
                                {renderAiButton("modal")}
                                <Button variant="ghost" className="dash-crop-panel__cancel" onClick={() => setSrcUrl(null)}>
                                    Отмена
                                </Button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
                {studio}
            </>
        )
    }

    return (
        <div>
            {/* Текущий аватар */}
            <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{
                    width: 80, height: 80, borderRadius: 14, overflow: "hidden", flexShrink: 0,
                    background: "var(--dash-accent-bg, color-mix(in oklab, var(--primary) 12%, transparent))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    {avatarUrl
                        ?
                        <img src={avatarUrl} alt="avatar" style={{width: "100%", height: "100%", objectFit: "cover"}}/>
                        : <span style={{fontSize: "1.5rem", fontWeight: 700, color: "var(--dash-accent, var(--primary))"}}>{initials}</span>}
                </div>
                <div>
                    <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                        <Icon name="upload"/>Выбрать фото
                    </Button>
                    <p className="text-muted small mb-0 mt-1">JPG, PNG · до 10 МБ</p>
                </div>
                <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="d-none"
                       onChange={onFileChange}/>
            </div>

            {/* Кроппер */}
            {srcUrl && (
                <div style={{
                    background: "rgba(0,0,0,0.03)", borderRadius: 14, padding: 16,
                }}>
                    <p className="small text-muted mb-2">Выделите область для аватара:</p>
                    <div style={{maxWidth: 360}}>
                        <ReactCrop
                            crop={crop}
                            onChange={c => setCrop(c)}
                            onComplete={c => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img key={cropSrc} ref={imgRef} src={cropSrc ?? undefined} alt="crop" onLoad={onImageLoad} style={{maxWidth: "100%"}}/>
                        </ReactCrop>
                    </div>
                    {renderAiBlock("inline")}
                    <div className="d-flex gap-2 mt-3">
                        <Button size="sm" onClick={handleApply} disabled={uploading || !completedCrop}>
                            <Icon name={stripBx(uploading ? "bx-loader-alt bx-spin" : "bx-check")}/>
                            {uploading ? "Загрузка…" : aiResult ? "Применить вариант ИИ" : "Применить"}
                        </Button>
                        {renderAiButton("inline")}
                        <Button variant="outline" size="sm" onClick={() => setSrcUrl(null)}>
                            Отмена
                        </Button>
                    </div>
                </div>
            )}
            {studio}
        </div>
    )
}
