"use client"

import {Button} from "@/components/ui/button"
import {Icon} from "@/components/ui/icon"
import {ProfileHeader} from "./ProfileHeader"
import type {Designer} from "./types"

interface ProfileCoverProps {
    designer: Designer
    onClose: () => void
}

export function ProfileCover({designer, onClose}: ProfileCoverProps) {
    const hasCover = Boolean(designer.work)
    return (
        <div
            style={{
                position: "relative",
                height: 200,
                flexShrink: 0,
                background: hasCover
                    ? `url('${designer.work}') ${designer.workPos ?? "center"} / cover no-repeat`
                    : "var(--secondary)",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 100%)",
                }}
            />
            <Button type="button" variant="secondary" size="icon-sm" onClick={onClose} aria-label="Закрыть"
                    className="absolute top-3.5 right-3.5 z-[1]">
                <Icon name="x"/>
            </Button>
            <div style={{position: "absolute", bottom: 20, left: 24}}>
                <ProfileHeader designer={designer}/>
            </div>
        </div>
    )
}
