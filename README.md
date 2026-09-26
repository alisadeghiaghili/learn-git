# LearnGit

An interactive **Git** visualizer, sandbox, and tutorial for version control.

**Live:** https://alisadeghiaghili.github.io/learn-git/

Git's power is not the commit message — it is the three-area model. LearnGit makes that material flow visible: **Working Tree → Staging → Repository → Remote**.

## Features

- **Sandbox** with a seeded Git project
- **Levels** across packs: Basics, Diff & Show, Branching (incl. detached HEAD), Remotes, Undo, History craft (incl. merge conflicts), Field practice
- **Teaching**: multi-slide intros, "You are learning", production **field notes**, post-command **Why** blocks
- **`curriculum`** — outcomes you should own after the course
- **`concepts` / `glossary`** — dense mental models (index, detached HEAD, fast-forward, rebase…)
- **Terminal** simulating core `git` commands
- **Goal panel** with live checks, hint, solution, undo/reset
- **Command golf** (par per level) + progress in `localStorage`
- Workspace simulators: `edit <path>`, `rm <path>`, `cat <path>`, `ls`

## Quick start

```bash
npm install
npm run dev
```

GitHub Pages deploys automatically from `main` via `.github/workflows/deploy-pages.yml` (build `dist/`, publish with Pages artifact).

Production build:

```bash
npm run build
npm test
```

Then serve `dist/` from any static host.

## Useful commands inside the app

```
help
levels
hint
show goal
git init
git status
git add .
git commit -m "message"
git log --oneline
git diff
git branch feature
git switch feature
git merge feature
git remote add origin /tmp/remote.git
git push -u origin main
git pull
git stash
git reset --soft HEAD~1
git revert HEAD
git merge --abort
git cherry-pick <branch>
```

Share links: open with `?NODEMO` to skip the intro dialog.

## Project layout

```
src/engine/   # repo simulation, command interpreter, goal compare
src/levels/   # level definitions (start state, goal, solution)
src/ui/       # board, terminal, dialogs, app shell
tests/        # vitest coverage for engine + level solutions
```

## Notes

- This is a **teaching simulator**, not a real Git binary. Hashes are deterministic fakes; remotes are abstract object stores.
- Real-world Git docs: [git-scm.com/doc](https://git-scm.com/doc)

## License

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

This project is an independent teaching simulator. It is not affiliated with the Git project maintainers.
