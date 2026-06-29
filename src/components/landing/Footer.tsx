import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-16 px-6 lg:px-8 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="ShoppableVids" className="h-7" />
          </Link>

          {/* Links */}
          <div className="flex items-center gap-10">
            <a href="#features" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
              How it Works
            </a>
            <a href="#faq" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
              FAQ
            </a>
            <Link href="/login" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
              Log in
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} ShoppableVids. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
