export const SPECIALISTS_STYLES = `
  /* ── split panel: fill adm-content--np ── */
  /* Кнопки и поля shadcn (Button, Input) внутри раздела берут цвета из --adm-*,
     чтобы читаться и в светлой, и в тёмной теме админки. */
  .sp-wrap {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  /* ── Left list ── */
  .sp-list {
    width: 260px;
    flex-shrink: 0;
    background: var(--adm-outer);
    border-right: 1px solid var(--adm-sidebar-border);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,0.12) transparent;
  }
  .sp-list::-webkit-scrollbar { width: 5px; }
  .sp-list::-webkit-scrollbar-track { background: transparent; }
  .sp-list::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.12);
    border-radius: 10px;
  }
  .sp-list::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.22); }

  .sp-list-hd {
    padding: 10px 16px;
    border-bottom: 1px solid var(--adm-sidebar-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    background: var(--adm-sidebar);
  }
  .sp-search {
    position: relative;
    padding: 8px 12px;
    flex-shrink: 0;
  }
  .sp-search-icon {
    position: absolute;
    left: 20px; top: 50%;
    transform: translateY(-50%);
    color: var(--adm-muted);
    font-size: 0.875rem;
    pointer-events: none;
  }
  .sp-search-input {
    width: 100%;
    height: 32px;
    padding: 0 8px 0 28px;
    border: 1px solid var(--adm-sidebar-border);
    border-radius: 6px;
    background: transparent;
    color: var(--adm-text);
    font-size: 0.75rem;
    outline: none;
    font-family: inherit;
  }
  .sp-search-input:focus {
    border-color: var(--adm-active-color);
  }
  .sp-search-input::placeholder {
    color: var(--adm-muted);
  }

  .sp-filters {
    display: flex; flex-wrap: wrap; gap: 4px;
    padding: 0 10px 10px; flex-shrink: 0;
  }
  .sp-empty {
    padding: 24px 16px;
    font-size: 0.875rem;
    color: var(--adm-muted);
    text-align: center;
  }

  /* ── User cards (like template) ── */
  .sp-user-card {
    display: block; color: inherit; text-decoration: none;
    margin: 0 10px 8px;
    padding: 12px 14px;
    background: var(--adm-card-bg);
    border-radius: 8px;
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.15s;
    text-align: left;
  }
  .sp-user-card:first-child { margin-top: 4px; }
  .sp-user-card:focus-visible { outline: 2px solid var(--adm-active-color); outline-offset: 2px; }
  .sp-user-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    transform: translateX(2px);
  }
  .sp-user-card--on {
    box-shadow: 0 4px 16px color-mix(in oklab, var(--adm-active-color) 20%, transparent);
    transform: translateX(2px);
  }
  .sp-user-card__top {
    display: flex; align-items: center; gap: 10px;
    padding-bottom: 10px; margin-bottom: 10px;
    border-bottom: 1px solid var(--adm-sidebar-border);
  }
  .sp-user-card__av {
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
  }
  .sp-user-card__name {
    font-weight: 600; font-size: 0.875rem;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    min-width: 0;
    color: var(--adm-name-color);
  }
  .sp-user-card__av-img {
    width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
  }
  .sp-user-card__bottom {
    display: flex; align-items: center; justify-content: space-between;
  }
  .sp-user-card__extra {
    font-size: 0.75rem; color: var(--adm-muted);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    max-width: 80px; text-align: right;
  }
  .sp-user-card__edo {
    margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--adm-sidebar-border);
    font-size: 0.75rem; color: var(--adm-muted); line-height: 1.25;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    display: flex; align-items: center; gap: 4px;
    text-align: left;
  }
  .sp-user-card__edo .bx { flex-shrink: 0; font-size: 0.75rem; opacity: 0.85; }

  /* ── Right detail ── */
  .sp-detail {
    flex: 1; overflow-y: auto;
    min-width: 0;
    display: flex; flex-direction: column;
  }
  .sp-detail-empty {
    text-align: center; color: var(--adm-muted); padding: 60px 0; flex: 1;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .sp-detail-empty i { font-size: 24px; opacity: 0.3; display: block; }
  .sp-detail-empty p { margin-top: 8px; }

  .sp-detail-sticky {
    position: sticky; top: 0; z-index: 5;
    background: var(--adm-content-bg);
    border-bottom: 1px solid var(--adm-sidebar-border);
    flex-shrink: 0;
  }
  .sp-detail-tabs { display: flex; flex-wrap: wrap; gap: 2px 4px; padding: 0 28px 6px; align-items: center; }
  .sp-detail-body { flex: 1; overflow-y: auto; padding: 24px 28px; }

  .sp-profile-header { display: flex; align-items: flex-start; gap: 16px; padding: 20px 28px 16px; }
  .sp-av-xl {
    width: 60px; height: 60px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; font-weight: 700; flex-shrink: 0;
    background: var(--adm-active-color);
    color: #fff;
    overflow: hidden;
  }
  .sp-profile-info { flex: 1; min-width: 0; }
  .sp-profile-name { font-weight: 600; font-size: 1.125rem; margin: 0 0 6px; color: var(--adm-name-color); }
  .sp-profile-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .sp-profile-email { color: var(--adm-muted); font-size: 0.75rem; }
  .sp-profile-location { color: var(--adm-muted); font-size: 0.75rem; margin-top: 6px; }
  .sp-profile-edo {
    color: var(--adm-muted); font-size: 0.75rem; margin-top: 6px; line-height: 1.35;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .sp-profile-edo .bx { margin-right: 4px; vertical-align: -1px; }
  .sp-profile-location i { margin-right: 2px; }
  .sp-profile-actions { display: flex; gap: 8px; flex-shrink: 0; }
  .sp-profile-right {
    margin-left: auto; display: flex; flex-direction: column;
    align-items: flex-end; gap: 8px; flex-shrink: 0;
  }
  .sp-profile-stat { text-align: right; }
  .sp-profile-stat__label { font-size: 0.75rem; color: var(--adm-muted); }
  .sp-profile-stat__value { font-size: 1.125rem; font-weight: 600; }

  .sp-orders-placeholder { text-align: center; color: var(--adm-muted); padding: 48px 0; }
  .sp-orders-placeholder i { font-size: 24px; opacity: 0.3; display: block; margin-bottom: 8px; }
  .sp-orders-placeholder p { margin: 0 0 16px; }
  .sp-order-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--adm-sidebar-border);
  }
  .sp-order-row:last-child { border-bottom: none; }

  .sp-onboarding-bar {
    background: var(--adm-card-bg);
    border-radius: 10px; padding: 16px 20px;
    margin-bottom: 20px;
  }
  .sp-onboarding-bar__track {
    height: 4px; background: var(--adm-sidebar-border);
    border-radius: 10px; overflow: hidden; margin-bottom: 14px;
  }
  .sp-onboarding-bar__fill {
    height: 100%; border-radius: 10px;
    background: var(--bs-success);
  }
  .sp-onboarding-steps { display: flex; justify-content: space-between; }
  .sp-onboarding-step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; background: none; border: none; }
  .sp-onboarding-step__dot {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 700;
    background: var(--adm-hover-bg); color: var(--adm-muted);
    transition: background 0.2s, color 0.2s;
  }
  .sp-onboarding-step--done .sp-onboarding-step__dot { background: rgba(34,197,94,0.15); color: var(--bs-success); }
  .sp-onboarding-step--done .sp-onboarding-step__dot i { font-size: 1rem; }
  .sp-onboarding-step__label { font-size: 0.75rem; color: var(--adm-muted); text-align: center; }
  .sp-onboarding-step--done .sp-onboarding-step__label { color: var(--adm-text); }
  .sp-onboarding-step--active .sp-onboarding-step__dot {
    background: rgba(14, 165, 233, 0.18);
    color: var(--adm-active-color);
  }
  .sp-onboarding-step--active .sp-onboarding-step__label { color: var(--adm-active-color); font-weight: 600; }
  .sp-onboarding-step--clickable { cursor: pointer; }
  .sp-onboarding-step--clickable:hover .sp-onboarding-step__dot { box-shadow: 0 0 0 3px var(--adm-active-bg); }
  .sp-onboarding-step--clickable:hover .sp-onboarding-step__label { color: var(--adm-active-color); }

  .sp-quiz-micro-wrap {
    background: var(--adm-card-bg);
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 16px;
  }
  .sp-quiz-micro-label {
    font-size: 0.75rem;
    color: var(--adm-muted);
    margin-bottom: 10px;
    line-height: 1.45;
  }
  .sp-quiz-micro-ticks {
    display: flex;
    gap: 4px;
    flex-wrap: nowrap;
    width: 100%;
  }
  .sp-quiz-micro-tick {
    flex: 1 1 0;
    min-width: 2px;
    height: 6px;
    border-radius: 4px;
    background: var(--adm-sidebar-border);
    transition: background 0.2s, transform 0.15s;
  }
  .sp-quiz-micro-tick--answered {
    cursor: help;
  }
  .sp-quiz-micro-tick--answered:hover {
    transform: scaleY(1.35);
  }
  .sp-quiz-micro-tick--correct {
    background: var(--bs-success);
  }
  .sp-quiz-micro-tick--wrong {
    background: var(--bs-danger);
  }

  .sp-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .sp-info-item { display: flex; align-items: flex-start; gap: 10px; }
  .sp-info-icon {
    width: 34px; height: 34px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
  }
  .sp-info-label { font-size: 0.75rem; color: var(--adm-muted); }
  .sp-info-value { font-weight: 500; font-size: 0.875rem; }
  .sp-info-value--empty { color: var(--adm-muted); font-weight: 400; font-style: italic; opacity: 0.6; }
  .sp-info-link {
    color: var(--adm-active-color); font-size: 0.875rem;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    display: block; max-width: 240px; text-decoration: none;
  }
  .sp-info-link:hover { text-decoration: underline; }
  .sp-about { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--adm-sidebar-border); }
  .sp-about-text { margin: 4px 0 0; font-size: 0.875rem; color: var(--adm-muted); white-space: pre-wrap; line-height: 1.5; }

  .sp-rating-section { margin-bottom: 16px; }
  .sp-stars { display: flex; align-items: center; gap: 2px; }
  .sp-star {
    font-size: 1.5rem; line-height: 1;
    color: var(--adm-sidebar-border); transition: color 0.15s;
  }
  .sp-star--on { color: var(--bs-warning); }
  .sp-stars button:hover:not(:disabled) .sp-star { color: var(--bs-warning); }
  .sp-star-value { color: var(--adm-muted); margin-left: 6px; font-weight: 600; font-size: 0.875rem; }

  .sp-landing-toggle { display: flex; align-items: center; gap: 10px; padding-top: 14px; border-top: 1px solid var(--adm-sidebar-border); }
  .sp-toggle-input { cursor: pointer; accent-color: var(--adm-active-color); width: 16px; height: 16px; }
  .sp-toggle-label { cursor: pointer; }
  .sp-toggle-text { font-weight: 500; font-size: 0.875rem; }
  .sp-toggle-sub { color: var(--adm-muted); margin-left: 4px; font-size: 0.75rem; }

  .sp-meta-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--adm-sidebar-border); font-size: 0.875rem; }
  .sp-meta-row:last-child { border-bottom: none; }
  .sp-meta-label { color: var(--adm-muted); min-width: 80px; }
  .sp-meta-value { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .sp-comment-row { padding: 6px 0; font-size: 0.875rem; border-bottom: 1px solid var(--adm-sidebar-border); }
  .sp-comment-row:last-child { border-bottom: none; }
  .sp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
  @media (max-width: 720px) {
    .sp-grid { grid-template-columns: 1fr; }
    .sp-list { width: 100%; height: 220px; flex-shrink: 0; }
    .sp-wrap { flex-direction: column; }
  }

  .sp-card { background: var(--adm-card-bg); border-radius: 8px; margin-bottom: 12px; }
  .sp-card-hd { padding: 8px 14px; border-bottom: 1px solid var(--adm-sidebar-border); }
  .sp-card-bd { padding: 12px 14px; }

  .sp-label { font-size: 0.75rem; font-weight: 600; color: var(--adm-muted); }
  .sp-badge {
    display: inline-flex; align-items: center;
    background: var(--adm-active-bg); color: var(--adm-active-color);
    padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600;
  }

  /* Статус специалиста (StatusBadge в списке и в шапке карточки) — фон на 30% непрозрачности
     цвета варианта вместо непрозрачного тона из bg-label-* (те объявлены с !important внутри
     @layer sneat — по спеке cascade layers !important из именованного слоя всегда перебивает
     !important вне слоёв независимо от специфичности, поэтому кладём override в тот же слой,
     где специфичность уже решает в нашу пользу; текст остаётся полностью читаемым). */
  @layer sneat {
    .sp-status-badge.bg-label-secondary { background-color: color-mix(in srgb, var(--bs-secondary) 30%, transparent) !important; }
    /* "Активен" (done → bg-label-success) — по запросу отдельный вид: белый фон 30%, тёмно-зелёный текст. */
    .sp-status-badge.bg-label-success   { background-color: rgba(255,255,255,0.3) !important; color: var(--bs-success) !important; }
    .sp-status-badge.bg-label-info      { background-color: color-mix(in srgb, var(--bs-info) 30%, transparent) !important; }
    .sp-status-badge.bg-label-warning   { background-color: color-mix(in srgb, var(--bs-warning) 30%, transparent) !important; }
    .sp-status-badge.bg-label-danger    { background-color: color-mix(in srgb, var(--bs-danger) 30%, transparent) !important; }
  }

  .sp-warn {
    background: rgba(234,179,8,0.10);
    color: color-mix(in oklab, var(--bs-warning) 75%, var(--adm-text));
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 0.875rem;
    margin-bottom: 12px;
  }

  /* Красное подтверждение ручных действий над онбордингом (OnboardingActionConfirmModal). */
  .sp-danger-modal__head {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 16px 20px;
    background: rgba(239,68,68,0.12);
    border-bottom: 1px solid rgba(239,68,68,0.35);
  }
  .sp-danger-modal__icon { color: var(--bs-danger); font-size: 1.5rem; line-height: 1.2; flex-shrink: 0; }
  .sp-danger-modal__title { margin: 0; color: var(--bs-danger); font-size: 1rem; font-weight: 700; line-height: 1.35; }
  .sp-danger-modal__sub { margin: 4px 0 0; font-size: 0.75rem; color: var(--adm-muted); line-height: 1.45; }
  .sp-danger-modal__body { padding: 16px 20px; }
  .sp-danger-modal__who { margin: 0 0 6px; font-size: 0.75rem; font-weight: 600; color: var(--adm-muted); }
  .sp-danger-modal__q { margin: 0; font-size: 0.875rem; line-height: 1.5; color: var(--adm-text); }
  .sp-danger-modal__forced {
    margin-top: 12px; padding: 10px 12px;
    background: rgba(239,68,68,0.08);
    border-radius: 8px;
    font-size: 0.75rem; color: var(--bs-danger); line-height: 1.45;
  }
  .sp-danger-modal__forced ul { margin: 6px 0 0; padding-left: 20px; }
  .sp-danger-modal__note { margin: 12px 0 0; font-size: 0.75rem; color: var(--adm-muted); }
  .sp-danger-modal__foot {
    display: flex; gap: 8px; justify-content: flex-end;
    padding: 14px 20px;
    border-top: 1px solid var(--adm-sidebar-border);
  }

  .sp-reject-dropdown { position: relative; }
  .sp-reject-menu {
    position: absolute; top: calc(100% + 6px); right: 0; z-index: 10;
    min-width: 220px;
    background: var(--adm-sidebar);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    padding: 4px;
    display: flex; flex-direction: column; gap: 2px;
  }
  .sp-reject-menu[hidden] { display: none; }

  .sp-modal-body { padding: 4px 0; }
  .sp-modal-title { margin: 0 0 16px; font-size: 1rem; font-weight: 600; }
  .sp-modal-empty { text-align: center; padding: 24px; color: var(--adm-muted); }
  .sp-modal-empty__title { font-weight: 600; margin: 8px 0 4px; color: var(--adm-text); }
  .sp-modal-empty__sub { font-size: 0.875rem; margin: 0; }
  .sp-modal-footer { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--adm-sidebar-border); }
  .sp-modal-score { font-size: 0.875rem; color: var(--adm-muted); }
  .sp-test-list { display: flex; flex-direction: column; gap: 16px; max-height: 60vh; overflow-y: auto; }
  .sp-test-q__meta { font-size: 0.75rem; color: var(--adm-muted); margin: 0 0 8px; line-height: 1.35; }
  .sp-test-q__text { margin: 0 0 12px; font-size: 0.875rem; line-height: 1.45; }
  .sp-test-q--ok { padding: 10px; border-radius: 8px; background: rgba(34,197,94,0.08); }
  .sp-test-q--fail { padding: 10px; border-radius: 8px; background: rgba(239,68,68,0.06); }
  .sp-test-opts { display: flex; flex-direction: column; gap: 6px; }
  .sp-test-opt { font-size: 0.75rem; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--adm-sidebar-border); display: flex; align-items: flex-start; gap: 8px; line-height: 1.4; }
  .sp-test-opt--correct { border-color: rgba(34,197,94,0.45); background: rgba(34,197,94,0.06); }
  .sp-test-opt--correct-pick { border-color: var(--bs-success); background: rgba(34,197,94,0.12); }
  .sp-test-opt--wrong-pick { border-color: rgba(239,68,68,0.5); background: rgba(239,68,68,0.08); }
  .sp-test-opt-letter { flex-shrink: 0; width: 22px; height: 22px; border-radius: 4px; border: 1px solid var(--adm-sidebar-border); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; }

  .sp-onb-summary { margin-bottom: 12px; }
  .sp-onb-summary__track {
    height: 6px;
    border-radius: 4px;
    overflow: hidden;
    background: var(--adm-sidebar-border);
  }
  .sp-onb-summary__fill {
    height: 100%;
    border-radius: 4px;
    background: var(--bs-success);
  }
  .sp-onb-summary__meta {
    margin-top: 6px;
    font-size: 0.75rem;
    color: var(--adm-muted);
  }
  .sp-onb-timeline {
    display: grid;
    gap: 8px;
  }
  .sp-onb-item {
    display: flex;
    gap: 10px;
    border-radius: 8px;
    padding: 8px 10px;
    background: var(--adm-outer);
  }
  .sp-onb-item__dot {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    border-radius: 50%;
    border: 1px solid var(--adm-sidebar-border);
    color: var(--adm-muted);
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
  }
  .sp-onb-item__dot--passed {
    color: var(--bs-success);
    border-color: rgba(34, 197, 94, 0.4);
    background: rgba(34, 197, 94, 0.08);
  }
  .sp-onb-item__content { min-width: 0; flex: 1; }
  .sp-onb-item__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .sp-onb-item__title {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--adm-text);
  }
  .sp-onb-item__status {
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 10px;
    padding: 2px 8px;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  .sp-onb-item__status--passed { color: var(--bs-success); border-color: rgba(34,197,94,0.35); background: rgba(34,197,94,0.1); }
  .sp-onb-item__status--progress { color: var(--adm-active-color); border-color: rgba(14,165,233,0.35); background: rgba(14,165,233,0.1); }
  .sp-onb-item__status--failed { color: var(--bs-danger); border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.08); }
  .sp-onb-item__status--pending { color: var(--adm-muted); border-color: var(--adm-sidebar-border); background: transparent; }
  .sp-onb-item__sub {
    margin-top: 4px;
    font-size: 0.75rem;
    color: var(--adm-muted);
  }
  .sp-onb-item__comment {
    margin-top: 6px;
    font-size: 0.75rem;
    color: var(--adm-text);
    opacity: 0.78;
    line-height: 1.4;
    word-break: break-word;
  }
`
