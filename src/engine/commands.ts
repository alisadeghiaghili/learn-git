/**
 * Command interpreter for the LearnGit simulator.
 * Covers core git porcelain commands plus workspace simulators.
 */

import type { CommandResult, RepoState, WorkspaceFile } from './types';
import {
  addCommit,
  applyDataEdit,
  buildTreeFromIndex,
  cloneState,
  computeDirtyPaths,
  currentTip,
  ensureBranch,
  isClean,
  makeFile,
  parseMessageArg,
  removeWorkspaceFile,
  restoreFileFromHead,
  stagedPaths,
  unstagedPaths,
  untrackedPaths,
} from './state';
import { shortSha } from './hash';
import { formatConcepts, findConcept } from './glossary';
import { formatCurriculum } from './teach';
import { FIELD_NOTES, whyFor, formatWhy } from './coach';
import { solutionCommands, allLevelSummaries } from './solution';

export interface ExecContext {
  state: RepoState;
  levelId?: string;
  goalText?: string;
  solution?: string[];
  hint?: string;
  /** Level intro markdown for the `lesson` meta command. */
  lesson?: string;
  disabled?: string[];
}

function ok(output: string, effect: CommandResult['effect'] = 'none'): CommandResult {
  return { ok: true, output, effect };
}

function fail(error: string): CommandResult {
  return { ok: false, output: '', error };
}

function matchPath(state: RepoState, spec: string): string[] {
  if (spec === '.' || spec === './') {
    return Object.values(state.files).map((f) => f.path);
  }
  if (spec === '-A' || spec === '--all') {
    return Object.values(state.files).map((f) => f.path);
  }
  if (state.files[spec]) return [spec];
  // prefix / directory match
  const prefix = spec.endsWith('/') ? spec : `${spec}/`;
  const hits = Object.values(state.files)
    .map((f) => f.path)
    .filter((p) => p.startsWith(prefix) || p === spec);
  return hits.length ? hits : spec ? [spec] : [];
}

function ensureFile(state: RepoState, path: string): WorkspaceFile {
  if (!state.files[path]) {
    state.files[path] = makeFile(path, path.endsWith('.md') ? 'docs' : path.endsWith('.yaml') || path.endsWith('.yml') || path.endsWith('.json') ? 'config' : 'code', {
      tracked: false,
    });
  }
  return state.files[path];
}

function statusLines(state: RepoState): string[] {
  const lines: string[] = [];
  lines.push(`On branch ${state.detachedHead ? `(detached at ${shortSha(currentTip(state))})` : state.HEAD}`);
  if (!state.initialized) {
    return ['fatal: not a git repository (run `git init`)'];
  }
  if (state.merging) {
    lines.push(`You have unmerged paths.`);
    lines.push(`  (fix conflicts and run "git commit")`);
    lines.push(`  (use "git merge --abort" to abort the merge)`);
    lines.push('');
    if (state.conflicts.length) {
      lines.push('Unmerged paths:');
      for (const p of state.conflicts) {
        lines.push(`\tboth modified:\t${p}`);
      }
      lines.push('');
    }
  }
  const staged = stagedPaths(state);
  const unstaged = unstagedPaths(state).filter((p) => !staged.includes(p) && !state.conflicts.includes(p));
  const untracked = untrackedPaths(state);

  if (!staged.length && !unstaged.length && !untracked.length && !state.conflicts.length) {
    lines.push('nothing to commit, working tree clean');
    return lines;
  }
  if (staged.length) {
    lines.push('Changes to be committed:');
    for (const p of staged) {
      const f = state.files[p];
      const kind = f?.deleted ? 'deleted:' : f?.headBlob ? 'modified:' : 'new file:';
      lines.push(`\t${kind}\t${p}`);
    }
    lines.push('');
  }
  if (unstaged.length) {
    lines.push('Changes not staged for commit:');
    for (const p of unstaged) {
      const f = state.files[p];
      const kind = f?.deleted || !f?.present ? 'deleted:' : f?.tracked ? 'modified:' : 'new file:';
      lines.push(`\t${kind}\t${p}`);
    }
    lines.push('');
  }
  if (untracked.length) {
    lines.push('Untracked files:');
    for (const p of untracked) lines.push(`\t${p}`);
    lines.push('');
  }
  if (staged.length) {
    lines.push('no changes added to commit (use "git add" and/or "git commit -a")');
  }
  return lines;
}

function logLines(state: RepoState, oneline: boolean): string[] {
  if (!state.commits.length) return ['fatal: your current branch does not have any commits yet'];
  const tip = currentTip(state);
  const order: string[] = [];
  const seen = new Set<string>();
  const queue = [tip];
  while (queue.length) {
    const h = queue.shift()!;
    if (!h || seen.has(h)) continue;
    seen.add(h);
    order.push(h);
    const c = state.commits.find((x) => x.hash === h);
    if (c) queue.push(...c.parents);
  }
  return order.map((h) => {
    const c = state.commits.find((x) => x.hash === h)!;
    const marker = h === tip && !state.detachedHead ? ` (${state.HEAD})` : h === tip ? ' (HEAD)' : '';
    if (oneline) return `${shortSha(c.hash)}${marker} ${c.message}`;
    return `commit ${c.hash}${marker}\nAuthor: ${c.author}\nDate:   new Date(${c.timestamp}).toISOString()\n\n    ${c.message}\n`;
  });
}

