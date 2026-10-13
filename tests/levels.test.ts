/** Coverage: every series has at least one level; goals use known kinds; and each
 *  level's own solution, run from its start state, actually satisfies its goal. */

import { describe, it, expect } from 'vitest';
import { allLevels, seriesOrder } from '../src/levels';
import type { GoalCheck, LevelDef, RepoState } from '../src/engine/types';
import { execCommand, type ExecContext } from '../src/engine/commands';
import { cloneState } from '../src/engine/state';
import { goalSatisfied } from '../src/engine/compare';

function kinds(g: GoalCheck): string[] {
  if (g.kind === 'allOf') return g.checks.flatMap(kinds);
  return [g.kind];
}

/** Run a level's solution against a fresh copy of its start state; collect any command that errored. */
function runSolution(level: LevelDef): { state: RepoState; failed: { cmd: string; msg: string }[] } {
  const state = cloneState(level.startState);
  const ctx: ExecContext = { state, levelId: level.id, solution: level.solution, hint: level.hint };
  const failed: { cmd: string; msg: string }[] = [];
  for (const cmd of level.solution) {
    const r = execCommand(cmd, ctx);
    if (!r.ok) failed.push({ cmd, msg: r.error ?? 'unknown error' });
  }
  return { state, failed };
}

describe('level pack coverage', () => {
  it('covers all seriesOrder entries', () => {
    for (const s of seriesOrder) {
      expect(allLevels.some((l) => l.series === s)).toBe(true);
    }
  });

  it('every level has learning goals and hint', () => {
    for (const l of allLevels) {
      expect(l.learning.length).toBeGreaterThan(0);
      expect(l.hint.length).toBeGreaterThan(5);
      expect(l.startDialog.length).toBeGreaterThan(0);
    }
  });

  // Note: `git merge feature` in `hist-merge-conflict` intentionally reports a
  // conflict (the solution then resolves it), so we assert on the end state —
  // that the solution reaches the goal — rather than requiring every command to
  // return ok.
  it("every level's solution reaches its goal", () => {
    for (const l of allLevels) {
      const { state } = runSolution(l);
      expect(goalSatisfied(l.goal, state), `${l.id}: solution did not satisfy goal`).toBe(true);
    }
  });

  it('goal kinds are from the known set', () => {
    const known = new Set([
      'initialized',
      'staged',
      'notStaged',
      'stagedAll',
      'clean',
      'dirty',
      'committedMessageIncludes',
      'commitCount',
      'branchExists',
      'branchMissing',
      'headOn',
      'headDetached',
      'fileTracked',
      'fileUntracked',
      'filePresent',
      'fileMissing',
      'fileIgnored',
      'remoteConfigured',
      'remoteBranchAt',
      'upstreamSet',
      'pushCount',
      'fetchCount',
      'forcePush',
      'tagExists',
      'stashDepth',
      'stashEmpty',
      'mergedIntoHead',
      'rebasedOn',
      'cherryPickCount',
      'headMessageIncludes',
      'conflictPending',
      'conflictsResolved',
      'notDirty',
      'allOf',
    ]);
    for (const l of allLevels) {
      for (const k of kinds(l.goal)) {
        expect(known.has(k)).toBe(true);
      }
    }
  });
});
