import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'ShoppableVids | Video Commerce Platform',
    template: '%s | ShoppableVids',
  },
  description:
    'Turn live streams into sales with one-click checkout. Shoppable videos, embeddable widgets, and real-time analytics for e-commerce.',
  metadataBase: new URL('https://shoppablevids.com'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${montserrat.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
