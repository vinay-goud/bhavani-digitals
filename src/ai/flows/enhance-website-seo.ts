// The AI analyzes website content and suggests keywords for SEO optimization.

import { ai } from '@/ai/genkit';
import {z} from 'genkit';

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

export async function enhanceWebsiteSEO(input: SEOEnhancementInput): Promise<SEOEnhancementOutput> {
  return enhanceWebsiteSEOFlow(input);
}

const seoEnhancementPrompt = ai.definePrompt({
  name: 'seoEnhancementPrompt',
  input: {schema: SEOEnhancementInputSchema},
  output: {schema: SEOEnhancementOutputSchema},
  prompt: `Analyze the following website content and suggest relevant keywords for SEO optimization, focusing on wedding photography-related terms. Provide guidance on incorporating these keywords naturally within the content.

Website Content: {{{websiteContent}}}

Keywords:`,
});

const enhanceWebsiteSEOFlow = ai.defineFlow(
  {
    name: 'enhanceWebsiteSEOFlow',
    inputSchema: SEOEnhancementInputSchema,
    outputSchema: SEOEnhancementOutputSchema,
  },
  async input => {
    const {output} = await seoEnhancementPrompt(input);
    return output!;
  }
);
