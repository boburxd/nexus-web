"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {toast} from "sonner"
import {OnboardingShell} from "@/components/app/OnboardingShell"
import {AppCard} from "@/components/app/AppCard"
import {PhoneField} from "@/components/ui/PhoneField"
import {PortfolioLinksField, splitPortfolioLinks} from "@/components/ui/PortfolioLinksField"
import {MultiSelectField} from "@/components/ui/MultiSelectField"
import {Switch} from "@/components/ui/switch"
import {INTERIOR_STYLE_OPTIONS, METHOD_OPTIONS, SPECIALTY_OPTIONS} from "@/lib/specialist-options"
import {AiIcon} from "@/components/app/AiIcon"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Modal} from "@/components/ui/modal"
import {Skeleton} from "@/components/ui/skeleton"
import {DashRightDrawer} from "@/components/dashboard-ui/DashRightDrawer"

// ─── Типы AI ─────────────────────────────────────────────────────────────────

interface AISuggestion {
    field: string | null
    tip: string
    reason: string
    example: string
}

const FIELD_LABELS: Record<string, string> = {
    firstName: "Имя", lastName: "Фамилия", city: "Город", experience: "Опыт",
    portfolio: "Портфолио", software: "Программы", aiServices: "Нейросети", about: "О себе",
}

const FIELDS = [
    {name: "firstName", label: "Имя", type: "text", placeholder: "Иван", required: true},
    {name: "lastName", label: "Фамилия", type: "text", placeholder: "Иванов", required: true},
    {name: "email", label: "Email", type: "email", placeholder: "ivan@example.com", required: true},
    {name: "city", label: "Город", type: "text", placeholder: "Москва", required: true},
    {name: "experience", label: "Опыт работы (лет)", type: "number", placeholder: "3", required: true},
    {name: "sqm", label: "Реализовано м²", type: "number", placeholder: "1200", required: false},
    {
        name: "interiorStyle",
        label: "Интерьерный стиль",
        type: "multiselect",
        placeholder: "Выберите стили — можно несколько",
        required: false
    },
    {
        name: "specialty",
        label: "Специализация",
        type: "multiselect",
        placeholder: "Выберите специализации — можно несколько",
        required: false
    },
    {
        name: "methods",
        label: "Методы",
        type: "multiselect",
        placeholder: "Выберите методы работы — можно несколько",
        required: false
    },
    {name: "portfolio", label: "Портфолио", type: "url", placeholder: "https://behance.net/...", required: false},
    {name: "has3d", label: "3D моделирование", type: "toggle", placeholder: "", required: false},
    {name: "hasRd", label: "Чертежи", type: "toggle", placeholder: "", required: false},
    {
        name: "software",
        label: "Программы",
        type: "software",
        placeholder: "Начните вводить или выберите ниже…",
        required: false
    },
    {
        name: "aiServices",
        label: "Нейросети",
        type: "ai",
        placeholder: "Начните вводить или выберите ниже…",
        required: false
    },
    {
        name: "about",
        label: "О себе",
        type: "textarea",
        placeholder: "Расскажите о вашем опыте и специализации…",
        required: true
    },
]

const TAX_STATUSES = [
    {value: "IP", label: "ИП", desc: "Индивидуальный предприниматель"},
    {value: "SZ", label: "Самозанятый", desc: "Налог на профессиональный доход (НПД)"},
    {value: "OOO", label: "ООО", desc: "Юридическое лицо"},
]

const SOFTWARE_SUGGESTIONS = [
    // CAD / BIM
    "AutoCAD", "nanoCAD", "ArchiCAD", "Revit", "Chief Architect",
    // 3D моделирование
    "3ds Max", "SketchUp", "Blender", "Cinema 4D",
    // Рендер / визуализация
    "V-Ray", "Corona Renderer", "Lumion", "Twinmotion", "Enscape", "Unreal Engine",
    // Презентации и графика
    "Photoshop", "Illustrator", "InDesign", "Figma",
]

