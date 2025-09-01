'use client';

// The AI analyzes website content and suggests keywords for SEO optimization.
import { z } from 'genkit';

const SEOEnhancementInputSchema = z.object({
  websiteContent: z
    .string()
    .describe('The text content of the website to be analyzed.'),
});

export type SEOEnhancementInput = z.infer<typeof SEOEnhancementInputSchema>;

const SEOEnhancementOutputSchema = z.object({
  keywords: z
    .string()
    .describe(
      'A comma-separated list of keywords relevant to the website content for SEO optimization.'
    ),
  guidance:
    z.string().describe('Guidance on incorporating keywords naturally.'),
});

export type SEOEnhancementOutput = z.infer<typeof SEOEnhancementOutputSchema>;

// Temporary mock function for static build
export async function enhanceWebsiteSEO(input: SEOEnhancementInput): Promise<SEOEnhancementOutput> {
  // Return mock data for static build
  return {
    keywords: 'wedding photography, professional photographer, wedding photos, photo sessions',
    guidance: 'Include these keywords naturally in your website content.'
  };
}
