/**
 * Причина отказа генерации изображения — чтобы роут отдал внятное сообщение, а не «AI недоступен».
 */
export type AiImageErrorCode = "NOT_CONFIGURED" | "QUOTA" | "SAFETY" | "EMPTY" | "FAILED"

export class AiImageError extends Error {
    constructor(public readonly code: AiImageErrorCode, message: string) {
        super(message)
        this.name = "AiImageError"
    }
}
