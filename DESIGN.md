# LearnGit — Design Spec

Interactive Git visualizer + tutorial: sandbox, terminal, goal-driven levels.
(sandbox + terminal + goal levels + undo/reset/hint/solution), with a Git-native
visualization of the three areas: **Working Tree → Staging → Repository → Remote**.

## Style anchor

- **Product genre**: terminal-native learning game for version control.
- **Real-world feel**: workshop layout board — paper sheets on the desk (working tree),
  a tray of stamps ready to seal (staging/index), the bound ledger of history (repo),
  and a shared warehouse shelf (remote) — not a SaaS marketing page and not a DVC clone.
- **Mode**: expressive educational UI (game chrome + technical density). Not admin CRUD.

## Palette

| Token       | Hex       | Role                                      |
|-------------|-----------|-------------------------------------------|
| `--ink`     | `#0E1318` | App chrome / terminal background          |
| `--panel`   | `#182029` | Raised panels, toolbar, cards             |
| `--panel-2` | `#22303C` | Nested chips, hover fills                 |
| `--line`    | `#2E3D4D` | Hairline borders                          |
| `--haze`    | `#8FA0B2` | Secondary text                            |
| `--text`    | `#E8EEF4` | Primary text                              |
| `--work`    | `#F59E0B` | Working tree / unstaged changes           |
| `--stage`   | `#2DD4BF` | Staging area / index                      |
| `--repo`    | `#8B5CF6` | Local commits / history                   |
| `--remote`  | `#60A5FA` | Remote branches / push-pull               |
| `--code`    | `#A3E635` | Source files and tracked content          |
| `--ok`      | `#34D399` | Success, solved, clean status             |
| `--warn`    | `#FBBF24` | Dirty / outdated                          |
| `--err`     | `#F87171` | Errors, conflicts                         |

## Typography

| Role     | Stack                                                          | Usage                          |
|----------|----------------------------------------------------------------|--------------------------------|
| UI       | `Segoe UI, system-ui, -apple-system, sans-serif`               | Dialogs, toolbar, labels       |
| Mono     | `Cascadia Code, Consolas, ui-monospace, monospace`             | Terminal, hashes, commands     |

- Title scale: 20–22px / 600 for level names; body 14–15px; mono 13–14px.
- Display personality comes from **density + mono data**, not a decorative webfont.

## Layout system

```
┌──────────────────────────────────────────────────────────────┐
│ toolbar: brand · level name · levels · goal · undo · reset   │
├──────────────────────────────────────────────────────────────┐
│ CHANGE FLOW BOARD                                            │
│  [ Working Tree ] ──► [ Staging ] ──► [ Repo ] ──► [ Remote ]│
│  optional branch/commit strip below                          │
├──────────────────────────────────────────────────────────────┤
│ terminal (command history, output log)                       │
└──────────────────────────────────────────────────────────────┘
```

- Max density without clutter: four zones, 12–16px gaps, 24px page gutter.
- Level goal opens as a right dock (not a second full canvas).
- Responsive: stack zones vertically under ~900px; terminal always last.

## Signature moment

**`git add` material transfer.** When a workspace file is staged:
1. The working-tree card slides toward the Staging tray.
2. A teal index chip appears with the short blob id.
3. The original card is marked `staged` (dimmed, not removed).
4. If the file was already tracked and modified, the old blob and new blob both stay visible until commit.

That single animation teaches Git's three-area model better than any paragraph.

## What this is NOT

- Not a canvas commit-tree clone as the primary surface. History is present but secondary
  (the three-area board is what learners must internalize).
- No purple AI gradient hero, no stock photos, no marketing landing page as home.
- Home = sandbox (or intro dialog → first level).

## Product surface

1. **Sandbox** — free-form Git simulation with seed project files.
2. **Levels** — series packs with start state, goal checks, hint, solution, par.
3. **Terminal commands** — core `git *`, simulators `edit/rm/cat/ls`, meta: `levels`,
   `hint`, `show goal`, `show solution`, `reset`, `undo`, `sandbox`, `help`.
4. **Simulators** (not real shell): `edit <path>`, `rm <path>`, `cat <path>` so learners
   can dirty/clean files without a real filesystem.
5. **Persistence** — solved levels + best command counts in `localStorage`.

## Level packs (v1)

| Series        | ID prefix   | Teaches                                      |
|---------------|-------------|----------------------------------------------|
| Basics        | `basics-`   | init, status, add, commit, log               |
| Diff & Show   | `diff-`     | diff, show, restore, status porcelain        |
| Branching     | `branch-`   | branch, switch/checkout, merge, fast-forward, detached HEAD |
| Remotes       | `remote-`   | remote add, push, pull, fetch, tracking      |
| Undo          | `undo-`     | reset modes, revert, restore, stash          |
| History craft | `hist-`     | rebase, cherry-pick, tag, merge conflicts    |

Each level: intro dialog (markdown), `hint`, declarative goal, solution commands, par.

## Engine model (simplified but honest)

- `files`: path → `{ kind, contentId, blob, staged, tracked, dirty, present, gitignored }`
- `staging` (index): path → blob id staged for next commit
- `commits`: ordered history with parent hashes, message, tree snapshot
- `branches`: name → commit hash
- `HEAD`: detached or symbolic to a branch
- `remotes`: name/url + remote branch tips
- `tags`: name → commit hash
- `stash`: stack of snapshots
- `conflicts` / `merging`: open merge with unmerged paths until `add` + `commit`
- Content ids are stable fake blob/sha ids derived from path+version (deterministic)

Goal checks compare a **projection** of state (staged paths, commit messages, branch tips,
remote tips, tags) — not raw object identity.

## Engineering conventions

- TypeScript strict, English identifiers, PEP-like clarity in structure.
- Vitest for engine/compare/level goal tests.
- No AI footprint in git history when committing.
- Files/docs in English; product voice is direct and technical.

## Future (out of v1)

- Level builder / import JSON
- Persian locale pack
- Full interactive rebase editor / conflict resolution UI
- Worktree and submodule packs
