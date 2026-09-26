import type { FileKind, RepoState, WorkspaceFile, GitCommit, BranchRef } from './types';
import { fakeSha, commitHash } from './hash';

export function emptyState(): RepoState {
  return {
    initialized: false,
    hasCommits: false,
    files: {},
    staging: [],
    commits: [],
    branches: [],
    HEAD: 'main',
    detachedHead: false,
    remotes: [],
    remoteBranches: [],
    tags: [],
    stash: [],
    dataVersions: {},
    gitignore: [],
    commandHistory: [],
    pushCount: 0,
    fetchCount: 0,
    cherryPickCount: 0,
    conflicts: [],
    rebaseCount: 0,
    conflictsResolvedCount: 0,
  };
}

export function cloneState(state: RepoState): RepoState {
  return structuredClone(state);
}

export function makeFile(
  path: string,
  kind: FileKind,
  opts: Partial<WorkspaceFile> = {},
): WorkspaceFile {
  const contentId = opts.contentId ?? fakeSha(`file:${path}:v0`);
  return {
    path,
    kind,
    tracked: false,
    headBlob: undefined,
    dirty: false,
    present: true,
    gitignored: false,
    staged: false,
    ...opts,
    // Always keep a resolved content id (opts may pass undefined explicitly).
    contentId,
  };
}

export function headCommit(state: RepoState): GitCommit | undefined {
  if (!state.commits.length) return undefined;
  const tip = currentTip(state);
  return state.commits.find((c) => c.hash === tip);
}

export function currentTip(state: RepoState): string {
  if (state.detachedHead) return state.HEAD || state.commits[state.commits.length - 1]?.hash || '';
  const br = state.branches.find((b) => b.name === state.HEAD);
  return br?.commit ?? state.commits[state.commits.length - 1]?.hash ?? '';
}

export function currentBranch(state: RepoState): string | undefined {
  if (state.detachedHead) return undefined;
  return state.HEAD;
}

export function isDirtyFile(f: WorkspaceFile | undefined): boolean {
  if (!f || !f.tracked) return f?.present && f?.contentId !== f?.headBlob ? true : !!f && !f.tracked && f.present && !f.gitignored;
  if (f.deleted) return true;
  if (!f.present) return true;
  return f.headBlob !== f.contentId;
}

export function computeDirtyPaths(state: RepoState): string[] {
  return Object.values(state.files)
    .filter((f) => {
      if (f.gitignored) return false;
      if (f.staged) return f.headBlob !== f.contentId || f.deleted;
      if (!f.tracked) return f.present && !f.gitignored;
      if (f.deleted) return true;
      if (!f.present) return true;
      return f.headBlob !== f.contentId;
    })
    .map((f) => f.path)
    .sort();
}

export function unstagedPaths(state: RepoState): string[] {
  return Object.values(state.files)
    .filter((f) => {
      if (f.gitignored) return false;
      if (f.staged) return false;
      if (f.deleted) return true;
      if (!f.tracked) return f.present;
      if (!f.present) return true;
      return f.headBlob !== f.contentId;
    })
    .map((f) => f.path)
    .sort();
}

export function untrackedPaths(state: RepoState): string[] {
  return Object.values(state.files)
    .filter((f) => f.present && !f.tracked && !f.gitignored && !f.staged)
    .map((f) => f.path)
    .sort();
}

export function stagedPaths(state: RepoState): string[] {
  return Object.values(state.files)
    .filter((f) => f.staged)
    .map((f) => f.path)
    .sort();
}

export function isClean(state: RepoState): boolean {
  return computeDirtyPaths(state).length === 0 && untrackedPaths(state).length === 0;
}

