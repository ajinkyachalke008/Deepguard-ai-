import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function buildCsp() {
  const remoteScriptHost = 'https://slelguoygbfzlpylpxfs.supabase.co';
  const connectSrc = [
    "'self'",
    'https://*.supabase.co',
    'https://openrouter.ai',
  ].join(' ');

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    remoteScriptHost,
  ].join(' ');

  return [
    `default-src 'self'`,
    `base-uri 'self'`,
    `frame-ancestors 'self'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data: https:`,
    `media-src 'self' blob: data: https:`,
    `connect-src ${connectSrc}`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `worker-src 'self' blob:`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const csp = buildCsp();
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

