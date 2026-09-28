# boburxd/nexus-web — UI work

boburxd/nexus-web already has a design system, and new UI is built from it. Broom read it from the product on 2026-09-28; the audit, with every finding, is `SLOP_REPORT.md`.

## Where the system is

- Components: 60 shared components, such as `Icon` (`@/components/ui/icon`), `StatusBadge` (`@/components/app/AppCard`), `Modal` (`@/components/ui/modal`), `UploadingCards` (`@/components/app/UploadingCard`). Every one, with its import path: `.claude/skills/boburxd-nexus-web-build/references/components.md`.
- Tokens: 71 colour tokens, PP Neue Montreal and Geist Mono and Inter, 5 font sizes, 8 radii; every value in `.claude/skills/boburxd-nexus-web-build/references/tokens.md`.

## Skills

They are Markdown files in `.claude/skills/` (Codex loads skills from `.agents/skills/`, see README.md). Before a task, read the `SKILL.md` that matches it.

- `.claude/skills/boburxd-nexus-web-build/SKILL.md` — any task that adds or changes a screen, a component or a style.
- `.claude/skills/boburxd-nexus-web-states/SKILL.md` — empty, loading, error, long-content and no-permission states.
- `.claude/skills/boburxd-nexus-web-edge-cases/SKILL.md` — the hard cases a screen has to survive before it is finished.
- `.claude/skills/boburxd-nexus-web-consistency/SKILL.md` — collapsing the same thing done two ways onto one.
- `.claude/skills/boburxd-nexus-web-review/SKILL.md` — reviewing a screen, a diff or a pull request.
- `.claude/skills/boburxd-nexus-web-finish/SKILL.md` — the last pass before you call UI work done.
- `.claude/skills/boburxd-nexus-web-slop-check/SKILL.md` — the slop check, and fixing what it prints.

## Before you finish

Run `node .claude/skills/boburxd-nexus-web-slop-check/detect.mjs <the files you changed>` and fix every line it prints. It exits 0 when they are clean.

## Components

- Use `Icon` from `@/components/ui/icon`.
- Use `StatusBadge`, `AppCard`, `ActionButton`, `AppModal` from `@/components/app/AppCard`.
- Use `Modal` from `@/components/ui/modal`.
- Use `UploadingCards` from `@/components/app/UploadingCard`.
- Use `AdminLayout` from `@/components/admin/AdminLayout`.
- Use `DashTopHeader` from `@/components/dashboard-ui/DashTopHeader`.
- Use `AiIcon` from `@/components/app/AiIcon`.
- Use `OnboardingShell` from `@/components/app/OnboardingShell`.
- Use `ClientDashFooter` from `@/components/Client/ClientDashFooter`.
- Use `DocumentUpload` from `@/components/app/DocumentUpload`.
- Use `DashMainLayout` from `@/components/dashboard-ui/DashMainLayout`.
- Use `SignOutButton` from `@/components/auth/SignOutButton`.
- Use `AuditTimeline` from `@/components/admin/AuditTimeline`.
- Use `Button` from `@/components/ui/button`. Never a raw `<button>`.
- Use `DashActionLink` from `@/components/dashboard-ui/DashActionLink`.
- Use `AdminTable`, `AdminTableBody`, `AdminTableCell`, `AdminTableHead`, `AdminTableHeader`, `AdminTableRow`, `AdminTableWrapper` from `@/components/admin/AdminTable`.
- Use `DashEmptyState` from `@/components/dashboard-ui/DashEmptyState`.
- Use `DashSectionCard` from `@/components/dashboard-ui/DashSectionCard`.
- Use `DashSurfaceCard` from `@/components/dashboard-ui/DashSurfaceCard`.
- Use `FileAudienceBadge` from `@/components/app/FileAudienceBadge`.
- Use `HintTour`, `HintTourLauncher` from `@/components/app/HintTour`.
- Use `ImageLightbox` from `@/components/ui/ImageLightbox`.
- Use `Switch` from `@/components/ui/switch`.
- Use `AdminAccordion` from `@/components/admin/AdminAccordion`.
- Use `AuthCard` from `@/components/auth/AuthCard`.
- Use `Badge` from `@/components/ui/badge`.
- Use `BriefEditor` from `@/components/admin/BriefEditor`.
- Use `Card` from `@/components/ui/card`.
- Use `ClientContractPanel` from `@/components/Client/ClientContractPanel`.
- Use `DashboardBreadcrumb` from `@/components/app/DashboardBreadcrumb`.
- Use `DashboardLayout` from `@/components/app/DashboardLayout`.
- Use `DashBriefCard` from `@/components/dashboard-ui/DashBriefCard`.
- Use `DashCarousel` from `@/components/dashboard-ui/DashCarousel`.
- Use `DashHeroFrame` from `@/components/dashboard-ui/DashHeroFrame`.
- Use `DashListHeader` from `@/components/dashboard-ui/DashListHeader`.
- Use `DashOrderCard` from `@/components/dashboard-ui/DashOrderCard`.
- Use `DashPageTitle` from `@/components/dashboard-ui/DashPageTitle`.
- Use `DashProgressCard` from `@/components/dashboard-ui/DashProgressCard`.
- Use `DashRightDrawer` from `@/components/dashboard-ui/DashRightDrawer`.
- Use `DashStatsRow` from `@/components/dashboard-ui/DashStatsRow`.
- Use `DesignerProfileModal` from `@/components/landing/designer-profile-modal`.
- Use `MultiSelectField` from `@/components/ui/MultiSelectField`.
- Use `NotificationBell` from `@/components/Community/NotificationBell`.
- Use `OrderChatPanel` from `@/components/dashboard-ui/OrderChatPanel`.
- Use `OrderHistoryTimeline` from `@/components/dashboard-ui/OrderHistoryTimeline`.
- Use `OrderStagesGrid` from `@/components/app/OrderStagesGrid`.
- Use `PhoneField` from `@/components/ui/PhoneField`.
- Use `PortfolioLinksField` from `@/components/ui/PortfolioLinksField`.
- Use `ProjectWorkflowInstructions` from `@/components/app/ProjectWorkflowInstructions`.
- Use `AcademyPage` from `@/components/Academy/AcademyPage`.
