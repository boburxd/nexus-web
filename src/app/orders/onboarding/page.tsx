"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {OnboardingShell} from "@/components/app/OnboardingShell"
import {ClientDashFooter} from "@/components/Client/ClientDashFooter"
import {AppCard} from "@/components/app/AppCard"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Icon} from "@/components/ui/icon"
import {validateClientRequisitesForm} from "@/lib/client-requisites-validation"

const POSITION_CHIPS = ["Собственник", "Генеральный директор", "Управляющий", "Бренд-менеджер", "Архитектор / дизайнер", "Другое"]
const LEGAL_FORM_CHIPS = ["ООО", "АО", "ПАО", "ИП"]

const highlightedAutoFillInputStyle: React.CSSProperties = {
    background: "color-mix(in oklab, var(--primary) 14%, transparent)",
}

function Chip({label, active, onClick}: { label: string; active: boolean; onClick: () => void }) {
    return (
        <Button type="button" variant={active ? "secondary" : "outline"} size="sm" onClick={onClick}
                aria-pressed={active}>
            {active && <span>✓</span>}{label}
        </Button>
    )
}

function Field({label, required, children}: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div style={{marginBottom: "1.5rem"}}>
            <label style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 6
            }}>
                {label}{required && <span style={{color: "var(--destructive)", marginLeft: 4}}>*</span>}
            </label>
            {children}
        </div>
    )
}

