# Plan

Work on the first task that is not done. Each task has a file in `docs/tasks/`;
`docs/tasks/README.md` explains how to work one. One task is one session and
one pull request. Do not start a task while the previous task's pull request
is still open.

Status is one of: `done`, `in progress`, `not started`.

| # | Task | Status | Task file |
|---|------|--------|-----------|
| 00 | Analysis core (FFT, reversible spectrogram, lasso mask) and guardrails (allowlist, verify, CI) | done | none; see Log |
| 01 | App shell as a notebook: projects, pages, cells, undo, browser test setup | not started | `docs/tasks/01-app-shell.md` |
| 02 | One track: record, import, draw, pan and zoom, play, highlight a range, readout | not started | `docs/tasks/02-one-track.md` |
| 03 | Saved analyses: autosave, export as one HTML file, re-import | not started | `docs/tasks/03-saved-analyses.md` |
| 04 | Compare loop: several tracks, re-record, slide, play one or all, record while playing | not started | `docs/tasks/04-compare-loop.md` |
| 05 | Notebook: rendered text, links to pages and highlights, outline | not started | `docs/tasks/05-notebook.md` |
| 06 | Lasso listening and track edits: copy, delete, keep only, move pieces | not started | `docs/tasks/06-lasso-and-edits.md` |
| 07 | Sharing: the exported file opens as a read-only notebook | not started | `docs/tasks/07-sharing.md` |
| 08 | Starter notebook that teaches by recording | not started | `docs/tasks/08-starter-notebook.md` |

The order follows the owner's priorities (decision 35 in `docs/decisions.md`).

## Log

Newest first. One line per finished task or notable event.

- 2026-11-10 — Task files 01 to 08 written. Analysis overlays dropped from
  the plan at the owner's request; a starter notebook added as task 08.
- 2026-11-10 — Plan reordered after the owner ranked priorities and chose the
  notebook model. No code changed.
- 2026-11-10 — Task 00 done. `src/dsp/` has the FFT, the reversible
  spectrogram and the polygon mask, with 12 passing tests. A 60 s clip at
  48 kHz analyses in about 0.4 s and masks and resynthesises in about 0.5 s
  (Node 22). Dependency allowlist, `npm run verify` and CI added.
