
'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user questions using internal tools for knowledge retrieval and web browsing.
 *
 * - answerUserQuestion - A function that accepts a question string and returns an answer string.
 * - AnswerUserQuestionInput - The input type for the answerUserQuestion function.
 * - AnswerUserQuestionOutput - The return type for the answerUserQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerUserQuestionInputSchema = z.object({
  question: z.string().describe('The question asked by the user.'),
  mediaDataUri: z.string().optional().describe(
    "An optional image or audio file attached by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type AnswerUserQuestionInput = z.infer<typeof AnswerUserQuestionInputSchema>;

const AnswerUserQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});
export type AnswerUserQuestionOutput = z.infer<typeof AnswerUserQuestionOutputSchema>;

export async function answerUserQuestion(input: AnswerUserQuestionInput): Promise<AnswerUserQuestionOutput> {
  return answerUserQuestionFlow(input);
}

const webBrowserTool = ai.defineTool(
  {
    name: 'webBrowser',
    description: 'A tool that can browse the web to answer user questions. This tool is expensive and should only be used when you cannot answer the question with your existing knowledge.',
    inputSchema: z.object({
      query: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    console.log(`WebBrowserTool: Searching for "${input.query}"`);
    const searchResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `Please search for the following query and provide a concise answer: ${input.query}`,
    });
    return searchResponse.text;
  }
);

const answerUserQuestionPrompt = ai.definePrompt({
  name: 'answerUserQuestionPrompt',
  input: {schema: AnswerUserQuestionInputSchema},
  output: {schema: AnswerUserQuestionOutputSchema},
  tools: [webBrowserTool],
  prompt: `You are an intelligent chatbot that answers user questions.

If the user provides an audio file, your primary task is to transcribe it. If there's a question in the audio, answer it. If not, just provide the transcription.
If you don't know the answer to a question, use the 'webBrowser' tool to search the web for information.
When using the webBrowserTool, provide a concise and helpful answer based on the search results.

{{#if mediaDataUri}}
The user has provided an image or audio. Use it as the primary context for your answer.
Media: {{media url=mediaDataUri}}
{{/if}}

Question: {{{question}}}

Answer:`,
});

const answerUserQuestionFlow = ai.defineFlow(
  {
    name: 'answerUserQuestionFlow',
    inputSchema: AnswerUserQuestionInputSchema,
    outputSchema: AnswerUserQuestionOutputSchema,
  },
  async input => {
    const {output} = await answerUserQuestionPrompt(input);
    return output!;
  }
);
