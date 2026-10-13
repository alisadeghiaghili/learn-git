# LearnGit — Git Syllabus Map & Coverage

Canonical Git syllabus distilled from **Pro Git**, **Mastering Git**, **Version Control with
Git** (Loeliger & McIver), **Learn Git Branching** and **GitHub Skills**, mapped topic-by-topic
against the current app (`src/engine/commands.ts`, 24 levels, 24 concepts, 34 goal-checks).

**Legend**
- **Ref depth** — how deeply the best references cover it (H/M/L).
- **Industry** — how much working engineers actually use it (H/M/L).
- **App** — 🟢 full (hands-on level + concept) · 🟡 partial (command/concept exists, but no dedicated level, or an abstract simulator) · 🔴 missing.

## Headline numbers (computed)

| Metric | Value |
|---|---|
| Canonical topics | 70 |
| 🟢 Full | 40 |
| 🟡 Partial | 21 |
| 🔴 Missing | 9 |
| **Hands-on** (🟢 only) | **40/70 = 57%** |
| **Touched** (🟢+🟡) | **61/70 = 87%** |
| **Weighted** (🟢=1, 🟡=0.5) | **72%** |

**Gap to 85% weighted:** 0.85×70 = 59.5 pts; now 50.5 → **+9 pts ≈ 5 new full levels (🔴→🟢) + harden 8 partials (🟡→🟢).**

---

## 1. Foundations

| # | Topic | Ref | Ind | App | Level / source |
|---|-------|-----|-----|-----|----------------|
| 1 | VCS stores snapshots, not diffs | H | H | 🟢 | concept `commit`, intro, board |
| 2 | Three-area model (worktree/index/repo) | H | H | 🟢 | core — nearly every level |
| 3 | `git init` | H | H | 🟢 | `basics-init` |
| 4 | `.git` internals (objects, refs, HEAD file) | M | M | 🟡 | `reflog`,`rev-parse`; no structure viz |
| 5 | Blobs (content-addressed) | H | M | 🟡 | concept `blob`; faked hashes |
| 6 | Trees (dir snapshot per commit) | H | M | 🟡 | concept `tree`; in state, not visualized |
| 7 | Commits (snapshot + parents → DAG) | H | H | 🟢 | concept + `log`/`show` |
| 8 | `.gitignore` / ignored files | H | H | 🟡 | goal `fileIgnored`, `gitignored` field; no level, no `git ignore` |
| 9 | `git clone` | H | H | 🔴 | not implemented |

## 2. Core workflow

| # | Topic | Ref | Ind | App | Level / source |
|---|-------|-----|-----|-----|----------------|
| 10 | `git add` / staging (index) | H | H | 🟢 | `basics-add-commit` |
| 11 | `git commit` | H | H | 🟢 | `basics-add-commit` |
| 12 | `git status` | H | H | 🟢 | `basics-status-log` |
| 13 | `git log` (`--oneline --graph --decorate`) | H | H | 🟢 | `basics-status-log` (graph not rendered) |
| 14 | `git diff` (worktree vs index) | H | H | 🟢 | `diff-unstaged` |
| 15 | `git diff --staged` (index vs HEAD) | H | H | 🟢 | `diff-staged` |
| 16 | `git show` | H | H | 🟡 | command exists, no level |
| 17 | `git rm` | H | M | 🟡 | command exists, no level |
| 18 | `git restore` (discard edits) | H | H | 🟢 | `diff-restore` |
| 19 | `git mv` | M | M | 🔴 | not implemented |
| 20 | Rename detection | L | L | 🔴 | not implemented |
| 21 | Untracked files | H | H | 🟢 | status, `camp-full-flow` |
| 22 | Atomic commits / `git add -p` | H | H | 🟡 | field note only; not simulatable |
| 23 | Commit-message conventions | M | H | 🟡 | goal checks substring; no convention level |
| 24 | `git commit --amend` | H | H | 🔴 | not implemented |

## 3. Branching & HEAD

| # | Topic | Ref | Ind | App | Level / source |
|---|-------|-----|-----|-----|----------------|
| 25 | Branches are movable pointers | H | H | 🟢 | `branch-create` |
| 26 | `git branch` (create/list) | H | H | 🟢 | `branch-create` |
| 27 | `git switch` / `checkout` | H | H | 🟢 | `branch-switch` |
| 28 | `git branch -d / -D` (delete) | H | H | 🟢 | `hist-delete-branch` |
| 29 | Fast-forward merge | H | H | 🟢 | `branch-merge-ff` |
| 30 | Merge commit (true merge, 2 parents) | H | H | 🟢 | `branch-merge-commit` |
| 31 | Merge conflict resolution | H | H | 🟢 | `hist-merge-conflict` |
| 32 | `git merge --abort` | H | H | 🟢 | concept + engine test |
| 33 | Detached HEAD + recovery | H | H | 🟢 | `branch-detached` |
| 34 | HEAD (symbolic ref) | H | H | 🟢 | concept `head` |
| 35 | `git switch -c` (create + checkout) | H | H | 🟢 | `branch-switch`, `camp-full-flow` |
| 36 | Rebase → linear history | H | H | 🟢 | `hist-rebase` |
| 37 | Rebase with conflicts / interactive | H | M | 🟡 | rebase exists; no rebase-conflict level |
| 38 | Rebase squash / fixup / autosquash | M | M | 🟡 | concept `squash` only |
| 39 | `git cherry-pick` | M | M | 🟢 | `hist-cherry-pick` |
| 40 | Reflog (concept) | H | M | 🟢 | command + concept `reflog` |

