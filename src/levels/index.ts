/** Level packs for LearnGit. */

import type { LevelDef, RepoState } from '../engine/types';
import { emptyState, makeFile, addCommit, ensureBranch } from '../engine/state';
import { registerLevels } from '../engine/solution';

function baseWithFiles(
  files: Record<string, { kind: Parameters<typeof makeFile>[1]; tracked?: boolean; content?: string }>,
  opts: { commits?: number; init?: boolean; branch?: string } = {},
): RepoState {
  const state = emptyState();
  state.initialized = opts.init !== false;
  const branchName = opts.branch ?? 'main';
  state.HEAD = branchName;
  state.branches = [{ name: branchName, commit: '', current: true }];
  const fileMap: RepoState['files'] = {};
  for (const [path, meta] of Object.entries(files)) {
    fileMap[path] = makeFile(path, meta.kind, {
      contentId: meta.content ? `blob-${path}-v0` : undefined,
      tracked: meta.tracked !== false,
    });
  }
  state.files = fileMap;

  const n = opts.commits ?? 0;
  if (n > 0) {
    state.hasCommits = true;
    const tree: Record<string, string> = {};
    for (const f of Object.values(fileMap)) {
      if (f.tracked) {
        tree[f.path] = f.contentId;
        f.headBlob = f.contentId;
      }
    }
    let parent: string[] = [];
    for (let i = 0; i < n; i++) {
      const msg = i === 0 ? 'Initial commit' : `Update files (${i})`;
      const c = addCommit(state, msg, { ...tree }, parent);
      parent = [c.hash];
    }
    const br = state.branches[0];
    br.commit = state.commits[state.commits.length - 1].hash;
  }
  return state;
}

/* ───────────────────────────── BASICS ───────────────────────────── */

const basicsInit: LevelDef = {
  id: 'basics-init',
  series: 'Basics',
  seriesTitle: 'Basics',
  name: 'Initialize a repository',
  difficulty: 1,
  par: 1,
  objective: 'Create an empty Git repository in the working directory.',
  learning: ['three-area', 'head'],
  fieldNotes: ['Run git init once per project root. Nested repos confuse tooling and CI.'],
  hint: 'The command is `git init`. Then check `git status` if you want.',
  startDialog: [
    {
      title: 'Welcome to Git',
      markdown:
        'Git tracks **snapshots**, not diffs. Before any of that, you need a repository.\n\nThis level is one command: create the `.git` directory.',
    },
  ],
  startState: (() => {
    const s = baseWithFiles(
      { 'src/app.py': { kind: 'code', tracked: false } },
      { init: false, commits: 0 },
    );
    s.initialized = false;
    s.branches = [];
    s.HEAD = 'main';
    return s;
  })(),
  goal: { kind: 'initialized', value: true },
  solution: ['git init'],
};

const basicsAddCommit: LevelDef = {
  id: 'basics-add-commit',
  series: 'Basics',
  seriesTitle: 'Basics',
  name: 'Stage and commit',
  difficulty: 1,
  par: 3,
  objective: 'Stage the new file and create a commit whose message mentions "add app".',
  learning: ['three-area', 'index', 'commit'],
  fieldNotes: [
    'Stage deliberately. `git add .` is fine at the start of a project; later, prefer explicit paths or `git add -p`.',
    'Commit messages explain *why*. "add app" is enough for this exercise — make it a sentence in real work.',
  ],
  hint: 'Try `git status`, then `git add src/app.py` (or `.`), then `git commit -m "add app"`.',
  startDialog: [
    {
      title: 'Three areas',
      markdown:
        'A file can live in three places at once:\n\n1. **Working tree** — what you edit\n2. **Staging (index)** — draft of the next commit\n3. **Repository** — permanent snapshots\n\n`git add` moves content into the index. `git commit` freezes the index into a commit.',
    },
  ],
  startState: baseWithFiles(
    {
      'src/app.py': { kind: 'code', tracked: false },
    },
    { init: true, commits: 0 },
  ),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'committedMessageIncludes', text: 'add app', requireFilesAny: ['src/app.py'] },
      { kind: 'clean' },
    ],
  },
  solution: ['git add src/app.py', 'git commit -m "add app"'],
};

