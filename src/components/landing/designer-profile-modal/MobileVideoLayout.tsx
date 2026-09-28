"use client"

import type {RefObject} from "react"
import {Button} from "@/components/ui/button"
import {Icon} from "@/components/ui/icon"
import {IntroVideoPlayer} from "./IntroVideoPlayer"
import {ProfileSheet} from "./ProfileSheet"
import type {useProfileSheet} from "./hooks/useProfileSheet"

type SheetState = ReturnType<typeof useProfileSheet>

interface MobileVideoLayoutProps {
    videoRef: RefObject<HTMLVideoElement | null>
    videoSrc: string
    muted: boolean
    onToggleMute: () => void
    onClose: () => void
    sheet: SheetState
    children: React.ReactNode
}

export function MobileVideoLayout({
                                      videoRef,
                                      videoSrc,
                                      muted,
                                      onToggleMute,
                                      onClose,
                                      sheet,
                                      children,
                                  }: MobileVideoLayoutProps) {
    return (
        <div style={{position: "relative", width: "100%", height: "100%", background: "var(--card)"}}>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <IntroVideoPlayer
                    videoRef={videoRef}
                    src={videoSrc}
                    muted={muted}
                    onToggleMute={onToggleMute}
                    objectFit="contain"
                />
            </div>

            <Button type="button" variant="secondary" size="icon-sm" onClick={onClose} aria-label="Закрыть"
                    className="absolute top-3.5 right-3.5 z-20">
                <Icon name="x"/>
            </Button>

            <ProfileSheet
                sheetRef={sheet.sheetRef}
                sheetOffset={sheet.sheetOffset}
                sheetDragActive={sheet.sheetDragActive}
                sheetHandlers={sheet.sheetHandlers}
            >
                {children}
            </ProfileSheet>
        </div>
    )
}
