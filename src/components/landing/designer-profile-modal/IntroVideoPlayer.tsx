"use client"

import type {RefObject} from "react"
import {MediaWithLoader} from "./MediaWithLoader"
import {Button} from "@/components/ui/button"
import {Icon} from "@/components/ui/icon"
import {stripBx} from "@/lib/icon-map"

interface IntroVideoPlayerProps {
    videoRef: RefObject<HTMLVideoElement | null>
    src: string
    muted: boolean
    onToggleMute: () => void
    objectFit?: "cover" | "contain"
}

export function IntroVideoPlayer({videoRef, src, muted, onToggleMute, objectFit = "cover"}: IntroVideoPlayerProps) {
    return (
        <>
            <MediaWithLoader className="h-full w-full">
                <video
                    ref={videoRef}
                    src={src}
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                    style={{width: "100%", height: "100%", objectFit, display: "block"}}
                />
            </MediaWithLoader>
            <Button
                type="button"
                variant="secondary"
                size="icon-lg"
                onClick={onToggleMute}
                aria-label={muted ? "Включить звук" : "Выключить звук"}
                className="absolute right-3.5 bottom-3.5"
            >
                <Icon name={stripBx(muted ? "bx-volume-mute" : "bx-volume-full")}/>
            </Button>
        </>
    )
}
