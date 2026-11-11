# Task 06: Lasso listening and track edits

## Goal

The owner draws a loop around part of the spectrogram and hears only what is
inside it. They can copy a track, highlight part of the copy, and either
delete the highlight or delete everything except it. After a deletion leaves
a gap, they can drag one side over to close it.

## Read first

- `docs/architecture.md` — the document types and the rules under them,
  "Everything you hear is rendered first".
- `docs/decisions.md` — 8 to 10, 22 to 24.
- `.claude/rules/lessons/dsp.md`.

## Starting point

`src/dsp/` already has the reversible spectrogram, polygon rasterising,
feathering and masking, with tests. Tracks have one piece each. Highlights
are time ranges. `renderTrack` handles pieces, offset and fades.

## Build

1. **Lasso.** A two-way choice on the cell: range or lasso. With lasso,
   dragging draws a freehand closed shape. Store it as a polygon in source
   seconds and Hz, simplified to at most 64 points. It can be named and
   linked like any highlight.
2. **Playing a lasso (`src/model/`, pure).** Take the source over the shape's
   time span plus one window of padding on each side, run the reversible
   spectrogram (`fftSize` 2048, hop 512), apply the rasterised mask feathered
   by 2 frames and 3 bins, convert back, and return the span. Cache the result
   until the shape or source changes. This is independent of the display's
   window size.
3. **Copy track.** "Copy track" remembers the track. "Add track" in any
   spectrogram cell, on any page, then offers to paste a copy of it. The copy
   has new ids, the same `sourceId`, and copies of the pieces, mutes and
   highlights. Pasting into the same cell is how the owner gets a working
   copy to edit; pasting into another cell is how they show the same
   recording twice, for example an overview and a zoomed-in figure.
4. **Two edit actions**, shown only while a highlight is active on a track:
   - **Delete highlight.**
     Range: split the pieces so that source range is no longer on the track.
     The gap stays; nothing moves.
     Lasso: add a mute with `silence: "inside"`.
   - **Keep only highlight.**
     Range: trim the pieces to that source range.
     Lasso: trim the pieces to the shape's time span and add a mute with
     `silence: "outside"`.

   The highlight itself is kept. Each action is one undo entry.
5. **Rendering with mutes.** Extend `renderTrack`: apply mutes to the source
   first (range mutes zero the samples; polygon mutes use the same masking as
   step 2, inverted as needed), then cut and place the pieces with fades.
   The picture is computed from the rendered track, so edits are visible.
6. **Moving pieces.** Above each track's spectrogram, a thin strip shows its
   pieces as blocks. Dragging a block changes that piece's `start`. A piece
   cannot be dragged past its neighbours; it stops at their edges. Dragging
   the track header still moves the whole track. The strip can stay hidden
   while a track has a single piece.
7. **Shapes follow their sound.** Highlights and mutes are in source time, so
   when a piece moves, its highlights are drawn at the new place. Write the
   mapping from source time to timeline time as a pure function and use it
   everywhere shapes are drawn or played. A shape whose source range is no
   longer on the track is listed but shown as "not on this track".

## Not in this task

- Rearranging pieces into a different order, or moving them between tracks.
- Closing gaps automatically. The owner drags a piece to close a gap.
- Copy and paste of audio, fades, volume changes, or any other effect.
- Editing the points of a lasso after drawing it. Redraw instead.

## Automated checks

All in plain Node unless marked.

- Lasso playback of a clip with two tones, with the shape around one: that
  tone is within 1 dB, the other is at least 40 dB down.
- Delete a range: the rendered samples in the gap are zero, and the samples
  before and after are unchanged apart from the fades. The source array is
  untouched.
- Keep only a range: the rendered track contains just that stretch.
- Delete a lasso on a two-tone clip: inside the shape's time span the circled
  tone is at least 40 dB down and the other is within 1 dB; outside that span
  the samples are unchanged.
- Copy track: editing the copy leaves the original's rendered samples
  identical.
- Moving a piece: the source-to-timeline mapping moves its highlights by the
  same amount; pieces never overlap, whatever drag is requested.
- Undo after each edit restores the exact previous document.
- Browser: drawing a lasso creates a polygon highlight with sensible
  coordinates; "Delete highlight" adds a mute; dragging a piece block changes
  its `start`.
- `npm run verify:all` passes.

## Owner checklist

- [ ] I switch to lasso, circle a bright patch, press Space, and hear only
      that patch. It may sound thin or ringing; that is expected.
- [ ] I circle the hiss of an "s" and can hear that it is the "s".
- [ ] I copy a track into a second spectrogram cell further down the page and
      zoom that one in, so the page shows an overview and a close-up.
- [ ] I copy a track, drag across a word on the copy, choose "Keep only
      highlight", and the copy now holds just that word. The original is
      unchanged.
- [ ] On another copy I choose "Delete highlight" on a word. A gap appears
      and playback is silent there.
- [ ] I drag the right-hand block over to close the gap, and it stops when it
      meets the left one.
- [ ] I lasso a patch and choose "Delete highlight"; the patch goes dark in
      the picture and I can hear it is gone.
- [ ] Ctrl+Z undoes each of these one step at a time.
- [ ] After a reload, all edits are still there.

## Handoff notes

(Filled in by the session that finishes this task.)
