'use client';

import { useState, useCallback } from 'react';
import { Event } from '@/types/event';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import EventModal from './EventModal';

interface FeaturedEventsProps {
  events: Event[];
  priority?: boolean;
  onSelectAction: (event: Event) => void;
}

export default function FeaturedEvents({ events, priority = false, onSelectAction }: FeaturedEventsProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleSelectAction = useCallback((event: Event) => {
    setSelectedEvent(event);
    onSelectAction(event);
  }, [onSelectAction]);

  return (
    <div className="relative bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 py-8 sm:py-12 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-4">
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white tracking-wider uppercase">
              Featured Events
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="group relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => handleSelectAction(event)}
            >
              {/* Poster Image */}
              {event.poster && event.poster !== 'TBA' && event.poster.includes('googleusercontent.com') ? (
                <Image
                  src={event.poster}
                  alt={event.title}
                  fill
                  priority={priority}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-purple-400 font-medium">Poster Coming Soon</span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                <div className="flex flex-wrap gap-2 mb-2">
                  {event.type.map((type, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white"
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  {event.title}
                </h3>
                <p className="text-white/90 font-medium">
                  {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
} 