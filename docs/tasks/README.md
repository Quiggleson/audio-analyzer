# Task files

Each file here is one unit of work, sized for one session and one pull
request. They are done in order; `PLAN.md` says which is next.

## How to work a task

1. Start from an up-to-date `main`. Create a branch named after the task file,
   for example `task/01-app-shell`.
2. Read the task file in full, then everything under its "Read first".
3. If the task has a "Prove this first" section, do that before anything
   else. It names the riskiest assumption. If it fails, stop and tell the
   owner what you found; do not build on top of it.
4. Build what the task asks for and no more. If you think something is
   missing from the task, say so in the pull request instead of adding it.
5. Run `npm run verify:all`. Fix what fails. Do not weaken a test.
6. Fill in "Handoff notes" at the bottom of the task file, set the task to
   `done` in `PLAN.md` with a line under Log, and record any lessons.
7. Open a pull request. Put the task's "Owner checklist" in the description as
   unticked checkboxes, and state plainly anything that is unfinished,
   skipped or uncertain.
8. Stop. The owner tries the checklist by hand and merges. Do not merge your
   own pull request and do not start the next task in the same session.

## What the sections mean

- **Goal** — what the owner can do when the task is finished.
- **Read first** — decisions, design notes and lessons that apply.
- **Starting point** — what already exists that you build on.
- **Prove this first** — the assumption most likely to be wrong.
- **Build** — what to make, with the design choices already taken.
- **Not in this task** — things that belong to a later task or to no task.
- **Automated checks** — tests that must exist and pass.
- **Owner checklist** — use cases the owner tries by hand. Automated tests
  cannot judge whether something looks or sounds right; the owner can.
- **Handoff notes** — written by the session that finishes the task: what was
  built, what differs from the task file and why, and what the next session
  should know.

## Words used in the task files

- **Source** — an immutable recording (samples plus its sample rate).
- **Track** — one row in a spectrogram cell. It points at a source.
- **Piece** — a stretch of a source placed on a track's timeline.
- **Highlight** — a marked region: a time range or a lasso. Temporary until
  it is named.
- **Mute** — a region of a track that has been silenced by an edit.
- **Render** — turn a track (pieces, mutes, offset) into the samples that are
  heard and drawn.
