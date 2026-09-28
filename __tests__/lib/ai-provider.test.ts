jest.mock("@/lib/gemini-ai", () => ({
    geminiEditImage: jest.fn(),
    geminiGenerate: jest.fn(),
    isGeminiConfigured: jest.fn(),
}))

import {aiAsk, aiChat, aiEditImage, aiSupportsImageEditing, getAiProvider, isAiConfigured} from "@/lib/ai-provider"
import {geminiEditImage, geminiGenerate, isGeminiConfigured} from "@/lib/gemini-ai"

const mockedGeminiGenerate = jest.mocked(geminiGenerate)
const mockedGeminiEditImage = jest.mocked(geminiEditImage)
const mockedGeminiConfigured = jest.mocked(isGeminiConfigured)

describe("AI provider", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("always reports the gemini provider", () => {
        expect(getAiProvider()).toBe("gemini")
    })

    it("delegates chat/ask to Gemini and reports its configuration state", async () => {
        mockedGeminiConfigured.mockReturnValue(true)
        mockedGeminiGenerate.mockResolvedValue("gemini reply")

        await expect(aiAsk("system", "question", 100)).resolves.toBe("gemini reply")
        expect(isAiConfigured()).toBe(true)
        expect(mockedGeminiGenerate).toHaveBeenCalledWith("system", "User: question", 100)
    })

    it("joins multi-turn messages into a single prompt for Gemini", async () => {
        mockedGeminiGenerate.mockResolvedValue("ok")
        const messages = [
            {role: "system" as const, content: "sys"},
            {role: "user" as const, content: "hi"},
            {role: "assistant" as const, content: "hello"},
        ]

        await aiChat(messages, 200)

        expect(mockedGeminiGenerate).toHaveBeenCalledWith("sys", "User: hi\n\nAssistant: hello", 200)
    })

    it("always supports editing the source image", () => {
        expect(aiSupportsImageEditing()).toBe(true)
    })

    it("routes image edits to Gemini", async () => {
        const image = {data: "abc", mimeType: "image/png"}
        mockedGeminiEditImage.mockResolvedValue({dataUrl: "data:image/png;base64,abc", mimeType: "image/png"})

        await expect(aiEditImage("portrait", image)).resolves.toEqual({
            dataUrl: "data:image/png;base64,abc",
            mimeType: "image/png",
        })
        expect(mockedGeminiEditImage).toHaveBeenCalledWith("portrait", image)
    })
})
