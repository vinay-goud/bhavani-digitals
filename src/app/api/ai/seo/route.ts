import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { websiteContent } = body;

    // Mock response for static export
    const mockResponse = {
      keywords: 'wedding photography, professional photographer, wedding photos, photo sessions, cinematic films, pre-wedding shoots',
      guidance: 'Include these keywords naturally in your website content, especially in headers and meta descriptions.'
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
