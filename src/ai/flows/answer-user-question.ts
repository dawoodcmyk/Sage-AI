'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user questions using an internal tool for knowledge retrieval and reasoning.
 *
 * - answerUserQuestion - A function that accepts a question string and returns an answer string.
 * - AnswerUserQuestionInput - The input type for the answerUserQuestion function.
 * - AnswerUserQuestionOutput - The return type for the answerUserQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerUserQuestionInputSchema = z.object({
  question: z.string().describe('The question asked by the user.'),
});
export type AnswerUserQuestionInput = z.infer<typeof AnswerUserQuestionInputSchema>;

const AnswerUserQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});
export type AnswerUserQuestionOutput = z.infer<typeof AnswerUserQuestionOutputSchema>;

export async function answerUserQuestion(input: AnswerUserQuestionInput): Promise<AnswerUserQuestionOutput> {
  return answerUserQuestionFlow(input);
}

const knowledgeRetrievalTool = ai.defineTool({
  name: 'knowledgeRetrieval',
  description: 'Retrieves information from internal knowledge sources to answer user questions comprehensively.',
  inputSchema: z.object({
    query: z.string().describe('The search query to retrieve relevant information.'),
  }),
  outputSchema: z.string().describe('The retrieved information from the knowledge sources.'),
}, async (input) => {
  // Placeholder implementation for knowledge retrieval. Replace with actual implementation.
  // This could involve querying a database, calling an internal API, etc.
  // For now, just return a canned response.
  return `Retrieved information: This is a canned response for the query: ${input.query}.  A real implementation would fetch data.`;
});

const answerUserQuestionPrompt = ai.definePrompt({
  name: 'answerUserQuestionPrompt',
  input: {schema: AnswerUserQuestionInputSchema},
  output: {schema: AnswerUserQuestionOutputSchema},
  tools: [knowledgeRetrievalTool],
  prompt: `You are an intelligent chatbot that answers user questions using information retrieved from internal knowledge sources.

  Use the 'knowledgeRetrieval' tool to get relevant information to answer the question comprehensively.  Reason about the retrieved information to formulate a well-structured and informative answer.

  Question: {{{question}}}

  Answer:`, // Ensure that the prompt ends with "Answer:"
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
