'use server';

/**
 * @fileOverview A Genkit flow for creating a new word based on a concept.
 *
 * - createWord - A function that takes a concept and returns a new word, its definition, and an example sentence.
 * - CreateWordInput - The input type for the createWord function.
 * - CreateWordOutput - The return type for the createWord function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateWordInputSchema = z.object({
  concept: z.string().describe('The concept or feeling to create a word for.'),
});
export type CreateWordInput = z.infer<typeof CreateWordInputSchema>;

const CreateWordOutputSchema = z.object({
  word: z.string().describe('The newly created word.'),
  definition: z.string().describe('The definition of the new word.'),
  example: z.string().describe('An example sentence using the new word.'),
});
export type CreateWordOutput = z.infer<typeof CreateWordOutputSchema>;

export async function createWord(input: CreateWordInput): Promise<CreateWordOutput> {
  return createWordFlow(input);
}

const createWordPrompt = ai.definePrompt({
  name: 'createWordPrompt',
  input: {schema: CreateWordInputSchema},
  output: {schema: CreateWordOutputSchema},
  prompt: `You are a creative linguist. Your task is to invent a new word for a given concept.

  The concept is: {{{concept}}}

  Based on this concept, create a new, unique word. Provide its definition and an example sentence. The word should sound plausible and be easy to pronounce.`,
});

const createWordFlow = ai.defineFlow(
  {
    name: 'createWordFlow',
    inputSchema: CreateWordInputSchema,
    outputSchema: CreateWordOutputSchema,
  },
  async input => {
    const {output} = await createWordPrompt(input);
    return output!;
  }
);
