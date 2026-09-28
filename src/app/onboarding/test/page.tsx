"use client"

import {type CSSProperties, useCallback, useEffect, useMemo, useRef, useState} from "react"
import {useRouter} from "next/navigation"
import {OnboardingShell} from "@/components/app/OnboardingShell"
import {AppCard} from "@/components/app/AppCard"
import {Button} from "@/components/ui/button"
import {confirmDialog} from "@/lib/dialog-store"
import {type DecodedQuizQuestion, decodeQuizQuestionWire, type NexusQuizQuestionWire,} from "@/lib/onboarding/quiz-wire"
import {logQuizAnswerHint} from "@/lib/dev-quiz-hint"
import type {QuizLevelCode, QuizLevelMeta} from "@/lib/onboarding/levels/types"

const LETTERS = ["А", "Б", "В", "Г"]
const QUESTION_TIME_LIMIT_SEC = 30
const RETRY_COOLDOWN_SEC = 60
/** Доля неверных ответов от общего числа вопросов, после которой тест прерывается досрочно — дальше уже не сдать. */
const EARLY_FAIL_WRONG_RATIO = 0.2

const protectQuizSurface: CSSProperties = {
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
}

type QuizResume = {
    answers: Record<string, number>
    answeredCount: number
    liveCorrect: number
    total: number
    lastQuestionId: number
    currentQuestionId: number
    questionDeadlineAt: string | null
}

type QuizPayload = {
    level: QuizLevelCode
    levelTitle: string
    levels: QuizLevelMeta[]
    availableLevels: QuizLevelCode[]
    attemptsByLevel: Record<string, number>
    passPercent: number
    total: number
    questions: DecodedQuizQuestion[]
    /** Wire (base64) для data-* в DOM; текст вопроса в сети не дублируем открытым видом. */
    questionsWire: NexusQuizQuestionWire[]
    resume: QuizResume | null
    /** Только dev: questionId → индекс правильного варианта (в показанном порядке). */
    devAnswers?: Record<string, number>
}

