/** Board: Working Tree → Staging → Repo → Remote. */

import type { RepoState, WorkspaceFile } from '../engine/types';
import { shortSha } from '../engine/hash';
import { currentTip, stagedPaths } from '../engine/state';
import { ui } from '../i18n';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderFileCardHtml(f: WorkspaceFile, mode: 'work' | 'stage'): string {
  const cls = ['card'];
  if (f.gitignored) cls.push('ignored');
  else if (f.staged) cls.push('staged');
  else if (f.tracked && f.headBlob !== f.contentId) cls.push('dirty');
  else if (f.tracked) cls.push('tracked');
  const status = f.gitignored
    ? 'gitignored'
    : f.deleted
      ? 'deleted'
      : !f.present
        ? 'missing'
        : !f.tracked
          ? 'untracked'
          : f.headBlob !== f.contentId
            ? 'modified'
            : 'clean';
  return `
    <div class="${cls.join(' ')}">
      <div class="path">${escapeHtml(f.path)}</div>
      <div class="meta">${status} · ${shortSha(f.contentId)}${mode === 'stage' ? ' · staged' : ''}</div>
    </div>
  `;
}

export function renderBoardHtml(state: RepoState): string {
  const u = ui();
  const workFiles = Object.values(state.files).filter((f) => f.present || f.deleted);
  const workHtml = workFiles.length
    ? workFiles.sort((a, b) => a.path.localeCompare(b.path)).map((f) => renderFileCardHtml(f, 'work')).join('')
    : `<div class="empty-hint">${escapeHtml(u.workingTreeEmpty)}</div>`;

  const staged = stagedPaths(state);
  const stageHtml = staged.length
    ? staged.map((p) => {
        const f = state.files[p];
        return f ? renderFileCardHtml(f, 'stage') : '';
      }).join('')
    : `<div class="empty-hint">${escapeHtml(u.stagingEmpty)}</div>`;

  const tip = currentTip(state);
  const recent = state.commits.slice(-4).reverse();
  const repoHtml = recent.length
    ? recent.map((c) => `
        <div class="card commit-chip">
          <div class="path">${escapeHtml(c.message)}</div>
          <div class="meta">${shortSha(c.hash)}${c.hash === tip ? ' · HEAD' : ''} · ${c.parents.length} parent(s)</div>
        </div>
      `).join('')
    : `<div class="empty-hint">${escapeHtml(u.repoEmpty)}</div>`;

  let remoteHtml = '';
  if (!state.remotes.length && !state.remoteBranches.length) {
    remoteHtml = `<div class="empty-hint">${escapeHtml(u.remoteEmpty)}</div>`;
  } else {
    remoteHtml = [
      ...state.remotes.map((r) => `
        <div class="card remote-chip">
          <div class="path">${escapeHtml(r.name)}</div>
          <div class="meta">${escapeHtml(r.url)}</div>
        </div>
      `),
      ...state.remoteBranches.map((rb) => `
        <div class="card remote-chip">
          <div class="path">${escapeHtml(rb.name)}</div>
          <div class="meta">${shortSha(rb.commit)}</div>
        </div>
      `),
    ].join('');
  }

  const branchChips = [
    ...state.branches.map((b) => {
      const isCur = b.name === state.HEAD && !state.detachedHead;
      return `<span class="branch-chip${isCur ? ' current' : ''}${b.upstream ? ' upstream' : ''}">${escapeHtml(b.name)}${b.upstream ? ` → ${escapeHtml(b.upstream)}` : ''}</span>`;
    }),
    ...state.tags.map((t) => `<span class="branch-chip">tag:${escapeHtml(t.name)}</span>`),
    ...(state.detachedHead ? [`<span class="branch-chip current">HEAD detached @ ${shortSha(tip)}</span>`] : []),
  ].join('');

  return `
    <div class="board">
      <div class="zone" data-zone="work">
        <div class="zone-head"><span><span class="dot"></span>${escapeHtml(u.workingTree)}</span></div>
        <div class="zone-body" data-body="work">${workHtml}</div>
      </div>
      <div class="zone" data-zone="stage">
        <div class="zone-head"><span><span class="dot"></span>${escapeHtml(u.staging)}</span></div>
        <div class="zone-body" data-body="stage">${stageHtml}</div>
      </div>
      <div class="zone" data-zone="repo">
        <div class="zone-head"><span><span class="dot"></span>${escapeHtml(u.repository)}</span></div>
        <div class="zone-body" data-body="repo">${repoHtml}</div>
      </div>
      <div class="zone" data-zone="remote">
        <div class="zone-head"><span><span class="dot"></span>${escapeHtml(u.remote)}</span></div>
        <div class="zone-body" data-body="remote">${remoteHtml}</div>
      </div>
      <div class="branch-strip" data-body="branches">${branchChips}</div>
    </div>
  `;
}

export interface BoardHandles {
  root: HTMLElement;
  update: (state: RepoState) => void;
  flash: (effect: string) => void;
}

export function createBoard(parent: HTMLElement): BoardHandles {
  const root = document.createElement('div');
  root.className = 'board-wrap';
  parent.appendChild(root);

  function update(state: RepoState): void {
    root.innerHTML = renderBoardHtml(state);
  }

  function flash(effect: string): void {
    const target =
      effect === 'stage'
        ? root.querySelector('[data-body="stage"]')
        : effect === 'commit'
          ? root.querySelector('[data-body="repo"]')
          : effect === 'push' || effect === 'pull'
            ? root.querySelector('[data-body="remote"]')
            : effect === 'branch'
              ? root.querySelector('[data-body="branches"]')
              : root.querySelector('[data-body="work"]');
    if (!target) return;
    target.querySelectorAll('.card').forEach((c) => {
      c.classList.add('slide');
      setTimeout(() => c.classList.remove('slide'), 350);
    });
  }

  return { root, update, flash };
}
