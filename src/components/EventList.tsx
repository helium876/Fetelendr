'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Event } from '@/types/event';
import EventModal from './EventModal';

interface EventListProps {
  events: Event[];
}

export default function EventList({ events }: EventListProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-4">
        {sortedEvents.map((event) => (
          <div
            key={event.id}
            className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 p-6 cursor-pointer hover:scale-[1.02] border border-purple-500/20"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                <p className="text-white font-medium">
                  {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-white mt-1 text-lg">{event.venue}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                {event.type.map((type, index) => (
                  <span
                    key={index}
                    className="inline-block px-4 py-1.5 rounded-full text-base font-medium bg-white/10 text-white border border-white/30"
                  >
                    {type}
                  </span>
                ))}
                {event.ticketPrice !== 'TBA' && (
                  <p className="text-base text-white font-medium">{event.ticketPrice}</p>
                )}
              </div>
            </div>
            {event.description !== 'TBA' && (
              <p className="mt-3 text-base text-white/90">
                {event.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
} 