function diffLines(state: RepoState, staged: boolean): string[] {
  const lines: string[] = [];
  const paths = staged
    ? stagedPaths(state)
    : Object.values(state.files)
        .filter((f) => !f.staged && !f.gitignored && f.present && f.tracked && f.headBlob !== f.contentId)
        .map((f) => f.path);

  if (!paths.length) {
    return [staged ? 'no changes staged' : 'no unstaged changes'];
  }
  for (const p of paths) {
    const f = state.files[p];
    if (!f) continue;
    lines.push(`diff --git a/${p} b/${p}`);
    if (staged) {
      if (!f.headBlob && f.staged) {
        lines.push(`new file mode 100644`);
        lines.push(`--- /dev/null`);
        lines.push(`+++ b/${p}`);
        lines.push(`@@ -0,0 +1 @@`);
        lines.push(`+${p} content ${shortSha(f.contentId)}`);
      } else {
        lines.push(`--- a/${p}`);
        lines.push(`+++ b/${p}`);
        lines.push(`@@ -1 +1 @@`);
        lines.push(`-${p} content ${shortSha(f.headBlob ?? '')}`);
        lines.push(`+${p} content ${shortSha(f.contentId)}`);
      }
    } else {
      lines.push(`--- a/${p}`);
      lines.push(`+++ b/${p}`);
      lines.push(`@@ -1 +1 @@`);
      lines.push(`-${p} content ${shortSha(f.headBlob ?? '')}`);
      lines.push(`+${p} content ${shortSha(f.contentId)}`);
    }
  }
  return lines;
}

function helpText(): string {
  return [
    'LearnGit — teaching simulator (not a real git binary)',
    '',
    'Git commands:',
    '  git init | status | add <path|.> | commit -m "msg" | log [--oneline]',
    '  git diff [--staged] | show [<ref>] | restore <path> | rm <path>',
    '  git branch [<name>] [-d <name>] | switch <name> | checkout <name>',
    '  git merge <branch> [--abort] | rebase <branch> | cherry-pick <hash|branch> | tag <name>',
    '  git remote add <name> <url> | push [-u] [<remote> <branch>] | pull | fetch',
    '  git reset [--soft|--mixed|--hard] <ref> | revert HEAD | stash [pop]',
    '',
    'Conflict flow: git status → edit <path> → git add <path> → git commit',
    '',
    'Workspace simulators:',
    '  edit <path> | rm <path> | cat <path> | ls',
    '',
    'Meta:',
    '  levels | curriculum | concepts | lesson | hint | steps | show solution',
    '  show goal | show concepts [id] | field | why <cmd>',
    '  undo | reset | sandbox | help',
  ].join('\n');
}

export function execCommand(raw: string, ctx: ExecContext): CommandResult {
  const line = raw.trim();
  if (!line) return fail('empty command');
  const parts = tokenize(line);
  const cmd = parts[0];
  const rest = parts.slice(1);
  ctx.state.commandHistory.push(line);

  if (cmd === 'help' || (cmd === 'git' && rest[0] === 'help')) return ok(helpText());
  if (cmd === 'levels') {
    return ok(allLevelSummaries().map((l) => `${l.id.padEnd(16)} ${l.series.padEnd(12)} ${l.name}`).join('\n'));
  }
  if (cmd === 'hint') return ok(ctx.hint ?? 'No hint for this level.');
  if (cmd === 'lesson') return ok(ctx.lesson ?? 'No lesson for this level. Open a level first.');
  if (cmd === 'steps') {
    const sol = ctx.solution ?? solutionCommands(ctx.levelId);
    return ok(
      sol.length
        ? sol.map((c, i) => `${i + 1}. ${c}`).join('\n')
        : 'No solution steps recorded.',
    );
  }
  if (cmd === 'curriculum') return ok(formatCurriculum());
  if (cmd === 'field') return ok(FIELD_NOTES.map((n, i) => `${i + 1}. ${n}`).join('\n'));
  if (cmd === 'why') {
    const target = rest.join(' ');
    const block = whyFor(target) ?? whyFor(`git ${target}`);
    return block ? ok(formatWhy(block)) : fail(`no why-block for "${target}"`);
  }
  if (cmd === 'show' && rest[0] === 'concepts') {
    if (rest[1]) {
      const c = findConcept(rest[1]);
      return c ? ok(`${c.title}\n${c.body}`) : fail(`unknown concept "${rest[1]}"`);
    }
    return ok(formatConcepts());
  }
  if (cmd === 'show' && rest[0] === 'goal') return ok(ctx.goalText ?? 'No goal for this level.');
  if (cmd === 'show' && rest[0] === 'solution') {
    const sol = ctx.solution ?? solutionCommands(ctx.levelId);
    return ok(sol.length ? sol.join('\n') : 'No solution recorded.');
  }

  // Workspace simulators
  if (cmd === 'edit') {
    const path = rest[0];
    if (!path) return fail('usage: edit <path>');
    const f = ensureFile(ctx.state, path);
    if (!f.present) return fail(`edit: ${path}: no such file`);
    applyDataEdit(ctx.state, path);
    f.present = true;
    f.deleted = false;
    f.staged = false;
    return ok(`edited ${path} → blob ${shortSha(f.contentId)}`, 'none');
  }
  if (cmd === 'cat') {
    const path = rest[0];
    if (!path) return fail('usage: cat <path>');
    const f = ctx.state.files[path];
    if (!f || !f.present) return fail(`cat: ${path}: no such file`);
    return ok(`${path} content ${shortSha(f.contentId)}${f.dirty ? ' (modified)' : ''}`);
  }
  if (cmd === 'ls') {
    const paths = Object.values(ctx.state.files)
      .filter((f) => f.present)
      .map((f) => f.path)
      .sort();
    return ok(paths.length ? paths.join('\n') : '(empty)');
  }
  // bare `rm` is a simulator delete; `git rm` handled below
  if (cmd === 'rm' && !isGit(parts)) {
    const path = rest[0];
    if (!path) return fail('usage: rm <path>');
    const okRm = removeWorkspaceFile(ctx.state, path);
    return okRm ? ok(`removed ${path}`, 'none') : fail(`rm: ${path}: no such file`);
  }

  if (cmd !== 'git') {
    return fail(`command not found: ${cmd} (try "help")`);
  }

  const sub = rest[0];
  const args = rest.slice(1);

  if (ctx.disabled?.some((d) => d === sub || d === `git ${sub}`)) {
    return fail(`git ${sub} is disabled in this level`);
  }

  switch (sub) {
    case 'init':
      return gitInit(ctx.state);
    case 'status':
      if (!ctx.state.initialized) {
        return fail('fatal: not a git repository (or any of the parent directories): .git');
      }
      return ok(statusLines(ctx.state).join('\n'));
    case 'add':
      return gitAdd(ctx.state, args);
    case 'commit':
      return gitCommit(ctx.state, args);
    case 'log':
      return ok(logLines(ctx.state, args.includes('--oneline')).join('\n\n').trimEnd());
    case 'diff':
      return ok(diffLines(ctx.state, args.includes('--staged') || args.includes('--cached')).join('\n'));
    case 'show':
      return gitShow(ctx.state, args);
    case 'restore':
      return gitRestore(ctx.state, args);
    case 'rm':
      return gitRm(ctx.state, args);
    case 'branch':
      return gitBranch(ctx.state, args);
    case 'switch':
    case 'checkout':
      return gitSwitch(ctx.state, args, sub === 'checkout');
    case 'merge':
      return gitMerge(ctx.state, args);
    case 'rebase':
      return gitRebase(ctx.state, args);
    case 'cherry-pick':
      return gitCherryPick(ctx.state, args);
    case 'tag':
      return gitTag(ctx.state, args);
    case 'remote':
      return gitRemote(ctx.state, args);
    case 'push':
      return gitPush(ctx.state, args);
    case 'pull':
      return gitPull(ctx.state, args);
    case 'fetch':
      return gitFetch(ctx.state, args);
    case 'reset':
      return gitReset(ctx.state, args);
    case 'revert':
      return gitRevert(ctx.state, args);
    case 'stash':
      return gitStash(ctx.state, args);
    case 'rev-parse':
      return ok(currentTip(ctx.state) || 'fatal: ambiguous argument');
    case 'reflog':
      return ok(
        ctx.state.commits.length
          ? ctx.state.commits
              .slice()
              .reverse()
              .map((c) => `${shortSha(c.hash)} HEAD@{n}: commit: ${c.message}`)
              .join('\n')
          : 'fatal: your current branch does not have any commits yet',
      );
    default:
      return fail(`git: '${sub}' is not a learn-git command`);
  }
}