const AI_SERVICE_SUGGESTIONS = [
    // Текст / ассистенты
    "ChatGPT", "Claude", "Gemini", "DeepSeek", "Perplexity", "Copilot", "Grok",
    // Изображения / визуализация
    "Midjourney", "DALL-E", "Stable Diffusion", "Adobe Firefly",
    // Видео
    "Runway", "Luma",
]

// PortfolioLinksField рисует свои <input> сам и принимает только inline-стиль —
// повторяем в нём вид системного Input на тех же токенах.
const portfolioInputStyle: React.CSSProperties = {
    background: "transparent",
    border: "1px solid var(--input)",
    borderRadius: 8,
    color: "var(--foreground)",
    fontSize: 14,
    padding: "8px 12px",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
}

// DashRightDrawer рисуется токенами --dash-*; вне кабинета их задаём через shadcn-токены.
const drawerThemeVars = {
    "--dash-surface": "var(--card)",
    "--dash-surface2": "var(--background)",
    "--dash-border": "var(--border)",
    "--dash-text": "var(--card-foreground)",
    "--dash-muted": "var(--muted-foreground)",
} as React.CSSProperties

const labelClass = "text-xs font-medium text-muted-foreground"
const hintClass = "mt-1 text-xs text-muted-foreground"
const fieldErrorClass = "text-xs text-destructive"