const basicsEditAddCommit: LevelDef = {
  id: 'basics-edit-add-commit',
  series: 'Basics',
  seriesTitle: 'Basics',
  name: 'Modify, stage, commit again',
  difficulty: 2,
  par: 4,
  objective: 'Edit README.md, stage it, and commit with a message that includes "update readme".',
  learning: ['three-area', 'index', 'commit'],
  fieldNotes: ['Never mix a bugfix and a rename in one commit. Review `git diff --staged` before you commit.'],
  hint: 'Use `edit README.md` to dirty the file, then `git add README.md` and `git commit -m "update readme"`.',
  startDialog: [
    {
      title: 'The second commit',
      markdown:
        'Your first commit is a snapshot. When you change a file, the working tree is **dirty** relative to HEAD.\n\nStage and commit again to create a new snapshot. History is a linked list of trees.',
    },
  ],
  startState: baseWithFiles(
    {
      'README.md': { kind: 'docs' },
      'src/app.py': { kind: 'code' },
    },
    { init: true, commits: 1 },
  ),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'committedMessageIncludes', text: 'update readme', requireFilesAny: ['README.md'] },
      { kind: 'clean' },
    ],
  },
  solution: ['edit README.md', 'git add README.md', 'git commit -m "update readme"'],
};

const basicsStatusLog: LevelDef = {
  id: 'basics-status-log',
  series: 'Basics',
  seriesTitle: 'Basics',
  name: 'Read status and log',
  difficulty: 1,
  par: 3,
  objective: 'Create a commit that includes "checkpoint", then inspect history with git log.',
  learning: ['commit', 'porcelain'],
  fieldNotes: ['`git log --oneline --graph --decorate` is the daily driver. Learn three flags well.'],
  hint: 'edit a file, `git add .`, `git commit -m "checkpoint"`, then `git log --oneline`.',
  startDialog: [
    {
      title: 'Status is a map, log is a timeline',
      markdown:
        '`git status` tells you where each file sits across the three areas.\n`git log` walks the commit DAG from HEAD.\n\nTogether they answer: *where am I, and how did I get here?*',
    },
  ],
  startState: baseWithFiles(
    {
      'src/app.py': { kind: 'code' },
      'notes.txt': { kind: 'docs', tracked: false },
    },
    { init: true, commits: 1 },
  ),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'committedMessageIncludes', text: 'checkpoint' },
      { kind: 'commitCount', min: 2 },
    ],
  },
  solution: ['edit src/app.py', 'git add .', 'git commit -m "checkpoint"', 'git log --oneline'],
};

/* ───────────────────────────── DIFF ───────────────────────────── */

const diffUnstaged: LevelDef = {
  id: 'diff-unstaged',
  series: 'Diff & Show',
  seriesTitle: 'Diff & Show',
  name: 'See unstaged changes',
  difficulty: 2,
  par: 3,
  objective: 'Edit config.yaml and show the unstaged diff (do not commit yet). Leave the file dirty.',
  learning: ['three-area', 'porcelain'],
  fieldNotes: ['`git diff` is worktree vs index. `git diff --staged` is index vs HEAD. Know which one you are looking at.'],
  hint: 'Run `edit config.yaml`, then `git diff`. Do not stage or commit.',
  startDialog: [
    {
      title: 'Two diffs',
      markdown:
        '- `git diff` — what you changed but have **not** staged\n- `git diff --staged` — what will go into the **next commit**\n\nThis level wants the first one, and a dirty tree at the end.',
    },
  ],
  startState: baseWithFiles(
    {
      'config.yaml': { kind: 'config' },
      'src/app.py': { kind: 'code' },
    },
    { init: true, commits: 1 },
  ),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'dirty' },
      { kind: 'notStaged', paths: ['config.yaml'] },
      { kind: 'committedMessageIncludes', text: 'Initial' },
    ],
  },
  solution: ['edit config.yaml', 'git diff'],
};

const diffStaged: LevelDef = {
  id: 'diff-staged',
  series: 'Diff & Show',
  seriesTitle: 'Diff & Show',
  name: 'Stage then inspect --staged',
  difficulty: 2,
  par: 3,
  objective: 'Edit src/app.py, stage it, and inspect the staged diff. Do not commit.',
  learning: ['index', 'porcelain'],
  fieldNotes: ['`git diff --staged` is the review gate. If that output is wrong, the commit will be wrong.'],
  hint: '`edit src/app.py`, `git add src/app.py`, `git diff --staged`.',
  startDialog: [
    {
      title: 'The index is a draft commit',
      markdown:
        'Once you `git add`, the change leaves `git diff` and enters `git diff --staged`.\n\nThat movement *is* the staging area.',
    },
  ],
  startState: baseWithFiles(
    {
      'src/app.py': { kind: 'code' },
    },
    { init: true, commits: 1 },
  ),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'staged', paths: ['src/app.py'] },
      { kind: 'commitCount', min: 1 },
    ],
  },
  solution: ['edit src/app.py', 'git add src/app.py', 'git diff --staged'],
};

