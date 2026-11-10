# Plan

Work on the first task that is not done. Each task has a file in `docs/tasks/`
with its goal, context, acceptance criteria and how to verify it. When you
finish a task, mark it done here, add one line under Log, and write handoff
notes at the bottom of the task file.

Status is one of: `done`, `in progress`, `not started`.

| # | Task | Status | Task file |
|---|------|--------|-----------|
| 00 | Analysis core (FFT, reversible spectrogram, lasso mask) and guardrails (allowlist, verify, CI) | done | none; see Log |
| 01 | App shell (Vite, React, store), project document model, browser smoke test | not started | not written yet |
| 02 | One track: import, record, draw the spectrogram, pan and zoom, play with a cursor | not started | not written yet |
| 03 | Selection: time range and lasso, play only the selection | not started | not written yet |
| 04 | Shapes, markdown notes, saved views, autosave, undo | not started | not written yet |
| 05 | Comparison: sections with several tracks, slide to align, play one, the other or both, record while the other plays | not started | not written yet |
| 06 | Overlays: pitch, formants, intensity, and a readout under the pointer | not started | not written yet |
| 07 | Share: export the whole project as one read-only HTML file | not started | not written yet |

## Log

Newest first. One line per finished task or notable event.

- 2026-11-10 — Task 00 done. `src/dsp/` has the FFT, the reversible
  spectrogram and the polygon mask, with 12 passing tests. A 60 s clip at
  48 kHz analyses in about 0.4 s and masks and resynthesises in about 0.5 s
  (Node 22). Dependency allowlist, `npm run verify` and CI added.
