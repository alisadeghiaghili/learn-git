/** Board: Working Tree → Staging → Repo → Remote. */

import type { RepoState, WorkspaceFile } from '../engine/types';
import type { FileStatus } from '../i18n/ui';
import { shortSha } from '../engine/hash';
import { currentTip, stagedPaths, untrackedPaths, unstagedPaths } from '../engine/state';

export interface BoardLabels {
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
}

export interface BoardHandles {
  root: HTMLElement;
  update: (state: RepoState) => void;
  flash: (effect: string) => void;
}

export function createBoard(parent: HTMLElement, labels: () => BoardLabels): BoardHandles {
  const root = document.createElement('div');
  root.className = 'board';
  root.innerHTML = `
    <div class="zone" data-zone="work">
      <div class="zone-head"><span><span class="dot"></span><span data-zone-label="work"></span></span></div>
      <div class="zone-body" data-body="work"></div>
    </div>
    <div class="zone" data-zone="stage">
      <div class="zone-head"><span><span class="dot"></span><span data-zone-label="stage"></span></span></div>
      <div class="zone-body" data-body="stage"></div>
    </div>
    <div class="zone" data-zone="repo">
      <div class="zone-head"><span><span class="dot"></span><span data-zone-label="repo"></span></span></div>
      <div class="zone-body" data-body="repo"></div>
    </div>
    <div class="zone" data-zone="remote">
      <div class="zone-head"><span><span class="dot"></span><span data-zone-label="remote"></span></span></div>
      <div class="zone-body" data-body="remote"></div>
    </div>
    <div class="branch-strip" data-body="branches"></div>
  `;
  parent.appendChild(root);

  const work = root.querySelector('[data-body="work"]') as HTMLElement;
  const stage = root.querySelector('[data-body="stage"]') as HTMLElement;
  const repo = root.querySelector('[data-body="repo"]') as HTMLElement;
  const remote = root.querySelector('[data-body="remote"]') as HTMLElement;
  const branches = root.querySelector('[data-body="branches"]') as HTMLElement;

  const fs = () => labels().fileStatus;

  function fileCard(f: WorkspaceFile, mode: 'work' | 'stage'): HTMLElement {
    const el = document.createElement('div');
    const cls = ['card'];
    if (f.gitignored) cls.push('ignored');
    else if (f.staged) cls.push('staged');
    else if (f.tracked && f.headBlob !== f.contentId) cls.push('dirty');
    else if (f.tracked) cls.push('tracked');
    el.className = cls.join(' ');
    const statusKey = f.gitignored
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
    const L = labels();
    el.innerHTML = `
      <div class="path">${escapeHtml(f.path)}</div>
      <div class="meta">${escapeHtml(fs()[statusKey] ?? statusKey)} · ${shortSha(f.contentId)}${mode === 'stage' ? ` · ${escapeHtml(L.stagedTag)}` : ''}</div>
    `;
    return el;
  }

  function update(state: RepoState): void {
    const L = labels();
    // Zone titles track the active language on every render.
    for (const zone of ['work', 'stage', 'repo', 'remote'] as const) {
      const el = root.querySelector(`[data-zone-label="${zone}"]`) as HTMLElement;
      if (el) el.textContent = L[zone];
    }

    // Working tree: present files that are not purely index-only chips
    work.innerHTML = '';
    const files = Object.values(state.files).filter((f) => f.present || f.deleted);
    if (!files.length) {
      work.innerHTML = `<div class="empty-hint">${escapeHtml(L.emptyWorktree)}</div>`;
    } else {
      for (const f of files.sort((a, b) => a.path.localeCompare(b.path))) {
        work.appendChild(fileCard(f, 'work'));
      }
    }

    // Staging
    stage.innerHTML = '';
    const staged = stagedPaths(state);
    if (!staged.length) {
      stage.innerHTML = `<div class="empty-hint">${escapeHtml(L.emptyIndex)}</div>`;
    } else {
      for (const p of staged) {
        const f = state.files[p];
        if (f) stage.appendChild(fileCard(f, 'stage'));
      }
    }

    // Repo commits
    repo.innerHTML = '';
    const tip = currentTip(state);
    const recent = state.commits.slice(-4).reverse();
    if (!recent.length) {
      repo.innerHTML = `<div class="empty-hint">${escapeHtml(L.noCommits)}</div>`;
    } else {
      for (const c of recent) {
        const el = document.createElement('div');
        el.className = 'card commit-chip';
        el.innerHTML = `
          <div class="path">${escapeHtml(c.message)}</div>
          <div class="meta">${shortSha(c.hash)}${c.hash === tip ? ' · HEAD' : ''} · ${c.parents.length} parent(s)</div>
        `;
        repo.appendChild(el);
      }
    }

    // Remote
    remote.innerHTML = '';
    if (!state.remotes.length && !state.remoteBranches.length) {
      remote.innerHTML = `<div class="empty-hint">${escapeHtml(L.noRemote)}</div>`;
    } else {
      for (const r of state.remotes) {
        const el = document.createElement('div');
        el.className = 'card remote-chip';
        el.innerHTML = `<div class="path">${escapeHtml(r.name)}</div><div class="meta">${escapeHtml(r.url)}</div>`;
        remote.appendChild(el);
      }
      for (const rb of state.remoteBranches) {
        const el = document.createElement('div');
        el.className = 'card remote-chip';
        el.innerHTML = `<div class="path">${escapeHtml(rb.name)}</div><div class="meta">${shortSha(rb.commit)}</div>`;
        remote.appendChild(el);
      }
    }

    // Branch chips
    branches.innerHTML = '';
    for (const b of state.branches) {
      const el = document.createElement('span');
      el.className = 'branch-chip';
      if (b.name === state.HEAD && !state.detachedHead) el.classList.add('current');
      if (b.upstream) el.classList.add('upstream');
      el.textContent = `${b.name}${b.upstream ? ` → ${b.upstream}` : ''}`;
      branches.appendChild(el);
    }
    for (const t of state.tags) {
      const el = document.createElement('span');
      el.className = 'branch-chip';
      el.textContent = `${L.tagPrefix}${t.name}`;
      branches.appendChild(el);
    }
    if (state.detachedHead) {
      const el = document.createElement('span');
      el.className = 'branch-chip current';
      el.textContent = L.headDetached(shortSha(tip));
      branches.appendChild(el);
    }
    void untrackedPaths;
    void unstagedPaths;
  }

  function flash(effect: string): void {
    const target =
      effect === 'stage'
        ? stage
        : effect === 'commit'
          ? repo
          : effect === 'push' || effect === 'pull'
            ? remote
            : effect === 'branch'
              ? branches
              : work;
    target.querySelectorAll('.card').forEach((c) => {
      c.classList.add('slide');
      setTimeout(() => c.classList.remove('slide'), 350);
    });
  }

  return { root, update, flash };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
