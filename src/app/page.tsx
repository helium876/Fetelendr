'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Event } from '@/types/event';
import EventCard from '@/components/EventCard';
import FeaturedEvents from '@/components/FeaturedEvents';
import { format, getMonth, getYear, isToday, parseISO } from 'date-fns';
import EventSkeleton from '@/components/EventSkeleton';
import EventModal from '@/components/EventModal';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const shortMonths = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function Home() {
  const today = new Date();
  const currentYear = getYear(today);
  console.log('Initial date values:', {
    today: today.toISOString(),
    currentYear,
    currentMonth: getMonth(today),
    monthName: months[getMonth(today)]
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(today));
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchSelectedEvent, setSearchSelectedEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; label: string }>>([
    { id: 'all', label: 'All Fetes' }
  ]);
  const eventsPerPage = 12;
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFilters) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFilters]);

  // Cache API response with better error handling and longer duration
  const fetchEvents = useCallback(async () => {
    const cacheKey = 'fetelendr_events';
    try {
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;
        // Cache for 15 minutes
        if (cacheAge < 15 * 60 * 1000) {
          return data;
        }
      }

      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load events');
      }

      // Cache the fresh data
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: result.data,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.warn('Failed to cache events data:', err);
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [selectedMonth, selectedYear, selectedCategory, searchQuery]);

  // Filter events based on search query for dropdown
  const filteredSearchEvents = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const searchTerms = searchQuery.toLowerCase().split(' ');
    return events
      .filter(event => {
        const title = event.title.toLowerCase();
        return searchTerms.every(term => title.includes(term));
      })
      .slice(0, 5); // Limit dropdown to 5 results
  }, [searchQuery, events]);

  // Add search event handler
  const handleSearchSelect = (event: Event) => {
    setSearchSelectedEvent(event);
    setSearchQuery('');
  };

  // Filter and sort events with useMemo
  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        // Skip invalid dates
        if (event.date === 'TBA') return false;

        // Include both public and featured events
        const status = event.status.toLowerCase();
        if (status !== 'public' && status !== 'featured') return false;

        // If there's a search query, only filter by search and ignore month/year
        if (searchQuery) {
          const searchTerms = searchQuery.toLowerCase().trim().split(' ');
          const title = event.title.toLowerCase();
          return searchTerms.every(term => title.includes(term));
        }

        // Otherwise, apply all filters
        const eventDate = new Date(event.date + 'T12:00:00');  // Set to noon to avoid timezone issues
        const eventMonth = getMonth(eventDate);
        const eventYear = getYear(eventDate);
        
        // Skip events that don't match the selected month and year
        if (eventMonth !== selectedMonth || eventYear !== selectedYear) {
          return false;
        }

        // Apply category filter
        if (selectedCategory !== 'all' && !event.type.some(t => t.toLowerCase() === selectedCategory.toLowerCase())) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date + 'T12:00:00');
        const dateB = new Date(b.date + 'T12:00:00');
        const now = new Date();
        const isPastA = dateA < now;
        const isPastB = dateB < now;

        // If one is past and one is future, show future first
        if (isPastA && !isPastB) return 1;
        if (!isPastA && isPastB) return -1;

        // If both are past or both are future, sort by date
        return dateA.getTime() - dateB.getTime();
      });
  }, [events, selectedMonth, selectedYear, selectedCategory, searchQuery]);

  // Memoize the visible events for the current page
  const visibleEvents = useMemo(() => {
    return filteredEvents.slice(0, page * eventsPerPage);
  }, [filteredEvents, page, eventsPerPage]);

  // Memoize the event card render function
  const renderEventCard = useCallback((event: Event, index: number) => {
    // Add priority loading for the first 6 events
    const isPriority = index < 6;
    return (
      <EventCard
        key={event.id}
        event={event}
        priority={isPriority}
        onSelectAction={handleSearchSelect}
      />
    );
  }, [handleSearchSelect]);

  // Update hasMore when filtered events change
  useEffect(() => {
    const totalEvents = filteredEvents.length;
    const currentlyShown = page * eventsPerPage;
    setHasMore(currentlyShown < totalEvents);
    
    // Update loading state for infinite scroll
    if (page > 1) {
      setLoading(false);
    }
  }, [filteredEvents, page, eventsPerPage]);

  // Load more events on scroll
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    
    const totalEvents = filteredEvents.length;
    const currentlyShown = page * eventsPerPage;
    
    if (currentlyShown < totalEvents) {
      setLoading(true);
      setPage(prev => prev + 1);
    } else {
      setHasMore(false);
    }
  }, [loading, hasMore, filteredEvents.length, page, eventsPerPage]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    const sentinel = document.querySelector('#sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  useEffect(() => {
    async function loadEvents() {
      try {
        console.log('Fetching events from API...');
        const response = await fetch('/api/events');
        if (!response.ok) throw new Error('Failed to fetch events');
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to load events');
        }
        
        if (result.data) {
          console.log('Raw events data:', result.data);
          console.log('Events with dates:', result.data.map((e: Event) => ({ title: e.title, date: e.date })));
          
          // Extract unique types from all events
          const allTypes = new Set<string>();
          result.data.forEach((event: Event) => {
            event.type.forEach(type => allTypes.add(type.toLowerCase()));
          });
          console.log('Found event types:', Array.from(allTypes));

          // Create categories from unique types
          const newCategories = [
            { id: 'all', label: 'All Fetes' },
            ...Array.from(allTypes).map(type => ({
              id: type,
              label: type.charAt(0).toUpperCase() + type.slice(1)
            }))
          ];
          console.log('Created categories:', newCategories);

          setCategories(newCategories);
          setEvents(result.data);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  // Get featured events (next 3 upcoming featured events)
  const featuredEvents = useMemo(() => {
    return events
      .filter(event => {
        if (event.date === 'TBA') return false;
        if (event.status.toLowerCase() !== 'featured') return false;

        const eventDate = new Date(event.date + 'T12:00:00');  // Set to noon to avoid timezone issues
        const today = new Date();
        today.setHours(12, 0, 0, 0); // Set to noon for consistent comparison

        if (isNaN(eventDate.getTime())) return false;

        // Only show future featured events (including today)
        return eventDate.getTime() >= today.getTime();
      })
      .sort((a, b) => new Date(a.date + 'T12:00:00').getTime() - new Date(b.date + 'T12:00:00').getTime())
      .slice(0, 3);
  }, [events]);

  // Get available years from events - only current and future years
  const availableYears = useMemo(() => {
    const years = [...new Set(events
      .filter(event => {
        if (event.date === 'TBA') return false;
        const eventYear = getYear(new Date(event.date));
        return eventYear >= currentYear;
      })
      .map(event => getYear(new Date(event.date)))
    )].sort((a, b) => a - b);

    // Always include current year
    if (!years.includes(currentYear)) {
      years.unshift(currentYear);
    }

    return years;
  }, [events, currentYear]);

  // Ensure we default to current year if selected year is not available
  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(currentYear);
    }
  }, [availableYears, selectedYear, currentYear]);

  // Add month navigation function
  const handleMonthChange = (direction: 'prev' | 'next') => {
    let newMonth = selectedMonth;
    let newYear = selectedYear;

    if (direction === 'next') {
      if (selectedMonth === 11) {
        newMonth = 0;
        newYear = selectedYear + 1;
      } else {
        newMonth = selectedMonth + 1;
      }
    } else {
      if (selectedMonth === 0) {
        newMonth = 11;
        newYear = selectedYear - 1;
      } else {
        newMonth = selectedMonth - 1;
      }
    }

    // Don't allow going before current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    if (newYear < currentYear || (newYear === currentYear && newMonth < currentMonth)) {
      return;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 p-8 rounded-2xl shadow-2xl max-w-md backdrop-blur-lg border border-white/10">
          <h2 className="text-white font-bold text-xl mb-3">Error Loading Fetes</h2>
          <p className="text-purple-100">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full px-6 py-3 bg-white text-purple-900 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 sticky top-0 z-50 shadow-lg border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Logo */}
            <h1 className="text-2xl sm:text-3xl font-black text-white hover:scale-105 transition-transform cursor-pointer">
              FeteLendr
            </h1>
            
            {/* Search and Find a Fete */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto sm:ml-auto">
              <div className="relative group w-full sm:w-72">
                <input
                  type="search"
                  placeholder="Search fetes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20 text-white placeholder-white/70"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 group-hover:text-white transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Search Results Dropdown */}
                {searchQuery.trim() && filteredSearchEvents.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl overflow-hidden border border-purple-100 max-h-96 overflow-y-auto">
                    {filteredSearchEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleSearchSelect(event)}
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
              
              <button
                onClick={() => setShowFilters(true)}
                className="w-full sm:w-auto px-6 py-3 bg-white text-purple-900 rounded-2xl font-semibold hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center sm:justify-start gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Find a Fete
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Events with priority loading */}
      {!loading && featuredEvents.length > 0 && (
        <FeaturedEvents events={featuredEvents} priority={true} onSelectAction={handleSearchSelect} />
      )}

      {/* Events Grid with Month Navigation */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Month Navigation - Only show when not loading */}
        {!loading && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-8 max-w-sm mx-auto">
              <button
                onClick={() => handleMonthChange('prev')}
                className="group relative w-8 h-8 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear()}
              >
                <div className="absolute inset-0 bg-purple-100 rounded-full opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity"></div>
                <svg className="w-5 h-5 text-purple-900 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-center">
                <div className="relative">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900">
                    {months[selectedMonth]}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-0.5">
                    <div className="h-px w-4 bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                    <p className="text-sm font-medium text-purple-500">
                      {selectedYear}
                    </p>
                    <div className="h-px w-4 bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleMonthChange('next')}
                className="group relative w-8 h-8 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-purple-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <svg className="w-5 h-5 text-purple-900 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 min-h-[50vh]">
            {[...Array(6)].map((_, i) => (
              <EventSkeleton key={i} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600">There are no events scheduled for this month.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
                onSelectAction={handleSearchSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overscroll-contain"
          role="dialog"
          aria-modal="true"
          ref={modalRef}
        >
          <div className="bg-gradient-to-br from-white via-purple-50 to-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-purple-100 overscroll-contain">
            <div className="p-4 sm:p-6 border-b border-purple-100 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Find Your Next Fete
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
              {/* Year Selection */}
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2 uppercase tracking-wider">Select Year</label>
                <div className="flex flex-wrap gap-2">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 font-medium ${
                        selectedYear === year
                          ? 'bg-gradient-to-br from-purple-900 to-indigo-900 text-white shadow-lg scale-105' 
                          : 'text-purple-900 hover:bg-purple-50 hover:scale-105'
                      } ${year === getYear(today) ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                    >
                      {year}
                      {year === getYear(today) && (
                        <span className="absolute -top-1 -right-1 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full shadow-lg animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Selection */}
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2 uppercase tracking-wider">Choose Month</label>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
                  {months.map((month, index) => {
                    const isCurrentMonth = index === getMonth(today) && selectedYear === getYear(today);
                    return (
                      <button
                        key={month}
                        onClick={() => setSelectedMonth(index)}
                        className={`relative px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-300 font-medium ${
                          selectedMonth === index
                            ? 'bg-gradient-to-br from-purple-900 to-indigo-900 text-white shadow-lg scale-105' 
                            : 'text-purple-900 hover:bg-purple-50 hover:scale-105'
                        } ${isCurrentMonth ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                      >
                        <span className="hidden sm:inline">{month}</span>
                        <span className="sm:hidden">{shortMonths[index]}</span>
                        {isCurrentMonth && (
                          <span className="absolute -top-1 -right-1 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full shadow-lg animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2 uppercase tracking-wider">Fete Category</label>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`group relative px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-300 font-medium overflow-hidden ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-br from-purple-900 to-indigo-900 text-white shadow-lg scale-105' 
                          : 'text-purple-900 hover:bg-purple-50 hover:scale-105'
                      }`}
                    >
                      {category.label}
                      {selectedCategory === category.id && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse-slow rounded-xl"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-purple-100 bg-gradient-to-br from-purple-50 to-white rounded-b-3xl">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-white rounded-xl font-bold hover:from-purple-800 hover:via-indigo-800 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] uppercase tracking-wider text-sm sm:text-base"
              >
                Show Me The Fetes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal for search results */}
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
