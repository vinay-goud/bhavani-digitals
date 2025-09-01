'use client';

/**
 * @fileOverview This file defines a simplified version for static builds.
 */

import { z } from 'genkit';

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

// Temporary mock function for static build
export async function generatePhotographyStyleGuide(input: GeneratePhotographyStyleGuideInput): Promise<GeneratePhotographyStyleGuideOutput> {
  return {
    styleGuide: `Photography Style Guide for ${input.shootType}\n\n` +
      'Sample guide with best practices and trends.\n' +
      'Please enable JavaScript to access the full AI-powered style guide generator.'
  };
}
