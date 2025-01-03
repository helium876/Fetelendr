import { getEvents } from '@/lib/sheets';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    logger.log('API route called');
    const events = await getEvents();
    logger.log('Events fetched from sheets:', events.length);
    logger.log('Sample event:', events[0]);

    return Response.json({ success: true, data: events });
  } catch (error) {
    logger.error('Error in events API:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    });
    return Response.json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
  }
} 