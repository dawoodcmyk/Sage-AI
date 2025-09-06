"use server";

import { answerUserQuestion } from "@/ai/flows/answer-user-question";
import { generateImage } from "@/ai/flows/generate-image";
import { createWord } from "@/ai/flows/create-word";

export type AIResponse = {
  role: "ai";
  content: string;
  type: "text" | "image";
};

export async function getAiResponse(message: string): Promise<AIResponse> {
  const imagineMatch = message.match(/^\/imagine\s+(.*)/s);
  const wordMatch = message.match(/^\/word\s+(.*)/s);

  let response: { content: string; type: "text" | "image" };

  try {
    if (imagineMatch) {
        const prompt = imagineMatch[1];
        if (!prompt) {
          throw new Error("Please provide a prompt for /imagine.");
        }
        const result = await generateImage({ prompt });
        response = { content: result.imageDataUri, type: "image" };
    } else if (wordMatch) {
      const concept = wordMatch[1];
      if (!concept) {
        throw new Error("Please provide a concept for /word.");
      }
      const result = await createWord({ concept });
      response = { 
        content: `**${result.word}**: ${result.definition}\n\n*Example: "${result.example}"*`,
        type: "text" 
      };
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
