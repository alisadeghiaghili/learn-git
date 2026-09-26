/** Share links, publisher identity, and coffee button. */

export const LIVE_URL = 'https://alisadeghiaghili.github.io/learn-git/';
export const SHARE_URL = 'https://alisadeghiaghili.github.io/learn-git/';
export const REPO_URL = 'https://github.com/alisadeghiaghili/learn-git';
export const COFFEE_URL = 'https://www.buymeacoffee.com/alisadeghil';
export const PUBLISHER = 'Ali Sadeghi Aghili';
export const PUBLISHER_LINK = 'https://linktr.ee/aliaghili';

export const COFFEE_BUTTON_HTML = `<a href="${COFFEE_URL}" target="_blank" rel="noopener noreferrer"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=alisadeghil&button_colour=2a3a4a&font_colour=ffffff&font_family=Cookie&outline_colour=ffffff&coffee_colour=FFDD00" alt="Buy me a coffee" /></a>`;

export interface WelcomeCopy {
  title: string;
  intro: string;
  board: string;
  tracks: string;
  meta: string;
  levelsCount: (n: number) => string;
  what: string;
  whatBody: string;
  publisher: string;
  publisherBody: string;
  github: string;
  coffee: string;
  toolbar: string;
  sandbox: string;
  openLevels: string;
}

export const WELCOME: WelcomeCopy = {
  title: 'LearnGit',
  intro: 'Interactive **Git** tutorial — sandbox + guided levels.',
  board:
    'The board shows **Working Tree → Staging → Repository → Remote**. That is the material flow Git manages.',
  tracks: [
    '- Basics: `init`, `add`, `commit`, pointers, `status`',
    '- Diff & Show: `diff`, `restore`, `show`',
    '- Branching: `branch`, `switch`, `merge`, detached HEAD',
    '- Remotes: `remote add`, `push`, `pull`',
    '- Undo: `reset`, `revert`, `stash`',
    '- History craft: `rebase`, `cherry-pick`, `tag`, conflicts',
  ].join('\n'),
  meta:
    'Meta: `levels`, `curriculum`, `concepts`, `lesson`, `hint`, `steps`, `show solution`.',
  levelsCount: (n: number) =>
    `**${n}** levels included. Open Levels to begin, or stay in sandbox.`,
  what: '**What is LearnGit?**',
  whatBody:
    'A browser lab bench for Git: you type real-shaped `git` commands and watch working tree, staging, commits, and remotes move. No install required for the tutorial core.',
  publisher: '**Publisher**',
  publisherBody: `Published and maintained by **${PUBLISHER}** — programmer, data engineer / scientist, ML engineer.\n[${PUBLISHER_LINK.replace('https://', '')}](${PUBLISHER_LINK})`,
  github: `- [GitHub — source & issues](${REPO_URL})`,
  coffee: 'Buy Me a Coffee (supports the publisher):',
  toolbar: 'Toolbar: **Lesson** (replay level intro) · **GitHub** · **Buy me a coffee**.',
  sandbox: 'Sandbox',
  openLevels: 'Open levels',
};
