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
          --bs-primary: #6366f1;
          --bs-primary-rgb: 99,102,241;
          --bs-primary-text-emphasis: #4f46e5;
          --bs-primary-bg-subtle: #eef2ff;
          --bs-primary-border-subtle: rgba(99,102,241,0.2);
          --bs-link-color: #6366f1;
        }

        h1,h2,h3,h4,h5,h6,.card-title {
          font-family: 'PP Neue Montreal', var(--font-inter), 'Inter', sans-serif;
          font-weight: 500;
        }

        /* ── Dark mode: Bootstrap component overrides ──
           Duplicated under two guards on purpose (not just CSS vars — most of these hardcode
           exact hex values, not --adm-* tokens, so a var-based rewrite would subtly shift
           shades): the @media copy renders correctly on first paint with zero JS/flash when
           nobody has picked a theme yet; the [data-theme] copy is the explicit override from
           the profile-menu switch (src/components/admin/AdminLayout.tsx), which can go either
           direction regardless of the OS setting. Keep both copies in sync. */
        @media (prefers-color-scheme: dark) {
          /* Cards */
          .adm-root:not([data-theme="light"]) .card {
            --bs-card-bg: #1e293b;
            --bs-card-border-color: #334155;
            --bs-card-color: #e2e8f0;
            background-color: #1e293b !important;
            border-color: #334155 !important;
            color: #e2e8f0;
          }
          .adm-root:not([data-theme="light"]) .card-header {
            background-color: #263348 !important;
            border-bottom-color: #334155 !important;
            color: #e2e8f0;
          }
          .adm-root:not([data-theme="light"]) .card-body { color: #e2e8f0; }

          /* Tables */
          .adm-root:not([data-theme="light"]) .table {
            --bs-table-bg: transparent;
            --bs-table-color: #e2e8f0;
            --bs-table-border-color: #334155;
            color: #e2e8f0;
          }
          .adm-root:not([data-theme="light"]) .table thead th {
            color: #94a3b8;
            border-bottom-color: #334155;
          }
          .adm-root:not([data-theme="light"]) .table td { border-bottom-color: #334155; }
          .adm-root:not([data-theme="light"]) .table-hover > tbody > tr:hover > td { background-color: rgba(255,255,255,0.04); }

          /* Form controls */
          .adm-root:not([data-theme="light"]) .form-control,
          .adm-root:not([data-theme="light"]) .form-select {
            background-color: #1e293b;
            border-color: #475569;
            color: #e2e8f0;
          }
          .adm-root:not([data-theme="light"]) .form-control:focus,
          .adm-root:not([data-theme="light"]) .form-select:focus {
            background-color: #263348;
            border-color: #818cf8;
            color: #f1f5f9;
            box-shadow: 0 0 0 0.2rem rgba(99,102,241,0.25);
          }
          .adm-root:not([data-theme="light"]) .form-control::placeholder { color: #64748b; }
          .adm-root:not([data-theme="light"]) textarea.form-control { background-color: #1e293b; color: #e2e8f0; }

          /* Borders */
          .adm-root:not([data-theme="light"]) .border,
          .adm-root:not([data-theme="light"]) .border-bottom,
          .adm-root:not([data-theme="light"]) .border-top { border-color: #334155 !important; }
          .adm-root:not([data-theme="light"]) .rounded,
          .adm-root:not([data-theme="light"]) .border-bottom { border-color: #334155; }

          /* Text utilities */
          .adm-root:not([data-theme="light"]) .text-muted { color: #94a3b8 !important; }
          .adm-root:not([data-theme="light"]) .text-dark  { color: #e2e8f0 !important; }
          .adm-root:not([data-theme="light"]) .fw-semibold,
          .adm-root:not([data-theme="light"]) .fw-medium,
          .adm-root:not([data-theme="light"]) .fw-bold { color: #f1f5f9; }

          /* Buttons */
          .adm-root:not([data-theme="light"]) .btn-outline-secondary {
            color: #94a3b8;
            border-color: #475569;
          }
          .adm-root:not([data-theme="light"]) .btn-outline-secondary:hover {
            background-color: #334155;
            border-color: #64748b;
            color: #e2e8f0;
          }

          /* Badges */
          .adm-root:not([data-theme="light"]) .bg-label-secondary { background-color: rgba(255,255,255,0.07) !important; color: #cbd5e1 !important; }
          .adm-root:not([data-theme="light"]) .bg-label-primary   { background-color: rgba(99,102,241,0.18) !important; color: #818cf8 !important; }
          .adm-root:not([data-theme="light"]) .bg-label-warning   { background-color: rgba(245,158,11,0.18) !important; color: #fbbf24 !important; }
          .adm-root:not([data-theme="light"]) .bg-label-danger    { background-color: rgba(239,68,68,0.18) !important;  color: #f87171 !important; }
          .adm-root:not([data-theme="light"]) .bg-label-success   { background-color: rgba(34,197,94,0.18) !important;  color: #4ade80 !important; }
          .adm-root:not([data-theme="light"]) .bg-label-info      { background-color: rgba(14,165,233,0.18) !important; color: #38bdf8 !important; }

          /* Alert */
          .adm-root:not([data-theme="light"]) .alert-warning { background-color: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.25); color: #fbbf24; }

          /* Split panel list bg */
          .adm-root:not([data-theme="light"]) [style*="background: #fafafa"] { background: #141e30 !important; }
        }
        .adm-root[data-theme="dark"] .card {
          --bs-card-bg: #1e293b;
          --bs-card-border-color: #334155;
          --bs-card-color: #e2e8f0;
          background-color: #1e293b !important;
          border-color: #334155 !important;
          color: #e2e8f0;
        }
        .adm-root[data-theme="dark"] .card-header {
          background-color: #263348 !important;
          border-bottom-color: #334155 !important;
          color: #e2e8f0;
        }
        .adm-root[data-theme="dark"] .card-body { color: #e2e8f0; }
        .adm-root[data-theme="dark"] .table {
          --bs-table-bg: transparent;
          --bs-table-color: #e2e8f0;
          --bs-table-border-color: #334155;
          color: #e2e8f0;
        }
        .adm-root[data-theme="dark"] .table thead th {
          color: #94a3b8;
          border-bottom-color: #334155;
        }
        .adm-root[data-theme="dark"] .table td { border-bottom-color: #334155; }
        .adm-root[data-theme="dark"] .table-hover > tbody > tr:hover > td { background-color: rgba(255,255,255,0.04); }
        .adm-root[data-theme="dark"] .form-control,
        .adm-root[data-theme="dark"] .form-select {
          background-color: #1e293b;
          border-color: #475569;
          color: #e2e8f0;
        }
        .adm-root[data-theme="dark"] .form-control:focus,
        .adm-root[data-theme="dark"] .form-select:focus {
          background-color: #263348;
          border-color: #818cf8;
          color: #f1f5f9;
          box-shadow: 0 0 0 0.2rem rgba(99,102,241,0.25);
        }
        .adm-root[data-theme="dark"] .form-control::placeholder { color: #64748b; }
        .adm-root[data-theme="dark"] textarea.form-control { background-color: #1e293b; color: #e2e8f0; }
        .adm-root[data-theme="dark"] .border,
        .adm-root[data-theme="dark"] .border-bottom,
        .adm-root[data-theme="dark"] .border-top { border-color: #334155 !important; }
        .adm-root[data-theme="dark"] .rounded,
        .adm-root[data-theme="dark"] .border-bottom { border-color: #334155; }
        .adm-root[data-theme="dark"] .text-muted { color: #94a3b8 !important; }
        .adm-root[data-theme="dark"] .text-dark  { color: #e2e8f0 !important; }
        .adm-root[data-theme="dark"] .fw-semibold,
        .adm-root[data-theme="dark"] .fw-medium,
        .adm-root[data-theme="dark"] .fw-bold { color: #f1f5f9; }
        .adm-root[data-theme="dark"] .btn-outline-secondary {
          color: #94a3b8;
          border-color: #475569;
        }
        .adm-root[data-theme="dark"] .btn-outline-secondary:hover {
          background-color: #334155;
          border-color: #64748b;
          color: #e2e8f0;
        }
        .adm-root[data-theme="dark"] .bg-label-secondary { background-color: rgba(255,255,255,0.07) !important; color: #cbd5e1 !important; }
        .adm-root[data-theme="dark"] .bg-label-primary   { background-color: rgba(99,102,241,0.18) !important; color: #818cf8 !important; }
        .adm-root[data-theme="dark"] .bg-label-warning   { background-color: rgba(245,158,11,0.18) !important; color: #fbbf24 !important; }
        .adm-root[data-theme="dark"] .bg-label-danger    { background-color: rgba(239,68,68,0.18) !important;  color: #f87171 !important; }
        .adm-root[data-theme="dark"] .bg-label-success   { background-color: rgba(34,197,94,0.18) !important;  color: #4ade80 !important; }
        .adm-root[data-theme="dark"] .bg-label-info      { background-color: rgba(14,165,233,0.18) !important; color: #38bdf8 !important; }
        .adm-root[data-theme="dark"] .alert-warning { background-color: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.25); color: #fbbf24; }
        .adm-root[data-theme="dark"] [style*="background: #fafafa"] { background: #141e30 !important; }
      `}</style>
            <AdminViewerProvider viewer={viewer}>{children}</AdminViewerProvider>
        </>
    )
}