const diffRestore: LevelDef = {
  id: 'diff-restore',
  series: 'Diff & Show',
  seriesTitle: 'Diff & Show',
  name: 'Discard a bad edit',
  difficulty: 2,
  par: 2,
  objective: 'A bad edit landed on README.md. Restore it from HEAD so the tree is clean.',
  learning: ['three-area', 'reset-modes'],
  fieldNotes: ['`git restore <file>` is the safe "undo my edits" for uncommitted work. Stash if you might want them later.'],
  hint: 'The file is already dirty. Run `git restore README.md`.',
  startDialog: [
    {
      title: 'Throwing away work on purpose',
      markdown:
        'Uncommitted edits live only in the working tree. `git restore <path>` copies HEAD (or the index) back over the file.\n\nThere is no commit to "undo" — nothing was saved yet.',
    },
  ],
  startState: (() => {
    const s = baseWithFiles({ 'README.md': { kind: 'docs' }, 'src/app.py': { kind: 'code' } }, { init: true, commits: 1 });
    s.files['README.md'].contentId = 'blob-README.md-bad';
    s.files['README.md'].dirty = true;
    s.dataVersions['README.md'] = 1;
    return s;
  })(),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'clean' },
      { kind: 'filePresent', paths: ['README.md'] },
    ],
  },
  solution: ['git restore README.md'],
};

/* ───────────────────────────── BRANCHING ───────────────────────────── */

const branchCreate: LevelDef = {
  id: 'branch-create',
  series: 'Branching',
  seriesTitle: 'Branching',
  name: 'Create a feature branch',
  difficulty: 2,
  par: 2,
  objective: 'Create a branch named `feature` (do not switch to it).',
  learning: ['branch-pointer'],
  fieldNotes: ['Branch names describe work: `feature/login`, `fix/null-check`. Not `test2`.'],
  hint: '`git branch feature` — you do not have to switch yet.',
  startDialog: [
    {
      title: 'Branches are pointers',
      markdown:
        'A branch is a movable name → commit hash. Creating one costs nothing.\n\nThe commit graph does not change when you branch; only the label does.',
    },
  ],
  startState: baseWithFiles({ 'src/app.py': { kind: 'code' } }, { init: true, commits: 1 }),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'branchExists', name: 'feature' },
      { kind: 'headOn', branch: 'main' },
    ],
  },
  solution: ['git branch feature'],
};

const branchSwitch: LevelDef = {
  id: 'branch-switch',
  series: 'Branching',
  seriesTitle: 'Branching',
  name: 'Switch to feature and commit',
  difficulty: 2,
  par: 4,
  objective: 'Create and switch to `feature`, add a change to src/app.py, and commit with "feature work".',
  learning: ['branch-pointer', 'head', 'commit'],
  fieldNotes: ['`git switch -c name` creates and checks out in one step. Prefer switch/restore over checkout for daily work.'],
  hint: '`git switch -c feature`, `edit src/app.py`, `git add src/app.py`, `git commit -m "feature work"`.',
  startDialog: [
    {
      title: 'HEAD moves with you',
      markdown:
        'When you switch branches, HEAD repoints and the working tree is rewritten to that commit\'s tree.\n\nNew commits advance the *current* branch pointer only.',
    },
  ],
  startState: baseWithFiles({ 'src/app.py': { kind: 'code' } }, { init: true, commits: 1 }),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'headOn', branch: 'feature' },
      { kind: 'committedMessageIncludes', text: 'feature work', requireFilesAny: ['src/app.py'] },
    ],
  },
  solution: ['git switch -c feature', 'edit src/app.py', 'git add src/app.py', 'git commit -m "feature work"'],
};

const branchMergeFF: LevelDef = {
  id: 'branch-merge-ff',
  series: 'Branching',
  seriesTitle: 'Branching',
  name: 'Fast-forward merge',
  difficulty: 3,
  par: 5,
  objective: 'On `feature`, commit "ship feature". Switch to main and merge feature (fast-forward is fine).',
  learning: ['fast-forward', 'merge-commit', 'branch-pointer'],
  fieldNotes: ['Fast-forward is clean but loses the "this was a feature" marker. Use --no-ff when the team wants merge bubbles.'],
  hint: 'Commit on feature first, then `git switch main` and `git merge feature`.',
  startDialog: [
    {
      title: 'Fast-forward',
      markdown:
        'If `main` has not moved since `feature` branched, merge just slides the `main` pointer forward.\n\nNo merge commit. History stays linear.',
    },
  ],
  startState: (() => {
    const s = baseWithFiles({ 'src/app.py': { kind: 'code' } }, { init: true, commits: 1 });
    ensureBranch(s, 'feature', s.commits[s.commits.length - 1].hash);
    return s;
  })(),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'headOn', branch: 'main' },
      { kind: 'mergedIntoHead', branch: 'feature' },
      { kind: 'committedMessageIncludes', text: 'ship feature' },
    ],
  },
  solution: [
    'git switch feature',
    'edit src/app.py',
    'git add src/app.py',
    'git commit -m "ship feature"',
    'git switch main',
    'git merge feature',
  ],
};

