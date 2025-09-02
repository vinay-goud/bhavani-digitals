import { getEventData } from '@/services/dataService';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const event = await getEventData(params.eventId);
    
    if (!event) {
      return new NextResponse(null, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return new NextResponse(null, { status: 500 });
  }
}
