# Task 07: Sharing

## Goal

The exported HTML file, opened on its own in a browser, is a read-only
notebook. Someone the owner sends it to can read the pages, play the tracks
and highlights, and pan and zoom the spectrograms. They cannot change
anything. The same file still imports back into the app as a full project.

## Read first

- `docs/architecture.md` — "The exported file".
- `docs/decisions.md` — 28, 29.
- `docs/design.md`.
- `.claude/rules/lessons/dependencies.md` and `testing.md`.

## Starting point

Export writes an HTML file holding the project JSON and each source as a
base64 WAV, with a one-sentence body. Import reads it back exactly.

## Prove this first

A file opened from disk (`file://`) cannot load separate script files or ES
modules, so the viewer must be one classic script placed inline. Before
building anything else:

1. Add a second Vite build that turns a tiny React entry file into a single
   self-contained script (no imports at run time) and a single CSS file. Read
   Vite's documentation or type definitions for the current way to do this;
   do not write the configuration from memory.
2. Write a throwaway HTML file with that script and CSS inline and open it
   from `file://` in a Playwright test. Confirm it renders, creates a WebGL2
   context, and can play a short generated sound after a click.

If this cannot be made to work, stop and report what failed. Do not switch to
a hosted viewer or add a package without the owner's agreement.

## Build

1. **Viewer entry.** A second entry point that reads the project and sources
   from the page's own `<script>` elements and shows the notebook with the
   same components the editor uses, in a read-only mode.
2. **Read-only means:**
   - No editing of text, pages, cells, tracks or highlights.
   - No record, import, lasso, edit actions, slide or piece dragging.
   - Yes: page navigation, outline, links, clicking to place the cursor and
     playing from there, playing tracks with the same keys, pan, zoom and
     display controls, the readout, theme toggle. View changes are not saved.
   - The reader cannot make a selection of their own.
   - Pass read-only down as a prop or context. Hide controls that do nothing;
     do not show them disabled.
3. **Export includes the viewer.** At export time the app fetches the built
   viewer script and CSS and places them inline after the data elements.
   Escape any `</script` inside the script text. Add a small "made with
   audio-analyzer" line with a link to the repository at the foot of the
   viewer.
4. **Development.** `npm run dev` must have a viewer build available, so that
   export works during development. Build it before the dev server starts.
5. **Export dialog.** Before the download, one line: the file will contain
   the project's recordings. Show the file's size.
6. **Import still works.** The viewer's presence must not change what import
   reads.

## Not in this task

- Hosting, upload, short links, or any server. The owner sends the file or
  puts it on a host themselves.
- Comments or edits by the recipient.
- Phone layouts. The viewer should not break on a narrow screen (columns may
  collapse), but it is not designed or tested for phones.

## Automated checks

- Pure: `importProject(exportProject(...))` is still exactly equal with the
  viewer included.
- Pure: the exported file contains no `</script` inside any inline script or
  data element except the closing tags themselves.
- Browser, from `file://`: export a project with two pages, text, a link to a
  named highlight and a recording of a generated tone. Open the file. The
  title and text are there; the spectrogram's brightest row is at the tone's
  frequency; clicking the highlight link activates it; play starts and stops
  by itself.
- Browser, from `file://`: no record, import, add, delete or edit control
  exists in the page, and typing does nothing.
- `npm run verify:all` passes.

## Owner checklist

- [ ] I export a project and double-click the file. It opens in Brave as a
      notebook that looks like my project.
- [ ] In that file I can read every page, follow links, play tracks and
      highlights, and zoom the spectrograms.
- [ ] In that file I cannot change, record or delete anything, and there are
      no dead buttons.
- [ ] The export dialog tells me the file contains my recordings and how big
      it is.
- [ ] I send the file to another device or another browser profile, and it
      works there with no setup.
- [ ] Importing that same file into the app gives me back the full editable
      project.

## Handoff notes

(Filled in by the session that finishes this task.)
