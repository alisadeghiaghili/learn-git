/** Engine unit tests. */

import { describe, it, expect } from 'vitest';
import { execCommand, runCommands } from '../src/engine/commands';
import { emptyState, sandboxState, cloneState, makeFile, currentTip } from '../src/engine/state';
import { checkGoal, goalSatisfied } from '../src/engine/compare';
import { fakeSha, shortSha, commitHash } from '../src/engine/hash';
import { allLevels } from '../src/levels';

function ctx(state = emptyState()) {
  return {
    state,
    levelId: undefined as string | undefined,
    solution: [] as string[],
    hint: 'hint',
    goalText: 'goal',
    lesson: 'lesson intro',
  };
}

describe('hash', () => {
  it('is deterministic', () => {
    expect(fakeSha('abc')).toBe(fakeSha('abc'));
    expect(fakeSha('abc')).not.toBe(fakeSha('abd'));
  });
  it('shortSha truncates to 7', () => {
    expect(shortSha(fakeSha('x'))).toHaveLength(7);
  });
  it('commitHash is 7 hex chars', () => {
    expect(commitHash('m')).toMatch(/^[0-9a-f]{7}$/);
  });
});

describe('init / add / commit', () => {
  it('fails before init', () => {
    const r = execCommand('git status', ctx());
    expect(r.ok).toBe(false);
  });

  it('initializes', () => {
    const c = ctx();
    const r = execCommand('git init', c);
    expect(r.ok).toBe(true);
    expect(c.state.initialized).toBe(true);
  });

  it('stages and commits', () => {
    const c = ctx(sandboxState());
    c.state.files['notes.md'] = makeFile('notes.md', 'docs');
    expect(execCommand('git add notes.md', c).ok).toBe(true);
    expect(c.state.files['notes.md'].staged).toBe(true);
    const r = execCommand('git commit -m "add notes"', c);
    expect(r.ok).toBe(true);
    expect(c.state.files['notes.md'].tracked).toBe(true);
    expect(c.state.files['notes.md'].staged).toBe(false);
  });

  it('commit without message fails', () => {
    const c = ctx(sandboxState());
    c.state.files['notes.md'] = makeFile('notes.md', 'docs');
    execCommand('git add notes.md', c);
    expect(execCommand('git commit', c).ok).toBe(false);
  });
});

describe('status / clean', () => {
  it('reports clean sandbox', () => {
    const c = ctx(sandboxState());
    // sandbox starts with config.yaml untracked
    const r = execCommand('git status', c);
    expect(r.ok).toBe(true);
    expect(r.output).toContain('config.yaml');
  });
});

describe('branches', () => {
  it('creates and switches', () => {
    const c = ctx(sandboxState());
    expect(execCommand('git branch feature', c).ok).toBe(true);
    expect(execCommand('git switch feature', c).ok).toBe(true);
    expect(c.state.HEAD).toBe('feature');
    expect(execCommand('git switch -c other', c).ok).toBe(true);
    expect(c.state.HEAD).toBe('other');
  });

  it('deletes non-current branch', () => {
    const c = ctx(sandboxState());
    execCommand('git branch temp', c);
    expect(execCommand('git branch -d temp', c).ok).toBe(true);
    expect(c.state.branches.some((b) => b.name === 'temp')).toBe(false);
  });
});

describe('remotes and push', () => {
  it('adds remote and pushes with upstream', () => {
    const c = ctx(sandboxState());
    expect(execCommand('git remote add origin /tmp/r.git', c).ok).toBe(true);
    const r = execCommand('git push -u origin main', c);
    expect(r.ok).toBe(true);
    expect(c.state.pushCount).toBe(1);
    expect(c.state.branches.find((b) => b.name === 'main')?.upstream).toBe('origin/main');
  });
});

describe('reset modes', () => {
  it('soft reset keeps staged content', () => {
    const c = ctx(sandboxState());
    c.state.files['src/app.py'].contentId = 'changed';
    execCommand('git add src/app.py', c);
    execCommand('git commit -m "change"', c);
    const before = c.state.commits.length;
    const r = execCommand('git reset --soft HEAD~1', c);
    expect(r.ok).toBe(true);
    expect(c.state.commits.length).toBe(before); // commits stay in object store
    expect(c.state.branches.find((b) => b.name === 'main')!.commit).not.toBe(
      c.state.commits[c.state.commits.length - 1].hash,
    );
  });
});

