/** Level metadata lookup and solution helpers. */

import type { LevelDef, RepoState, SolutionStepStatus } from './types';
import { stagedPaths } from './state';
import { tokenize } from './tokenizer';

export interface LevelSummary {
  id: string;
  series: string;
  name: string;
  par: number;
  difficulty: number;
}

/** Registry filled by `src/levels/index.ts`. */
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

export function getLevel(levelId: string): LevelDef | undefined {
  return levelRegistry.get(levelId);
}

function normalizeWs(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

function commitMessageOf(cmd: string): string | null {
  const m = cmd.match(/git\s+commit\b[\s\S]*-m\s+(?:"([^"]*)"|'([^']*)'|(\S+))/i);
  if (!m) return null;
  return m[1] ?? m[2] ?? m[3] ?? null;
}

function commandInHistory(state: RepoState, matcher: (cmd: string) => boolean): boolean {
  return (state.commandHistory ?? []).some((c) => matcher(normalizeWs(c)));
}

/** Check if historyCmd matches or fulfills solutionCmd. */
function matchSolutionCommand(historyCmd: string, solutionCmd: string): boolean {
  const h = normalizeWs(historyCmd);
  const s = normalizeWs(solutionCmd);
  if (h === s) return true;
  if (h.startsWith(`${s} `) || s.startsWith(`${h} `)) return true;

  const hParts = tokenize(h);
  const sParts = tokenize(s);

  if (sParts[0] === 'git' && hParts[0] === 'git') {
    const sSub = sParts[1];
    const hSub = hParts[1];
    if (sSub !== hSub && !(sSub === 'switch' && hSub === 'checkout') && !(sSub === 'checkout' && hSub === 'switch')) {
      return false;
    }

    if (sSub === 'commit') {
      const sm = commitMessageOf(s);
      const hm = commitMessageOf(h);
      if (sm && hm) {
        return hm.toLowerCase().includes(sm.toLowerCase()) || sm.toLowerCase().includes(hm.toLowerCase());
      }
    }

    if (sSub === 'add') {
      const sArgs = sParts.slice(2).filter((a) => !a.startsWith('-'));
      const hArgs = hParts.slice(2).filter((a) => !a.startsWith('-'));
      if (sArgs.includes('.') || hArgs.includes('.')) return true;
      return sArgs.some((a) => hArgs.includes(a));
    }
  }

  return false;
}

function liveStatus(state: RepoState, command: string): SolutionStepStatus {
  const cmd = command.trim();
  const parts = tokenize(cmd);
  const ok = (note: string): SolutionStepStatus => ({ command: cmd, done: true, note });
  const fail = (note: string): SolutionStepStatus => ({ command: cmd, done: false, note });

  if (parts[0] === 'git') {
    const sub = parts[1];
    if (sub === 'init') {
      return state.initialized ? ok('repository initialized') : fail('run git init');
    }
    if (sub === 'status' || sub === 'log' || sub === 'diff' || sub === 'show' || sub === 'reflog') {
      return { command: cmd, done: true, note: `inspect ${sub} (informational)`, optional: true };
    }
    if (sub === 'add') {
      const target = parts[2];
      if (target === '.' || target === '-A') {
        return stagedPaths(state).length > 0 ? ok('files staged') : fail('stage files');
      }
      if (target && state.files[target]) {
        return state.files[target].staged || state.files[target].tracked
          ? ok(`${target} staged`)
          : fail(`stage ${target}`);
      }
      return stagedPaths(state).length > 0 ? ok('staged') : fail('stage changes');
    }
    if (sub === 'commit') {
      const msg = commitMessageOf(cmd);
      if (msg) {
        const found = state.commits.some((c) => c.message.toLowerCase().includes(msg.toLowerCase()));
        return found ? ok(`committed "${msg}"`) : fail(`commit with message "${msg}"`);
      }
      return state.commits.length > 0 ? ok('committed') : fail('commit changes');
    }
    if (sub === 'branch') {
      if (parts[2] === '-d' || parts[2] === '-D') {
        const name = parts[3];
        const exists = state.branches.some((b) => b.name === name);
        return !exists ? ok(`deleted branch ${name}`) : fail(`delete branch ${name}`);
      }
      const name = parts[2];
      if (name) {
        const exists = state.branches.some((b) => b.name === name);
        return exists ? ok(`branch "${name}" exists`) : fail(`create branch "${name}"`);
      }
      return { command: cmd, done: true, note: 'inspect branches', optional: true };
    }
    if (sub === 'switch' || sub === 'checkout') {
      const name = parts[parts.length - 1];
      if (name && (name === state.HEAD || state.detachedHead)) {
        return ok(`checked out ${name}`);
      }
      return fail(`switch to ${name}`);
    }
    if (sub === 'merge') {
      if (parts.includes('--abort')) {
        return !state.merging ? ok('merge aborted') : fail('abort merge');
      }
      const name = parts.find((a) => !a.startsWith('-') && a !== 'git' && a !== 'merge');
      if (name) {
        const br = state.branches.find((b) => b.name === name);
        if (br && state.commits.some((c) => c.parents.includes(br.commit) || c.hash === br.commit)) {
          return ok(`merged ${name}`);
        }
      }
      return fail(`merge ${name ?? 'branch'}`);
    }
    if (sub === 'rebase') {
      const name = parts[2];
      return state.rebaseCount && state.rebaseCount > 0 ? ok(`rebased on ${name}`) : fail(`rebase on ${name}`);
    }
    if (sub === 'cherry-pick') {
      return state.cherryPickCount > 0 ? ok('commit cherry-picked') : fail('cherry-pick commit');
    }
    if (sub === 'tag') {
      const name = parts.find((a) => !a.startsWith('-') && a !== 'git' && a !== 'tag');
      if (name) {
        return state.tags.some((t) => t.name === name) ? ok(`tag "${name}" exists`) : fail(`create tag "${name}"`);
      }
      return { command: cmd, done: true, note: 'list tags', optional: true };
    }
    if (sub === 'remote') {
      const name = parts[3];
      if (name) {
        return state.remotes.some((r) => r.name === name) ? ok(`remote "${name}" configured`) : fail(`add remote "${name}"`);
      }
      return { command: cmd, done: true, note: 'list remotes', optional: true };
    }
    if (sub === 'push') {
      return state.pushCount > 0 ? ok('pushed to remote') : fail('push to remote');
    }
    if (sub === 'pull' || sub === 'fetch') {
      return state.fetchCount > 0 ? ok('pulled/fetched from remote') : fail('pull from remote');
    }
    if (sub === 'stash') {
      if (parts[2] === 'pop') {
        return state.stash.length === 0 ? ok('stash popped') : fail('pop stash');
      }
      return state.stash.length > 0 ? ok('changes stashed') : fail('stash changes');
    }
    if (sub === 'restore') {
      const p = parts[parts.length - 1];
      if (parts.includes('--staged')) {
        return state.files[p]?.staged === false ? ok(`unstage ${p}`) : fail(`unstage ${p}`);
      }
      return state.files[p]?.dirty === false ? ok(`restore ${p}`) : fail(`restore ${p}`);
    }
  }

  if (parts[0] === 'edit') {
    const p = parts[1];
    return state.files[p]?.dirty ? ok(`edited ${p}`) : fail(`edit ${p}`);
  }

  return fail(cmd);
}

function stepStatus(state: RepoState, command: string): SolutionStepStatus {
  const cmd = command.trim();
  const live = liveStatus(state, cmd);
  if (live.done || live.optional) return live;

  const ran = commandInHistory(state, (h) => matchSolutionCommand(h, cmd));
  if (ran) {
    return { command: cmd, done: true, note: 'already completed earlier' };
  }
  return live;
}

export function solutionProgress(state: RepoState, solution: string[]): SolutionStepStatus[] {
  return solution.map((cmd) => stepStatus(state, cmd));
}

export function solutionComplete(state: RepoState, solution: string[]): boolean {
  return solutionProgress(state, solution).every((s) => s.done || s.optional);
}

export function goalChecklist(state: RepoState, level: LevelDef): SolutionStepStatus[] {
  return solutionProgress(state, level.solution);
}

export function suggestFromSolution(state: RepoState, level: LevelDef | null): string | null {
  if (!level) return null;
  const steps = solutionProgress(state, level.solution);
  const next = steps.find((s) => !s.done && !s.optional);
  return next?.command ?? null;
}
