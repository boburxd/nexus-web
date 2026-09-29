import {prisma} from "@/lib/db/prisma"
import {audit} from "@/lib/audit"
import {notify} from "@/lib/notifications"
import {OrderStatus} from "@prisma/client"
import {syncStageSequentialLocks} from "@/lib/stage-sequencing"

/**
 * Заказ активируется, когда ОБА договора по нему (со специалистом и с заказчиком)
 * подтверждены администратором. Вызывается после подтверждения любого из двух —
 * сама проверяет готовность второго и не активирует заказ повторно.
 */
export async function activateOrderIfBothContractsConfirmed(orderId: string, adminUserId: string): Promise<void> {
    const order = await prisma.order.findUnique({
        where: {id: orderId},
        include: {contracts: true},
    })
    if (!order || order.status === OrderStatus.ACTIVE) return

    const specialistConfirmed = order.contracts.some((c) => c.audience === "SPECIALIST" && c.status === "CONFIRMED")
    const clientConfirmed = order.contracts.some((c) => c.audience === "CLIENT" && c.status === "CONFIRMED")
    if (!specialistConfirmed || !clientConfirmed) return

    await prisma.order.update({where: {id: orderId}, data: {status: OrderStatus.ACTIVE}})
    await syncStageSequentialLocks(orderId)

    await audit(adminUserId, "order_status_changed", "Order", orderId, {
        status: {from: order.status, to: OrderStatus.ACTIVE},
    })

    if (order.specialistId) {
        void notify(
            order.specialistId,
            "contract_activated",
            "Заказ активирован",
            `Оба договора по заказу #${orderId} подтверждены. Заказ активирован и готов к работе.`,
            `/work/orders/${orderId}`,
        )
    }
    void notify(
        order.clientId,
        "contract_activated",
        "Заказ активирован",
        `Оба договора по заказу #${orderId} подтверждены. Заказ активирован и готов к работе.`,
        `/orders/${orderId}`,
    )
}
