/**
 * Visitor counter client with local deduplication and badge SVG parsing.
 * Fetches page visitor count and renders a clean numeric stat in the toolbar.
 *
 * Implements strict browser-level daily deduplication via localStorage (identical
 * to aghili-labs) so that page reloads do not increment the counter, ensuring
 * only unique visitors are counted while guaranteeing a stable floor that never
 * downgrades.
 */

export const STORAGE_KEY = 'learn-git:visitor-count:v4';
export const LAST_VISIT_KEY = 'learn-git:last-visit-date';
export const COUNT_API_BASE = 'https://countapi.mileshilliard.com/api/v1';
export const COUNT_KEY = 'alisadeghiaghili-learn-git';
export const BADGE_URL = 'https://api.visitorbadge.io/api/combined?path=learn-git';
export const HISTORICAL_OFFSET = 0;
export const BASE_COUNT = 1240;
export const BASELINE_FALLBACK = 1240;

export interface CachedCount {
  count: number;
  at: number;
}

// Purge legacy cache keys from previous counter iterations
try {
  if (typeof localStorage !== 'undefined') {
    [
      'learn-git:visitor-count-cache',
      'learn-git:visitor-count:v2',
      'learn-git:visitor-count:v3',
    ].forEach((k) => localStorage.removeItem(k));
  }
} catch {
  // Storage unavailable
}

/**
 * Normalizes Eastern Arabic and Persian numerals to Western digits (0-9).
 */
export function normalizeDigits(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1776 + 48))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632 + 48));
}

/**
 * Extracts the numeric visitor count from the visitorbadge SVG payload.
 * Handles combined ("VISITORS: daily / total"), simple ("VISITORS: total"),
 * comma-formatted numbers, K/M/B abbreviations, and Persian/Arabic digits.
 */
export function parseVisitorBadgeSvg(svg: string): number | null {
  if (!svg || typeof svg !== 'string') return null;

  const normalized = normalizeDigits(svg);

  // 1. Look for combined format: daily / total -> extract total (second number)
  const combinedMatch = normalized.match(/(?:VISITORS:|>)\s*[\d.,]+[KMB]?\s*\/\s*([\d.,]+[KMB]?)/i);
  let raw = combinedMatch ? combinedMatch[1] : '';

  // 2. Look for primary count label "VISITORS: <number>"
  if (!raw) {
    const match =
      normalized.match(/VISITORS:\s*([\d.,]+[KMB]?)/i) ||
      normalized.match(/aria-label=["']VISITORS:\s*([\d.,]+[KMB]?)/i);
    raw = match ? match[1] : '';
  }

  // 3. Fallback to extracting the trailing text node containing numeric data
  if (!raw) {
    const textMatches = Array.from(normalized.matchAll(/>\s*([0-9.,]+[KMB]?)\s*<\/text>/gi));
    if (textMatches.length > 0) {
      raw = textMatches[textMatches.length - 1][1];
    }
  }

  raw = (raw || '').replace(/,/g, '').trim();
  if (!raw) return null;

  const suffix = raw.slice(-1).toUpperCase();
  const scale = { K: 1e3, M: 1e6, B: 1e9 }[suffix as 'K' | 'M' | 'B'] || 1;
  const numPart = scale > 1 ? raw.slice(0, -1) : raw;
  const numeric = Number.parseFloat(numPart) * scale;
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : null;
}

/**
 * Synchronously retrieves cached count for instant zero-latency UI rendering.
 * Guarantees the count never downgrades below BASE_COUNT.
 */
export function getCachedVisitorCount(): number | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as CachedCount;
      if (typeof cached?.count === 'number' && Number.isFinite(cached.count) && cached.count > 0) {
        return Math.max(BASE_COUNT, cached.count);
      }
    }
  } catch {
    // Restricted storage
  }
  return null;
}

/**
 * Saves count to local cache.
 */
export function cacheCount(count: number): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, at: Date.now() }));
  } catch {
    // Ignore quota errors
  }
}

/**
 * Checks if the user already visited today (UTC day string).
 */
export function isNewDailyVisit(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    const today = new Date().toISOString().slice(0, 10);
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    if (lastVisit === today) {
      return false;
    }
    localStorage.setItem(LAST_VISIT_KEY, today);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches with an explicit timeout to prevent hanging when APIs are slow or blocked.
 */
async function fetchWithTimeout(url: string, ms = 3500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json, image/svg+xml, */*',
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Retrieves the visitor count, incrementing on the first visit per day per browser,
 * while returning cached / read-only count on subsequent visits to count unique visitors.
 * Always ensures the displayed count never downgrades below BASE_COUNT.
 */
export async function getVisitorCount(): Promise<number> {
  const cached = getCachedVisitorCount();
  if (cached !== null) {
    return cached;
  }

  const isNew = isNewDailyVisit();
  const action = isNew ? 'hit' : 'get';

  // 1. Try CountAPI (JSON, CORS enabled, fast, distinct get vs hit without uncontrolled increments)
  try {
    const res = await fetchWithTimeout(`${COUNT_API_BASE}/${action}/${COUNT_KEY}`, 3500);
    if (res.ok) {
      const data = (await res.json()) as { value?: number };
      if (typeof data?.value === 'number' && Number.isFinite(data.value) && data.value > 0) {
        const total = Math.max(BASE_COUNT, data.value + HISTORICAL_OFFSET);
        cacheCount(total);
        return total;
      }
    }
  } catch {
    // CountAPI network error or timeout, proceed to fallback
  }

  // 2. Fallback to SVG Badge Provider ONLY on genuine new visits if CountAPI failed
  if (isNew) {
    try {
      const res = await fetchWithTimeout(BADGE_URL, 3500);
      if (res.ok) {
        const svg = await res.text();
        const parsed = parseVisitorBadgeSvg(svg);
        if (parsed !== null && parsed > 0) {
          const total = Math.max(BASE_COUNT, BASE_COUNT + (parsed - 1));
          cacheCount(total);
          return total;
        }
      }
    } catch {
      // Badge endpoint unreachable
    }
  }

  cacheCount(BASE_COUNT);
  return BASE_COUNT;
}
