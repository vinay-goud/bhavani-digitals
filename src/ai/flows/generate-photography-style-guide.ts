'use client';

/**
 * @fileOverview This file defines a simplified version for static builds.
 */

export interface GeneratePhotographyStyleGuideInput {
  shootType: string;
  brandGuidelines?: string;
  desiredVisuals: string;
  trendInspirations?: string;
}

export interface GeneratePhotographyStyleGuideOutput {
  styleGuide: string;
}

// Temporary mock function for static build
export async function generatePhotographyStyleGuide(input: GeneratePhotographyStyleGuideInput): Promise<GeneratePhotographyStyleGuideOutput> {
  return {
    styleGuide: `Photography Style Guide for ${input.shootType}\n\n` +
      'Sample guide with best practices and trends.\n' +
      'Please enable JavaScript to access the full AI-powered style guide generator.'
  };
}
