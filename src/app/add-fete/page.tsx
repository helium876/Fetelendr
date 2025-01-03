'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const EVENT_TYPES = [
  'Beach party',
  'Breakfast party',
  'Premium all-inclusive',
  'Cooler fete',
  'Big fete',
  'Fete',
  'Brunch',
  'Mini road march',
  'Water party',
  'Drink inclusive',
  'Breakfast inclusive',
  'Boat ride',
  'Jouvert',
  'Road march'
];

interface FormErrors {
  email?: string;
  instagram?: string;
  title?: string;
  date?: string;
  time?: string;
  venue?: string;
  type?: string;
  ticketPrice?: string;
  ticketLink?: string;
  poster?: string;
  description?: string;
  general?: string;
}

// Update the input base class for a sleeker look
const inputBaseClass = "w-full px-4 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-purple-400 bg-gray-50/50 text-gray-900 placeholder-gray-400 hover:bg-gray-50 border border-gray-100";

export default function AddFete() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [currency, setCurrency] = useState('JMD');

  const resetForm = () => {
    setSuccess(false);
    setErrors({});
    setImagePreview(null);
    setSelectedTypes([]);
  };

  const validateForm = (formData: FormData): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const email = formData.get('email') as string;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Instagram validation (optional but must be valid if provided)
    const instagram = formData.get('instagram') as string;
    if (instagram && /[^a-zA-Z0-9._]/.test(instagram)) {
      newErrors.instagram = 'Instagram handle can only contain letters, numbers, dots, and underscores';
    }

    // Title validation
    const title = formData.get('title') as string;
    if (!title) {
      newErrors.title = 'Event title is required';
    } else if (title.length < 3) {
      newErrors.title = 'Event title must be at least 3 characters long';
    } else if (title.length > 100) {
      newErrors.title = 'Event title must be less than 100 characters';
    }

    // Date validation
    const date = formData.get('date') as string;
    if (!date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(selectedDate.getTime())) {
        newErrors.date = 'Please enter a valid date';
      } else if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
      
      // Validate date is within reasonable future (e.g., next 2 years)
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
      if (selectedDate > twoYearsFromNow) {
        newErrors.date = 'Date cannot be more than 2 years in the future';
      }
    }

    // Time validation
    const time = formData.get('time') as string;
    if (!time) {
      newErrors.time = 'Time is required';
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      newErrors.time = 'Please enter a valid time';
    }

    // Venue validation
    const venue = formData.get('venue') as string;
    if (!venue) {
      newErrors.venue = 'Venue is required';
    } else if (venue.length < 3) {
      newErrors.venue = 'Venue must be at least 3 characters long';
    } else if (venue.length > 200) {
      newErrors.venue = 'Venue must be less than 200 characters';
    }

    // Type validation
    if (selectedTypes.length === 0) {
      newErrors.type = 'Please select at least one event type';
    }

    // Description validation (optional but with max length)
    const description = formData.get('description') as string;
    if (description && description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Ticket price validation
    const ticketPrice = formData.get('ticketPrice') as string;
    if (!ticketPrice) {
      newErrors.ticketPrice = 'Ticket price is required';
    } else if (!/^\$?\d+(-\$?\d+)?$/.test(ticketPrice.replace(/,/g, ''))) {
      newErrors.ticketPrice = `Please enter a valid price format (e.g., ${currency === 'USD' ? '$5000' : 'J$5000'} or ${currency === 'USD' ? '$3000-$5000' : 'J$3000-J$5000'})`;
    }

    // Ticket link validation (optional but must be valid if provided)
    const ticketLink = formData.get('ticketLink') as string;
    if (ticketLink) {
      try {
        const url = new URL(ticketLink);
        if (url.protocol !== 'https:') {
          newErrors.ticketLink = 'Ticket link must be a secure HTTPS URL';
        }
      } catch {
        newErrors.ticketLink = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrors(prev => ({ ...prev, poster: undefined }));

    if (!file) {
      setImagePreview(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        poster: 'Please upload a JPEG, PNG, or WebP image'
      }));
      e.target.value = '';
      setImagePreview(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({
        ...prev,
        poster: 'Image must be less than 5MB'
      }));
      e.target.value = '';
      setImagePreview(null);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Add currency to formData
    formData.append('currency', currency);

    // Check honeypot field
    const honeypot = formData.get('website') as string;
    if (honeypot) {
      // If honeypot is filled, silently reject (bot detected)
      setSuccess(true); // Fake success to not alert the bot
      return;
    }

    // Validate form
    if (!validateForm(formData)) {
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      // Add selected types to formData
      formData.delete('type');
      selectedTypes.forEach(type => {
        formData.append('type', type);
      });
      
      const response = await fetch('/api/submit-fete', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit fete');
      }

      setSuccess(true);
      setImagePreview(null);
      setSelectedTypes([]);
      e.currentTarget.reset();
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'Failed to submit fete'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-purple-50/30">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-indigo-900 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="text-2xl sm:text-3xl font-black text-white hover:scale-105 transition-transform"
            >
              FeteLendr
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Add Your Fete</h1>
            <p className="text-gray-500">Share your event with the community</p>
          </div>

          {success ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Received!</h2>
              <p className="text-gray-500 mb-6">Thank you for submitting your fete. We'll review it shortly.</p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/"
                  className="px-6 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition-colors"
                >
                  Return Home
                </Link>
                <button
                  onClick={resetForm}
                  className="px-6 py-2 bg-white text-purple-600 border border-purple-100 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">
              {errors.general && (
                <div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">
                  {errors.general}
                </div>
              )}

              {/* Honeypot field - hidden from real users */}
              <div className="hidden">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className={`${inputBaseClass} ${errors.email ? 'border-red-200 bg-red-50' : ''}`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Instagram Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                      <input
                        type="text"
                        id="instagram"
                        name="instagram"
                        className={`${inputBaseClass} pl-8`}
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      className={`${inputBaseClass} ${errors.title ? 'border-red-200 bg-red-50' : ''}`}
                      placeholder="Enter the name of your fete"
                    />
                    {errors.title && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Date *
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        required
                        className={`${inputBaseClass} ${errors.date ? 'border-red-200 bg-red-50' : ''}`}
                      />
                      {errors.date && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.date}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Time *
                      </label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        required
                        className={`${inputBaseClass} ${errors.time ? 'border-red-200 bg-red-50' : ''}`}
                      />
                      {errors.time && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.time}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Venue *
                    </label>
                    <input
                      type="text"
                      id="venue"
                      name="venue"
                      required
                      className={`${inputBaseClass} ${errors.venue ? 'border-red-200 bg-red-50' : ''}`}
                      placeholder="Enter the venue location"
                    />
                    {errors.venue && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.venue}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      className={`${inputBaseClass} ${errors.description ? 'border-red-200 bg-red-50' : ''}`}
                      placeholder="Enter a description of your event..."
                    />
                    {errors.description && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Details Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Event Type * <span className="text-sm text-gray-400">(Select all that apply)</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {EVENT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleTypeToggle(type)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            selectedTypes.includes(type)
                              ? 'bg-purple-100 text-purple-700 shadow-sm scale-[1.02]'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {selectedTypes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedTypes.map((type) => (
                          <span
                            key={type}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-purple-50 text-purple-600"
                          >
                            {type}
                            <button
                              type="button"
                              onClick={() => handleTypeToggle(type)}
                              className="ml-2 text-purple-400 hover:text-purple-600"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ticket Price *
                    </label>
                    <div className="flex gap-2">
                      <div className="w-32">
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className={`${inputBaseClass}`}
                        >
                          <option value="JMD">JMD (J$)</option>
                          <option value="USD">USD ($)</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        id="ticketPrice"
                        name="ticketPrice"
                        required
                        className={`${inputBaseClass} flex-1 ${errors.ticketPrice ? 'border-red-200 bg-red-50' : ''}`}
                        placeholder={currency === 'USD' ? 'e.g., $5000 or $3000-$5000' : 'e.g., J$5000 or J$3000-J$5000'}
                      />
                    </div>
                    {errors.ticketPrice && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.ticketPrice}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="ticketLink" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ticket Link
                    </label>
                    <input
                      type="url"
                      id="ticketLink"
                      name="ticketLink"
                      className={`${inputBaseClass} ${errors.ticketLink ? 'border-red-200 bg-red-50' : ''}`}
                      placeholder="https://..."
                    />
                    {errors.ticketLink && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.ticketLink}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="poster" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Event Poster
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        id="poster"
                        name="poster"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className={`${inputBaseClass} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100`}
                      />
                      {errors.poster && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.poster}</p>
                      )}
                      <div className="text-xs text-gray-500">
                        Maximum file size: 5MB. Accepted formats: JPEG, PNG, WebP
                      </div>
                      {imagePreview && (
                        <div className="relative w-full aspect-[16/9] mt-4 rounded-lg overflow-hidden border border-gray-100">
                          <Image
                            src={imagePreview}
                            alt="Poster preview"
                            fill
                            className="object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              const input = document.getElementById('poster') as HTMLInputElement;
                              if (input) input.value = '';
                            }}
                            className="absolute top-2 right-2 p-2 bg-white/90 text-gray-600 rounded-lg hover:bg-white transition-colors shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Event'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
} 