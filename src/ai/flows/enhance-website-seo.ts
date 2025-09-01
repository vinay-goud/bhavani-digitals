'use client';

// The AI analyzes website content and suggests keywords for SEO optimization.

export interface SEOEnhancementInput {
  websiteContent: string;
}

export interface SEOEnhancementOutput {
  keywords: string;
  guidance: string;
}

// Temporary mock function for static build
export async function enhanceWebsiteSEO(input: SEOEnhancementInput): Promise<SEOEnhancementOutput> {
  // Return mock data for static build
  return {
    keywords: 'wedding photography, professional photographer, wedding photos, photo sessions',
    guidance: 'Include these keywords naturally in your website content.'
  };
}
