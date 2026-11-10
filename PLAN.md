# Plan

Work on the first task that is not done. Each task has a file in `docs/tasks/`
with its goal, context, acceptance criteria and how to verify it. When you
finish a task, mark it done here, add one line under Log, and write handoff
notes at the bottom of the task file.

Status is one of: `done`, `in progress`, `not started`.

| # | Task | Status | Task file |
|---|------|--------|-----------|
| 00 | Analysis core (FFT, reversible spectrogram, lasso mask) and guardrails (allowlist, verify, CI) | done | none; see Log |
| 01 | App shell as a notebook (project, pages, cells), state store, browser smoke test with a generated microphone signal | not started | not written yet |
| 02 | One track in a spectrogram cell: import, record, draw, pan and zoom, play to the end and stop, highlight a time range and play only that | not started | not written yet |
| 03 | Saved analyses: autosave, export the project as one HTML file, re-import it, export reminder | not started | not written yet |
| 04 | Compare loop: add tracks, re-record, slide to align, play one, the other or both, record while the other plays | not started | not written yet |
| 05 | Notebook: markdown cells, pages with navigation, wiki links, links from text to a highlight | not started | not written yet |
| 06 | Lasso listening and track edits: lasso, copy a track, delete the highlight or everything except it | not started | not written yet |
| 07 | Sharing: the exported HTML opens on its own as a read-only notebook | not started | not written yet |
| 08 | Overlays (pitch, formants, loudness) and a readout under the pointer | not started | not written yet |

The order follows the owner's priorities (decision 35 in `docs/decisions.md`).

## Log

Newest first. One line per finished task or notable event.

- 2026-11-10 — Plan reordered after the owner ranked priorities and chose the
  notebook model. No code changed.
- 2026-11-10 — Task 00 done. `src/dsp/` has the FFT, the reversible
  spectrogram and the polygon mask, with 12 passing tests. A 60 s clip at
  48 kHz analyses in about 0.4 s and masks and resynthesises in about 0.5 s
  (Node 22). Dependency allowlist, `npm run verify` and CI added.
