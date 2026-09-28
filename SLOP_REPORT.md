# boburxd/nexus-web — AI slop report

Broom wrote this report and rewrites it on the next run, so an edit here is lost. A section whose heading is followed by `<!-- broom:keep -->` is yours: a re-run is told by that marker to leave it as it stands.

Audited 2026-09-28: 65 730 lines of UI source, 1 367 findings in 178 files.

All of it was measured, nothing assumed: every finding below names the file and the line it was read from. Not measured: the rendered page — hover, focus, motion and computed contrast need the product on screen, and no address was given.

**Slop score 53.7 — heavy: the interface reads as generated** (findings per 1 000 lines; 0–3 clean · 3–10 light · 10–20 noticeable · 20+ heavy). `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` prints the current score of what the detectors find (53.7 at this audit); the 3 findings from the review below count here too, and are checked by looking.

## What the product is

What boburxd/nexus-web turned out to be, read from its own code:

- The product is a specialist management and project delivery portal (Nexus Web) for onboarding contractors, processing briefs, tracking work stages, and managing client contracts.
- Built with Next.js (App Router), React, Tailwind CSS, Lucide/custom iconography, and custom CSS stylesheets for dashboard and form modules.
- The design baseline includes 71 CSS custom properties spanning neutral surfaces, accent fills, state borders, and typography.
- Components include atomic primitives (Icon, StatusBadge, Button, Switch) and structural layouts (AdminLayout, DashMainLayout, AppCard, OnboardingShell, DashSectionCard).
- Screens span the onboarding application funnel (/onboarding/form), specialist dashboards, stage review workflows, and finance overview cards.
- State coverage provides partial loading flags and toast triggers on submission, but leaves several inline list operations and data fetches without empty or error states.

## The baseline

Slop is measured against boburxd/nexus-web's own system, not against ours: Next.js + Tailwind · 71 color tokens · 5 font sizes · 8 radii · 3 font families · 60 components. Every one of them is written out in `.claude/skills/boburxd-nexus-web-build/references/tokens.md` and `.claude/skills/boburxd-nexus-web-build/references/components.md` — the two files this report, the skill `boburxd-nexus-web-build` and `detect.mjs` all measure against. Where a number in this report and those files disagree, those files are right.

## What to fix first

What a designer would say first about boburxd/nexus-web, heaviest first:

1. **Hardcoded inline color literals in dashboard-extras.css** — Arbitrary hsla/rgba strings like hsl(247, 78%, 60%) and hsla(0, 72%, 58%, 0.15) bypass the design system's token set, causing visual fragmentation between global tokens and legacy style sheets. Fix: Replace hardcoded hsla and rgba literals in dashboard-extras.css with the system tokens var(--color-accent), var(--color-destructive), and their corresponding soft alpha layers.
2. **Competing surface techniques in .dash-urgent and .dash-acts** — The alert panels apply a surface fill, an outer border, a linear gradient, and an ambient box shadow simultaneously on a non-floating element, reading as uncomposed styling. Fix: Remove the gradient and drop shadow from .dash-urgent and .dash-acts in dashboard-extras.css, relying solely on var(--dash-surface) with a single 1px border for emphasis.
3. **Ad-hoc radius values and rounded-full pill drift** — Controls and chips alternate arbitrarily between 100, 999px, 8px, 10px, and 18px without respecting the system's declared radii ramp or outer-padding concentricity. Fix: Normalize suggestion chips and badge elements in src/app/onboarding/form/page.tsx and dashboard-extras.css to the declared radii tokens (4px, 6px, 8px, 10px, 14px).
4. **Raw button and anchor elements lacking focus-visible states** — Elements such as .dash-crop-panel__apply and the software/AI suggestion buttons lack keyboard focus-visible styling, relying solely on hover pseudo-classes. Fix: Add explicit focus-visible rings using var(--color-ring) and tokenized focus offsets across interactive buttons in src/app/onboarding/form/page.tsx and dashboard-extras.css.
5. **One-off chip builders instead of standard Badge component** — The onboarding form creates hand-rolled pill buttons for software and AI suggestions with inline styles rather than using the centralized Badge and Button primitives. Fix: Refactor software and AI suggestion triggers in src/app/onboarding/form/page.tsx to render using the system's Badge and Button components.
6. **Missing empty and error state handling for DaData lookups** — The INN and BIK fetch procedures silently fail or only trigger transient Sonner toasts without rendering clear, persistent inline error context on the affected form fields. Fix: Add dedicated inline validation and error message blocks under the INN and BIK input fields in src/app/onboarding/form/page.tsx when resolution requests fail.

Then work the backlog below, in this order:

Put the skills in the repository first, so new code stops adding findings. Then take the backlog below, largest group first: fix one group per pull request and run `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` after each — it prints, for every line, what to use instead, and the score goes down in steps a reviewer can check.

## Findings

#### font-size · 206