function isGit(parts: string[]): boolean {
  return parts[0] === 'git';
}

function tokenize(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quote: string | null = null;
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ' ') {
      if (cur) out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur) out.push(cur);
  return out;
}

function gitInit(state: RepoState): CommandResult {
  if (state.initialized) return fail('Reinitialized existing Git repository');
  state.initialized = true;
  if (!state.branches.find((b) => b.name === 'main')) {
    state.branches.push({ name: 'main', commit: '', current: true });
  }
  state.HEAD = 'main';
  state.detachedHead = false;
  return ok('Initialized empty Git repository in /workspace/.git/', 'none');
}

function gitAdd(state: RepoState, args: string[]): CommandResult {
  if (!state.initialized) return fail('fatal: not a git repository');
  const flags = args.filter((a) => a.startsWith('-'));
  const specs = args.filter((a) => !a.startsWith('-'));
  if (!specs.length && !flags.length) return fail('Nothing specified, nothing added.');
  let count = 0;
  const targets = specs.length ? specs.flatMap((s) => matchPath(state, s)) : [];
  const all = specs.includes('.') || specs.includes('./') || flags.includes('-A') || flags.includes('--all') || flags.includes('-u');

  const paths = all
    ? Object.values(state.files).map((f) => f.path)
    : targets;

  for (const p of paths) {
    const f = state.files[p];
    if (!f) {
      state.files[p] = makeFile(p, 'code');
    }
    const file = state.files[p];
    if (!file.present && !file.deleted) {
      // allow staging a deletion of a never-present file? skip
      continue;
    }
    if (file.gitignored) continue;
    file.staged = true;
    file.stagedNew = !file.tracked;
    if (file.deleted) {
      // staged deletion
    } else {
      file.stagedNew = !file.tracked && !file.headBlob;
    }
    if (!state.staging.includes(p)) state.staging.push(p);
    // staging a conflicted path marks it resolved
    if (state.conflicts.includes(p)) {
      state.conflicts = state.conflicts.filter((c) => c !== p);
    }
    count++;
  }
  if (!count) return fail('did not match any files');
  return ok(`staged ${count} path(s)`, 'stage');
}

