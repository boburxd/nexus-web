"use client"

import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"

export function StagePaymentSection({
                                        acting,
                                        skipPayments,
                                        price,
                                        onPay,
                                    }: {
    acting: boolean
    skipPayments: boolean
    price?: number | null
    onPay: () => void
}) {
    return (
        <div
            style={{
                marginTop: "1rem",
                padding: "1.25rem",
                borderRadius: 10,
                background: "var(--dash-accent-bg)",
                textAlign: "center",
            }}
        >
            <Icon name="wallet"
               style={{fontSize: "1.5rem", color: "var(--dash-accent)", marginBottom: "0.5rem"}}/>
            <h3 style={{margin: "0 0 4px", fontSize: "1rem", color: "var(--dash-text)"}}>
                {skipPayments ? "Оплата отключена" : "Ожидается аванс"}
            </h3>
            <p style={{fontSize: "0.875rem", color: "var(--dash-text2)", marginBottom: "1rem"}}>
                {skipPayments ? "Биллинг временно отключен. Можно продолжать без оплаты." : "Для начала работ над этапом необходимо внести предоплату"}
                {price ? <b>: {(price / 100).toLocaleString("ru-RU")} руб.</b> : null}
            </p>
            <Button type="button" size="lg" onClick={onPay} disabled={acting}>
                {acting ? "…" : skipPayments ? "Продолжить" : "Оплатить аванс"}
            </Button>
        </div>
    )
}

