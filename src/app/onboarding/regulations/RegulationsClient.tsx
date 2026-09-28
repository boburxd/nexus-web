"use client"

import {useCallback, useEffect, useRef, useState} from "react"
import {useRouter} from "next/navigation"
import {OnboardingShell} from "@/components/app/OnboardingShell"
import {AppCard} from "@/components/app/AppCard"
import {Button} from "@/components/ui/button"
import {logQuizAnswerHint} from "@/lib/dev-quiz-hint"

const LETTERS = ["А", "Б", "В", "Г"] as const

type SessionQuestion = {
    index: number
    section: string
    text: string
    options: [string, string, string, string]
}

type QuizSession = {
    questions: SessionQuestion[]
    total: number
    passPercent: number
    timeLimitSec: number
    answers: Record<string, number>
    answeredCount: number
    score: number
    sectionScores: Record<string, { correct: number; total: number }>
    currentQuestionIndex: number
    currentPosition: number
    questionDeadlineAt: string | null
    /** Только dev: индекс вопроса → индекс правильного варианта (в показанном порядке). */
    devAnswers?: Record<string, number>
}

type QuizResult = {
    score: number
    total: number
    pct: number
    passed: boolean
    sectionScores: Record<string, { correct: number; total: number }>
}

type RevealFeedback = {
    isCorrect: boolean
    correctIndex: number
    savedIndex: number
    explain: string
    timedOut: boolean
}

/** Сколько секунд осталось до дедлайна вопроса (сервер — источник правды по времени). */
function secondsUntil(deadline: string | null, fallback: number): number {
    if (!deadline) return fallback
    const ms = new Date(deadline).getTime()
    if (!Number.isFinite(ms)) return fallback
    return Math.max(0, Math.ceil((ms - Date.now()) / 1000))
}

