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
import { loadProgress, markSolved, bestCount, isSolved, openShareUrl, copyText } from './progress';
import { buildSolutionStatus } from './ui-help';
import { allLevels, seriesOrder } from '../levels';
import { shortSha } from '../engine/hash';
import { currentTip, isClean, stagedPaths, untrackedPaths, unstagedPaths } from '../engine/state';
import { REPO_URL, COFFEE_URL } from './share';

export class App {
  private root: HTMLElement;
  private state: RepoState;
  private level?: LevelDef;
  private startSnapshot!: RepoState;
  private undoStack: RepoState[] = [];
  private board!: BoardHandles;
  private term!: TerminalHandles;
  private dock!: HTMLElement;
  private levelsPanel?: HTMLElement;
  private levelNameEl!: HTMLElement;
  private solved = false;
  private commandCount = 0;

  constructor(root: HTMLElement) {
    this.root = root;
    this.state = sandboxState();
    this.renderShell();
    this.term.print('LearnGit — teaching simulator (not a real git binary)', 'meta');
    this.term.print('Type `help` for commands, or open Levels to start a drill.', 'meta');
    this.term.print('');
    this.refresh();
    this.term.focus();
  }

  private renderShell(): void {
    this.root.innerHTML = '';

    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    toolbar.innerHTML = `
      <div class="brand">Learn<span>Git</span></div>
      <div class="level-name"></div>
      <button data-action="levels" type="button">Levels</button>
      <button data-action="goal" type="button">Goal</button>
      <button data-action="hint" type="button">Hint</button>
      <button data-action="solution" type="button">Solution</button>
      <button data-action="undo" type="button">Undo</button>
      <button data-action="reset" type="button">Reset</button>
      <button data-action="sandbox" type="button">Sandbox</button>
      <a href="${REPO_URL}" target="_blank" rel="noopener noreferrer" style="color:var(--haze);font-size:12px;text-decoration:none;margin-left:4px">GitHub</a>
      <a href="${COFFEE_URL}" target="_blank" rel="noopener noreferrer" style="color:var(--work);font-size:12px;text-decoration:none">Buy me a coffee</a>
    `;
    this.root.appendChild(toolbar);
    this.levelNameEl = toolbar.querySelector('.level-name') as HTMLElement;

    toolbar.querySelector('[data-action="levels"]')!.addEventListener('click', () => this.toggleLevels());
    toolbar.querySelector('[data-action="goal"]')!.addEventListener('click', () => {
      this.dock.classList.toggle('hidden');
      this.dock.style.display = this.dock.style.display === 'none' ? '' : this.dock.style.display === '' ? 'none' : '';
    });
    toolbar.querySelector('[data-action="hint"]')!.addEventListener('click', () => {
      this.term.print(this.level?.hint ?? 'No hint in sandbox.', 'meta');
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

    this.board = createBoard(mainWrap);

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
    if (this.level && isSolved(this.level.id)) {
      // still allow commands after solve
    }
    const ctx: ExecContext = {
      state: this.state,
      levelId: this.level?.id,
      goalText: this.level
        ? `${this.level.objective}\n\nChecks:\n${checkGoal(this.level.goal, this.state)
            .map((c) => `${c.ok ? '[x]' : '[ ]'} ${c.label} — ${c.detail}`)
            .join('\n')}`
        : undefined,
      solution: this.level?.solution,
      hint: this.level?.hint,
      lesson: this.level
        ? this.level.startDialog.map((s) => `### ${s.title ?? this.level!.name}\n\n${s.markdown}`).join('\n\n')
        : undefined,
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
      this.term.print(`\n✓ Level solved: ${this.level.name} (${this.commandCount} commands, par ${this.level.par})`, 'ok');
      showModal({
        title: 'Level solved',
        bodyHtml: renderMarkdown(
          [
            `**${this.level.name}**`,
            '',
            `Commands: ${this.commandCount} · Par: ${this.level.par}${bestCount(this.level.id) != null ? ` · Best: ${bestCount(this.level.id)}` : ''}`,
            '',
            ...(this.level.fieldNotes?.length ? ['**Field notes**', ...this.level.fieldNotes.map((n) => `- ${n}`)] : []),
          ].join('\n'),
        ),
        actions: [
          { label: 'Stay here', className: 'ghost', onClick: () => this.refresh() },
          { label: 'Next level', className: 'primary', onClick: () => this.nextLevel() },
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

  private toggleLevels(): void {
    if (this.levelsPanel) {
      this.levelsPanel.remove();
      this.levelsPanel = undefined;
      return;
    }
    const panel = document.createElement('div');
    panel.className = 'levels-panel';
    const progress = loadProgress();
    let html = `<h2>Levels</h2>`;
    for (const series of seriesOrder) {
      const items = allLevels.filter((l) => l.series === series);
      if (!items.length) continue;
      html += `<div class="series-block"><h4>${series}</h4>`;
      for (const l of items) {
        const solved = !!progress[l.id]?.solved;
        const best = progress[l.id]?.bestCommands;
        html += `
          <div class="level-item${this.level?.id === l.id ? ' active' : ''}" data-level="${l.id}">
            <div>
              <div>${escapeHtml(l.name)}</div>
              <div class="stars">${'★'.repeat(l.difficulty)}${'☆'.repeat(5 - l.difficulty)} · par ${l.par}${best != null ? ` · best ${best}` : ''}</div>
            </div>
            <div class="solved">${solved ? '✓' : ''}</div>
          </div>`;
      }
      html += `</div>`;
    }
    html += `<button type="button" data-action="share" style="width:100%;margin-top:12px;padding:8px;border-radius:6px;border:1px solid #2E3D4D;background:#22303C;color:#E8EEF4;cursor:pointer">Copy share link</button>`;
    panel.innerHTML = html;
    panel.querySelectorAll('[data-level]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.level;
        const lvl = allLevels.find((l) => l.id === id);
        if (lvl) this.loadLevel(lvl);
      });
    });
    panel.querySelector('[data-action="share"]')?.addEventListener('click', () => {
      void copyText(openShareUrl());
    });
    document.body.appendChild(panel);
    this.levelsPanel = panel;
  }

  private loadLevel(level: LevelDef): void {
    this.level = level;
    this.state = cloneState(level.startState);
    this.startSnapshot = cloneState(level.startState);
    this.undoStack = [];
    this.commandCount = 0;
    this.solved = false;
    this.term.print(`\n── Level: ${level.name} (${level.series}) ──`, 'meta');
    this.term.print(level.objective, 'meta');
    if (level.startDialog.length) {
      const md = level.startDialog.map((s) => `### ${s.title ?? level.name}\n\n${s.markdown}`).join('\n\n');
      showModal({
        title: level.name,
        bodyHtml: renderMarkdown(md),
        actions: [
          { label: 'Start', className: 'primary', onClick: () => this.term.focus() },
        ],
      });
    }
    this.levelsPanel?.remove();
    this.levelsPanel = undefined;
    this.refresh();
  }

  private refresh(effect?: string): void {
    this.board.update(this.state);
    if (effect) this.board.flash(effect);
    this.levelNameEl.textContent = this.level
      ? `${this.level.series} · ${this.level.name}`
      : 'Sandbox';
    this.renderDock();
  }

  private renderDock(): void {
    const level = this.level;
    if (!level) {
      this.dock.innerHTML = `
        <h3>Sandbox</h3>
        <div class="objective">Free-form Git simulation. Try <code style="font-family:var(--font-mono)">help</code>, <code style="font-family:var(--font-mono)">curriculum</code>, <code style="font-family:var(--font-mono)">field</code>, or open <strong>Levels</strong>.</div>
        <div class="field-notes">${FIELD_NOTES.slice(0, 3).map((n) => `• ${escapeHtml(n)}`).join('<br>')}</div>
        <h3>Live status</h3>
        <div class="check-list">
          ${this.liveStatusHtml()}
        </div>
      `;
      return;
    }

    const checks = checkGoal(level.goal, this.state);
    const steps = buildSolutionStatus(level.solution, this.state.commandHistory);
    const best = bestCount(level.id);

    this.dock.innerHTML = `
      ${this.solved ? `<div class="solved-banner">SOLVED · ${this.commandCount} cmds${best != null ? ` · best ${best}` : ''}</div>` : ''}
      <h3>Objective</h3>
      <div class="objective">${escapeHtml(level.objective)}</div>
      <h3>You are learning</h3>
      <div class="learning-list">${level.learning.map((l) => `<span class="chip">${escapeHtml(l)}</span>`).join('')}</div>
      <h3>Goal checks</h3>
      <div class="check-list">
        ${checks
          .map(
            (c) =>
              `<div class="check-item ${c.ok ? 'ok' : 'fail'}"><span class="mark">${c.ok ? '✓' : '○'}</span><span><strong>${escapeHtml(c.label)}</strong><br><span style="color:var(--haze)">${escapeHtml(c.detail)}</span></span></div>`,
          )
          .join('')}
      </div>
      <h3>Par · ${level.par} · difficulty ${'★'.repeat(level.difficulty)}</h3>
      <div class="par-line">commands used: ${this.commandCount}</div>
      <h3>Solution steps</h3>
      <div class="check-list">
        ${steps
          .map(
            (s) =>
              `<div class="check-item ${s.done ? 'ok' : 'fail'}"><span class="mark">${s.done ? '✓' : '○'}</span><span><code style="font-family:var(--font-mono);font-size:11px">${escapeHtml(s.command)}</code><br><span style="color:var(--haze)">${escapeHtml(s.note)}</span></span></div>`,
          )
          .join('')}
      </div>
      ${
        level.fieldNotes?.length
          ? `<h3>Field notes</h3><div class="field-notes">${level.fieldNotes.map((n) => escapeHtml(n)).join('<br><br>')}</div>`
          : ''
      }
    `;
  }

  private liveStatusHtml(): string {
    const s = this.state;
    const tip = s.hasCommits ? shortSha(currentTip(s)) : '—';
    return [
      row('branch', s.detachedHead ? `detached @ ${tip}` : s.HEAD),
      row('HEAD', tip),
      row('clean', isClean(s) ? 'yes' : 'no'),
      row('staged', stagedPaths(s).join(', ') || '—'),
      row('unstaged', unstagedPaths(s).join(', ') || '—'),
      row('untracked', untrackedPaths(s).join(', ') || '—'),
      row('commits', String(s.commits.length)),
      row('remotes', s.remotes.map((r) => r.name).join(', ') || '—'),
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
