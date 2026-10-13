/** Per-level text resolution.
 *
 * Each `LevelDef` keeps its English text inline (source of truth). FA/DE catalogs
 * override a level's text by `level.id`; anything not overridden falls back to the
 * English value, so a partial translation still renders.
 */
import type { DialogSlide, LevelDef } from '../engine/types';
import type { Lang } from './lang';
import { LEVELS_FA } from './levels.fa';
import { LEVELS_DE } from './levels.de';

export interface LevelOverride {
  name?: string;
  objective?: string;
  hint?: string;
  fieldNotes?: string[];
  startDialog?: DialogSlide[];
}

export type LevelOverrides = Record<string, LevelOverride>;

export interface LevelText {
  name: string;
  objective: string;
  hint: string;
  fieldNotes?: string[];
  startDialog: DialogSlide[];
}

export function getLevelText(level: LevelDef, lang: Lang): LevelText {
  const base: LevelText = {
    name: level.name,
    objective: level.objective,
    hint: level.hint,
    fieldNotes: level.fieldNotes,
    startDialog: level.startDialog,
  };
  if (lang === 'en') return base;
  const o = (lang === 'fa' ? LEVELS_FA : LEVELS_DE)[level.id];
  if (!o) return base;
  return {
    name: o.name ?? base.name,
    objective: o.objective ?? base.objective,
    hint: o.hint ?? base.hint,
    fieldNotes: o.fieldNotes ?? base.fieldNotes,
    startDialog: o.startDialog ?? base.startDialog,
  };
}
