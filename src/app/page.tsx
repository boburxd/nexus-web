"use client"

import {useCallback, useEffect, useState} from "react"
import {OsmoLoader} from "@/components/landing/OsmoLoader"
import {OsmoHeader} from "@/components/landing/OsmoHeader"
import {OsmoHero} from "@/components/landing/OsmoHero"
import {useLandingSlides} from "@/components/landing/hooks/useLandingSlides"

export default function Home() {
    const {slides, failed, ready: mediaReady} = useLandingSlides()
    const [animDone, setAnimDone] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [lightBg, setLightBg] = useState(false)

    const canExitLoader = animDone && mediaReady
    const splashImages = slides === null
        ? null
        : slides.flatMap((slide) => [slide.work, slide.avatar, ...(slide.portfolioImages ?? [])]).filter((src): src is string => Boolean(src))

    const handleAnimationEnd = useCallback(() => setAnimDone(true), [])

    useEffect(() => {
        if (canExitLoader) setLoaded(true)
    }, [canExitLoader])

    return (
        <>
            {!loaded && (
                <OsmoLoader
                    images={splashImages}
                    canExit={canExitLoader}
                    onAnimationEnd={handleAnimationEnd}
                />
            )}
            <div className="font-sans" style={{background: "var(--background)", minHeight: "100dvh"}}>
                {loaded && slides && (
                    <>
                        <OsmoHeader visible={loaded} lightBg={lightBg}/>
                        <OsmoHero visible={loaded} slides={slides} failed={failed} onBrightnessChange={setLightBg}/>
                    </>
                )}
            </div>
        </>
    )
}
