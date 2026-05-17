import { inngest } from "@/inngest/client";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { openrouter } from "@openrouter/ai-sdk-provider";


export const processTask = inngest.createFunction(
    {
        id: "execute-ai",
        triggers: { event: "exec/ai" },
        retries: 0,
    },
    async ({ event, step }) => {

        await step.sleep("wait-5-seconds", 5000)

        // const google_step = await step.ai.wrap(
        //     "gemini-generate-text",
        //     generateText,
        //     {
        //         model: google("gemma-4-26b-a4b-it"),
        //         system: "You are a helpful assistant.",
        //         prompt: "What is 2 + 2?",
        //         experimental_telemetry:{
        //             isEnabled: true,
        //             recordInputs: true,
        //             recordOutputs: true,
        //         }

        //     }
        // )

        const openrouter_step = await step.ai.wrap(
            "openrouter-generate-text",
            generateText,
            {
                model: openrouter.chat('liquid/lfm-2.5-1.2b-instruct:free'),
                
                prompt: "What is 2 + 2?",
                maxRetries: 0,
                experimental_telemetry:{
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                }
            })

        const anthropic_step = await step.ai.wrap(
            "anthropic-generate-text",
            generateText,
            {
                model: anthropic("claude-sonnet-4.5"),
                system: "You are a helpful assistant.",
                prompt: "What is 2 + 2?",
                maxRetries: 0
            }
        )

        const openai_step = await step.ai.wrap(
            "openai-generate-text",
            generateText,
            {
                model: openai("gpt-4o"),
                system: "You are a helpful assistant.",
                prompt: "What is 2 + 2?",
                maxRetries: 0,
            },
        )

        return {
            //google_step,
            openrouter_step,
            anthropic_step,
            openai_step,
        };
    }
);