206 lines in 25 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `public/sneat/demo.css:17` `font-size: 1.75rem;`
- `src/app/(auth)/error/page.tsx:31` `style={{color: "rgba(255,255,255,0.85)", textDecoration: "underline", fontSize: "0.95rem"}}>`
- `src/app/(auth)/layout.tsx:40` `style={{color: "#f4f4f4", fontSize: "1.3125em", fontWeight: 500, lineHeight: 1.3}}`
- `src/app/(dashboard)/work/academy/page.tsx:36` `fontSize: "0.78rem",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:70` `<Icon name="play-circle" style={{fontSize: "2rem", color: "#fff"}}/>`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:151` `<Icon name={stripBx(statusInfo.icon)} style={{fontSize: "1.1rem", color: statusInfo.color}}/>`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:152` `<span style={{fontWeight: 600, fontSize: "0.88rem", color: "var(--dash-text)"}}>`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:166` `fontSize: "0.78rem",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:195` `fontSize: "0.82rem",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:212` `fontSize: "0.78rem",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:220` `<div style={{marginTop: 8, fontSize: "0.78rem", color: "var(--dash-muted)"}}>`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:223` `<Icon name="file-pdf" style={{color: "#e74c3c", fontSize: "0.9rem"}}/>`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:241` `<span style={{color: "var(--dash-muted)", fontSize: "0.7rem"}}>`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:248` `<Icon name="file-pdf" style={{color: "#27ae60", fontSize: "0.9rem"}}/>`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:266` `<span style={{color: "var(--dash-muted)", fontSize: "0.7rem"}}>`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:312` `fontSize: "0.82rem",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:327` `fontSize: "0.8rem",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:471` `<span style={{fontSize: "0.65rem", color: "var(--dash-muted)", fontWeight: 600, minWidth: 18}}>`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:480` `style={{fontSize: "0.62rem", color: "var(--dash-muted)", marginLeft: 4, whiteSpace: "nowrap"}}>`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:499` `fontSize: "0.68rem",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:550` `fontSize: "0.78rem",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:564` `<div style={{fontSize: "0.82rem", color: "var(--dash-muted)"}}>`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:602` `fontSize: "0.78rem",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:627` `fontSize: "0.7rem",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:635` `<div style={{marginTop: 4, fontSize: "0.82rem", color: "var(--dash-text)"}}>`
- 181 more lines — `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` lists every one.

#### spacing · 201

178 lines in 47 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `public/sneat/demo.css:24` `padding-top: 74px !important;`
- `public/sneat/demo.css:32` `padding-top: 62px !important;`
- `public/sneat/demo.css:62` `margin-top: 1.875rem !important;`
- `src/app/(auth)/layout.tsx:62` `padding: 1.25rem 1.1rem !important;`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:498` `gap: 3,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:874` `padding: "3px 10px",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:891` `padding: "5px 10px",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1003` `padding: "3px 10px",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1018` `padding: "3px 10px",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1033` `padding: "3px 10px",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1072` `paddingLeft: 18,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1106` `paddingLeft: 18,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1221` `paddingLeft: 18,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1281` `padding: "3px 10px",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1293` `padding: "3px 10px",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1444` `padding: "3px 10px",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1459` `padding: "3px 10px",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1474` `padding: "3px 10px",`
- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:477` `style={{padding: "0.45em 0.8em", fontSize: "0.78rem"}}`
- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:746` `padding: "5px 12px",`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:40` `padding: "0.55em 0.875em",`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:206` `padding: "0.4em 0.9em",`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:290` `padding: "0.65rem 0.85rem",`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:319` `padding: "0.4em 1em",`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:498` `<div style={{display: "flex", flexWrap: "wrap", gap: "0.4rem"}}>`
- 153 more lines — `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` lists every one.

#### radius · 170

170 lines in 63 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `public/sneat/perfect-scrollbar.css:130` `border-radius: 50rem;`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:545` `borderRadius: 999,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:775` `borderRadius: 999,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:875` `borderRadius: 999`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:892` `borderRadius: 999,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1004` `borderRadius: 999,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1019` `borderRadius: 999,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1034` `borderRadius: 999,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1282` `borderRadius: 999,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1294` `borderRadius: 999,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1445` `borderRadius: 999,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1460` `borderRadius: 999,`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1475` `borderRadius: 999,`
- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:747` `borderRadius: 999,`
- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:793` `borderRadius: 12,`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:514` `borderRadius: 100,`
- `src/app/403/page.tsx:57` `borderRadius: 12,`
- `src/app/admin/clients/ClientDetailRoute.tsx:340` `borderRadius: 5,`
- `src/app/admin/clients/ClientDetailRoute.tsx:358` `borderRadius: 5,`
- `src/app/admin/clients/ClientDetailRoute.tsx:394` `borderRadius: 3,`
- `src/app/admin/clients/ClientDetailRoute.tsx:401` `borderRadius: 3,`
- `src/app/admin/orders/components/OrderHeader.tsx:47` `borderRadius: 999,`
- `src/app/admin/orders/components/OrderInfoCards.tsx:45` `borderRadius: 5,`
- `src/app/demo/page.tsx:158` `padding: "2rem 1.25rem", borderRadius: 16,`
- `src/app/demo/page.tsx:210` `padding: "0.55em 1.5em", borderRadius: 999,`
- 145 more lines — `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` lists every one.

#### hex-off-system · 100

97 lines in 23 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `public/sneat/perfect-scrollbar.css:60` `background-color: #eee;`
- `public/sneat/perfect-scrollbar.css:68` `background-color: #aaa;`
- `public/sneat/perfect-scrollbar.css:80` `background-color: #aaa;`
- `public/sneat/perfect-scrollbar.css:94` `background-color: #999;`
- `public/sneat/perfect-scrollbar.css:101` `background-color: #999;`
- `src/app/(auth)/error/page.tsx:27` `<p style={{color: "#f4f4f4", fontSize: "1rem", lineHeight: 1.5, margin: "0 0 1.25rem"}}>`
- `src/app/(auth)/layout.tsx:40` `style={{color: "#f4f4f4", fontSize: "1.3125em", fontWeight: 500, lineHeight: 1.3}}`
- `src/app/(dashboard)/layout.tsx:40` `--nexus-accent: #201d1d;`
- `src/app/(dashboard)/layout.tsx:45` `--bs-primary: #201d1d;`
- `src/app/(dashboard)/layout.tsx:47` `--bs-primary-text-emphasis: #201d1d;`
- `src/app/(dashboard)/layout.tsx:48` `--bs-primary-bg-subtle: #f0efee;`
- `src/app/(dashboard)/layout.tsx:50` `--bs-link-color: #201d1d;`
- `src/app/(dashboard)/layout.tsx:51` `--bs-link-hover-color: #403a3a;`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:223` `<Icon name="file-pdf" style={{color: "#e74c3c", fontSize: "0.9rem"}}/>`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:248` `<Icon name="file-pdf" style={{color: "#27ae60", fontSize: "0.9rem"}}/>`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:500` `color: "var(--dash-warn, #ff9f43)",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1618` `color: "var(--dash-danger, #ea5455)"`
- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:109` `background: "#1a1a2e",`
- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:119` `style={{color: "#6ee7b7", textDecoration: "none"}}>Скачать файл</a>`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:181` `color: "#856404"`
- `src/app/403/page.tsx:39` `color: "#f4f4f4",`
- `src/app/403/page.tsx:60` `color: "#f4f4f4",`
- `src/app/admin/audit/page.tsx:183` `color: "#ef4444",`
- `src/app/admin/clients/ClientDetailRoute.tsx:221` `color: "#22c55e",`
- `src/app/admin/clients/ClientDetailRoute.tsx:237` `border: "1px solid #22c55e",`
- 72 more lines — `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` lists every one.

#### fill-and-border · 100

100 lines in 45 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:52` `border: "1px solid var(--dash-border)",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:192` `border: "1px solid var(--dash-border)",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:586` `border: "1px solid var(--dash-border)",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:623` `border: "1px solid var(--dash-border)",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:701` `border: "1px solid rgba(245, 158, 11, 0.35)",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:725` `border: "1px solid rgba(34, 197, 94, 0.35)",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:749` `border: "1px solid rgba(56, 189, 248, 0.35)",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:776` `border: "1px solid rgba(56, 189, 248, 0.45)",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1189` `border: "1.5px dashed var(--dash-border)",`
- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:499` `border: "1px solid var(--dash-border)",`
- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:748` `border: "1px solid var(--dash-success)",`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:41` `border: "1px solid var(--dash-border)",`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:549` `border: "none",`
- `src/app/403/page.tsx:58` `border: "1px solid rgba(255,255,255,0.22)",`
- `src/app/admin/clients/ClientContractUpload.tsx:115` `border: "1px solid var(--adm-sidebar-border)",`
- `src/app/admin/clients/ClientContractUpload.tsx:129` `border: "none",`
- `src/app/admin/clients/ClientDetailRoute.tsx:180` `border: "none",`
- `src/app/admin/clients/ClientsShell.tsx:313` `border: 1px solid var(--adm-sidebar-border);`
- `src/app/admin/orders/components/FileThumbnail.tsx:38` `border: "1px solid var(--adm-sidebar-border, rgba(0,0,0,0.12))",`
- `src/app/admin/orders/components/SpecialistPicker.tsx:124` `border: "1px solid var(--adm-sidebar-border)",`
- `src/app/admin/orders/components/SpecialistPicker.tsx:160` `border: "1px solid var(--adm-sidebar-border)",`
- `src/app/admin/orders/components/SpecialistPicker.tsx:178` `border: "1px solid var(--adm-sidebar-border)",`
- `src/app/admin/orders/components/stage-waves/WaveCardUnified.tsx:107` `border: "1px solid var(--adm-sidebar-border)",`
- `src/app/admin/orders/components/stage-waves/WaveFiles.tsx:77` `border: "1px solid var(--adm-sidebar-border)",`
- `src/app/admin/orders/components/StageSummaryCards.tsx:45` `border: "1px solid var(--adm-sidebar-border)",`
- 75 more lines — `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` lists every one.

#### raw-element · 100

100 lines in 35 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:302` `<button type="button" onClick={() => setOpen(o => !o)} style={{`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:536` `<button`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:570` `<button`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:770` `<button`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:880` `<button`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1152` `<button`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1329` `<button`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1554` `<button`
- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:77` `<button onClick={onClose} style={{`
- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:474` `<button`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:314` `<button`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:503` `<button`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:542` `<button`
- `src/app/403/page.tsx:52` `<button`
- `src/app/admin/audit/page.tsx:113` `<button onClick={load} disabled={loading} className="sp-btn sp-btn-primary">`
- `src/app/admin/clients/ClientContractUpload.tsx:122` `<button`
- `src/app/admin/clients/ClientDetailRoute.tsx:99` `<button`
- `src/app/admin/clients/ClientDetailRoute.tsx:158` `<button`
- `src/app/admin/clients/ClientDetailRoute.tsx:225` `<button`
- `src/app/admin/clients/ClientDetailRoute.tsx:335` `<button`
- `src/app/admin/clients/ClientsShell.tsx:100` `<button`
- `src/app/admin/clients/ClientsShell.tsx:116` `<button`
- `src/app/admin/landing/LandingBundlesClient.tsx:147` `<button key={f.value} onClick={() => {`
- `src/app/admin/landing/LandingBundlesClient.tsx:232` `<button`
- `src/app/admin/landing/LandingBundlesClient.tsx:411` `<button className="btn btn-sm btn-success"`
- 75 more lines — `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` lists every one.

#### uppercase-label · 65

