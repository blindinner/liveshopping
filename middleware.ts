import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Match all routes except static files, embed routes, and api routes that don't need auth
    // api/shopify/auth and api/shopify/callback are excluded for OAuth flow
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/shopify/auth|api/shopify/callback|embed/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
