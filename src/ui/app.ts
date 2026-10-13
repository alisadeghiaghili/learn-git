/** App shell — toolbar, board, terminal, goal dock, levels panel. */

import type { CommandResult, LevelDef, RepoState } from '../engine/types';
import { cloneState, emptyState, sandboxState } from '../engine/state';
import { execCommand, runCommands, type ExecContext } from '../engine/commands';
import { checkGoal, goalSatisfied } from '../engine/compare';
import { whyFor, formatWhy, FIELD_NOTES } from '../engine/coach';
import { createBoard, type BoardHandles } from './board';
import { createTerminal, type TerminalHandles } from './terminal';
import { showModal, renderMarkdown } from './dialog';
import { burstConfetti } from './confetti';
import { loadProgress, markSolved, bestCount, isSolved } from './progress';
import { buildSolutionStatus } from './ui-help';
import { allLevels, seriesOrder } from '../levels';
import { shortSha } from '../engine/hash';
import { currentTip, isClean, stagedPaths, untrackedPaths, unstagedPaths } from '../engine/state';
import { REPO_URL, COFFEE_URL } from './share';
import { getLang, setLang, onLangChange, LANGS } from '../i18n/lang';
import { ui } from '../i18n/ui';
import { getLevelText } from '../i18n/levels';
import { getTopic, allTopics } from '../learning';

/** Localized series (section) names; English is identity. */
const SERIES_NAMES: Record<'en' | 'fa' | 'de', Record<string, string>> = {
  en: {},
  fa: {
    Basics: 'مبانی',
    'Diff & Show': 'تفاوت و نمایش',
    Branching: 'شاخه‌بندی',
    Remotes: 'ریموت‌ها',
    Undo: 'واگرد',
    'History craft': 'ساخت تاریخچه',
    'Field practice': 'تمرین عملی',
  },
  de: {
    Basics: 'Basics',
    'Diff & Show': 'Diff & Show',
    Branching: 'Branching',
    Remotes: 'Remotes',
    Undo: 'Rückgängig',
    'History craft': 'Historie',
    'Field practice': 'Praxis',
  },
};

export class App {
  private root: HTMLElement;
  private state: RepoState;
  private level?: LevelDef;
  private startSnapshot!: RepoState;
  private undoStack: RepoState[] = [];
  private board!: BoardHandles;
  private term!: TerminalHandles;
  private dock!: HTMLElement;
  private levelNameEl!: HTMLElement;
  private solved = false;
  private commandCount = 0;

  constructor(root: HTMLElement) {
    this.root = root;
    this.state = sandboxState();
    this.renderShell();
    onLangChange(() => this.onLanguageChange());
    this.term.print('LearnGit — teaching simulator (not a real git binary)', 'meta');
    this.term.print('Type `help` for commands, or open Levels to start a drill.', 'meta');
    this.term.print('');
    this.refresh();
    this.term.focus();
  }

  /** Re-render all localized chrome when the language switches. */
  private onLanguageChange(): void {
    this.term.print('', 'meta');
    this.refresh();
    if (this.level) this.showLevelIntro(this.level);
  }

  /** Localized text for the current level (falls back to English inline). */
  private levelText() {
    return getLevelText(this.level!, getLang());
  }

  /** Localized series name (English identity fallback). */
  private seriesName(name: string): string {
    return SERIES_NAMES[getLang()][name] ?? name;
  }

  /** Localized short label for a goal-check kind, falling back to English. */
  private goalLabel(kind: string): string {
    return ui(getLang()).goalLabels[kind] ?? kind;
  }