const branchMergeCommit: LevelDef = {
  id: 'branch-merge-commit',
  series: 'Branching',
  seriesTitle: 'Branching',
  name: 'True merge commit',
  difficulty: 3,
  par: 6,
  objective: 'Commit "hotfix ready" on `hotfix`, then commit "main work" on main, then merge hotfix into main.',
  learning: ['merge-commit', 'fast-forward'],
  fieldNotes: ['When both sides moved, merge records two parents. That is the DAG reconverging — not a failure.'],
  hint: 'You need two independent commits (one per branch) before merge will create a merge commit.',
  startDialog: [
    {
      title: 'When fast-forward is impossible',
      markdown:
        'If `main` advanced after the branch was created, merge creates a **merge commit** with two parents.\n\nBoth lines of history stay reachable.',
    },
  ],
  startState: (() => {
    const s = baseWithFiles({ 'src/app.py': { kind: 'code' }, 'README.md': { kind: 'docs' } }, { init: true, commits: 1 });
    ensureBranch(s, 'hotfix', s.commits[s.commits.length - 1].hash);
    return s;
  })(),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'headOn', branch: 'main' },
      { kind: 'mergedIntoHead', branch: 'hotfix' },
      { kind: 'committedMessageIncludes', text: 'hotfix ready' },
      { kind: 'committedMessageIncludes', text: 'main work' },
      { kind: 'commitCount', min: 4 },
    ],
  },
  solution: [
    'git switch hotfix',
    'edit src/app.py',
    'git add src/app.py',
    'git commit -m "hotfix ready"',
    'git switch main',
    'edit README.md',
    'git add README.md',
    'git commit -m "main work"',
    'git merge hotfix',
  ],
};

/* ───────────────────────────── REMOTES ───────────────────────────── */

const remoteAddPush: LevelDef = {
  id: 'remote-add-push',
  series: 'Remotes',
  seriesTitle: 'Remotes',
  name: 'Add remote and push',
  difficulty: 2,
  par: 3,
  objective: 'Add a remote named `origin` with any URL, then push main and set upstream.',
  learning: ['upstream', 'ref-spec'],
  fieldNotes: ['`git push -u origin main` once per branch. After that, bare `git push` is enough.'],
  hint: '`git remote add origin /tmp/remote.git`, then `git push -u origin main`.',
  startDialog: [
    {
      title: 'Remotes are named URLs',
      markdown:
        'A remote is just a bookmark for another repository. `push` uploads commits; `fetch` downloads refs.\n\n`-u` records the upstream so later commands need no arguments.',
    },
  ],
  startState: baseWithFiles({ 'src/app.py': { kind: 'code' } }, { init: true, commits: 1 }),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'remoteConfigured', name: 'origin' },
      { kind: 'remoteBranchAt', name: 'origin/main' },
      { kind: 'upstreamSet', branch: 'main' },
      { kind: 'pushCount', min: 1 },
    ],
  },
  solution: ['git remote add origin /tmp/remote.git', 'git push -u origin main'],
};

const remotePull: LevelDef = {
  id: 'remote-pull',
  series: 'Remotes',
  seriesTitle: 'Remotes',
  name: 'Fetch and pull',
  difficulty: 3,
  par: 4,
  objective: 'Configure remote `origin`, push once, then run `git pull` at least once.',
  learning: ['fetch-vs-pull', 'upstream'],
  fieldNotes: ['Fetch when you want to inspect. Pull when you want to integrate. They are not the same command.'],
  hint: 'push -u first so pull knows where to go, then `git pull`.',
  startDialog: [
    {
      title: 'Fetch vs pull',
      markdown:
        '`git fetch` updates `origin/*` tracking refs only — your branches do not move.\n`git pull` = fetch + integrate.\n\nThis level wants you to feel both.',
    },
  ],
  startState: baseWithFiles({ 'src/app.py': { kind: 'code' } }, { init: true, commits: 1 }),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'remoteConfigured', name: 'origin' },
      { kind: 'pushCount', min: 1 },
      { kind: 'fetchCount', min: 1 },
    ],
  },
  solution: ['git remote add origin /tmp/remote.git', 'git push -u origin main', 'git pull'],
};

/* ───────────────────────────── UNDO ───────────────────────────── */