65 lines in 34 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:630` `textTransform: "uppercase",`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1363` `textTransform: "uppercase",`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:193` `textTransform: "uppercase",`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:274` `textTransform: "uppercase",`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:305` `textTransform: "uppercase",`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:491` `textTransform: "uppercase",`
- `src/app/admin/clients/ClientDetailRoute.tsx:446` `textTransform: "uppercase",`
- `src/app/admin/clients/ClientsShell.tsx:214` `text-transform: uppercase; letter-spacing: 0.06em;`
- `src/app/admin/orders/components/stage-waves/PendingDraftCard.tsx:39` `textTransform: "uppercase",`
- `src/app/admin/orders/components/stage-waves/PendingDraftCard.tsx:74` `textTransform: "uppercase",`
- `src/app/admin/orders/components/stage-waves/PendingDraftCard.tsx:168` `textTransform: "uppercase",`
- `src/app/admin/orders/components/stage-waves/ReleaseWaveCard.tsx:68` `textTransform: "uppercase",`
- `src/app/admin/orders/components/stage-waves/ReleaseWaveCard.tsx:101` `textTransform: "uppercase",`
- `src/app/admin/orders/components/stage-waves/StageReleaseWavesSection.tsx:27` `textTransform: "uppercase",`
- `src/app/admin/orders/components/stage-waves/WaveCardUnified.tsx:130` `textTransform: "uppercase",`
- `src/app/admin/orders/components/stage-waves/WaveCardUnified.tsx:164` `textTransform: "uppercase",`
- `src/app/admin/orders/components/stage-waves/WaveCardUnified.tsx:279` `textTransform: "uppercase",`
- `src/app/admin/orders/orders.css:171` `text-transform: uppercase;`
- `src/app/admin/specialists/components/specialist-detail/SpecialistProfileTab.tsx:152` `textTransform: "uppercase",`
- `src/app/onboarding/contract/page.tsx:209` `textTransform: "uppercase",`
- `src/app/onboarding/form/page.tsx:1069` `textTransform: "uppercase",`
- `src/app/onboarding/form/page.tsx:1191` `textTransform: "uppercase",`
- `src/app/orders/[id]/OrderBriefCommercialTerms.tsx:128` `textTransform: "uppercase",`
- `src/app/orders/[id]/OrderBriefCommercialTerms.tsx:201` `textTransform: "uppercase",`
- `src/app/orders/[id]/stage-card/StageMaterialsSection.tsx:113` `textTransform: "uppercase",`
- 40 more lines — `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` lists every one.

#### em-dash · 58

