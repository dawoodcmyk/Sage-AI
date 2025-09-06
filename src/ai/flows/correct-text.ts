'use server';

/**
 * @fileOverview A Genkit flow for correcting spelling and grammar in a given text.
 *
 * - correctText - A function that takes a string and returns a corrected version.
 * - CorrectTextInput - The input type for the correctText function.
 * - CorrectTextOutput - The return type for the correctText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectTextInputSchema = z.object({
  text: z.string().describe('The text to be corrected.'),
});
export type CorrectTextInput = z.infer<typeof CorrectTextInputSchema>;

const CorrectTextOutputSchema = z.object({
    correctedText: z.string().describe('The corrected text.'),
});
export type CorrectTextOutput = z.infer<typeof CorrectTextOutputSchema>;

export async function correctText(input: CorrectTextInput): Promise<CorrectTextOutput> {
  return correctTextFlow(input);
}

const correctTextPrompt = ai.definePrompt({
  name: 'correctTextPrompt',
  input: {schema: CorrectTextInputSchema},
  output: {schema: CorrectTextOutputSchema},
  prompt: `Correct any spelling and grammatical mistakes in the following text. Only output the corrected text. If no correction is needed, output the original text.

Text: {{{text}}}`,
});

const correctTextFlow = ai.defineFlow(
  {
    name: 'correctTextFlow',
    inputSchema: CorrectTextInputSchema,
    outputSchema: CorrectTextOutputSchema,
  },
  async (input) => {
    const {output} = await correctTextPrompt(input);
    return output!;
  }
);
