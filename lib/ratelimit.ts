/**
 * In-memory rate limiter.
 * Werkt per serverless-instance. Voor productie met veel verkeer: vervang door Upstash Redis.
 */

type Entry = { count: number; reset: number };
const store = new Map<string, Entry>();

// Opruimen elke 5 minuten
setInterval(() => {
  const nu = Date.now();
  for (const [key, entry] of store) {
    if (entry.reset < nu) store.delete(key);
  }
}, 5 * 60 * 1000);

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { ok: boolean; remaining: number } {
  const nu = Date.now();
  const entry = store.get(key);

  if (!entry || entry.reset < nu) {
    store.set(key, { count: 1, reset: nu + windowMs });
    return { ok: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { ok: false, remaining: 0 };
  }

  entry.count++;
  return { ok: true, remaining: maxRequests - entry.count };
}