function gitCommit(state: RepoState, args: string[]): CommandResult {
  if (!state.initialized) return fail('fatal: not a git repository');
  const message = parseMessageArg(args);
  if (!message) return fail('error: switch `m` requires a value (use -m "message")');

  if (state.merging) {
    if (state.conflicts.length) {
      return fail('Committing is not possible because you have unmerged files.\n\t' + state.conflicts.join('\n\t'));
    }
    const staged = stagedPaths(state);
    if (!staged.length && !Object.keys(state.pendingMergeTree ?? {}).length) {
      return fail('nothing added to commit (use "git add" and/or "git commit -a")');
    }
    const ours = state.mergeOurs ?? currentTip(state);
    const theirs = state.mergeTheirs;
    const parents = theirs ? [ours, theirs] : [ours];
    const tree = buildTreeFromIndex(state);
    if (state.pendingMergeTree) {
      for (const [p, blob] of Object.entries(state.pendingMergeTree)) {
        if (!(p in tree)) tree[p] = blob;
      }
    }
    // overlay every present tracked file content
    for (const f of Object.values(state.files)) {
      if (f.staged && !f.deleted) tree[f.path] = f.contentId;
      if (f.staged && f.deleted) delete tree[f.path];
    }
    const commit = addCommit(state, message, tree, parents);
    state.lastCommitMessage = message;
    state.merging = undefined;
    state.pendingMergeTree = undefined;
    state.mergeBase = undefined;
    state.mergeOurs = undefined;
    state.mergeTheirs = undefined;
    state.conflictsResolvedCount++;
    for (const f of Object.values(state.files)) {
      if (f.deleted) {
        f.tracked = false;
        f.headBlob = undefined;
        f.staged = false;
        f.present = false;
      } else {
        f.tracked = true;
        f.headBlob = f.contentId;
        f.staged = false;
        f.dirty = false;
      }
    }
    state.staging = [];
    return ok(`[${state.detachedHead ? 'detached' : state.HEAD} ${shortSha(commit.hash)}] ${message}`, 'commit');
  }

  const staged = stagedPaths(state);
  if (!staged.length) {
    // allow empty? teach that it fails
    return fail('nothing added to commit (use "git add" and/or "git commit -a")');
  }

  const parents = state.hasCommits ? [currentTip(state)] : [];
  const tree = buildTreeFromIndex(state);
  const commit = addCommit(state, message, tree, parents);
  state.lastCommitMessage = message;

  for (const p of staged) {
    const f = state.files[p];
    if (!f) continue;
    if (f.deleted) {
      f.tracked = false;
      f.headBlob = undefined;
      f.staged = false;
      f.present = false;
    } else {
      f.tracked = true;
      f.headBlob = f.contentId;
      f.staged = false;
      f.dirty = false;
    }
  }
  state.staging = [];
  return ok(`[${(state.detachedHead ? 'detached' : state.HEAD)} ${shortSha(commit.hash)}] ${message}`, 'commit');
}

function gitShow(state: RepoState, args: string[]): CommandResult {
  const ref = args.find((a) => !a.startsWith('-')) ?? 'HEAD';
  const byName = (name: string) =>
    state.commits.find((c) => c.hash === name) ??
    state.commits.find((c) => c.hash.startsWith(name)) ??
    (name === 'HEAD' ? state.commits.find((c) => c.hash === currentTip(state)) : undefined);
  let commit = byName(ref);
  if (!commit) {
    const tag = state.tags.find((t) => t.name === ref);
    if (tag) commit = state.commits.find((c) => c.hash === tag.commit);
  }
  if (!commit) return fail(`fatal: bad revision '${ref}'`);
  const files = Object.keys(commit.tree).sort();
  return ok(
    [
      `commit ${commit.hash}`,
      `Author: ${commit.author}`,
      `Parents: ${commit.parents.join(' ') || '(none)'}`,
      '',
      `    ${commit.message}`,
      '',
      `tree: ${files.length} file(s)`,
      ...files.map((p) => `  ${p} → ${shortSha(commit.tree[p])}`),
    ].join('\n'),
  );
}

function gitRestore(state: RepoState, args: string[]): CommandResult {
  const paths = args.filter((a) => !a.startsWith('-'));
  if (!paths.length) return fail('usage: git restore <path>');
  let n = 0;
  for (const spec of paths) {
    for (const p of matchPath(state, spec)) {
      if (restoreFileFromHead(state, p)) n++;
    }
  }
  return n ? ok(`restored ${n} path(s) from HEAD`) : fail('pathspec did not match any file(s) known to git');
}

function gitRm(state: RepoState, args: string[]): CommandResult {
  const paths = args.filter((a) => !a.startsWith('-'));
  if (!paths.length) return fail('usage: git rm <path>');
  let n = 0;
  for (const spec of paths) {
    for (const p of matchPath(state, spec)) {
      const f = state.files[p];
      if (!f || !f.tracked) continue;
      f.present = false;
      f.deleted = true;
      f.staged = true;
      if (!state.staging.includes(p)) state.staging.push(p);
      n++;
    }
  }
  return n ? ok(`rm '${paths.join("'\nrm '")}'`, 'stage') : fail("fatal: pathspec did not match any files");
}

function gitBranch(state: RepoState, args: string[]): CommandResult {
  if (!state.initialized) return fail('fatal: not a git repository');
  const deleteIdx = args.findIndex((a) => a === '-d' || a === '-D' || a === '--delete');
  if (deleteIdx >= 0) {
    const name = args[deleteIdx + 1];
    if (!name) return fail('fatal: branch name required');
    if (name === state.HEAD) return fail(`error: cannot delete branch '${name}' checked out at HEAD`);
    const i = state.branches.findIndex((b) => b.name === name);
    if (i < 0) return fail(`error: branch '${name}' not found.`);
    state.branches.splice(i, 1);
    return ok(`Deleted branch ${name}.`);
  }

  const name = args.find((a) => !a.startsWith('-'));
  if (!name) {
    return ok(
      state.branches
        .map((b) => `${b.name === state.HEAD && !state.detachedHead ? '* ' : '  '}${b.name}${b.upstream ? ` → ${b.upstream}` : ''}`)
        .join('\n') || '  (no branches)',
    );
  }
  if (!state.hasCommits) return fail('fatal: not a valid object name');
  if (state.branches.some((b) => b.name === name)) return fail(`fatal: a branch named '${name}' already exists`);
  ensureBranch(state, name, currentTip(state));
  return ok(`Created branch ${name} at ${shortSha(currentTip(state))}`, 'branch');
}

