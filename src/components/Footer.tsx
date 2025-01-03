'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-b from-white via-purple-50 to-purple-100/30">
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="py-8 px-4">
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* Powered By Section */}
            <div className="flex flex-col items-center space-y-3">
              <span className="text-gray-500 font-medium tracking-[0.3em] uppercase text-xs">Powered by</span>
              <div className="flex items-center gap-8">
                <Link 
                  href="https://lucyandvagabond.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transform hover:scale-105 transition-transform duration-300"
                >
                  <Image
                    src="/assets/alv-logo.png"
                    alt="ALV Logo"
                    width={70}
                    height={70}
                    className="object-contain opacity-90 w-auto h-auto"
                    priority
                  />
                </Link>
                <Link 
                  href="https://codewhare.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transform hover:scale-105 transition-transform duration-300"
                >
                  <Image
                    src="/assets/codewhare-logo.svg"
                    alt="Codewhare Logo"
                    width={124}
                    height={22}
                    className="object-contain opacity-90 invert"
                    priority
                  />
                </Link>
              </div>
            </div>

            {/* Decorative Line */}
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>

            {/* Two Column Links Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-16">
              {/* Social Links Column */}
              <div className="flex flex-col items-center sm:items-start gap-4">
                <span className="text-purple-800 font-semibold tracking-[0.2em] uppercase text-xs">Follow Us</span>
                <div className="flex sm:flex-col items-center sm:items-start gap-6 sm:gap-4">
                  <Link 
                    href="https://twitter.com/fetelendr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-gray-600 hover:text-purple-700 font-medium transition-all duration-300 text-xs tracking-[0.2em] uppercase"
                  >
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Twitter
                  </Link>
                  <Link 
                    href="https://instagram.com/fetelendr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-gray-600 hover:text-purple-700 font-medium transition-all duration-300 text-xs tracking-[0.2em] uppercase"
                  >
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </Link>
                </div>
              </div>

              {/* Actions Column */}
              <div className="flex flex-col items-center sm:items-start gap-4">
                <span className="text-purple-800 font-semibold tracking-[0.2em] uppercase text-xs">Quick Links</span>
                <div className="flex sm:flex-col items-center sm:items-start gap-6 sm:gap-4">
                  <Link
                    href="/add-fete"
                    className="group flex items-center gap-2 text-gray-600 hover:text-purple-700 font-medium transition-all duration-300 text-xs tracking-[0.2em] uppercase"
                  >
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add a Fete
                  </Link>
                  <a 
                    href="mailto:fetelendr@gmail.com?subject=Request%20to%20be%20Featured&body=Hi%20FeteLendr%20Team%2C%0A%0AI%20would%20like%20to%20request%20my%20event%20to%20be%20featured.%0A%0AEvent%20Details%3A%0A-%20Event%20Name%3A%0A-%20Date%3A%0A-%20Venue%3A%0A-%20Brief%20Description%3A%0A%0AThank%20you!"
                    className="group flex items-center gap-2 text-gray-600 hover:text-purple-700 font-medium transition-all duration-300 text-xs tracking-[0.2em] uppercase"
                  >
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Feature My Fete
                  </a>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="pt-6 mt-6 border-t border-purple-100 text-center">
              <div className="text-sm text-gray-500 font-light tracking-wider">
                © {currentYear} FeteLendr. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 