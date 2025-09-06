"use server";

import { answerUserQuestion } from "@/ai/flows/answer-user-question";
import { createSapling } from "@/ai/flows/create-sapling";

export type AIResponse = {
  role: "ai";
  content: string;
  type: "text" | "image";
};

export async function getAiResponse(message: string): Promise<AIResponse> {
  const saplingMatch = message.match(/^\/sapling\s+(.*)/s);

  let response: { content: string; type: "text" | "image" };

  try {
    if (saplingMatch) {
      const topic = saplingMatch[1];
      if (!topic) {
        throw new Error("Please provide a topic for /sapling.");
      }
      const result = await createSapling({ topic });
      response = { content: `**Idea Seed:** ${result.seed}\n\n**Prompt:** ${result.prompt}`, type: "text" };
    } else if (message.startsWith('/imagine')) {
        response = { content: "Sorry, the /imagine feature is temporarily disabled due to a technical issue.", type: "text" };
    }
    else {
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