export function addCommit(
  state: RepoState,
  message: string,
  tree: Record<string, string>,
  parents: string[],
): GitCommit {
  const hash = commitHash(`${message}|${Object.keys(tree).join(',')}|${parents.join(',')}|${state.commits.length}`);
  const commit: GitCommit = {
    hash,
    message,
    parents: [...parents],
    tree: { ...tree },
    author: 'Learner <learner@learngit.local>',
    timestamp: 1_700_000_000_000 + state.commits.length * 86_400_000,
  };
  state.commits.push(commit);
  state.hasCommits = true;
  if (state.detachedHead) {
    // detached HEAD advances to the new commit (no branch pointer moves)
    state.HEAD = hash;
  } else {
    const br = state.branches.find((b) => b.name === state.HEAD);
    if (br) br.commit = hash;
    else state.branches.push({ name: state.HEAD, commit: hash, current: true });
  }
  // Sync current flags
  for (const b of state.branches) b.current = !state.detachedHead && b.name === state.HEAD;
  return commit;
}

export function buildTreeFromIndex(state: RepoState): Record<string, string> {
  const tip = currentTip(state);
  const parent = state.commits.find((c) => c.hash === tip);
  const tree: Record<string, string> = { ...(parent?.tree ?? {}) };
  for (const f of Object.values(state.files)) {
    if (f.staged) {
      if (f.deleted) {
        delete tree[f.path];
      } else {
        tree[f.path] = f.contentId;
      }
    }
  }
  return tree;
}

export function applyDataEdit(state: RepoState, path: string): boolean {
  const f = state.files[path];
  if (!f || !f.present) return false;
  const v = (state.dataVersions[path] ?? 0) + 1;
  state.dataVersions[path] = v;
  f.contentId = fakeSha(`file:${path}:v${v}`);
  f.dirty = f.tracked && f.headBlob !== f.contentId;
  f.staged = false;
  return true;
}

export function removeWorkspaceFile(state: RepoState, path: string): boolean {
  const f = state.files[path];
  if (!f || !f.present) return false;
  f.present = false;
  f.deleted = true;
  f.staged = false;
  f.dirty = true;
  return true;
}

export function restoreFileFromHead(state: RepoState, path: string): boolean {
  const f = state.files[path];
  if (!f || !f.tracked || !f.headBlob) return false;
  f.present = true;
  f.deleted = false;
  f.contentId = f.headBlob;
  f.dirty = false;
  f.staged = false;
  return true;
}

export function ensureBranch(state: RepoState, name: string, commit: string): BranchRef {
  const existing = state.branches.find((b) => b.name === name);
  if (existing) return existing;
  const br: BranchRef = { name, commit, current: false };
  state.branches.push(br);
  return br;
}

export function sandboxState(): RepoState {
  const state = emptyState();
  state.initialized = true;
  state.hasCommits = true;
  state.files = {
    'src/app.py': makeFile('src/app.py', 'code'),
    'README.md': makeFile('README.md', 'docs'),
    'config.yaml': makeFile('config.yaml', 'config'),
  };
  state.branches = [{ name: 'main', commit: 'a1b2c3d', current: true }];
  state.HEAD = 'main';
  state.commits = [
    {
      hash: 'a1b2c3d',
      message: 'Initial commit',
      parents: [],
      tree: {
        'src/app.py': state.files['src/app.py'].contentId,
        'README.md': state.files['README.md'].contentId,
      },
      author: 'Learner <learner@learngit.local>',
      timestamp: 1_700_000_000_000,
    },
  ];
  for (const f of Object.values(state.files)) {
    if (f.path !== 'config.yaml') {
      f.tracked = true;
      f.headBlob = f.contentId;
    }
  }
  state.files['config.yaml'].tracked = false;
  return state;
}

export function parseMessageArg(args: string[]): string | undefined {
  // Prefer -m "message" / --message "message"
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-m' || a === '--message') {
      return args[i + 1];
    }
    if (a.startsWith('--message=')) {
      return a.slice('--message='.length);
    }
  }
  return undefined;
}

export function extractPathSpecs(args: string[]): string[] {
  return args.filter((a) => !a.startsWith('-') && a !== '-m' && a !== '--message');
}
