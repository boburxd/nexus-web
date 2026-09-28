import type {CSSProperties} from "react"

/** Попап комментария в модалке превью не должен уходить под слои и оставаться кликабельным. */
export const markupPopupZIndexCss = `
.stage-image-markup-root .a9s-popup.a9s-image-popup {
  z-index: var(--z-studio);
}
@keyframes markup-loading-pulse {
  0%, 100% { opacity: 0.82; }
  50% { opacity: 1; }
}
`

/** Подсказки под разметкой / при загрузке — привязка к теме страницы. */
export const markupHintColor = "var(--dash-text2, var(--muted-foreground, #64748b))"

/**
 * Стили только внутри всплывающего окна комментария (портал Annotorious):
 * светлая карточка с темным текстом — одинаково читается на белом и темном фоне страницы.
 */
export const commentPopupRoot: CSSProperties = {
    padding: 10,
    minWidth: 220,
    maxWidth: 320,
    borderRadius: 8,
    background: "var(--dash-surface2, var(--popover))",
    color: "var(--dash-text, rgba(255,255,255,0.92))",
    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.28)",
}

/** Инструкция: те же контрастные цвета, что у всплывающего комментария — читается на любом фоне страницы. */
export const instructionCard: CSSProperties = {
    marginBottom: 12,
    padding: "10px 12px",
    borderRadius: 8,
    background: "var(--dash-surface2, var(--popover))",
    color: "var(--dash-text, rgba(255,255,255,0.92))",
    fontSize: "0.75rem",
    lineHeight: 1.55,
}