export default function RegulationsClient({
                                              total: totalQuestions,
                                              passPercent,
                                              timeLimitSec,
                                          }: {
    total: number
    passPercent: number
    timeLimitSec: number
}) {
    const router = useRouter()
    const [phase, setPhase] = useState<"loading" | "intro" | "quiz" | "result">("loading")
    const [session, setSession] = useState<QuizSession | null>(null)
    const [pos, setPos] = useState(0)
    const [score, setScore] = useState(0)
    const [answeredCount, setAnsweredCount] = useState(0)
    const [deadline, setDeadline] = useState<string | null>(null)
    const [timeLeft, setTimeLeft] = useState(timeLimitSec)
    const [picked, setPicked] = useState<number | null>(null)
    const [revealFb, setRevealFb] = useState<RevealFeedback | null>(null)
    const [result, setResult] = useState<QuizResult | null>(null)
    const [lastResult, setLastResult] = useState<QuizResult | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const revealInFlight = useRef(false)

    const total = session?.total ?? totalQuestions
    const timeLimit = session?.timeLimitSec ?? timeLimitSec
    const q = session?.questions[pos]
    const isAnswered = revealFb !== null
    const isLast = pos >= (session?.questions.length ?? 0) - 1
    const progressPct = phase === "result" ? 100 : Math.round((answeredCount / total) * 100)

    const applySession = useCallback((s: QuizSession) => {
        setSession(s)
        setScore(s.score)
        setAnsweredCount(s.answeredCount)
        setDeadline(s.questionDeadlineAt)
        setTimeLeft(secondsUntil(s.questionDeadlineAt, s.timeLimitSec))
        setPos(s.currentPosition >= 0 ? s.currentPosition : Math.max(0, s.questions.length - 1))
        setPicked(null)
        setRevealFb(null)
        setError(null)
        setPhase("quiz")
    }, [])

    /** Завершение попытки: итог считает сервер по сохранённым ответам. */
    const finishAttempt = useCallback(async () => {
        setSubmitting(true)
        try {
            const res = await fetch("/api/onboarding/regulations-result", {method: "POST"})
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(typeof data.error === "string" ? data.error : "Не удалось сохранить результат")
                setPhase("intro")
                return
            }
            setResult({
                score: Number(data.score ?? 0),
                total: Number(data.total ?? totalQuestions),
                pct: Number(data.pct ?? 0),
                passed: Boolean(data.passed),
                sectionScores: data.sectionScores ?? {},
            })
            setPhase("result")
        } finally {
            setSubmitting(false)
        }
    }, [totalQuestions])

    // Восстановление незавершённой попытки
    useEffect(() => {
        ;(async () => {
            try {
                const res = await fetch("/api/onboarding/regulations-result")
                const data = await res.json()
                if (data?.session) {
                    const s = data.session as QuizSession
                    // Все вопросы отвечены, но попытка не закрыта (например, вкладку закрыли) — подводим итог.
                    if (s.currentQuestionIndex < 0) {
                        await finishAttempt()
                        return
                    }
                    applySession(s)
                    return
                }
                if (data?.result) {
                    const r = data.result as QuizResult
                    setLastResult(r)
                    if (r.passed) {
                        setPhase("result")
                        return
                    }
                }
            } catch { /* стартуем с intro */
            }
            setPhase("intro")
        })()
    }, [applySession, finishAttempt])

    const startAttempt = useCallback(async () => {
        if (submitting) return
        setSubmitting(true)
        setError(null)
        try {
            const res = await fetch("/api/onboarding/regulations-result/start", {method: "POST"})
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(typeof data.error === "string" ? data.error : "Не удалось начать тест")
                return
            }
            setResult(null)
            applySession(data.session as QuizSession)
        } finally {
            setSubmitting(false)
        }
    }, [submitting, applySession])

    /** optionIdx === null — время вышло. */
    const submitAnswer = useCallback(async (optionIdx: number | null) => {
        if (!q || isAnswered || revealInFlight.current) return
        revealInFlight.current = true
        setSubmitting(true)
        try {
            const res = await fetch("/api/onboarding/regulations-result/reveal", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(
                    optionIdx === null
                        ? {questionIndex: q.index, timedOut: true}
                        : {questionIndex: q.index, selectedIndex: optionIdx},
                ),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(
                    data.code === "NO_SESSION" || data.code === "QUESTION_ORDER"
                        ? "Сессия теста рассинхронизирована. Начните попытку заново."
                        : typeof data.error === "string" ? data.error : "Ошибка проверки ответа",
                )
                return
            }
            setPicked(typeof data.savedIndex === "number" ? data.savedIndex : optionIdx)
            setRevealFb({
                isCorrect: Boolean(data.isCorrect),
                correctIndex: Number(data.correctIndex),
                savedIndex: Number(data.savedIndex ?? -1),
                explain: String(data.explain ?? ""),
                timedOut: Boolean(data.timedOut),
            })
            if (data.progress) {
                setScore(Number(data.progress.score ?? score))
                setAnsweredCount(Number(data.progress.answeredCount ?? answeredCount + 1))
                setDeadline(data.progress.questionDeadlineAt ?? null)
            }
        } finally {
            revealInFlight.current = false
            setSubmitting(false)
        }
    }, [q, isAnswered, score, answeredCount])

    // Dev: правильный вариант текущего вопроса — в консоль браузера.
    useEffect(() => {
        if (phase !== "quiz" || !q) return
        logQuizAnswerHint({
            quiz: "Тест по регламентам",
            position: pos + 1,
            total,
            question: q.text,
            options: q.options,
            correctIndex: session?.devAnswers?.[String(q.index)],
        })
    }, [phase, q, pos, total, session])

    // Таймер вопроса: считаем от серверного дедлайна, по нулю отправляем «время вышло».
    useEffect(() => {
        if (phase !== "quiz" || !q || isAnswered) return
        setTimeLeft(secondsUntil(deadline, timeLimit))
        const id = setInterval(() => {
            const left = secondsUntil(deadline, timeLimit)
            setTimeLeft(left)
            if (left <= 0) {
                clearInterval(id)
                void submitAnswer(null)
            }
        }, 500)
        return () => clearInterval(id)
    }, [phase, q, isAnswered, deadline, timeLimit, submitAnswer])

    const goNext = useCallback(async () => {
        if (!isAnswered) return
        if (!isLast) {
            setPos((i) => i + 1)
            setPicked(null)
            setRevealFb(null)
            setTimeLeft(secondsUntil(deadline, timeLimit))
            return
        }
        await finishAttempt()
    }, [isAnswered, isLast, deadline, timeLimit, finishAttempt])

    const shown = result ?? lastResult

    return (
        <OnboardingShell title="Регламенты" backHref="/onboarding" backLabel="Онбординг" withBg>
            <div className="mx-auto max-w-xl px-6 py-12">

                {/* ── LOADING ── */}
                {phase === "loading" && (
                    <p style={{color: "rgba(255,255,255,0.45)", fontSize: "0.875rem"}}>Загрузка…</p>
                )}

                {error && phase !== "loading" && (
                    <div style={{
                        marginBottom: "1rem",
                        padding: "12px 16px",
                        borderRadius: 14,
                        background: "rgba(248,113,113,0.08)",
                        color: "var(--destructive)",
                        fontSize: "0.875rem",
                    }}>
                        {error}
                    </div>
                )}

                {/* ── INTRO ── */}
                {phase === "intro" && (
                    <>
                        <div className="mb-8">
                            <h1 style={{
                                color: "var(--foreground)",
                                fontSize: "clamp(1.4rem,3vw,1.8rem)",
                                fontWeight: 500,
                                margin: 0
                            }}>
                                Шаг 4. Регламенты платформы
                            </h1>
                            <p style={{color: "rgba(255,255,255,0.45)", marginTop: "8px", fontSize: "0.875rem"}}>
                                Тест на знание NEXUS Designer Code. Вопросы и варианты ответов перемешиваются на
                                каждой попытке, на каждый вопрос даётся {timeLimitSec} секунд.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-8 mb-8"
                             style={{color: "rgba(255,255,255,0.5)", fontSize: "0.875rem"}}>
                            {[
                                [String(totalQuestions), "вопросов"],
                                [`${timeLimitSec} сек`, "на вопрос"],
                                [`${passPercent}%`, "проходной балл"],
                            ].map(([num, label]) => (
                                <div key={label}>
                                    <div style={{
                                        color: "var(--foreground)",
                                        fontSize: "1.5rem",
                                        fontWeight: 600,
                                        lineHeight: 1
                                    }}>{num}</div>
                                    <div>{label}</div>
                                </div>
                            ))}
                        </div>

                        {lastResult && (
                            <p style={{color: "rgba(255,255,255,0.45)", fontSize: "0.875rem", marginBottom: "1rem"}}>
                                Прошлая попытка: {lastResult.score} из {lastResult.total} ({lastResult.pct}%).
                            </p>
                        )}

                        <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            onClick={startAttempt}
                            disabled={submitting}
                            className="w-full"
                        >
                            {submitting ? "Готовим вопросы…" : "Начать тест →"}
                        </Button>
                    </>
                )}

                {/* ── QUIZ ── */}
                {phase === "quiz" && q && (
                    <>
                        <div className="mb-2 flex justify-between items-center" style={{fontSize: "0.875rem"}}>
                            <span style={{color: "rgba(255,255,255,0.45)"}}>Вопрос {pos + 1} из {total}</span>
                            <span style={{color: "rgba(255,255,255,0.65)", fontWeight: 600}}>{score} верных</span>
                        </div>

                        <div style={{
                            color: !isAnswered && timeLeft <= 5 ? "var(--destructive)" : "rgba(255,255,255,0.55)",
                            fontSize: "0.75rem",
                            marginBottom: "0.5rem",
                            fontWeight: !isAnswered && timeLeft <= 5 ? 700 : 500,
                            letterSpacing: !isAnswered && timeLeft <= 5 ? "0.03em" : "normal",
                        }}>
                            {isAnswered
                                ? "Ответ засчитан"
                                : `${timeLeft <= 5 ? "Срочно: " : "Время на вопрос: "}00:${String(timeLeft).padStart(2, "0")}`}
                        </div>
                        <div style={{
                            height: 4,
                            borderRadius: 14,
                            background: "rgba(255,255,255,0.08)",
                            overflow: "hidden",
                            marginBottom: "0.625rem"
                        }}>
                            <div style={{
                                height: "100%",
                                width: "100%",
                                transform: `scaleX(${isAnswered ? 0 : timeLeft / timeLimit})`,
                                transformOrigin: "left",
                                borderRadius: 14,
                                background: timeLeft <= 5 ? "var(--destructive)" : "var(--primary)",
                                transition: "transform 0.3s linear"
                            }}/>
                        </div>

                        <div style={{
                            height: 6,
                            borderRadius: 14,
                            background: "rgba(255,255,255,0.08)",
                            overflow: "hidden",
                            marginBottom: "1.5rem"
                        }}>
                            <div style={{
                                height: "100%",
                                width: "100%",
                                transform: `scaleX(${progressPct / 100})`,
                                transformOrigin: "left",
                                borderRadius: 14,
                                background: "var(--success)",
                                transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)"
                            }}/>
                        </div>

                        <AppCard glass key={q.index}>
                            <div style={{
                                display: "inline-block",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                color: "rgba(255,255,255,0.4)",
                                background: "rgba(255,255,255,0.06)",
                                padding: "4px 12px",
                                borderRadius: 14,
                                marginBottom: "0.75rem"
                            }}>
                                {q.section}
                            </div>
                            <p style={{
                                color: "rgba(255,255,255,0.35)",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                margin: "0 0 0.5rem"
                            }}>
                                Вопрос {pos + 1}
                            </p>
                            <p style={{
                                color: "var(--foreground)",
                                fontSize: "1rem",
                                fontWeight: 500,
                                lineHeight: 1.5,
                                margin: "0 0 1.25rem"
                            }}>
                                {q.text}
                            </p>

                            <div className="flex flex-col gap-2">
                                {q.options.map((opt, i) => {
                                    const isCorrect = isAnswered && revealFb && i === revealFb.correctIndex
                                    const isWrong = isAnswered && i === picked && !revealFb?.isCorrect
                                    const stateStyle = isCorrect
                                        ? {borderColor: "var(--success)", background: "color-mix(in oklab, var(--success) 12%, transparent)"}
                                        : isWrong
                                            ? {borderColor: "var(--destructive)", background: "color-mix(in oklab, var(--destructive) 10%, transparent)"}
                                            : undefined
                                    return (
                                        <Button key={i} type="button" variant="outline"
                                                disabled={isAnswered || submitting}
                                                onClick={() => submitAnswer(i)}
                                                className="h-auto w-full items-start justify-start gap-3 whitespace-normal text-left disabled:opacity-100"
                                                style={{...stateStyle, cursor: isAnswered || submitting ? "default" : "pointer"}}>
                      <span style={{
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
                          background: isCorrect ? "rgba(52,211,153,0.25)" : isWrong ? "rgba(248,113,113,0.2)" : "rgba(255,255,255,0.04)",
                          color: "var(--foreground)"
                      }}>
                        {LETTERS[i]}
                      </span>
                                            <span style={{padding: "12px 0", lineHeight: 1.45}}>{opt}</span>
                                        </Button>
                                    )
                                })}
                            </div>

                            {revealFb && (
                                <div style={{
                                    marginTop: "1rem",
                                    padding: "14px 16px",
                                    borderRadius: 14,
                                    fontSize: "0.875rem",
                                    lineHeight: 1.55,
                                    background: revealFb.isCorrect ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.06)",
                                    color: "rgba(255,255,255,0.75)"
                                }}>
                                    <strong style={{color: revealFb.isCorrect ? "var(--success)" : "var(--destructive)"}}>
                                        {revealFb.isCorrect
                                            ? "✓ Верно."
                                            : revealFb.timedOut ? "✗ Время вышло." : "✗ Неверно."}
                                    </strong>{" "}{revealFb.explain}
                                </div>
                            )}

                            {isAnswered && (
                                <div className="flex justify-end mt-5">
                                    <Button type="button" size="lg" disabled={submitting} onClick={goNext}>
                                        {submitting ? "Сохранение…" : !isLast ? "Следующий вопрос →" : "Завершить тест →"}
                                    </Button>
                                </div>
                            )}
                        </AppCard>
                    </>
                )}

                {/* ── RESULT ── */}
                {phase === "result" && shown && (
                    <>
                        <AppCard glass style={{
                            background: shown.passed ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)"
                        }}>
                            <h2 style={{
                                color: shown.passed ? "var(--success)" : "var(--destructive)",
                                fontSize: "1.125rem",
                                margin: "0 0 0.5rem"
                            }}>
                                {shown.passed ? "Тест пройден" : "Тест не пройден"}
                            </h2>
                            <p style={{color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", margin: "0 0 1rem"}}>
                                Результат: <strong
                                style={{color: "var(--foreground)"}}>{shown.score}</strong> из {shown.total} ({shown.pct}%).
                                {shown.passed ? " Регламент принят." : " Рекомендуем повторно изучить NEXUS Designer Code."}
                            </p>

                            <div style={{
                                borderTop: "1px solid rgba(255,255,255,0.07)",
                                paddingTop: "0.75rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: 6
                            }}>
                                {Object.entries(shown.sectionScores).map(([sec, v]) => {
                                    const sp = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0
                                    const shortSec = sec.replace(/Раздел \d+[–—-]?\s*/i, "")
                                    return (
                                        <div key={sec} style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontSize: "0.75rem"
                                        }}>
                                            <span style={{color: "rgba(255,255,255,0.45)"}}>{shortSec}</span>
                                            <span style={{
                                                fontWeight: 600,
                                                color: sp < 50 ? "var(--destructive)" : "var(--success)"
                                            }}>{v.correct}/{v.total}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </AppCard>

                        <div className="flex flex-col gap-3 mt-2">
                            {!shown.passed && (
                                <Button type="button" variant="secondary" size="lg" onClick={startAttempt}
                                        disabled={submitting} className="w-full">
                                    {submitting ? "Готовим вопросы…" : "Пройти заново"}
                                </Button>
                            )}
                            {shown.passed && (
                                <Button type="button" size="lg" onClick={() => router.push("/onboarding")}
                                        className="w-full">
                                    Следующий шаг →
                                </Button>
                            )}
                        </div>
                    </>
                )}

            </div>
        </OnboardingShell>
    )
}
