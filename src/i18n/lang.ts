/** Active-language store.
 *
 * Deliberately imports nothing from `src/levels` or `src/engine` so it can be
 * imported anywhere without reintroducing the levels↔engine circular-import
 * trap that `src/engine/solution.ts` already works around.
 */
export type Lang = 'en' | 'fa' | 'de';

export const LANGS: Lang[] = ['en', 'fa', 'de'];

const KEY = 'learngit:lang';

function isLang(v: unknown): v is Lang {
  return v === 'en' || v === 'fa' || v === 'de';
}

function initial(): Lang {
  if (typeof localStorage === 'undefined') return 'en';
  const v = localStorage.getItem(KEY);
  return isLang(v) ? v : 'en';
}

let current: Lang = initial();

type Listener = (lang: Lang) => void;
let listener: Listener | null = null;

export function getLang(): Lang {
  return current;
}

/** Register a callback invoked whenever the language changes (used by the App to re-render). */
export function onLangChange(cb: Listener): void {
  listener = cb;
}

export function setLang(l: Lang): void {
  if (l === current) return;
  current = l;
  try {
    localStorage.setItem(KEY, l);
  } catch {
    // ignore quota / privacy-mode errors
  }
  applyDom(l);
  listener?.(l);
}

/** Apply language + text direction to the document. Idempotent. */
export function applyDom(l: Lang): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'fa' ? 'rtl' : 'ltr';
}

/** Apply the persisted language to the DOM on startup. */
export function initLang(): void {
  applyDom(current);
}