function gitSwitch(state: RepoState, args: string[], _isCheckout: boolean): CommandResult {
  if (!state.initialized) return fail('fatal: not a git repository');
  const create = args.some((a) => a === '-c' || a === '-b' || a === '--create');
  const name = args.find((a) => !a.startsWith('-'));
  if (!name) return fail('fatal: missing branch or commit argument');

  if (create) {
    if (state.branches.some((b) => b.name === name)) return fail(`fatal: a branch named '${name}' already exists`);
    if (!state.hasCommits) return fail('fatal: not a valid object name');
    ensureBranch(state, name, currentTip(state));
  }

  const br = state.branches.find((b) => b.name === name);
  if (br) {
    // refuse if dirty tracked files would be lost — soft: warn but allow if only untracked
    const dirty = computeDirtyPaths(state).filter((p) => state.files[p]?.tracked);
    if (dirty.length) {
      return fail(`error: Your local changes to the following files would be overwritten by checkout:\n\t${dirty.join('\n\t')}\nPlease commit your changes or stash them before you switch.`);
    }
    state.HEAD = name;
    state.detachedHead = false;
    for (const b of state.branches) b.current = b.name === name;
    applyTree(state, br.commit);
    return ok(`Switched to branch '${name}'`, 'branch');
  }

  // maybe a commit hash / HEAD~n
  const commit = findCommitByRef(state, name);
  if (commit) {
    state.HEAD = commit.hash;
    state.detachedHead = true;
    for (const b of state.branches) b.current = false;
    applyTree(state, commit.hash);
    return ok(`Note: switching to '${name}'.\n\nYou are in 'detached HEAD' state...`, 'branch');
  }
  return fail(`error: pathspec '${name}' did not match any file(s) known to git`);
}

function applyTree(state: RepoState, commitHash: string): void {
  const commit = state.commits.find((c) => c.hash === commitHash);
  if (!commit) return;
  // Restore tracked files to tree; leave untracked alone
  for (const f of Object.values(state.files)) {
    if (f.gitignored) continue;
    const blob = commit.tree[f.path];
    if (blob != null) {
      f.tracked = true;
      f.headBlob = blob;
      f.contentId = blob;
      f.present = true;
      f.deleted = false;
      f.dirty = false;
      f.staged = false;
    } else if (f.tracked) {
      // file not in this tree — remove if it was tracked
      f.tracked = false;
      f.headBlob = undefined;
      f.present = false;
      f.deleted = false;
      f.staged = false;
    }
  }
  state.staging = state.staging.filter((p) => state.files[p]?.staged);
}

