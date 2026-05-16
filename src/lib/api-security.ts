import { NextRequest, NextResponse } from 'next/server';

type Bucket = { count: number; resetAt: number };
const rateStore: Map<string, Bucket> = (globalThis as any).__deepguardRateStore || new Map();
if (!(globalThis as any).__deepguardRateStore) {
  (globalThis as any).__deepguardRateStore = rateStore;
}

export function requireAnalystKey(request: NextRequest): NextResponse | null {
  const required = process.env.DEEPGUARD_ANALYST_API_KEY;
  if (!required) return null;
  const provided = request.headers.get('x-deepguard-analyst-key');
  if (provided !== required) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export function rateLimit(
  request: NextRequest,
  scope: string,
  limit = 30,
  windowMs = 60_000
): NextResponse | null {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'local';
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const current = rateStore.get(key);
  if (!current || current.resetAt <= now) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (current.count >= limit) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please retry shortly.' },
      { status: 429 }
    );
  }
  current.count += 1;
  rateStore.set(key, current);
  return null;
}
