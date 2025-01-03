'use client';

import { Event } from '@/types/event';
import { useState } from 'react';
import SearchBar from './SearchBar';
import FeaturedEvents from './FeaturedEvents';
import EventModal from './EventModal';

interface ClientWrapperProps {
  events: Event[];
  featuredEvents: Event[];
}

export default function ClientWrapper({ events, featuredEvents }: ClientWrapperProps) {
  const [searchSelectedEvent, setSearchSelectedEvent] = useState<Event | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-4xl sm:text-5xl font-black text-white text-center mb-8">
          FeteLendr
        </h1>
        
        {/* Search Section */}
        <div className="mb-12">
          <SearchBar events={events} onEventSelect={setSearchSelectedEvent} />
        </div>

        {/* Featured Events */}
        <FeaturedEvents 
          events={featuredEvents} 
          onSelectAction={(event) => setSearchSelectedEvent(event)} 
        />
      </div>

      {/* Event Modal */}
      {searchSelectedEvent && (
        <EventModal
          event={searchSelectedEvent}
          isOpen={true}
          onClose={() => setSearchSelectedEvent(null)}
        />
      )}
    </main>
  );
} 