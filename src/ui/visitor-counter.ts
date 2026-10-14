/**
 * Unique-visitor counter — a faithful port of the aghili-labs hero counter.
 *
 * The number lives only on the visitorbadge.io server at `path=learn-git`
 * (one shared counter that every browser reads the same value from). We:
 *   1. read it with the read-only `/api/get` endpoint — which does NOT
 *      increment — so a stale read can never inflate the number;
 *   2. bump it once per browser per day via `/api/hit` on that browser's first
 *      visit of the UTC day, so the total grows with genuine new visitors
 *      instead of on every page load (the old `/api/combined` behavior).
 *
 * A local cache acts as a never-downgrade floor: a returning browser always
 * sees at least the highest number it has seen before.
 */

/** visitorbadge.io shared counter for this site (single source of truth). */
export const COUNTER_PATH = 'learn-git';
const GET_URL = `https://api.visitorbadge.io/api/get?path=${COUNTER_PATH}`; // read-only
const HIT_URL = `https://api.visitorbadge.io/api/hit?path=${COUNTER_PATH}`; // +1

/** Minimum displayed floor — the count never renders below this on any client. */
export const VISITOR_BASELINE = 24;

/** Cache of the last resolved total — doubles as the never-downgrade floor. */
const CACHE_KEY = 'learn-git:visitors:v1';
/** UTC date (YYYY-MM-DD) this browser was last counted — daily dedup. */
const LAST_VISIT_KEY = 'learn-git:last-visit-date';
/** Request timeout, ms. */
const REQUEST_TIMEOUT_MS = 3500;

/** Keys written by the old `/api/combined` (per-load) implementation; purged. */
const LEGACY_KEYS = ['learn-git:visitor-count-cache'];

export interface CachedCount {
  count: number;
  at: number;
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Remove stale caches from earlier counter implementations. */
export function removeLegacyKeys(): void {
  const store = storage();
  if (!store) return;
  for (const key of LEGACY_KEYS) {
    try {
      store.removeItem(key);
    } catch {
      // storage unavailable
    }
  }
}

/**
 * The floor to render before (or when) the server read resolves: the highest
 * total this browser has seen, never below {@link VISITOR_BASELINE}.
 */
export function getCachedFloor(): number {
  const store = storage();
  if (!store) return VISITOR_BASELINE;
  try {
    const raw = store.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as Partial<CachedCount>;
      if (typeof cached.count === 'number' && Number.isFinite(cached.count)) {
        return Math.max(cached.count, VISITOR_BASELINE);
      }
    }
  } catch {
    // quota / private mode
  }
  return VISITOR_BASELINE;
}

function writeCache(count: number): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(CACHE_KEY, JSON.stringify({ count, at: Date.now() } satisfies CachedCount));
  } catch {
    // quota / private mode
  }
}

/** True the first time this browser is seen on the current UTC day. */
export function isNewDailyVisit(): boolean {
  const store = storage();
  if (!store) return false;
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (store.getItem(LAST_VISIT_KEY) === today) return false;
    store.setItem(LAST_VISIT_KEY, today);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch and parse a counter value. Tolerates a bare number or JSON
 * (`{ "value": n }` / `{ "count": n }` / `{ "visitors": n }`).
 *
 * @returns the non-negative integer count, or `null` when unreadable.
 */
export async function fetchCounterValue(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json, text/plain, */*' },
    });
    if (!res.ok) return null;
    const text = (await res.text()).trim();
    let n: number;
    if (/^\d+$/.test(text)) {
      n = Number(text);
    } else {
      try {
        const j = JSON.parse(text) as Record<string, unknown>;
        n = Number(j.value ?? j.count ?? j.visitors ?? j);
      } catch {
        const m = text.match(/\d+/);
        n = m ? Number(m[0]) : NaN;
      }
    }
    return Number.isFinite(n) && n >= 0 ? n : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve the shared visitor total, incrementing it once for a genuinely new
 * daily visit. Mirrors aghili-labs `setupVisitors()`:
 *   - read the shared counter WITHOUT incrementing;
 *   - if this is a fresh daily visit, bump the shared counter once;
 *   - report `max(floor, baseline, value)`;
 *   - return `null` when the read failed so the caller holds the floor.
 *
 * @returns the resolved total, or `null` when the server value was unavailable.
 */
export async function loadVisitorCount(fetchImpl: typeof fetch = fetch): Promise<number | null> {
  removeLegacyKeys();
  const floor = getCachedFloor();

  // 1. Read the shared counter without incrementing (every browser sees this).
  let value = await fetchCounterValue(GET_URL, fetchImpl);

  // 2. Genuinely new daily visit → bump the shared counter once.
  if (isNewDailyVisit()) {
    try {
      await fetchImpl(HIT_URL, { cache: 'no-store' });
    } catch {
      // the +1 below is best-effort; the server's next `get` will catch up
    }
    if (value !== null) value += 1;
  }

  // 3. Render the authoritative total when we have one.
  if (value !== null) {
    const total = Math.max(floor, VISITOR_BASELINE, value);
    writeCache(total);
    return total;
  }

  // 4. Read failed / blocked: no server value — let the caller hold the floor.
  return null;
}

/** Convert ASCII digits to Persian/Eastern-Arabic digits (for the `fa` locale). */
export function toPersianDigits(value: number): string {
  const fa = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(value).replace(/\d/g, (d) => fa[Number(d)]);
}