const undoSoft: LevelDef = {
  id: 'undo-soft',
  series: 'Undo',
  seriesTitle: 'Undo',
  name: 'Soft reset the last commit',
  difficulty: 3,
  par: 2,
  objective: 'Undo the last commit but keep its changes staged (`git reset --soft HEAD~1`).',
  learning: ['reset-modes'],
  fieldNotes: ['--soft is the polite undo: branch pointer moves back, index and worktree keep the work.'],
  hint: 'There is already a commit with "oops". Run `git reset --soft HEAD~1`.',
  startDialog: [
    {
      title: 'Reset modes',
      markdown:
        '| Mode | Branch | Index | Worktree |\n|------|--------|-------|----------|\n| --soft | moves | kept | kept |\n| --mixed | moves | reset | kept |\n| --hard | moves | reset | reset |\n\nStart with --soft.',
    },
  ],
  startState: (() => {
    const s = baseWithFiles({ 'src/app.py': { kind: 'code' } }, { init: true, commits: 1 });
    s.files['src/app.py'].contentId = 'blob-src/app.py-oops';
    s.dataVersions['src/app.py'] = 1;
    const c = addCommit(s, 'oops commit', { 'src/app.py': 'blob-src/app.py-oops' }, [s.commits[s.commits.length - 1].hash]);
    s.branches[0].commit = c.hash;
    s.files['src/app.py'].headBlob = 'blob-src/app.py-oops';
    s.files['src/app.py'].tracked = true;
    s.lastCommitMessage = 'oops commit';
    return s;
  })(),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'commitCount', min: 1 },
      { kind: 'staged', paths: ['src/app.py'] },
    ],
  },
  solution: ['git reset --soft HEAD~1'],
};

const undoRevert: LevelDef = {
  id: 'undo-revert',
  series: 'Undo',
  seriesTitle: 'Undo',
  name: 'Revert a published commit',
  difficulty: 3,
  par: 2,
  objective: 'Revert HEAD with a message that contains "Revert" (do not reset).',
  learning: ['revert-vs-reset'],
  fieldNotes: ['On shared branches, revert is the only safe undo. Reset rewrites history others already pulled.'],
  hint: '`git revert HEAD` — do not use reset here.',
  startDialog: [
    {
      title: 'Revert adds a commit',
      markdown:
        'Revert creates a new commit that is the inverse of an old one.\n\nHistory stays truthful. Collaborators who already pulled are not broken.',
    },
  ],
  startState: baseWithFiles({ 'src/app.py': { kind: 'code' } }, { init: true, commits: 2 }),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'headMessageIncludes', text: 'Revert' },
      { kind: 'commitCount', min: 3 },
    ],
  },
  solution: ['git revert HEAD'],
};

const undoStash: LevelDef = {
  id: 'undo-stash',
  series: 'Undo',
  seriesTitle: 'Undo',
  name: 'Stash dirty work',
  difficulty: 2,
  par: 2,
  objective: 'Stash your uncommitted changes so the tree is clean.',
  learning: ['stash'],
  fieldNotes: ['Stash is a parking lot, not a branch. If it will sit for a day, commit to a WIP branch instead.'],
  hint: 'The tree is dirty. Run `git stash` (or `git stash push`).',
  startDialog: [
    {
      title: 'Stash',
      markdown:
        '`git stash` packs uncommitted changes into a hidden stack and cleans the tree.\n`git stash pop` restores and drops the entry.',
    },
  ],
  startState: (() => {
    const s = baseWithFiles({ 'src/app.py': { kind: 'code' } }, { init: true, commits: 1 });
    s.files['src/app.py'].contentId = 'blob-src/app.py-wip';
    s.files['src/app.py'].dirty = true;
    s.dataVersions['src/app.py'] = 1;
    return s;
  })(),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'stashDepth', min: 1 },
      { kind: 'clean' },
    ],
  },
  solution: ['git stash'],
};

/* ───────────────────────────── HISTORY ───────────────────────────── */

const histTag: LevelDef = {
  id: 'hist-tag',
  series: 'History craft',
  seriesTitle: 'History craft',
  name: 'Tag a release',
  difficulty: 2,
  par: 2,
  objective: 'Create an annotated tag named `v1.0.0`.',
  learning: ['tag'],
  fieldNotes: ['Annotated tags for releases. Lightweight tags are fine for local bookkeeping only.'],
  hint: '`git tag -a v1.0.0 -m "release"`',
  startDialog: [
    {
      title: 'Tags do not move',
      markdown:
        'Branches move when you commit. Tags are fixed coordinates.\n\nShip pipelines and rollbacks should reference tags, not branch names.',
    },
  ],
  startState: baseWithFiles({ 'src/app.py': { kind: 'code' } }, { init: true, commits: 2 }),
  goal: { kind: 'tagExists', name: 'v1.0.0' },
  solution: ['git tag -a v1.0.0 -m "release"'],
};

