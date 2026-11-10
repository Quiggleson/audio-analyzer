# Task 03: Saved analyses

## Goal

The owner can close the browser, come back, and find every project exactly as
they left it. They can export a project as one HTML file and import it again,
on this machine or another, and get the identical project back.

This is the owner's highest priority: being able to pick up where they left
off.

## Read first

- `docs/architecture.md` — "State, undo and saving", "The exported file".
- `docs/decisions.md` — 26 to 28.
- `.claude/rules/lessons/dependencies.md` and `testing.md`.

## Starting point

Tasks 01 and 02 left projects that live in memory only, with recordings,
views and named highlights in the document.

## Build

1. **Autosave (`src/store/`).** Add `idb-keyval` from the allowlist.
   - Save the document shortly after each change (debounced).
   - Save each source's samples once, when the source is created, as 16-bit
     integers.
   - Keep a list of projects with title and last-changed time for the start
     screen.
   - On start, load the list; open a project by reading its document and
     sources.
   - On start, delete sources that no track in any project points to.
   - Call `navigator.storage.persist()` once. If it is refused, carry on.
2. **Export and import (`src/model/`, pure).**
   - WAV encode and decode for 16-bit mono.
   - `exportProject(doc, sources): string` builds the HTML described in the
     architecture file. Escape `<` in the JSON as `<`.
   - `importProject(html): { doc, sources }` parses it with `DOMParser`
     (inject the parser so the function stays testable in Node, or test it in
     the browser), validates with `parseProject`, and throws a clear error for
     a file that is not a project or has a newer `version`.
   - Until task 07 adds the viewer, the file's visible body is the project
     title and one sentence saying it is an audio-analyzer project and can be
     opened with the app's Import.
3. **UI.**
   - Export button in the notebook: downloads `<project title>.html`.
   - Import on the start screen. If a project with the same id already
     exists, ask: replace it, or keep both (the imported one gets a new id).
   - Export reminder: a quiet line near the title, "Changed since last
     export", shown when the document has changed since the last export.
     Keep the last-export time outside the document.
   - Remove the "a reload loses everything" line from task 01.
4. **Failure is visible.** If a save fails (storage full or blocked), show a
   clear message that does not go away until a save succeeds, and suggest
   exporting.

## Not in this task

- The read-only viewer inside the exported file (task 07).
- Saving to a real file on disk through the File System Access API. Brave
  disables it by default and the owner chose browser storage plus export.
- Syncing or any server.

## Automated checks

- WAV: decode(encode(samples)) is exactly equal for 16-bit-stepped samples.
- Round trip: `importProject(exportProject(doc, sources))` returns a document
  and samples exactly equal to the originals. Use a project with two pages,
  both cell kinds, a track with several pieces and named highlights, and a
  markdown cell containing `</script>`, `<!--`, emoji and non-Latin text.
- The exported string never contains `</script` inside the JSON element.
- Import rejects: a random HTML file, a project with `version: 2`, a project
  whose JSON is valid but fails `parseProject`.
- Browser: create a project with a recording and a named highlight, reload
  the page, and find it unchanged, including the view.
- Browser: export, clear the site's storage, import the file, and compare the
  document with the original.
- `npm run verify:all` passes.

## Owner checklist

- [ ] I record something, name a highlight, zoom in, close Brave completely,
      reopen it, and everything is exactly where I left it.
- [ ] After I change something, a line tells me I have not exported since.
      After I export, it goes away.
- [ ] Export downloads a single `.html` file.
- [ ] I delete the project in the app, import the file, and it comes back
      complete: pages, text, recordings, highlights.
- [ ] Importing a file for a project that still exists asks me what to do.
- [ ] Opening the exported file directly in Brave shows a short explanation,
      not a blank page.

## Handoff notes

(Filled in by the session that finishes this task.)
