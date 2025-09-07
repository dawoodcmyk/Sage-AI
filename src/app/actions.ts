"use server";

import { answerUserQuestion } from "@/ai/flows/answer-user-question";
import { generateImage } from "@/ai/flows/generate-image";
import { correctText } from "@/ai/flows/correct-text";

export type AIResponse = {
  role: "ai";
  content: string;
  type: "text" | "image";
};

export async function getAiResponse(message: string, imageDataUri?: string): Promise<AIResponse> {
  const imagineMatch = message.match(/^\/imagine\s+(.*)/s);

  let response: { content: string; type: "text" | "image" };

  try {
    const correctionResult = await correctText({ text: message });
    const correctedMessage = correctionResult.correctedText;

    if (imagineMatch) {
        const prompt = imagineMatch[1];
        if (!prompt) {
          throw new Error("Please provide a prompt for /imagine.");
        }
        const correctionResultForImagine = await correctText({ text: prompt });
        const correctedPrompt = correctionResultForImagine.correctedText;
        const result = await generateImage({ prompt: correctedPrompt });
        response = { content: result.imageDataUri, type: "image" };
    }
    else {
      const result = await answerUserQuestion({ question: correctedMessage, imageDataUri });
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
