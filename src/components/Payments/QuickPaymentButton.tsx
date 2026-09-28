"use client"

import {useState} from "react"
import {isStagePaymentsDisabledPublic} from "@/lib/payments/flags"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"
import {Modal} from "@/components/ui/modal"

interface QuickPaymentButtonProps {
    invoiceId: string
    amount: number
    orderId: string
    description?: string
    onSuccess?: () => void
    onError?: (error: string) => void
}

export function QuickPaymentButton({
                                       invoiceId,
                                       amount,
                                       orderId,
                                       description,
                                       onSuccess,
                                       onError,
                                   }: QuickPaymentButtonProps) {
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const skipPayments = isStagePaymentsDisabledPublic()

    const handlePayment = async () => {
        setLoading(true)
        try {
            if (skipPayments) {
                // Call init anyway: in billing-disabled mode it unlocks the stage.
                const res = await fetch("/api/payments/init", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({stageId: invoiceId, amount}),
                })
                if (!res.ok) throw new Error("Не удалось продолжить без оплаты")
                onSuccess?.()
                setLoading(false)
                setShowConfirm(false)
                return
            }
            // Инициализируем платеж через API
            const res = await fetch("/api/payments/init", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    stageId: invoiceId,
                    amount,
                }),
            })

            if (!res.ok) {
                throw new Error("Ошибка инициализации платежа")
            }

            const {paymentUrl} = await res.json()

            // Перенаправляем на платежную форму T-Bank
            if (paymentUrl) {
                window.location.href = paymentUrl
            } else {
                throw new Error("Платежный URL не получен")
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Неизвестная ошибка"
            onError?.(message)
            setLoading(false)
        }
    }

    return (
        <>
            <Button onClick={() => setShowConfirm(true)} disabled={loading}>
                <Icon name="credit-card"/>
                <span>{loading ? "Обработка…" : skipPayments ? "Продолжить без оплаты" : "Оплатить картой"}</span>
            </Button>

            {/* Модальное окно подтверждения */}
            <Modal open={showConfirm} onClose={() => !loading && setShowConfirm(false)} maxWidth={400} theme="dark">
                <div style={{padding: 24}}>
                    <h3 style={{margin: "0 0 12px", fontSize: 18, fontWeight: 700}}>
                        Подтверждение платежа
                    </h3>
                    <p style={{margin: "0 0 16px", fontSize: 14, color: "var(--muted-foreground)"}}>
                        {description || `Вы собираетесь оплатить счет за проект #${orderId}`}
                    </p>
                    <div
                        style={{
                            background: "var(--muted)",
                            borderRadius: 8,
                            padding: "12px 16px",
                            marginBottom: 20,
                        }}
                    >
                        <div style={{fontSize: 12, color: "var(--muted-foreground)", marginBottom: 4}}>
                            Сумма к оплате:
                        </div>
                        <div style={{fontSize: 24, fontWeight: 700}}>
                            {Math.round(amount / 1000)}k ₽
                        </div>
                    </div>
                    <div style={{display: "flex", gap: 12}}>
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1"
                            onClick={() => setShowConfirm(false)}
                            disabled={loading}
                        >
                            Отменить
                        </Button>
                        <Button size="lg" className="flex-1" onClick={handlePayment} disabled={loading}>
                            {loading ? "Обработка…" : "Оплатить"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
