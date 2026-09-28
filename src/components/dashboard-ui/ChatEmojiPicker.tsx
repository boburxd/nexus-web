"use client"

import {useEffect, useRef, useState} from "react"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"

const EMOJI_CATEGORIES = [
    {
        label: "Частые",
        icon: "😀",
        emojis: "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😋 😎 🤩 🥳 🥺 😭 😢 😤 😡 🤔 🤗 🤭 🫡 🫠 🙄 😴 🤯 😱 😬 😅 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💯 ✨ 🔥 🎉 ✅ ❌ 👍 👎 🙏 👏 💪 🤝 👌 ✌️ 🤞 👀".split(" "),
    },
    {
        label: "Люди",
        icon: "👋",
        emojis: "👋 🤚 🖐️ ✋ 🖖 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🧠 👀 👁️ 👄 🧑 👩 👨 👶 🧒 👦 👧 🧑‍💻 👩‍💻 👨‍💻 🧑‍🎨 👩‍🎨 👨‍🎨".split(" "),
    },
    {
        label: "Животные",
        icon: "🐻",
        emojis: "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🦄 🐝 🦋 🐌 🐞 🐢 🐍 🦎 🐙 🦑 🦀 🐠 🐟 🐬 🐳 🦈 🐊 🐅 🐆 🦓 🐘 🦒 🦘 🐕 🐈 🐾".split(" "),
    },
    {
        label: "Еда",
        icon: "🍕",
        emojis: "🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥝 🍅 🥑 🥦 🥕 🌽 🌶️ 🥐 🍞 🥨 🧀 🥚 🍳 🥞 🧇 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🥗 🍝 🍜 🍣 🍱 🍚 🍦 🍩 🍪 🎂 🍰 🍫 🍿 ☕ 🍵 🧃 🥤 🍺 🍷 🥂".split(" "),
    },
    {
        label: "Дела",
        icon: "⚽",
        emojis: "⚽ 🏀 🏈 ⚾ 🎾 🏐 🎱 🏓 🥊 🎯 🎮 🎲 🧩 🎨 🎭 🎤 🎧 🎸 🎹 🥁 🎬 📷 📱 💻 ⌨️ 🖥️ 🖨️ 💡 📚 ✏️ 📝 📌 📍 📎 📁 📊 📈 📉 💼 🏆 🥇 🎁 🎈 🎊 🎉 🚀 ✈️ 🚗 🚕 🚲 🏠 🏢 🌍 🌎 🌏".split(" "),
    },
    {
        label: "Символы",
        icon: "❤️",
        emojis: "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❤️‍🔥 ❤️‍🩹 💕 💞 💓 💗 💖 💘 💝 💟 ☮️ ✝️ ☪️ 🕉️ ☯️ ✡️ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ 💯 💢 💥 💫 💦 💨 🕳️ 💬 🗨️ 🗯️ 💭 💤 ✅ ☑️ ✔️ ❌ ❗ ❓ ⚠️ 🚫 🔞 ⬆️ ➡️ ⬇️ ⬅️ 🔄 ➕ ➖ ➗ ♾️ ™️ ©️ ®️".split(" "),
    },
] as const

type ChatEmojiPickerProps = {
    disabled?: boolean
    onSelect: (emoji: string) => void
}

export function ChatEmojiPicker({disabled, onSelect}: ChatEmojiPickerProps) {
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState(0)
    const rootRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const close = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
        }
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false)
        }
        document.addEventListener("mousedown", close)
        document.addEventListener("keydown", closeOnEscape)
        return () => {
            document.removeEventListener("mousedown", close)
            document.removeEventListener("keydown", closeOnEscape)
        }
    }, [open])

    return (
        <div ref={rootRef} style={{position: "relative", flexShrink: 0}}>
            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Добавить эмодзи"
                aria-expanded={open}
                title="Добавить эмодзи"
                disabled={disabled}
                onClick={() => setOpen(value => !value)}
            >
                <Icon name="smile" aria-hidden/>
            </Button>

            {open ? (
                <div
                    role="dialog"
                    aria-label="Выбор эмодзи"
                    style={{
                        position: "absolute",
                        right: 0,
                        bottom: "calc(100% + 8px)",
                        zIndex: 20,
                        width: "min(320px, calc(100vw - 32px))",
                        borderRadius: 10,
                        background: "var(--dash-surface2)",
                        overflow: "hidden",
                    }}
                >
                    <div
                        role="tablist"
                        aria-label="Категории эмодзи"
                        style={{display: "flex", overflowX: "auto", borderBottom: "1px solid var(--dash-border)"}}
                    >
                        {EMOJI_CATEGORIES.map((item, index) => (
                            <Button
                                key={item.label}
                                type="button"
                                variant={category === index ? "secondary" : "ghost"}
                                size="sm"
                                className="min-w-[42px] flex-[1_0_42px]"
                                role="tab"
                                aria-selected={category === index}
                                aria-label={item.label}
                                title={item.label}
                                onClick={() => setCategory(index)}
                            >
                                <span style={{fontSize: "1rem", lineHeight: 1}}>{item.icon}</span>
                            </Button>
                        ))}
                    </div>
                    <div
                        role="tabpanel"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))",
                            gap: 2,
                            maxHeight: 184,
                            overflowY: "auto",
                            padding: 8,
                            scrollbarWidth: "thin",
                        }}
                    >
                        {EMOJI_CATEGORIES[category].emojis.map((emoji, index) => (
                            <Button
                                key={`${emoji}-${index}`}
                                type="button"
                                variant="ghost"
                                size="icon-lg"
                                className="w-full"
                                aria-label={`Добавить ${emoji}`}
                                onClick={() => onSelect(emoji)}
                            >
                                <span style={{fontSize: "1.125rem", lineHeight: 1}}>{emoji}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    )
}
