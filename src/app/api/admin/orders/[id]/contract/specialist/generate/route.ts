import {NextRequest, NextResponse} from "next/server"
import {prisma} from "@/lib/db/prisma"
import {getSessionUser} from "@/lib/session"
import {uploadToS3} from "@/lib/s3"
import {audit} from "@/lib/audit"
import {notify} from "@/lib/notifications"
import {ContractStatus} from "@prisma/client"

/**
 * POST /api/admin/orders/[id]/contract/specialist/generate
 * Администратор загружает договор со специалистом и отправляет его на подпись.
 * Тело запроса: { file: File } - PDF файл договора
 */
export async function POST(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
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
    if (!order.specialistId) {
        return NextResponse.json({error: "К заказу не прикреплен специалист"}, {status: 400})
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file || !(file instanceof File)) {
        return NextResponse.json({error: "Файл договора обязателен"}, {status: 400})
    }
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
        return NextResponse.json({error: "Загрузите файл в формате PDF"}, {status: 400})
    }
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({error: "Размер файла не должен превышать 10МБ"}, {status: 400})
    }

    const contractNumber = `NEXUS-ORDER-SPEC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const s3Key = `orders/${orderId}/contracts/specialist/${contractNumber}-original.pdf`
    await uploadToS3(s3Key, buffer, "application/pdf")

    const now = new Date()
    const contract = await prisma.contract.upsert({
        where: {orderId_audience: {orderId, audience: "SPECIALIST"}},
        create: {
            orderId,
            audience: "SPECIALIST",
            number: contractNumber,
            s3Key,
            status: ContractStatus.SENT,
            sentAt: now,
        },
        update: {
            number: contractNumber,
            s3Key,
            status: ContractStatus.SENT,
            sentAt: now,
            // Переотправка рвёт предыдущий прогресс подписания этого договора.
            signedS3Key: null,
            signedAt: null,
            confirmedAt: null,
        },
    })

    await audit(user.id, "contract_specialist_generated", "Contract", contract.id, {
        orderId: {to: orderId},
        number: {to: contractNumber},
        status: {to: ContractStatus.SENT},
    })

    void notify(
        order.specialistId,
        "contract_sent",
        "Новый договор по заказу",
        `Администратор сформировал договор ${contractNumber} по заказу #${orderId}. Скачайте, подпишите и загрузите скан.`,
        `/work/orders/${orderId}`,
    )

    return NextResponse.json({contract, message: "Договор сгенерирован и отправлен специалисту"})
}
