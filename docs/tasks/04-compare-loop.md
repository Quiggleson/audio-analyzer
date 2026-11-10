# Task 04: The compare loop

## Goal

The owner adds two tracks to a spectrogram cell, puts a reference in one and
records themselves in the other, re-records until it is right, slides one
track until the bright parts line up, and plays either track or both. They
can record while the other track plays.

The loop the owner described: play the professional, play mine, re-record
mine, play the professional, play mine, play both to hear where they differ.
Every step of that loop should be one key press.

## Read first

- `docs/architecture.md` — the document types, "Everything you hear is
  rendered first".
- `docs/decisions.md` — 2, 16 to 21, 24.
- `.claude/rules/lessons/audio.md`.

## Starting point

A spectrogram cell shows one track with record, import, play, highlight and
readout. Projects are saved.

## Build

1. **Several tracks.** "Add track" works any number of times. Tracks are
   stacked with one shared time axis and one shared cursor. Each track has
   its own frequency axis and a slim header: editable name, record or
   re-record, import, remove (ask first if it has a recording).
2. **Focus.** One track is focused at a time; clicking a track focuses it.
   `R` records into the focused track.
3. **Slide.** Dragging a track's header left or right changes its `offset`.
   Left and right arrow keys nudge the focused track by 10 ms, and by 1 ms
   with Shift. The picture moves as the track is dragged. One drag is one
   undo entry.
4. **Timeline.** The cell's timeline runs from the earliest track start to
   the latest track end. Offsets may be negative.
5. **Play keys.**
   - `1` to `9` play that track alone.
   - `0` plays all tracks together.
   - Space plays the focused track.
   - Any play key while playing stops.
   - Playback starts at the cursor, or covers the active highlight's span of
     the timeline if there is one, and always stops at the end.
   - Show these keys in the track headers so they do not need to be
     memorised.
6. **One track in each ear.** A toggle on the cell. When it is on and
   all-tracks playback has exactly two tracks, the first goes to the left ear
   and the second to the right.
7. **Record while the others play.** A toggle on the cell. When it is on,
   pressing `R` starts the other tracks playing from the cursor and starts
   recording at the same moment; the new recording's `offset` is the cursor
   position. Stopping the recording stops playback. Show a one-line reminder
   to use headphones, because otherwise the microphone records the playback.
   Do not try to correct recording lag automatically; the owner fixes it
   with the slide.
8. **Together means together.** All tracks in one playback are started with
   one `when` from the same `AudioContext`.

## Not in this task

- Automatic alignment or time-warping.
- Keeping old takes. Re-record replaces.
- Looping, slow playback, per-track volume, solo and mute buttons.
- Moving individual pieces (task 06).

## Automated checks

- Pure: timeline extent for tracks with positive and negative offsets;
  the span of a highlight on one track mapped to the timeline.
- Pure: mixing two rendered tracks for "one in each ear" gives the first only
  in the left channel and the second only in the right.
- Browser: two tracks from generated tones of different lengths; play all;
  playback lasts about as long as the timeline and stops.
- Browser: slide a track by a known amount and check its `offset`.
- Browser: with record-while-playing on, record from the fake microphone; a
  new source appears with its `offset` at the cursor position.
- `npm run verify:all` passes.

## Owner checklist

- [ ] I add two tracks, import a short professional clip into the first and
      record myself into the second.
- [ ] I press `R` again and my bad take is replaced. Ctrl+Z brings the old
      one back.
- [ ] `1` plays the reference, `2` plays me, `0` plays both, and I never have
      to reach for the mouse during the loop.
- [ ] I drag my track until the bright parts line up with the reference, and
      fine-tune with the arrow keys.
- [ ] With "one in each ear" on and headphones, I hear the reference on one
      side and myself on the other.
- [ ] With "record while the others play" on, I can speak or sing along to
      the reference, and afterwards slide my take into place.
- [ ] Playback always stops at the end.
- [ ] After a reload, both tracks and their alignment are as I left them.

## Handoff notes

(Filled in by the session that finishes this task.)
