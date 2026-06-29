'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

type DropdownKey = 'products' | 'industries' | 'resources' | null;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const products = [
    { name: 'Live Shopping', href: '/live-shopping', description: 'Sell products during live video broadcasts' },
    { name: 'Shoppable Video', href: '/shoppable-video', description: 'Tag products in any video content' },
  ];

  const industries = [
    { name: 'Fashion', href: '/industries/fashion' },
    { name: 'Beauty', href: '/industries/beauty' },
    { name: 'Electronics', href: '/industries/electronics' },
    { name: 'Home & Decor', href: '/industries/home' },
    { name: 'Food & Beverage', href: '/industries/food' },
    { name: 'Fitness', href: '/industries/fitness' },
  ];

  const resources = [
    { name: 'FAQ', href: '/#faq' },
    { name: 'How it Works', href: '/#how-it-works' },
    { name: 'Features', href: '/#features' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-6 lg:px-8" ref={dropdownRef}>
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="ShoppableVids" className="h-8" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Products Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'products' ? null : 'products')}
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeDropdown === 'products' ? 'text-pink-600 bg-pink-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Products
                <svg className={`w-4 h-4 transition-transform ${activeDropdown === 'products' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'products' && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {products.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      className="flex flex-col px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      <span className="text-xs text-gray-500 mt-0.5">{item.description}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Industries Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'industries' ? null : 'industries')}
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeDropdown === 'industries' ? 'text-pink-600 bg-pink-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Industries
                <svg className={`w-4 h-4 transition-transform ${activeDropdown === 'industries' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'industries' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {industries.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.name}</span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'resources' ? null : 'resources')}
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeDropdown === 'resources' ? 'text-pink-600 bg-pink-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Resources
                <svg className={`w-4 h-4 transition-transform ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'resources' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {resources.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700 hover:text-gray-900">{item.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2">
              Log in
            </Link>
            <a
              href="/#demo"
              className="inline-flex items-center gap-2 bg-pink-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-500/20"
            >
              Book a Demo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              {/* Products Section */}
              <div className="px-4 py-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Products</div>
                {products.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-700 hover:text-pink-600 py-2 font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Industries Section */}
              <div className="px-4 py-2 mt-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Industries</div>
                <div className="grid grid-cols-2 gap-1">
                  {industries.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-700 hover:text-pink-600 py-2 font-medium"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Resources Section */}
              <div className="px-4 py-2 mt-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Resources</div>
                {resources.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-700 hover:text-pink-600 py-2 font-medium"
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              <div className="my-4 border-t border-gray-100" />

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 py-3 px-4 font-medium"
              >
                Log in
              </Link>
              <a
                href="/#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 mx-4 flex items-center justify-center gap-2 bg-pink-500 text-white px-5 py-3 rounded-full text-sm font-semibold"
              >
                Book a Demo
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