const histCherryPick: LevelDef = {
  id: 'hist-cherry-pick',
  series: 'History craft',
  seriesTitle: 'History craft',
  name: 'Cherry-pick a fix',
  difficulty: 4,
  par: 4,
  objective: 'Switch to main and cherry-pick the commit whose message contains "fix crash".',
  learning: ['cherry-pick'],
  fieldNotes: ['Cherry-pick duplicates a change. Fine for hotfixes; it forks history content across branches.'],
  hint: 'Find the hash with `git log --oneline`, switch to main, `git cherry-pick <hash>`.',
  startDialog: [
    {
      title: 'Cherry-pick',
      markdown:
        'Copy one commit\'s change onto the current HEAD as a **new** commit (new hash).\n\nUse when you need one patch without taking the whole branch.',
    },
  ],
  startState: (() => {
    const s = baseWithFiles({ 'src/app.py': { kind: 'code' } }, { init: true, commits: 1 });
    ensureBranch(s, 'fix', s.commits[s.commits.length - 1].hash);
    // create a fix commit on fix branch
    s.files['src/app.py'].contentId = 'blob-fixed';
    const c = addCommit(s, 'fix crash', { 'src/app.py': 'blob-fixed' }, [s.commits[s.commits.length - 1].hash]);
    s.branches.find((b) => b.name === 'fix')!.commit = c.hash;
    // put HEAD on main still at original
    s.HEAD = 'main';
    s.branches.find((b) => b.name === 'main')!.current = true;
    s.branches.find((b) => b.name === 'fix')!.current = false;
    // worktree still at original content
    s.files['src/app.py'].contentId = s.files['src/app.py'].headBlob!;
    return s;
  })(),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'headOn', branch: 'main' },
      { kind: 'cherryPickCount', min: 1 },
      { kind: 'headMessageIncludes', text: 'fix crash' },
    ],
  },
  solution: ['git switch main', 'git cherry-pick fix'],
};

const histMergeConflict: LevelDef = {
  id: 'hist-merge-conflict',
  series: 'History craft',
  seriesTitle: 'History craft',
  name: 'Resolve a merge conflict',
  difficulty: 5,
  par: 6,
  objective:
    'Merge `feature` into main. It will conflict on config.yaml — edit the file, stage it, then commit the merge.',
  learning: ['conflict', 'merge-commit', 'three-area'],
  fieldNotes: [
    'Open the conflicted file, pick the right content, `git add`, `git commit`. Do not reset the merge away unless you mean to abandon the work.',
    'After resolving, run `git log --oneline --graph` — you should see a merge commit with two parents.',
  ],
  hint: '`git merge feature` → conflict. Then `edit config.yaml`, `git add config.yaml`, `git commit -m "Merge branch feature"`.',
  startDialog: [
    {
      title: 'Conflicts are normal',
      markdown:
        'When both branches changed the **same hunk**, Git cannot pick a winner.\n\n1. `git status` shows `both modified`\n2. Edit the file to the content you want\n3. `git add` the path (marks resolved)\n4. `git commit` records the merge',
    },
  ],
  startState: (() => {
    const s = baseWithFiles(
      { 'src/app.py': { kind: 'code' }, 'config.yaml': { kind: 'config' } },
      { init: true, commits: 1 },
    );
    const base = s.commits[0].hash;
    const baseTree = { ...s.commits[0].tree };
    ensureBranch(s, 'feature', base);
    // feature changes config.yaml
    s.HEAD = 'feature';
    s.branches.forEach((b) => {
      b.current = b.name === 'feature';
    });
    s.files['config.yaml'].contentId = 'blob-config-feature';
    addCommit(s, 'feature config', { ...baseTree, 'config.yaml': 'blob-config-feature' }, [base]);
    const featureTip = s.branches.find((b) => b.name === 'feature')!.commit;
    // main changes the same config.yaml differently
    s.HEAD = 'main';
    s.branches.forEach((b) => {
      b.current = b.name === 'main';
    });
    s.files['config.yaml'].contentId = 'blob-config-main';
    addCommit(s, 'main config', { ...baseTree, 'config.yaml': 'blob-config-main' }, [base]);
    // worktree on main
    s.files['config.yaml'].contentId = 'blob-config-main';
    s.files['config.yaml'].headBlob = 'blob-config-main';
    s.files['src/app.py'].contentId = baseTree['src/app.py'];
    s.files['src/app.py'].headBlob = baseTree['src/app.py'];
    void featureTip;
    return s;
  })(),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'mergedIntoHead', branch: 'feature' },
      { kind: 'conflictsResolved', min: 1 },
      { kind: 'clean' },
    ],
  },
  solution: [
    'git merge feature',
    'edit config.yaml',
    'git add config.yaml',
    'git commit -m "Merge branch feature"',
  ],
};

