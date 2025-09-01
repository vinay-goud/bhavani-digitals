/**
 * @fileOverview This file defines a Genkit flow for generating photography style guides.
 *
 * It includes the following:
 * - generatePhotographyStyleGuide - A function that triggers the photography style guide generation flow.
 * - GeneratePhotographyStyleGuideInput - The input type for the generatePhotographyStyleGuide function.
 * - GeneratePhotographyStyleGuideOutput - The output type for the generatePhotographyStyleGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePhotographyStyleGuideInputSchema = z.object({
  shootType: z.string().describe('The type of photoshoot (e.g., wedding, portrait, fashion).'),
  brandGuidelines: z.string().optional().describe('Specific brand guidelines to incorporate.'),
  desiredVisuals: z.string().describe('Description of the desired visual style and mood.'),
  trendInspirations: z.string().optional().describe('Inspiration from current photography trends.'),
});
export type GeneratePhotographyStyleGuideInput = z.infer<typeof GeneratePhotographyStyleGuideInputSchema>;

const GeneratePhotographyStyleGuideOutputSchema = z.object({
  styleGuide: z.string().describe('A detailed photography style guide incorporating best practices, trends, and brand guidelines.'),
});
export type GeneratePhotographyStyleGuideOutput = z.infer<typeof GeneratePhotographyStyleGuideOutputSchema>;

export async function generatePhotographyStyleGuide(input: GeneratePhotographyStyleGuideInput): Promise<GeneratePhotographyStyleGuideOutput> {
  return generatePhotographyStyleGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePhotographyStyleGuidePrompt',
  input: {schema: GeneratePhotographyStyleGuideInputSchema},
  output: {schema: GeneratePhotographyStyleGuideOutputSchema},
  prompt: `You are an expert photography style guide generator. Based on the input, create a comprehensive style guide that incorporates current trends, best practices, and any brand guidelines provided.

Shoot Type: {{{shootType}}}
Brand Guidelines: {{{brandGuidelines}}}
Desired Visuals: {{{desiredVisuals}}}
Trend Inspirations: {{{trendInspirations}}}

Generate a detailed style guide covering aspects such as:
- Overall theme and mood
- Color palette suggestions
- Recommended wardrobe and styling
- Posing and composition guidelines
- Lighting techniques
- Post-processing suggestions
- Logo incorporation guidelines (if brand guidelines are provided)
- Suggestions for diversity and creative changes to improve harmony.
`,
});

const generatePhotographyStyleGuideFlow = ai.defineFlow(
  {
    name: 'generatePhotographyStyleGuideFlow',
    inputSchema: GeneratePhotographyStyleGuideInputSchema,
    outputSchema: GeneratePhotographyStyleGuideOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
