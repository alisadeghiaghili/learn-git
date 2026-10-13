import type { CurriculumSummary } from './progress';
import { ui } from '../i18n';

export const LIVE_URL = 'https://alisadeghiaghili.github.io/learn-git/';
export const SHARE_URL = 'https://alisadeghiaghili.github.io/learn-git/';
export const REPO_URL = 'https://github.com/alisadeghiaghili/learn-git';
export const COFFEE_URL = 'https://www.buymeacoffee.com/alisadeghil';
export const PUBLISHER = 'Ali Sadeghi Aghili';
export const PUBLISHER_LINK = 'https://linktr.ee/aliaghili';
export const COFFEE_BUTTON_HTML = `<a href="${COFFEE_URL}" target="_blank" rel="noopener noreferrer"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=alisadeghil&button_colour=2a3a4a&font_colour=ffffff&font_family=Cookie&outline_colour=ffffff&coffee_colour=FFDD00" alt="Buy me a coffee" /></a>`;

export interface WelcomeCopy {
  title: string;
  titleHtml: string;
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
  title: 'Welcome to LearnGit',
  titleHtml: 'Welcome to Learn<span>Git</span>',
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
  toolbar: 'Toolbar: **Why Git?** · **Levels** · **Lesson** · **Guide** · **Hint** · **Solution** · **Undo** · **Reset** · **Sandbox** · **GitHub** · **Buy me a coffee**.',
  sandbox: 'Sandbox',
  openLevels: 'Open levels',
};

export interface ShareContext {
  levelName: string;
  levelId: string;
  commands: number | null;
  par: number;
  curriculum: CurriculumSummary;
}

function bulletList(items: { name: string; seriesTitle: string }[], limit?: number): string[] {
  const list = limit ? items.slice(0, limit) : items;
  const lines = list.map((l) => `• ${l.seriesTitle}: ${l.name}`);
  if (limit && items.length > limit) lines.push(`• …and ${items.length - limit} more`);
  return lines;
}

export function shareMessageLinkedIn(ctx: ShareContext): string {
  const u = ui();
  const c = ctx.curriculum;
  const learned = c.learned.length ? bulletList(c.learned) : [];
  const parts = [
    u.shareLinkedInHead,
    '',
    c.solvedCount > 0
      ? `${u.shareLatestWin(ctx.levelName, ctx.levelId)}${
          ctx.commands !== null ? u.shareCommands(ctx.commands, ctx.par) : ''
        }`
      : u.shareStarting,
    '',
    learned.length ? u.shareLearnedSoFar : '',
    ...learned,
    '',
    u.shareProgress(c.solvedCount, c.total),
    '',
    u.shareCta,
    SHARE_URL,
    '',
    u.shareSupport,
    COFFEE_URL,
  ];
  return parts.filter(Boolean).join('\n').replace(/\n{3,}/g, '\n\n');
}

export function shareMessageX(ctx: ShareContext): string {
  const u = ui();
  const c = ctx.curriculum;
  const head = u.shareXHead(c.solvedCount, c.total);
  const first = c.learned[0] ? `• ${c.learned[0].name}` : u.shareXFirst;
  let text = `${head}\n${first}\n${SHARE_URL}`;
  if (text.length > 275) text = `${head}\n${SHARE_URL}`;
  return text;
}

export interface ShareTargets {
  linkedin: string;
  x: string;
  facebook: string;
  text: string;
  shortText: string;
  url: string;
  learnedLines: string[];
}

export function buildShareTargets(ctx: ShareContext): ShareTargets {
  const u = ui();
  const longText = shareMessageLinkedIn(ctx);
  const shortText = shareMessageX(ctx);
  const url = SHARE_URL;
  return {
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(u.titleLearnGit)}&summary=${encodeURIComponent(longText)}&source=LearnGit`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(longText)}`,
    text: longText,
    shortText,
    url,
    learnedLines: bulletList(ctx.curriculum.learned),
  };
}

export function openShareWindow(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer,width=720,height=640');
}

export async function copySharePayload(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export async function shareWithClipboard(
  kind: 'linkedin' | 'x' | 'facebook' | 'copy',
  targets: ShareTargets,
): Promise<{ copied: boolean; opened: boolean }> {
  if (kind === 'copy') {
    const ok = await copySharePayload(targets.text);
    return { copied: ok, opened: false };
  }
  const url = kind === 'linkedin' ? targets.linkedin : kind === 'x' ? targets.x : targets.facebook;
  openShareWindow(url);
  const ok = await copySharePayload(targets.text);
  return { copied: ok, opened: true };
}
