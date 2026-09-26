/** Teaching helpers — curriculum outcomes and learning labels. */

export interface CurriculumOutcome {
  id: string;
  title: string;
  body: string;
}

export const CURRICULUM: CurriculumOutcome[] = [
  {
    id: 'three-area',
    title: 'Explain the three-area model',
    body: 'Working tree, staging (index), and repository are distinct. Every Git mistake is a misunderstanding of which area you are looking at.',
  },
  {
    id: 'atomic-commits',
    title: 'Build atomic commits',
    body: 'One logical change per commit. Use `git add -p` / selective paths. Review with `git diff --staged` before committing.',
  },
  {
    id: 'history-read',
    title: 'Read history fast',
    body: '`git log --oneline --graph --decorate`, `git show`, `git reflog`. If you cannot describe what happened, you cannot fix it.',
  },
  {
    id: 'branching',
    title: 'Branch with intent',
    body: 'Short-lived feature branches, merge or rebase into main by team policy, delete after merge. Branch names describe the work.',
  },
  {
    id: 'remotes',
    title: 'Coordinate with remotes',
    body: 'Set upstream once. Fetch before you integrate. Push feature branches freely; push main only under team rules.',
  },
  {
    id: 'recovery',
    title: 'Recover without panic',
    body: 'Restore/checkout for files, reset for the branch pointer, revert for published history, stash for temporary parking, reflog as the last safety net.',
  },
  {
    id: 'release',
    title: 'Tag and ship',
    body: 'Annotated tags at release commits. Tag names are the contract with deploy pipelines and support.',
  },
];

export function formatCurriculum(): string {
  return CURRICULUM.map((o, i) => `${i + 1}. ${o.title}\n   ${o.body}`).join('\n\n');
}

export function learningLabels(ids: string[]): string[] {
  return ids;
}