describe('goal compare', () => {
  it('checks initialized', () => {
    expect(goalSatisfied({ kind: 'initialized', value: true }, sandboxState())).toBe(true);
  });

  it('checks commit message', () => {
    const c = ctx(sandboxState());
    c.state.files['x.txt'] = makeFile('x.txt', 'docs');
    execCommand('git add x.txt', c);
    execCommand('git commit -m "hello world"', c);
    expect(
      goalSatisfied({ kind: 'committedMessageIncludes', text: 'hello' }, c.state),
    ).toBe(true);
  });

  it('allOf requires every child', () => {
    const s = sandboxState();
    const r = checkGoal(
      {
        kind: 'allOf',
        checks: [
          { kind: 'initialized', value: true },
          { kind: 'branchExists', name: 'nope' },
        ],
      },
      s,
    );
    expect(r).toHaveLength(2);
    expect(r[0].ok).toBe(true);
    expect(r[1].ok).toBe(false);
    expect(goalSatisfied({ kind: 'allOf', checks: [{ kind: 'initialized' }] }, s)).toBe(true);
  });
});

describe('merge conflicts and detached HEAD', () => {
  it('raises a conflict when both sides change the same file', () => {
    const c = ctx(sandboxState());
    execCommand('git branch feature', c);
    execCommand('git switch feature', c);
    c.state.files['src/app.py'].contentId = 'feat-version';
    execCommand('git add src/app.py', c);
    execCommand('git commit -m "feat change"', c);
    execCommand('git switch main', c);
    c.state.files['src/app.py'].contentId = 'main-version';
    execCommand('git add src/app.py', c);
    execCommand('git commit -m "main change"', c);
    const r = execCommand('git merge feature', c);
    expect(r.ok).toBe(false);
    expect(c.state.conflicts).toContain('src/app.py');
    // resolve
    execCommand('edit src/app.py', c);
    execCommand('git add src/app.py', c);
    execCommand('git commit -m "Merge branch feature"', c);
    expect(c.state.conflicts.length).toBe(0);
    expect(c.state.conflictsResolvedCount).toBe(1);
    expect(c.state.merging).toBeUndefined();
  });

  it('merge --abort clears the conflict', () => {
    const c = ctx(sandboxState());
    execCommand('git branch feature', c);
    execCommand('git switch feature', c);
    c.state.files['src/app.py'].contentId = 'feat-version';
    execCommand('git add src/app.py', c);
    execCommand('git commit -m "feat change"', c);
    execCommand('git switch main', c);
    c.state.files['src/app.py'].contentId = 'main-version';
    execCommand('git add src/app.py', c);
    execCommand('git commit -m "main change"', c);
    execCommand('git merge feature', c);
    expect(c.state.conflicts.length).toBeGreaterThan(0);
    const r = execCommand('git merge --abort', c);
    expect(r.ok).toBe(true);
    expect(c.state.conflicts.length).toBe(0);
    expect(c.state.merging).toBeUndefined();
  });

  it('checks out a commit hash into detached HEAD and recovers with a branch', () => {
    const c = ctx(sandboxState());
    const older = c.state.commits[c.state.commits.length - 1].hash;
    const r = execCommand(`git switch ${older}`, c);
    expect(r.ok).toBe(true);
    expect(c.state.detachedHead).toBe(true);
    expect(currentTip(c.state)).toBe(older);
    const r2 = execCommand('git switch -c rescue', c);
    expect(r2.ok).toBe(true);
    expect(c.state.detachedHead).toBe(false);
    expect(c.state.HEAD).toBe('rescue');
    expect(c.state.branches.some((b) => b.name === 'rescue')).toBe(true);
  });

  it('cherry-pick accepts a branch name', () => {
    const c = ctx(sandboxState());
    execCommand('git switch -c fix', c);
    c.state.files['src/app.py'].contentId = 'fixed';
    execCommand('git add src/app.py', c);
    execCommand('git commit -m "fix crash"', c);
    execCommand('git switch main', c);
    const r = execCommand('git cherry-pick fix', c);
    expect(r.ok).toBe(true);
    expect(c.state.cherryPickCount).toBe(1);
    expect(c.state.commits.some((x) => x.message === 'fix crash')).toBe(true);
  });
});

