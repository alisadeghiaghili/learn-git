/** Visitor counter: aghili-labs' shared-count algorithm.
 *
 *  The counter must (1) read the shared value with the read-only endpoint
 *  WITHOUT incrementing, (2) bump it only on a browser's first visit of the day,
 *  (3) never render below its cached floor / baseline, and (4) fall back to the
 *  floor when the read fails. Everything is tested against an injected fake
 *  fetch so no network is involved.
 */

import { describe, it, expect, beforeEach } from 'vitest';

// The module guards `localStorage` behind storage(), but these tests exercise
// the cache + daily-dedup paths, so provide a minimal in-memory implementation.
class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string): string | null {
    return this.m.has(k) ? this.m.get(k)! : null;
  }
  setItem(k: string, v: string): void {
    this.m.set(k, String(v));
  }
  removeItem(k: string): void {
    this.m.delete(k);
  }
  clear(): void {
    this.m.clear();
  }
  key(i: number): string | null {
    return [...this.m.keys()][i] ?? null;
  }
  get length(): number {
    return this.m.size;
  }
}
const g = globalThis as unknown as { localStorage?: Storage };
if (typeof g.localStorage === 'undefined') g.localStorage = new MemoryStorage();

import {
  VISITOR_BASELINE,
  getCachedFloor,
  isNewDailyVisit,
  loadVisitorCount,
  fetchCounterValue,
  removeLegacyKeys,
  toPersianDigits,
} from '../src/ui/visitor-counter';

const CACHE_KEY = 'learn-git:visitors:v1';
const LAST_VISIT_KEY = 'learn-git:last-visit-date';
const LEGACY_KEY = 'learn-git:visitor-count-cache';
const today = () => new Date().toISOString().slice(0, 10);

function resp(ok: boolean, body = '') {
  return { ok, status: ok ? 200 : 404, async text() { return body; } } as unknown as Response;
}

/** Build a fake fetch that routes GET (read) and HIT (increment) separately. */
function fakeFetch(read: { ok: boolean; body?: string }) {
  const calls: string[] = [];
  const fn = (async (input: RequestInfo | URL) => {
    const u = String(input);
    calls.push(u);
    if (u.includes('/api/hit?')) return resp(true);
    return resp(read.ok, read.body);
  }) as unknown as typeof fetch;
  return { fn, calls };
}

beforeEach(() => {
  localStorage.clear();
});

describe('toPersianDigits', () => {
  it('maps ASCII digits to Persian digits', () => {
    expect(toPersianDigits(214)).toBe('۲۱۴');
    expect(toPersianDigits(120)).toBe('۱۲۰');
    expect(toPersianDigits(0)).toBe('۰');
    expect(toPersianDigits(1234)).toBe('۱۲۳۴');
  });
});

describe('fetchCounterValue', () => {
  it('parses a bare number', async () => {
    const f = (async () => resp(true, '42')) as unknown as typeof fetch;
    await expect(fetchCounterValue('x', f)).resolves.toBe(42);
  });
  it('parses JSON {value|count|visitors}', async () => {
    const mk = (body: string) => (async () => resp(true, body)) as unknown as typeof fetch;
    await expect(fetchCounterValue('x', mk('{"value":7}'))).resolves.toBe(7);
    await expect(fetchCounterValue('x', mk('{"count":5}'))).resolves.toBe(5);
    await expect(fetchCounterValue('x', mk('{"visitors":9}'))).resolves.toBe(9);
  });
  it('falls back to the first number in free text', async () => {
    const f = (async () => resp(true, 'visitors: 123 today')) as unknown as typeof fetch;
    await expect(fetchCounterValue('x', f)).resolves.toBe(123);
  });
  it('returns null on a non-2xx response', async () => {
    const f = (async () => resp(false)) as unknown as typeof fetch;
    await expect(fetchCounterValue('x', f)).resolves.toBeNull();
  });
  it('returns null when the request throws', async () => {
    const f = (async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;
    await expect(fetchCounterValue('x', f)).resolves.toBeNull();
  });
});

describe('getCachedFloor', () => {
  it('defaults to the baseline with no cache', () => {
    expect(getCachedFloor()).toBe(VISITOR_BASELINE);
  });
  it('returns the cached count when it is at/above the baseline', () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ count: 500, at: 1 }));
    expect(getCachedFloor()).toBe(500);
  });
  it('never returns below the baseline', () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ count: 10, at: 1 }));
    expect(getCachedFloor()).toBe(VISITOR_BASELINE);
  });
  it('ignores corrupt cache', () => {
    localStorage.setItem(CACHE_KEY, '{not json');
    expect(getCachedFloor()).toBe(VISITOR_BASELINE);
  });
});

describe('isNewDailyVisit', () => {
  it('is true once, then false for the same day', () => {
    expect(isNewDailyVisit()).toBe(true);
    expect(isNewDailyVisit()).toBe(false);
  });
  it('is false when already counted today', () => {
    localStorage.setItem(LAST_VISIT_KEY, today());
    expect(isNewDailyVisit()).toBe(false);
  });
});

describe('removeLegacyKeys', () => {
  it('purges the old per-load counter cache', () => {
    localStorage.setItem(LEGACY_KEY, 'stale');
    removeLegacyKeys();
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });
});

describe('loadVisitorCount', () => {
  it('reads the shared value without incrementing (returning browser)', async () => {
    localStorage.setItem(LAST_VISIT_KEY, today()); // not a new daily visit
    const { fn, calls } = fakeFetch({ ok: true, body: '{"value":150}' });
    const count = await loadVisitorCount(fn);
    expect(count).toBe(150);
    expect(calls.some((c) => c.includes('/api/hit?'))).toBe(false); // no increment
  });

  it('increments once on a genuinely new daily visit', async () => {
    const { fn, calls } = fakeFetch({ ok: true, body: '{"value":150}' });
    const count = await loadVisitorCount(fn);
    expect(count).toBe(151); // 150 + the daily hit
    expect(calls.filter((c) => c.includes('/api/hit?')).length).toBe(1);
    // the dedup flag is now set → a second load does not re-increment
    const { fn: fn2 } = fakeFetch({ ok: true, body: '{"value":151}' });
    expect(await loadVisitorCount(fn2)).toBe(151);
  });

  it('never renders below its cached floor (never-downgrade)', async () => {
    localStorage.setItem(LAST_VISIT_KEY, today());
    localStorage.setItem(CACHE_KEY, JSON.stringify({ count: 500, at: 1 }));
    const { fn } = fakeFetch({ ok: true, body: '{"value":100}' }); // server regressed
    expect(await loadVisitorCount(fn)).toBe(500);
  });

  it('never renders below the baseline', async () => {
    localStorage.setItem(LAST_VISIT_KEY, today());
    const { fn } = fakeFetch({ ok: true, body: '{"value":5}' });
    expect(await loadVisitorCount(fn)).toBe(VISITOR_BASELINE);
  });

  it('writes the resolved total back to the cache', async () => {
    localStorage.setItem(LAST_VISIT_KEY, today());
    const { fn } = fakeFetch({ ok: true, body: '{"value":300}' });
    expect(await loadVisitorCount(fn)).toBe(300);
    expect(JSON.parse(localStorage.getItem(CACHE_KEY)!).count).toBe(300);
  });

  it('returns null when the read fails, leaving the floor in place', async () => {
    localStorage.setItem(LAST_VISIT_KEY, today());
    const { fn } = fakeFetch({ ok: false });
    expect(await loadVisitorCount(fn)).toBeNull();
  });
});
