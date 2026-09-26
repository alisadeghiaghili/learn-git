/** Goal comparison — project state, not raw object identity. */

import type { GoalCheck, RepoState } from './types';
import {
  computeDirtyPaths,
  currentTip,
  isClean,
  stagedPaths,
  unstagedPaths,
  untrackedPaths,
} from './state';

export interface CheckResult {
  ok: boolean;
  label: string;
  detail: string;
}

export function checkGoal(goal: GoalCheck, state: RepoState): CheckResult[] {
  return flatten(goal).map((c) => evaluate(c, state));
}

export function goalSatisfied(goal: GoalCheck, state: RepoState): boolean {
  return checkGoal(goal, state).every((r) => r.ok);
}

function flatten(goal: GoalCheck): GoalCheck[] {
  if (goal.kind === 'allOf') return goal.checks.flatMap(flatten);
  return [goal];
}

function evaluate(g: GoalCheck, state: RepoState): CheckResult {
  switch (g.kind) {
    case 'initialized': {
      const want = g.value ?? true;
      return {
        ok: state.initialized === want,
        label: want ? 'Repository initialized' : 'Repository not initialized',
        detail: state.initialized ? 'git init done' : 'not initialized',
      };
    }
    case 'staged': {
      const staged = new Set(stagedPaths(state));
      const ok = g.paths.every((p) => staged.has(p));
      return {
        ok,
        label: `Staged: ${g.paths.join(', ')}`,
        detail: ok ? 'all staged' : `missing: ${g.paths.filter((p) => !staged.has(p)).join(', ')}`,
      };
    }
    case 'notStaged': {
      const staged = new Set(stagedPaths(state));
      const ok = g.paths.every((p) => !staged.has(p));
      return {
        ok,
        label: `Not staged: ${g.paths.join(', ')}`,
        detail: ok ? 'none staged' : `still staged: ${g.paths.filter((p) => staged.has(p)).join(', ')}`,
      };
    }
    case 'stagedAll': {
      const remaining = unstagedPaths(state).concat(untrackedPaths(state));
      return {
        ok: remaining.length === 0 && stagedPaths(state).length > 0,
        label: 'Everything staged',
        detail: remaining.length ? `pending: ${remaining.join(', ')}` : 'index ready',
      };
    }
    case 'clean': {
      const ok = isClean(state);
      return {
        ok,
        label: 'Working tree clean',
        detail: ok ? 'nothing to commit' : `dirty: ${computeDirtyPaths(state).concat(untrackedPaths(state)).join(', ')}`,
      };
    }
    case 'dirty': {
      const ok = !isClean(state);
      return {
        ok,
        label: 'Working tree has changes',
        detail: ok ? 'changes present' : 'clean — edit a file first',
      };
    }
    case 'committedMessageIncludes': {
      const match = state.commits.find(
        (c) =>
          c.message.toLowerCase().includes(g.text.toLowerCase()) &&
          (!g.requireFilesAny || g.requireFilesAny.some((p) => p in c.tree)),
      );
      return {
        ok: !!match,
        label: `Commit message contains "${g.text}"`,
        detail: match ? `found ${match.hash}` : 'no matching commit',
      };
    }
    case 'commitCount': {
      return {
        ok: state.commits.length >= g.min,
        label: `At least ${g.min} commit(s)`,
        detail: `${state.commits.length} commit(s)`,
      };
    }
    case 'branchExists': {
      const ok = state.branches.some((b) => b.name === g.name);
      return {
        ok,
        label: `Branch "${g.name}" exists`,
        detail: ok ? 'created' : 'missing',
      };
    }
    case 'branchMissing': {
      const ok = !state.branches.some((b) => b.name === g.name);
      return {
        ok,
        label: `Branch "${g.name}" deleted`,
        detail: ok ? 'gone' : 'still exists',
      };
    }
    case 'headOn': {
      const ok = !state.detachedHead && state.HEAD === g.branch;
      return {
        ok,
        label: `HEAD on "${g.branch}"`,
        detail: state.detachedHead ? 'detached' : `on ${state.HEAD}`,
      };
    }
    case 'headDetached': {
      const want = g.value ?? true;
      return {
        ok: state.detachedHead === want,
        label: want ? 'HEAD detached' : 'HEAD attached to a branch',
        detail: state.detachedHead ? 'detached' : `on ${state.HEAD}`,
      };
    }
    case 'fileTracked': {
      const ok = g.paths.every((p) => state.files[p]?.tracked);
      return {
        ok,
        label: `Tracked: ${g.paths.join(', ')}`,
        detail: ok ? 'all tracked' : 'untracked paths remain',
      };
    }
    case 'fileUntracked': {
      const ok = g.paths.every((p) => state.files[p] && !state.files[p].tracked);
      return {
        ok,
        label: `Untracked: ${g.paths.join(', ')}`,
        detail: ok ? 'all untracked' : 'still tracked',
      };
    }
    case 'filePresent': {
      const ok = g.paths.every((p) => state.files[p]?.present);
      return {
        ok,
        label: `Present: ${g.paths.join(', ')}`,
        detail: ok ? 'on disk' : 'missing',
      };
    }
    case 'fileMissing': {
      const ok = g.paths.every((p) => state.files[p] && !state.files[p].present);
      return {
        ok,
        label: `Missing: ${g.paths.join(', ')}`,
        detail: ok ? 'deleted' : 'still present',
      };
    }
    case 'fileIgnored': {
      const f = state.files[g.path];
      const ok = !!f?.gitignored;
      return {
        ok,
        label: `Ignored: ${g.path}`,
        detail: ok ? 'gitignored' : 'not ignored',
      };
    }
    case 'remoteConfigured': {
      const ok = g.name
        ? state.remotes.some((r) => r.name === g.name)
        : state.remotes.length > 0;
      return {
        ok,
        label: g.name ? `Remote "${g.name}" configured` : 'A remote is configured',
        detail: ok ? state.remotes.map((r) => r.name).join(', ') : 'no remotes',
      };
    }
    case 'remoteBranchAt': {
      const rb = state.remoteBranches.find((r) => r.name === g.name);
      let ok = !!rb;
      if (ok && g.commitMessageIncludes) {
        const commit = state.commits.find((c) => c.hash === rb!.commit);
        ok = !!commit && commit.message.toLowerCase().includes(g.commitMessageIncludes.toLowerCase());
      }
      return {
        ok,
        label: `Remote branch ${g.name}${g.commitMessageIncludes ? ` contains "${g.commitMessageIncludes}"` : ''}`,
        detail: rb ? `at ${rb.commit}` : 'not pushed',
      };
    }
    case 'upstreamSet': {
      const br = state.branches.find((b) => b.name === g.branch);
      return {
        ok: !!br?.upstream,
        label: `Upstream set for "${g.branch}"`,
        detail: br?.upstream ?? 'none',
      };
    }
    case 'pushCount': {
      return {
        ok: state.pushCount >= g.min,
        label: `Pushed at least ${g.min} time(s)`,
        detail: `${state.pushCount} push(es)`,
      };
    }
    case 'fetchCount': {
      return {
        ok: state.fetchCount >= g.min,
        label: `Fetched/pulled at least ${g.min} time(s)`,
        detail: `${state.fetchCount}`,
      };
    }
    case 'tagExists': {
      const ok = state.tags.some((t) => t.name === g.name);
      return {
        ok,
        label: `Tag "${g.name}" exists`,
        detail: ok ? 'created' : 'missing',
      };
    }
    case 'stashDepth': {
      return {
        ok: state.stash.length >= g.min,
        label: `Stash depth ≥ ${g.min}`,
        detail: `${state.stash.length} entry(ies)`,
      };
    }
    case 'stashEmpty': {
      const want = g.value ?? true;
      const empty = state.stash.length === 0;
      return {
        ok: empty === want,
        label: want ? 'Stash empty' : 'Stash has entries',
        detail: `${state.stash.length} entry(ies)`,
      };
    }
    case 'mergedIntoHead': {
      const tip = currentTip(state);
      const headCommit = state.commits.find((c) => c.hash === tip);
      const br = state.branches.find((b) => b.name === g.branch);
      const ok =
        !!headCommit &&
        !!br &&
        (headCommit.parents.includes(br.commit) ||
          headCommit.hash === br.commit ||
          (headCommit.message.includes(g.branch) && headCommit.parents.length >= 2));
      return {
        ok,
        label: `Merged "${g.branch}" into HEAD`,
        detail: ok ? 'merge present' : 'not merged',
      };
    }
    case 'rebasedOn': {
      const tip = currentTip(state);
      const headCommit = state.commits.find((c) => c.hash === tip);
      const br = state.branches.find((b) => b.name === g.branch);
      // After rebase, HEAD's history should include the target tip as an ancestor,
      // and the rebased branch tip should differ from a pure merge parent layout.
      let ok = !!headCommit && !!br;
      if (ok && headCommit && br) {
        const ancestors = collectAncestors(state, headCommit.hash);
        ok = ancestors.has(br.commit) || headCommit.hash === br.commit;
        // Prefer explicit rebasing bookkeeping if still set, or cherry-linear history
        if (state.rebasedFrom || state.rebaseCount) {
          ok = ok && (state.rebaseCount ?? 0) > 0;
        }
      }
      return {
        ok,
        label: `Rebased onto "${g.branch}"`,
        detail: ok ? 'rebase complete' : 'not rebased',
      };
    }
    case 'cherryPickCount': {
      return {
        ok: state.cherryPickCount >= g.min,
        label: `Cherry-picked at least ${g.min} commit(s)`,
        detail: `${state.cherryPickCount}`,
      };
    }
    case 'headMessageIncludes': {
      const tip = currentTip(state);
      const head = state.commits.find((c) => c.hash === tip);
      const ok = !!head && head.message.toLowerCase().includes(g.text.toLowerCase());
      return {
        ok,
        label: `HEAD message contains "${g.text}"`,
        detail: head ? `"${head.message}"` : 'no commits',
      };
    }
    case 'conflictPending': {
      const want = g.value ?? true;
      const pending = state.conflicts.length > 0;
      return {
        ok: pending === want,
        label: want ? 'Merge conflict is open' : 'No open conflicts',
        detail: pending ? state.conflicts.join(', ') : 'clean',
      };
    }
    case 'conflictsResolved': {
      return {
        ok: state.conflictsResolvedCount >= g.min && state.conflicts.length === 0,
        label: `Resolved at least ${g.min} conflict merge(s)`,
        detail: `${state.conflictsResolvedCount} resolved, ${state.conflicts.length} open`,
      };
    }
    case 'notDirty': {
      const dirty = computeDirtyPaths(state);
      return {
        ok: dirty.length === 0,
        label: 'No unstaged/tracked dirt',
        detail: dirty.length ? dirty.join(', ') : 'clean',
      };
    }
    case 'allOf': {
      return evaluate(g.checks[0] ?? { kind: 'initialized' }, state);
    }
  }
}

function collectAncestors(state: RepoState, hash: string): Set<string> {
  const out = new Set<string>();
  const queue = [hash];
  while (queue.length) {
    const h = queue.shift()!;
    if (!h || out.has(h)) continue;
    out.add(h);
    const c = state.commits.find((x) => x.hash === h);
    if (c) queue.push(...c.parents);
  }
  return out;
}

/** Back-compat helpers used by tests. */
export function firstMissing(goal: GoalCheck, state: RepoState): CheckResult | undefined {
  return checkGoal(goal, state).find((r) => !r.ok);
}