describe('level registry', () => {
  it('has levels with unique ids and solutions', () => {
    expect(allLevels.length).toBeGreaterThan(10);
    const ids = allLevels.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of allLevels) {
      expect(l.solution.length).toBeGreaterThan(0);
      expect(l.objective.length).toBeGreaterThan(10);
    }
  });
});

describe('sandbox helpers', () => {
  it('cloneState is deep', () => {
    const a = sandboxState();
    const b = cloneState(a);
    b.files['src/app.py'].contentId = 'mutated';
    expect(a.files['src/app.py'].contentId).not.toBe('mutated');
  });

  it('runCommands stops on first failure', () => {
    const c = ctx(sandboxState());
    const err = runCommands(['git branch ok', 'git switch missing'], c);
    expect(err).not.toBeNull();
  });
});

describe('merge / rebase / stash', () => {
  it('merges with fast-forward', () => {
    const c = ctx(sandboxState());
    execCommand('git branch feature', c);
    execCommand('git switch feature', c);
    c.state.files['src/app.py'].contentId = 'feat';
    execCommand('git add src/app.py', c);
    execCommand('git commit -m "feat"', c);
    execCommand('git switch main', c);
    const r = execCommand('git merge feature', c);
    expect(r.ok).toBe(true);
    expect(r.output.toLowerCase()).toContain('fast-forward');
  });

  it('rebases onto main', () => {
    const c = ctx(sandboxState());
    // create feature with a commit
    execCommand('git switch -c feature', c);
    c.state.files['src/app.py'].contentId = 'f1';
    execCommand('git add src/app.py', c);
    execCommand('git commit -m "f1"', c);
    // move main
    execCommand('git switch main', c);
    c.state.files['README.md'].contentId = 'm1';
    execCommand('git add README.md', c);
    execCommand('git commit -m "m1"', c);
    execCommand('git switch feature', c);
    const r = execCommand('git rebase main', c);
    expect(r.ok).toBe(true);
    expect(c.state.rebaseCount).toBe(1);
  });

  it('stashes and pops', () => {
    const c = ctx(sandboxState());
    c.state.files['src/app.py'].contentId = 'dirty';
    expect(execCommand('git stash', c).ok).toBe(true);
    expect(c.state.stash.length).toBe(1);
    expect(execCommand('git stash pop', c).ok).toBe(true);
    expect(c.state.stash.length).toBe(0);
    expect(c.state.files['src/app.py'].contentId).toBe('dirty');
  });
});

describe('tags and cherry-pick', () => {
  it('creates annotated tag', () => {
    const c = ctx(sandboxState());
    expect(execCommand('git tag -a v1 -m "rel"', c).ok).toBe(true);
    expect(c.state.tags.some((t) => t.name === 'v1' && t.annotated)).toBe(true);
  });

  it('cherry-picks a commit', () => {
    const c = ctx(sandboxState());
    execCommand('git switch -c fix', c);
    c.state.files['src/app.py'].contentId = 'fixed';
    execCommand('git add src/app.py', c);
    execCommand('git commit -m "fix crash"', c);
    const hash = c.state.commits[c.state.commits.length - 1].hash;
    execCommand('git switch main', c);
    const r = execCommand(`git cherry-pick ${hash}`, c);
    expect(r.ok).toBe(true);
    expect(c.state.cherryPickCount).toBe(1);
  });
});

describe('simulators', () => {
  it('edit / cat / rm', () => {
    const c = ctx(sandboxState());
    expect(execCommand('edit src/app.py', c).ok).toBe(true);
    expect(execCommand('cat src/app.py', c).ok).toBe(true);
    expect(execCommand('rm config.yaml', c).ok).toBe(true);
    expect(c.state.files['config.yaml'].present).toBe(false);
  });
});

