"use client"
import {useCallback, useEffect, useRef, useState} from "react"
import {createPortal} from "react-dom"
import {ActionButton, AppModal, SectionLabel} from "@/components/app/AppCard"
import {DashCarousel} from "@/components/dashboard-ui/DashCarousel"
import {ConfirmDialog} from "./ConfirmDialog"
import {UploadingCards, type UploadItem} from "@/components/app/UploadingCard"
import {uploadWithProgress} from "@/lib/upload-progress"
import {AiIcon} from "@/components/app/AiIcon"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {stripBx} from "@/lib/icon-map"

const DESC_MAX = 500

// ─── Утилита: извлечь готовое описание из блока ---\n...\n--- ───────────────
function extractReady(text: string): string | null {
    const m = text.match(/---\n([\s\S]+?)\n---/)
    return m ? m[1].trim() : null
}

// ─── Чат-дравер AI ────────────────────────────────────────────────────────────
interface ChatMessage {
    role: "user" | "assistant";
    content: string
}

function AiChatDrawer({
                          open, onClose, title, currentDescription, onApply,
                      }: {
    open: boolean
    onClose: () => void
    title: string
    currentDescription: string
    onApply: (text: string) => void
}) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Открываем → сразу получаем первое сообщение AI
    useEffect(() => {
        if (!open) return
        setMessages([])
        setInput("")
        setError(null)
        sendToAI([])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messages, loading])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        if (open) window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open, onClose])

    const sendToAI = async (msgs: ChatMessage[]) => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/ai/portfolio-chat", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({messages: msgs, title, currentDescription}),
            })
            const json = await res.json()
            if (json.error) throw new Error(json.error)
            setMessages(prev => [...prev, {role: "assistant", content: json.reply}])
        } catch {
            setError("AI временно недоступен")
        } finally {
            setLoading(false)
        }
    }

    const send = () => {
        const text = input.trim()
        if (!text || loading) return
        const next: ChatMessage[] = [...messages, {role: "user", content: text}]
        setMessages(next)
        setInput("")
        sendToAI(next)
    }

    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])
    if (!mounted) return null

    return createPortal(
        <div style={{
            position: "fixed",
            inset: 0,
            overflow: "hidden",
            pointerEvents: open ? "auto" : "none",
            zIndex: 50
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                role="presentation"
                style={{
                    position: "absolute", inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    opacity: open ? 1 : 0, transition: "opacity 0.3s ease",
                }}
            />

            {/* Панель */}
            <div role="dialog" aria-modal="true" aria-label="AI-помощник" style={{
                position: "absolute", top: 0, right: 0, bottom: 0,
                width: "min(420px, 94vw)",
                background: "var(--dash-surface, var(--card))",
                display: "flex", flexDirection: "column",
                transform: open ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                fontFamily: "'PP Neue Montreal', 'Inter', Arial, sans-serif",
            }}>

                {/* Шапка */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 24px",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    flexShrink: 0
                }}>
                    <div style={{display: "flex", alignItems: "center", gap: "0.5em"}}>
                        <AiIcon size="1rem"/>
                        <span style={{color: "var(--dash-text, var(--foreground))", fontSize: "0.875rem", fontWeight: 500}}>AI-помощник</span>
                        <span style={{
                            background: "var(--dash-accent-bg, var(--muted))",
                            borderRadius: 10,
                            color: "var(--dash-muted, var(--muted-foreground))",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            padding: "2px 10px",
                        }}>
              описание
            </span>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Закрыть">
                        <Icon name="x"/>
                    </Button>
                </div>

                {/* Сообщения */}
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "16px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                }}>
                    {messages.map((m, i) => {
                        const isUser = m.role === "user"
                        const ready = !isUser ? extractReady(m.content) : null
                        // Текст без блока ---...---
                        const displayText = m.content.replace(/---\n[\s\S]+?\n---/, "").trim()

                        return (
                            <div key={i} style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: isUser ? "flex-end" : "flex-start",
                                gap: 4
                            }}>
                                <div style={{
                                    background: isUser ? "var(--dash-accent-bg, var(--muted))" : "rgba(255,255,255,0.05)",
                                    borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                                    color: isUser ? "rgba(255,255,255,0.85)" : "var(--dash-text, var(--foreground))",
                                    fontSize: "0.875rem",
                                    lineHeight: 1.55,
                                    maxWidth: "88%",
                                    padding: "10px 14px",
                                    whiteSpace: "pre-wrap",
                                }}>
                                    {displayText}
                                </div>

                                {/* Готовое описание */}
                                {ready && (
                                    <div style={{maxWidth: "88%", width: "100%"}}>
                                        <div style={{
                                            background: "var(--dash-success-bg, color-mix(in oklab, var(--success) 10%, transparent))",
                                            borderRadius: 8,
                                            padding: "10px 14px",
                                            marginBottom: 6
                                        }}>
                                            <div style={{
                                                color: "var(--dash-success, var(--success))",
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                marginBottom: 6
                                            }}>Готовое описание
                                            </div>
                                            <p style={{
                                                color: "var(--dash-text, var(--foreground))",
                                                fontSize: "0.875rem",
                                                lineHeight: 1.5,
                                                margin: 0,
                                                whiteSpace: "pre-wrap"
                                            }}>{ready}</p>
                                            <div style={{
                                                color: "rgba(255,255,255,0.25)",
                                                fontSize: "0.75rem",
                                                marginTop: 6
                                            }}>{ready.length} / 500 символов
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                onApply(ready.slice(0, DESC_MAX));
                                                onClose()
                                            }}
                                        >
                                            Применить →
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {loading && (
                        <div style={{display: "flex", padding: "8px 0", color: "rgba(255,255,255,0.3)"}}>
                            <Icon name="loader-alt" className="bx-spin" aria-label="AI печатает"/>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            background: "var(--dash-danger-bg, color-mix(in oklab, var(--destructive) 10%, transparent))",
                            borderRadius: 8,
                            color: "var(--dash-danger, var(--destructive))",
                            fontSize: "0.875rem",
                            padding: "10px 14px"
                        }}>
                            {error}
                        </div>
                    )}

                    <div ref={bottomRef}/>
                </div>

                {/* Ввод */}
                <div style={{borderTop: "1px solid rgba(255,255,255,0.07)", padding: "14px 24px", flexShrink: 0}}>
                    <div style={{display: "flex", gap: "0.5rem", alignItems: "flex-end"}}>
            <Textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send()
                    }
                }}
                placeholder="Напишите ответ… (Enter: отправить)"
                disabled={loading}
                className="flex-1 resize-none"
            />
                        <Button
                            size="icon-lg"
                            onClick={send}
                            disabled={!input.trim() || loading}
                            aria-label="Отправить"
                        >
                            ↑
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

