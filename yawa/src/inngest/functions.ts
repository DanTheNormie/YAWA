import { inngest } from "@/inngest/client";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";


export const processTask = inngest.createFunction(
    {
        id: "execute-ai",
        triggers: { event: "exec/ai" }
    },
    async ({ event, step }) => {

        await step.sleep("wait-5-seconds", 5000)

        const { steps: google_steps } = await step.ai.wrap(
            "gemini-generate-text",
            generateText,
            {
                model: google("gemma-4-26b-a4b-it"),
                system: "You are a helpful assistant.",
                prompt: "What is 2 + 2?",
                experimental_telemetry:{
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                }

            }
        )

        const openrouter_steps = await step.run("openrouter-generate-text", async () => {
            const apiKey = process.env.OPENROUTER_API_KEY
            console.log("API KEY", apiKey)
            const openrouter = createOpenRouter({
                apiKey
            })
            const { text } = await generateText({
                model: openrouter('nvidia/nemotron-3-super-120b-a12b:free'),
                system: "You are a helpful assistant.",
                prompt: "What is 2 + 2?",
                maxRetries: 0
            })
            return text
        })

        const { steps: anthropic_steps } = await step.ai.wrap(
            "anthropic-generate-text",
            generateText,
            {
                model: anthropic("claude-sonnet-4.5"),
                system: "You are a helpful assistant.",
                prompt: "What is 2 + 2?",
                maxRetries: 0
            }
        )

        const { steps: openai_steps } = await step.ai.wrap(
            "openai-generate-text",
            generateText,
            {
                model: openai("gpt-4o"),
                system: "You are a helpful assistant.",
                prompt: "What is 2 + 2?",
                maxRetries: 0
            }
        )

        return {
            google_steps,
            anthropic_steps,
            openai_steps,
        };
    }
);