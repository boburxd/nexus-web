"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import {toast} from "sonner"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"
import {stripBx} from "@/lib/icon-map"

export function HelpButton({
                               orderId,
                               briefData,
                               alreadyRequested,
                               className,
                               onRequested,
                               disabled: disabledProp,
                           }: {
    orderId: string
    briefData: Record<string, string>
    alreadyRequested: boolean
    className?: string
    onRequested?: () => void
    /** Например, пока не подписан договор оказания услуг — сохранение брифа недоступно. */
    disabled?: boolean
}) {
    const [done, setDone] = useState(alreadyRequested)
    const [confirming, setConfirming] = useState(false)
    const onClick = async () => {
        if (done) return
        if (!confirming) {
            setConfirming(true)
            return
        }
        setDone(true)
        try {
            await fetch(`/api/orders/${orderId}/brief`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({...briefData, _briefHelpRequested: true}),
            })
            onRequested?.()
        } catch {
            setDone(false)
        } finally {
            setConfirming(false)
        }
    }
    const disabled = Boolean(disabledProp) || done

    return (
        <Button
            type="button"
            variant={done ? "secondary" : confirming ? "default" : "outline"}
            size="xs"
            onClick={onClick}
            onBlur={() => setConfirming(false)}
            disabled={disabled}
            title={
                disabledProp
                    ? "Сначала подпишите договор оказания услуг во вкладке «Оплата»"
                    : done
                        ? "Запрос уже отправлен"
                        : confirming
                            ? "Нажмите еще раз для подтверждения"
                            : "Отправить запрос на помощь менеджера"
            }
            className={className}
        >
            {done ? (
                <>
                    <Icon name="check"/>
                </>
            ) : confirming ? (
                <>
                    <Icon name="error"/>
                    Подтвердить запрос
                </>
            ) : (
                <>
                    <Icon name="help-circle"/>
                    Нужна помощь менеджера
                </>
            )}
        </Button>
    )
}

export function DeleteButton({
                                 orderId,
                                 onDeleted,
                                 className,
                             }: {
    orderId: string
    /** Дополнительно к обновлению данных страницы (router.refresh). */
    onDeleted?: () => void
    className?: string
}) {
    const router = useRouter()
    const [confirming, setConfirming] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const onClick = async () => {
        if (deleting) return
        if (!confirming) {
            setConfirming(true)
            return
        }
        setDeleting(true)
        try {
            const res = await fetch(`/api/orders/${orderId}`, {method: "DELETE"})
            if (!res.ok) {
                const err = await res.json().catch(() => null)
                toast.error(err?.error ?? "Не удалось удалить черновик")
                return
            }
            onDeleted?.()
            router.refresh()
        } catch {
            toast.error("Ошибка сети при удалении черновика")
        } finally {
            setDeleting(false)
        }
    }
    return (
        <Button
            type="button"
            variant={confirming ? "destructive" : "ghost"}
            size="xs"
            onClick={onClick}
            onBlur={() => {
                if (!deleting) setConfirming(false)
            }}
            disabled={deleting}
            className={className}
        >
            <Icon name={stripBx(deleting ? "bx-loader-circle bx-spin" : confirming ? "bx-check" : "bx-trash")}/>
            {deleting ? "Удаление…" : confirming ? "Точно?" : "Удалить"}
        </Button>
    )
}