// ─── Типы ────────────────────────────────────────────────────────────────────

type Tab = "PORTFOLIO" | "DOCUMENT"
type View = "grid" | "list"

interface UserFile {
    id: string
    filename: string
    title: string | null
    description: string | null
    mimeType: string | null
    size: number | null
    createdAt: string
}

const TABS: { id: Tab; label: string; icon: string; accept: string; hint: string }[] = [
    {
        id: "PORTFOLIO",
        label: "Фото и рендеры",
        icon: "bx-image-alt",
        accept: ".jpg,.jpeg,.png",
        hint: "JPG, PNG · до 500 МБ"
    },
    {
        id: "DOCUMENT",
        label: "Материалы",
        icon: "bx-file",
        accept: ".pdf,.dwg,.dxf,.zip",
        hint: "PDF, DWG, DXF, ZIP · до 500 МБ"
    },
]

const isImage = (f: UserFile) =>
    f.mimeType?.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(f.filename)

const isFileImage = (f: File) =>
    f.type.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(f.name)

const fmt = (bytes: number | null) => {
    if (!bytes) return ""
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`
}

// ─── Модальное превью (уже загруженные файлы) ─────────────────────────────────

function PreviewModal({file, url, onClose, onSave}: {
    file: UserFile; url: string
    onClose: () => void
    onSave: (id: string, title: string, description: string) => Promise<void>
}) {
    const [editing, setEditing] = useState(false)
    const [title, setTitle] = useState(file.title ?? "")
    const [description, setDescription] = useState(file.description ?? "")
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        await onSave(file.id, title, description)
        setSaving(false)
        setEditing(false)
    }

    return (
        <AppModal open onClose={onClose} maxWidth={960}>
            {isImage(file) && (
                <div style={{
                    background: "var(--dash-bg, var(--background))",
                    maxHeight: "55vh",
                    overflow: "hidden",
                    borderRadius: "14px 14px 0 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={file.title ?? file.filename}
                         style={{maxWidth: "100%", maxHeight: "55vh", objectFit: "contain"}}/>
                </div>
            )}
            <div style={{padding: "20px 24px 24px"}}>
                <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div style={{flex: 1, minWidth: 0}}>
                        {editing
                            ? <Input className="mb-1" value={title}
                                     onChange={e => setTitle(e.target.value)} placeholder="Название работы" autoFocus/>
                            :
                            <h5 className="mb-0 fw-semibold" style={{fontSize: 18}}>{file.title || file.filename}</h5>}
                        <small
                            className="text-muted">{fmt(file.size)}{file.size ? " · " : ""}{new Date(file.createdAt).toLocaleDateString("ru-RU")}</small>
                    </div>
                    <div className="d-flex gap-2 flex-shrink-0 align-items-center">
                        {!editing &&
                            <ActionButton icon="bx-edit" onClick={() => setEditing(true)}>Изменить</ActionButton>}
                        <ActionButton icon="bx-link-external"
                                      onClick={() => window.open(url, "_blank")}>Открыть</ActionButton>
                        <Button variant="outline" size="icon-sm" onClick={onClose} aria-label="Закрыть"><Icon name="x"/></Button>
                    </div>
                </div>
                <div>
                    <SectionLabel>Описание</SectionLabel>
                    {editing
                        ? <Textarea rows={3} value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Объект, стиль, площадь, использованные решения…"/>
                        : <p className="text-muted mb-0" style={{fontSize: "0.875rem", whiteSpace: "pre-wrap"}}>
                            {file.description || <span style={{opacity: 0.45}}>Описание не добавлено</span>}
                        </p>}
                </div>
                {editing && (
                    <div className="d-flex gap-2 mt-3">
                        <ActionButton variant="primary" icon="bx-check" onClick={handleSave}
                                      disabled={saving}>{saving ? "Сохранение…" : "Сохранить"}</ActionButton>
                        <ActionButton onClick={() => {
                            setEditing(false);
                            setTitle(file.title ?? "");
                            setDescription(file.description ?? "")
                        }}>Отмена</ActionButton>
                    </div>
                )}
            </div>
        </AppModal>
    )
}

// ─── Основной компонент ───────────────────────────────────────────────────────

export default function PortfolioUploader() {
    const [tab, setTab] = useState<Tab>("PORTFOLIO")
    const [view, setView] = useState<View>("grid")
    const [files, setFiles] = useState<UserFile[]>([])
    const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})

    // ── Состояние ожидающего файла ──
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const [pendingPreview, setPendingPreview] = useState<string | null>(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")

    // ── Процесс загрузки ──
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [dragging, setDragging] = useState(false)

    // ── Модальное окно ──
    const [modalFile, setModalFile] = useState<UserFile | null>(null)
    const [modalUrl, setModalUrl] = useState<string>("")

    // ── AI дравер ──
    const [drawerOpen, setDrawerOpen] = useState(false)

    const inputRef = useRef<HTMLInputElement>(null)
    const currentTab = TABS.find(t => t.id === tab)!

    // ─── Загрузка списка ──────────────────────────────────────────────────────

    const loadFiles = useCallback(async (category: Tab) => {
        try {
            const res = await fetch(`/api/files?category=${category}`)
            if (!res.ok) throw new Error(`Не удалось загрузить файлы (${res.status})`)
            const data = await res.json()
            if (!Array.isArray(data)) return
            setFiles(data)

            const images = data.filter(isImage)
            const entries = await Promise.all(
                images.map(async (f: UserFile) => {
                    try {
                        const urlRes = await fetch(`/api/files/${f.id}/url`)
                        if (!urlRes.ok) return [f.id, ""] as [string, string]
                        const {url} = await urlRes.json()
                        return [f.id, url ?? ""] as [string, string]
                    } catch {
                        return [f.id, ""] as [string, string]
                    }
                })
            )
            setPreviewUrls(Object.fromEntries(entries.filter(([, url]) => Boolean(url))))
            setError(null)
        } catch (e) {
            // Network / transient API failures should not crash the page.
            setError((e as Error).message || "Не удалось загрузить файлы")
            setFiles([])
            setPreviewUrls({})
        }
    }, [])

    useEffect(() => {
        setFiles([])
        setPreviewUrls({})
        loadFiles(tab)
    }, [tab, loadFiles])

    // ─── Выбор файла (без загрузки) ───────────────────────────────────────────

    const selectFile = (file: File) => {
        setPendingFile(file)
        setTitle(file.name.replace(/\.[^.]+$/, ""))
        setDescription("")
        setError(null)
        setDrawerOpen(false)

        if (isFileImage(file)) {
            const url = URL.createObjectURL(file)
            setPendingPreview(url)
        } else {
            setPendingPreview(null)
        }
    }

    const clearPending = () => {
        if (pendingPreview) URL.revokeObjectURL(pendingPreview)
        setPendingFile(null)
        setPendingPreview(null)
        setTitle("")
        setDescription("")
        setError(null)
        setDrawerOpen(false)
        if (inputRef.current) inputRef.current.value = ""
    }

    // ─── Загрузка файла ───────────────────────────────────────────────────────

    const uploadPending = async () => {
        if (!pendingFile) return
        setUploading(true)
        setProgress(0)
        setError(null)
        try {
            // 1. Получаем presigned URL и создаем запись в БД
            const res = await fetch("/api/files", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    filename: pendingFile.name,
                    mimeType: pendingFile.type || "application/octet-stream",
                    size: pendingFile.size,
                    category: tab,
                    title: title || pendingFile.name,
                    description: description || null,
                }),
            })
            const resText = await res.text()
            let resJson: { uploadUrl?: string; file?: UserFile; error?: string }
            try {
                resJson = JSON.parse(resText)
            } catch {
                throw new Error(`Ошибка сервера: ${resText.slice(0, 120)}`)
            }
            if (!res.ok) throw new Error(resJson.error ?? `Ошибка ${res.status}`)
            const {file: saved} = resJson as { file: UserFile }

            // 2. Загружаем через backend, чтобы не зависеть от CORS браузера на S3
            const putRes = await uploadWithProgress(`/api/files/${saved.id}/upload`, pendingFile, {
                headers: {"Content-Type": pendingFile.type || "application/octet-stream"},
                onProgress: ({percent}) => setProgress(percent),
            })
            if (!putRes.ok) throw new Error(`Upload ошибка: ${putRes.status}`)
            setProgress(100)

            // 3. Подгружаем превью если картинка
            if (isImage(saved)) {
                const urlRes = await fetch(`/api/files/${saved.id}/url`)
                const urlText = await urlRes.text()
                try {
                    const {url} = JSON.parse(urlText)
                    if (url) setPreviewUrls(prev => ({...prev, [saved.id]: url}))
                } catch { /* превью не критично */
                }
            }

            setFiles(prev => [saved, ...prev])
            clearPending()
        } catch (e) {
            setError((e as Error).message)
        } finally {
            setUploading(false)
            setProgress(0)
        }
    }

    // ─── Удаление ─────────────────────────────────────────────────────────────

    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const deleteFile = async (id: string) => {
        await fetch(`/api/files/${id}`, {method: "DELETE"})
        setFiles(prev => prev.filter(f => f.id !== id))
        setPreviewUrls(prev => {
            const n = {...prev};
            delete n[id];
            return n
        })
        if (modalFile?.id === id) {
            setModalFile(null)
            setModalUrl("")
        }
        setConfirmDeleteId(null)
    }

    // ─── Открыть превью ──────────────────────────────────────────────────────

    const openPreview = async (file: UserFile) => {
        if (!isImage(file)) {
            const url = previewUrls[file.id] ?? await fetch(`/api/files/${file.id}/url`).then(r => r.json()).then(d => d.url)
            window.open(url, "_blank")
            return
        }
        let url = previewUrls[file.id] ?? ""
        if (!url) {
            const body = await fetch(`/api/files/${file.id}/url`).then(r => r.json())
            url = body?.url ?? ""
            if (url) setPreviewUrls(prev => ({...prev, [file.id]: url}))
        }
        if (!url) return
        setModalUrl(url)
        setModalFile(file)
    }

    // ─── Сохранить meta ───────────────────────────────────────────────────────

    const saveFileMeta = async (id: string, newTitle: string, newDescription: string) => {
        const res = await fetch(`/api/files/${id}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({title: newTitle, description: newDescription}),
        })
        const updated: UserFile = await res.json()
        setFiles(prev => prev.map(f => f.id === id ? updated : f))
        if (modalFile?.id === id) setModalFile(updated)
    }

    // ─── Drag & Drop ──────────────────────────────────────────────────────────

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) selectFile(file)
    }

    // ─── Рендер плитки файла в сетке ───────────────────────────────────────────

    const renderFile = (f: UserFile) => {
        const preview = previewUrls[f.id]
        const img = isImage(f)
        const isList = view === "list"

        return (
            <div key={f.id} className={isList ? "col-12" : "col-sm-6 col-xl-4"}>
                <div
                    className="up-card"
                    role="button"
                    tabIndex={0}
                    style={{
                        padding: 0, overflow: "hidden", cursor: "pointer", margin: 0,
                        display: isList ? "flex" : "block", alignItems: isList ? "center" : undefined
                    }}
                    onClick={() => openPreview(f)}
                    onKeyDown={e => {
                        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault()
                            void openPreview(f)
                        }
                    }}
                >
                    {/* Превью/иконка */}
                    {(!isList && img) ? (
                        <div style={{
                            height: 180,
                            overflow: "hidden",
                            background: "var(--dash-accent-bg, var(--muted))",
                            position: "relative"
                        }}>
                            {preview
                                // eslint-disable-next-line @next/next/no-img-element
                                ? <img src={preview} alt={f.title ?? f.filename}
                                       style={{width: "100%", height: "100%", objectFit: "cover"}}/>
                                : <div className="d-flex align-items-center justify-content-center h-100"><Icon name="image" className="text-muted" size={48}/></div>}
                            <div className="portfolio-overlay"><Icon name="zoom-in" size={28}
                                                                  style={{color: "#fff"}}/></div>
                        </div>
                    ) : (
                        <div style={{
                            width: isList ? 44 : 48, height: isList ? 44 : 48, flexShrink: 0,
                            background: "var(--dash-accent-bg, var(--muted))",
                            borderRadius: isList ? "8px 0 0 8px" : 8,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: isList ? 0 : "16px 16px 0",
                        }}>
                            {img && preview
                                // eslint-disable-next-line @next/next/no-img-element
                                ? <img src={preview} alt="" style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: isList ? "8px 0 0 8px" : 8
                                }}/>
                                : <Icon name={stripBx(img ? "bx-image" : "bx-file")} className="text-primary"
                                     size={20}/>}
                        </div>
                    )}

                    {/* Мета */}
                    <div style={{padding: isList ? "10px 12px" : "10px 14px 12px", flex: 1, minWidth: 0}}>
                        <div className="d-flex align-items-start justify-content-between gap-2">
                            <div style={{minWidth: 0}}>
                                <p className="fw-semibold mb-0 small text-truncate">{f.title || f.filename}</p>
                                {f.description && (
                                    <p className="text-muted mb-0" style={{
                                        fontSize: "0.75rem",
                                        display: "-webkit-box",
                                        WebkitLineClamp: isList ? 1 : 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden"
                                    }}>
                                        {f.description}
                                    </p>
                                )}
                                <small className="text-muted" style={{fontSize: "0.75rem"}}>
                                    {fmt(f.size)}{f.size ? " · " : ""}{new Date(f.createdAt).toLocaleDateString("ru-RU")}
                                </small>
                            </div>
                            <div className="d-flex gap-1 flex-shrink-0">
                                <Button variant="ghost" size="icon-xs" onClick={e => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(f.id)
                                }} aria-label="Удалить">
                                    <Icon name="trash" className="text-danger"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderCarouselFile = (f: UserFile) => {
        const preview = previewUrls[f.id]
        return (
            <div key={f.id} className="pf-carousel__item">
                <div
                    className="pf-carousel__card"
                    onClick={() => openPreview(f)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            void openPreview(f)
                        }
                    }}
                >
                    {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt={f.title ?? f.filename} className="pf-carousel__img"/>
                    ) : (
                        <div className="pf-carousel__empty"><Icon name="image"/></div>
                    )}
                    <div className="pf-carousel__overlay">
                        <p className="pf-carousel__title">{f.title || f.filename}</p>
                        {f.description && <p className="pf-carousel__desc">{f.description}</p>}
                        <div className="pf-carousel__actions">
                            <Button variant="ghost" size="icon-xs" onClick={e => {
                                e.stopPropagation();
                                void setConfirmDeleteId(f.id)
                            }} aria-label="Удалить">
                                <Icon name="trash" className="text-danger"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ─── Рендер ───────────────────────────────────────────────────────────────

    return (
        <div>
            {/* ── Табы: тип загружаемых файлов ── */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex gap-2">
                    {TABS.map(t => (
                        <Button key={t.id} size="sm" variant={tab === t.id ? "default" : "outline"}
                                aria-pressed={tab === t.id}
                                onClick={() => {
                                    setTab(t.id);
                                    clearPending()
                                }}>
                            {t.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="pf-upload-block">
                <div className="d-flex align-items-center gap-2 mb-3">
          <span className="fw-semibold small" style={{color: "var(--dash-text, var(--foreground))"}}>
            Загрузка
          </span>
                </div>
                <div className="card mb-0" style={{
                    boxShadow: "none",
                    background: "rgba(20,25,40,0.28)"
                }}>
                    <div className="card-body p-3" style={{background: "transparent"}}>
                        <div className="row g-3 align-items-stretch">
                            <div className="col-md-5">
                                {pendingFile ? (
                                    <div style={{
                                        position: "relative",
                                        borderRadius: 10,
                                        overflow: "hidden",
                                        height: "100%",
                                        minHeight: 140,
                                        background: "var(--dash-surface2, var(--muted))",
                                    }}>
                                        {pendingPreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={pendingPreview} alt="preview" style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                display: "block"
                                            }}/>
                                        ) : (
                                            <div
                                                className="d-flex flex-column align-items-center justify-content-center h-100 gap-2 p-3">
                                                <Icon name="file" className="text-primary" size={36}/>
                                                <p className="mb-0 small fw-medium text-truncate text-center"
                                                   style={{maxWidth: "90%"}}>{pendingFile.name}</p>
                                                <small className="text-muted">{fmt(pendingFile.size)}</small>
                                            </div>
                                        )}
                                        {!uploading && (
                                            <Button variant="secondary" size="icon-sm" onClick={clearPending}
                                                    style={{position: "absolute", top: 6, right: 6}}
                                                    aria-label="Отменить выбор">
                                                <Icon name="x"/>
                                            </Button>
                                        )}
                                        {uploading && (
                                            <div style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(0,0,0,0.5)",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 8
                                            }}>
                                                <Icon name="loader-alt" className="bx-spin" size={28}
                                                   style={{color: "#fff"}}/>
                                                <div style={{width: "70%"}}>
                                                    <div className="progress" style={{
                                                        height: 4,
                                                        borderRadius: 10,
                                                        background: "rgba(255,255,255,0.2)"
                                                    }}>
                                                        <div className="progress-bar" style={{
                                                            width: `${progress}%`,
                                                            background: "#fff",
                                                        }}/>
                                                    </div>
                                                    <small style={{color: "#fff", opacity: 0.85}}>{progress}%</small>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        onDragOver={e => {
                                            e.preventDefault();
                                            setDragging(true)
                                        }}
                                        onDragLeave={() => setDragging(false)}
                                        onDrop={onDrop}
                                        role="button"
                                        tabIndex={0}
                                        aria-label="Выбрать файл"
                                        onClick={() => inputRef.current?.click()}
                                        onKeyDown={e => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                inputRef.current?.click()
                                            }
                                        }}
                                        style={{
                                            border: `1px dashed ${dragging ? "var(--dash-accent, var(--primary))" : "rgba(255,255,255,0.12)"}`,
                                            borderRadius: 10,
                                            height: "100%",
                                            minHeight: 140,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 6,
                                            background: dragging ? "var(--dash-accent-bg, var(--muted))" : undefined,
                                            cursor: "pointer",
                                            transition: "border-color 0.2s, background 0.2s",
                                            textAlign: "center",
                                            padding: 16,
                                        }}
                                    >
                                        <Icon name="cloud-upload" className={dragging ? "text-primary" : "text-muted"}
                                           size={30}/>
                                        <p className="mb-0 fw-medium small"
                                           style={{color: dragging ? "var(--dash-accent, var(--bs-primary))" : "var(--dash-text, var(--foreground))"}}>
                                            {dragging ? "Отпустите для выбора" : "Перетащите файл или нажмите"}
                                        </p>
                                        <small className="text-muted">{currentTab.hint}</small>
                                    </div>
                                )}
                                <input ref={inputRef} type="file" accept={currentTab.accept} className="d-none"
                                       onChange={e => e.target.files?.[0] && selectFile(e.target.files[0])}/>
                                {uploading && pendingFile && (
                                    <div className="mt-2">
                                        <UploadingCards items={[{
                                            id: "pending",
                                            name: pendingFile.name,
                                            size: pendingFile.size,
                                            mimeType: pendingFile.type,
                                            progress,
                                            status: "uploading",
                                            previewUrl: pendingPreview,
                                        } satisfies UploadItem]}/>
                                    </div>
                                )}
                            </div>

                            <div className="col-md-7 d-flex flex-column gap-2">
                                <div>
                                    <label className="form-label small fw-medium mb-1">Название работы</label>
                                    <Input placeholder="Офис на ул. Ленина, 80 м²" value={title}
                                           onChange={e => setTitle(e.target.value)}
                                           disabled={uploading || !pendingFile}/>
                                </div>
                                <div className="flex-grow-1 d-flex flex-column">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label className="form-label small fw-medium mb-0">Описание <span
                                            className="text-muted fw-normal"
                                            style={{fontSize: "0.75rem"}}>(необязательно)</span></label>
                                        <small className="text-muted"
                                               style={{fontSize: "0.75rem"}}>{description.length} / {DESC_MAX}</small>
                                    </div>
                                    <Textarea className="flex-grow-1 resize-none" rows={3}
                                              maxLength={DESC_MAX}
                                              placeholder={pendingFile ? "Стиль, площадь, особенности проекта…" : "Сначала выберите файл"}
                                              value={description}
                                              onChange={e => setDescription(e.target.value.slice(0, DESC_MAX))}
                                              disabled={uploading || !pendingFile}/>
                                </div>
                                <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                                    <Button size="sm" onClick={uploadPending} disabled={!pendingFile || uploading}
                                            style={{minWidth: 120}}>
                                        {uploading ? <><Icon name="loader-alt" className="bx-spin"/>Загрузка…</> : <><Icon name="upload"/>Загрузить</>}
                                    </Button>
                                    <Button type="button" variant="outline" size="sm"
                                            onClick={() => setDrawerOpen(true)} disabled={uploading || !pendingFile}
                                            title="Составить описание с помощью AI">
                                        <AiIcon size="0.875rem"/> AI описание
                                    </Button>
                                    {error && <small className="text-danger">{error}</small>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pf-gallery-block">
                <div className="pf-gallery-block__inner">
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
            <span className="fw-semibold small" style={{color: "var(--dash-text, var(--foreground))"}}>
              {tab === "PORTFOLIO" ? "Загруженные работы" : "Загруженные материалы"}
            </span>
                        <div className="d-flex align-items-center gap-2">
                            {files.length > 0 && <span className="badge bg-label-secondary"
                                                       style={{fontSize: "0.75rem"}}>{files.length}</span>}
                            {tab === "PORTFOLIO" && files.length > 0 && (
                                <div className="d-flex gap-1">
                                    <Button variant={view === "grid" ? "default" : "outline"} size="icon-sm"
                                            aria-pressed={view === "grid"} aria-label="Блок"
                                            onClick={() => setView("grid")} title="Блок">
                                        <Icon name="grid-alt"/>
                                    </Button>
                                    <Button variant={view === "list" ? "default" : "outline"} size="icon-sm"
                                            aria-pressed={view === "list"} aria-label="Списком"
                                            onClick={() => setView("list")} title="Списком">
                                        <Icon name="list-ul"/>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {files.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <p className="mb-0">{tab === "PORTFOLIO" ? "Здесь появятся загруженные фото и рендеры" : "Здесь появятся загруженные материалы"}</p>
                        </div>
                    ) : tab === "PORTFOLIO" && view === "grid" ? (
                        <div className="pf-carousel-wrap">
                            <DashCarousel ariaLabel="Карусель портфолио" viewportClassName="pf-carousel">
                                {files.filter(isImage).map(renderCarouselFile)}
                            </DashCarousel>
                        </div>
                    ) : (
                        <div className="row g-3">{files.map(renderFile)}</div>
                    )}
                </div>
            </div>

            {/* ── Модальное превью ── */}
            {modalFile && modalUrl && (
                <PreviewModal file={modalFile} url={modalUrl} onClose={() => {
                    setModalFile(null);
                    setModalUrl("")
                }} onSave={saveFileMeta}/>
            )}

            {/* ── AI чат-дравер ── */}
            <AiChatDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={title}
                currentDescription={description}
                onApply={text => setDescription(text.slice(0, DESC_MAX))}
            />

            {/* ── Confirm delete ── */}
            <ConfirmDialog
                open={!!confirmDeleteId}
                title="Удалить файл?"
                message="Файл будет удален без возможности восстановления."
                onConfirm={() => confirmDeleteId && deleteFile(confirmDeleteId)}
                onCancel={() => setConfirmDeleteId(null)}
            />

            <style>{`
        .pf-upload-block { margin-bottom: 14px; }
        .pf-gallery-block__inner {
          border-radius: 14px;
          background: rgba(20,25,40,0.22);
          padding: 12px;
          min-height: 540px;
        }
        .pf-carousel-wrap { position: relative; }
        .pf-carousel__item { flex: 0 0 120px; scroll-snap-align: start; }
        .pf-carousel__card {
          height: 500px;
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          background: var(--dash-surface2, var(--muted));
        }
        .pf-carousel__card:focus-visible { outline: 2px solid var(--dash-accent, var(--ring)); outline-offset: 2px; }
        .pf-carousel__img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
        .pf-carousel__empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--dash-muted); font-size: 24px; }
        .pf-carousel__overlay {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; justify-content: flex-end;
          align-items: flex-start;
          padding: 10px;
          background: color-mix(in oklab, var(--dash-bg, var(--background)) 68%, transparent);
          opacity: 0;
          visibility: hidden;
          transform: translateY(100%);
          transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s;
        }
        .pf-carousel__card:hover .pf-carousel__overlay,
        .pf-carousel__card:focus-visible .pf-carousel__overlay { opacity: 1; visibility: visible; transform: translateY(0%); }
        .pf-carousel__title { margin: 0; color: #fff; font-size: 0.75rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pf-carousel__desc { margin: 2px 0 6px; color: rgba(255,255,255,0.75); font-size: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pf-carousel__actions { display: flex; gap: 6px; }
        .portfolio-overlay {
          position: absolute; inset: 0; opacity: 0;
          background: rgba(0,0,0,0);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, opacity 0.2s;
        }
        .up-card:hover .portfolio-overlay { background: rgba(0,0,0,0.38); opacity: 1; }
      `}</style>
        </div>
    )
}
