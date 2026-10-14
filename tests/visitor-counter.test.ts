import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  BASE_COUNT,
  BASELINE_FALLBACK,
  getCachedVisitorCount,
  getVisitorCount,
  isNewDailyVisit,
  LAST_VISIT_KEY,
  normalizeDigits,
  parseVisitorBadgeSvg,
  STORAGE_KEY,
} from '../src/ui/visitor-counter';

class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe('normalizeDigits', () => {
  it('converts Persian digits to Western digits', () => {
    expect(normalizeDigits('۱۲۳۴۵۶۷۸۹۰')).toBe('1234567890');
  });

  it('converts Arabic-Indic digits to Western digits', () => {
    expect(normalizeDigits('١٢٣٤٥٦٧٨٩٠')).toBe('1234567890');
  });

  it('preserves western digits and non-digit characters', () => {
    expect(normalizeDigits('VISITORS: 1,240')).toBe('VISITORS: 1,240');
  });

  it('returns empty string on null or non-string inputs', () => {
    // @ts-expect-error test invalid inputs
    expect(normalizeDigits(null)).toBe('');
    // @ts-expect-error test invalid inputs
    expect(normalizeDigits(undefined)).toBe('');
  });
});

describe('parseVisitorBadgeSvg', () => {
  it('parses total visitor count from combined visitorbadge title (daily / total)', () => {
    const svg = '<svg role="img" aria-label="VISITORS: 10 / 25"><title>VISITORS: 10 / 25</title></svg>';
    expect(parseVisitorBadgeSvg(svg)).toBe(25);
  });

  it('parses simple visitor count from title', () => {
    const svg = '<svg><title>VISITORS: 1450</title></svg>';
    expect(parseVisitorBadgeSvg(svg)).toBe(1450);
  });

  it('parses formatted count with commas', () => {
    const svg = '<svg><title>VISITORS: 1,450</title></svg>';
    expect(parseVisitorBadgeSvg(svg)).toBe(1450);
  });

  it('parses count with Persian digits', () => {
    const svg = '<svg><title>VISITORS: ۱,۲۴۰</title></svg>';
    expect(parseVisitorBadgeSvg(svg)).toBe(1240);
  });

  it('parses abbreviations like K, M, and B', () => {
    const svgK = '<svg><title>VISITORS: 2.5K</title></svg>';
    expect(parseVisitorBadgeSvg(svgK)).toBe(2500);

    const svgM = '<svg><title>VISITORS: 1.2M</title></svg>';
    expect(parseVisitorBadgeSvg(svgM)).toBe(1200000);

    const svgB = '<svg><title>VISITORS: 3B</title></svg>';
    expect(parseVisitorBadgeSvg(svgB)).toBe(3000000000);
  });

  it('falls back to extracting numeric text node before closing tag', () => {
    const svg = '<svg><text>VISITORS</text><text>320</text></svg>';
    expect(parseVisitorBadgeSvg(svg)).toBe(320);
  });

  it('returns null on invalid or non-numeric title', () => {
    const svg = '<svg><title>NO COUNT HERE</title></svg>';
    expect(parseVisitorBadgeSvg(svg)).toBeNull();
  });

  it('returns null on empty or non-string input', () => {
    expect(parseVisitorBadgeSvg('')).toBeNull();
    // @ts-expect-error test invalid inputs
    expect(parseVisitorBadgeSvg(null)).toBeNull();
  });
});

describe('getCachedVisitorCount & deduplication', () => {
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    globalThis.localStorage = new LocalStorageMock() as unknown as Storage;
  });

  afterEach(() => {
    globalThis.localStorage = originalLocalStorage;
  });

  it('returns null when no count is cached', () => {
    expect(getCachedVisitorCount()).toBeNull();
  });

  it('returns cached count clamped to at least BASE_COUNT', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 50, at: Date.now() }));
    expect(getCachedVisitorCount()).toBe(BASE_COUNT);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 2000, at: Date.now() }));
    expect(getCachedVisitorCount()).toBe(2000);
  });

  it('flags daily visit only once per UTC day', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(isNewDailyVisit()).toBe(true);
    expect(localStorage.getItem(LAST_VISIT_KEY)).toBe(today);

    // Second call on the same day should return false
    expect(isNewDailyVisit()).toBe(false);
  });

  it('getVisitorCount falls back to BASE_COUNT / BASELINE_FALLBACK gracefully when offline', async () => {
    const count = await getVisitorCount();
    expect(count).toBeGreaterThanOrEqual(BASELINE_FALLBACK);
  });
});
