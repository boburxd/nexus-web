import type {Contract, ContractAudience, ContractStatus} from "@/app/admin/orders/types"

export interface ContractPanelProps {
    contract: Contract | null
    orderId: string
    audience: ContractAudience
    onGenerate: (file: File) => Promise<boolean>
    onConfirm: () => void
}

export interface ContractFileLinkProps {
    contractId: string
    s3Key: string | null
    kind: "original" | "signed"
    label: string
}

export const CONTRACT_AUDIENCE_LABEL: Record<ContractAudience, { title: string; party: string; genitive: string }> = {
    SPECIALIST: {title: "Договор со специалистом", party: "специалисту", genitive: "специалиста"},
    CLIENT: {title: "Договор с заказчиком", party: "заказчику", genitive: "заказчика"},
}

export const CONTRACT_ACTIONS: Record<ContractStatus, { label: string; icon: string }> = {
    DRAFT: {label: "Не создан", icon: "bx bx-file-blank"},
    SENT: {label: "Ожидает подписи", icon: "bx bx-user-check"},
    SIGNED: {label: "Ожидает подтверждения", icon: "bx bx-check-circle"},
    CONFIRMED: {label: "Договор подтверждён", icon: "bx bx-check-double"},
    CANCELLED: {label: "Отменен", icon: "bx bx-x-circle"},
}