function ancestorsOf(state: RepoState, hash: string): Set<string> {
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

function mergeBaseOf(state: RepoState, a: string, b: string): string | undefined {
  const aAnc = ancestorsOf(state, a);
  const queue = [b];
  const seen = new Set<string>();
  while (queue.length) {
    const h = queue.shift()!;
    if (!h || seen.has(h)) continue;
    seen.add(h);
    if (aAnc.has(h)) return h;
    const c = state.commits.find((x) => x.hash === h);
    if (c) queue.push(...c.parents);
  }
  return undefined;
}

function findCommitByRef(state: RepoState, ref: string) {
  const headParent = resolveHeadParent(state, ref);
  if (headParent && (ref === 'HEAD' || ref.startsWith('HEAD~'))) {
    return state.commits.find((c) => c.hash === headParent);
  }
  return (
    state.commits.find((c) => c.hash === ref || c.hash.startsWith(ref)) ??
    (() => {
      const br = state.branches.find((b) => b.name === ref);
      return br ? state.commits.find((c) => c.hash === br.commit) : undefined;
    })() ??
    (() => {
      const tag = state.tags.find((t) => t.name === ref);
      return tag ? state.commits.find((c) => c.hash === tag.commit) : undefined;
    })()
  );
}

function gitMerge(state: RepoState, args: string[]): CommandResult {
  if (!state.initialized || !state.hasCommits) return fail('fatal: not a git repository (or no commits yet)');
  if (args.includes('--abort')) {
    if (!state.merging) return fail('fatal: There is no merge to abort (MERGE_HEAD missing).');
    const ours = state.mergeOurs ?? currentTip(state);
    state.merging = undefined;
    state.conflicts = [];
    state.mergeBase = undefined;
    state.mergeOurs = undefined;
    state.mergeTheirs = undefined;
    applyTree(state, ours);
    return ok('MERGE_HEAD removed.\n\nMerge aborted.', 'none');
  }
  const name = args.find((a) => !a.startsWith('-'));
  if (!name) return fail('fatal: missing branch argument');
  const br = state.branches.find((b) => b.name === name);
  if (!br) return fail(`merge: ${name} - not something we can merge`);
  if (state.merging) return fail('fatal: You have not concluded your merge (MERGE_HEAD exists).');

  const headTip = currentTip(state);
  if (br.commit === headTip) return ok('Already up to date.');

  // Fast-forward if br is descendant of headTip
  const ancestors = ancestorsOf(state, br.commit);
  if (ancestors.has(headTip)) {
    const brCur = state.branches.find((b) => b.name === state.HEAD && !state.detachedHead);
    if (brCur) brCur.commit = br.commit;
    applyTree(state, br.commit);
    return ok(`Updating ${shortSha(headTip)}..${shortSha(br.commit)}\nFast-forward`, 'commit');
  }

  const baseHash = mergeBaseOf(state, headTip, br.commit);
  const baseTree = state.commits.find((c) => c.hash === baseHash)?.tree ?? {};
  const ourTree = state.commits.find((c) => c.hash === headTip)?.tree ?? {};
  const theirTree = state.commits.find((c) => c.hash === br.commit)?.tree ?? {};

  const tree: Record<string, string> = { ...ourTree };
  const conflicts: string[] = [];
  const paths = new Set([...Object.keys(ourTree), ...Object.keys(theirTree), ...Object.keys(baseTree)]);
  for (const p of paths) {
    const o = ourTree[p];
    const t = theirTree[p];
    const b = baseTree[p];
    if (o === t) {
      if (o != null) tree[p] = o;
      else delete tree[p];
      continue;
    }
    if (o === b) {
      if (t != null) tree[p] = t;
      else delete tree[p];
      continue;
    }
    if (t === b) {
      if (o != null) tree[p] = o;
      else delete tree[p];
      continue;
    }
    conflicts.push(p);
    // keep ours in the draft tree; workspace file will hold the conflict marker
    if (o != null) tree[p] = o;
    else delete tree[p];
  }

  if (conflicts.length) {
    state.merging = name;
    state.conflicts = [...conflicts].sort();
    state.mergeBase = baseHash;
    state.mergeOurs = headTip;
    state.mergeTheirs = br.commit;
    state.pendingMergeTree = tree;
    for (const p of conflicts) {
      const f = state.files[p] ?? makeFile(p, 'code');
      state.files[p] = f;
      f.present = true;
      f.deleted = false;
      f.tracked = true;
      f.headBlob = ourTree[p];
      f.contentId = `conflict-${p}`;
      f.dirty = true;
      f.staged = false;
    }
    state.staging = [];
    return {
      ok: false,
      output: [
        `Auto-merging ${conflicts.join(', ')}`,
        ...conflicts.map((p) => `CONFLICT (content): Merge conflict in ${p}`),
        'Automatic merge failed; fix conflicts and then commit the result.',
      ].join('\n'),
      error: `Automatic merge failed; fix conflicts and then commit the result.`,
    };
  }

  // True merge, no conflicts
  const commit = addCommit(state, `Merge branch '${name}'`, tree, [headTip, br.commit]);
  state.merging = undefined;
  state.pendingMergeTree = undefined;
  applyTree(state, commit.hash);
  return ok(`Merge made by the 'ort' strategy.\n${shortSha(commit.hash)} Merge branch '${name}'`, 'commit');
}

function gitRebase(state: RepoState, args: string[]): CommandResult {
  if (!state.initialized || !state.hasCommits) return fail('fatal: not a git repository');
  const name = args.find((a) => !a.startsWith('-'));
  if (!name) return fail('fatal: missing branch argument');
  const onto = state.branches.find((b) => b.name === name);
  if (!onto) return fail(`fatal: invalid upstream '${name}'`);

  const headTip = currentTip(state);
  if (headTip === onto.commit) return ok('Current branch is up to date.');

  // Rebuild: replay current commits not in onto onto onto.commit (simplified linear rebase)
  const ontoAnc = ancestorsOf(state, onto.commit);
  const mine: string[] = [];
  let h: string | undefined = headTip;
  while (h && !ontoAnc.has(h)) {
    mine.unshift(h);
    h = state.commits.find((c) => c.hash === h)?.parents[0];
  }

  let base = onto.commit;
  for (const oldHash of mine) {
    const c = state.commits.find((x) => x.hash === oldHash)!;
    const nc = addCommit(state, c.message, { ...c.tree }, [base]);
    base = nc.hash;
  }

  const brCur = state.branches.find((b) => b.name === state.HEAD && !state.detachedHead);
  if (brCur) brCur.commit = base;
  state.rebasedFrom = name;
  state.rebaseCount = (state.rebaseCount ?? 0) + 1;
  applyTree(state, base);
  return ok(`Successfully rebased and updated refs/heads/${state.HEAD}.`, 'commit');
}

function gitCherryPick(state: RepoState, args: string[]): CommandResult {
  if (!state.initialized || !state.hasCommits) return fail('fatal: not a git repository');
  const ref = args.find((a) => !a.startsWith('-'));
  if (!ref) return fail('fatal: bad revision');
  const src = findCommitByRef(state, ref);
  if (!src) return fail(`fatal: bad revision '${ref}'`);
  const parents = state.hasCommits ? [currentTip(state)] : [];
  const nc = addCommit(state, src.message, { ...src.tree }, parents);
  state.cherryPickCount++;
  applyTree(state, nc.hash);
  return ok(`[${state.detachedHead ? 'detached' : state.HEAD} ${shortSha(nc.hash)}] ${src.message}`, 'commit');
}

function gitTag(state: RepoState, args: string[]): CommandResult {
  if (!state.initialized || !state.hasCommits) return fail('fatal: not a git repository');
  const name = args.find((a) => !a.startsWith('-'));
  if (!name) {
    return ok(state.tags.map((t) => `  ${t.name}${t.annotated ? ' (annotated)' : ''}`).join('\n') || '  (no tags)');
  }
  if (state.tags.some((t) => t.name === name)) return fail(`fatal: tag '${name}' already exists`);
  const annotated = args.includes('-a') || args.includes('-m');
  const message = parseMessageArg(args);
  state.tags.push({
    name,
    commit: currentTip(state),
    annotated,
    message,
  });
  return ok(annotated ? `Tagged ${name} (annotated)` : `Tagged ${name}`, 'none');
}

function gitRemote(state: RepoState, args: string[]): CommandResult {
  const sub = args[0];
  if (!sub) {
    return ok(state.remotes.map((r) => r.name).join('\n') || '  (no remotes)');
  }
  if (sub === 'add') {
    const name = args[1];
    const url = args[2];
    if (!name || !url) return fail('usage: git remote add <name> <url>');
    if (state.remotes.some((r) => r.name === name)) return fail(`fatal: remote ${name} already exists.`);
    state.remotes.push({ name, url });
    return ok(`added remote ${name} → ${url}`, 'none');
  }
  if (sub === 'remove' || sub === 'rm') {
    const name = args[1];
    const i = state.remotes.findIndex((r) => r.name === name);
    if (i < 0) return fail(`fatal: No such remote: ${name}`);
    state.remotes.splice(i, 1);
    state.remoteBranches = state.remoteBranches.filter((r) => r.remote !== name);
    return ok(`removed remote ${name}`);
  }
  return fail(`git remote: '${sub}' is not a learn-git command`);
}

function resolveRemote(state: RepoState, args: string[]): { remoteName: string; branchName: string; setU: boolean } {
  const setU = args.includes('-u') || args.includes('--set-upstream');
  const pos = args.filter((a) => !a.startsWith('-'));
  const remoteName = pos[0] ?? state.remotes[0]?.name ?? 'origin';
  const branchName = pos[1] ?? state.HEAD;
  return { remoteName, branchName, setU };
}

function gitPush(state: RepoState, args: string[]): CommandResult {
  if (!state.initialized || !state.hasCommits) return fail('fatal: not a git repository');
  if (!state.remotes.length) return fail('fatal: No configured push destination.');
  const { remoteName, branchName, setU } = resolveRemote(state, args);
  const remote = state.remotes.find((r) => r.name === remoteName);
  if (!remote) return fail(`fatal: '${remoteName}' does not appear to be a git repository`);

  const br = state.branches.find((b) => b.name === branchName) ?? state.branches.find((b) => b.name === state.HEAD);
  if (!br) return fail('fatal: missing branch');
  const commit = br.commit;

  const name = `${remoteName}/${br.name}`;
  const existing = state.remoteBranches.find((r) => r.name === name);
  if (existing) existing.commit = commit;
  else state.remoteBranches.push({ name, remote: remoteName, branch: br.name, commit });

  if (setU) br.upstream = name;
  state.pushCount++;
  return ok(
    [
      `Enumerating objects: 3, done.`,
      `To ${remote.url}`,
      ` * [new branch]      ${br.name} -> ${br.name}${setU ? `\nbranch '${br.name}' set up to track '${name}'.` : ''}`,
    ].join('\n'),
    'push',
  );
}

function gitFetch(state: RepoState, _args: string[]): CommandResult {
  if (!state.initialized) return fail('fatal: not a git repository');
  if (!state.remotes.length) return fail('fatal: No configured fetch destination.');
  state.fetchCount++;
  // In the simulator, fetch is often a no-op that bumps the counter / refreshes refs
  return ok(`From ${state.remotes[0].url}\n * branch            HEAD       -> FETCH_HEAD`, 'pull');
}

function gitPull(state: RepoState, args: string[]): CommandResult {
  const fetch = gitFetch(state, args);
  if (!fetch.ok) return fetch;
  // integrate: if upstream exists and is ahead, fast-forward
  const br = state.branches.find((b) => b.name === state.HEAD && !state.detachedHead);
  if (br?.upstream) {
    const rb = state.remoteBranches.find((r) => r.name === br.upstream);
    if (rb && rb.commit !== br.commit) {
      const ancestors = ancestorsOf(state, rb.commit);
      if (ancestors.has(br.commit)) {
        br.commit = rb.commit;
        applyTree(state, rb.commit);
        return ok(`${fetch.output}\nUpdating ${br.name} to ${shortSha(rb.commit)}\nFast-forward`, 'pull');
      }
    }
  }
  return ok(`${fetch.output}\nAlready up to date.`, 'pull');
}

function gitReset(state: RepoState, args: string[]): CommandResult {
  if (!state.initialized || !state.hasCommits) return fail('fatal: not a git repository');
  const mode = args.find((a) => a === '--soft' || a === '--mixed' || a === '--hard') ?? '--mixed';
  const ref = args.filter((a) => !a.startsWith('-')).pop() ?? 'HEAD';
  const target =
    ref === 'HEAD'
      ? currentTip(state)
      : ref === 'HEAD~1'
        ? state.commits.find((c) => c.hash === currentTip(state))?.parents[0] ?? currentTip(state)
        : (state.commits.find((c) => c.hash === ref || c.hash.startsWith(ref))?.hash ?? resolveHeadParent(state, ref));

  if (!target) return fail(`fatal: ambiguous argument '${ref}'`);

  const br = state.branches.find((b) => b.name === state.HEAD && !state.detachedHead);
  const prevTip = currentTip(state);

  if (mode === '--soft') {
    if (br) br.commit = target;
    // keep index and worktree — but mark previous commit's files as staged if moving back
    markSoftStaged(state, prevTip, target);
  } else if (mode === '--mixed') {
    if (br) br.commit = target;
    // unstage
    for (const f of Object.values(state.files)) {
      f.staged = false;
    }
    state.staging = [];
    // worktree content stays (dirty vs new HEAD)
    syncHeadBlobs(state, target);
  } else {
    if (br) br.commit = target;
    for (const f of Object.values(state.files)) f.staged = false;
    state.staging = [];
    applyTree(state, target);
  }
  return ok(`HEAD is now at ${shortSha(target)}`, 'reset');
}

function resolveHeadParent(state: RepoState, ref: string): string | undefined {
  const m = /^HEAD(?:~(\d+))?$/.exec(ref);
  if (!m) return undefined;
  const n = m[1] ? Number(m[1]) : 0;
  let h = currentTip(state);
  for (let i = 0; i < n; i++) {
    h = state.commits.find((c) => c.hash === h)?.parents[0] ?? h;
  }
  return h;
}

function markSoftStaged(state: RepoState, fromTip: string, toTip: string): void {
  const from = state.commits.find((c) => c.hash === fromTip);
  const to = state.commits.find((c) => c.hash === toTip);
  if (!from) return;
  for (const [p, blob] of Object.entries(from.tree)) {
    const f = ensureFile(state, p);
    f.staged = true;
    f.contentId = blob;
    f.present = true;
    f.deleted = false;
  }
  // files only in to-tip but deleted in from? rare in simulator
  void to;
  state.staging = stagedPaths(state);
  syncHeadBlobs(state, toTip);
}

function syncHeadBlobs(state: RepoState, commitHash: string): void {
  const commit = state.commits.find((c) => c.hash === commitHash);
  if (!commit) return;
  for (const f of Object.values(state.files)) {
    f.headBlob = commit.tree[f.path];
    f.tracked = f.path in commit.tree;
    f.dirty = f.tracked && f.present && f.headBlob !== f.contentId;
    if (!f.tracked && f.present) {
      // untracked relative to new HEAD
    }
  }
}

function gitRevert(state: RepoState, args: string[]): CommandResult {
  if (!state.initialized || !state.hasCommits) return fail('fatal: not a git repository');
  const ref = args.filter((a) => !a.startsWith('-')).pop() ?? 'HEAD';
  const target =
    ref === 'HEAD'
      ? state.commits.find((c) => c.hash === currentTip(state))
      : state.commits.find((c) => c.hash === ref || c.hash.startsWith(ref));
  if (!target) return fail(`fatal: bad revision '${ref}'`);
  if (!target.parents.length) return fail('error: commit is a root, cannot revert');

  const parent = state.commits.find((c) => c.hash === target.parents[0]);
  const tree = { ...(parent?.tree ?? {}) };
  const nc = addCommit(state, `Revert "${target.message}"`, tree, [currentTip(state)]);
  applyTree(state, nc.hash);
  return ok(`[${state.HEAD} ${shortSha(nc.hash)}] Revert "${target.message}"`, 'commit');
}

function gitStash(state: RepoState, args: string[]): CommandResult {
  if (!state.initialized) return fail('fatal: not a git repository');
  const sub = args[0];
  if (!sub || sub === 'push') {
    const dirty = computeDirtyPaths(state).concat(untrackedPaths(state));
    if (!dirty.length) return fail('No local changes to save');
    const id = `stash@{${state.stash.length}}`;
    const snapshot: StashEntrySnapshot = {};
    const files: Record<string, string> = {};
    for (const p of dirty) {
      const f = state.files[p];
      if (!f) continue;
      snapshot[p] = { contentId: f.contentId, present: f.present, staged: f.staged };
      files[p] = f.contentId;
    }
    state.stash.push({
      id,
      message: `WIP on ${state.HEAD}: ${state.lastCommitMessage ?? 'stash'}`,
      files,
      snapshot,
      branch: state.HEAD,
    });
    // restore worktree to HEAD (clean)
    for (const p of dirty) {
      const f = state.files[p];
      if (!f) continue;
      if (f.tracked && f.headBlob) {
        f.contentId = f.headBlob;
        f.present = true;
        f.deleted = false;
        f.staged = false;
        f.dirty = false;
      } else if (!f.tracked) {
        f.present = false;
      }
    }
    state.staging = [];
    return ok(`Saved working directory and index state ${id}`, 'stash');
  }
  if (sub === 'list') {
    return ok(state.stash.map((s) => `${s.id}: ${s.message}`).join('\n') || 'No stash entries found.');
  }
  if (sub === 'pop' || sub === 'apply') {
    const entry = state.stash[state.stash.length - 1];
    if (!entry) return fail('No stash entries found.');
    for (const [p, snap] of Object.entries(entry.snapshot)) {
      const f = ensureFile(state, p);
      f.contentId = snap.contentId;
      f.present = snap.present;
      f.staged = snap.staged;
      f.dirty = f.tracked && f.headBlob !== f.contentId;
      if (snap.staged && !state.staging.includes(p)) state.staging.push(p);
    }
    if (sub === 'pop') state.stash.pop();
    return ok(`Dropped ${entry.id} (${entry.message})`, 'stash');
  }
  return fail(`git stash: '${sub}' is not a learn-git command`);
}

type StashEntrySnapshot = Record<string, { contentId: string; present: boolean; staged: boolean }>;

/** Run a list of commands (level solution) and return the last failure if any. */
export function runCommands(cmds: string[], ctx: ExecContext): CommandResult | null {
  for (const c of cmds) {
    const r = execCommand(c, ctx);
    if (!r.ok) return r;
  }
  return null;
}

export { cloneState, isClean };
