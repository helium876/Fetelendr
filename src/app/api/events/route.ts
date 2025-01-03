import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/sheets';

export async function GET() {
  try {
    console.log('API route called');
    const events = await getEvents();
    console.log('Events fetched from sheets:', events.length);
    console.log('Sample event:', events[0]);
    
    const response = NextResponse.json({ success: true, data: events });
    
    // Remove server information
    response.headers.delete('x-powered-by');
    response.headers.set('server', 'Server');
    
    return response;
  } catch (error) {
    console.error('Error in events API:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
    
    // Apply same headers to error responses
    errorResponse.headers.delete('x-powered-by');
    errorResponse.headers.set('server', 'Server');
    
    return errorResponse;
  }
} 