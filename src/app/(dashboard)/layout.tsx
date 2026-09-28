import type {ReactNode} from "react"
import {redirect} from "next/navigation"
import {getSessionUser} from "@/lib/session"
import {prisma} from "@/lib/db/prisma"

export default async function DashboardRootLayout({children}: { children: ReactNode }) {
    // /work/* is SPECIALIST-only (enforced by middleware), but role alone isn't enough:
    // a specialist must also clear onboarding (test → interview → regulations → contract)
    // before the cabinet is accessible — only individual pages checked for a profile
    // existing, none checked onboardingStatus, so a freshly registered (PENDING) specialist
    // could open /work directly and see the full dashboard before admin approval.
    const user = await getSessionUser()
    if (user?.role === "SPECIALIST") {
        const profile = await prisma.specialistProfile.findUnique({
            where: {userId: user.id},
            select: {onboardingStatus: true},
        })
        if (profile?.onboardingStatus !== "ACTIVE") redirect("/onboarding")
    }

    return (
        <>
            <link rel="stylesheet" href="/sneat/fonts/iconify-icons.css"/>
            {/* Переопределяем Bootstrap font на платформенный (PP Neue Montreal); фактический
                перебой Public Sans — в globals.css у .layout-wrapper, эти переменные это
                значение не перебивают, но должны совпадать для компонентов Bootstrap,
                которые ссылаются на них напрямую. */}
            <style>{`
        /* layer(sneat) — вендорный Bootstrap-ресет не должен перебивать Tailwind-утилиты
           (см. порядок слоёв в globals.css). */
        @import url("/sneat/core.css") layer(sneat);
        @import url("/sneat/demo.css") layer(sneat);

        :root {
          /* Шрифт */
          --bs-font-sans-serif: 'PP Neue Montreal', var(--font-inter), 'Inter', -apple-system, sans-serif;
          --bs-body-font-family: 'PP Neue Montreal', var(--font-inter), 'Inter', -apple-system, sans-serif;

          /* NEXUS brand */
          --nexus-accent: hsl(220, 22%, 12%);
          --nexus-accent-light: rgba(24, 29, 37, 0.07);
          --nexus-accent-border: rgba(24, 29, 37, 0.18);

          /* Bootstrap primary → NEXUS dark */
          --bs-primary: var(--nexus-accent);
          --bs-primary-rgb: 24, 29, 37;
          --bs-primary-text-emphasis: var(--nexus-accent);
          --bs-primary-bg-subtle: hsl(220, 14%, 94%);
          --bs-primary-border-subtle: rgba(24, 29, 37, 0.2);
          --bs-link-color: var(--nexus-accent);
          --bs-link-hover-color: hsl(220, 16%, 24%);
        }
        body { font-family: 'PP Neue Montreal', var(--font-inter), 'Inter', -apple-system, sans-serif; }

        /* Heading font — PP Neue Montreal */
        h1, h2, h3, h4, h5, h6, .card-title {
          font-family: 'PP Neue Montreal', var(--font-inter), 'Inter', sans-serif;
          font-weight: 500;
        }
      `}</style>
            <div className="layout-wrapper layout-content-navbar">
                {children}
            </div>
        </>
    )
}
