"use client"

import {Modal} from "@/components/ui/modal"
import {buildOnboardingActionConfirm, type OnboardingConfirmInput} from "../onboarding-confirm"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"

/**
 * Красное подтверждение для ручных действий админа над онбордингом.
 *
 * Намеренно не window.confirm: системный диалог выглядит одинаково для «удалить файл»
 * и для «закрыть шаг за специалиста», и его перестают читать. Здесь заголовок сразу
 * говорит, что действие ручное и не предназначено для реального пользователя.
 *
 * Esc и клик по фону = «Нет» (обрабатывает сам Modal).
 */
export function OnboardingActionConfirmModal({
                                                 request,
                                                 onConfirm,
                                                 onCancel,
                                             }: Readonly<{
    /** null — модалка закрыта. */
    request: (OnboardingConfirmInput & { userId: string; specialistName: string }) | null
    onConfirm: () => void
    onCancel: () => void
}>) {
    const content = request ? buildOnboardingActionConfirm(request) : null

    return (
        <Modal open={!!request} onClose={onCancel} maxWidth={520} className="dialog-surface">
            {content && request && (
                <div className="sp-danger-modal">
                    <div className="sp-danger-modal__head">
                        <Icon name="error" className="sp-danger-modal__icon"/>
                        <div>
                            <h5 className="sp-danger-modal__title">{content.title}</h5>
                            <p className="sp-danger-modal__sub">{content.subtitle}</p>
                        </div>
                    </div>

                    <div className="sp-danger-modal__body">
                        <p className="sp-danger-modal__who">{request.specialistName}</p>
                        <p className="sp-danger-modal__q">{content.question}</p>

                        {content.forcedSteps.length > 0 && (
                            <div className="sp-danger-modal__forced">
                                <strong>Специалист не прошёл (будет закрыто администратором):</strong>
                                <ul>
                                    {content.forcedSteps.map((step) => <li key={step}>{step}</li>)}
                                </ul>
                            </div>
                        )}

                        <p className="sp-danger-modal__note">
                            <Icon name="envelope" style={{marginRight: 4}}/>
                            Специалист получит письмо об этом на почту.
                        </p>
                    </div>

                    <div className="sp-danger-modal__foot">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Нет, отмена
                        </Button>
                        <Button type="button" variant="destructive" onClick={onConfirm}>
                            {content.confirmLabel}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    )
}
