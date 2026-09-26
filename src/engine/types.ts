/** Core simulation types for LearnGit. */

export type FileKind = 'code' | 'docs' | 'config' | 'data' | 'meta';

export interface WorkspaceFile {
  path: string;
  kind: FileKind;
  /** Stable content identity used like a git blob id for simulation. */
  contentId: string;
  /** True when the path has been committed at least once. */
  tracked: boolean;
  /** Blob id recorded in HEAD for this path (undefined if never committed). */
  headBlob?: string;
  /** Workspace content differs from headBlob. */
  dirty?: boolean;
  /** Present in the working tree (false after `rm`). */
  present: boolean;
  /** Listed in .gitignore. */
  gitignored: boolean;
  /** Staged for next commit (index holds contentId). */
  staged: boolean;
  /** Index blob differs from HEAD (staged modification). */
  stagedNew?: boolean;
  /** Deleted in working tree but still in index. */
  deleted?: boolean;
}

export interface GitCommit {
  hash: string;
  message: string;
  parents: string[];
  /** Snapshot of path → blob id at this commit. */
  tree: Record<string, string>;
  author: string;
  timestamp: number;
}

export interface BranchRef {
  name: string;
  commit: string;
  /** Set when tracking a remote branch, e.g. origin/main. */
  upstream?: string;
  /** True for the currently checked-out branch. */
  current?: boolean;
}

export interface RemoteEntry {
  name: string;
  url: string;
}

export interface RemoteBranchRef {
  name: string;
  /** e.g. origin/main */
  remote: string;
  branch: string;
  commit: string;
}

export interface TagRef {
  name: string;
  commit: string;
  annotated: boolean;
  message?: string;
}

export interface StashEntry {
  id: string;
  message: string;
  /** path → blob id that was stashed (dirty files at stash time). */
  files: Record<string, string>;
  /** Full working-tree snapshot for restore. */
  snapshot: Record<string, { contentId: string; present: boolean; staged: boolean }>;
  branch: string;
}

export interface RepoState {
  initialized: boolean;
  /** True after first commit — enables branch/merge etc. */
  hasCommits: boolean;
  files: Record<string, WorkspaceFile>;
  staging: string[];
  commits: GitCommit[];
  branches: BranchRef[];
  HEAD: string;
  /** When HEAD is detached, hold the raw commit hash. */
  detachedHead: boolean;
  remotes: RemoteEntry[];
  remoteBranches: RemoteBranchRef[];
  tags: TagRef[];
  stash: StashEntry[];
  /** Artificial content version counter for `edit` simulation. */
  dataVersions: Record<string, number>;
  /** Paths in .gitignore patterns. */
  gitignore: string[];
  /** Successful commands run this level — sticky checklist completion. */
  commandHistory: string[];
  /** Last commit message for reuse / amend simulation. */
  lastCommitMessage?: string;
  /** Number of push events this session (for goals). */
  pushCount: number;
  /** Number of pull/fetch events this session. */
  fetchCount: number;
  /** Rebase in progress (source branch name). */
  rebasing?: string;
  /** Cherry-pick count. */
  cherryPickCount: number;
  /** Merge in progress. */
  merging?: string;
  /** Conflict paths when merge/rebase hits one. */
  conflicts: string[];
  /** Branch name that was rebased away (bookkeeping for goals). */
  rebasedFrom?: string;
  /** How many rebases completed this session. */
  rebaseCount?: number;
  /** Commit hash of merge-base while a conflicted merge is in progress. */
  mergeBase?: string;
  /** Ours/theirs tips while a conflicted merge is in progress. */
  mergeOurs?: string;
  mergeTheirs?: string;
  /** Completed merges that required conflict resolution. */
  conflictsResolvedCount: number;
  /** Draft tree while a conflicted merge is open. */
  pendingMergeTree?: Record<string, string>;
}

export interface CommandResult {
  ok: boolean;
  output: string;
  error?: string;
  /** Optional side-effect hint for UI animation (e.g. 'stage', 'commit'). */
  effect?: 'stage' | 'commit' | 'branch' | 'push' | 'pull' | 'stash' | 'reset' | 'none';
}

export interface DialogSlide {
  title?: string;
  markdown: string;
}

export type GoalCheck =
  | { kind: 'initialized'; value?: boolean }
  | { kind: 'staged'; paths: string[] }
  | { kind: 'notStaged'; paths: string[] }
  | { kind: 'stagedAll' }
  | { kind: 'clean' }
  | { kind: 'dirty' }
  | { kind: 'committedMessageIncludes'; text: string; requireFilesAny?: string[] }
  | { kind: 'commitCount'; min: number }
  | { kind: 'branchExists'; name: string }
  | { kind: 'branchMissing'; name: string }
  | { kind: 'headOn'; branch: string }
  | { kind: 'headDetached'; value?: boolean }
  | { kind: 'fileTracked'; paths: string[] }
  | { kind: 'fileUntracked'; paths: string[] }
  | { kind: 'filePresent'; paths: string[] }
  | { kind: 'fileMissing'; paths: string[] }
  | { kind: 'fileIgnored'; path: string }
  | { kind: 'remoteConfigured'; name?: string }
  | { kind: 'remoteBranchAt'; name: string; commitMessageIncludes?: string }
  | { kind: 'upstreamSet'; branch: string }
  | { kind: 'pushCount'; min: number }
  | { kind: 'fetchCount'; min: number }
  | { kind: 'tagExists'; name: string }
  | { kind: 'stashDepth'; min: number }
  | { kind: 'stashEmpty'; value?: boolean }
  | { kind: 'mergedIntoHead'; branch: string }
  | { kind: 'rebasedOn'; branch: string }
  | { kind: 'cherryPickCount'; min: number }
  | { kind: 'headMessageIncludes'; text: string }
  | { kind: 'conflictPending'; value?: boolean }
  | { kind: 'conflictsResolved'; min: number }
  | { kind: 'notDirty' }
  | { kind: 'allOf'; checks: GoalCheck[] };

export interface SolutionStepStatus {
  command: string;
  done: boolean;
  note: string;
  /** Inspect/help commands that do not block level completion. */
  optional?: boolean;
}

export interface LevelDef {
  id: string;
  series: string;
  seriesTitle: string;
  name: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  par: number;
  hint: string;
  objective: string;
  /** Concepts this level is supposed to install — shown in the goal panel. */
  learning: string[];
  /** What a working engineer does with this in production. */
  fieldNotes?: string[];
  startDialog: DialogSlide[];
  startState: RepoState;
  /** State checks that mark the level solved — must mirror `solution` step effects. */
  goal: GoalCheck;
  /** Ordered commands that solve the level; the Goal panel lists these verbatim. */
  solution: string[];
  disabled?: string[];
}

export interface LevelProgress {
  solved: boolean;
  bestCommands?: number;
}
