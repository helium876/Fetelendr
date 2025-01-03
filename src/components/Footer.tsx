'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-b from-white to-purple-50/30">
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="py-8 px-4">
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Powered By Section */}
            <div className="flex flex-col items-center space-y-4">
              <span className="text-gray-400 font-medium tracking-[0.2em] uppercase text-xs">Powered by</span>
              <Link 
                href="https://lucyandvagabond.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Image
                  src="/assets/alv-logo.png"
                  alt="ALV Logo"
                  width={70}
                  height={70}
                  className="object-contain opacity-90"
                  priority
                />
              </Link>
            </div>

            {/* Add a Fete Button */}
            <Link
              href="/add-fete"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xs font-medium tracking-[0.2em] uppercase rounded-full transition-all duration-300 shadow-sm hover:shadow"
            >
              Add a Fete
            </Link>

            {/* Divider */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-purple-200/50 to-transparent"></div>

            {/* Social Links */}
            <div className="flex items-center gap-8">
              <Link 
                href="https://twitter.com/fetelendr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-600 font-medium transition-colors duration-300 text-xs tracking-[0.2em] uppercase"
              >
                Twitter
              </Link>
              <div className="w-1 h-1 bg-purple-200 rounded-full"></div>
              <Link 
                href="https://instagram.com/fetelendr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-600 font-medium transition-colors duration-300 text-xs tracking-[0.2em] uppercase"
              >
                Instagram
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-xs text-gray-400 font-light tracking-wider">
              © {currentYear} FeteLendr. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 