"use client"

export function LandingUploaderStyles() {
    return (
        <style>{`
      .landing-up { font-size: 14px; }
      .landing-up-banner {
        padding: 10px 14px;
        border-radius: 10px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
      }
      .landing-up-error {
        padding: 8px 12px;
        border-radius: 8px;
        margin-bottom: 10px;
        font-size: 0.75rem;
      }
      .landing-up-grid-2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-bottom: 10px;
      }
      .landing-up-row { margin-bottom: 10px; }
      .landing-up-card {
        padding: 14px;
        border-radius: 14px;
        background: var(--dash-surface2, var(--muted));
      }
      .landing-up-card__head { margin-bottom: 10px; }
      .landing-up-card__title-row { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
      .landing-up-card__title-icon { color: var(--dash-accent, var(--primary)); font-size: 1rem; }
      .landing-up-card__title { font-size: 0.875rem; font-weight: 600; margin: 0; }
      .landing-up-card__sub { font-size: 0.75rem; color: var(--dash-muted, var(--muted-foreground)); margin: 0; }
      .landing-up-media-row { display: flex; gap: 10px; align-items: flex-end; }
      .landing-up-media-preview {
        width: 92px; height: 136px; border-radius: 10px; overflow: hidden; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
      }
      .landing-up-btn { font-size: 0.75rem; }
      .landing-up-row-line {
        display: grid;
        grid-template-columns: 92px 1fr;
        gap: 10px;
        align-items: start;
      }
      .landing-up-upload-tile {
        width: 92px;
        height: 126px;
        border-radius: 10px;
        border: 2px dashed var(--dash-accent-border, var(--border));
        color: var(--dash-accent, var(--primary));
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        cursor: pointer;
        font-size: 0.75rem;
      }
      .landing-up-upload-tile i { font-size: 1.125rem; }
      /* ── Положение кадра: рамка-вьюпорт (16:9), фото внутри перетаскивается ── */
      .landing-up-pos {
        margin-top: 10px;
        padding: 10px;
        border-radius: 10px;
        background: var(--dash-surface3, var(--muted));
      }
      .landing-up-pos__head { display: flex; align-items: flex-start; gap: 6px; margin-bottom: 8px; }
      .landing-up-pos__head-icon { color: var(--dash-accent, var(--primary)); font-size: 1rem; margin-top: 2px; }
      .landing-up-pos__title { font-size: 0.75rem; font-weight: 600; margin: 0; }
      .landing-up-pos__sub {
        font-size: 0.75rem; line-height: 1.4; margin: 2px 0 0;
        color: var(--dash-muted, var(--muted-foreground));
      }

      /* Рамка = вьюпорт браузера на главной (16:9). Фото внутри — 120% размера рамки
         (background-size), поэтому по каждой оси есть запас, чтобы перетаскивать кадр. */
      .landing-up-pos__preview {
        display: flex; align-items: center; justify-content: center;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        background-color: var(--dash-surface2, var(--muted));
        background-repeat: no-repeat;
        color: var(--dash-muted, var(--muted-foreground)); font-size: 1.5rem;
        cursor: grab;
        touch-action: none;
        user-select: none;
      }
      .landing-up-pos__preview.is-dragging { cursor: grabbing; }

      .landing-up-thumb-strip {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
        gap: 8px;
      }
      .landing-up-carousel { min-height: 126px; }
      .landing-up-carousel__viewport {
        height: 126px;
        padding: 0 16px 0;
        align-items: stretch;
      }
      .landing-up-carousel__item {
        flex: 0 0 92px;
        scroll-snap-align: start;
      }
      .landing-up-thumb {
        width: 92px;
        height: 126px;
        border: 1px solid var(--dash-border, var(--border));
        border-radius: 8px;
        overflow: hidden;
        padding: 0;
        position: relative;
        cursor: pointer;
      }
      .landing-up-thumb.is-selected { border-color: var(--dash-accent, var(--primary)); }
      .landing-up-thumb-actions {
        position: absolute;
        right: 4px;
        top: 4px;
      }
      .landing-up-select-btn {
        background: rgba(12, 14, 22, 0.6);
        border-radius: 50%;
        width: 22px;
        height: 22px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--dash-text, var(--foreground));
        cursor: pointer;
      }
      .landing-up-tick.is-selected { color: var(--dash-success, var(--success)); }
      @media (max-width: 960px) {
        .landing-up-grid-2 { grid-template-columns: 1fr; }
        .landing-up-row-line { grid-template-columns: 1fr; }
        .landing-up-upload-tile { width: 100%; height: 70px; }
        .landing-up-carousel__viewport { height: 92px; }
        .landing-up-carousel__item,
        .landing-up-thumb { width: 92px; height: 92px; }
      }
    `}</style>
    )
}
