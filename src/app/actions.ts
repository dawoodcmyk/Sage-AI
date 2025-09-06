"use server";

import { answerUserQuestion } from "@/ai/flows/answer-user-question";
import { generateImageFromPrompt } from "@/ai/flows/generate-image-from-prompt";

export type AIResponse = {
  role: "ai";
  content: string;
  type: "text" | "image";
};

export async function getAiResponse(message: string): Promise<AIResponse> {
  const imagineMatch = message.match(/^\/imagine\s+(.*)/);

  let response: { content: string; type: "text" | "image" };

  try {
    if (imagineMatch) {
      const prompt = imagineMatch[1];
      if (!prompt) {
        throw new Error("Please provide a prompt for /imagine.");
      }
      const result = await generateImageFromPrompt({ prompt });
      response = { content: result.imageUrl, type: "image" };
    } else {
      const result = await answerUserQuestion({ question: message });
      response = { content: result.answer, type: "text" };
    }
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    response = { content: `Error: ${errorMessage}`, type: "text" };
  }

  return {
    role: "ai",
    ...response,
  };
}