const histRebase: LevelDef = {
  id: 'hist-rebase',
  series: 'History craft',
  seriesTitle: 'History craft',
  name: 'Rebase feature onto main',
  difficulty: 4,
  par: 5,
  objective: 'While on `feature`, rebase onto `main` after main has moved.',
  learning: ['rebase', 'commit'],
  fieldNotes: ['Rebase unpushed feature work. Never rebase a branch others already based work on.'],
  hint: 'Stay on feature, run `git rebase main`.',
  startDialog: [
    {
      title: 'Rebase',
      markdown:
        'Rebase replays your commits onto a new base, producing **new hashes**.\n\nHistory looks linear. The cost: rewritten past.',
    },
  ],
  startState: (() => {
    const s = baseWithFiles({ 'src/app.py': { kind: 'code' }, 'README.md': { kind: 'docs' } }, { init: true, commits: 1 });
    const baseHash = s.commits[0].hash;
    ensureBranch(s, 'feature', baseHash);
    // Create feature commit while HEAD is feature (addCommit advances feature)
    s.HEAD = 'feature';
    s.branches.forEach((b) => {
      b.current = b.name === 'feature';
    });
    s.files['src/app.py'].contentId = 'blob-feature-work';
    const fc = addCommit(s, 'feature work', { ...s.commits[0].tree, 'src/app.py': 'blob-feature-work' }, [baseHash]);
    // Create main commit without moving feature: temporarily detach bookkeeping
    const featureTip = fc.hash;
    s.HEAD = 'main';
    s.branches.forEach((b) => {
      b.current = b.name === 'main';
    });
    s.files['README.md'].contentId = 'blob-main-moved';
    const mc = addCommit(s, 'main moved', { ...s.commits[0].tree, 'README.md': 'blob-main-moved' }, [baseHash]);
    // Restore feature pointer and put HEAD back on feature with its worktree
    s.branches.find((b) => b.name === 'feature')!.commit = featureTip;
    s.HEAD = 'feature';
    s.branches.forEach((b) => {
      b.current = b.name === 'feature';
    });
    s.files['src/app.py'].contentId = 'blob-feature-work';
    s.files['src/app.py'].headBlob = 'blob-feature-work';
    s.files['README.md'].contentId = s.commits[0].tree['README.md'];
    s.files['README.md'].headBlob = s.commits[0].tree['README.md'];
    void mc;
    return s;
  })(),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'rebasedOn', branch: 'main' },
      { kind: 'headOn', branch: 'feature' },
      { kind: 'headMessageIncludes', text: 'feature work' },
    ],
  },
  solution: ['git rebase main'],
};

const histDeleteBranch: LevelDef = {
  id: 'hist-delete-branch',
  series: 'History craft',
  seriesTitle: 'History craft',
  name: 'Delete a merged branch',
  difficulty: 2,
  par: 3,
  objective: 'Merge `cleanup` into main (fast-forward ok) and delete the `cleanup` branch.',
  learning: ['branch-pointer', 'fast-forward'],
  fieldNotes: ['Delete branches after merge. Stale branch names are how people checkout the wrong thing.'],
  hint: 'Switch to main, merge cleanup, then `git branch -d cleanup`.',
  startDialog: [
    {
      title: 'Cleanup',
      markdown:
        'A merged branch pointer is dead weight. `git branch -d` removes the label — the commits stay reachable from main.',
    },
  ],
  startState: (() => {
    const s = baseWithFiles({ 'src/app.py': { kind: 'code' } }, { init: true, commits: 1 });
    ensureBranch(s, 'cleanup', s.commits[0].hash);
    return s;
  })(),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'branchMissing', name: 'cleanup' },
      { kind: 'headOn', branch: 'main' },
    ],
  },
  solution: ['git switch main', 'git merge cleanup', 'git branch -d cleanup'],
};

const branchDetached: LevelDef = {
  id: 'branch-detached',
  series: 'Branching',
  seriesTitle: 'Branching',
  name: 'Detached HEAD recovery',
  difficulty: 3,
  par: 3,
  objective:
    'Check out the previous commit by hash (detached HEAD), then create and switch to a branch named `rescue` so the work is not lost.',
  learning: ['detached-head', 'branch-pointer', 'head'],
  fieldNotes: [
    'Detached HEAD is fine for inspection. If you commit there, create a branch immediately or the commit is only reachable via reflog.',
    '`git switch -c rescue` from a detached HEAD is the standard recovery.',
  ],
  hint: '`git log --oneline` to see hashes, `git switch <old-hash>`, then `git switch -c rescue`.',
  startDialog: [
    {
      title: 'HEAD can point at a commit',
      markdown:
        'Normally HEAD points at a **branch**. Check out a raw hash and HEAD becomes **detached**.\n\nNew commits still work — but nothing named points at them. Create a branch before you walk away.',
    },
  ],
  startState: baseWithFiles({ 'src/app.py': { kind: 'code' } }, { init: true, commits: 2 }),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'headOn', branch: 'rescue' },
      { kind: 'branchExists', name: 'rescue' },
    ],
  },
  solution: ['git log --oneline', 'git switch HEAD~1', 'git switch -c rescue'],
};

