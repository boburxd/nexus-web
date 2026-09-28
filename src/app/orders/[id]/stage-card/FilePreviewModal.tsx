"use client"

import dynamic from "next/dynamic"
import {useEffect} from "react"
import {isStageImageFilename} from "@/lib/stage-file-helpers"
import {isVideoFilename} from "./utils"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"

const StageImageMarkup = dynamic(() => import("@/components/stage/StageImageMarkup"), {ssr: false})

export function FilePreviewModal({
                                     url,
                                     filename,
                                     onClose,
                                     stageId,
                                     fileId,
                                     editable,
                                     readonlyReason,
                                 }: {
    url: string
    filename: string
    onClose: () => void
    stageId: string
    fileId: string | null
    editable: boolean
    readonlyReason?: string
}) {
    const isVideo = isVideoFilename(filename)
    const isImage = isStageImageFilename(filename)
    const showMarkupViewer = isImage && fileId

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [onClose])

    return (
        <div
            onClick={onClose}
            role="presentation"
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                zIndex: "var(--z-dropdown)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    position: "relative",
                    overflowY: showMarkupViewer ? "auto" : undefined,
                    overflowX: "hidden",
                }}
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Закрыть"
                    className="absolute -top-9 right-0"
                >
                    <Icon name="x"/>
                </Button>
                {showMarkupViewer ? (
                    <StageImageMarkup
                        stageId={stageId}
                        fileId={fileId}
                        filename={filename}
                        editable={editable}
                        readonlyReason={readonlyReason}
                        onClose={onClose}
                    />
                ) : (
                    <>
                        {isImage && (
                            <img
                                src={url}
                                alt={filename}
                                style={{
                                    maxWidth: "85vw",
                                    maxHeight: "85vh",
                                    objectFit: "contain",
                                    borderRadius: 8,
                                    display: "block",
                                }}
                            />
                        )}
                        {isVideo && (
                            <video
                                src={url}
                                controls
                                autoPlay
                                style={{maxWidth: "85vw", maxHeight: "85vh", borderRadius: 8, display: "block"}}
                            />
                        )}
                        {!isImage && !isVideo && (
                            <div
                                style={{
                                    background: "var(--dash-surface)",
                                    borderRadius: 8,
                                    padding: "2rem 3rem",
                                    color: "#fff",
                                    textAlign: "center",
                                }}
                            >
                                <Icon name="file"
                                   style={{fontSize: "1.5rem", marginBottom: 12, display: "block"}}/>
                                <p style={{margin: "0 0 16px"}}>{filename}</p>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{color: "var(--dash-success)", textDecoration: "none"}}
                                >
                                    Скачать файл
                                </a>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

