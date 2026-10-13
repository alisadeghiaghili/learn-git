/** i18n + learning wiring: the UI promises to resolve ids it renders, so guard
 *  that every learning chip on a level maps to a real topic, and every goal-check
 *  kind has a localized label in each supported language. */

import { describe, it, expect } from 'vitest';
import { allLevels } from '../src/levels';
import { topicIds } from '../src/learning';
import { ui } from '../src/i18n/ui';
import { LEVELS_FA } from '../src/i18n/levels.fa';
import type { Lang } from '../src/i18n/lang';
import type { GoalCheck } from '../src/engine/types';

function kinds(g: GoalCheck): string[] {
  return g.kind === 'allOf' ? g.checks.flatMap(kinds) : [g.kind];
}

const LANGS: Lang[] = ['en', 'fa', 'de'];

describe('learning wiring', () => {
  it('every level learning chip id is a known topic', () => {
    const ids = new Set(topicIds());
    for (const l of allLevels) {
      for (const id of l.learning) {
        expect(ids.has(id), `${l.id}: unknown learning topic "${id}"`).toBe(true);
      }
    }
  });
});

describe('goal-label wiring', () => {
  it('goalLabels covers every goal kind used, in every language', () => {
    const used = new Set<string>();
    for (const l of allLevels) kinds(l.goal).forEach((k) => used.add(k));
    for (const lang of LANGS) {
      const missing = [...used].filter((k) => !ui(lang).goalLabels[k]);
      expect(missing, `${lang} missing goalLabels: ${missing.join(', ')}`).toEqual([]);
    }
  });
});

describe('Persian level text', () => {
  // A missing override silently renders English (by design fallback), so guard
  // that the FA catalog is a 1:1 cover of every level id.
  it('LEVELS_FA covers every level id, with no dangling keys', () => {
    const ids = allLevels.map((l) => l.id);
    const faIds = Object.keys(LEVELS_FA);
    const missing = ids.filter((id) => !LEVELS_FA[id]);
    const dangling = faIds.filter((id) => !ids.includes(id));
    expect(missing, `levels with no FA override: ${missing.join(', ')}`).toEqual([]);
    expect(dangling, `FA keys that are not a level id: ${dangling.join(', ')}`).toEqual([]);
  });

  it('each FA override translates the user-facing fields (not left as English)', () => {
    for (const l of allLevels) {
      const o = LEVELS_FA[l.id];
      expect(o, `${l.id}: no FA override`).toBeTruthy();
      // name/objective are prose and must actually be Persian, not the English
      // source. A hint may be command-only (e.g. `git mv a b`) and so is only
      // required to be present.
      expect(o.name, `${l.id}: name still English`).not.toBe(l.name);
      expect(o.objective, `${l.id}: objective still English`).not.toBe(l.objective);
      expect(o.hint, `${l.id}: hint missing`).toBeTruthy();
      expect(o.hint!.trim().length, `${l.id}: hint empty`).toBeGreaterThan(0);
      expect(o.startDialog, `${l.id}: startDialog missing`).toBeTruthy();
      expect(o.startDialog!.length, `${l.id}: startDialog empty`).toBeGreaterThan(0);
    }
  });
});
