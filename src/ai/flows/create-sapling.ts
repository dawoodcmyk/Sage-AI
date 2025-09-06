'use server';

/**
 * @fileOverview A Genkit flow for creating a "sapling" - a seed of an idea and a creative prompt.
 *
 * - createSapling - A function that takes a topic and returns an idea seed and a prompt.
 * - CreateSaplingInput - The input type for the createSapling function.
 * - CreateSaplingOutput - The return type for the createSapling function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateSaplingInputSchema = z.object({
  topic: z.string().describe('The topic for which to create a sapling.'),
});
export type CreateSaplingInput = z.infer<typeof CreateSaplingInputSchema>;

const CreateSaplingOutputSchema = z.object({
  seed: z.string().describe('A short, insightful "seed of an idea" about the topic.'),
  prompt: z.string().describe('A creative prompt to help the user expand on the idea.'),
});
export type CreateSaplingOutput = z.infer<typeof CreateSaplingOutputSchema>;

export async function createSapling(input: CreateSaplingInput): Promise<CreateSaplingOutput> {
  return createSaplingFlow(input);
}

const createSaplingPrompt = ai.definePrompt({
  name: 'createSaplingPrompt',
  input: {schema: CreateSaplingInputSchema},
  output: {schema: CreateSaplingOutputSchema},
  prompt: `You are a creative assistant named Sage. Your goal is to help users brainstorm and develop new ideas.

  A user has provided the following topic: {{{topic}}}

  Generate a "sapling" for this topic. A sapling consists of two parts:
  1.  **Seed**: A short, insightful, and thought-provoking "seed of an idea" related to the topic. This should be a single sentence or a short phrase.
  2.  **Prompt**: A creative and open-ended question or prompt that encourages the user to expand on the "seed."

  Your response should be structured according to the output schema.`,
});

const createSaplingFlow = ai.defineFlow(
  {
    name: 'createSaplingFlow',
    inputSchema: CreateSaplingInputSchema,
    outputSchema: CreateSaplingOutputSchema,
  },
  async (input) => {
    const {output} = await createSaplingPrompt(input);
    return output!;
  }
);
