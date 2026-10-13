import { ui } from '../i18n';

export type LogKind = 'cmd' | 'out' | 'err' | 'meta' | 'why' | 'ok';

function escapeHtml(s: string): string {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export interface LogLine {
  kind: LogKind;
  text: string;
}

const BASE_COMMANDS = [
  'git init',
  'git status',
  'git add .',
  'git add -A',
  'git commit -m "Initial commit"',
  'git commit -m "Update work"',
  'git commit -am "Fast commit"',
  'git branch',
  'git branch -a',
  'git branch -d',
  'git branch -D',
  'git branch feature',
  'git checkout main',
  'git checkout -b feature',
  'git switch main',
  'git switch -c feature',
  'git merge feature',
  'git merge --no-ff feature',
  'git merge --abort',
  'git rebase main',
  'git rebase --continue',
  'git rebase --abort',
  'git log',
  'git log --oneline --graph',
  'git log --graph',
  'git reset HEAD~1',
  'git reset --soft HEAD~1',
  'git reset --hard HEAD~1',
  'git restore --staged',
  'git restore',
  'git revert HEAD',
  'git cherry-pick',
  'git tag v1.0.0',
  'git tag -a v1.0.0 -m "Release v1.0.0"',
  'git stash',
  'git stash pop',
  'git stash list',
  'git stash apply',
  'git stash drop',
  'git remote add origin https://github.com/example/repo.git',
  'git remote -v',
  'git push origin main',
  'git push -u origin main',
  'git push',
  'git fetch origin',
  'git fetch',
  'git pull origin main',
  'git pull',
  'git diff',
  'git diff --staged',
  'git show HEAD',
  'edit README.md',
  'edit app.js',
  'rm README.md',
  'cat README.md',
  'ls',
  'levels',
  'hint',
  'steps',
  'show goal',
  'hide goal',
  'show solution',
  'reset',
  'undo',
  'sandbox',
  'clear',
  'help',
  'curriculum',
  'concepts',
  'why',
];

interface WordState {
  /** Words fully before the caret/current token. */
  head: string[];
  /** Partial current token (empty when line ends with a space). */
  current: string;
  /** True when user finished a token with whitespace. */
  afterSpace: boolean;
}

function parseLine(value: string): WordState {
  const endsWithSpace = /\s$/.test(value);
  const trimmed = value.replace(/\s+$/, '');
  if (!trimmed) {
    return { head: [], current: '', afterSpace: endsWithSpace };
  }
  const parts = trimmed.split(/\s+/);
  if (endsWithSpace) {
    return { head: parts, current: '', afterSpace: true };
  }
  return { head: parts.slice(0, -1), current: parts[parts.length - 1]!, afterSpace: false };
}

export class TerminalView {
  private logEl: HTMLElement;
  private inputEl: HTMLInputElement;
  private wrapEl: HTMLElement;
  private ghostEl: HTMLElement;
  private hintEl: HTMLElement;
  private lines: LogLine[] = [];
  private history: string[] = [];
  private historyIdx = -1;
  private draft = '';
  private hint = '';
  private extraCompletions: string[] = [];
  /** Candidates for the *current word*, cycled by repeated Tab. */
  private wordCycle: string[] = [];
  private wordIdx = 0;
  private wordKey = '';
  private measureCtx: CanvasRenderingContext2D | null = null;
  private onSubmit: (cmd: string) => void;

  constructor(root: HTMLElement, onSubmit: (cmd: string) => void) {
    this.onSubmit = onSubmit;
    root.innerHTML = `
      <div class="term-log" id="term-log" role="log" aria-live="polite" dir="ltr"></div>
      <div class="term-hint" id="term-hint" data-help-id="term-hint" hidden dir="ltr"></div>
      <div class="term-input-row" dir="ltr">
        <label class="prompt" for="term-input">git $</label>
        <div class="term-input-wrap" id="term-input-wrap" data-help-id="term-ghost">
          <div class="term-ghost" id="term-ghost" aria-hidden="true"></div>
          <input id="term-input" class="term-input" autocomplete="off" spellcheck="false"
            placeholder="" dir="ltr"
            aria-label="${escapeHtml(ui().termAriaLabel)}" />
        </div>
      </div>
    `;
    this.logEl = root.querySelector('#term-log')!;
    this.inputEl = root.querySelector('#term-input')!;
    this.wrapEl = root.querySelector('#term-input-wrap')!;
    this.ghostEl = root.querySelector('#term-ghost')!;
    this.hintEl = root.querySelector('#term-hint')!;
    this.inputEl.addEventListener('keydown', (e) => this.onKey(e));
    this.inputEl.addEventListener('input', () => this.syncGhost());
  }

  focus(): void {
    if (document.querySelector('.overlay .modal')) return;
    this.inputEl.focus();
    const len = this.inputEl.value.length;
    try {
      this.inputEl.setSelectionRange(len, len);
    } catch {
      // ignore
    }
  }

  setLog(lines: LogLine[]): void {
    this.lines = lines;
    this.render();
  }

  getLog(): LogLine[] {
    return this.lines;
  }

  push(kind: LogKind, text: string): void {
    if (kind === 'cmd' && text) {
      this.history.push(text);
      this.historyIdx = this.history.length;
    }
    this.lines.push({ kind, text });
    if (this.lines.length > 400) this.lines = this.lines.slice(-300);
    this.render();
  }

  clear(): void {
    this.lines = [];
    this.render();
  }

  private render(): void {
    const html = this.lines
      .map((l) => {
        const prefix = l.kind === 'cmd' ? '$ ' : '';
        return `<div class="${l.kind}">${prefix}${escapeHtml(l.text)}</div>`;
      })
      .join('');
    this.logEl.innerHTML = html;
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  setHint(command: string | null): void {
    this.hint = command ?? '';
    // Empty input: ONE faded cue only (placeholder) — never stacked with ghost.
    this.inputEl.placeholder = this.hint
      ? ui().nextPlaceholder(this.hint)
      : 'Type a command — help · levels · hint · steps';
    this.hintEl.hidden = !this.hint;
    if (this.hint) {
      this.hintEl.innerHTML = `${escapeHtml(ui().nextPrompt)}: <code>${escapeHtml(this.hint)}</code> <span class="par-note">· ${escapeHtml(ui().tabFillsWord)}</span>`;
    } else {
      this.hintEl.textContent = '';
    }
    this.syncGhost();
  }

  setExtraCompletions(commands: string[]): void {
    this.extraCompletions = commands.filter(Boolean);
  }

  private allCompletions(): string[] {
    return [
      ...new Set<string>([...this.extraCompletions, ...BASE_COMMANDS, ...this.history.slice().reverse()]),
    ];
  }

  /** Full commands that share the same head words + current token prefix. */
  private matchingCommands(head: string[], current: string): string[] {
    const cur = current.toLowerCase();
    return this.allCompletions().filter((cmd) => {
      const words = cmd.split(/\s+/);
      if (words.length <= head.length) {
        if (head.length && words.length === head.length) {
          return words.every((w, i) => w === head[i]);
        }
        return false;
      }
      for (let i = 0; i < head.length; i++) {
        if (words[i] !== head[i]) return false;
      }
      if (!cur) return true;
      return (words[head.length] ?? '').toLowerCase().startsWith(cur);
    });
  }

  /** Distinct next-word options in order, hint-first. */
  private nextWords(head: string[], current: string): string[] {
    const matches = this.matchingCommands(head, current);
    const words: string[] = [];
    const push = (w: string | undefined) => {
      if (!w) return;
      if (!words.includes(w)) words.push(w);
    };
    if (this.hint) {
      const hw = this.hint.split(/\s+/);
      const okHead = head.every((h, i) => hw[i] === h);
      if (okHead) push(hw[head.length]);
    }
    for (const cmd of matches) {
      push(cmd.split(/\s+/)[head.length]);
    }
    return words.filter((w) => !current || w.toLowerCase().startsWith(current.toLowerCase()));
  }

  private measureText(text: string): number {
    if (!this.measureCtx) {
      this.measureCtx = document.createElement('canvas').getContext('2d');
    }
    const ctx = this.measureCtx;
    if (!ctx) return text.length * 7.2;
    const font = getComputedStyle(this.inputEl).font;
    ctx.font = font || '13px Consolas, monospace';
    return ctx.measureText(text).width;
  }

  /** Ghost shows only the rest of the current word (or the next word after space). */
  private syncGhost(): void {
    const value = this.inputEl.value;
    this.ghostEl.dataset.visible = '0';
    this.ghostEl.textContent = '';
    this.wrapEl.classList.remove('has-ghost');

    if (!value) return;

    const { head, current, afterSpace } = parseLine(value);
    const words = this.nextWords(head, afterSpace ? '' : current);
    const first = words[0];
    if (!first) return;

    if (afterSpace) {
      this.ghostEl.textContent = first;
      this.ghostEl.style.left = `${this.measureText(value)}px`;
      this.ghostEl.dataset.visible = '1';
      this.wrapEl.classList.add('has-ghost');
      return;
    }

    if (!first.toLowerCase().startsWith(current.toLowerCase()) || first.length <= current.length) {
      return;
    }

    this.ghostEl.textContent = first.slice(current.length);
    this.ghostEl.style.left = `${this.measureText(value)}px`;
    this.ghostEl.dataset.visible = '1';
    this.wrapEl.classList.add('has-ghost');
  }

  /** Real-terminal Tab: complete current word (or offer next word), cycle on repeat. */
  private applyTab(e: KeyboardEvent): void {
    e.preventDefault();
    const value = this.inputEl.value;
    const { head, current, afterSpace } = parseLine(value);
    const cycleKey = `${head.join(' ')}|${afterSpace ? '' : current}`;

    if (!value && this.hint) {
      const firstWord = this.hint.split(/\s+/)[0]!;
      this.inputEl.value = firstWord;
      this.wordCycle = [firstWord];
      this.wordIdx = 0;
      this.wordKey = firstWord;
      this.focus();
      this.syncGhost();
      return;
    }

    const options = this.nextWords(head, afterSpace ? '' : current);
    if (!options.length) {
      this.syncGhost();
      return;
    }

    if (cycleKey !== this.wordKey || !this.wordCycle.length) {
      this.wordKey = cycleKey;
      this.wordCycle = options;
      this.wordIdx = 0;
    } else {
      this.wordIdx = (this.wordIdx + 1) % this.wordCycle.length;
    }

    const chosen = this.wordCycle[this.wordIdx] ?? options[0]!;
    const headText = head.length ? `${head.join(' ')} ` : '';
    this.inputEl.value = `${headText}${chosen}`;
    this.focus();
    this.syncGhost();

    if (this.wordCycle.length > 1) {
      const preview = this.wordCycle.slice(0, 6).join(' · ');
      this.hintEl.hidden = false;
      this.hintEl.innerHTML = `Tab word <strong>${this.wordIdx + 1}/${this.wordCycle.length}</strong>: <code>${escapeHtml(preview)}</code>${
        this.wordCycle.length > 6 ? ' …' : ''
      }`;
    } else if (this.hint) {
      this.hintEl.innerHTML = `${escapeHtml(ui().nextPrompt)}: <code>${escapeHtml(this.hint)}</code> <span class="par-note">· ${escapeHtml(ui().tabFillsWord)}</span>`;
    }
  }

  private onKey(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      this.applyTab(e);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      this.inputEl.value = '';
      this.wordCycle = [];
      this.wordKey = '';
      this.syncGhost();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (document.querySelector('.overlay .modal')) return;
      const value = this.inputEl.value;
      this.inputEl.value = '';
      const trimmed = value.trim();
      if (trimmed) {
        this.history.push(trimmed);
        this.historyIdx = this.history.length;
      }
      this.wordCycle = [];
      this.wordKey = '';
      this.onSubmit(value);
      this.focus();
      this.syncGhost();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!this.history.length) return;
      if (this.historyIdx === this.history.length) this.draft = this.inputEl.value;
      this.historyIdx = Math.max(0, this.historyIdx - 1);
      this.inputEl.value = this.history[this.historyIdx] ?? '';
      this.wordCycle = [];
      this.syncGhost();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!this.history.length) return;
      this.historyIdx = Math.min(this.history.length, this.historyIdx + 1);
      this.inputEl.value =
        this.historyIdx >= this.history.length ? this.draft : (this.history[this.historyIdx] ?? '');
      this.wordCycle = [];
      this.syncGhost();
    }
  }
}

/** Legacy handles adaptor for backwards compatibility. */
export interface TerminalHandles {
  root: HTMLElement;
  print: (text: string, kind?: LogKind) => void;
  clear: () => void;
  focus: () => void;
  onSubmit: (line: string) => void;
}

export function createTerminal(
  parent: HTMLElement,
  onSubmit: (line: string) => void,
): TerminalHandles {
  const root = document.createElement('div');
  root.className = 'terminal-wrap';
  parent.appendChild(root);

  const termView = new TerminalView(root, onSubmit);

  return {
    root,
    print: (text: string, kind: LogKind = 'out') => termView.push(kind, text),
    clear: () => termView.clear(),
    focus: () => termView.focus(),
    onSubmit,
  };
}