export default function OnboardingTestPage() {
    const router = useRouter()
    const [gate, setGate] = useState<"loading" | "ok" | "error">("loading")
    const [gateMessage, setGateMessage] = useState("")
    const [gateCode, setGateCode] = useState<string | null>(null)
    const [payload, setPayload] = useState<QuizPayload | null>(null)
    const [selectedLevel, setSelectedLevel] = useState<QuizLevelCode>("L1")

    const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro")
    const [qIndex, setQIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<number, number>>({})
    const [answerResults, setAnswerResults] = useState<Record<number, boolean>>({}) // questionId → isCorrect
    const [liveScore, setLiveScore] = useState(0)
    const [revealed, setRevealed] = useState(false)
    const [revealFb, setRevealFb] = useState<{ isCorrect: boolean; correctIndex: number; explain: string } | null>(null)
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT_SEC)

    const [submitting, setSubmitting] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [resultFail, setResultFail] = useState<{
        correctCount: number;
        total: number;
        percent: number;
        passPercent: number;
        attemptsLeft: number
    } | null>(
        null
    )
    const [resultOk, setResultOk] = useState<{ percent: number; transitionText?: string } | null>(null)
    const [resultExhausted, setResultExhausted] = useState<{
        level: QuizLevelCode;
        onboardingStatus: string;
        comment?: string
    } | null>(null)
    const [cooldownLeft, setCooldownLeft] = useState<number>(0)
    const [lastAttemptTimestamp, setLastAttemptTimestamp] = useState<number | null>(null)
    /** Неверные ответы, унаследованные из сохранённого прогресса при возобновлении (там нет результата по вопросу, только сводный liveCorrect). */
    const [baselineWrongCount, setBaselineWrongCount] = useState(0)
    const revealInFlightRef = useRef(false)
    const advanceInFlightRef = useRef(false)
    const earlyFailTriggeredRef = useRef(false)
    const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const stopQuestionTimer = useCallback(() => {
        if (questionTimerRef.current) {
            clearInterval(questionTimerRef.current)
            questionTimerRef.current = null
        }
    }, [])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            const res = await fetch(`/api/onboarding/quiz?level=${selectedLevel}`)
            const data = await res.json().catch(() => ({}))
            if (cancelled) return
            if (!res.ok) {
                setGate("error")
                setGateMessage(typeof data.error === "string" ? data.error : "Не удалось загрузить тест")
                setGateCode(typeof data.code === "string" ? data.code : null)
                return
            }
            const wire = data.questions as NexusQuizQuestionWire[]
            if (!Array.isArray(wire) || wire.length === 0) {
                setGate("error")
                setGateMessage("Некорректный ответ сервера")
                return
            }
            const questions = wire.map(decodeQuizQuestionWire)
            setPayload({
                level: (data.level as QuizLevelCode) ?? selectedLevel,
                levelTitle: String(data.levelTitle ?? selectedLevel),
                levels: Array.isArray(data.levels) ? (data.levels as QuizLevelMeta[]) : [],
                availableLevels: Array.isArray(data.availableLevels) ? (data.availableLevels as QuizLevelCode[]) : [selectedLevel],
                attemptsByLevel:
                    data.attemptsByLevel && typeof data.attemptsByLevel === "object"
                        ? (data.attemptsByLevel as Record<string, number>)
                        : {},
                passPercent: Number(data.passPercent),
                total: Number(data.total) || questions.length,
                questions,
                questionsWire: wire,
                resume: data.resume ?? null,
                devAnswers: (data.devAnswers as Record<string, number> | undefined) ?? undefined,
            })
            setGate("ok")
        })()
        return () => {
            cancelled = true
        }
    }, [selectedLevel])

    const resetRun = useCallback(() => {
        const now = Date.now()
        if (lastAttemptTimestamp && now - lastAttemptTimestamp < RETRY_COOLDOWN_SEC * 1000) {
            return
        }
        setPhase("intro")
        setQIndex(0)
        setAnswers({})
        setAnswerResults({})
        setBaselineWrongCount(0)
        setLiveScore(0)
        setRevealed(false)
        setRevealFb(null)
        setTimeLeft(QUESTION_TIME_LIMIT_SEC)
        setServerError(null)
        setResultFail(null)
        setResultOk(null)
        setResultExhausted(null)
        earlyFailTriggeredRef.current = false
    }, [lastAttemptTimestamp])

    const applyResume = useCallback((p: QuizPayload, opts?: { freshTimer?: boolean }) => {
        const r = p.resume
        earlyFailTriggeredRef.current = false
        if (!r) {
            setQIndex(0)
            setAnswers({})
            setAnswerResults({})
            setBaselineWrongCount(0)
            setLiveScore(0)
            setRevealed(false)
            setRevealFb(null)
            setServerError(null)
            setTimeLeft(QUESTION_TIME_LIMIT_SEC)
            setPhase("quiz")
            return
        }
        if (r.answeredCount > 0) {
            const ans: Record<number, number> = {}
            for (const [k, v] of Object.entries(r.answers)) ans[Number(k)] = v
            setAnswers(ans)
            setLiveScore(r.liveCorrect)
            // Сохранённый прогресс не хранит верно/неверно по каждому вопросу — только сводный
            // liveCorrect, поэтому неверные из прошлой сессии переносим как единое число.
            setBaselineWrongCount(Math.max(0, r.answeredCount - r.liveCorrect))
        } else {
            setAnswers({})
            setAnswerResults({})
            setBaselineWrongCount(0)
            setLiveScore(0)
        }
        const idxByCurrent = p.questions.findIndex((q) => q.id === r.currentQuestionId)
        const idxByAnswers = p.questions.findIndex((q) => r.answers[String(q.id)] === undefined)
        const idx = idxByCurrent >= 0 ? idxByCurrent : idxByAnswers
        const resolvedIdx = idx === -1 ? Math.max(0, p.questions.length - 1) : idx
        setQIndex(resolvedIdx)
        setRevealed(false)
        setRevealFb(null)
        setServerError(null)
        const resumeQuestionId = r.currentQuestionId
        const resumeDeadline = r.questionDeadlineAt ? new Date(r.questionDeadlineAt).getTime() : NaN
        const hasResumeDeadline = Number.isFinite(resumeDeadline)
        const hasQuestionInResume = p.questions[resolvedIdx]?.id === resumeQuestionId
        const resumeTimeLeft =
            opts?.freshTimer || !hasResumeDeadline || !hasQuestionInResume
                ? QUESTION_TIME_LIMIT_SEC
                : Math.max(0, Math.floor((resumeDeadline - Date.now()) / 1000))
        setTimeLeft(resumeTimeLeft)
        setPhase("quiz")
    }, [])

    const questions = useMemo(() => payload?.questions ?? [], [payload])
    const questionsWire = useMemo(() => payload?.questionsWire ?? [], [payload])
    const total = questions.length
    const passPercent = payload?.passPercent ?? 70
    const current = questions[qIndex]
    const currentWire = questionsWire[qIndex]
    const isCurrentTimedOut = current ? answers[current.id] === -1 : false
    const currentLevelIdx = payload ? payload.levels.findIndex((lvl) => lvl.code === payload.level) : -1
    const nextLevelMeta = currentLevelIdx >= 0 && payload ? payload.levels[currentLevelIdx + 1] : undefined

    const submitReveal = useCallback(async (optionIdx: number | null) => {
        if (!current || revealed || submitting || revealInFlightRef.current) return false
        revealInFlightRef.current = true
        stopQuestionTimer()
        const reqPayload =
            optionIdx === null
                ? {level: payload?.level ?? selectedLevel, questionId: current.id, timedOut: true}
                : {level: payload?.level ?? selectedLevel, questionId: current.id, selectedIndex: optionIdx}
        try {
            const res = await fetch("/api/onboarding/quiz/reveal", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(reqPayload),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                if (data.code === "QUESTION_ORDER") {
                    setServerError("Сессия теста рассинхронизирована. Обновите страницу и нажмите «Продолжить тест».")
                } else {
                    setServerError(typeof data.error === "string" ? data.error : "Ошибка проверки ответа")
                }
                return false
            }
            const savedIndex =
                typeof data.savedIndex === "number" && Number.isInteger(data.savedIndex)
                    ? data.savedIndex
                    : optionIdx === null
                        ? -1
                        : optionIdx
            setAnswers((a) => ({...a, [current.id]: savedIndex}))
            setAnswerResults((r) => ({...r, [current.id]: Boolean(data.isCorrect)}))
            if (data.progress && typeof data.progress.liveCorrect === "number") {
                setLiveScore(Number(data.progress.liveCorrect))
            } else if (data.isCorrect) {
                setLiveScore((s) => s + 1)
            }
            setRevealFb({
                isCorrect: Boolean(data.isCorrect),
                correctIndex: Number(data.correctIndex),
                explain: String(data.explain ?? ""),
            })
            setRevealed(true)
            return true
        } finally {
            revealInFlightRef.current = false
        }
    }, [current, revealed, submitting, payload, selectedLevel, stopQuestionTimer])

    const handleOptionPick = async (optionIdx: number) => {
        stopQuestionTimer()
        await submitReveal(optionIdx)
    }

    const wrongCount = useMemo(
        () => baselineWrongCount + Object.values(answerResults).filter((v) => v === false).length,
        [baselineWrongCount, answerResults],
    )

    const handleEarlyFail = useCallback(async () => {
        stopQuestionTimer()
        await confirmDialog({
            title: "Тест уже не пройти",
            description: "Слишком много неверных ответов: минимальный проходной балл больше недостижим. Попробуйте снова.",
            confirmLabel: "Понятно",
            cancelLabel: "Понятно",
            variant: "destructive",
        })
        setSubmitting(true)
        setServerError(null)
        const bodyAnswers: Record<string, number> = {}
        for (const q of questions) {
            bodyAnswers[String(q.id)] = answers[q.id] ?? -1
        }
        const res = await fetch("/api/onboarding/step", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({type: "TEST", level: payload?.level ?? selectedLevel, answers: bodyAnswers}),
        })
        const data = await res.json().catch(() => ({}))
        setSubmitting(false)
        if (res.status === 422 && data) {
            setLastAttemptTimestamp(Date.now())
            setCooldownLeft(RETRY_COOLDOWN_SEC)
            setPhase("result")
            if (data.exhausted && data.onboardingStatus) {
                setResultExhausted({
                    level: (data.level as QuizLevelCode) ?? selectedLevel,
                    onboardingStatus: data.onboardingStatus,
                    comment: typeof data.comment === "string" ? data.comment : undefined,
                })
            } else {
                setResultFail({
                    correctCount: Number(data.correctCount),
                    total: Number(data.total),
                    percent: Number(data.percent),
                    passPercent: Number(data.passPercent),
                    attemptsLeft: Number(data.attemptsLeft ?? 0),
                })
            }
            return
        }
        if (!res.ok) {
            setServerError(typeof data.error === "string" ? data.error : "Ошибка отправки")
            return
        }
        // На практике недостижимо при 20%+ неверных, но на случай смены порога/бонусов — не оставляем экран пустым.
        setPhase("result")
        setResultOk({
            percent: Number(data.percent),
            transitionText: typeof data.transitionText === "string" ? data.transitionText : undefined,
        })
        setTimeout(() => router.push("/onboarding"), 1800)
    }, [questions, answers, payload, selectedLevel, router, stopQuestionTimer])

    useEffect(() => {
        if (phase !== "quiz" || total === 0 || earlyFailTriggeredRef.current) return
        const threshold = Math.ceil(total * EARLY_FAIL_WRONG_RATIO)
        if (wrongCount < threshold) return
        earlyFailTriggeredRef.current = true
        void handleEarlyFail()
    }, [wrongCount, phase, total, handleEarlyFail])

    // Dev: правильный вариант текущего вопроса — в консоль браузера.
    useEffect(() => {
        if (phase !== "quiz" || !current) return
        logQuizAnswerHint({
            quiz: `Квалификационный тест ${payload?.level ?? ""}`.trim(),
            position: qIndex + 1,
            total,
            question: current.text,
            options: current.options,
            correctIndex: payload?.devAnswers?.[String(current.id)],
        })
    }, [phase, current, qIndex, total, payload])

    useEffect(() => {
        // earlyFailTriggeredRef: досрочный провал уже остановил таймер и показывает диалог —
        // не даём этому эффекту снова его завести (может сработать сразу при возобновлении,
        // если унаследованных неверных уже хватает на порог).
        if (phase !== "quiz" || !current || revealed || submitting || earlyFailTriggeredRef.current) return
        stopQuestionTimer()
        const id = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(id)
                    questionTimerRef.current = null
                    void submitReveal(null)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        questionTimerRef.current = id
        return () => {
            clearInterval(id)
            if (questionTimerRef.current === id) questionTimerRef.current = null
        }
    }, [phase, current, revealed, submitting, submitReveal, stopQuestionTimer])

    // Cooldown timer
    useEffect(() => {
        if (cooldownLeft <= 0) return
        const id = setInterval(() => {
            setCooldownLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(id)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(id)
    }, [cooldownLeft])

    const goNext = useCallback(() => {
        if (!revealed || qIndex >= total - 1 || advanceInFlightRef.current) return
        advanceInFlightRef.current = true
        stopQuestionTimer()
        setQIndex((i) => i + 1)
        setTimeLeft(QUESTION_TIME_LIMIT_SEC)
        setRevealed(false)
        setRevealFb(null)
    }, [revealed, qIndex, total, stopQuestionTimer])

    useEffect(() => {
        advanceInFlightRef.current = false
    }, [qIndex])

    const finishQuiz = useCallback(async () => {
        if (!revealed || qIndex < total - 1 || advanceInFlightRef.current) return
        advanceInFlightRef.current = true
        setSubmitting(true)
        setServerError(null)
        const bodyAnswers: Record<string, number> = {}
        for (const q of questions) {
            bodyAnswers[String(q.id)] = answers[q.id] ?? -1
        }
        const res = await fetch("/api/onboarding/step", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({type: "TEST", level: payload?.level ?? selectedLevel, answers: bodyAnswers}),
        })
        const data = await res.json().catch(() => ({}))
        setSubmitting(false)
        if (res.status === 422 && data) {
            const now = Date.now()
            setLastAttemptTimestamp(now)
            setCooldownLeft(RETRY_COOLDOWN_SEC)

            if (data.exhausted && data.onboardingStatus) {
                setPhase("result")
                setResultExhausted({
                    level: (data.level as QuizLevelCode) ?? selectedLevel,
                    onboardingStatus: data.onboardingStatus,
                    comment: typeof data.comment === "string" ? data.comment : undefined
                })
                return
            }
            setPhase("result")
            setResultFail({
                correctCount: Number(data.correctCount),
                total: Number(data.total),
                percent: Number(data.percent),
                passPercent: Number(data.passPercent),
                attemptsLeft: Number(data.attemptsLeft ?? 0)
            })
            return
        }
        if (!res.ok) {
            advanceInFlightRef.current = false
            setServerError(typeof data.error === "string" ? data.error : "Ошибка отправки")
            return
        }
        setPhase("result")
        setResultOk({
            percent: Number(data.percent),
            transitionText: typeof data.transitionText === "string" ? data.transitionText : undefined
        })
        setTimeout(() => router.push("/onboarding"), 1800)
    }, [revealed, qIndex, total, questions, answers, router, payload, selectedLevel])

    useEffect(() => {
        // earlyFailTriggeredRef: досрочный провал (20%+ неверных) уже показывает свой диалог и сам
        // отправляет попытку — обычный переход к следующему вопросу/завершению здесь не нужен.
        if (phase !== "quiz" || !revealed || !isCurrentTimedOut || submitting || earlyFailTriggeredRef.current) return
        const timeoutId = setTimeout(() => {
            if (qIndex >= total - 1) {
                void finishQuiz()
            } else {
                goNext()
            }
        }, 1500)
        return () => clearTimeout(timeoutId)
    }, [phase, revealed, isCurrentTimedOut, submitting, qIndex, total, goNext, finishQuiz])

    const progressPct = total > 0 ? Math.round(((qIndex + 1) / total) * 100) : 0

    return (
        <OnboardingShell title="Квалификационный тест" backHref="/onboarding" backLabel="Онбординг" withBg>
            <div className="mx-auto max-w-xl px-6 py-12">
                {gate === "loading" && (
                    <p style={{color: "rgba(255,255,255,0.45)", fontSize: "0.875rem"}}>Загрузка теста…</p>
                )}

                {gate === "error" && (
                    <AppCard glass>
                        <p style={{color: "var(--destructive)", fontSize: "0.875rem", margin: 0}}>{gateMessage}</p>
                        <p style={{color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", marginTop: "12px"}}>
                            {gateCode === "AWAITING_ADMIN"
                                ? "Следующий этап теста откроется после подтверждения администратором. Обновите страницу позже или вернитесь в онбординг."
                                : "После приглашения администратора обновите страницу. В демо-режиме доступ открывается автоматически после отправки анкеты."}
                        </p>
                    </AppCard>
                )}

                {gate === "ok" && payload && phase === "intro" && (
                    <>
                        <div className="mb-8">
                            <h1
                                style={{
                                    color: "var(--foreground)",
                                    fontSize: "clamp(1.4rem,3vw,1.85rem)",
                                    fontWeight: 500,
                                    margin: 0,
                                    lineHeight: 1.2,
                                }}
                            >
                                Квалификационный тест
                            </h1>
                        </div>
                        <div className="mb-6" style={{display: "grid", gap: 8}}>
                            {payload.levels.map((lvl) => {
                                const selected = selectedLevel === lvl.code
                                const attempts = payload.attemptsByLevel[lvl.code] ?? 0
                                const available = payload.availableLevels.includes(lvl.code)
                                return (
                                    <Button
                                        key={lvl.code}
                                        type="button"
                                        variant="outline"
                                        disabled={!available}
                                        onClick={() => setSelectedLevel(lvl.code)}
                                        className="h-auto w-full justify-start whitespace-normal text-left"
                                        style={selected ? {
                                            borderColor: "var(--success)",
                                            background: "color-mix(in oklab, var(--success) 12%, transparent)",
                                        } : undefined}
                                    >
                                        <span style={{padding: "10px 4px"}}>
                                            {lvl.title} · {lvl.questionsCount} вопросов · попыток: {attempts}
                                        </span>
                                    </Button>
                                )
                            })}
                        </div>
                        <div className="flex flex-wrap gap-8 mb-8"
                             style={{color: "rgba(255,255,255,0.5)", fontSize: "0.875rem"}}>
                            <div>
                                <div style={{
                                    color: "var(--foreground)",
                                    fontSize: "1.5rem",
                                    fontWeight: 600,
                                    lineHeight: 1
                                }}>{total}</div>
                                <div>вопросов</div>
                            </div>
                            <div>
                                <div style={{
                                    color: "var(--foreground)",
                                    fontSize: "1.5rem",
                                    fontWeight: 600,
                                    lineHeight: 1
                                }}>{passPercent}%
                                </div>
                                <div>проходной балл</div>
                            </div>
                            <div>
                                <div style={{
                                    color: "var(--foreground)",
                                    fontSize: "1.5rem",
                                    fontWeight: 600,
                                    lineHeight: 1
                                }}>{payload.level}</div>
                                <div>уровень</div>
                            </div>
                        </div>
                        {payload.resume && payload.resume.answeredCount > 0 ? (
                            <div className="flex flex-col gap-3">
                                <AppCard glass>
                                    <p style={{
                                        color: "rgba(255,255,255,0.75)",
                                        fontSize: "0.875rem",
                                        margin: 0,
                                        lineHeight: 1.5
                                    }}>
                                        Сохранен прогресс: отвечено <strong
                                        style={{color: "var(--foreground)"}}>{payload.resume.answeredCount}</strong> из{" "}
                                        {total}. Верных на данный момент (по сохраненным ответам):{" "}
                                        <strong style={{color: "var(--foreground)"}}>{payload.resume.liveCorrect}</strong>.
                                    </p>
                                    <p style={{
                                        color: "rgba(255,255,255,0.35)",
                                        fontSize: "0.75rem",
                                        margin: "12px 0 0",
                                        lineHeight: 1.45
                                    }}>
                                        Сбросить незавершенный тест и начать с чистого листа может только администратор.
                                    </p>
                                </AppCard>
                                <Button
                                    type="button"
                                    size="lg"
                                    onClick={() => applyResume(payload, {freshTimer: false})}
                                    className="w-full"
                                >
                                    Продолжить тест →
                                </Button>
                            </div>
                        ) : (
                            <Button
                                type="button"
                                variant="secondary"
                                size="lg"
                                onClick={() => {
                                    if (payload) applyResume(payload, {freshTimer: true})
                                }}
                                className="w-full"
                            >
                                Начать тест →
                            </Button>
                        )}
                    </>
                )}

                {gate === "ok" && phase === "quiz" && current && (
                    <>
                        <div className="mb-4 flex justify-between items-center" style={{fontSize: "0.875rem"}}>
              <span style={{color: "rgba(255,255,255,0.45)"}}>
                Вопрос {qIndex + 1} из {total}
              </span>
                            <span style={{color: "rgba(255,255,255,0.65)", fontWeight: 600}}>
                {liveScore} верных из {Object.keys(answers).length} отвеченных
              </span>
                        </div>
                        <div
                            style={{
                                color: timeLeft <= 5 ? "var(--destructive)" : "rgba(255,255,255,0.55)",
                                fontSize: "0.75rem",
                                marginBottom: "0.5rem",
                                fontWeight: timeLeft <= 5 ? 700 : 500,
                                letterSpacing: timeLeft <= 5 ? "0.03em" : "normal",
                            }}
                        >
                            {timeLeft <= 5 ? "Срочно: " : "Время на вопрос: "}
                            00:{String(timeLeft).padStart(2, "0")}
                        </div>
                        <div
                            style={{
                                height: 6,
                                borderRadius: 14,
                                background: "rgba(255,255,255,0.08)",
                                overflow: "hidden",
                                marginBottom: "0.625rem",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: "100%",
                                    transform: `scaleX(${progressPct / 100})`,
                                    transformOrigin: "left",
                                    borderRadius: 14,
                                    background: "var(--success)",
                                    transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                                }}
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: 4,
                                flexWrap: "wrap",
                                marginBottom: "1rem",
                                justifyContent: "space-between",
                            }}
                            aria-label="Прогресс: зеленый (верно), красный (неверно); наведите на сегмент, чтобы увидеть выбранный ответ"
                        >
                            {Array.from({length: total}, (_, i) => {
                                const q = questions[i]
                                const qId = q?.id
                                const isAnswered = qId !== undefined && answers[qId] !== undefined
                                const hasResult = qId !== undefined && answerResults[qId] !== undefined
                                const isCorrect = hasResult && answerResults[qId] === true
                                const isWrong = hasResult && !isCorrect
                                const state: "pending" | "correct" | "wrong" | "answered" =
                                    !isAnswered ? "pending" : !hasResult ? "answered" : isCorrect ? "correct" : "wrong"
                                const tooltip = !isAnswered
                                    ? `Вопрос ${i + 1}: ещё не отвечен`
                                    : !hasResult
                                        ? `Вопрос ${i + 1}: отвечен`
                                        : isCorrect
                                            ? `Вопрос ${i + 1}: верно`
                                            : answers[qId!] === -1
                                                ? `Вопрос ${i + 1}: время вышло`
                                                : `Вопрос ${i + 1}: неверно`
                                const bg =
                                    state === "correct"
                                        ? "var(--success)"
                                        : state === "wrong"
                                            ? "var(--destructive)"
                                            : state === "answered"
                                                ? "rgba(255,255,255,0.35)"
                                                : "rgba(255,255,255,0.12)"
                                return (
                                    <div
                                        key={i}
                                        title={tooltip}
                                        style={{
                                            flex: "1 1 0",
                                            minWidth: 3,
                                            maxWidth: 14,
                                            height: 5,
                                            borderRadius: 4,
                                            background: bg,
                                            transition: "background 0.2s, transform 0.15s",
                                            cursor: state === "pending" ? "default" : "help",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (state !== "pending") e.currentTarget.style.transform = "scaleY(1.35)"
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "scaleY(1)"
                                        }}
                                    />
                                )
                            })}
                        </div>

                        <AppCard glass key={current.id}>
                            <div
                                role="presentation"
                                data-nexus-quiz-protected="1"
                                {...(currentWire
                                    ? {
                                        "data-quiz-section-b64": currentWire.s64,
                                        "data-quiz-text-b64": currentWire.t64,
                                    }
                                    : {})}
                                style={protectQuizSurface}
                                onCopy={(e) => e.preventDefault()}
                                onCut={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                            >
                                <div
                                    style={{
                                        display: "inline-block",
                                        fontSize: "0.75rem",
                                        fontWeight: 500,
                                        color: "rgba(255,255,255,0.4)",
                                        background: "rgba(255,255,255,0.06)",
                                        padding: "4px 12px",
                                        borderRadius: 14,
                                        marginBottom: "0.75rem",
                                    }}
                                >
                                    {current.section}
                                </div>
                                <p style={{
                                    color: "rgba(255,255,255,0.35)",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    margin: "0 0 0.5rem"
                                }}>
                                    Вопрос {qIndex + 1}
                                </p>
                                <p style={{
                                    color: "var(--foreground)",
                                    fontSize: "1rem",
                                    fontWeight: 500,
                                    lineHeight: 1.5,
                                    margin: "0 0 1.25rem"
                                }}>
                                    {current.text}
                                </p>
                                <div className="flex flex-col gap-2">
                                    {current.options.map((opt, oi) => {
                                        const picked = answers[current.id] === oi
                                        const showCorrect = revealed && revealFb && oi === revealFb.correctIndex
                                        const showWrong = revealed && picked && !revealFb?.isCorrect
                                        const stateStyle = showCorrect
                                            ? {borderColor: "var(--success)", background: "color-mix(in oklab, var(--success) 12%, transparent)"}
                                            : showWrong
                                                ? {borderColor: "var(--destructive)", background: "color-mix(in oklab, var(--destructive) 10%, transparent)"}
                                                : picked && revealed
                                                    ? {borderColor: "color-mix(in oklab, var(--success) 60%, transparent)", background: "color-mix(in oklab, var(--success) 8%, transparent)"}
                                                    : undefined
                                        return (
                                            <Button
                                                key={oi}
                                                type="button"
                                                variant="outline"
                                                disabled={revealed || submitting}
                                                onClick={() => handleOptionPick(oi)}
                                                {...(currentWire?.o64[oi] ? {"data-quiz-option-b64": currentWire.o64[oi]} : {})}
                                                className="h-auto w-full items-start justify-start gap-3 whitespace-normal text-left disabled:opacity-100"
                                                style={{
                                                    ...stateStyle,
                                                    cursor: revealed || submitting ? "default" : "pointer",
                                                    ...protectQuizSurface,
                                                }}
                                                onCopy={(e) => e.preventDefault()}
                                                onCut={(e) => e.preventDefault()}
                                            >
                        <span
                            style={{
                                flexShrink: 0,
                                width: 28,
                                height: 28,
                                marginTop: 10,
                                marginBottom: 10,
                                borderRadius: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                background: showCorrect ? "rgba(52,211,153,0.25)" : showWrong ? "rgba(248,113,113,0.2)" : "rgba(255,255,255,0.04)",
                                color: "var(--foreground)",
                            }}
                        >
                          {LETTERS[oi]}
                        </span>
                                                <span style={{padding: "12px 0", lineHeight: 1.45}}>{opt}</span>
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>

                            {revealFb && (
                                <div
                                    style={{
                                        marginTop: "1rem",
                                        padding: "14px 16px",
                                        borderRadius: 14,
                                        fontSize: "0.875rem",
                                        lineHeight: 1.55,
                                        background: revealFb.isCorrect ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.06)",
                                        color: "rgba(255,255,255,0.75)",
                                    }}
                                >
                                    <strong style={{color: revealFb.isCorrect ? "var(--success)" : "var(--destructive)"}}>
                                        {revealFb.isCorrect
                                            ? "✓ Верно."
                                            : answers[current.id] === -1
                                                ? "✗ Время вышло."
                                                : answers[current.id] === revealFb.correctIndex
                                                    ? "✗ Ответ не засчитан (истекло время на вопрос)."
                                                    : "✗ Неверно."}
                                    </strong>{" "}
                                    {revealFb.explain}
                                </div>
                            )}

                            {serverError && (
                                <p style={{
                                    color: "var(--destructive)",
                                    fontSize: "0.875rem",
                                    marginTop: "0.75rem"
                                }}>{serverError}</p>
                            )}

                            <div className="flex justify-end mt-5">
                                {revealed && qIndex < total - 1 && (
                                    <Button type="button" variant="secondary" size="lg" onClick={goNext}>
                                        Следующий вопрос →
                                    </Button>
                                )}
                                {revealed && qIndex >= total - 1 && (
                                    <Button type="button" size="lg" disabled={submitting} onClick={finishQuiz}>
                                        {submitting ? "Отправка…" : "Завершить и отправить"}
                                    </Button>
                                )}
                            </div>
                        </AppCard>
                    </>
                )}

                {phase === "result" && resultFail && (
                    <AppCard glass>
                        <h2 style={{color: "var(--destructive)", fontSize: "1.125rem", margin: "0 0 0.5rem"}}>Тест не пройден</h2>
                        <p style={{color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", lineHeight: 1.5, margin: 0}}>
                            Набрано {resultFail.correctCount} из {resultFail.total} ({resultFail.percent}%). Необходимо
                            минимум {resultFail.passPercent}%.
                            {resultFail.attemptsLeft > 0 ? (
                                <>
                                    <br/>У вас осталось <strong>{resultFail.attemptsLeft}</strong> попыток.
                                </>
                            ) : null}
                            Изучите NEXUS Designer Code и попробуйте снова.
                        </p>
                        {resultFail.attemptsLeft > 0 && (
                            <Button
                                type="button"
                                variant="secondary"
                                size="lg"
                                onClick={resetRun}
                                disabled={cooldownLeft > 0}
                                className="mt-5"
                            >
                                {cooldownLeft > 0
                                    ? `Подождите ${cooldownLeft}с`
                                    : "Пройти снова"}
                            </Button>
                        )}
                    </AppCard>
                )}

                {phase === "result" && resultExhausted && (
                    <AppCard glass style={{
                        background: resultExhausted.onboardingStatus === "INTERVIEW_INVITED"
                            ? "rgba(52,211,153,0.06)"
                            : "rgba(248,113,113,0.06)"
                    }}>
                        <h2 style={{
                            color: resultExhausted.onboardingStatus === "INTERVIEW_INVITED" ? "var(--success)" : "var(--destructive)",
                            fontSize: "1.125rem",
                            margin: "0 0 0.5rem"
                        }}>
                            {resultExhausted.onboardingStatus === "INTERVIEW_INVITED"
                                ? "Попытки на уровне ELITE исчерпаны"
                                : "Попытки по тесту исчерпаны"}
                        </h2>
                        <p style={{color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", lineHeight: 1.5, margin: 0}}>
                            {resultExhausted.comment || (
                                resultExhausted.onboardingStatus === "INTERVIEW_INVITED"
                                    ? "Мы сохранили для вас доступ к интервью и приглашаем перейти к следующему этапу."
                                    : "К сожалению, результаты не позволяют продолжить. Предлагаем пройти обучение у наших партнёров. Список программ направим отдельным письмом."
                            )}
                        </p>
                        {resultExhausted.onboardingStatus === "INTERVIEW_INVITED" && (
                            <Button
                                type="button"
                                size="lg"
                                onClick={() => router.push("/onboarding/interview")}
                                className="mt-5"
                            >
                                Перейти к интервью →
                            </Button>
                        )}
                        {resultExhausted.onboardingStatus === "REJECTED" && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="lg"
                                onClick={() => router.push("/onboarding")}
                                className="mt-5"
                            >
                                Вернуться в онбординг
                            </Button>
                        )}
                    </AppCard>
                )}

                {phase === "result" && resultOk && (
                    <AppCard glass style={{background: "rgba(52,211,153,0.06)"}}>
                        <h2 style={{color: "var(--success)", fontSize: "1.125rem", margin: "0 0 0.5rem"}}>
                            {payload ? `${payload.levelTitle} пройден` : "Тест пройден"}
                        </h2>
                        <p style={{color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", margin: 0}}>
                            Результат: {resultOk.percent}% верных ответов.
                            {resultOk.transitionText
                                ? ` ${resultOk.transitionText}`
                                : nextLevelMeta
                                    ? ` ${nextLevelMeta.title}.`
                                    : " Переход к следующему шагу…"}
                        </p>
                    </AppCard>
                )}
            </div>
        </OnboardingShell>
    )
}
