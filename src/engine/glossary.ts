/** Dense mental-model reference — `concepts` / `glossary` in the terminal. */

export interface Concept {
  id: string;
  title: string;
  body: string;
}

export const CONCEPT_IDS = [
  'three-area',
  'blob',
  'tree',
  'commit',
  'index',
  'head',
  'branch-pointer',
  'detached-head',
  'fast-forward',
  'merge-commit',
  'rebase',
  'cherry-pick',
  'reflog',
  'reset-modes',
  'revert-vs-reset',
  'stash',
  'upstream',
  'fetch-vs-pull',
  'force-push',
  'tag',
  'conflict',
  'squash',
  'ref-spec',
  'porcelain',
] as const;

export const CONCEPTS: Concept[] = [
  {
    id: 'three-area',
    title: 'Three-area model',
    body: 'Working tree = files on disk. Staging (index) = draft of the next commit. Repository = committed snapshots. Git commands move content between areas.',
  },
  {
    id: 'blob',
    title: 'Blob',
    body: 'Content-addressed file contents. A blob has no filename — the tree object maps paths to blobs.',
  },
  {
    id: 'tree',
    title: 'Tree',
    body: 'A directory listing at one commit: path → blob/tree hashes. The commit points at a root tree.',
  },
  {
    id: 'commit',
    title: 'Commit',
    body: 'Snapshot = root tree + parent hash(es) + author + message. History is a DAG of commits, not a list of diffs.',
  },
  {
    id: 'index',
    title: 'Index (staging area)',
    body: 'The proposed next commit. `git add` writes the index; `git commit` turns the index into a tree and a new commit.',
  },
  {
    id: 'head',
    title: 'HEAD',
    body: 'Symbolic ref pointing at the current branch (or a commit if detached). Most commands interpret their arguments relative to HEAD.',
  },
  {
    id: 'branch-pointer',
    title: 'Branch pointer',
    body: 'A branch is a movable name → commit hash. Creating one is O(1); switching rewrites the working tree to that commit\'s tree.',
  },
  {
    id: 'detached-head',
    title: 'Detached HEAD',
    body: 'HEAD points at a commit, not a branch. New commits are easy to lose — create a branch before you commit.',
  },
  {
    id: 'fast-forward',
    title: 'Fast-forward',
    body: 'When the target branch is a descendant of the current tip, merge just moves the pointer. No merge commit.',
  },
  {
    id: 'merge-commit',
    title: 'Merge commit',
    body: 'A commit with two parents, recording that two lines of history reconverged. Both sides remain reachable.',
  },
  {
    id: 'rebase',
    title: 'Rebase',
    body: 'Replay commits onto a new base with new hashes. Linear history, rewritten past. Never rebase published shared branches.',
  },
  {
    id: 'cherry-pick',
    title: 'Cherry-pick',
    body: 'Copy one commit\'s change onto the current HEAD as a new commit. Useful for hotfixes; duplicates content across branches.',
  },
  {
    id: 'reflog',
    title: 'Reflog',
    body: 'Local log of where HEAD/refs have pointed. The emergency undo: lost commits are almost always still here.',
  },
  {
    id: 'reset-modes',
    title: 'Reset modes',
    body: '--soft: move branch, keep index+worktree. --mixed (default): move branch, reset index. --hard: move branch, wipe index+worktree.',
  },
  {
    id: 'revert-vs-reset',
    title: 'Revert vs reset',
    body: 'Revert adds a new inverse commit — safe for published history. Reset moves a pointer — local rewrite, unsafe after push.',
  },
  {
    id: 'stash',
    title: 'Stash',
    body: 'Park uncommitted changes as a commit on a hidden stack. `git stash pop` restores and drops. Not a long-term branch substitute.',
  },
  {
    id: 'upstream',
    title: 'Upstream',
    body: 'The remote branch your local branch tracks. Set with `push -u`. After that, bare `git push` / `git pull` know where to go.',
  },
  {
    id: 'fetch-vs-pull',
    title: 'Fetch vs pull',
    body: 'Fetch updates remote-tracking refs only. Pull = fetch + integrate (merge or rebase). Fetch first when you want to inspect.',
  },
  {
    id: 'force-push',
    title: 'Force push',
    body: 'Overwrites the remote tip. Use --force-with-lease only on your own feature branches. Never force-push shared main.',
  },
  {
    id: 'tag',
    title: 'Tag',
    body: 'A fixed name → commit. Annotated tags store a message and tagger — required for releases.',
  },
  {
    id: 'conflict',
    title: 'Conflict',
    body: 'Two sides changed the same hunk. The index records stages 1/2/3; you edit, add, and commit to resolve.',
  },
  {
    id: 'squash',
    title: 'Squash',
    body: 'Fold several commits into one before review. Preserve the *why* in the squash message; drop noisy intermediate titles.',
  },
  {
    id: 'ref-spec',
    title: 'Refspec',
    body: 'The `<src>:<dst>` mapping for push/fetch. Example: `git push origin feature:feature` — what moves where.',
  },
  {
    id: 'porcelain',
    title: 'Porcelain vs plumbing',
    body: 'Porcelain is the user-facing CLI (status, log). Plumbing is the low-level object/ref API. Scripts should prefer porcelain-v2 or plumbing.',
  },
];

export function formatConcepts(): string {
  return CONCEPTS.map((c, i) => `${i + 1}. ${c.title}\n   ${c.body}`).join('\n\n');
}

export function findConcept(query: string): Concept | undefined {
  const q = query.trim().toLowerCase();
  return CONCEPTS.find((c) => c.id === q || c.title.toLowerCase().includes(q));
}
