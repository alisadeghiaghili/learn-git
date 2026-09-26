/** Level metadata lookup and solution helpers. */

import type { LevelDef, RepoState } from './types';

export interface LevelSummary {
  id: string;
  series: string;
  name: string;
  par: number;
  difficulty: number;
}

/** Registry filled by `src/levels/index.ts` to avoid a circular import at module load. */
const levelRegistry = new Map<string, LevelDef>();

export function registerLevels(levels: LevelDef[]): void {
  levelRegistry.clear();
  for (const l of levels) levelRegistry.set(l.id, l);
}

export function allLevelSummaries(): LevelSummary[] {
  return [...levelRegistry.values()].map((l) => ({
    id: l.id,
    series: l.series,
    name: l.name,
    par: l.par,
    difficulty: l.difficulty,
  }));
}

export function solutionCommands(levelId?: string): string[] {
  if (!levelId) return [];
  return levelRegistry.get(levelId)?.solution ?? [];
}

export function levelHint(levelId?: string): string {
  if (!levelId) return '';
  return levelRegistry.get(levelId)?.hint ?? '';
}

export function levelObjective(levelId?: string): string {
  if (!levelId) return '';
  return levelRegistry.get(levelId)?.objective ?? '';
}

/** Evaluate whether a level's goal is met — used by sticky checklists. */
export function isGoalMet(levelId: string | undefined, _state: RepoState): boolean {
  // Goal evaluation lives in compare.ts; this stub keeps commands.ts decoupled.
  void _state;
  return !!levelId && levelRegistry.has(levelId);
}

export function getLevel(levelId: string): LevelDef | undefined {
  return levelRegistry.get(levelId);
}
