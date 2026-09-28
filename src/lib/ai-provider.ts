import {geminiEditImage, geminiGenerate, geminiGenerateImage, isGeminiConfigured} from "@/lib/gemini-ai"

export {AiImageError} from "@/lib/ai-image-error"

export type AiMessage = { role: "system" | "user" | "assistant"; content: string }

/** Единственный провайдер — Gemini. Значение оставлено в ответах роутов для отладки. */
export function getAiProvider(): "gemini" {
    return "gemini"
}

export function isAiConfigured(): boolean {
    return isGeminiConfigured()
}

export async function aiChat(messages: AiMessage[], maxTokens = 1024): Promise<string> {
    const system = messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n")
    const conversation = messages
        .filter((message) => message.role !== "system")
        .map((message) => `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`)
        .join("\n\n")
    return geminiGenerate(system, conversation, maxTokens)
}

export async function aiAsk(system: string, userPrompt: string, maxTokens = 1024): Promise<string> {
    return aiChat([{role: "system", content: system}, {role: "user", content: userPrompt}], maxTokens)
}

/** Gemini редактирует именно исходное фото. */
export function aiSupportsImageEditing(): boolean {
    return true
}

/** Редактирование изображения по текстовому запросу. */
export async function aiEditImage(prompt: string, image: { data: string; mimeType: string }) {
    return geminiEditImage(prompt, image)
}

/** Генерация изображения с нуля, без исходного фото (например, интерьер по описанию из брифа). */
export async function aiGenerateImage(prompt: string) {
    return geminiGenerateImage(prompt)
}

export function stripJsonFences(raw: string): string {
    return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
}