  /** Open the from-zero knowledge library. */
  private openLearn(): void {
    const S = ui(getLang());
    let body = `<p>${escapeHtml(S.learn.subtitle)}</p><div class="level-list">`;
    for (const t of allTopics(getLang())) {
      body += `<button type="button" class="level-row" data-topic="${escapeHtml(t.id)}"><span class="name">${escapeHtml(t.title)}</span></button>`;
    }
    body += `</div>`;
    const modal = showModal({
      title: S.learn.title,
      bodyHtml: body,
      actions: [{ label: S.modal.close, className: 'ghost', onClick: () => this.term.focus() }],
      onClose: () => this.term.focus(),
    });
    modal.el.querySelectorAll('[data-topic]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.topic;
        modal.close();
        if (id) this.openTopic(id);
      });
    });
  }

  /** Open the full from-zero / mindset / industry explanation for one topic. */
  private openTopic(id: string): void {
    const t = getTopic(id, getLang());
    if (!t) {
      this.term.print(`unknown topic "${id}"`, 'err');
      return;
    }
    const S = ui(getLang());
    const md = [
      `**${t.title}**`,
      '',
      `## ${S.learn.fromZero}`,
      ...t.fromZero.map((s) => `- **${s.level}** — ${s.body}`),
      '',
      `## ${S.learn.mindset}`,
      t.mindset,
      '',
      `## ${S.learn.industry}`,
      ...t.industry.map((n) => `- ${n}`),
    ].join('\n');
    showModal({
      title: t.title,
      bodyHtml: renderMarkdown(md),
      actions: [{ label: S.modal.close, className: 'primary', onClick: () => this.term.focus() }],
      onClose: () => this.term.focus(),
    });
  }

  /** Show the level's localized intro dialog. */
  private showLevelIntro(level: LevelDef): void {
    const S = ui(getLang());
    const lt = getLevelText(level, getLang());
    if (!lt.startDialog.length) return;
    const md = lt.startDialog.map((s) => `### ${s.title ?? lt.name}\n\n${s.markdown}`).join('\n\n');
    showModal({
      title: lt.name,
      bodyHtml: renderMarkdown(md),
      actions: [{ label: S.modal.start, className: 'primary', onClick: () => this.term.focus() }],
      onClose: () => this.term.focus(),
    });
  }

  private renderShell(): void {
    this.root.innerHTML = '';

    const S = ui(getLang());
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    toolbar.innerHTML = `
      <div class="brand">Learn<span>Git</span></div>
      <div class="level-name"></div>
      <span class="lang-switch" role="group" aria-label="Language">
        ${LANGS.map((l) => `<button type="button" data-lang="${l}" class="lang-btn${l === getLang() ? ' active' : ''}">${l.toUpperCase()}</button>`).join('')}
      </span>
      <button data-action="learn" type="button">${S.toolbar.learn}</button>
      <button data-action="levels" type="button">${S.toolbar.levels}</button>
      <button data-action="goal" type="button">${S.toolbar.goal}</button>
      <button data-action="hint" type="button">${S.toolbar.hint}</button>
      <button data-action="solution" type="button">${S.toolbar.solution}</button>
      <button data-action="undo" type="button">${S.toolbar.undo}</button>
      <button data-action="reset" type="button">${S.toolbar.reset}</button>
      <button data-action="sandbox" type="button">${S.toolbar.sandbox}</button>
      <a href="${REPO_URL}" target="_blank" rel="noopener noreferrer" style="color:var(--haze);font-size:12px;text-decoration:none;margin-left:4px">${S.toolbar.github}</a>
      <a href="${COFFEE_URL}" target="_blank" rel="noopener noreferrer" style="color:var(--work);font-size:12px;text-decoration:none">${S.toolbar.coffee}</a>
    `;
    this.root.appendChild(toolbar);
    this.levelNameEl = toolbar.querySelector('.level-name') as HTMLElement;

    toolbar.querySelectorAll('[data-lang]').forEach((el) => {
      el.addEventListener('click', () => setLang((el as HTMLElement).dataset.lang as 'en' | 'fa' | 'de'));
    });
    toolbar.querySelector('[data-action="learn"]')!.addEventListener('click', () => this.openLearn());
    toolbar.querySelector('[data-action="levels"]')!.addEventListener('click', () => this.openLevels());
    toolbar.querySelector('[data-action="goal"]')!.addEventListener('click', () => {
      this.dock.classList.toggle('hidden');
      this.dock.style.display = this.dock.style.display === 'none' ? '' : this.dock.style.display === '' ? 'none' : '';
    });
    toolbar.querySelector('[data-action="hint"]')!.addEventListener('click', () => {
      this.term.print(this.level ? this.levelText().hint : ui(getLang()).dock.sandboxHint, 'meta');
    });
    toolbar.querySelector('[data-action="solution"]')!.addEventListener('click', () => {
      const sol = this.level?.solution ?? [];
      this.term.print(sol.length ? sol.join('\n') : 'No solution in sandbox.', 'meta');
    });
    toolbar.querySelector('[data-action="undo"]')!.addEventListener('click', () => this.undo());
    toolbar.querySelector('[data-action="reset"]')!.addEventListener('click', () => this.resetLevel());
    toolbar.querySelector('[data-action="sandbox"]')!.addEventListener('click', () => this.enterSandbox());

    const mainWrap = document.createElement('div');
    mainWrap.style.display = 'flex';
    mainWrap.style.flexDirection = 'column';
    mainWrap.style.flex = '1';
    mainWrap.style.minHeight = '0';
    this.root.appendChild(mainWrap);

    this.board = createBoard(mainWrap, () => ui(getLang()).board);

    const main = document.createElement('div');
    main.className = 'main';
    mainWrap.appendChild(main);

    this.term = createTerminal(main, (line) => this.handleLine(line));

    this.dock = document.createElement('aside');
    this.dock.className = 'dock';
    main.appendChild(this.dock);

    this.startSnapshot = cloneState(this.state);
  }

  private handleLine(raw: string): void {
    const lower = raw.trim().toLowerCase();
    if (lower === 'levels' || lower === 'level') {
      this.term.print(`learngit › ${raw}`, 'cmd');
      this.openLevels();
      return;
    }
    if (this.level && isSolved(this.level.id)) {
      // still allow commands after solve
    }
    const lt = this.level ? this.levelText() : undefined;
    const ctx: ExecContext = {
      state: this.state,
      levelId: this.level?.id,
      goalText: this.level && lt
        ? `${lt.objective}\n\nChecks:\n${checkGoal(this.level.goal, this.state)
            .map((c) => `${c.ok ? '[x]' : '[ ]'} ${this.goalLabel(c.kind)} — ${c.detail}`)
            .join('\n')}`
        : undefined,
      solution: this.level?.solution,
      hint: lt?.hint,
      lesson: lt ? lt.startDialog.map((s) => `### ${s.title ?? lt.name}\n\n${s.markdown}`).join('\n\n') : undefined,
    };

    this.undoStack.push(cloneState(this.state));
    if (this.undoStack.length > 40) this.undoStack.shift();

    const result = execCommand(raw, ctx);
    if (result.ok) {
      this.term.print(result.output, 'out');
      const why = whyFor(raw.trim());
      if (why && (raw.includes('add') || raw.includes('commit') || raw.includes('merge') || raw.includes('rebase') || raw.includes('reset') || raw.includes('revert') || raw.includes('push') || raw.includes('stash') || raw.includes('tag') || raw.includes('switch'))) {
        this.term.print(formatWhy(why), 'why');
      }
    } else {
      this.term.print(result.error ?? 'error', 'err');
    }

    this.commandCount++;
    this.refresh(result.effect);
    this.checkSolved();
  }

  private checkSolved(): void {
    if (!this.level || this.solved) return;
    if (goalSatisfied(this.level.goal, this.state)) {
      this.solved = true;
      markSolved(this.level.id, this.commandCount);
      burstConfetti();
      const S = ui(getLang());
      const lt = this.levelText();
      const best = bestCount(this.level.id);
      this.term.print(`\n✓ ${S.modal.solvedTitle}: ${lt.name} (${this.commandCount} · par ${this.level.par})`, 'ok');
      showModal({
        title: S.modal.solvedTitle,
        bodyHtml: renderMarkdown(
          [
            `**${lt.name}**`,
            '',
            `${S.dock.commandsUsed(this.commandCount)} · ${S.levels.par(this.level.par)}${best != null ? ` · ${S.levels.best(best)}` : ''}`,
            '',
            ...(lt.fieldNotes?.length ? [`**${S.dock.fieldNotes}**`, ...lt.fieldNotes.map((n) => `- ${n}`)] : []),
          ].join('\n'),
        ),
        actions: [
          { label: S.modal.stay, className: 'ghost', onClick: () => this.refresh() },
          { label: S.modal.next, className: 'primary', onClick: () => this.nextLevel() },
        ],
      });
      this.refresh();
    }
  }

  private nextLevel(): void {
    const idx = allLevels.findIndex((l) => l.id === this.level?.id);
    const next = allLevels[idx + 1];
    if (next) this.loadLevel(next);
    else this.enterSandbox();
  }

  private undo(): void {
    const prev = this.undoStack.pop();
    if (!prev) {
      this.term.print('nothing to undo', 'meta');
      return;
    }
    this.state = prev;
    this.term.print('undid last command', 'meta');
    this.refresh();
  }

  private resetLevel(): void {
    if (!this.level) {
      this.state = sandboxState();
      this.startSnapshot = cloneState(this.state);
      this.undoStack = [];
      this.commandCount = 0;
      this.term.print('sandbox reset', 'meta');
      this.refresh();
      return;
    }
    this.state = cloneState(this.startSnapshot);
    this.undoStack = [];
    this.commandCount = 0;
    this.solved = false;
    this.term.print('level reset', 'meta');
    this.refresh();
  }

  private enterSandbox(): void {
    this.level = undefined;
    this.state = sandboxState();
    this.startSnapshot = cloneState(this.state);
    this.undoStack = [];
    this.commandCount = 0;
    this.solved = false;
    this.term.print('entered sandbox', 'meta');
    this.refresh();
  }

  private openLevels(): void {
    const S = ui(getLang());
    const progress = loadProgress();
    let body = `<p>${escapeHtml(S.levels.subtitle)}</p>`;
    for (const series of seriesOrder) {
      const items = allLevels.filter((l) => l.series === series);
      if (!items.length) continue;
      body += `<div class="series-block"><h3>${escapeHtml(this.seriesName(series))}</h3><div class="level-list">`;
      for (const l of items) {
        const solved = !!progress[l.id]?.solved;
        const best = progress[l.id]?.bestCommands;
        const ltext = getLevelText(l, getLang());
        body += `
          <button type="button" class="level-row${this.level?.id === l.id ? ' active' : ''}${solved ? ' solved' : ''}" data-level="${l.id}">
            <span class="name">${escapeHtml(ltext.name)}</span>
            <span class="par-note">${escapeHtml(S.levels.par(l.par))}${best != null ? ` · ${escapeHtml(S.levels.best(best))}` : ''}</span>
            <span class="chip ${solved ? 'ok' : ''}">${solved ? escapeHtml(S.levels.solved) : '★'.repeat(l.difficulty) + '☆'.repeat(5 - l.difficulty)}</span>
          </button>`;
      }
      body += `</div></div>`;
    }

    const modal = showModal({
      title: S.levels.title,
      bodyHtml: body,
      actions: [{ label: S.modal.close, className: 'ghost', onClick: () => this.term.focus() }],
      onClose: () => this.term.focus(),
    });

    modal.el.querySelectorAll('[data-level]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.level;
        const lvl = allLevels.find((l) => l.id === id);
        modal.close();
        if (lvl) this.loadLevel(lvl);
      });
    });
  }

  private loadLevel(level: LevelDef): void {
    this.level = level;
    this.state = cloneState(level.startState);
    this.startSnapshot = cloneState(level.startState);
    this.undoStack = [];
    this.commandCount = 0;
    this.solved = false;
    const lt = getLevelText(level, getLang());
    this.term.print(`\n── ${this.seriesName(level.series)} · ${lt.name} ──`, 'meta');
    this.term.print(lt.objective, 'meta');
    this.showLevelIntro(level);
    this.refresh();
  }

  private refresh(effect?: string): void {
    this.board.update(this.state);
    if (effect) this.board.flash(effect);
    this.levelNameEl.textContent = this.level
      ? `${this.seriesName(this.level.series)} · ${this.levelText().name}`
      : ui(getLang()).dock.sandbox;
    this.renderDock();
  }

  private renderDock(): void {
    const S = ui(getLang());
    const level = this.level;
    if (!level) {
      this.dock.innerHTML = `
        <h3>${escapeHtml(S.dock.sandbox)}</h3>
        <div class="objective">${renderMarkdown(S.dock.sandboxHint)}</div>
        <div class="field-notes">${FIELD_NOTES.slice(0, 3).map((n) => `• ${escapeHtml(n)}`).join('<br>')}</div>
        <h3>${escapeHtml(S.dock.liveStatus)}</h3>
        <div class="check-list">
          ${this.liveStatusHtml()}
        </div>
      `;
      return;
    }

    const lt = getLevelText(level, getLang());
    const checks = checkGoal(level.goal, this.state);
    const steps = buildSolutionStatus(level.solution, this.state.commandHistory);
    const best = bestCount(level.id);

    this.dock.innerHTML = `
      ${this.solved ? `<div class="solved-banner">${escapeHtml(S.dock.solvedBanner(this.commandCount, best ?? undefined))}</div>` : ''}
      <h3>${escapeHtml(S.dock.objective)}</h3>
      <div class="objective">${escapeHtml(lt.objective)}</div>
      <h3>${escapeHtml(S.dock.learning)}</h3>
      <div class="learning-list">${lt.startDialog.length ? this.learningChipsHtml(level.learning) : ''}</div>
      <h3>${escapeHtml(S.dock.goalChecks)}</h3>
      <div class="check-list">
        ${checks
          .map(
            (c) =>
              `<div class="check-item ${c.ok ? 'ok' : 'fail'}"><span class="mark">${c.ok ? '✓' : '○'}</span><span><strong>${escapeHtml(this.goalLabel(c.kind))}</strong><br><span style="color:var(--haze)">${escapeHtml(c.detail)}</span></span></div>`,
          )
          .join('')}
      </div>
      <h3>${escapeHtml(S.dock.parLine(level.par, level.difficulty))}</h3>
      <div class="par-line">${escapeHtml(S.dock.commandsUsed(this.commandCount))}</div>
      <h3>${escapeHtml(S.dock.solutionSteps)}</h3>
      <div class="check-list">
        ${steps
          .map(
            (s) =>
              `<div class="check-item ${s.done ? 'ok' : 'fail'}"><span class="mark">${s.done ? '✓' : '○'}</span><span><code style="font-family:var(--font-mono);font-size:11px">${escapeHtml(s.command)}</code><br><span style="color:var(--haze)">${escapeHtml(s.optional ? S.dock.optional : S.dock.required)}</span></span></div>`,
          )
          .join('')}
      </div>
      ${
        lt.fieldNotes?.length
          ? `<h3>${escapeHtml(S.dock.fieldNotes)}</h3><div class="field-notes">${lt.fieldNotes.map((n) => escapeHtml(n)).join('<br><br>')}</div>`
          : ''
      }
    `;
    // Make each "you are learning" chip open its from-zero topic.
    this.dock.querySelectorAll('[data-topic]').forEach((el) => {
      el.addEventListener('click', () => this.openTopic((el as HTMLElement).dataset.topic!));
    });
  }

  /** Learning chips that show the localized topic title and open its lesson. */
  private learningChipsHtml(learning: string[]): string {
    return learning
      .map((id) => {
        const t = getTopic(id, getLang());
        if (!t) return `<span class="chip">${escapeHtml(id)}</span>`;
        return `<button type="button" class="chip chip-topic" data-topic="${escapeHtml(id)}" title="${escapeHtml(t.title)}">${escapeHtml(t.title)}</button>`;
      })
      .join('');
  }

  private liveStatusHtml(): string {
    const st = ui(getLang()).status;
    const s = this.state;
    const tip = s.hasCommits ? shortSha(currentTip(s)) : '—';
    return [
      row(st.branch, s.detachedHead ? `detached @ ${tip}` : s.HEAD),
      row(st.head, tip),
      row(st.clean, isClean(s) ? 'yes' : 'no'),
      row(st.staged, stagedPaths(s).join(', ') || '—'),
      row(st.unstaged, unstagedPaths(s).join(', ') || '—'),
      row(st.untracked, untrackedPaths(s).join(', ') || '—'),
      row(st.commits, String(s.commits.length)),
      row(st.remotes, s.remotes.map((r) => r.name).join(', ') || '—'),
    ].join('');

    function row(k: string, v: string): string {
      return `<div class="check-item ok"><span class="mark">·</span><span><strong>${escapeHtml(k)}</strong>: ${escapeHtml(v)}</span></div>`;
    }
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export { emptyState, runCommands };
export type { CommandResult };
