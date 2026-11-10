# audio-analyzer

A local-first browser app for studying short voice and music recordings through
spectrograms. A project is a notebook: pages of markdown text with live
spectrograms in between. The owner records or imports a clip, pans and zooms,
highlights a region to hear only that part, lines up two tracks to compare
them, writes notes around what they find, and exports the whole project as one
HTML file that can be re-imported or sent to someone as a read-only notebook.
It has one user (the repo owner, who runs it locally in Brave on Debian) and
no backend.

## Every session

1. Read `PLAN.md`. Work on the first task that is not done, unless the user
   names a different one. One task is one session and one pull request.
2. Read `docs/tasks/README.md`, then that task's file in full. Read
   `docs/architecture.md` and the decisions the task lists before writing
   code, and `docs/design.md` before building anything the owner will see.
3. Work on a branch named after the task file. Before you finish:
   `npm run verify:all` passes, `PLAN.md` is updated, the task file's handoff
   notes are filled in, any lessons are recorded (see Lessons), and a pull
   request is open with the task's owner checklist in its description.
4. Do not merge the pull request and do not start the next task. The owner
   tries the checklist by hand and merges.

## Commands

- `npm run verify` — dependency check, lessons check, type check and unit
  tests. Fast; run it often.
- `npm run verify:all` — `verify`, then a production build, then the browser
  tests. This is the definition of "it works". Task 01 creates it; until then
  `verify` is the bar.
- `npm test`, `npm run typecheck`, `npm run check:deps`, `npm run check:lessons`
  — the parts on their own.

## Layout

`docs/architecture.md` has the full picture. In short:

- `src/dsp/` — pure maths (FFT, spectrogram, masks). Imports nothing.
- `src/model/` — the project document, edits, undo, rendering a track to
  samples, export and import. Pure; imports only `dsp`.
- `src/audio/`, `src/render/`, `src/store/`, `src/ui/` — the browser side.
- Put behaviour in `dsp` or `model` whenever you can. Code there is proven by
  unit tests in plain Node; everything else needs a browser to check.

## Rules

**Do not trust your memory for packages, versions or APIs.** Your training
data is older than the registry, and audio is a field full of packages that
were popular once and are now abandoned. This repo's first commit pinned two
tools three major versions out of date, from memory. So:

- Before you call a package's API, confirm the package is in `node_modules`
  and read its type definitions there. Do not write the call from memory.
- Before you add a package, run `npm view <name> version time.modified deprecated`.
  If it does not exist, is deprecated, or was last published more than 18
  months ago, do not add it; write the code in the repo or ask the user.
- A package that passes goes into `dependencies.allowlist.json` first, in its
  own commit, with the version and date you saw. Then install it with
  `--save-exact`. `npm run check:deps` rejects anything unlisted, unpinned, or
  on a different major version.
- Do not add an audio or DSP package at all. That maths lives in `src/dsp/`
  with tests against signals whose answers are known.
- Before you finish, look at every import you added and confirm each one
  resolves to a real file or an allowlisted package.

**Positions are seconds and Hz, never pixels or frame indexes.** Every
highlight, mute and piece boundary is stored in seconds (into its source
recording) and Hz, so it survives zooming, a different window size, sliding
the track, and reopening the project later.

**Nothing destroys audio.** Source recordings are never modified. Deleting and
trimming are edits stored on the track. User edits can be undone.

**Nothing is drawn over the spectrogram** except the owner's highlights, the
playback cursor and piece edges. No analysis overlays.

**Decisions in `docs/decisions.md` are settled.** If one looks wrong, stop and
tell the user why. Do not work around it.

**Small on purpose.** Build only what the task asks for. No extra options,
menus or settings. The owner wants a few things they know well.

**Say what actually happened.** If a test fails or a step was skipped, report
that with the output. Do not weaken or delete a test to make it pass.

## Lessons

Lessons live in `.claude/rules/lessons/`, one file per area. Each file names
the paths it applies to, and Claude Code loads it automatically when you read
or edit a matching file. Task files also list the lessons to read first.

Add a lesson when the user corrects you, when a fix took more than one
attempt, or when something behaved differently from what you expected.

1. First ask whether a test or a check could catch it next time. If so, write
   that instead; a check cannot be forgotten.
2. Otherwise add it to the matching area file, or create a new file with a
   `paths:` list. Write the rule in bold, then `Why:` (what happened and
   when), `Check:` (how to confirm you followed it), and
   `Last mattered: YYYY-MM-DD`.
3. When a lesson changes what you do, or would have prevented a mistake you
   just made, set its `Last mattered` to today. Being loaded does not count.
4. Each file is capped at 60 lines; `npm run verify` enforces it. When a file
   is full, make room in this order: turn a lesson into a check and delete it,
   merge two that say the same thing, delete the one with the oldest
   `Last mattered`. Never raise the cap.
5. When a task finishes, delete any "known trap" in its area that a test now
   covers.
