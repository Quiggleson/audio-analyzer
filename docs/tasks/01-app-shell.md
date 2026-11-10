# Task 01: App shell as a notebook

## Goal

The owner runs `npm run dev`, opens the app in Brave, and sees a notebook:
a list of projects, pages down the left, cells in the middle. They can create
projects, pages and cells, type in a text cell, and undo. No audio yet. The
browser test setup that later tasks depend on exists and is proven.

## Read first

- `docs/architecture.md` — all of it. The document types are defined there.
- `docs/design.md` — the layout to aim for.
- `docs/decisions.md` — 15 to 18, 30 to 34.
- `.claude/rules/lessons/dependencies.md` and `testing.md`.

## Starting point

`src/dsp/` exists with tests. There is no app, no Vite, no React. The
allowlist already names the packages this task needs.

## Prove this first

The pinned `@playwright/test` must be able to drive a browser in your
environment. In the cloud container Chromium is pre-installed at
`/opt/pw-browsers/chromium` and its Playwright version may differ from the
allowlisted one. Write the Playwright config so it uses that path when it
exists and Playwright's own browser otherwise, then run one trivial test. If
the versions cannot work together, pin `@playwright/test` to the installed
version (same major is allowed) and update the allowlist entry.

## Build

1. **Tooling.** Add Vite, React, Zustand and Playwright from the allowlist,
   with exact versions taken from `npm view`, plus the `@types` packages React
   needs. Scripts: `dev`, `build`, `preview`, `e2e`, and
   `verify:all` = `verify`, then `build`, then `e2e`.
2. **`src/model/`.** The document types from the architecture file, and:
   - `createProject(title)` — one page, no cells.
   - `parseProject(value: unknown): ProjectDoc` — validates every field and
     throws an error naming the path of the first problem. Hand-written; do
     not add a schema package.
   - Edit functions that return a new document: add, rename, remove and
     reorder pages; add, remove and move cells; set a markdown cell's text;
     add and remove a track in a spectrogram cell.
   - A history helper: push, undo, redo, capped at 100.
3. **`src/store/`.** A Zustand store with the list of projects (in memory for
   now), the open project, `apply(edit)`, `undo()` and `redo()`.
4. **`src/ui/`.**
   - Start screen: project list, "New project", open, rename, delete (ask
     first).
   - Notebook screen in three columns as in `docs/design.md`. Left: pages
     (add, rename, select, delete). Centre: the page's cells with a quiet
     control between cells to add a text cell or a spectrogram cell. Right:
     an empty outline column; task 05 fills it.
   - Text cell: a plain textarea showing the raw text. Rendering comes in
     task 05.
   - Spectrogram cell: a placeholder box listing its tracks by name, with
     "Add track". It should already sit in the page like a figure.
   - Ctrl+Z undoes, Ctrl+Shift+Z redoes.
   - Light and dark themes from CSS custom properties, with a toggle. One
     accent colour.
5. **Browser tests in `e2e/`.**
   - Playwright starts the built app with `vite preview`.
   - A global setup generates a WAV file (a 440 Hz tone) into a temporary
     folder and launches Chromium with the fake-microphone flags from the
     testing lessons file. Nothing generated is committed.
   - Test 1: create a project, add a page, add one cell of each kind, type in
     the text cell, undo twice, and check the document shrinks accordingly.
   - Test 2: inside the app's page, call `getUserMedia` with voice processing
     off and confirm the captured signal is about 440 Hz. This proves the
     microphone fixture for task 02.
6. **CI.** Extend the workflow to install Playwright's Chromium and run
   `verify:all`.
7. **`README.md`** for the owner: what the app is in two sentences, and how to
   run it locally (`npm ci`, `npm run dev`, which address to open).

## Not in this task

- Saving. A reload loses everything until task 03; say so on the start screen
  in one quiet line and remove that line in task 03.
- Rendering markdown, links, the outline (task 05).
- Any audio or drawing (task 02).

## Automated checks

- Unit tests for every edit function: the input document is unchanged and the
  output is as expected.
- `parseProject` accepts a document made by `createProject` plus edits, and
  rejects: wrong `format`, unknown `version`, a missing field, a cell with an
  unknown `kind`, overlapping pieces in a track.
- History: undo and redo restore exact previous documents; the cap holds.
- The two browser tests above.
- `npm run verify:all` passes.

## Owner checklist

- [ ] `npm ci` then `npm run dev` starts without errors, and the address it
      prints opens in Brave.
- [ ] I can create a project, give it a name, and open it.
- [ ] I can add a second page, rename it, and switch between pages.
- [ ] I can add a text cell and a spectrogram cell, and type in the text cell.
- [ ] Ctrl+Z removes the last thing I did; Ctrl+Shift+Z brings it back.
- [ ] The theme toggle switches light and dark, and both are readable.
- [ ] The layout reminds me of the reference page: pages left, content
      centre, calm and uncluttered.

## Handoff notes

(Filled in by the session that finishes this task.)