describe('amend', () => {
  it('folds a staged change into the tip without adding a commit', () => {
    const c = ctx(sandboxState());
    const before = c.state.commits.length;
    c.state.files['README.md'].contentId = 'v2';
    execCommand('git add README.md', c);
    const r = execCommand('git commit --amend -m "new message"', c);
    expect(r.ok).toBe(true);
    expect(c.state.commits.length).toBe(before); // no new commit
    expect(c.state.commits[c.state.commits.length - 1].message).toBe('new message');
    expect(c.state.commits[c.state.commits.length - 1].tree['README.md']).toBe('v2');
  });

  it('keeps the message when --amend has no -m', () => {
    const c = ctx(sandboxState());
    execCommand('git commit --amend', c); // nothing staged, but message kept
    expect(c.state.commits.length).toBe(1);
    expect(c.state.commits[0].message).toBe('Initial commit');
  });
});

describe('gitignore', () => {
  it('marks matching untracked files ignored and hides them from status', () => {
    const c = ctx(sandboxState());
    c.state.files['build.log'] = makeFile('build.log', 'meta', { tracked: false });
    expect(execCommand('gitignore *.log', c).ok).toBe(true);
    expect(c.state.files['build.log'].gitignored).toBe(true);
    expect(c.state.files['config.yaml'].gitignored).toBe(false);
    const r = execCommand('git status', c);
    expect(r.output).not.toContain('build.log');
  });
});

describe('force push', () => {
  function diverged(c: ReturnType<typeof ctx>) {
    const base = c.state.commits[0].hash;
    execCommand('git remote add origin /tmp/r.git', c);
    execCommand('git push -u origin main', c); // remote at base
    // Local advances one commit.
    c.state.files['README.md'].contentId = 'local-v2';
    execCommand('git add README.md', c);
    execCommand('git commit -m "local work"', c);
    // Remote advances independently to a commit the local tip does not descend from.
    const remoteOnly = {
      hash: 'deadbe1',
      message: 'remote work',
      parents: [base],
      tree: { 'README.md': 'blob-remote' },
      author: 'Other <other@remote>',
      timestamp: 1_700_000_001_000,
    };
    c.state.commits.push(remoteOnly);
    c.state.remoteBranches[0].commit = remoteOnly.hash;
  }

  it('rejects a plain push when the remote is diverged', () => {
    const c = ctx(sandboxState());
    diverged(c);
    const r = execCommand('git push origin main', c);
    expect(r.ok).toBe(false);
    expect(r.error).toContain('non-fast-forward');
  });

  it('force push overwrites and is counted', () => {
    const c = ctx(sandboxState());
    diverged(c);
    const r = execCommand('git push --force origin main', c);
    expect(r.ok).toBe(true);
    expect(c.state.forcePushCount).toBe(1);
    expect(
      c.state.remoteBranches.find((b) => b.name === 'origin/main')?.commit,
    ).toBe(c.state.branches.find((b) => b.name === 'main')!.commit);
  });
});

describe('mv and clone', () => {
  it('git mv renames and stages', () => {
    const c = ctx(sandboxState());
    const r = execCommand('git mv src/app.py src/app2.py', c);
    expect(r.ok).toBe(true);
    expect(c.state.files['src/app.py']).toBeUndefined();
    expect(c.state.files['src/app2.py']?.staged).toBe(true);
  });

  it('git clone seeds an initialized repo with a remote', () => {
    const c = ctx(); // uninitialized empty state
    const r = execCommand('git clone /tmp/repo.git', c);
    expect(r.ok).toBe(true);
    expect(c.state.initialized).toBe(true);
    expect(c.state.remotes[0].name).toBe('origin');
    expect(c.state.commits.length).toBe(1);
    expect(c.state.remoteBranches[0].name).toBe('origin/main');
  });
});

describe('level solutions reach goals', () => {
  it.each(allLevels.map((l) => [l.id, l] as const))('%s solution satisfies goal', (_id, level) => {
    const state = cloneState(level.startState);
    const c = {
      state,
      levelId: level.id,
      solution: level.solution,
      hint: level.hint,
      goalText: level.objective,
    };
    // Merge conflicts return ok:false but still advance the merge — run manually
    for (const cmd of level.solution) {
      execCommand(cmd, c);
    }
    expect(goalSatisfied(level.goal, state)).toBe(true);
  });
});