54 lines in 41 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1202` `После последнего выпуска — ещё не утверждено для показа заказчику`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1493` `Предыдущая сдача. Заказчик запросил правки — см. замечания ниже.`
- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:458` `Заказчик запросил помощь менеджера по брифу — учтите это при изучении материалов и уточняющих вопросах.`
- `src/app/admin/clients/ClientDetailRoute.tsx:197` `Если договор подписан на бумаге или вне ЛК — нажмите после`
- `src/app/admin/clients/ClientDetailRoute.tsx:261` `Счета и акты по заказам — в карточке заказа и во вкладке «Оплата» у`
- `src/app/admin/orders/components/stage-waves/PendingDraftCard.tsx:31` `После последнего выпуска — ещё не одобрено для показа заказчику`
- `src/app/admin/orders/components/stage-waves/StageReleaseWavesSection.tsx:35` `Каждая карточка — момент одобрения модератором и показ комплекта заказчику. Оранжевая колонка — цикл с`
- `src/app/admin/orders/components/StageRulesTemplatesModal.tsx:358` `<AlertDescription>Вы заменили файл после отправки — нажмите «Отправить дизайнеру»,`
- `src/app/admin/specialists/components/OnboardingActionConfirmModal.tsx:46` `<strong>Специалист не прошёл — будет закрыто администратором:</strong>`
- `src/app/admin/specialists/components/specialist-detail/cards/SpecialistPortfolioTreeCard.tsx:267` `Плитки в том же формате, что в кабинете дизайнера. Нажмите папку — откроются работы и материалы.`
- `src/app/admin/specialists/components/specialist-detail/cards/SpecialistPortfolioTreeCard.tsx:328` `Работы — портретные плитки, как у дизайнера. Ниже — материалы на всю папку и списки файлов по`
- `src/app/admin/specialists/components/specialist-detail/SpecialistProfileOnboardingSection.tsx:257` `aria-label="Прогресс по вопросам: зеленый — верно, красный — неверно">`
- `src/app/onboarding/form/page.tsx:413` `Шаг 1 — Анкета специалиста`
- `src/app/onboarding/interview/page.tsx:22` `Шаг 3 — Интервью`
- `src/app/onboarding/regulations/read/RegulationsReadClient.tsx:41` `Шаг 4 — Ознакомление с регламентом`
- `src/app/onboarding/regulations/RegulationsClient.tsx:293` `Шаг 4 — Регламенты платформы`
- `src/app/orders/[id]/OrderBriefCommercialTerms.tsx:84` `<strong style={{color: "var(--dash-text)"}}>без доплаты</strong> (каждый раунд — после согласования`
- `src/app/orders/[id]/OrderBriefCommercialTerms.tsx:99` `Оплата этапов в системе сейчас отключена — после исчерпания лимита процесс согласуется с`
- `src/app/orders/[id]/OrderDetailClient.tsx:281` `<span style={{color: "var(--dash-text2)", overflowWrap: "anywhere"}}>Заявка отправлена — подбираем специалиста</span>`
- `src/app/orders/[id]/stage-card/StageActSection.tsx:88` `Ожидайте подтверждения администратором — после этого будет зафиксирован перевод оплаты`
- `src/app/orders/[id]/stage-card/StageActSection.tsx:100` `Скачайте акт, подпишите и загрузите PDF — это нужно для перевода оплаты специалисту после`
- `src/app/orders/[id]/stage-card/StageClientActionsSection.tsx:101` `Опишите замечания в чате — дизайнер получит уведомление. Когда закончите, отправьте этап на`
- `src/app/orders/[id]/stage-card/StageMaterialsSection.tsx:143` `Принято — финальная версия`
- `src/app/orders/[id]/stage-card/StageMaterialsSection.tsx:482` `Принято — финальная версия`
- `src/app/orders/[id]/work/[stageType]/OrderWorkStageClient.tsx:264` `Рекомендуем посмотреть перед согласованием — там описаны формат и`
- 29 more lines — `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` lists every one.

#### gradient · 58

58 lines in 27 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:412` `background: "linear-gradient(135deg, hsl(200,60%,58%), hsl(230,60%,48%))",`
- `src/app/403/page.tsx:19` `"radial-gradient(1150px 440px at 50% 102%, hsla(215, 88%, 64%, 0.18), transparent 62%)," +`
- `src/app/403/page.tsx:20` `"radial-gradient(1200px 680px at 12% 8%, hsla(215, 88%, 64%, 0.15), transparent 55%)," +`
- `src/app/403/page.tsx:21` `"radial-gradient(980px 620px at 88% 0%, hsla(282, 82%, 62%, 0.14), transparent 60%)," +`
- `src/app/403/page.tsx:22` `"linear-gradient(145deg, hsl(258, 52%, 13%) 0%, hsl(270, 54%, 10%) 54%, hsl(248, 50%, 12%) 100%)",`
- `src/app/admin/clients/ClientsShell.tsx:157` `background: isOn ? "linear-gradient(135deg, var(--adm-active-color), #a78bfa)" : "var(--adm-active-bg)",`
- `src/app/admin/clients/ClientsShell.tsx:291` `background: linear-gradient(135deg, #0ea5e9, #38bdf8);`
- `src/app/admin/specialists/components/specialist-detail/cards/SpecialistPortfolioTreeCard.tsx:124` `background: "linear-gradient(165deg, rgba(99,102,241,0.12) 0%, var(--adm-outer, #f3f4f6) 55%, var(--adm-sidebar, #fff) 100%)",`
- `src/app/admin/specialists/components/specialist-detail/cards/SpecialistPortfolioTreeCard.tsx:295` `"linear-gradient(165deg, rgba(99,102,241,0.2) 0%, rgba(241,245,249,0.95) 52%, rgba(248,250,252,0.98) 100%)",`
- `src/app/admin/specialists/SpecialistsShell.tsx:388` `? "linear-gradient(135deg, var(--adm-active-color), #a78bfa)"`
- `src/app/onboarding/regulations/RegulationsClient.tsx:378` `? "linear-gradient(90deg, rgba(248,113,113,0.9), rgba(252,165,165,0.85))"`
- `src/app/onboarding/regulations/RegulationsClient.tsx:379` `: "linear-gradient(90deg, rgba(96,165,250,0.9), rgba(129,140,248,0.85))",`
- `src/app/onboarding/regulations/RegulationsClient.tsx:395` `background: "linear-gradient(90deg, rgba(52,211,153,0.9), rgba(45,212,191,0.85))",`
- `src/app/orders/[id]/OrderSpecialist.tsx:34` `background: "linear-gradient(135deg, hsl(247,60%,58%), hsl(282,60%,48%))",`
- `src/components/Academy/AcademyPage.css:278` `background: linear-gradient(to right, #7367f0, #9e95f5);`
- `src/components/app/AppCard.tsx:140` `background: "linear-gradient(165deg, rgba(26,31,58,0.98) 0%, rgba(15,19,38,0.99) 100%)",`
- `src/components/app/UploadingCard.tsx:182` `background: linear-gradient(90deg, var(--dash-accent, #5b4fcf), #a78bfa);`
- `src/components/Client/client-cabinet/ClientCabinetPage.tsx:95` `background: "linear-gradient(135deg, hsl(247,60%,58%), hsl(282,60%,48%))",`
- `src/components/Client/client-cabinet/OrdersListView.tsx:56` `` style={{background: `linear-gradient(135deg, hsl(${hue},60%,58%), hsl(${hue + 35},60%,48%))`}} ``
- `src/components/Client/client-cabinet/SettingsTab.tsx:176` `background: "linear-gradient(135deg, hsl(247,60%,58%), hsl(282,60%,48%))",`
- `src/components/Community/CommunityPage.tsx:190` `background: done ? "linear-gradient(to right, hsl(247,72%,62%), hsl(282,72%,52%))" : "var(--dash-border)"`
- `src/components/Community/OrdersTab.tsx:125` `` style={{background: `linear-gradient(135deg, hsl(${hue},60%,58%), hsl(${hue + 35},60%,48%))`}}> ``
- `src/components/Community/PaymentsTab.tsx:374` `` style={{background: `linear-gradient(20deg, hsl(${DISCOVER_HUES[i % DISCOVER_HUES.length].h1},72%,52%), hsl(${DISCOVER_HUES[i % DISCOVER_HUES.length].h2},72%,44 ``
- `src/components/Community/PortfolioCardBrowseModal.tsx:168` `background: "linear-gradient(165deg, rgba(26,31,58,0.98) 0%, rgba(15,19,38,0.99) 100%)",`
- `src/components/Community/PortfolioProjects.tsx:405` `"linear-gradient(165deg, rgba(91,79,207,0.18) 0%, rgba(12,16,30,0.94) 55%, rgba(8,10,18,0.98) 100%)",`
- 33 more lines — `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` lists every one.

#### div-button · 32

32 lines in 26 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:57` `<div onClick={onClose} style={{`
- `src/app/admin/orders/components/FilePreviewModal.tsx:32` `<div`
- `src/app/onboarding/form/page.tsx:1018` `<div`
- `src/app/onboarding/form/page.tsx:1302` `<div onClick={() => setVideoOpen(false)} style={{`
- `src/app/orders/[id]/stage-card/FilePreviewModal.tsx:32` `<div`
- `src/app/orders/new/page.tsx:341` `<div`
- `src/components/admin/ContractPanel/FileUploadModal.tsx:53` `<div`
- `src/components/admin/StageActAdminCard.tsx:222` `<div`
- `src/components/app/AiImageStudio.tsx:155` `<div className="ai-studio__backdrop" onClick={() => !busy && onClose()}>`
- `src/components/app/AppCard.tsx:127` `<div`
- `src/components/app/BriefAIDrawer.tsx:122` `<div`
- `src/components/app/DashboardHeader.tsx:81` `<div onClick={() => setOpen(false)} style={{position: "fixed", inset: 0, zIndex: 40}}/>`
- `src/components/app/SpecialistCard.tsx:156` `<div`
- `src/components/app/StageUpload.tsx:235` `<div`
- `src/components/Client/ClientContractPanel.tsx:76` `<div`
- `src/components/Community/AvatarUpload.tsx:286` `<div`
- `src/components/Community/AvatarUpload.tsx:310` `<div className="dash-crop-backdrop" onClick={() => setSrcUrl(null)}>`
- `src/components/Community/ConfirmDialog.tsx:33` `<div onClick={onCancel} style={{`
- `src/components/Community/CreateProjectDialog.tsx:42` `<div onClick={onCancel} style={{`
- `src/components/Community/landing-uploader/LandingUploaderLayout.tsx:269` `<span`
- `src/components/Community/landing-uploader/LandingUploaderLayout.tsx:366` `<div`
- `src/components/Community/landing-uploader/LandingUploaderLayout.tsx:417` `<div onClick={() => onSetPreview(null)} style={{`
- `src/components/Community/LandingUploader.tsx:397` `<div`
- `src/components/Community/PortfolioCardBrowseModal.tsx:145` `<div`
- `src/components/Community/PortfolioUploader.tsx:108` `<div`
- 7 more lines — `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` lists every one.

#### emoji · 27

27 lines in 11 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:15` `const isVideoFilename = (name: string) => /\.(mp4|webm|mov)$/i.test(name.replace(/^🎬\s*/, ""))`
- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:34` `const isVideoFilename = (name: string) => /\.(mp4|webm|mov)$/i.test(name.replace(/^🎬\s*/, ""))`
- `src/app/admin/orders/components/stage-waves/PendingDraftCard.tsx:109` `const mediaCount = b.files.filter((f) => /\.(png|jpe?g|webp|gif|mp4|webm|mov)$/i.test(f.filename.replace(/^🎬\s*/, ""))).length`
- `src/app/admin/orders/components/stage-waves/WaveCardUnified.tsx:23` `return /\.(mp4|webm|mov)$/i.test(name.replace(/^🎬\s*/, ""))`
- `src/app/admin/specialists/components/specialist-detail/cards/RequisiteChangesCard.tsx:63` `<span className="sp-badge sp-badge--warn">⏳</span>`
- `src/app/admin/specialists/components/specialist-detail/SpecialistDetailHeader.tsx:133` `? "⚠ Специалист проходит тест"`
- `src/app/admin/specialists/components/specialist-detail/SpecialistDetailHeader.tsx:134` `: "⚠ Специалист ещё не прошёл тест регламентов"}`
- `src/app/orders/[id]/stage-card/StageClientActionsSection.tsx:238` `⚠ Последний бесплатный раунд правок.`
- `src/app/orders/onboarding/page.tsx:306` `}}>⏳</span>}`
- `src/components/Academy/AcademyPage.tsx:157` `<div className="hero-left">💡</div>`
- `src/components/Academy/AcademyPage.tsx:168` `<button>🔍</button>`
- `src/components/Academy/AcademyPage.tsx:171` `<div className="hero-right">🚀</div>`
- `src/components/Academy/AcademyPage.tsx:235` `<div className="banner-emoji">👩‍💻</div>`
- `src/components/Academy/AcademyPage.tsx:243` `<div className="banner-emoji">👩‍🎓</div>`
- `src/components/app/BriefFormEnhancements.tsx:165` `<span style={{fontSize: "1.1em"}}>⚠️</span>`
- `src/components/dashboard-ui/ChatEmojiPicker.tsx:9` `icon: "😀",`
- `src/components/dashboard-ui/ChatEmojiPicker.tsx:10` `emojis: "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😋 😎 🤩 🥳 🥺 😭 😢 😤 😡 🤔 🤗 🤭 🫡 🫠 🙄 😴 🤯 😱 😬 😅 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💯 ✨ 🔥 🎉 ✅ ❌ �`
- `src/components/dashboard-ui/ChatEmojiPicker.tsx:14` `icon: "👋",`
- `src/components/dashboard-ui/ChatEmojiPicker.tsx:15` `emojis: "👋 🤚 🖐️ ✋ 🖖 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🧠 👀 👁️ 👄 🧑 👩 👨 👶 🧒 👦 👧 🧑‍💻 �`
- `src/components/dashboard-ui/ChatEmojiPicker.tsx:19` `icon: "🐻",`
- `src/components/dashboard-ui/ChatEmojiPicker.tsx:20` `emojis: "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🦄 🐝 🦋 🐌 🐞 🐢 🐍 🦎 🐙 🦑 🦀 🐠 🐟 🐬 🐳 🦈 🐊 🐅 🐆 🦓 🐘 🦒 🦘 🐕 🐈 �`
- `src/components/dashboard-ui/ChatEmojiPicker.tsx:24` `icon: "🍕",`
- `src/components/dashboard-ui/ChatEmojiPicker.tsx:25` `emojis: "🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥝 🍅 🥑 🥦 🥕 🌽 🌶️ 🥐 🍞 🥨 🧀 🥚 🍳 🥞 🧇 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🥗 🍝 🍜 🍣 🍱 🍚 🍦 🍩 🍪 🎂 🍰 🍫 🍿`
- `src/components/dashboard-ui/ChatEmojiPicker.tsx:29` `icon: "⚽",`
- `src/components/dashboard-ui/ChatEmojiPicker.tsx:30` `emojis: "⚽ 🏀 🏈 ⚾ 🎾 🏐 🎱 🏓 🥊 🎯 🎮 🎲 🧩 🎨 🎭 🎤 🎧 🎸 🎹 🥁 🎬 📷 📱 💻 ⌨️ 🖥️ 🖨️ 💡 📚 ✏️ 📝 📌 📍 📎 📁 📊 📈 📉 💼 🏆 🥇 🎁 🎈 🎊 🎉 🚀 ✈️ 🚗 🚕 🚲 �`
- 2 more lines — `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` lists every one.

#### arbitrary-z · 26

26 lines in 23 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/(dashboard)/work/orders/[id]/WorkOrderClient.tsx:61` `zIndex: 1000,`
- `src/app/admin/orders/components/FilePreviewModal.tsx:38` `zIndex: 1000,`
- `src/app/onboarding/form/page.tsx:1303` `position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.8)",`
- `src/app/orders/[id]/stage-card/FilePreviewModal.tsx:38` `zIndex: 1000,`
- `src/components/admin/AdminLayout.tsx:230` `position: absolute; top: calc(100% + 8px); right: 0; z-index: 1100;`
- `src/components/admin/ContractPanel/FileUploadModal.tsx:64` `zIndex: 1000,`
- `src/components/admin/StageActAdminCard.tsx:233` `zIndex: 1000,`
- `src/components/app/AiImageStudio.tsx:270` `position: fixed; inset: 0; z-index: 10050;`
- `src/components/app/AppCard.tsx:130` `position: "fixed", inset: 0, zIndex: 1050,`
- `src/components/app/HintTour.tsx:283` `zIndex: 10000,`
- `src/components/app/HintTour.tsx:305` `zIndex: 10001,`
- `src/components/app/HintTour.tsx:321` `zIndex: 10002,`
- `src/components/app/HintTour.tsx:422` `zIndex: 900,`
- `src/components/Client/ClientContractPanel.tsx:87` `zIndex: 1000,`
- `src/components/Community/ConfirmDialog.tsx:37` `zIndex: 1200,`
- `src/components/Community/CreateProjectDialog.tsx:46` `zIndex: 1200,`
- `src/components/Community/landing-uploader/LandingUploaderLayout.tsx:421` `zIndex: 1100,`
- `src/components/Community/LandingUploader.tsx:635` `position: "fixed", right: 20, top: 72, zIndex: 1200, maxWidth: 360,`
- `src/components/Community/PortfolioCardBrowseModal.tsx:150` `zIndex: 1080,`
- `src/components/dashboard-ui/styles/dashboard-extras.css:401` `z-index: 9999;`
- `src/components/Payments/QuickPaymentButton.tsx:115` `zIndex: 1000,`
- `src/components/stage/markup/constants.ts:6` `z-index: 10050;`
- `src/components/stage/markup/MarkupToaster.tsx:24` `zIndex: 9999,`
- `src/components/ui/ImageLightbox.tsx:42` `position: "fixed", inset: 0, zIndex: 10000,`
- `src/components/ui/modal.tsx:52` `position: "fixed", inset: 0, zIndex: 1100,`
- 1 more line — `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` lists every one.

#### long-duration · 26

21 lines in 10 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/globals.css:268` `animation-duration: 3.5s;`
- `src/app/onboarding/form/page.tsx:1043` `transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",`
- `src/app/onboarding/regulations/RegulationsClient.tsx:380` `transition: "width 0.5s linear"`
- `src/app/onboarding/regulations/RegulationsClient.tsx:396` `transition: "width 0.35s cubic-bezier(0.16,1,0.3,1)"`
- `src/app/orders/new/page.tsx:1336` `transition: "opacity 0.35s ease, transform 0.35s ease",`
- `src/components/Academy/AcademyPage.css:280` `transition: width 0.4s ease;`
- `src/components/app/BriefAIDrawer.tsx:147` `transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",`
- `src/components/app/UploadingCard.tsx:192` `.upload-card__bar--indeterminate { animation-duration: 2.4s; }`
- `src/components/Community/PortfolioUploader.tsx:125` `transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",`
- `src/components/Community/PortfolioUploader.tsx:268` `` animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite` ``
- `src/components/Community/PortfolioUploader.tsx:1106` `.pf-carousel__item { flex: 0 0 120px; transition: 0.5s ease-in-out; scroll-snap-align: start; }`
- `src/components/Community/PortfolioUploader.tsx:1128` `transition: opacity 0.5s ease-in-out, transform 0.5s 0.2s, visibility 0.5s ease-in-out;`
- `src/components/landing/DesignerSlider.tsx:273` `transition: all 0.5s;`
- `src/components/landing/DesignerSlider.tsx:283` `transition: opacity 0.5s;`
- `src/components/landing/DesignerSlider.tsx:303` `animation: ds-animate 1s ease-in-out 0s 1 forwards;`
- `src/components/landing/DesignerSlider.tsx:373` `animation: ds-animate 1s ease-in-out 0.3s 1 forwards;`
- `src/components/landing/DesignerSlider.tsx:384` `animation: ds-animate 1s ease-in-out 0.6s 1 forwards;`
- `src/components/landing/DesignerSlider.tsx:488` `animation: ds-active-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;`
- `src/components/landing/DesignerSlider.tsx:557` `animation: ds-preview-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;`
- `src/components/landing/OsmoHeader.tsx:51` `transition: "color 0.6s ease",`
- `src/components/landing/OsmoHeader.tsx:71` `transition: "color 0.6s ease, background 0.6s ease, box-shadow 0.3s ease, transform 0.2s ease",`

#### glass · 25

25 lines in 17 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/onboarding/form/page.tsx:1024` `backdropFilter: "blur(2px)",`
- `src/components/app/AppCard.tsx:26` `backdropFilter: "blur(20px)",`
- `src/components/app/AppHeader.tsx:21` `backdropFilter: "blur(16px)",`
- `src/components/app/BriefAIDrawer.tsx:128` `backdropFilter: "blur(2px)",`
- `src/components/app/HintTour.tsx:281` `backdropFilter: "blur(5px)",`
- `src/components/auth/auth-card.module.css:11` `backdrop-filter: blur(20px) saturate(140%);`
- `src/components/Community/LandingUploader.tsx:640` `fontSize: 13, backdropFilter: "blur(8px)",`
- `src/components/Community/PortfolioUploader.tsx:112` `background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)",`
- `src/components/dashboard-ui/DashRightDrawer.tsx:90` `backdropFilter: "blur(2px)",`
- `src/components/dashboard-ui/styles/dashboard-cards.css:552` `@supports (backdrop-filter: blur(8px)) {`
- `src/components/dashboard-ui/styles/dashboard-cards.css:554` `backdrop-filter: blur(12px);`
- `src/components/dashboard-ui/styles/dashboard-cards.css:555` `-webkit-backdrop-filter: blur(12px);`
- `src/components/dashboard-ui/styles/dashboard-cards.css:859` `backdrop-filter: blur(8px);`
- `src/components/dashboard-ui/styles/dashboard-cards.css:860` `-webkit-backdrop-filter: blur(8px);`
- `src/components/dashboard-ui/styles/dashboard-cards.css:998` `backdrop-filter: blur(8px);`
- `src/components/dashboard-ui/styles/dashboard-cards.css:999` `-webkit-backdrop-filter: blur(8px);`
- `src/components/dashboard-ui/styles/dashboard-extras.css:969` `backdrop-filter: blur(6px);`
- `src/components/dashboard-ui/styles/dashboard-extras.css:970` `-webkit-backdrop-filter: blur(6px);`
- `src/components/landing/designer-profile-modal/styles.ts:23` `backdropFilter: "blur(24px) saturate(1.2)",`
- `src/components/landing/DesignerSlider.tsx:456` `backdrop-filter: blur(8px);`
- `src/components/landing/OsmoHeader.tsx:69` `backdropFilter: "blur(8px)",`
- `src/components/stage/markup/constants.ts:30` `backdropFilter: "blur(8px)",`
- `src/components/stage/markup/constants.ts:43` `backdropFilter: "blur(8px)",`
- `src/components/stage/markup/MarkupCanvas.tsx:146` `backdropFilter: "blur(4px)",`
- `src/components/ui/modal.tsx:54` `backdropFilter: "blur(8px)",`

#### palette · 24

12 lines in 1 file; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/components/ui/confirm-dialog.tsx:138` `band: "bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/15",`
- `src/components/ui/confirm-dialog.tsx:139` `icon: "text-amber-500",`
- `src/components/ui/confirm-dialog.tsx:140` `title: "text-amber-600 dark:text-amber-400",`
- `src/components/ui/confirm-dialog.tsx:141` `solidButton: "border-transparent bg-amber-500 text-white hover:bg-amber-600",`
- `src/components/ui/confirm-dialog.tsx:145` `band: "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/15",`
- `src/components/ui/confirm-dialog.tsx:146` `icon: "text-emerald-500",`
- `src/components/ui/confirm-dialog.tsx:147` `title: "text-emerald-600 dark:text-emerald-400",`
- `src/components/ui/confirm-dialog.tsx:148` `solidButton: "border-transparent bg-emerald-500 text-white hover:bg-emerald-600",`
- `src/components/ui/confirm-dialog.tsx:152` `band: "bg-red-500/10 border-red-500/30 dark:bg-red-500/15",`
- `src/components/ui/confirm-dialog.tsx:153` `icon: "text-red-500",`
- `src/components/ui/confirm-dialog.tsx:154` `title: "text-red-600 dark:text-red-400",`
- `src/components/ui/confirm-dialog.tsx:155` `solidButton: "border-transparent bg-red-500 text-white hover:bg-red-600",`

#### transition-all · 21

21 lines in 15 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/admin/orders/orders.css:83` `transition: all 0.12s;`
- `src/app/onboarding/form/page.tsx:606` `transition: "all 0.15s",`
- `src/app/onboarding/form/page.tsx:652` `transition: "all 0.15s",`
- `src/components/Academy/AcademyPage.css:352` `transition: all 0.2s;`
- `src/components/app/brief-form-animations.css:164` `transition: all 0.2s ease;`
- `src/components/app/BriefAIDrawer.tsx:95` `transition: "all 0.15s",`
- `src/components/app/BriefFormEnhancements.tsx:274` `transition: "all 0.2s ease",`
- `src/components/app/OrderStagesGrid.tsx:196` `"group relative flex h-full min-h-0 flex-col overflow-hidden transition-all duration-200",`
- `src/components/app/SpecialistCard.tsx:110` `transition: "all 0.2s",`
- `src/components/Dashboard/client-dashboard.css:69` `transition: all 0.2s ease;`
- `src/components/Dashboard/client-dashboard.css:170` `transition: all 0.2s ease;`
- `src/components/Dashboard/client-dashboard.css:244` `transition: all 0.2s ease;`
- `src/components/Dashboard/specialist-dashboard.css:64` `transition: all 0.2s ease;`
- `src/components/Dashboard/specialist-dashboard.css:175` `transition: all 0.2s ease;`
- `src/components/Dashboard/specialist-dashboard.css:370` `transition: all 0.2s ease;`
- `src/components/landing/DesignerSlider.tsx:273` `transition: all 0.5s;`
- `src/components/landing/DesignerSlider.tsx:383` `transition: all 0.3s;`
- `src/components/ui/badge.tsx:8` `"group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-med`
- `src/components/ui/button.tsx:7` `"group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transi`
- `src/components/ui/switch.tsx:11` `className="w-9 h-5 bg-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-wh`
- `src/components/ui/tabs.tsx:61` `"relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium white`

#### side-stripe · 18

18 lines in 7 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1060` `borderLeft: "3px solid rgba(245, 158, 11, 0.9)"`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1094` `borderLeft: "3px solid rgba(56, 189, 248, 0.95)"`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1209` `borderLeft: "3px solid rgba(245, 158, 11, 0.9)"`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1356` `borderLeft: "3px solid rgba(234,84,85,0.65)"`
- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:1504` `borderLeft: "3px solid var(--dash-warn)",`
- `src/app/admin/orders/components/stage-waves/PendingDraftCard.tsx:34` `<div style={{paddingLeft: 10, borderLeft: "3px solid rgba(245, 158, 11, 0.9)"}}>`
- `src/app/admin/orders/components/stage-waves/PendingDraftCard.tsx:69` `<div style={{paddingLeft: 10, borderLeft: "3px solid rgba(56, 189, 248, 0.95)", marginTop: 10}}>`
- `src/app/admin/orders/components/stage-waves/PendingDraftCard.tsx:163` `<div style={{marginTop: 10, paddingLeft: 10, borderLeft: "3px solid rgba(239,68,68,0.95)"}}>`
- `src/app/admin/orders/components/stage-waves/ReleaseWaveCard.tsx:63` `<div style={{paddingLeft: 10, borderLeft: "3px solid rgba(245, 158, 11, 0.9)"}}>`
- `src/app/admin/orders/components/stage-waves/ReleaseWaveCard.tsx:96` `<div style={{paddingLeft: 10, borderLeft: "3px solid rgba(56, 189, 248, 0.95)"}}>`
- `src/app/admin/orders/components/stage-waves/WaveCardUnified.tsx:125` `<div style={{paddingLeft: 10, borderLeft: "3px solid rgba(245, 158, 11, 0.9)"}}>`
- `src/app/admin/orders/components/stage-waves/WaveCardUnified.tsx:159` `<div style={{paddingLeft: 10, borderLeft: "3px solid rgba(56, 189, 248, 0.95)", marginTop: 10}}>`
- `src/app/admin/orders/components/stage-waves/WaveCardUnified.tsx:273` `borderLeft: "3px solid rgba(239,68,68,0.95)"`
- `src/app/admin/page.tsx:64` `<div className="card border-warning mb-4" style={{borderLeft: "4px solid var(--bs-warning)"}}>`
- `src/app/orders/[id]/stage-card/StageMaterialsSection.tsx:194` `borderLeft: "3px solid rgba(245, 158, 11, 0.9)"`
- `src/app/orders/[id]/stage-card/StageMaterialsSection.tsx:228` `borderLeft: "3px solid rgba(56, 189, 248, 0.95)"`
- `src/app/orders/[id]/stage-card/StageMaterialsSection.tsx:531` `borderLeft: "3px solid var(--dash-warn)"`
- `src/app/orders/[id]/StageCard.tsx:198` `borderLeft: "3px solid var(--dash-border)"`

#### ascii-punctuation · 17

17 lines in 13 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/(dashboard)/work/orders/[id]/SpecialistStageWorkBody.tsx:201` `{uploading ? "Загрузка..." : "Загрузить акт (PDF)"}`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:279` `<textarea rows={3} placeholder="Расскажите о специализации..." value={form.about || ""}`
- `src/app/(dashboard)/work/profile/ProfileForm.tsx:559` `{saved ? savedLabel : loading ? "Сохранение..." : submitLabel}`
- `src/app/admin/landing/LandingBundlesClient.tsx:159` `<div className="text-center py-5 text-muted">Загрузка...</div>`
- `src/app/admin/landing/LandingBundlesClient.tsx:346` `style={{fontSize: "0.8rem"}}>Загрузка...</span>}`
- `src/app/admin/specialists/components/SpecialistDetailRoute.tsx:16` `<p>{shell.loading ? "Загрузка..." : "Специалист не найден"}</p>`
- `src/app/admin/specialists/SpecialistsShell.tsx:346` `placeholder="Поиск..."`
- `src/app/admin/specialists/SpecialistsShell.tsx:363` `{loading && <div className="sp-empty">Загрузка...</div>}`
- `src/app/onboarding/contract/page.tsx:200` `<p style={{color: "rgba(255,255,255,0.5)", margin: 0}}>Загрузка...</p>`
- `src/app/onboarding/form/page.tsx:79` `placeholder: "Расскажите о вашем опыте и специализации...",`
- `src/components/app/StageUpload.tsx:309` `? "Загрузка..."`
- `src/components/Client/client-cabinet/OrderListActions.tsx:137` `{deleting ? "Удаление..." : confirming ? "Точно?" : "Удалить"}`
- `src/components/Client/ClientActSection.tsx:144` `{uploading ? "Загрузка..." : "Загрузить подписанный акт (PDF)"}`
- `src/components/Community/AvatarUpload.tsx:403` `{uploading ? "Загрузка..." : aiResult ? "Применить вариант ИИ" : "Применить"}`
- `src/components/Payments/QuickPaymentButton.tsx:102` `<span>{loading ? "Обработка..." : skipPayments ? "Продолжить без оплаты" : "Оплатить картой"}</span>`
- `src/components/Payments/QuickPaymentButton.tsx:200` `{loading ? "Обработка..." : "Оплатить"}`
- `src/components/ui/PhoneField.tsx:165` `placeholder="Поиск страны..."`

#### layout-transition · 16

16 lines in 12 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `public/sneat/perfect-scrollbar.css:70` `transition: background-color 0.2s linear, height 0.2s ease-in-out;`
- `public/sneat/perfect-scrollbar.css:82` `transition: background-color 0.2s linear, width 0.2s ease-in-out;`
- `src/app/admin/clients/ClientDetailRoute.tsx:402` `transition: "width 0.3s"`
- `src/app/onboarding/regulations/RegulationsClient.tsx:380` `transition: "width 0.5s linear"`
- `src/app/onboarding/regulations/RegulationsClient.tsx:396` `transition: "width 0.35s cubic-bezier(0.16,1,0.3,1)"`
- `src/app/orders/new/page.tsx:1035` `transition: "width 0.3s"`
- `src/components/Academy/AcademyPage.css:280` `transition: width 0.4s ease;`
- `src/components/app/document-upload.module.css:166` `transition: width 0.2s ease;`
- `src/components/app/UploadingCard.tsx:183` `transition: width 0.2s ease;`
- `src/components/Client/client-cabinet/OrdersListView.tsx:140` `transition: "width 0.3s",`
- `src/components/Client/client-cabinet/OrdersListView.tsx:169` `transition: "width 0.3s",`
- `src/components/Community/PortfolioUploader.tsx:918` `transition: "width 0.2s"`
- `src/components/dashboard-ui/styles/dashboard-extras.css:942` `transition: width 0.3s;`
- `src/components/Dashboard/client-dashboard.css:301` `transition: width 0.3s ease;`
- `src/components/Dashboard/specialist-dashboard.css:339` `transition: width 0.3s ease;`
- `src/components/Dashboard/specialist-dashboard.css:419` `transition: width 0.3s ease;`

#### fill-and-shadow · 13

13 lines in 6 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/admin/clients/ClientsShell.tsx:292` `color: #fff; box-shadow: 0 4px 12px rgba(14,165,233,0.3);`
- `src/components/auth/auth-card.module.css:17` `box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);`
- `src/components/dashboard-ui/styles/dashboard-base.css:82` `box-shadow: 0 1px 0 color-mix(in oklab, #fff 4%, transparent);`
- `src/components/dashboard-ui/styles/dashboard-base.css:138` `box-shadow: 0 0 8px color-mix(in oklab, var(--dash-accent) 60%, transparent);`
- `src/components/dashboard-ui/styles/dashboard-base.css:219` `box-shadow: 0 0 0 1px color-mix(in oklab, var(--dash-accent) 25%, transparent);`
- `src/components/dashboard-ui/styles/dashboard-base.css:436` `box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);`
- `src/components/dashboard-ui/styles/dashboard-base.css:861` `box-shadow: 0 4px 14px hsla(247, 72%, 45%, 0.35);`
- `src/components/dashboard-ui/styles/dashboard-cards.css:265` `box-shadow: var(--dash-shadow-lg);`
- `src/components/dashboard-ui/styles/dashboard-extras.css:65` `box-shadow: 0 0 6px hsla(0, 72%, 58%, 0.6);`
- `src/components/dashboard-ui/styles/dashboard-extras.css:178` `box-shadow: 0 0 6px hsla(38, 85%, 58%, 0.55);`
- `src/components/dashboard-ui/styles/dashboard-extras.css:241` `box-shadow: var(--dash-shadow);`
- `src/components/landing/DesignerSlider.tsx:268` `box-shadow: 0 30px 50px #505050;`
- `src/components/landing/DesignerSlider.tsx:457` `box-shadow: 0 4px 16px rgba(0,0,0,0.2);`

#### hover-lift · 12

12 lines in 7 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/globals.css:167` `transform: translateY(-2px);`
- `src/components/Academy/AcademyPage.css:181` `transform: translateY(-2px);`
- `src/components/Community/PortfolioUploader.tsx:1107` `.pf-carousel__item:hover { flex: 0 0 250px; transform: translateY(-18px); }`
- `src/components/dashboard-ui/styles/dashboard-base.css:867` `transform: translateY(-1px);`
- `src/components/dashboard-ui/styles/dashboard-cards.css:56` `transform: translateY(-2px) scale(1.01);`
- `src/components/dashboard-ui/styles/dashboard-cards.css:67` `transform: translateY(-2px) scale(1.01);`
- `src/components/dashboard-ui/styles/dashboard-cards.css:920` `transform: translateY(-1px);`
- `src/components/Dashboard/client-dashboard.css:176` `transform: translateY(-2px);`
- `src/components/Dashboard/client-dashboard.css:249` `transform: translateY(-2px);`
- `src/components/landing/DesignerSlider.tsx:464` `transform: scale(1.1);`
- `src/components/landing/DesignerSlider.tsx:530` `transform: translateY(-53%);`
- `src/components/landing/DesignerSlider.tsx:565` `transform: translateY(-3%);`

#### border-and-shadow · 11

11 lines in 6 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/admin/clients/ClientsShell.tsx:242` `cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.08);`
- `src/components/app/AiImageStudio.tsx:282` `box-shadow: 0 24px 60px rgba(0,0,0,0.45);`
- `src/components/Community/PortfolioUploader.tsx:1115` `box-shadow: 1px 3px 15px rgba(0,0,0,0.28);`
- `src/components/dashboard-ui/styles/dashboard-base.css:457` `box-shadow: 0 1px 0 rgba(255, 255, 255, 0.12) inset,`
- `src/components/dashboard-ui/styles/dashboard-base.css:1065` `box-shadow: 0 4px 18px hsla(247, 88%, 50%, 0.5);`
- `src/components/dashboard-ui/styles/dashboard-cards.css:142` `box-shadow: 0 6px 14px rgba(0, 0, 0, 0.26);`
- `src/components/dashboard-ui/styles/dashboard-cards.css:302` `box-shadow: 0 0 12px hsla(270, 30%, 10%, 0.4);`
- `src/components/dashboard-ui/styles/dashboard-cards.css:763` `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);`
- `src/components/dashboard-ui/styles/dashboard-extras.css:10` `box-shadow: 0 4px 16px hsla(0, 60%, 30%, 0.18);`
- `src/components/dashboard-ui/styles/dashboard-extras.css:123` `box-shadow: 0 4px 16px hsla(38, 60%, 30%, 0.14);`
- `src/components/dashboard-ui/styles/dashboard-extras.css:1144` `box-shadow: 0 8px 20px rgba(0, 0, 0, 0.24);`

#### input-glow · 6

5 lines in 5 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/admin/layout.tsx:79` `box-shadow: 0 0 0 0.2rem rgba(99,102,241,0.25);`
- `src/app/globals.css:211` `box-shadow: 0 0 0 1000px rgba(28, 28, 32, 0.95) inset !important;`
- `src/components/Community/PortfolioCardEditorModal.tsx:691` `box-shadow: 0 0 0 0.15rem rgba(115,103,240,0.2);`
- `src/components/dashboard-ui/styles/dashboard-extras.css:527` `box-shadow: 0 0 0 3px var(--dash-accent-bg) !important;`
- `src/components/ui/textarea.tsx:10` `"flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base text-foreground transition-colors outline-none pl`

#### inert-button · 6

6 lines in 2 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/components/Academy/AcademyPage.tsx:127` `<button className="btn-outline">↺ Начать заново</button>`
- `src/components/Academy/AcademyPage.tsx:128` `{!course.completed && <button className="btn-primary-acad">Продолжить ›</button>}`
- `src/components/Academy/AcademyPage.tsx:168` `<button>🔍</button>`
- `src/components/Academy/AcademyPage.tsx:231` `<button className="btn-primary-acad" style={{flex: "none", padding: "10px 20px"}}>Смотреть`
- `src/components/Academy/AcademyPage.tsx:241` `<button className="btn-danger-acad">Смотреть курсы</button>`
- `src/components/Community/landing-uploader/LandingUploaderLayout.tsx:284` `title="Просмотреть">`

#### exclamation · 5

5 lines in 5 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/onboarding/contract/page.tsx:30` `detail: "Все этапы пройдены. Добро пожаловать на платформу!",`
- `src/app/onboarding/regulations/RegulationsClient.tsx:538` `{shown.passed ? "Тест пройден!" : "Тест не пройден"}`
- `src/app/orders/[id]/OrderDetailClient.tsx:414` `}}>Заявка отправлена!</span>`
- `src/components/Dashboard/ClientDashboard.tsx:70` `<h1 className="client-dashboard__title">Добро пожаловать, {name.split(" ")[0]}!</h1>`
- `src/components/Dashboard/SpecialistDashboard.tsx:104` `<h1 className="spec-dashboard__title">Добро пожаловать, {name}!</h1>`

#### bounce-easing · 4

4 lines in 3 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/components/app/AppCard.tsx:149` `animation: "modal-in 0.22s cubic-bezier(0.34,1.56,0.64,1)",`
- `src/components/app/AppCard.tsx:160` `animation: "modal-in 0.22s cubic-bezier(0.34,1.56,0.64,1)",`
- `src/components/Community/PortfolioUploader.tsx:268` `` animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite` ``
- `src/components/ui/modal.tsx:78` `animation: "modal-in 0.22s cubic-bezier(0.34,1.56,0.64,1)",`

#### dead-link · 4

4 lines in 4 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/components/app/DashboardHeader.tsx:41` `<a className="nav-item nav-link px-0 me-xl-6" href="#">`
- `src/components/app/DashboardSidebar.tsx:68` `<a href="#" className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">`
- `src/components/landing/OsmoHeader.tsx:44` `href="#"`
- `src/components/sneat/Navbar.tsx:10` `<a className="nav-item nav-link px-0 me-xl-4" href="#">`

#### font-family · 2

2 lines in 2 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/globals.css:149` `` `.layout-wrapper`'s own font-family always beats the `body { font-family: ... }` ``
- `src/lib/email-template.ts:29` `body { margin: 0; padding: 0; background-color: #eee; font-family: Arial, Helvetica, sans-serif; color: #1f1831; }`

#### body-case · 2

2 lines in 1 file; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/orders/[id]/OrderBriefCommercialTerms.tsx:128` `textTransform: "uppercase",`
- `src/app/orders/[id]/OrderBriefCommercialTerms.tsx:201` `textTransform: "uppercase",`

#### uppercase-heading · 2

2 lines in 2 files; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/orders/new/page.tsx:571` `textTransform: "uppercase",`
- `src/components/landing/designer-profile-modal/ProfileHeader.tsx:64` `textTransform: "uppercase",`

#### heading-skip · 1

1 line in 1 file; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/admin/page.tsx:182` `<h6 className="card-title mb-1">{item.label}</h6>`

#### animated-layout · 1

1 line in 1 file; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/components/Academy/AcademyPage.css:150` `transition: left 0.2s;`

#### unverified-claim · 1

1 line in 1 file; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/components/Kanban/MvpKanban.tsx:111` `tasks: ["Удержание 100% суммы при подтверждении заказа", "Выплата специалисту после подписания акта", "Webhook-обработчик статусов", "Выставление счета на допол`

#### nested-card · 1

1 line in 1 file; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/components/Kanban/MvpKanban.tsx:290` `const [modalCard, setModalCard] = useState<Card | null>(null)`

#### pulsing-dot · 1

1 line in 1 file; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/components/app/brief-form-animations.css:69` `animation: pulse 1.5s ease-in-out infinite;`

#### broken-image · 1

1 line in 1 file; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/components/stage/markup/MarkupCanvas.tsx:30` `/** Доп. гейт: пока <img> внутри annotator не загрузилась, у Annotorious могут быть NaN/Infinity в SVG. */`

#### no-not-found · 1

1 line in 1 file; `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` says what to put in each one's place.

- `src/app/layout.tsx:1` `import type {Metadata} from "next";`

### Found by review — 3 findings

What a pattern cannot see — hierarchy, copy, missing states, one row that disagrees with itself — read in the code against boburxd/nexus-web's own system. `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs` does not check these.

- `src/app/onboarding/form/page.tsx:251` `// ✨ Кнопка у поля «О себе» — превращает набросок в развёрнутый официальный текст` — Replace cliché AI sparkle icons and references with a functional label and specific icon.
- `src/components/dashboard-ui/styles/dashboard-extras.css:1049` `border-left: 3px solid var(--dash-warn);` — Indicate warning status using an icon and semantic text color instead of a left border stripe.
- `src/components/dashboard-ui/styles/dashboard-extras.css:1054` `border-left-color: var(--dash-success);` — Remove the success state left border stripe and use an inline icon or badge.

## Approved exceptions

<!-- broom:keep -->

boburxd/nexus-web's own system decides these on purpose, so they are not findings here and `detect.mjs` does not check them:

- The palette moved from violet to cool slate / steel blue on 2026-09-28 at the owner's request (the old "--color-accent #181f4a is a purple brand" exception no longer applies). The new token values in `src/app/globals.css`, `src/components/dashboard-ui/styles/dashboard-base.css`, `src/components/admin/AdminLayout.tsx` and `public/sneat/core.css` are written in `hsl()`: the Broom v1 audit still holds the old hex values as the token list, so a new hex inside a token definition would read as off-system until the next audit.
- Your system declares --dash-shadow (0 4px 12px hsla(220, 40%, 3%, 0.35)), so shadows are part of it.
- `src/components/dashboard-ui/ChatEmojiPicker.tsx:10-36` — the emoji are the picker's data: what a person inserts into a chat message. They are content, not decoration; replacing them with icons would remove the feature.
- `src/lib/onboarding/regulations-questions.ts:92,216,218` and `src/lib/onboarding/nexus-quiz.ts:182,517` — percentages and figures in the platform's own regulations and the qualification quiz answer keys (e.g. «100% предоплата клиентом за каждый этап»). Changing them changes the rules and the quiz.
- `src/lib/email-template.ts` `font-family: Arial, Helvetica, sans-serif` — HTML e-mail: mail clients cannot load the product font or read CSS variables.
- `src/components/Kanban/MvpKanban.tsx:302` "nested card" (server check) — the line is `useState<Card | null>` (a type named `Card`); the board renders kanban cards in columns, not a card inside a card.
- `src/components/landing/OsmoHeader.tsx` wordmark `clamp(1.5rem, 3vw, 2.6rem)` and other `clamp()` display sizes on the landing — display type above the 24px step of the text scale, sized fluidly on purpose.

Nothing outside this list is an exception: a line the check prints is a line to fix. When you decide on a departure, add it here — what, where and why — instead of an override in the file you happen to be working in. This section carries the marker, so a re-run leaves it.
