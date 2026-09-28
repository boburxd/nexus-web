"use client"

import type {PointerEvent} from "react"
import {Button} from "@/components/ui/button"

interface SheetHandleProps {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => void
    onPointerMove: (e: PointerEvent<HTMLButtonElement>) => void
    onPointerUp: (e: PointerEvent<HTMLButtonElement>) => void
    onPointerCancel: (e: PointerEvent<HTMLButtonElement>) => void
}

export function SheetHandle({onPointerDown, onPointerMove, onPointerUp, onPointerCancel}: SheetHandleProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Потянуть панель профиля"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            className="w-full cursor-grab touch-none"
        >
      <span
          style={{
              display: "block",
              width: 44,
              height: 5,
              borderRadius: 4,
              background: "rgba(255,255,255,0.35)",
              margin: "0 auto",
          }}
      />
        </Button>
    )
}
