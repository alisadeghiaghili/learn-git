/** localStorage progress + share helpers. */

import type { LevelProgress } from '../engine/types';

const KEY = 'learngit:progress';

export function loadProgress(): Record<string, LevelProgress> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, LevelProgress>) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: Record<string, LevelProgress>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // ignore quota errors
  }
}

export function markSolved(levelId: string, commands: number): void {
  const p = loadProgress();
  const prev = p[levelId];
  p[levelId] = {
    solved: true,
    bestCommands: prev?.bestCommands != null ? Math.min(prev.bestCommands, commands) : commands,
  };
  saveProgress(p);
}

export function isSolved(levelId: string): boolean {
  return !!loadProgress()[levelId]?.solved;
}

export function bestCount(levelId: string): number | undefined {
  return loadProgress()[levelId]?.bestCommands;
}

export function openShareUrl(): string {
  return typeof location !== 'undefined'
    ? `${location.origin}${location.pathname}?NODEMO`
    : '';
}

export function copyText(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.resolve();
}
