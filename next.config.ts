import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.myshopify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflarestream.com',
        pathname: '/**',
      },
    ],
  },
  // Headers for embedding
  async headers() {
    return [
      {
        // Allow embedding from any origin for the embed route
        source: '/embed/:showId*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com *",
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
