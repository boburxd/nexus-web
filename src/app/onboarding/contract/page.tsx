"use client"

import {useCallback, useEffect, useState} from "react"
import Link from "next/link"
import {useRouter} from "next/navigation"
import {toast} from "sonner"
import {confirmDialog} from "@/lib/dialog-store"
import {OnboardingShell} from "@/components/app/OnboardingShell"
import {AppCard} from "@/components/app/AppCard"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {SPECIALIST_CABINET_HOME_HREF} from "@/lib/cabinet-shell"
import {DocumentUpload} from "@/components/app/DocumentUpload"
import {uploadWithProgress} from "@/lib/upload-progress"

const STATUS_HINT: Record<string, { title: string; detail: string }> = {
    NONE: {
        title: "Договор еще не размещен",
        detail: "Администратор загрузит PDF в вашей карточке. Когда файл появится, обновите страницу.",
    },
    AWAITING_SIGNATURE: {
        title: "Подпишите договор",
        detail: "Скачайте исходный PDF, подпишите его и загрузите подписанный файл обратно. При необходимости можно указать оператора ЭДО.",
    },
    SIGNED_BY_SPECIALIST: {
        title: "Подписанный файл отправлен",
        detail: "Администратор проверит загруженный PDF и подтвердит договор. После этого этап будет завершен.",
    },
    SIGNED_BY_ADMIN: {
        title: "Договор зафиксирован",
        detail: "Все этапы пройдены. Добро пожаловать на платформу.",
    },
    DECLINED_BY_SPECIALIST: {
        title: "Вы отказались от договора",
        detail: "Свяжитесь с менеджером или дождитесь новой версии документа.",
    },
}

