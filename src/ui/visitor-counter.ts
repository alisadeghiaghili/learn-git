/**
 * Visitor counter client with local deduplication.
 * Fetches page visitor count and renders a clean numeric stat in the toolbar.
 */

const STORAGE_KEY = 'learn-git:visitor-count-cache';
const BADGE_URL = 'https://api.visitorbadge.io/api/combined?path=learn-git';

export interface CachedCount {
  count: number;
  at: number;
}

/**
 * Extracts the numeric visitor count from the visitorbadge SVG payload.
 */
export function parseVisitorBadgeSvg(svg: string): number | null {
  const title = svg.match(/VISITORS:\s*([\d.,]+[KMB]?)/i);
  const raw = (title ? title[1] : '').replace(/,/g, '');
  if (!raw) return null;

  const suffix = raw.slice(-1).toUpperCase();
  const scale = { K: 1e3, M: 1e6, B: 1e9 }[suffix as 'K' | 'M' | 'B'] || 1;
  const numPart = scale > 1 ? raw.slice(0, -1) : raw;
  const numeric = Number.parseFloat(numPart) * scale;
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : null;
}

export const BASELINE_FALLBACK = 1240;

export function getCachedVisitorCount(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as CachedCount;
      if (typeof cached.count === 'number' && Number.isFinite(cached.count)) {
        return cached.count;
      }
    }
  } catch {
    // LocalStorage private mode fallback
  }
  return null;
}

export async function getVisitorCount(): Promise<number | null> {
  const cached = getCachedVisitorCount();
  if (cached !== null) return cached;

  try {
    const res = await fetch(BADGE_URL, {
      cache: 'no-store',
      headers: {
        'Accept': 'image/svg+xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) return null;

    const svg = await res.text();
    const count = parseVisitorBadgeSvg(svg);

    if (count !== null) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ count, at: Date.now() }),
        );
      } catch {
        // quota
      }
    }

    return count;
  } catch {
    return null;
  }
}