export default function OnboardingFormPage() {
    const router = useRouter()
    const [form, setForm] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [profileLocks, setProfileLocks] = useState({name: false, email: false})
    const [innNotFound, setInnNotFound] = useState(false)
    // Сбой запроса к DaData остаётся под полем, пока человек не изменит значение.
    const [innLookupError, setInnLookupError] = useState<string | null>(null)
    const [bikLookupError, setBikLookupError] = useState<string | null>(null)

    // Имя и почта из регистрации в анкете только для чтения.
    const isFieldLocked = (field: string) =>
        field === "firstName" || field === "lastName" ? profileLocks.name : field === "email" && profileLocks.email

    // AI drawer
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [videoOpen, setVideoOpen] = useState(false)
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
    const [appliedIdx, setAppliedIdx] = useState<Set<number>>(new Set())
    const [loadingAI, setLoadingAI] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)
    const [generatingAbout, setGeneratingAbout] = useState(false)

    // Переключение программы в поле software
    const lookupInn = async (inn: string) => {
        setForm(f => ({...f, inn}))
        setInnNotFound(false)
        setInnLookupError(null)
        const cleanInn = inn.replace(/\D/g, "")
        // ИП и самозанятый — оба физлица с 12-значным ИНН для DaData; отличается только
        // то, что самозанятый не показывает ОГРНИП (его у него просто нет).
        const isIndividualInn = (form.taxStatus === "IP" || form.taxStatus === "SZ") && cleanInn.length === 12
        const isOooInn = form.taxStatus === "OOO" && cleanInn.length === 10
        if (isIndividualInn || isOooInn) {
            try {
                const res = await fetch("/api/dadata/party", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({inn: cleanInn})
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    // 429 отдаёт понятный текст; остальные ошибки прокси (401/502) — технические.
                    const reason = res.status === 429 && data.error ? data.error : "Не удалось загрузить данные по ИНН."
                    setInnLookupError(`${reason} Заполните реквизиты вручную.`)
                } else if (data.found) {
                    setForm(f => ({
                        ...f,
                        ...(form.taxStatus === "OOO"
                            ? {
                                companyName: data.name ?? f.companyName ?? "",
                                kpp: data.kpp ?? "",
                                ogrn: data.ogrn ?? "",
                                legalAddress: data.address ?? "",
                            }
                            : {ogrnip: data.ogrn ?? f.ogrnip ?? "", ipName: data.fullName ?? ""}),
                    }))
                } else if (data.degraded) {
                    setInnLookupError("Сервис проверки ИНН временно недоступен. Заполните реквизиты вручную.")
                } else {
                    setInnNotFound(true)
                }
            } catch {
                setInnLookupError("Не удалось загрузить данные по ИНН. Заполните реквизиты вручную.")
            }
        }
    }

    // Реквизиты (ИНН, КПП, ОГРН и т.д.) относятся к конкретному налоговому статусу —
    // при переключении вкладки старые значения уже не соответствуют новой форме.
    const switchTaxStatus = (value: string) => {
        setInnNotFound(false)
        setInnLookupError(null)
        setBikLookupError(null)
        setForm(f => ({
            ...f,
            taxStatus: value,
            inn: "", kpp: "", ogrn: "", legalAddress: "", companyName: "",
            ipName: "", ogrnip: "", ipRegDate: "",
            bankName: "", bankBik: "", corrAccount: "",
        }))
    }

    const lookupBik = async (bik: string) => {
        setForm(f => ({...f, bankBik: bik}))
        setBikLookupError(null)
        if (bik.replace(/\D/g, "").length === 9) {
            try {
                const res = await fetch("/api/dadata/bank", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({bik: bik.replace(/\D/g, "")})
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    const reason = res.status === 429 && data.error ? data.error : "Не удалось загрузить данные банка по БИК."
                    setBikLookupError(`${reason} Заполните банк вручную.`)
                } else if (data.found) {
                    setForm(f => ({...f, bankName: data.bankName ?? "", corrAccount: data.corrAccount ?? f.corrAccount ?? ""}))
                } else if (data.degraded) {
                    setBikLookupError("Сервис проверки БИК временно недоступен. Заполните банк вручную.")
                } else {
                    setBikLookupError("Банк с таким БИК не найден. Заполните банк вручную.")
                }
            } catch {
                setBikLookupError("Не удалось загрузить данные банка по БИК. Заполните вручную.")
            }
        }
    }

    const toggleSoftware = (name: string) => {
        const current = (form.software ?? "").split(",").map(s => s.trim()).filter(Boolean)
        const exists = current.some(s => s.toLowerCase() === name.toLowerCase())
        const next = exists
            ? current.filter(s => s.toLowerCase() !== name.toLowerCase())
            : [...current, name]
        setForm(f => ({...f, software: next.join(", ")}))
    }

    const activeSoftware = new Set(
        (form.software ?? "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    )

    // Переключение нейросети в поле aiServices — тот же паттерн, что и для software
    const toggleAiService = (name: string) => {
        const current = (form.aiServices ?? "").split(",").map(s => s.trim()).filter(Boolean)
        const exists = current.some(s => s.toLowerCase() === name.toLowerCase())
        const next = exists
            ? current.filter(s => s.toLowerCase() !== name.toLowerCase())
            : [...current, name]
        setForm(f => ({...f, aiServices: next.join(", ")}))
    }

    const activeAiServices = new Set(
        (form.aiServices ?? "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    )

    // Кнопка у поля «О себе»: превращает набросок в развёрнутый официальный текст
    const generateAbout = async () => {
        if (!form.about?.trim() || generatingAbout) return
        setGeneratingAbout(true)
        try {
            const res = await fetch("/api/ai/generate-about", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    text: form.about,
                    firstName: form.firstName,
                    lastName: form.lastName,
                    city: form.city,
                    experience: form.experience,
                    specialty: form.specialty,
                    methods: form.methods,
                    software: form.software,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? "Не удалось сгенерировать текст")
            setForm(f => ({...f, about: data.text}))
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Не удалось сгенерировать текст")
        } finally {
            setGeneratingAbout(false)
        }
    }

    const openDrawer = async () => {
        setDrawerOpen(true)
        setLoadingAI(true)
        setAiError(null)
        setSuggestions([])
        setAppliedIdx(new Set())
        try {
            const res = await fetch("/api/ai/onboarding-suggest", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(form),
            })
            const json = await res.json()
            if (json.error) throw new Error(json.error)
            setSuggestions(json.suggestions ?? [])
        } catch {
            setAiError("Не удалось получить подсказки. Попробуйте позже.")
        } finally {
            setLoadingAI(false)
        }
    }

    const closeDrawer = () => setDrawerOpen(false)

    const applyAI = (idx: number, field: string | null, example: string) => {
        if (field && !isFieldLocked(field)) {
            setForm(f => ({...f, [field]: example}))
        }
        setAppliedIdx(prev => new Set(prev).add(idx))
    }

    useEffect(() => {
        fetch("/api/onboarding/apply")
            .then(r => r.json())
            .then(data => {
                if (!data || typeof data !== "object") return
                const payload = data as Record<string, unknown>
                const locks = payload._profileLocks
                if (locks && typeof locks === "object") {
                    const lockRecord = locks as Record<string, unknown>
                    setProfileLocks({
                        name: lockRecord.name === true,
                        email: lockRecord.email === true,
                    })
                }
                const {_profileLocks: _ignoredLocks, ...fields} = payload
                void _ignoredLocks
                setForm(Object.fromEntries(
                    Object.entries(fields).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
                ))
            })
            .catch(() => {
            })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!["IP", "SZ", "OOO"].includes(form.taxStatus ?? "")) {
            setError("Выберите налоговый статус: ИП, самозанятый или ООО.")
            return
        }
        if (form.taxStatus === "OOO") {
            if (!form.companyName?.trim()) {
                setError("Укажите наименование ООО.")
                return
            }
            if ((form.inn ?? "").replace(/\D/g, "").length !== 10) {
                setError("Укажите ИНН организации (10 цифр).")
                return
            }
            if (!form.kpp?.trim()) {
                setError("Укажите КПП.")
                return
            }
            if (!form.ogrn?.trim()) {
                setError("Укажите ОГРН.")
                return
            }
            if (!form.legalAddress?.trim()) {
                setError("Укажите юридический адрес.")
                return
            }
            if (!form.corrAccount?.trim()) {
                setError("Укажите корреспондентский счет.")
                return
            }
        }
        if (form.taxStatus === "IP" || form.taxStatus === "SZ") {
            if ((form.inn ?? "").replace(/\D/g, "").length !== 12) {
                setError(form.taxStatus === "IP" ? "Укажите ИНН ИП (12 цифр)." : "Укажите ИНН (12 цифр).")
                return
            }
        }
        if ((form.bankBik ?? "").trim() && (form.bankBik ?? "").replace(/\D/g, "").length !== 9) {
            setError("БИК должен содержать 9 цифр.")
            return
        }
        setLoading(true)
        setError(null)
        try {
            const payload = {...form, portfolio: splitPortfolioLinks(form.portfolio || "").join("\n")}
            const res = await fetch("/api/onboarding/apply", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.error ?? "Ошибка сохранения")
            }
            setSaved(true)
            setTimeout(() => router.push("/onboarding"), 800)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка")
        } finally {
            setLoading(false)
        }
    }

    return (
        <OnboardingShell title="Анкета" backHref="/onboarding" backLabel="Онбординг" withBg>
            <div className="mx-auto max-w-xl px-6 py-12">
                <div className="mb-8">
                    <h1 className="m-0 font-medium text-card-foreground" style={{fontSize: "clamp(1.4rem,3vw,1.8rem)"}}>
                        Шаг 1. Анкета специалиста
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        После отправки администратор проверит анкету и пригласит вас на тест
                    </p>
                </div>

                <AppCard glass>
                    <form
                        onSubmit={handleSubmit}
                        onKeyDown={(e) => {
                            // Enter в любом однострочном поле не должен незаметно отправлять анкету —
                            // только явный клик по кнопке «Отправить».
                            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                                e.preventDefault()
                            }
                        }}
                        className="flex flex-col gap-5"
                    >
                        <div
                            className="onb-grid-2"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                gap: "14px 12px",
                            }}
                        >
                            {FIELDS.map(field => {
                                const isWide = field.type === "textarea" || field.type === "software" || field.type === "ai" || field.type === "multiselect" || field.name === "portfolio"
                                const lockedFromProfile = isFieldLocked(field.name)
                                return (
                                    <div
                                        key={field.name}
                                        className="flex flex-col gap-1.5"
                                        style={isWide ? {gridColumn: "1 / -1"} : undefined}
                                    >
                                        {field.type !== "toggle" ? (
                                            <label className={labelClass}>
                                                {field.label}
                                                {lockedFromProfile ? (
                                                    <span title="Получено из профиля"><Icon name="lock-alt" className="ml-1"/></span>
                                                ) : null}
                                            </label>
                                        ) : null}

                                        {field.name === "portfolio" ? (
                                            <PortfolioLinksField
                                                value={form.portfolio || ""}
                                                onChange={v => setForm(f => ({...f, portfolio: v}))}
                                                inputStyle={portfolioInputStyle}
                                                placeholder={field.placeholder}
                                            />
                                        ) : field.type === "toggle" ? (
                                            <label className="flex cursor-pointer items-center gap-2.5" style={{minHeight: "2.6em"}}>
                                                <Switch
                                                    checked={form[field.name] === "true"}
                                                    onChange={() => setForm(f => ({
                                                        ...f,
                                                        [field.name]: f[field.name] === "true" ? "false" : "true"
                                                    }))}
                                                />
                                                <span className="text-sm text-card-foreground">
                                                    {field.label}
                                                    {lockedFromProfile ? (
                                                        <span title="Получено из профиля"><Icon name="lock-alt" className="ml-1"/></span>
                                                    ) : null}
                                                </span>
                                            </label>
                                        ) : field.type === "multiselect" ? (
                                            <MultiSelectField
                                                value={form[field.name] || ""}
                                                onChange={v => setForm(f => ({...f, [field.name]: v}))}
                                                options={field.name === "interiorStyle"
                                                    ? INTERIOR_STYLE_OPTIONS
                                                    : field.name === "methods"
                                                        ? METHOD_OPTIONS
                                                        : SPECIALTY_OPTIONS}
                                                placeholder={field.placeholder}
                                                variant="dark"
                                            />
                                        ) : field.type === "phone" ? (
                                            <PhoneField
                                                value={form[field.name] || ""}
                                                onChange={v => setForm(f => ({...f, [field.name]: v}))}
                                                required={field.required}
                                                className="onb-phone"
                                            />
                                        ) : field.type === "textarea" ? (
                                            <>
                                                <Textarea
                                                    rows={4}
                                                    placeholder={field.placeholder}
                                                    value={form[field.name] || ""}
                                                    onChange={e => setForm(f => ({...f, [field.name]: e.target.value}))}
                                                    className="resize-y"
                                                    required={field.required}
                                                    disabled={generatingAbout}
                                                />
                                                {field.name === "about" && (
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        className="mt-2 self-start"
                                                        onClick={() => void generateAbout()}
                                                        disabled={generatingAbout || !form.about?.trim()}
                                                    >
                                                        {generatingAbout ? "Генерируем…" : <><AiIcon/>Дополнить с помощью ИИ</>}
                                                    </Button>
                                                )}
                                            </>
                                        ) : field.type === "software" || field.type === "ai" ? (
                                            <>
                                                <Input
                                                    type="text"
                                                    placeholder={field.placeholder}
                                                    value={form[field.name] || ""}
                                                    onChange={e => setForm(f => ({...f, [field.name]: e.target.value}))}
                                                />
                                                <div className="mt-1 flex flex-wrap gap-1.5">
                                                    {(field.type === "software" ? SOFTWARE_SUGGESTIONS : AI_SERVICE_SUGGESTIONS).map(name => {
                                                        const active = (field.type === "software" ? activeSoftware : activeAiServices).has(name.toLowerCase())
                                                        return (
                                                            <Button
                                                                key={name}
                                                                type="button"
                                                                size="xs"
                                                                variant={active ? "default" : "outline"}
                                                                aria-pressed={active}
                                                                onClick={() => field.type === "software" ? toggleSoftware(name) : toggleAiService(name)}
                                                            >
                                                                {active && <Icon name="check" aria-hidden/>}
                                                                {name}
                                                            </Button>
                                                        )
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <Input
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                value={form[field.name] || ""}
                                                onChange={e => setForm(f => ({...f, [field.name]: e.target.value}))}
                                                disabled={lockedFromProfile}
                                                aria-readonly={lockedFromProfile}
                                                title={lockedFromProfile ? "Значение получено из профиля" : undefined}
                                                required={field.required}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Tax status & requisites */}
                        <div className="mt-2 flex flex-col gap-3 rounded-lg border border-border p-4">
                            <label className={labelClass}>Налоговый статус (обязательно)</label>
                            <div className="flex gap-2">
                                {TAX_STATUSES.map(s => {
                                    const active = form.taxStatus === s.value
                                    return (
                                        <Button
                                            key={s.value}
                                            type="button"
                                            variant={active ? "default" : "outline"}
                                            aria-pressed={active}
                                            onClick={() => switchTaxStatus(s.value)}
                                            className="h-auto flex-1 flex-col gap-0.5 whitespace-normal py-2"
                                        >
                                            <span className="text-sm font-semibold">{s.label}</span>
                                            <span className="text-xs opacity-70">{s.desc}</span>
                                        </Button>
                                    )
                                })}
                            </div>

                            {form.taxStatus === "SZ" && (
                                <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                                    <Icon name="info-circle" className="mr-1 text-primary"/>
                                    Самозанятый формирует чеки в приложении «Мой налог» после каждой выплаты. Платформа
                                    является агентом.
                                    <Button type="button" variant="link" size="xs" className="ml-2"
                                            onClick={() => setVideoOpen(true)}>
                                        <Icon name="play-circle"/>Видео-инструкция
                                    </Button>
                                </div>
                            )}

                            {(form.taxStatus === "IP" || form.taxStatus === "SZ" || form.taxStatus === "OOO") && (
                                <div className="rwd-grid-2" style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="onb-inn" className={labelClass}>
                                            ИНН {form.taxStatus === "OOO" ? "(10 цифр)" : "(12 цифр)"}
                                        </label>
                                        <Input
                                            id="onb-inn"
                                            type="text"
                                            value={form.inn || ""}
                                            onChange={e => lookupInn(e.target.value)}
                                            maxLength={form.taxStatus === "OOO" ? 10 : 12}
                                            placeholder={form.taxStatus === "OOO" ? "7707083893" : "123456789012"}
                                            aria-invalid={innNotFound || innLookupError ? true : undefined}
                                            aria-describedby="onb-inn-status"
                                        />
                                        <div id="onb-inn-status" aria-live="polite" className="flex flex-col gap-0.5">
                                            <div className={hintClass}>
                                                Подтянем данные автоматически после ввода ИНН.
                                            </div>
                                            {(form.taxStatus === "IP" || form.taxStatus === "SZ") && form.ipName &&
                                                <div className="text-xs text-success">{form.ipName}</div>}
                                            {form.taxStatus === "OOO" && form.companyName &&
                                                <div className="text-xs text-success">{form.companyName}</div>}
                                            {innNotFound && <div className={fieldErrorClass}>
                                                Компания с таким ИНН не найдена. Заполните реквизиты вручную.
                                            </div>}
                                            {innLookupError && <div className={fieldErrorClass}>{innLookupError}</div>}
                                        </div>
                                    </div>
                                    {form.taxStatus === "IP" && (
                                        <>
                                            <div className="flex flex-col gap-1.5">
                                                <label className={labelClass}>Наименование ИП</label>
                                                <Input type="text" value={form.ipName || ""}
                                                       onChange={e => setForm(f => ({...f, ipName: e.target.value}))}
                                                       placeholder="ИП Иванов Иван Иванович"/>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className={labelClass}>ОГРНИП</label>
                                                <Input type="text" value={form.ogrnip || ""}
                                                       onChange={e => setForm(f => ({...f, ogrnip: e.target.value}))}
                                                       maxLength={15} placeholder="304770000000000"/>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className={labelClass}>Дата регистрации ИП</label>
                                                <Input type="date" value={form.ipRegDate || ""}
                                                       onChange={e => setForm(f => ({...f, ipRegDate: e.target.value}))}
                                                       style={{colorScheme: "dark"}}/>
                                            </div>
                                        </>
                                    )}
                                    {form.taxStatus === "OOO" && (
                                        <>
                                            <div className="flex flex-col gap-1.5">
                                                <label className={labelClass}>Наименование ООО</label>
                                                <Input type="text" value={form.companyName || ""}
                                                       onChange={e => setForm(f => ({
                                                           ...f,
                                                           companyName: e.target.value
                                                       }))} placeholder="ООО «Пространство»"/>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className={labelClass}>КПП</label>
                                                <Input type="text" value={form.kpp || ""}
                                                       onChange={e => setForm(f => ({...f, kpp: e.target.value}))}
                                                       maxLength={9} placeholder="770701001"/>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className={labelClass}>ОГРН</label>
                                                <Input type="text" value={form.ogrn || ""}
                                                       onChange={e => setForm(f => ({...f, ogrn: e.target.value}))}
                                                       maxLength={13} placeholder="1027700132195"/>
                                            </div>
                                            <div className="flex flex-col gap-1.5" style={{gridColumn: "1 / -1"}}>
                                                <label className={labelClass}>Юридический адрес</label>
                                                <Input type="text" value={form.legalAddress || ""}
                                                       onChange={e => setForm(f => ({
                                                           ...f,
                                                           legalAddress: e.target.value
                                                       }))}
                                                       placeholder="г. Москва, ул. Примерная, д. 1"/>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="onb-bik" className={labelClass}>БИК</label>
                                        <Input id="onb-bik" type="text" value={form.bankBik || ""}
                                               onChange={e => lookupBik(e.target.value)}
                                               maxLength={9}
                                               placeholder="044525974"
                                               aria-invalid={bikLookupError ? true : undefined}
                                               aria-describedby="onb-bik-status"/>
                                        <div id="onb-bik-status" aria-live="polite" className="flex flex-col gap-0.5">
                                            <div className={hintClass}>
                                                Подтянем банк автоматически после ввода БИК.
                                            </div>
                                            {bikLookupError && <div className={fieldErrorClass}>{bikLookupError}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>Банк</label>
                                        <Input type="text" value={form.bankName || ""}
                                               onChange={e => setForm(f => ({...f, bankName: e.target.value}))}
                                               placeholder="АО «Т-Банк»"/>
                                    </div>
                                    {form.taxStatus === "OOO" && (
                                        <div className="flex flex-col gap-1.5">
                                            <label className={labelClass}>Корр. счет</label>
                                            <Input type="text" value={form.corrAccount || ""}
                                                   onChange={e => setForm(f => ({...f, corrAccount: e.target.value}))}
                                                   maxLength={20} placeholder="30101810000000000000"/>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>{form.taxStatus === "SZ" ? "Счет карты / р/с" : "Расчетный счет"}</label>
                                        <Input type="text" value={form.bankAccount || ""}
                                               onChange={e => setForm(f => ({...f, bankAccount: e.target.value}))}
                                               maxLength={20} placeholder="40802810000000000000"/>
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div role="alert" className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div className="mt-1 flex gap-3">
                            <Button
                                type="submit"
                                size="lg"
                                variant={saved ? "secondary" : "default"}
                                className="flex-1"
                                disabled={loading || saved}
                            >
                                {saved ? <><Icon name="check" aria-hidden/>Сохранено</> : loading ? "Сохранение…" : "Отправить анкету"}
                            </Button>

                            <Button type="button" size="lg" variant="secondary" onClick={openDrawer}>
                                <AiIcon/> Подсказки AI
                            </Button>
                        </div>
                    </form>
                </AppCard>
            </div>

            <DashRightDrawer
                open={drawerOpen}
                onClose={closeDrawer}
                title="AI-подсказки"
                titleIcon={<AiIcon/>}
                badge={<span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">только подсказки</span>}
                zIndex={40}
                themeVars={drawerThemeVars}
                footer={!loadingAI && suggestions.length > 0 ? (
                    <div className="border-t border-border px-6 py-4">
                        <Button type="button" variant="secondary" className="w-full" onClick={openDrawer}>
                            <Icon name="refresh" aria-hidden/>Обновить подсказки
                        </Button>
                    </div>
                ) : undefined}
            >
                {loadingAI && (
                    <div className="flex flex-col gap-3" aria-busy="true">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-lg border border-border p-4">
                                <Skeleton className="mb-2.5 h-2.5 w-2/5"/>
                                <Skeleton className="mb-2 h-2 w-[85%]"/>
                                <Skeleton className="h-2 w-[65%]"/>
                            </div>
                        ))}
                        <p className="mt-2 mb-0 text-center text-xs text-muted-foreground">
                            Анализирую анкету…
                        </p>
                    </div>
                )}

                {aiError && (
                    <div role="alert" className="rounded-lg bg-destructive/10 p-4">
                        <p className="m-0 text-sm text-destructive">{aiError}</p>
                        <Button type="button" variant="link" size="xs" className="mt-2 px-0" onClick={openDrawer}>
                            Попробовать снова
                        </Button>
                    </div>
                )}

                {!loadingAI && !aiError && suggestions.map((s, i) => {
                    const isApplied = appliedIdx.has(i)
                    const label = s.field ? FIELD_LABELS[s.field] : null
                    return (
                        <div
                            key={i}
                            className={`mb-3 rounded-lg p-4 transition-opacity ${isApplied ? "bg-success/10 opacity-55" : "bg-muted"}`}
                        >
                            {label && (
                                <div className="mb-1.5 text-xs font-semibold text-primary">
                                    {label}
                                </div>
                            )}
                            <p className="mb-1 text-sm font-medium text-card-foreground">
                                {s.tip}
                            </p>
                            <p className="mb-3.5 text-xs text-muted-foreground">
                                {s.reason}
                            </p>
                            <div className="mb-3 rounded-md bg-background px-3.5 py-2.5">
                                <p className="m-0 text-xs italic text-muted-foreground">
                                    «{s.example}»
                                </p>
                            </div>
                            <div className="flex justify-end">
                                {isApplied ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-success">
                                        <Icon name="check" aria-hidden/>Применено
                                    </span>
                                ) : s.field ? (
                                    <Button type="button" size="sm" variant="secondary"
                                            onClick={() => applyAI(i, s.field, s.example)}>
                                        Применить →
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    )
                })}
            </DashRightDrawer>

            <style>{`
        @media (max-width: 640px) {
          .onb-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
        .onb-phone .PhoneInputInput {
          background: color-mix(in oklab, var(--foreground) 5%, transparent); border: none;
          border-radius: 8px; color: var(--foreground); font-size: 14px; padding: 10px 16px;
          outline: none; font-family: inherit; width: 100%;
        }
        .onb-phone .PhoneInputInput:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
        .onb-phone .PhoneInputCountry { margin-right: 8px; }
        .onb-phone .PhoneInputCountrySelect { background: var(--popover); color: var(--popover-foreground); border: none; }
      `}</style>

            {/* Video instruction modal */}
            <Modal open={videoOpen} onClose={() => setVideoOpen(false)} maxWidth={640} theme="dark" variant="transparent">
                <div className="relative">
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        aria-label="Закрыть видео"
                        className="absolute top-3 right-3 z-10"
                        onClick={() => setVideoOpen(false)}
                    >
                        <Icon name="x"/>
                    </Button>
                    <video src="/sz/payment_agents.mp4" controls autoPlay playsInline
                           style={{width: "100%", display: "block"}}/>
                </div>
            </Modal>

        </OnboardingShell>
    )
}
