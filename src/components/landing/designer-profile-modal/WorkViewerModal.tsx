"use client"

import {Button} from "@/components/ui/button"
import {Icon} from "@/components/ui/icon"
import {Modal} from "@/components/ui/modal"

interface WorkViewerModalProps {
    open: boolean
    works: string[]
    activeIndex: number
    activeSrc: string | null
    onClose: () => void
    onPrev: () => void
    onNext: () => void
}

export function WorkViewerModal({
                                    open,
                                    works,
                                    activeIndex,
                                    activeSrc,
                                    onClose,
                                    onPrev,
                                    onNext,
                                }: WorkViewerModalProps) {
    return (
        <Modal open={open} onClose={onClose} maxWidth={1100} theme="dark">
            <div style={{position: "relative", background: "var(--card)"}}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderBottom: "1px solid rgba(255,255,255,0.08)"
                }}>
                    <div style={{color: "rgba(255,255,255,0.65)", fontSize: "0.875rem"}}>
                        Работа {activeIndex + 1} / {works.length}
                    </div>
                    <Button type="button" variant="secondary" size="icon-sm" onClick={onClose} aria-label="Закрыть">
                        <Icon name="x"/>
                    </Button>
                </div>

                <div style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "min(78vh, 720px)",
                    padding: 12
                }}>
                    {activeSrc && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={activeSrc}
                            alt="Работа"
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                                borderRadius: 14,
                                boxShadow: "0 24px 80px rgba(0,0,0,0.65)",
                            }}
                        />
                    )}

                    {works.length > 1 && (
                        <>
                            <div className="absolute top-1/2 left-2.5 -translate-y-1/2">
                                <Button type="button" variant="secondary" size="icon-lg" aria-label="Предыдущая работа"
                                        onClick={onPrev}>
                                    <Icon name="chevron-left"/>
                                </Button>
                            </div>
                            <div className="absolute top-1/2 right-2.5 -translate-y-1/2">
                                <Button type="button" variant="secondary" size="icon-lg" aria-label="Следующая работа"
                                        onClick={onNext}>
                                    <Icon name="chevron-right"/>
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    )
}
