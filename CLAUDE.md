# audio-analyzer

A local-first browser app for studying short voice and music recordings through
spectrograms. The owner records or imports a clip, pans and zooms the
spectrogram, lassos a region to hear only that part, lines up two tracks to
compare them, attaches markdown notes to regions, and shares the whole project
as one read-only HTML file. It has one user (the repo owner) and no backend.

## Every session

1. Read `PLAN.md`. Work on the first task that is not done, unless the user
   names a different one.
2. Read that task's file in `docs/tasks/` in full. Read `docs/decisions.md`
   before changing anything it covers.
3. Before you finish: `npm run verify` passes, `PLAN.md` is updated, the task
   file's handoff notes say what the next session needs, any lessons are
   recorded (see Lessons), and the work is committed.

## Commands

- `npm run verify` — dependency check, lessons check, type check and tests. This is the
  definition of "it works". Run it before every commit.
- `npm test`, `npm run typecheck`, `npm run check:deps`, `npm run check:lessons` —
  the parts on their own.

## Layout

- `src/dsp/` — pure maths (FFT, spectrogram, masks). No DOM, no Web Audio, no
  imports from other `src/` folders, so it runs in plain Node tests.
- Planned: `src/model/` (project document), `src/audio/` (record, decode,
  playback), `src/render/` (WebGL drawing), `src/ui/` (React). `dsp` and
  `model` import nothing from the other three.

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

**Positions are seconds and Hz, never pixels or frame indexes.** Every lasso,
highlight, clip boundary and note anchor is stored in seconds and Hz, so it
survives zooming, a different window size, and reopening the project later.

**Nothing destroys audio.** Source recordings are never modified. Trimming and
splicing are ranges that point into a source. User edits can be undone.

**Decisions in `docs/decisions.md` are settled.** If one looks wrong, stop and
tell the user why. Do not work around it.

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
