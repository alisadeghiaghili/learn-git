/** Coverage: every series has at least one level; goals use known kinds. */

import { describe, it, expect } from 'vitest';
import { allLevels, seriesOrder } from '../src/levels';
import type { GoalCheck } from '../src/engine/types';

function kinds(g: GoalCheck): string[] {
  if (g.kind === 'allOf') return g.checks.flatMap(kinds);
  return [g.kind];
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
