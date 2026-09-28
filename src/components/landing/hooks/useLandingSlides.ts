"use client"

import {useEffect, useState} from "react"
import type {DesignerSlide} from "../designer-profile-modal/types"
import {preloadSlides} from "@/lib/landing/preloadMedia"

/**
 * Слайды главной — только реальные дизайнеры платформы (/api/landing/specialists).
 * Демо-персонажами список намеренно не добиваем: на главной должны быть живые
 * специалисты с портфолио, пустой список честнее выдуманного.
 */
export function useLandingSlides() {
    const [slides, setSlides] = useState<DesignerSlide[] | null>(null)
    const [ready, setReady] = useState(false)
    // Сбой загрузки — отдельное состояние: пустой список означает «никого не отобрали», а не ошибку.
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function load() {
            let real: DesignerSlide[] = []
            let loadFailed = false
            try {
                const res = await fetch("/api/landing/specialists")
                const data: unknown = await res.json()
                if (res.ok && Array.isArray(data)) real = data as DesignerSlide[]
                else loadFailed = true
            } catch {
                /* сеть/сервер недоступны — скажем об этом, а не покажем выдуманных людей */
                loadFailed = true
            }

            await preloadSlides(real, [], {includeVideos: true})

            if (!cancelled) {
                setSlides(real)
                setFailed(loadFailed)
                setReady(true)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [])

    return {slides, failed, ready}
}
