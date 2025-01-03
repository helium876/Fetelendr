'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isPast } from 'date-fns';
import Image from 'next/image';
import { Event } from '@/types/event';
import { CalendarIcon, MapPinIcon, TicketIcon } from '@heroicons/react/20/solid';
import { logger } from '@/lib/logger';

interface EventCardProps {
  event: Event;
  priority?: boolean;
  onSelectAction: (event: Event) => void;
}

export default function EventCard({ event, priority = false, onSelectAction }: EventCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [event.poster]);

  const handleImageError = () => {
    logger.log('Image load failed:', {
      url: event.poster,
      title: event.title,
      isValidUrl: event.poster?.includes('googleusercontent.com'),
      fileId: event.poster?.split('/').pop()
    });
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  return (
    <div 
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden min-w-[280px] cursor-pointer ${isPast(parseISO(event.date)) ? 'grayscale' : ''}`}
      onClick={() => onSelectAction(event)}
    >
      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Image Container with minimum height */}
      <div className="relative aspect-[3/2] min-h-[180px] overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100">
        {event.poster && event.poster !== 'TBA' && event.poster.includes('googleusercontent.com') ? (
          <>
            <Image
              src={event.poster}
              alt={event.title}
              fill
              priority={priority}
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading={priority ? 'eager' : 'lazy'}
            />
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-purple-50">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
            <span className="text-purple-400 font-medium">Poster Coming Soon</span>
          </div>
        )}
      </div>

      {/* Content with safe spacing and text truncation */}
      <div className="p-4 sm:p-6 flex flex-col min-h-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {event.type.map((type, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium truncate max-w-[200px]"
            >
              {type}
            </span>
          ))}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5em]">
          {event.title}
        </h3>
        <p className="text-purple-600 font-medium mb-2 text-sm sm:text-base line-clamp-1">
          {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}
        </p>
        <p className="text-gray-600 text-sm sm:text-base line-clamp-2">
          {event.venue}
        </p>
        {event.ticketPrice !== 'TBA' && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg font-semibold text-sm whitespace-nowrap">
              {event.ticketPrice.includes('-') ? (
                <>
                  <span className="opacity-75">From </span>
                  {event.ticketPrice.split('-')[0].trim()}
                </>
              ) : event.ticketPrice}
            </span>
            {event.ticketLinks !== 'TBA' && (
              <span className="text-sm text-purple-600 hover:text-purple-700 truncate">
                • Tickets Available
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Overlay - reducing opacity from 50% to 30% */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

EventCard.displayName = 'EventCard'; 