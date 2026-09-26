/** Field coaching — production notes and post-command Why blocks. */

export interface WhyBlock {
  trigger: string;
  title: string;
  body: string;
}

export const FIELD_NOTES: string[] = [
  'Never force-push to a shared main. Recover with revert, not reset --hard.',
  'Stage deliberately: `git add -p` is how you keep commits reviewable.',
  'A clean linear history on a PR is optional; a truthful history is not.',
  'Tag releases (v1.2.0) at the exact commit you ship — not the commit after.',
  'Pull --rebase for feature branches; plain pull on main only after you know the remote policy.',
  'If you are lost: `git status`, `git log --oneline --graph`, `git reflog`.',
  'Stash is for a dirty tree you need to park for five minutes — not for long-term storage.',
  'Write commit messages as sentences that explain *why*, not a file list.',
];

export const WHY_BLOCKS: WhyBlock[] = [
  {
    trigger: 'git add',
    title: 'Why staging exists',
    body: 'Staging is a draft of the next commit. It lets you split a dirty tree into reviewable commits without changing working files.',
  },
  {
    trigger: 'git commit',
    title: 'Why commits are snapshots',
    body: 'A commit stores a full tree + parent hash. Diffing is computed later; the commit itself is a point-in-time snapshot.',
  },
  {
    trigger: 'git switch',
    title: 'Why branch checkout is cheap',
    body: 'A branch is just a movable pointer to a commit. Switching rewrites the working tree to match that tree — the history object graph does not move.',
  },
  {
    trigger: 'git merge',
    title: 'Why merge commits exist',
    body: 'A merge records two parents so history can diverge and reconverge without losing either side. Prefer merge when both branches were published.',
  },
  {
    trigger: 'git rebase',
    title: 'Why rebase rewrites history',
    body: 'Rebase replays commits onto a new base, producing new hashes. Safe for unpushed local work; dangerous after push.',
  },
  {
    trigger: 'git reset',
    title: 'Why reset has modes',
    body: '--soft keeps index+worktree, --mixed resets index only, --hard resets everything. Choose the softest mode that solves the problem.',
  },
  {
    trigger: 'git revert',
    title: 'Why revert is safer than reset',
    body: 'Revert adds a new commit that undoes an old one. History stays truthful and shared branches stay in sync.',
  },
  {
    trigger: 'git push',
    title: 'Why upstream matters',
    body: '-u records the remote tracking branch so later push/pull need no arguments. Do it once per branch.',
  },
  {
    trigger: 'git stash',
    title: 'Why stash is temporary',
    body: 'Stash parks uncommitted work as a commit on a side stack. Apply it soon or it becomes orphaned context nobody can find.',
  },
  {
    trigger: 'git tag',
    title: 'Why tags beat branch names for releases',
    body: 'Branches move; tags do not. A release tag is a fixed coordinate for builds, rollbacks, and support.',
  },
];

export function whyFor(command: string): WhyBlock | undefined {
  const key = command.trim().split(/\s+/).slice(0, 2).join(' ');
  return (
    WHY_BLOCKS.find((w) => command.startsWith(w.trigger)) ??
    WHY_BLOCKS.find((w) => key === w.trigger)
  );
}

export function formatWhy(block: WhyBlock): string {
  return `Why — ${block.title}\n${block.body}`;
}
