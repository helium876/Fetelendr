import { Event } from '@/types/event';
import { useState, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

interface SearchBarProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
}

export default function SearchBar({ events, onEventSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter events based on search query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredEvents([]);
      return;
    }

    const searchTerms = query.toLowerCase().split(' ');
    const filtered = events.filter(event => {
      const searchString = `${event.title} ${event.venue} ${format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}`.toLowerCase();
      return searchTerms.every(term => searchString.includes(term));
    });

    setFilteredEvents(filtered);
  }, [query, events]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEventClick = (event: Event) => {
    onEventSelect(event);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search fetes..."
          className="w-full pl-12 pr-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20 text-white placeholder-white/70"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 group-hover:text-white transition-colors duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && filteredEvents.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl overflow-hidden border border-purple-100 max-h-96 overflow-y-auto">
          {filteredEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => handleEventClick(event)}
              className="w-full px-4 py-3 text-left hover:bg-purple-50 flex flex-col gap-0.5 transition-colors duration-150"
            >
              <span className="font-semibold text-gray-900">{event.title}</span>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{format(parseISO(event.date), 'MMM d, yyyy')}</span>
                <span>•</span>
                <span>{event.venue}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 