export default function ClientOnboardingPage() {
    const router = useRouter()
    const [form, setForm] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dadataLoading, setDadataLoading] = useState(false)
    const [innNotFound, setInnNotFound] = useState(false)
    const [bikNotFound, setBikNotFound] = useState(false)
    const [profileLocks, setProfileLocks] = useState({name: false, email: false})

    useEffect(() => {
        fetch("/api/mock-client/apply?source=onboarding")
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

    const toggleChip = (field: string, value: string) => {
        const cur = (form[field] ?? "").split(",").map(s => s.trim()).filter(Boolean)
        setForm(f => ({
            ...f,
            [field]: (cur.includes(value) ? cur.filter(s => s !== value) : [...cur, value]).join(", ")
        }))
    }
    const activeChips = (field: string) => new Set((form[field] ?? "").split(",").map(s => s.trim()).filter(Boolean))

    const isIP = form.legalForm === "ИП"
    const isLegal = ["ООО", "АО", "ПАО"].includes(form.legalForm ?? "")

    const lookupInn = async (inn: string) => {
        setForm(f => ({...f, inn}))
        setInnNotFound(false)
        const clean = inn.replace(/\D/g, "")
        if ((isIP && clean.length === 12) || (isLegal && clean.length === 10)) {
            setDadataLoading(true)
            try {
                const res = await fetch("/api/dadata/party", {
                    method: "POST", headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({inn: clean}),
                })
                const data = await res.json()
                if (data.found) {
                    setForm(f => ({
                        ...f,
                        company: data.name ?? f.company ?? "",
                        kpp: data.kpp ?? "",
                        ogrn: data.ogrn ?? "",
                        legalAddress: data.address ?? "",
                    }))
                } else if (!data.degraded) {
                    setInnNotFound(true)
                }
            } catch { /* ignore */
            } finally {
                setDadataLoading(false)
            }
        }
    }

    const lookupBik = async (bik: string) => {
        setForm(f => ({...f, bankBik: bik}))
        setBikNotFound(false)
        if (bik.replace(/\D/g, "").length === 9) {
            try {
                const res = await fetch("/api/dadata/bank", {
                    method: "POST", headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({bik: bik.replace(/\D/g, "")}),
                })
                const data = await res.json()
                if (data.found) {
                    setForm(f => ({...f, bankName: data.bankName ?? "", corrAccount: data.corrAccount ?? ""}))
                } else if (!data.degraded) {
                    setBikNotFound(true)
                }
            } catch { /* ignore */
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        const reqErr = validateClientRequisitesForm(form)
        if (reqErr) {
            setError(reqErr)
            return
        }
        const el = e.currentTarget
        if (!el.checkValidity()) {
            el.reportValidity()
            return
        }
        setLoading(true)
        try {
            const res = await fetch("/api/mock-client/apply?source=onboarding", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(form)
            })
            if (!res.ok) {
                const body = (await res.json().catch(() => ({}))) as { error?: string }
                throw new Error(body.error ?? "Ошибка сохранения")
            }
            setSaved(true)
            setTimeout(() => router.push("/orders"), 800)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка")
        } finally {
            setLoading(false)
        }
    }

    return (
        <OnboardingShell title="Анкета" backHref="/orders" backLabel="Кабинет" withBg>
            <div className="mx-auto max-w-2xl px-6 py-12">
                <div className="mb-10">
                    <h1 style={{color: "var(--foreground)", fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 500, margin: 0}}>
                        Анкета заказчика
                    </h1>
                    <p style={{color: "rgba(255,255,255,0.45)", marginTop: "8px", fontSize: "1rem"}}>
                        Расскажите о себе: это поможет подобрать подходящего специалиста
                    </p>
                </div>

                <AppCard glass>
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        onKeyDown={(e) => {
                            // Enter в любом однострочном поле не должен незаметно отправлять анкету —
                            // только явный клик по кнопке «Отправить».
                            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                                e.preventDefault()
                            }
                        }}
                    >
                        <div className="rwd-grid-2" style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem"}}>
                            {([["firstName", "Имя", "Иван"], ["lastName", "Фамилия", "Иванов"]] as const).map(([key, label, ph]) => (
                                <Field key={key} label={label} required>
                                    <Input type="text" required placeholder={ph} value={form[key] || ""}
                                           autoComplete={key === "firstName" ? "given-name" : "family-name"}
                                           onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                                           disabled={profileLocks.name}
                                           aria-readonly={profileLocks.name}
                                           title={profileLocks.name ? "Значение получено из профиля" : undefined}/>
                                </Field>
                            ))}
                        </div>
                        <div className="rwd-grid-2" style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem"}}>
                            <Field label="Email" required>
                                <Input type="email" required placeholder="ivan@example.com" value={form.email || ""}
                                       onChange={e => setForm(f => ({...f, email: e.target.value}))}
                                       disabled={profileLocks.email}
                                       aria-readonly={profileLocks.email}
                                       title={profileLocks.email ? "Значение получено из профиля" : undefined}/>
                            </Field>
                            <Field label="Сайт компании">
                                <Input type="url" placeholder="https://example.com" value={form.website || ""}
                                       onChange={e => setForm(f => ({...f, website: e.target.value}))}/>
                            </Field>
                        </div>
                        <Field label="Правовая форма" required>
                            <div style={{display: "flex", flexWrap: "wrap", gap: "0.375rem"}}>
                                {LEGAL_FORM_CHIPS.map(c => (
                                    <Chip key={c} label={c} active={form.legalForm === c}
                                          onClick={() => {
                                              setInnNotFound(false)
                                              setForm(f => ({...f, legalForm: c}))
                                          }}/>
                                ))}
                            </div>
                            <p style={{fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", margin: "8px 0 0"}}>
                                ООО, АО, ПАО: полный комплект реквизитов юрлица. ИП: реквизиты ИП. ИНН и БИК при вводе
                                можно подставить через DaData.
                            </p>
                        </Field>

                        {(isLegal || isIP) && (
                            <>
                                <Field label="ИНН" required>
                                    <div style={{position: "relative"}}>
                                        <Input
                                            type="text"
                                            required
                                            placeholder={isIP ? "123456789012" : "7707083893"}
                                            value={form.inn || ""}
                                            onChange={e => lookupInn(e.target.value)}
                                            style={highlightedAutoFillInputStyle}
                                            maxLength={isIP ? 12 : 10}
                                            inputMode="numeric"
                                        />
                                        <div style={{
                                            fontSize: "0.75rem",
                                            color: "rgba(255,255,255,0.38)",
                                            marginTop: 6
                                        }}>
                                            Подтянем данные автоматически после ввода ИНН.
                                        </div>
                                        {innNotFound && (
                                            <div style={{
                                                fontSize: "0.75rem",
                                                color: "var(--destructive)",
                                                marginTop: 2
                                            }}>
                                                Компания с таким ИНН не найдена. Заполните реквизиты вручную.
                                            </div>
                                        )}
                                        {dadataLoading && <span style={{
                                            position: "absolute",
                                            right: 12,
                                            top: 14,
                                            fontSize: "0.75rem",
                                            color: "rgba(255,255,255,0.3)"
                                        }}><Icon name="hourglass"/></span>}
                                    </div>
                                </Field>

                                <Field label={isIP ? "Наименование / ФИО ИП" : "Наименование организации"} required>
                                    <Input
                                        type="text"
                                        required
                                        placeholder={isIP ? "Как в ЕГРИП" : "ООО «Пространство»"}
                                        value={form.company || ""}
                                        onChange={e => setForm(f => ({...f, company: e.target.value}))}
                                    />
                                </Field>

                                {isLegal && (
                                    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem"}}>
                                        <Field label="КПП" required>
                                            <Input
                                                type="text"
                                                required
                                                placeholder="770701001"
                                                value={form.kpp || ""}
                                                onChange={e => setForm(f => ({...f, kpp: e.target.value}))}
                                                maxLength={9}
                                                inputMode="numeric"
                                            />
                                        </Field>
                                        <Field label="ОГРН" required>
                                            <Input
                                                type="text"
                                                required
                                                placeholder="1027700132195"
                                                value={form.ogrn || ""}
                                                onChange={e => setForm(f => ({...f, ogrn: e.target.value}))}
                                                maxLength={13}
                                                inputMode="numeric"
                                            />
                                        </Field>
                                    </div>
                                )}

                                {isIP && (
                                    <Field label="ОГРНИП" required>
                                        <Input
                                            type="text"
                                            required
                                            placeholder="304770000000000"
                                            value={form.ogrn || ""}
                                            onChange={e => setForm(f => ({...f, ogrn: e.target.value}))}
                                            maxLength={15}
                                            inputMode="numeric"
                                        />
                                    </Field>
                                )}

                                <Field label={isIP ? "Адрес регистрации" : "Юридический адрес"} required>
                                    <Input type="text" required placeholder="г. Москва, ул. Примерная, д. 1"
                                           value={form.legalAddress || ""}
                                           onChange={e => setForm(f => ({...f, legalAddress: e.target.value}))}/>
                                </Field>

                                <div className="rwd-grid-2" style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem"}}>
                                    <Field label="БИК" required>
                                        <Input type="text" required placeholder="044525974" value={form.bankBik || ""}
                                               onChange={e => lookupBik(e.target.value)}
                                               style={highlightedAutoFillInputStyle} maxLength={9} inputMode="numeric"/>
                                        <div style={{
                                            fontSize: "0.75rem",
                                            color: "rgba(255,255,255,0.38)",
                                            marginTop: 6
                                        }}>
                                            Подтянем банк автоматически после ввода БИК.
                                        </div>
                                        {bikNotFound && (
                                            <div style={{
                                                fontSize: "0.75rem",
                                                color: "var(--destructive)",
                                                marginTop: 2
                                            }}>
                                                Банк с таким БИК не найден. Заполните реквизиты вручную.
                                            </div>
                                        )}
                                    </Field>
                                    <Field label="Банк" required>
                                        <Input type="text" required placeholder="АО «Т-Банк»"
                                               value={form.bankName || ""}
                                               onChange={e => setForm(f => ({...f, bankName: e.target.value}))}/>
                                    </Field>
                                </div>
                                <Field label="Корр. счет" required>
                                    <Input type="text" required placeholder="30101810000000000000"
                                           value={form.corrAccount || ""}
                                           onChange={e => setForm(f => ({...f, corrAccount: e.target.value}))} maxLength={20}/>
                                </Field>
                                <Field label="Расчетный счет" required>
                                    <Input type="text" required placeholder="40702810000000000000"
                                           value={form.bankAccount || ""}
                                           onChange={e => setForm(f => ({...f, bankAccount: e.target.value}))} maxLength={20}/>
                                </Field>
                            </>
                        )}
                        <Field label="Должность">
                            <div style={{display: "flex", flexWrap: "wrap", gap: "0.375rem"}}>
                                {POSITION_CHIPS.map(c => <Chip key={c} label={c} active={activeChips("position").has(c)}
                                                               onClick={() => toggleChip("position", c)}/>)}
                            </div>
                        </Field>
                        <Field label="Город">
                            <Input type="text" placeholder="Москва" value={form.city || ""}
                                   onChange={e => setForm(f => ({...f, city: e.target.value}))}/>
                        </Field>

                        {error && (
                            <div style={{
                                background: "rgba(248,113,113,0.1)",
                                borderRadius: 8,
                                padding: "0.625rem 1rem",
                                marginBottom: "1rem",
                                color: "var(--destructive)",
                                fontSize: "0.875rem"
                            }}>{error}</div>
                        )}

                        <Button type="submit" size="lg" disabled={loading || saved} className="w-full">
                            {saved ? "✓ Сохранено" : loading ? "Сохранение…" : "Сохранить и продолжить →"}
                        </Button>
                    </form>
                </AppCard>
            </div>
            <style>{`
        /* phone field removed: keep style block for future extensions */
      `}</style>
            <ClientDashFooter variant="dark"/>
        </OnboardingShell>
    )
}
