"use client"

import Link from "next/link"
import type {OnboardingStatus} from "@/components/app/SpecialistCard"
import type {RawSpecialist, SpecialistOrder} from "../../types"
import {FilesCard, OnboardingStepsTableCard, PlatformContractCard, RatingLandingCard,} from "./cards"
import {ContractPanel} from "@/components/admin/ContractPanel"
import {adminOrderHref} from "@/lib/admin-routes"

type OnboardingStepRow = NonNullable<RawSpecialist["specialistProfile"]>["steps"][number]

export function SpecialistContractTab({
                                          specialist,
                                          onRefresh,
                                          ordersLoading,
                                          specOrders,
                                          onGenerateOrderContract,
                                          onConfirmOrderContract,
                                      }: {
    specialist: RawSpecialist
    onRefresh?: () => Promise<void>
    ordersLoading: boolean
    specOrders: SpecialistOrder[]
    onGenerateOrderContract: (orderId: string, audience: "specialist" | "client", file: File) => Promise<boolean>
    onConfirmOrderContract: (orderId: string, audience: "specialist" | "client") => Promise<void>
}) {
    const prof = specialist.specialistProfile
    // Черновики ещё не дошли до заключения договоров — как и на странице заказа.
    const contractOrders = specOrders.filter((o) => o.status !== "DRAFT")

    return (
        <div style={{maxWidth: 920, display: "flex", flexDirection: "column", gap: 12}}>
            <PlatformContractCard specialist={specialist} profile={prof} onRefresh={onRefresh}/>

            <div>
                <div className="sp-label" style={{marginBottom: 6}}>Договоры по заказам</div>
                {ordersLoading ? (
                    <p style={{fontSize: "0.82rem", color: "var(--adm-muted)", margin: 0}}>Загрузка…</p>
                ) : contractOrders.length === 0 ? (
                    <p style={{fontSize: "0.82rem", color: "var(--adm-muted)", margin: 0}}>
                        Нет заказов, по которым нужны договоры.
                    </p>
                ) : (
                    contractOrders.map((o) => (
                        <div key={o.id} style={{marginBottom: 12}}>
                            <Link
                                href={adminOrderHref(o.id)}
                                style={{fontSize: "0.78rem", color: "var(--adm-muted)", textDecoration: "none"}}
                            >
                                {o.title ?? o.briefData?.name ?? `Заказ #${o.id.slice(-6)}`} · {o.client.name ?? o.client.email}
                            </Link>
                            <ContractPanel
                                contract={o.contracts.find((c) => c.audience === "SPECIALIST") ?? null}
                                orderId={o.id}
                                audience="SPECIALIST"
                                onGenerate={(file) => onGenerateOrderContract(o.id, "specialist", file)}
                                onConfirm={() => onConfirmOrderContract(o.id, "specialist")}
                            />
                            <ContractPanel
                                contract={o.contracts.find((c) => c.audience === "CLIENT") ?? null}
                                orderId={o.id}
                                audience="CLIENT"
                                onGenerate={(file) => onGenerateOrderContract(o.id, "client", file)}
                                onConfirm={() => onConfirmOrderContract(o.id, "client")}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export function SpecialistOnboardingStepsTab({
                                                 steps,
                                                 formData,
                                             }: {
    steps: OnboardingStepRow[]
    formData?: Record<string, string> | null
}) {
    return (
        <div style={{maxWidth: 920}}>
            <OnboardingStepsTableCard steps={steps} formData={formData}/>
        </div>
    )
}

export function SpecialistRatingLandingTab({
                                               specialistId,
                                               profile,
                                               onboardingStatus,
                                               ratingUpdating,
                                               onUpdateProfile,
                                           }: {
    specialistId: string
    profile?: RawSpecialist["specialistProfile"] | null
    onboardingStatus: OnboardingStatus
    ratingUpdating: boolean
    onUpdateProfile: (userId: string, patch: { rating?: number; featuredOnLanding?: boolean }) => void
}) {
    return (
        <div style={{maxWidth: 640}}>
            <RatingLandingCard
                specialistId={specialistId}
                profile={profile}
                onboardingStatus={onboardingStatus}
                ratingUpdating={ratingUpdating}
                onUpdateProfile={onUpdateProfile}
            />
        </div>
    )
}

export function SpecialistFilesTab({files}: { files: RawSpecialist["files"] }) {
    if (!files.length) {
        return (
            <p style={{fontSize: "0.82rem", color: "var(--adm-muted)", margin: 0}}>
                У специалиста нет загруженных файлов (категории портфолио, аватар, документы и т.д.).
            </p>
        )
    }
    return (
        <div style={{maxWidth: 920}}>
            <FilesCard files={files}/>
        </div>
    )
}
