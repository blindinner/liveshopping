import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Match all routes except static files, embed routes, and api routes that don't need auth
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|embed/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
