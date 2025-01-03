import { useState, useEffect, useRef } from 'react';
import { Event } from '@/types/event';
import { format, parseISO, isValid } from 'date-fns';
import Image from 'next/image';
import { Modal } from '@/components/Modal';

interface EventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Add ESC key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleImageError = (error: any) => {
    console.error('Modal image failed to load:', {
      url: event.poster,
      error: error.message,
      event: event.title
    });
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Modal image loaded successfully:', {
      url: event.poster,
      event: event.title
    });
    setImageLoaded(true);
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = parseISO(dateStr);
      if (isValid(date)) {
        return format(date, 'EEEE, MMMM d, yyyy');
      }
      return dateStr;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div ref={modalRef} className="bg-white h-full md:h-auto md:rounded-lg overflow-hidden w-full">
        <div className="relative aspect-[16/9] w-full bg-black">
          {event.poster !== 'TBA' && !imageError ? (
            <>
              {/* Blurred background image */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={event.poster}
                  alt=""
                  fill
                  className="object-cover blur-xl opacity-50 scale-110"
                  unoptimized
                  priority
                />
              </div>

              {/* Loading state */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
                  <span className="text-white/70 font-medium">Loading image...</span>
                </div>
              )}

              {/* Main image */}
              <div className="relative h-full w-full flex items-center justify-center">
                <Image
                  src={event.poster}
                  alt={event.title}
                  fill
                  className={`object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  loading="eager"
                  priority={true}
                  sizes="100vw"
                  unoptimized
                />
              </div>
            </>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
              <span className="text-white/70 font-medium">
                {imageError ? 'Failed to load image' : 'Poster coming soon'}
              </span>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="relative p-4 md:p-6 bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 md:right-4 md:top-4 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {event.type.map((type, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-white/10 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm"
              >
                {type}
              </span>
            ))}
            <span className={`px-2.5 py-1 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm ${
              event.status.toLowerCase() === 'active' ? 'bg-green-500/90' :
              event.status.toLowerCase() === 'cancelled' ? 'bg-red-500/90' :
              'bg-yellow-500/90'
            }`}>
              {event.status}
            </span>
          </div>

          <h2 className="text-lg md:text-2xl font-bold mb-2">{event.title}</h2>

          <div className="flex items-center gap-3 md:gap-6 text-white/90">
            <div className="flex items-center gap-2 flex-wrap">
              <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm md:text-base">{formatDate(event.date)}</span>
              {event.time !== 'TBA' && (
                <span className="text-white/70 text-sm md:text-base">• {event.time}</span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4 overflow-y-auto">
          {/* Location */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Venue</h3>
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm md:text-base">{event.venue}</span>
            </div>
          </div>

          {/* Details */}
          {event.description && event.description !== 'TBA' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Additional Details</h3>
              <p className="text-gray-600 text-sm md:text-base whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Ticket Information */}
          {(event.ticketPrice !== 'TBA' || event.ticketLinks !== 'TBA') && (
            <div className="relative bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg p-4 md:p-5 shadow-xl overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-60" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl -ml-12 -mb-12" />
              
              <div className="relative">
                <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Ticket Information
                </h3>

                <div className="space-y-4">
                  {event.ticketPrice !== 'TBA' && (
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-purple-200/80">Price</span>
                        <div className="h-px flex-grow bg-gradient-to-r from-purple-200/20 to-transparent"></div>
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-white mt-1">
                        {event.ticketPrice}
                      </p>
                      <span className="text-xs text-purple-200/60 mt-0.5">per person</span>
                    </div>
                  )}

                  {event.ticketLinks !== 'TBA' && (
                    <a
                      href={event.ticketLinks}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-lg text-white font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20"
                    >
                      Get Tickets
                      <svg 
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
} 