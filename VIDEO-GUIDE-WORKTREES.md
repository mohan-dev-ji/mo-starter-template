# YouTube Video Guide — Claude Desktop Worktrees

A run-of-show for demoing the **worktree checkbox** above the chat box: build a new FAQ page in an isolated worktree on `:3001` while restyling the main site on `:3000`, then merge or discard.

---

## What the worktree checkbox actually does

When ticked, Claude spawns the agent inside a fresh **git worktree** — a second checkout of this repo in a sibling folder, on its own branch. Two huge wins:

- The agent can edit, install, run dev servers, and commit **without touching your main working tree**.
- You can run **multiple agents in parallel** on the same repo, each in its own worktree, and merge the good ones back later.

The worktree lives outside this project folder (Claude picks the path) and the branch name is auto-generated. You'll see both in the agent's final message.

> ⚠️ **Important:** worktrees share the same `.git` folder but each has its own working tree. A `git merge` from main only sees **committed** history on the worktree's branch — uncommitted edits won't come across. Always make sure the work is committed before you merge (Step 5 covers this).

---

## Pre-record checklist

```bash
git status                 # must be clean
git worktree list          # should show only this main checkout
lsof -i :3000 -i :3001     # make sure both ports are free
```

Open and arrange before hitting record:
- **Terminal A** — sitting in `~/Projects/mo-starter` (main)
- **Terminal B** — empty, will `cd` into the worktree once it exists
- **Browser tab 1** — `http://localhost:3000`
- **Browser tab 2** — `http://localhost:3001`
- **Claude Desktop** — pointed at `mo-starter`, worktree checkbox visible

---

## Demo flow

### 1. Start the main dev server (Terminal A)

```bash
npm run dev          # http://localhost:3000
```

Show the current landing page in browser tab 1.

### 2. Spawn the worktree agent (Claude Desktop)

**Tick the worktree checkbox**, then prompt:

> Build a new FAQ page at `/faq` for this Next.js 16 app. Drop it in the `(marketing)` route group so it picks up the Navbar and Footer. Six questions, accordion-style, matching the existing card + token styling in `app/components/marketing/sections/`. Then start the dev server on port 3001 so I can preview it.

When the agent finishes it will print something like:

```
Worktree: /Users/mohanveraitch/Projects/mo-starter-faq-abc123
Branch:   claude/faq-page-abc123
```

**Copy that path and branch name** — you'll need both at merge time. Also check the final message for confirmation that it **committed** the work (it usually does).

### 3. Preview the FAQ on :3001 (Terminal B)

If the agent didn't already start it:

```bash
cd /Users/mohanveraitch/Projects/mo-starter-faq-abc123
npm install          # only if node_modules wasn't copied
npm run dev -- -p 3001
```

Open browser tab 2 → `http://localhost:3001/faq`. Talking point: same repo, totally separate checkout, totally separate dev server.

### 4. Restyle the main site on :3000 (Claude Desktop, no worktree)

**Untick the worktree checkbox** so this agent works directly on `main`. Prompt:

> Refresh the Hero and Features sections on the landing page — bolder type, more breathing room, and bump the accent colour treatment. Keep using the design tokens in `globals.css`.

Hot-reload shows the changes in browser tab 1 (`:3000`) while the FAQ page on `:3001` stays on the old style. **This is the money shot** — two versions of the same app, side by side.

### 5. Merge the FAQ worktree into the new style

#### 5a. Make sure the worktree's work is committed

This is the step people miss. `git merge` only moves **committed** history — anything still uncommitted in the worktree won't follow it across.

From inside the worktree (Terminal B), check and commit if needed:

```bash
cd /Users/mohanveraitch/Projects/mo-starter-faq-abc123
git status                                         # any uncommitted changes?
git add .
git commit -m "Add FAQ page"
```

If the agent already committed, `git status` will say `nothing to commit, working tree clean` — skip ahead.

Sanity-check from the main checkout (Terminal A) that the branch has real commits:

```bash
git log claude/faq-page-abc123 --oneline -5
```

#### 5b. Do the merge

```bash
# from the main checkout (Terminal A)
git worktree list                                  # confirm both still exist
git merge claude/faq-page-abc123 --no-ff -m "Merge FAQ page from worktree"
```

If there are conflicts (unlikely — different files):

```bash
git status                  # see conflicted files
# edit to resolve, then:
git add .
git commit
```

Reload `:3000/faq` → the FAQ page now exists on main **with** the new styling applied. Cut to browser, show it working.

### 6. Tear the worktree down (Terminal A)

```bash
git worktree remove /Users/mohanveraitch/Projects/mo-starter-faq-abc123
git branch -d claude/faq-page-abc123              # safe delete (refuses if unmerged)
git worktree list                                  # confirm it's gone
```

If you'd **rejected** the experiment instead (no merge, no commit needed):

```bash
git worktree remove --force /Users/mohanveraitch/Projects/mo-starter-faq-abc123
git branch -D claude/faq-page-abc123              # force delete unmerged branch
```

Talking point: zero pollution on `main`, the experiment vanishes cleanly.

---

## Bonus segment — multiple agents in parallel

Tick the worktree checkbox and spawn **two or three agents at once** with different prompts (e.g. "redesign pricing", "add a testimonials section", "build a blog index"). Each gets its own worktree + branch.

List them all:

```bash
git worktree list
git branch --list 'claude/*'
```

For each one you want to keep: commit any leftovers, then merge:

```bash
cd ../mo-starter-pricing-xyz && git status && git add . && git commit -m "Pricing redesign"
cd -                                               # back to main checkout
git merge claude/pricing-redesign-xyz
git worktree remove ../mo-starter-pricing-xyz
git branch -d claude/pricing-redesign-xyz
```

Bin the rest:

```bash
git worktree remove --force ../mo-starter-blog-qrs
git branch -D claude/blog-qrs
```

Closing line: *"Spin up parallel experiments, keep the ones that work, throw away the ones that don't — without ever risking your main branch."*

---

## Cheat sheet (pin this on screen)

| Action | Command |
|---|---|
| List worktrees | `git worktree list` |
| List claude branches | `git branch --list 'claude/*'` |
| Manually create worktree | `git worktree add ../mo-starter-foo -b feature/foo` |
| Check worktree has commits | `git log <branch> --oneline -5` |
| Commit from inside worktree | `git add . && git commit -m "..."` |
| Merge worktree branch | `git merge <branch> --no-ff` |
| Remove clean worktree | `git worktree remove <path>` |
| Force-remove worktree | `git worktree remove --force <path>` |
| Delete merged branch | `git branch -d <branch>` |
| Force-delete branch | `git branch -D <branch>` |
| Prune stale worktree refs | `git worktree prune` |
| Run Next on a custom port | `npm run dev -- -p 3001` |

---

## Recovery / gotchas

- **Merge "succeeded" but the new files aren't there** → the worktree had uncommitted changes. Go back to Step 5a, commit them, and merge again.
- **"fatal: '<path>' is a working tree"** when deleting a branch → run `git worktree remove` first, then `git branch -d`.
- **Port already in use** → `lsof -ti:3001 | xargs kill -9`.
- **Worktree folder deleted manually** (without `git worktree remove`) → `git worktree prune` to clean the metadata.
- **Lost the worktree path** → `git worktree list` always tells you.
- **node_modules missing in the worktree** → it's a fresh checkout; run `npm install` inside it.