export default function OnboardingContractPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [state, setState] = useState<{
        status: string
        number: string | null
        hasFile: boolean
        downloadUrl: string | null
        hasSignedFile: boolean
        signedDownloadUrl: string | null
        signedUploadedAt: string | null
    }>({
        status: "NONE",
        number: null,
        hasFile: false,
        downloadUrl: null,
        hasSignedFile: false,
        signedDownloadUrl: null,
        signedUploadedAt: null,
    })
    const [edoOperator, setEdoOperator] = useState("")
    const [signedFile, setSignedFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState<number | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const r = await fetch("/api/specialist/framework-contract")
            if (!r.ok) return
            const j = (await r.json()) as {
                status?: string
                number?: string | null
                hasFile?: boolean
                downloadUrl?: string | null
                hasSignedFile?: boolean
                signedDownloadUrl?: string | null
                signedUploadedAt?: string | null
            }
            setState({
                status: j.status ?? "NONE",
                number: j.number ?? null,
                hasFile: Boolean(j.hasFile),
                downloadUrl: j.downloadUrl ?? null,
                hasSignedFile: Boolean(j.hasSignedFile),
                signedDownloadUrl: j.signedDownloadUrl ?? null,
                signedUploadedAt: j.signedUploadedAt ?? null,
            })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    const download = (url: string | null) => {
        if (url) window.open(url, "_blank", "noopener,noreferrer")
        else void load()
    }

    const decline = async () => {
        const ok = await confirmDialog({
            title: "Отказаться от договора? Менеджер свяжется с вами.",
            variant: "destructive",
        })
        if (!ok) return
        setBusy(true)
        try {
            const r = await fetch("/api/specialist/framework-contract", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({action: "decline"}),
            })
            if (!r.ok) {
                const e = await r.json().catch(() => ({}))
                toast.error(typeof e.error === "string" ? e.error : "Ошибка")
                return
            }
            await load()
            router.refresh()
        } finally {
            setBusy(false)
        }
    }

    const uploadSigned = async () => {
        if (!signedFile) {
            setUploadError("Выберите подписанный PDF")
            return
        }
        const ok = await confirmDialog({
            title: "Отправить подписанный договор?",
            description: "Это действие нельзя отменить: после отправки файл уйдёт администратору на проверку.",
            variant: "warning",
        })
        if (!ok) return
        setBusy(true)
        setUploadError(null)
        setUploadProgress(0)
        try {
            const fd = new FormData()
            fd.set("file", signedFile)
            if (edoOperator.trim()) fd.set("edoOperator", edoOperator.trim())
            const r = await uploadWithProgress("/api/specialist/framework-contract", fd, {
                onProgress: ({percent}) => setUploadProgress(percent),
            })
            if (!r.ok) {
                let message = "Ошибка загрузки"
                try {
                    const e = JSON.parse(r.text || "{}") as { error?: string }
                    if (typeof e.error === "string") message = e.error
                } catch { /* ответ не JSON — оставляем общий текст */ }
                setUploadError(message)
                return
            }
            setSignedFile(null)
            await load()
            router.refresh()
        } catch (e) {
            setUploadError(e instanceof Error ? e.message : "Ошибка загрузки")
        } finally {
            setUploadProgress(null)
            setBusy(false)
        }
    }

    // После отправки подписанного файла форма остаётся на месте, но заблокирована.
    const awaitingSignature = state.status === "AWAITING_SIGNATURE"
    const signedSubmitted = !awaitingSignature && state.hasSignedFile

    const hint = STATUS_HINT[state.status] ?? {title: state.status, detail: ""}

    return (
        <OnboardingShell title="Договор" backHref="/onboarding" backLabel="Онбординг" withBg>
            <div style={{maxWidth: 720, margin: "0 auto", padding: "3rem 2rem"}}>
                <div style={{marginBottom: "2rem"}}>
                    <h1 style={{color: "var(--foreground)", fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 500, margin: 0}}>
                        Договор с платформой
                    </h1>
                    <p style={{color: "rgba(255,255,255,0.45)", marginTop: "8px", fontSize: "0.875rem"}}>
                        Администратор размещает исходный документ, а вы загружаете подписанный PDF обратно для проверки.
                    </p>
                </div>

                {loading ? (
                    <AppCard glass>
                        <p style={{color: "rgba(255,255,255,0.5)", margin: 0}}>Загрузка…</p>
                    </AppCard>
                ) : (
                    <>
                        <AppCard glass style={{marginBottom: "1.25rem"}}>
                            <div style={{
                                color: "rgba(255,255,255,0.35)",
                                fontSize: "0.75rem",
                                marginBottom: 8
                            }}>
                                Статус
                            </div>
                            <div style={{
                                color: "var(--foreground)",
                                fontWeight: 600,
                                fontSize: "1rem",
                                marginBottom: 8
                            }}>{hint.title}</div>
                            <p style={{
                                color: "rgba(255,255,255,0.45)",
                                fontSize: "0.875rem",
                                margin: 0,
                                lineHeight: 1.5
                            }}>{hint.detail}</p>
                            {state.number && (
                                <p style={{
                                    color: "rgba(255,255,255,0.35)",
                                    fontSize: "0.875rem",
                                    marginTop: 12,
                                    marginBottom: 0
                                }}>
                                    Номер договора: <span style={{color: "var(--foreground)"}}>{state.number}</span>
                                </p>
                            )}
                        </AppCard>

                        {state.hasFile && (
                            <AppCard glass style={{marginBottom: "1.25rem"}}>
                                <div style={{color: "var(--foreground)", fontWeight: 500, marginBottom: 12}}>Исходный PDF
                                    договора
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => download(state.downloadUrl)}
                                >
                                    <span>↓</span> Скачать PDF
                                </Button>
                            </AppCard>
                        )}

                        {state.hasFile && (awaitingSignature || signedSubmitted) && (
                            <AppCard glass style={{marginBottom: "1.25rem"}}>
                                {awaitingSignature && (
                                    <>
                                        <label style={{
                                            display: "block",
                                            color: "rgba(255,255,255,0.45)",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            marginBottom: 8
                                        }}>
                                            Оператор ЭДО
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Например: Контур.Диадок"
                                            value={edoOperator}
                                            onChange={(e) => setEdoOperator(e.target.value)}
                                            maxLength={500}
                                            disabled={busy}
                                        />
                                    </>
                                )}
                                <div style={{marginTop: awaitingSignature ? 16 : 0}}>
                                    <DocumentUpload
                                        label="Подписанный PDF"
                                        file={signedFile}
                                        onFileChange={(f) => {
                                            setSignedFile(f)
                                            setUploadError(null)
                                        }}
                                        progress={uploadProgress}
                                        error={uploadError}
                                        disabled={busy}
                                        submitted={signedSubmitted ? {
                                            title: "Подписанный договор отправлен",
                                            submittedAt: state.signedUploadedAt,
                                            hint: state.status === "SIGNED_BY_ADMIN"
                                                ? "Договор подтверждён администратором"
                                                : "Ожидает проверки администратором",
                                            onDownload: state.signedDownloadUrl
                                                ? () => download(state.signedDownloadUrl)
                                                : undefined,
                                        } : null}
                                    />
                                </div>
                                {awaitingSignature && (
                                    <div style={{display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16}}>
                                        <Button
                                            type="button"
                                            size="lg"
                                            disabled={busy || !signedFile}
                                            onClick={() => void uploadSigned()}
                                        >
                                            {busy ? "Отправка…" : "Отправить подписанный PDF"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="lg"
                                            disabled={busy}
                                            onClick={() => void decline()}
                                        >
                                            Отказаться
                                        </Button>
                                    </div>
                                )}
                            </AppCard>
                        )}

                        <Button type="button" variant="outline" onClick={() => load()}>
                            Обновить статус
                        </Button>

                        {state.status === "SIGNED_BY_ADMIN" && (
                            <Button
                                size="lg"
                                nativeButton={false}
                                render={<Link href={SPECIALIST_CABINET_HOME_HREF}/>}
                                className="mt-3"
                            >
                                Перейти в личный кабинет →
                            </Button>
                        )}
                    </>
                )}
            </div>
        </OnboardingShell>
    )
}
