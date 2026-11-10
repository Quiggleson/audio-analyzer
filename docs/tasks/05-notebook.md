# Task 05: The notebook

## Goal

Text cells render as formatted notes. The owner writes around their
spectrograms the way the reference page does, links one page to another, and
links a phrase to a named highlight so that clicking it shows and plays that
exact sound.

## Read first

- `docs/design.md` — all of it.
- `docs/decisions.md` — 15, 25, 33, 34.
- `.claude/rules/lessons/dependencies.md`.

## Starting point

Text cells are plain textareas. Pages exist in the left column. The right
column is empty. Named highlights exist on tracks.

## Build

1. **Rendering.** Add `markdown-it` and `dompurify` from the allowlist. Read
   their type definitions in `node_modules` before calling them. Configure
   markdown-it with raw HTML off, and pass its output through DOMPurify before
   it reaches the page.
2. **Editing.** A text cell shows rendered text. Clicking it turns it into a
   textarea with the raw markdown; clicking away or Ctrl+Enter renders it
   again. An empty cell shows a quiet prompt.
3. **Cells.** Each cell can be moved up, moved down and deleted (ask before
   deleting a spectrogram cell that has recordings). Keep these controls
   quiet until the cell is hovered or focused.
4. **Links.** Three forms, written in double square brackets:
   - `[[Page title]]` — another page.
   - `[[#highlight name]]` — a named highlight on this page.
   - `[[Page title#highlight name]]` — a named highlight on another page.

   Implement this as a small markdown-it inline rule written in this repo.
   - A page link opens that page.
   - A highlight link scrolls to its cell and makes that highlight active. It
     is rendered with a small play control beside it; that control also plays
     the highlight.
   - A link that matches nothing is shown in a visibly different style. A
     broken page link offers to create the page when clicked.
5. **Renames keep links working (`src/model/`, pure).** Renaming a page or a
   highlight rewrites every link to it in every text cell of the project, in
   the same undo entry. Highlight names stay unique within a page; if a new
   name collides, refuse and say why.
6. **Outline.** The right column lists the current page's headings (levels 1
   to 3). Clicking one scrolls to it. The section being read is highlighted.
7. **Typography.** Match the reading column of the reference: about 720 px
   wide, generous line spacing, headings bold and modest in size. Spectrogram
   cells are the full width of the column.

## Not in this task

- A rich-text or block editor. Plain markdown in a textarea is the editor.
- Images, tables of contents across pages, tags, backlinks, search.
- Maths rendering.

## Automated checks

- Pure: parsing finds all three link forms and ignores brackets inside code
  spans. Resolution finds the right page and highlight, and reports broken
  links.
- Pure: renaming a page or highlight rewrites exactly the links that pointed
  to it and no others.
- Pure: text containing `<script>` or an `onerror` attribute produces output
  with no script element and no event-handler attribute.
- Browser: write a link to a named highlight, click it, and the highlight
  becomes active in its cell. Click its play control and playback starts.
- Browser: the outline lists the page's headings and clicking one scrolls.
- `npm run verify:all` passes.

## Owner checklist

- [ ] I click a text cell, write a heading, some bold text and a list, click
      away, and it renders cleanly.
- [ ] A page with text above and below a spectrogram reads like the reference
      page.
- [ ] `[[Other page]]` becomes a link that takes me there.
- [ ] I name a highlight "harsh s", write `[[#harsh s]]` in a note, and
      clicking it shows that highlight. Its play control plays it.
- [ ] I rename the highlight and the link in my note still works.
- [ ] A link to something that does not exist looks different from a working
      one.
- [ ] The outline on the right follows where I am on the page.
- [ ] I can reorder and delete cells without hunting for the controls, and
      they stay out of the way when I am reading.

## Handoff notes

(Filled in by the session that finishes this task.)
