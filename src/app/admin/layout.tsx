import type {ReactNode} from "react"
import {getSessionUser} from "@/lib/session"
import {AdminViewerProvider} from "@/components/admin/AdminViewerContext"
import {formatUserName} from "@/lib/user-name"

export default async function AdminLayout({children}: { children: ReactNode }) {
    const user = await getSessionUser()
    const viewer = user ? {name: formatUserName(user) || null, email: user.email} : null

    return (
        <>
            <link rel="stylesheet" href="/sneat/fonts/iconify-icons.css"/>
            <style>{`
        /* layer(sneat) — вендорный Bootstrap-ресет не должен перебивать Tailwind-утилиты
           (см. порядок слоёв в globals.css). */
        @import url("/sneat/core.css") layer(sneat);
        @import url("/sneat/demo.css") layer(sneat);

        body { margin: 0; overflow: hidden; }

        :root {
          --bs-font-sans-serif: 'PP Neue Montreal', var(--font-inter), 'Inter', -apple-system, sans-serif;
          --bs-body-font-family: 'PP Neue Montreal', var(--font-inter), 'Inter', -apple-system, sans-serif;
          --bs-primary: hsl(212, 70%, 45%);
          --bs-primary-rgb: 34,109,195;
          --bs-primary-text-emphasis: hsl(212, 70%, 38%);
          --bs-primary-bg-subtle: hsl(212, 70%, 95%);
          --bs-primary-border-subtle: hsla(212, 70%, 45%, 0.2);
          --bs-link-color: hsl(212, 70%, 45%);
        }

        /* Кнопки shadcn (Button) внутри админки берут нейтральные цвета из --adm-*,
           чтобы outline/ghost/secondary читались и в светлой, и в тёмной теме. */
        .adm-root [data-slot="button"] {
          --background: var(--adm-content-bg);
          --foreground: var(--adm-text);
          --muted: var(--adm-hover-bg);
          --secondary: var(--adm-active-bg);
          --secondary-foreground: var(--adm-active-color);
          --border: var(--adm-sidebar-border);
          --input: var(--adm-sidebar-border);
        }

        h1,h2,h3,h4,h5,h6,.card-title {
          font-family: 'PP Neue Montreal', var(--font-inter), 'Inter', sans-serif;
          font-weight: 500;
        }

        /* ── Dark mode: Bootstrap component overrides ──
           Всё содержимое /admin рендерится внутри .adm-root (AdminLayout), поэтому цвета
           берутся из тёмного набора --adm-* — тех же токенов, что у шапки и сайдбара. */
        @media (prefers-color-scheme: dark) {
          /* Cards */
          .card {
            --bs-card-bg: var(--adm-card-bg);
            --bs-card-border-color: var(--adm-sidebar-border);
            --bs-card-color: var(--adm-text);
            background-color: var(--adm-card-bg) !important;
            border-color: var(--adm-sidebar-border) !important;
            color: var(--adm-text);
          }
          .card-header {
            background-color: var(--adm-sidebar) !important;
            border-bottom-color: var(--adm-sidebar-border) !important;
            color: var(--adm-text);
          }
          .card-body { color: var(--adm-text); }

          /* Tables */
          .table {
            --bs-table-bg: transparent;
            --bs-table-color: var(--adm-text);
            --bs-table-border-color: var(--adm-sidebar-border);
            color: var(--adm-text);
          }
          .table thead th {
            color: var(--adm-muted);
            border-bottom-color: var(--adm-sidebar-border);
          }
          .table td { border-bottom-color: var(--adm-sidebar-border); }
          .table-hover > tbody > tr:hover > td { background-color: var(--adm-hover-bg); }

          /* Form controls — фокус показывается цветом рамки, без свечения */
          .form-control, .form-select {
            background-color: var(--adm-card-bg);
            border-color: var(--adm-sidebar-border);
            color: var(--adm-text);
          }
          .form-control:focus, .form-select:focus {
            background-color: var(--adm-sidebar);
            border-color: var(--adm-active-color);
            color: var(--adm-text);
            box-shadow: none;
          }
          .form-control::placeholder { color: var(--adm-muted); }
          textarea.form-control { background-color: var(--adm-card-bg); color: var(--adm-text); }

          /* Borders */
          .border, .border-bottom, .border-top { border-color: var(--adm-sidebar-border) !important; }
          .rounded, .border-bottom { border-color: var(--adm-sidebar-border); }

          /* Text utilities */
          .text-muted { color: var(--adm-muted) !important; }
          .text-dark  { color: var(--adm-text) !important; }
          .fw-semibold, .fw-medium, .fw-bold { color: var(--adm-text); }

          /* Buttons */
          .btn-outline-secondary {
            color: var(--adm-muted);
            border-color: var(--adm-sidebar-border);
          }
          .btn-outline-secondary:hover {
            background-color: var(--adm-sidebar-border);
            border-color: var(--adm-muted);
            color: var(--adm-text);
          }

          /* Badges */
          .bg-label-secondary { background-color: color-mix(in oklab, var(--adm-text) 7%, transparent) !important; color: var(--adm-name-color) !important; }
          .bg-label-primary   { background-color: var(--adm-active-bg) !important; color: var(--adm-active-color) !important; }
          .bg-label-warning   { background-color: color-mix(in oklab, var(--warning) 18%, transparent) !important; color: var(--warning) !important; }
          .bg-label-danger    { background-color: color-mix(in oklab, var(--destructive) 18%, transparent) !important; color: color-mix(in oklab, var(--destructive) 60%, var(--adm-text)) !important; }
          .bg-label-success   { background-color: color-mix(in oklab, var(--success) 18%, transparent) !important; color: var(--success) !important; }
          .bg-label-info      { background-color: color-mix(in oklab, var(--ring) 18%, transparent) !important; color: var(--ring) !important; }

          /* Alert */
          .alert-warning { background-color: color-mix(in oklab, var(--warning) 12%, transparent); border-color: color-mix(in oklab, var(--warning) 25%, transparent); color: var(--warning); }
        }
      `}</style>
            <AdminViewerProvider viewer={viewer}>{children}</AdminViewerProvider>
        </>
    )
}