/* ───────────────────────────── FIELD / CAMP ───────────────────────────── */

const campFullFlow: LevelDef = {
  id: 'camp-full-flow',
  series: 'Field practice',
  seriesTitle: 'Field practice',
  name: 'Feature branch → PR-ready',
  difficulty: 4,
  par: 8,
  objective:
    'From a clean main: create `feature/login`, commit "add login" on it, push with upstream to origin, switch back to main.',
  learning: ['branch-pointer', 'upstream', 'commit', 'three-area'],
  fieldNotes: [
    'This is the daily loop. If you can do it without thinking, you are ready for code review workflows.',
    'Push the feature branch, not main. The PR is the integration gate.',
  ],
  hint: 'git switch -c feature/login → edit → add → commit -m "add login" → git push -u origin feature/login → git switch main',
  startDialog: [
    {
      title: 'Field drill',
      markdown:
        'Produce a **PR-ready** feature branch:\n\n1. Branch from main\n2. One logical commit\n3. Push with upstream\n4. Return to main clean\n\nNo shortcuts. This is the real workflow.',
    },
  ],
  startState: baseWithFiles(
    {
      'src/app.py': { kind: 'code' },
      'src/login.py': { kind: 'code', tracked: false },
    },
    { init: true, commits: 1 },
  ),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'headOn', branch: 'main' },
      { kind: 'branchExists', name: 'feature/login' },
      { kind: 'upstreamSet', branch: 'feature/login' },
      { kind: 'committedMessageIncludes', text: 'add login' },
      { kind: 'pushCount', min: 1 },
    ],
  },
  solution: [
    'git remote add origin /tmp/remote.git',
    'git switch -c feature/login',
    'edit src/login.py',
    'git add src/login.py',
    'git commit -m "add login"',
    'git push -u origin feature/login',
    'git switch main',
  ],
};

const campRecover: LevelDef = {
  id: 'camp-recover',
  series: 'Field practice',
  seriesTitle: 'Field practice',
  name: 'Recover from a bad commit',
  difficulty: 4,
  par: 4,
  objective: 'You committed secrets by mistake ("oops secrets"). Revert it so HEAD message contains "Revert" and history is kept.',
  learning: ['revert-vs-reset', 'reflog'],
  fieldNotes: ['Secrets in a commit are compromised even after reset — rotate the credential. Revert + rotate.'],
  hint: '`git revert HEAD`. Do not reset --hard.',
  startDialog: [
    {
      title: 'Incident drill',
      markdown:
        'A bad commit is already on main. Prefer **revert** (keeps history) over reset (rewrites).\n\nAfterwards: rotate the leaked secret. The commit is still in the object store.',
    },
  ],
  startState: (() => {
    const s = baseWithFiles({ 'src/app.py': { kind: 'code' }, 'secrets.env': { kind: 'config' } }, { init: true, commits: 1 });
    s.files['secrets.env'].contentId = 'blob-secrets';
    const c = addCommit(s, 'oops secrets', { ...s.commits[0].tree, 'secrets.env': 'blob-secrets' }, [s.commits[s.commits.length - 1].hash]);
    s.branches[0].commit = c.hash;
    s.files['secrets.env'].tracked = true;
    s.files['secrets.env'].headBlob = 'blob-secrets';
    return s;
  })(),
  goal: {
    kind: 'allOf',
    checks: [
      { kind: 'headMessageIncludes', text: 'Revert' },
      { kind: 'commitCount', min: 3 },
    ],
  },
  solution: ['git revert HEAD'],
};

export const allLevels: LevelDef[] = [
  basicsInit,
  basicsAddCommit,
  basicsEditAddCommit,
  basicsStatusLog,
  diffUnstaged,
  diffStaged,
  diffRestore,
  branchCreate,
  branchSwitch,
  branchMergeFF,
  branchMergeCommit,
  branchDetached,
  remoteAddPush,
  remotePull,
  undoSoft,
  undoRevert,
  undoStash,
  histTag,
  histCherryPick,
  histMergeConflict,
  histRebase,
  histDeleteBranch,
  campFullFlow,
  campRecover,
];

registerLevels(allLevels);

export const seriesOrder = [
  'Basics',
  'Diff & Show',
  'Branching',
  'Remotes',
  'Undo',
  'History craft',
  'Field practice',
];
