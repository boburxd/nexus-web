import {NextResponse} from "next/server"
import {prisma} from "@/lib/db/prisma"
import {getSessionUser} from "@/lib/session"
import {audit} from "@/lib/audit"
import {notify} from "@/lib/notifications"
import {ContractStatus} from "@prisma/client"
import {activateOrderIfBothContractsConfirmed} from "@/lib/order-contracts"

/**
 * POST /api/admin/orders/[id]/contract/specialist/confirm
 * Администратор подтверждает подписанный специалистом договор.
 * Заказ активируется, когда оба договора (со специалистом и с заказчиком) подтверждены.
 */
export async function POST(_req: Request, {params}: { params: Promise<{ id: string }> }) {
    const {id: orderId} = await params
    const user = await getSessionUser()
    if (!user || user.role !== "ADMIN") {
        return NextResponse.json({error: "Forbidden"}, {status: 403})
    }

    const order = await prisma.order.findUnique({
        where: {id: orderId, deletedAt: null},
        select: {specialistId: true},
    })
    if (!order) {
        return NextResponse.json({error: "Заказ не найден"}, {status: 404})
    }

    const contract = await prisma.contract.findUnique({
        where: {orderId_audience: {orderId, audience: "SPECIALIST"}},
    })
    if (!contract) {
        return NextResponse.json({error: "Договор по заказу не найден"}, {status: 404})
    }
    if (contract.status !== ContractStatus.SIGNED || !contract.signedS3Key) {
        return NextResponse.json(
            {error: "Договор должен быть подписан специалистом", currentStatus: contract.status},
            {status: 400},
        )
    }

    const now = new Date()
    const updatedContract = await prisma.contract.update({
        where: {id: contract.id},
        data: {status: ContractStatus.CONFIRMED, confirmedAt: now},
    })

    await audit(user.id, "contract_specialist_confirmed", "Contract", contract.id, {
        orderId: {to: orderId},
        status: {from: ContractStatus.SIGNED, to: ContractStatus.CONFIRMED},
    })

    if (order.specialistId) {
        void notify(
            order.specialistId,
            "contract_confirmed",
            "Договор подтвержден",
            `Договор ${contract.number} по заказу #${orderId} подтвержден администратором.`,
            `/work/orders/${orderId}`,
        )
    }

    await activateOrderIfBothContractsConfirmed(orderId, user.id)

    return NextResponse.json({contract: updatedContract, message: "Договор со специалистом подтвержден"})
}