## 4. Remotes

| # | Topic | Ref | Ind | App | Level / source |
|---|-------|-----|-----|-----|----------------|
| 41 | `git remote add` | H | H | 🟢 | `remote-add-push` |
| 42 | `git remote` list / `remove` | M | M | 🟡 | `remove` exists, no level |
| 43 | `git push` | H | H | 🟢 | `remote-add-push` |
| 44 | `git push -u` / upstream | H | H | 🟢 | `remote-add-push` |
| 45 | `git fetch` | H | H | 🟢 | `remote-pull` |
| 46 | `git pull` (fetch + integrate) | H | H | 🟢 | `remote-pull` |
| 47 | Fetch vs pull (mental model) | H | H | 🟢 | concept + `remote-pull` |
| 48 | Force push / `--force-with-lease` | M | M | 🟡 | concept `force-push` only, no command |
| 49 | PR / branch-then-review workflow | H | H | 🟡 | `camp-full-flow` "PR-ready"; no PR sim |
| 50 | Refspecs / remotes as named URLs | M | L | 🟢 | concept `ref-spec` |

## 5. Undo & recovery

| # | Topic | Ref | Ind | App | Level / source |
|---|-------|-----|-----|-----|----------------|
| 51 | `git reset --soft` | H | H | 🟢 | `undo-soft` |
| 52 | `git reset --mixed` | H | H | 🟡 | supported, no dedicated level |
| 53 | `git reset --hard` | H | H | 🟡 | supported, no dedicated level |
| 54 | `git revert` | H | H | 🟢 | `undo-revert` |
| 55 | Revert vs reset (safety) | H | H | 🟢 | concept + `camp-recover` |
| 56 | `git stash` | H | H | 🟢 | `undo-stash` |
| 57 | `stash pop / apply / list` | M | M | 🟢 | command + concept |
| 58 | Recovering a lost commit (reflog drill) | H | H | 🟡 | reflog cmd+concept; no "find lost commit" level |

## 6. History craft

| # | Topic | Ref | Ind | App | Level / source |
|---|-------|-----|-----|-----|----------------|
| 59 | Tags (lightweight vs annotated) | H | M | 🟢 | `hist-tag` |
| 60 | Tagging a release | M | M | 🟢 | `hist-tag` |
| 61 | Squashing commits | M | M | 🟡 | concept only |
| 62 | Rewriting history safely (when not to) | H | M | 🟡 | field notes only |
| 63 | `git log --graph --decorate` (read history) | H | H | 🟢 | `log` command |
| 64 | Reflog as an emergency recovery tool | H | H | 🟡 | cmd+concept; no recovery drill |
| 65 | `git bisect` (find the bad commit) | M | M | 🔴 | not implemented |

## 7. Advanced

| # | Topic | Ref | Ind | App | Level / source |
|---|-------|-----|-----|-----|----------------|
| 66 | `git blame` / `git log -p` | M | H | 🔴 | not implemented |
| 67 | Stash advanced (`-u`, `stash branch`) | L | L | 🔴 | not implemented |
| 68 | Submodules | M | L | 🔴 | DESIGN.md: out of v1 |
| 69 | Git worktrees | M | M | 🔴 | DESIGN.md: out of v1 |
| 70 | Porcelain vs plumbing / hooks | L | L | 🟡 | concept `porcelain`; hooks not covered |

---

## How to hit 85% (weighted) — 9-point gap, in priority order

**New full levels (🔴→🟢, +1 each) — biggest wins, high industry value:**
1. `core-amend` — `git commit --amend` (fix message / fold change). Industry H.
2. `core-ignore` — create `.gitignore`, watch a file go from untracked→ignored. Industry H.
3. `undo-mixed-hard` — contrast `--mixed` vs `--hard` on the same tree. Industry H.
4. `recover-reflog` — orphan a commit, find it via `git reflog`, `git switch -c`. Industry H (directly matches your "Recover without panic" curriculum).
5. `remote-force` — diverged push, force-push vs `--force-with-lease`, why shared branches are off-limits. Industry M-H.

**Harden partials (🟡→🟢, +0.5 each) — cheap, mostly a level wrapper around existing commands:**
- `git show` level · `git rm` level · `git reset --mixed` level · `git reset --hard` level
- rebase-conflict level · commit-message-convention level · `.gitignore` (counted above) · reflog-recovery (counted above)
- that 8 partials + 5 new levels = +9 pts → **85% weighted**.
