/** English knowledge base — the source of truth for every Git topic.
 *
 * Each topic escalates from an analogy to the mechanism to how it is used,
 * ends with the mental model to keep, and notes how it shows up in industry.
 * FA/DE catalogs (topics.fa/de) override these by id.
 */
import type { TopicKnowledge } from './types';

export const TOPICS_EN: TopicKnowledge[] = [
  // ── Foundations ────────────────────────────────────────────────
  {
    id: 'three-area',
    title: 'The three-area model',
    fromZero: [
      { level: 'Start here', body: 'Think of a book on your desk (working tree), a tray where you line up pages to send (staging), and the bound archive copies (repository).' },
      { level: 'Under the hood', body: 'Git tracks three places at once: the files on disk, the index (a proposed next commit), and the committed snapshots. Every command moves content between these areas.' },
      { level: 'In the real world', body: 'Almost every Git mistake is a confusion about *which area* you are looking at. Staging is the deliberate pause that lets you shape a commit.' },
    ],
    mindset: 'Name the area before you act: is this in the working tree, the index, or a commit?',
    industry: ['`git status` is the daily map of all three areas.', 'Reviewing `git diff --staged` before committing is a professional habit.'],
  },
  {
    id: 'init',
    title: 'git init',
    fromZero: [
      { level: 'Start here', body: 'Before Git can remember anything, it needs a place to store its memory. `git init` creates that place: the hidden `.git` directory.' },
      { level: 'Under the hood', body: 'It sets up the object store, an initial branch (`main`), and a `HEAD` pointing at it. The folder is now a repository.' },
    ],
    mindset: 'One repository, one `.git`, one root.',
    industry: ['Run `git init` once at the project root.', 'Avoid nested repos — tooling and CI get confused by them.'],
  },
  {
    id: 'gitignore',
    title: '.gitignore',
    fromZero: [
      { level: 'Start here', body: 'Some files should never be saved in history: build output, secrets, machine-specific settings. `.gitignore` is a list of what to look past.' },
      { level: 'Under the hood', body: 'A matching untracked file stops showing up in `git status` and can’t be added. Patterns are paths, directories, or globs like `*.log`.' },
      { level: 'In the real world', body: 'Ignore rules travel with the repo, so the whole team ignores the same artifacts. You can’t ignore something already tracked — you must untrack it first.' },
    ],
    mindset: 'If it is generated or secret, it is ignored.',
    industry: ['Commit `.gitignore` so everyone ignores the same things.', 'Secrets that were ever committed must be rotated, not just ignored.'],
  },
  {
    id: 'blobs-trees-commits',
    title: 'Blobs, trees, and commits',
    fromZero: [
      { level: 'Start here', body: 'Git does not store files the way you think. A file’s *contents* are a blob; a directory’s listing is a tree; a commit points at a root tree plus its parents.' },
      { level: 'Under the hood', body: 'A **blob** is content-only (no name). A **tree** maps names to blobs or subtrees. A **commit** = root tree + parent hashes + author + message. Committing snapshots the whole tree, not a diff.' },
      { level: 'In the real world', body: 'This is why checking out a branch is fast (trees are small) and why Git can deduplicate identical content across the whole history.' },
    ],
    mindset: 'A commit is a frozen tree, not a pile of changes.',
    industry: ['`git cat-file -p <sha>` peeks at these raw objects.', 'Content-addressing means identical bytes are stored once.'],
  },
  {
    id: 'commit',
    title: 'Commits are snapshots',
    fromZero: [
      { level: 'Start here', body: 'A commit is a photo of the entire project at one moment, plus a note and a pointer to the photo(s) before it.' },
      { level: 'Under the hood', body: 'Because each commit stores a full tree, history is a directed graph of snapshots, not a list of diffs. Differences are computed when you ask for them.' },
      { level: 'In the real world', body: 'This is the reason small, single-purpose commits are valuable: every photo is meaningful on its own.' },
    ],
    mindset: 'Each commit should make sense as a standalone, correct state.',
    industry: ['One logical change per commit.', '`git log --oneline --graph --decorate` to read history fast.'],
  },
  {
    id: 'index',
    title: 'The index (staging area)',
    fromZero: [
      { level: 'Start here', body: 'The index is a draft of your next commit. `git add` copies a file’s current content into the draft; `git commit` seals the draft into a commit.' },
      { level: 'Under the hood', body: 'It is a file on disk (`.git/index`) holding a set of blobs. It can hold different content from both the working tree and the last commit — that gap is what you see as staged vs unstaged.' },
      { level: 'In the real world', body: 'Staging is how you split a messy worktree into clean commits without changing what is on disk.' },
    ],
    mindset: 'The index is “what I am about to save”, not “what I have changed”.',
    industry: ['`git add -p` to stage hunks selectively.', 'An empty index diff means the next commit would be empty.'],
  },
  {
    id: 'head',
    title: 'HEAD',
    fromZero: [
      { level: 'Start here', body: 'HEAD is a signpost: “you are here”. Usually it points at a branch, which in turn points at a commit.' },
      { level: 'Under the hood', body: 'Most commands resolve their arguments relative to HEAD. When HEAD points directly at a commit instead of a branch, you are in a *detached* state.' },
      { level: 'In the real world', body: 'Detached HEAD is fine for inspecting old commits; commit there without a branch and the work is easy to lose.' },
    ],
    mindset: 'Follow the chain: HEAD → branch → commit. If HEAD skips the branch, you’re detached.',
    industry: ['`git switch -c rescue` saves work made on a detached HEAD.', 'Detached states are common in bisect and code review.'],
  },
  {
    id: 'branch-pointer',
    title: 'Branches are movable pointers',
    fromZero: [
      { level: 'Start here', body: 'A branch is just a name on a commit. Creating one is free; switching changes where you work, not the history.' },
      { level: 'Under the hood', body: 'A branch is a file holding one commit hash. Switching repoints HEAD and rewrites the working tree to match that commit’s tree.' },
      { level: 'In the real world', body: 'Because branches are cheap, teams create a short-lived branch for each piece of work.' },
    ],
    mindset: 'Branches do not “contain” commits — commits form the graph; branches are labels on it.',
    industry: ['Names describe work: `feature/login`, `fix/null-check`.', 'Delete a branch after it merges; stale branches invite mistakes.'],
  },
  {
    id: 'clone',
    title: 'git clone',
    fromZero: [
      { level: 'Start here', body: 'To join a shared project, you download a copy. `git clone` gets the whole repository and its history in one step.' },
      { level: 'Under the hood', body: 'It creates the local repo, checks out the default branch, and names the source `origin` so you can push/pull later.' },
      { level: 'In the real world', body: 'Clone is the entry point of nearly every team workflow.' },
    ],
    mindset: 'A clone is a full, working local copy with `origin` preconfigured.',
    industry: ['Clone into a fresh folder per project.', '`--depth 1` fetches only the latest commit for large repos.'],
  },
  {
    id: 'fetch-vs-pull',
    title: 'Fetch vs pull',
    fromZero: [
      { level: 'Start here', body: 'Fetch is “show me what changed out there”. Pull is “show me what changed and merge it in”.' },
      { level: 'Under the hood', body: 'Fetch updates your `origin/*` tracking refs only — your branches and working tree stay untouched. Pull = fetch + integrate (merge or rebase).' },
      { level: 'In the real world', body: 'Fetch first, then decide. Pulling blindly can surprise you with merges you did not plan.' },
    ],
    mindset: 'Fetch is safe and read-only; pull is a decision with side effects.',
    industry: ['`git fetch` before you integrate, especially on shared branches.', 'Teams often script `pull --rebase` for feature branches.'],
  },
  {
    id: 'remote',
    title: 'Remotes',
    fromZero: [
      { level: 'Start here', body: 'A remote is a bookmark for another repository — usually a shared server. `origin` is the conventional default.' },
      { level: 'Under the hood', body: '`git remote` names a URL. `push` uploads your commits to it; `fetch` downloads its refs as `origin/*` copies.' },
      { level: 'In the real world', body: 'Everything about collaboration — PRs, reviews, CI — hangs off the remote.' },
    ],
    mindset: 'Your local repo is a sandbox; the remote is the shared truth.',
    industry: ['`git remote add <name> <url>` to add a second remote (e.g. a mirror).', '`git remote -v` to verify where you will push.'],
  },

  // ── Core workflow ──────────────────────────────────────────────
  {
    id: 'status',
    title: 'git status',
    fromZero: [
      { level: 'Start here', body: 'Status is the map. It tells you where each file sits: staged, changed but not staged, or not tracked at all.' },
      { level: 'Under the hood', body: 'It compares the working tree, the index, and HEAD, and reports the differences in each of the three areas.' },
      { level: 'In the real world', body: 'When you are ever lost, `git status` is the first command to run.' },
    ],
    mindset: 'Read status as three lists, not one blob of text.',
    industry: ['`git status -sb` for a compact branch + change summary.', 'A clean status is a prerequisite for switching branches.'],
  },
  {
    id: 'add',
    title: 'git add (staging)',
    fromZero: [
      { level: 'Start here', body: '`git add` moves a file’s current content into the staging draft so the next commit will include it.' },
      { level: 'Under the hood', body: 'It records the file’s blob in the index. `git add .` stages everything; `git add <path>` stages one path; `git add -p` stages hunks one by one.' },
      { level: 'In the real world', body: 'Deliberate staging is what keeps commits reviewable.' },
    ],
    mindset: 'Stage only the change you are about to commit.',
    industry: ['`git add -p` is the workhorse for clean commits.', 'Avoid `git add .` in a shared repo — it sweeps in things you meant to leave out.'],
  },
  {
    id: 'commit-message',
    title: 'Commit messages',
    fromZero: [
      { level: 'Start here', body: 'A commit message is the note on your photo. It should explain *why*, not just *what files*.' },
      { level: 'Under the hood', body: 'It is stored on the commit object. The first line is the title; a blank line, then the body, is the convention.' },
      { level: 'In the real world', body: 'Good messages make `git log` and `git blame` readable by someone else, months later.' },
    ],
    mindset: 'Write for the reader in the future, not for yourself right now.',
    industry: ['Conventional Commits: `feat:`, `fix:`, `docs:` prefixes.', 'Aim for an imperative, one-line title under ~50 chars.'],
  },
  {
    id: 'commit-convention',
    title: 'Conventional commits',
    fromZero: [
      { level: 'Start here', body: 'A convention puts a short type prefix on every commit — `feat:`, `fix:`, `refactor:` — so the *kind* of change is obvious at a glance.' },
      { level: 'Under the hood', body: 'The prefix is just a convention, but tools can parse it to auto-generate changelogs and version numbers.' },
      { level: 'In the real world', body: 'Many teams require it in CI. It makes `git log` scanable and automates releases.' },
    ],
    mindset: 'The type prefix signals intent before you even read the words.',
    industry: ['`conventional-changelog` / `standard-version` build on these.', 'Reserve `fix:` for changes that fix a bug (often triggers patch bumps).'],
  },
  {
    id: 'atomic-commits',
    title: 'Atomic commits',
    fromZero: [
      { level: 'Start here', body: 'One commit = one logical change. If you can separate a bugfix from a rename, do it.' },
      { level: 'Under the hood', body: 'Smaller, single-purpose commits are easier to review, revert, and bisect because each one is a coherent, testable state.' },
      { level: 'In the real world', body: 'A reviewer should be able to understand and, if needed, roll back each commit on its own.' },
    ],
    mindset: 'If a commit needs another commit to make sense, split it.',
    industry: ['`git add -p` to separate a change that touches many files.', 'Never mix a bugfix and a formatting sweep in one commit.'],
  },
  {
    id: 'amend',
    title: 'git commit --amend',
    fromZero: [
      { level: 'Start here', body: 'Amend rewrites the last commit to include what you just staged, and lets you change its message — in place.' },
      { level: 'Under the hood', body: 'It does not add a new commit; it produces a new commit that replaces the tip, so the count stays the same and the hash changes.' },
      { level: 'In the real world', body: 'Great for fixing a typo in a message or folding a missed file in *before* you push.' },
    ],
    mindset: 'Amend is a rewrite. Never amend a commit that anyone else has pulled.',
    industry: ['Safe on unpushed, local commits only.', 'Teams often enable `commit --amend` hooks to auto-include a `Signed-off-by`.'],
  },
  {
    id: 'log',
    title: 'git log (reading history)',
    fromZero: [
      { level: 'Start here', body: '`git log` walks the commit graph from HEAD and prints what you find. It is how you ask “how did we get here?”' },
      { level: 'Under the hood', body: 'It follows parent links. Flags shape the output: `--oneline` compresses, `--graph` draws the branches, `--decorate` shows branch/tag names, `-p` shows diffs.' },
      { level: 'In the real world', body: 'Reading history is half of debugging. If you cannot describe what happened, you cannot fix it.' },
    ],
    mindset: 'The log is a timeline you can filter, not a wall of text.',
    industry: ['`git log --oneline --graph --decorate` is the go-to command.', 'Filter with `--author`, `--since`, or a path: `git log -- path/to/file`.'],
  },
  {
    id: 'diff',
    title: 'git diff (two kinds)',
    fromZero: [
      { level: 'Start here', body: 'Diff shows changes. There are two: unstaged (worktree vs index) and staged (index vs HEAD).' },
      { level: 'Under the hood', body: 'Bare `git diff` compares disk to the index. `git diff --staged` compares the index to the last commit — i.e. what the next commit would contain.' },
      { level: 'In the real world', body: 'Reviewing `--staged` is the gate before you commit.' },
    ],
    mindset: 'Ask which two areas you are comparing before you trust a diff.',
    industry: ['`git diff --staged` in the pre-commit checklist.', '`git diff HEAD` shows all changes (staged + unstaged) vs the last commit.'],
  },
  {
    id: 'show',
    title: 'git show',
    fromZero: [
      { level: 'Start here', body: '`git show` opens one commit in full: its message, its parents, and the changes it made.' },
      { level: 'Under the hood', body: 'It defaults to HEAD. Give it a hash, branch, or tag to inspect that ref.' },
      { level: 'In the real world', body: 'It is the fastest way to understand exactly what one change did.' },
    ],
    mindset: 'Log lists; show explains one entry in detail.',
    industry: ['`git show <sha>` before you revert or cherry-pick anything.', 'Combine with `-p` to see the full patch.'],
  },
  {
    id: 'restore',
    title: 'git restore',
    fromZero: [
      { level: 'Start here', body: '`git restore` discards uncommitted edits to a file, copying the saved version back over it.' },
      { level: 'Under the hood', body: 'It rewrites the working tree (and optionally the index) from a saved source — HEAD by default. Nothing committed is touched.' },
      { level: 'In the real world', body: 'It is the safe “undo my edits” for work you have not committed.' },
    ],
    mindset: 'Restore throws away uncommitted work on purpose.',
    industry: ['`git restore <file>` to abandon a change.', '`git restore --staged <file>` to unstage without losing the edit.'],
  },
  {
    id: 'rm',
    title: 'git rm',
    fromZero: [
      { level: 'Start here', body: 'Deleting a file is a change, so it must be committed. `git rm` removes the file *and* stages the deletion.' },
      { level: 'Under the hood', body: 'It deletes the path from the working tree and the index. A plain filesystem `rm` would leave Git believing the file should still be there.' },
      { level: 'In the real world', body: 'Use it when you remove code you no longer want in history.' },
    ],
    mindset: 'If it was tracked, remove it through Git, not just the filesystem.',
    industry: ['`git rm <file>` then commit.', '`git rm --cached <file>` keeps the file on disk but stops tracking it.'],
  },
  {
    id: 'mv',
    title: 'git mv (atomic rename)',
    fromZero: [
      { level: 'Start here', body: 'A rename is really two changes: the old path disappears and the new one appears. `git mv` does both and stages the result.' },
      { level: 'Under the hood', body: 'It is an atomic “remove + add”. Git can then often *detect* the rename later in diffs and logs.' },
      { level: 'In the real world', body: 'It keeps history honest when you reorganize files.' },
    ],
    mindset: 'A rename is content that survives at a new path, not a delete plus a create.',
    industry: ['`git mv old new` for a tracked rename.', 'Rename detection is on by default; similar content is linked across the rename.'],
  },
  {
    id: 'rename-detection',
    title: 'Rename detection',
    fromZero: [
      { level: 'Start here', body: 'Git does not record “this file was renamed”. It compares contents, and when a file’s content mostly moves to a new path, it *reconstructs* a rename.' },
      { level: 'Under the hood', body: 'During diffs, Git matches deleted and added blobs by similarity and reports them as renames when they are close enough.' },
      { level: 'In the real world', body: 'This is why a near-identical file at a new name shows as “renamed” in `git log --follow`.' },
    ],
    mindset: 'Renames are detected, not stored — content similarity is the evidence.',
    industry: ['`git log --follow <path>` traces a file across renames.', 'Tune the similarity threshold with `diff.renames` if needed.'],
  },
  {
    id: 'untracked',
    title: 'Untracked files',
    fromZero: [
      { level: 'Start here', body: 'A file Git has never `add`ed is untracked: it exists on disk but is invisible to the index and to commits.' },
      { level: 'Under the hood', body: 'Untracked files show under “Untracked files” in `git status` and can be staged (becoming tracked) or ignored.' },
      { level: 'In the real world', body: 'Leaving stray untracked files around is how secrets and generated files sneak into a repo.' },
    ],
    mindset: 'Untracked means “Git does not know about this yet”.',
    industry: ['`git status` before you `git add .` to avoid sweeping in junk.', 'Delete or ignore files you are done with.'],
  },

  // ── Branching & HEAD ───────────────────────────────────────────
  {
    id: 'fast-forward',
    title: 'Fast-forward merge',
    fromZero: [
      { level: 'Start here', body: 'If one branch is simply ahead of the other, merging just moves the pointer forward. No new commit is created.' },
      { level: 'Under the hood', body: 'A fast-forward is possible when the target branch’s tip is a direct descendant of the current tip. Git just advances the pointer.' },
      { level: 'In the real world', body: 'Linear history often comes from frequent fast-forwards.' },
    ],
    mindset: 'Fast-forward = no real merge happened, just a catch-up.',
    industry: ['`git merge` does this automatically when it can.', 'Teams wanting a linear log rebase or `--ff-only`.'],
  },
  {
    id: 'merge-commit',
    title: 'Merge commit',
    fromZero: [
      { level: 'Start here', body: 'When two branches have each gained commits, merging creates a new commit with *two* parents that ties them back together.' },
      { level: 'Under the hood', body: 'The merge commit records both lines of history, so nothing is lost and the graph shows the fork and rejoin.' },
      { level: 'In the real world', body: 'Two-parent commits are the visual signature of a real integration.' },
    ],
    mindset: 'A merge commit is a “these two lines meet here” marker.',
    industry: ['`--no-ff` forces a merge commit even when a fast-forward is possible, to record the integration.', 'Reviewers look at merge commits to see feature boundaries.'],
  },
  {
    id: 'conflict',
    title: 'Merge conflicts',
    fromZero: [
      { level: 'Start here', body: 'A conflict happens when two sides changed the *same* place. Git cannot choose for you, so it stops and asks you to.' },
      { level: 'Under the hood', body: 'The index records your version, their version, and the common base (stages 1/2/3). You edit the file to the content you want, then `git add` it.' },
      { level: 'In the real world', body: 'Conflicts are normal, not a failure. The discipline is in resolving them deliberately.' },
    ],
    mindset: 'A conflict is a decision, not an error — you are the one making the call.',
    industry: ['Read all three versions before you pick.', 'After resolving, run `git status` and `git commit` to finish the merge.'],
  },
  {
    id: 'detached-head',
    title: 'Detached HEAD',
    fromZero: [
      { level: 'Start here', body: 'Usually HEAD points at a branch. If you check out a raw commit hash, HEAD points at that commit directly — that is “detached”.' },
      { level: 'Under the hood', body: 'Committing in a detached state creates commits no branch name points to, so they are easy to lose once you move on.' },
      { level: 'In the real world', body: 'Detached HEAD is expected in `git bisect` and when peeking at tags.' },
    ],
    mindset: 'Detached is fine to look around in; create a branch before you commit there.',
    industry: ['`git switch -c rescue` captures a detached commit onto a branch.', 'CI checkers frequently run on detached HEADs.'],
  },
  {
    id: 'rebase',
    title: 'Rebase',
    fromZero: [
      { level: 'Start here', body: 'Rebase replays your commits on top of a newer base, producing a straight line of history.' },
      { level: 'Under the hood', body: 'It re-applies each of your commits as new commits (new hashes) on the new base. The old commits are no longer on the branch.' },
      { level: 'In the real world', body: 'Rebase is great for tidying *your own, unpushed* work before a review.' },
    ],
    mindset: 'Rebase rewrites history. Never rebase a branch others have already pulled.',
    industry: ['Rebase feature branches to stay current with main.', 'Teams often ban rebasing published/shared branches in policy.'],
  },
  {
    id: 'rebase-conflict',
    title: 'Rebase with conflicts',
    fromZero: [
      { level: 'Start here', body: 'Rebase replays commit by commit, so a conflict can pause the rebase in the middle. You resolve it, then continue.' },
      { level: 'Under the hood', body: 'When a replayed commit conflicts, Git stops. You fix the file, `git add` it, and run `git rebase --continue` (or `--abort` to bail).' },
      { level: 'In the real world', body: 'Repeated rebase conflicts are the cost of a long-lived feature branch.' },
    ],
    mindset: 'Each paused conflict is one commit at a time — smaller than a whole-merge conflict.',
    industry: ['Keep rebase conflicts small by rebasing often.', '`git rebase --abort` always returns you to where you started.'],
  },
  {
    id: 'squash',
    title: 'Squashing commits',
    fromZero: [
      { level: 'Start here', body: 'Squash folds several small commits into one. It is usually done right before or during review.' },
      { level: 'Under the hood', body: 'Interactive rebase (`git rebase -i`) lists your commits and lets you mark some as `squash` or `fixup`, combining their changes and messages.' },
      { level: 'In the real world', body: 'A clean single commit per feature is common in many teams, even though work happened in many steps.' },
    ],
    mindset: 'Squash shapes the history a reviewer sees, while preserving your working steps locally.',
    industry: ['`git rebase -i` with `squash`/`fixup` is the standard tool.', 'Keep the *why* in the squashed message; drop noisy intermediate titles.'],
  },
  {
    id: 'cherry-pick',
    title: 'Cherry-pick',
    fromZero: [
      { level: 'Start here', body: 'Cherry-pick copies one specific commit’s change onto your current branch as a new commit.' },
      { level: 'Under the hood', body: 'It applies that commit’s diff on top of HEAD and creates a new commit (new hash) with the same content.' },
      { level: 'In the real world', body: 'Useful for porting a hotfix to a release branch without merging the whole feature.' },
    ],
    mindset: 'Cherry-pick duplicates a change; it does not move the original.',
    industry: ['Cherry-pick bugfixes into maintenance/release branches.', 'The duplicated content will need to be reconciled if both branches later merge.'],
  },
  {
    id: 'reflog',
    title: 'The reflog',
    fromZero: [
      { level: 'Start here', body: 'Every time HEAD moves, Git writes it down in a hidden local log — the reflog. It is your undo history for *your* repository.' },
      { level: 'Under the hood', body: 'It records `HEAD@{n}` entries: the hash HEAD pointed at after each change. Orphaned commits are usually still reachable here.' },
      { level: 'In the real world', body: 'It is the safety net that makes “I reset too far” recoverable.' },
    ],
    mindset: 'If a commit seems lost, it is almost certainly in the reflog.',
    industry: ['`git reflog` then `git switch -c rescue <sha>` to recover.', 'The reflog is local only — it does not survive a fresh clone.'],
  },
  {
    id: 'reflog-recovery',
    title: 'Recovering a lost commit',
    fromZero: [
      { level: 'Start here', body: 'Reset and rebase *detach* commits from a branch but do not delete them. The reflog still points at them, so you can bring one back.' },
      { level: 'Under the hood', body: 'Find the lost commit’s hash in the reflog, check it out (detached), then put a branch on it with `git switch -c`.' },
      { level: 'In the real world', body: 'This exact recovery happens to everyone; knowing it removes the panic.' },
    ],
    mindset: 'A commit is only truly gone once it is unreachable from *every* ref, including the reflog.',
    industry: ['Check the reflog before you ever force anything.', 'Recover, then rebase/merge as needed to land it properly.'],
  },

  // ── Remotes ────────────────────────────────────────────────────
  {
    id: 'push',
    title: 'git push',
    fromZero: [
      { level: 'Start here', body: 'Push uploads your commits to a remote so others can get them.' },
      { level: 'Under the hood', body: 'It sends the commits your branch has that the remote lacks, and updates the remote’s ref. A *non-fast-forward* push (remote has moved) is rejected for safety.' },
      { level: 'In the real world', body: 'Pushing is the moment local work becomes shared.' },
    ],
    mindset: 'After a push, the commit is no longer just yours.',
    industry: ['Push feature branches freely; push main only under team rules.', 'A rejected push means the remote advanced — pull or rebase first.'],
  },
  {
    id: 'upstream',
    title: 'Upstream / tracking',
    fromZero: [
      { level: 'Start here', body: 'Upstream is the remote branch your local branch “follows”. Set it once, then bare `git push` and `git pull` know where to go.' },
      { level: 'Under the hood', body: '`git push -u origin <branch>` records the tracking relationship. After that, `git push` and `git pull` with no arguments use it.' },
      { level: 'In the real world', body: 'Tracking branches make the daily push/pull loop effortless.' },
    ],
    mindset: 'Set upstream once per branch, then stop typing the remote every time.',
    industry: ['`git push -u origin <branch>` on first push.', '`git status` shows how far ahead/behind you are vs upstream.'],
  },
  {
    id: 'force-push',
    title: 'Force push',
    fromZero: [
      { level: 'Start here', body: 'A normal push refuses to overwrite a remote branch that has moved. Force push says “yes, replace it” — dangerous because it discards the remote commits it overwrites.' },
      { level: 'Under the hood', body: 'After a rebase or amend, your history no longer descends from the remote tip, so a normal push is rejected. `--force` overwrites; `--force-with-lease` overwrites *only if* the remote has not changed since you last fetched.' },
      { level: 'In the real world', body: 'Force push is legitimate for your own feature branch after rebase — and forbidden on shared branches.' },
    ],
    mindset: 'Force push rewrites shared history. Own the branch, or do not force it.',
    industry: ['Prefer `--force-with-lease` over `--force`.', 'Never force-push `main`; recover with revert instead.'],
  },
  {
    id: 'ref-spec',
    title: 'Refspecs',
    fromZero: [
      { level: 'Start here', body: 'A refspec says “take this ref over there”. In `git push origin feature:feature`, the part after the colon is the destination name.' },
      { level: 'Under the hood', body: 'Push and fetch use `<src>:<dst>` mappings. Omitting a side defaults to “same name”.' },
      { level: 'In the real world', body: 'You rarely type refspecs, but understanding them demystifies `push` output.' },
    ],
    mindset: 'A refspec is a mapping rule, not a file path.',
    industry: ['`git push origin HEAD:refs/heads/feature` is the explicit form.', 'Fetch refspecs drive what `origin/*` tracks.'],
  },
  {
    id: 'pr-workflow',
    title: 'Pull requests / review',
    fromZero: [
      { level: 'Start here', body: 'The modern workflow: branch, commit, push, and open a pull request (PR) asking to merge your branch into a shared one after review.' },
      { level: 'Under the hood', body: 'The PR is a diff between two branches, plus a place for discussion, checks, and approval. Merging is just a merge (or rebase) performed on the remote.' },
      { level: 'In the real world', body: 'The PR is the integration gate — where review, CI, and policy meet.' },
    ],
    mindset: 'The PR is a unit of reviewable, reversible change.',
    industry: ['Keep PRs small and focused.', 'CI (tests, lint) runs on the PR before it can merge.'],
  },

  // ── Undo & recovery ────────────────────────────────────────────
  {
    id: 'reset-modes',
    title: 'git reset (three modes)',
    fromZero: [
      { level: 'Start here', body: 'Reset moves a branch pointer back to a commit. What it does to your *other* work depends on the mode.' },
      { level: 'Under the hood', body: '`--soft`: move the branch, keep index and worktree (changes become staged). `--mixed` (default): move the branch and reset the index (changes become unstaged). `--hard`: move the branch and rewrite the working tree too (changes are gone).' },
      { level: 'In the real world', body: 'Reset rewrites local history — fine for your unpushed work, dangerous after a push.' },
    ],
    mindset: 'Choose the softest mode that solves the problem.',
    industry: ['`--soft` to un-commit while keeping everything staged.', '`--hard` is destructive — `git status` first.'],
  },
  {
    id: 'revert-vs-reset',
    title: 'Revert vs reset',
    fromZero: [
      { level: 'Start here', body: 'Both undo a change, but in opposite ways. Revert *adds* a new commit that undoes the old one. Reset *moves* a pointer back.' },
      { level: 'Under the hood', body: 'Revert keeps history truthful and is safe for shared branches. Reset rewrites history and must not be used on commits others have pulled.' },
      { level: 'In the real world', body: 'On a shared main, revert is the only safe undo.' },
    ],
    mindset: 'Shared history → revert. Private, unpushed history → reset.',
    industry: ['`git revert <sha>` to safely undo a released change.', 'If a secret was committed, revert it *and* rotate the credential.'],
  },
  {
    id: 'stash',
    title: 'git stash',
    fromZero: [
      { level: 'Start here', body: 'Stash temporarily shelves your uncommitted changes so you can work on a clean tree, then bring them back.' },
      { level: 'Under the hood', body: 'It saves a snapshot of the working tree (and index) on a stack. `git stash pop` restores and drops the top entry; `git stash list` shows the stack.' },
      { level: 'In the real world', body: 'Stash is for a five-minute parking lot, not long-term storage.' },
    ],
    mindset: 'Stash is temporary context — apply it soon or it is forgotten.',
    industry: ['`git stash` before switching branches to investigate something.', 'If the work will live for a day, commit it to a WIP branch instead.'],
  },
  {
    id: 'recovery',
    title: 'The recovery toolbox',
    fromZero: [
      { level: 'Start here', body: 'Different mistakes need different tools. Match the tool to the mistake and you will rarely lose work.' },
      { level: 'Under the hood', body: 'Wrong *edit*? `git restore`. Wrong *commit that is unpushed*? `git reset`. Wrong *commit that is pushed*? `git revert`. Need to *park* work? `git stash`. Truly *lost*? `git reflog`.' },
      { level: 'In the real world', body: 'This mapping is the difference between panic and a five-minute fix.' },
    ],
    mindset: 'Name the mistake, then pick its tool.',
    industry: ['Keep `git status`, `git log --oneline --graph`, and `git reflog` as your three emergency commands.'],
  },

  // ── History craft & releases ───────────────────────────────────
  {
    id: 'tag',
    title: 'Tags',
    fromZero: [
      { level: 'Start here', body: 'A tag is a fixed name on a commit. Branches move; tags do not.' },
      { level: 'Under the hood', body: 'Lightweight tags are just a name. Annotated tags (`-a`) also store a message, author, and date — the ones you want for releases.' },
      { level: 'In the real world', body: 'Release pipelines and rollbacks reference tags, not branch names, because a tag is a stable coordinate.' },
    ],
    mindset: 'Tag the exact commit you ship, with an annotation.',
    industry: ['`git tag -a v1.2.0 -m "..."` at the release commit.', 'Push tags explicitly: `git push origin v1.2.0`.'],
  },
  {
    id: 'bisect',
    title: 'git bisect',
    fromZero: [
      { level: 'Start here', body: 'A bug appeared somewhere in history. Bisect does a binary search over commits to find the one that introduced it.' },
      { level: 'Under the hood', body: 'You tell it a known-good and known-bad commit. It checks out the middle, you say good or bad, and it halves the range until one commit is implicated.' },
      { level: 'In the real world', body: 'It turns “it broke sometime in three months” into “it broke in commit X” in a handful of steps.' },
    ],
    mindset: 'Bisect is a guided binary search through history.',
    industry: ['`git bisect start`, `git bisect bad HEAD`, `git bisect good <old>`, then `good`/`bad`.', 'Automate with `git bisect run <test-command>`.'],
  },
  {
    id: 'blame',
    title: 'git blame',
    fromZero: [
      { level: 'Start here', body: 'Blame answers “who last changed this line, and when?” for a file, line by line.' },
      { level: 'Under the hood', body: 'It maps each current line to the commit that last touched it, following the history (including renames with `--follow`).' },
      { level: 'In the real world', body: 'Use it to find the right person or the commit that introduced a bug — not to assign blame.' },
    ],
    mindset: 'Blame is a tool for understanding, not for finger-pointing.',
    industry: ['`git blame -L <start>,<end> <file>` for a line range.', 'IDEs surface inline blame for quick context.'],
  },
  {
    id: 'worktree',
    title: 'git worktree',
    fromZero: [
      { level: 'Start here', body: 'A worktree lets you check out a *second* branch in a *second* folder from the same repository, without stashing or switching.' },
      { level: 'Under the hood', body: 'It shares the same `.git` object store but has its own working tree and index, so two branches can be on disk at once.' },
      { level: 'In the real world', body: 'Useful for a quick hotfix while you are mid-way through a big feature, without disturbing it.' },
    ],
    mindset: 'One repo, many working trees — each on its own branch.',
    industry: ['`git worktree add ../hotfix -b hotfix` to open a parallel tree.', 'Clean up with `git worktree remove` when done.'],
  },
  {
    id: 'submodule',
    title: 'Submodules',
    fromZero: [
      { level: 'Start here', body: 'A submodule embeds one repository inside another, pinned to a specific commit. It is how you include a shared library while keeping it in its own history.' },
      { level: 'Under the hood', body: 'The parent repo stores a *commit pointer* (a gitlink), not the submodule’s contents. You must `git submodule update` to fetch the pinned content.' },
      { level: 'In the real world', body: 'Submodules are powerful but famously fiddly; many teams prefer package managers instead.' },
    ],
    mindset: 'A submodule is a pinned commit reference, not a copy of files.',
    industry: ['`git submodule add <url>` to include one.', 'Locking: the parent records the exact submodule commit to keep builds reproducible.'],
  },
  {
    id: 'porcelain',
    title: 'Porcelain vs plumbing',
    fromZero: [
      { level: 'Start here', body: 'Git has two faces. “Porcelain” is the friendly, opinionated commands you use daily. “Plumbing” is the low-level object and ref operations.' },
      { level: 'Under the hood', body: 'Porcelain (like `git status`) is stable for humans. Plumbing (like `git cat-file`, `git update-ref`) is stable for scripts. The two layers let Git change its internals without breaking scripts.' },
      { level: 'In the real world', body: 'Scripts should use porcelain-v2 or plumbing, not scrape `git status` text.' },
    ],
    mindset: 'Porcelain for people, plumbing for machines.',
    industry: ['`git log --porcelain` / `git status --porcelain` give machine-readable output.', 'Automation tools build on plumbing for reliability.'],
  },
];
