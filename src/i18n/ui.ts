/** UI-chrome string catalogs (toolbar, dock, board, welcome, goal-check labels).
 *
 * English is the source of truth; `fa`/`de` override the same shape. The
 * interface lives here and the catalogs `import type` it from here, while this
 * module imports the catalogs as values — a type-only back-import, so there is
 * no runtime cycle.
 */
import type { Lang } from './lang';
import { UI_EN } from './ui.en';
import { UI_FA } from './ui.fa';
import { UI_DE } from './ui.de';

export interface FileStatus {
  clean: string;
  modified: string;
  untracked: string;
  staged: string;
  deleted: string;
  missing: string;
  gitignored: string;
}

export interface WelcomeStrings {
  title: string;
  intro: string;
  board: string;
  tracks: string[];
  meta: string;
  levelsCount: (n: number) => string;
  what: string;
  whatBody: string;
  publisher: string;
  publisherBody: string;
  sandbox: string;
  openLevels: string;
}

export interface UiStrings {
  toolbar: {
    levels: string;
    goal: string;
    hint: string;
    solution: string;
    undo: string;
    reset: string;
    sandbox: string;
    github: string;
    coffee: string;
    learn: string;
  };
  levels: {
    title: string;
    subtitle: string;
    solved: string;
    par: (n: number) => string;
    best: (n: number) => string;
    difficulty: string;
  };
  dock: {
    sandbox: string;
    sandboxHint: string;
    liveStatus: string;
    objective: string;
    learning: string;
    goalChecks: string;
    solutionSteps: string;
    fieldNotes: string;
    parLine: (par: number, difficulty: number) => string;
    commandsUsed: (n: number) => string;
    solvedBanner: (cmds: number, best?: number) => string;
    optional: string;
    required: string;
  };
  board: {
    work: string;
    stage: string;
    repo: string;
    remote: string;
    emptyWorktree: string;
    emptyIndex: string;
    noCommits: string;
    noRemote: string;
    headDetached: (sha: string) => string;
    tagPrefix: string;
    stagedTag: string;
    fileStatus: FileStatus;
  };
  status: {
    branch: string;
    head: string;
    clean: string;
    staged: string;
    unstaged: string;
    untracked: string;
    commits: string;
    remotes: string;
  };
  modal: {
    close: string;
    start: string;
    stay: string;
    next: string;
    solvedTitle: string;
    learned: string;
  };
  learn: {
    title: string;
    subtitle: string;
    fromZero: string;
    mindset: string;
    industry: string;
  };
  /** Localized short title for each goal-check kind (detail stays technical/EN). */
  goalLabels: Record<string, string>;
  welcome: WelcomeStrings;
}

export function ui(lang: Lang): UiStrings {
  return lang === 'fa' ? UI_FA : lang === 'de' ? UI_DE : UI_EN;
}
