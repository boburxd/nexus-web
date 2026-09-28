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
           Цвета — тёмный набор --adm-* (AdminLayout, .adm-root). Модалки и ящики порталятся в body,
           вне .adm-root, поэтому у каждого токена запасное значение, равное его тёмному значению. */
        @media (prefers-color-scheme: dark) {
          /* Cards */
          .card {
            --bs-card-bg: var(--adm-card-bg, hsl(219, 36%, 13%));
            --bs-card-border-color: var(--adm-sidebar-border, hsl(216, 24%, 24%));
            --bs-card-color: var(--adm-text, hsl(210, 30%, 94%));
            background-color: var(--adm-card-bg, hsl(219, 36%, 13%)) !important;
            border-color: var(--adm-sidebar-border, hsl(216, 24%, 24%)) !important;
            color: var(--adm-text, hsl(210, 30%, 94%));
          }
          .card-header {
            background-color: var(--adm-sidebar, hsl(218, 32%, 14%)) !important;
            border-bottom-color: var(--adm-sidebar-border, hsl(216, 24%, 24%)) !important;
            color: var(--adm-text, hsl(210, 30%, 94%));
          }
          .card-body { color: var(--adm-text, hsl(210, 30%, 94%)); }

          /* Tables */
          .table {
            --bs-table-bg: transparent;
            --bs-table-color: var(--adm-text, hsl(210, 30%, 94%));
            --bs-table-border-color: var(--adm-sidebar-border, hsl(216, 24%, 24%));
            color: var(--adm-text, hsl(210, 30%, 94%));
          }
          .table thead th {
            color: var(--adm-muted, hsl(214, 16%, 66%));
            border-bottom-color: var(--adm-sidebar-border, hsl(216, 24%, 24%));
          }
          .table td { border-bottom-color: var(--adm-sidebar-border, hsl(216, 24%, 24%)); }
          .table-hover > tbody > tr:hover > td { background-color: var(--adm-hover-bg, hsla(205, 85%, 62%, 0.09)); }

          /* Form controls — фокус показывается цветом рамки, без свечения */
          .form-control, .form-select {
            background-color: var(--adm-card-bg, hsl(219, 36%, 13%));
            border-color: var(--adm-sidebar-border, hsl(216, 24%, 24%));
            color: var(--adm-text, hsl(210, 30%, 94%));
          }
          .form-control:focus, .form-select:focus {
            background-color: var(--adm-sidebar, hsl(218, 32%, 14%));
            border-color: var(--adm-active-color, hsl(205, 85%, 66%));
            color: var(--adm-text, hsl(210, 30%, 94%));
            box-shadow: none;
          }
          .form-control::placeholder { color: var(--adm-muted, hsl(214, 16%, 66%)); }
          textarea.form-control { background-color: var(--adm-card-bg, hsl(219, 36%, 13%)); color: var(--adm-text, hsl(210, 30%, 94%)); }

          /* Borders */
          .border, .border-bottom, .border-top { border-color: var(--adm-sidebar-border, hsl(216, 24%, 24%)) !important; }
          .rounded, .border-bottom { border-color: var(--adm-sidebar-border, hsl(216, 24%, 24%)); }

          /* Text utilities */
          .text-muted { color: var(--adm-muted, hsl(214, 16%, 66%)) !important; }
          .text-dark  { color: var(--adm-text, hsl(210, 30%, 94%)) !important; }
          .fw-semibold, .fw-medium, .fw-bold { color: var(--adm-text, hsl(210, 30%, 94%)); }

          /* Buttons */
          .btn-outline-secondary {
            color: var(--adm-muted, hsl(214, 16%, 66%));
            border-color: var(--adm-sidebar-border, hsl(216, 24%, 24%));
          }
          .btn-outline-secondary:hover {
            background-color: var(--adm-sidebar-border, hsl(216, 24%, 24%));
            border-color: var(--adm-muted, hsl(214, 16%, 66%));
            color: var(--adm-text, hsl(210, 30%, 94%));
          }

          /* Badges */
          .bg-label-secondary { background-color: color-mix(in oklab, var(--adm-text, hsl(210, 30%, 94%)) 7%, transparent) !important; color: var(--adm-name-color, hsl(212, 22%, 80%)) !important; }
          .bg-label-primary   { background-color: var(--adm-active-bg, hsla(205, 85%, 62%, 0.16)) !important; color: var(--adm-active-color, hsl(205, 85%, 66%)) !important; }
          .bg-label-warning   { background-color: color-mix(in oklab, var(--warning) 18%, transparent) !important; color: var(--warning) !important; }
          .bg-label-danger    { background-color: color-mix(in oklab, var(--destructive) 18%, transparent) !important; color: color-mix(in oklab, var(--destructive) 60%, var(--adm-text, hsl(210, 30%, 94%))) !important; }
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
