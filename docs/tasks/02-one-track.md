# Task 02: One track in a spectrogram cell

## Goal

In a spectrogram cell the owner can record their voice or import a file, see
its spectrogram, pan and zoom it, play it, drag across part of it and hear
only that part, name that part to keep it, and read off the time, frequency
and loudness under the pointer.

## Read first

- `docs/architecture.md` — "Audio samples", "Everything you hear is rendered
  first", "Drawing".
- `docs/decisions.md` — 7 to 14, 22, 24, 26, 33, 34.
- `docs/design.md`.
- `.claude/rules/lessons/audio.md`, `dsp.md` and `testing.md`.

## Starting point

Task 01 left a notebook with placeholder spectrogram cells, a store with
undo, and browser tests with a working fake microphone.

## Prove this first

Draw a known signal and read it back. Generate a 1 kHz tone, compute its
picture, draw it with WebGL2 on a canvas, read the pixels, and confirm the
brightest row is where 1 kHz should be for the current view. Do this as a
browser test before building any interaction. It was shown on 2026-11-10 that
the headless browser supports WebGL2, `R8` textures and pixel readback; this
step proves your renderer on top of that.

## Build

1. **Intake (`src/model/`, pure).** `toMono16(channels)` averages channels and
   rounds to 16-bit steps. Every source passes through it once.
2. **Decode (`src/audio/`).** One shared `AudioContext`. Decode an imported
   file, pass it through `toMono16`, and store the real sample rate. Files
   longer than five minutes show a warning and still import.
3. **Record (`src/audio/`).**
   - A microphone picker and a level meter are visible before recording.
   - `R` starts recording into the focused track; `R` again stops. No
     countdown.
   - Capture raw samples with an `AudioWorklet`. Create the worklet from an
     inline string through a Blob URL (shown to work on 2026-11-10); this
     avoids bundler configuration.
   - Request the microphone with echo cancellation, noise suppression and
     automatic gain all off. Read back the track's settings and tell the
     owner in plain words if any stayed on.
   - Recording into a track that already has a recording replaces it and
     removes the track's highlights, because they described the old sound. If
     the track has any, ask first. Ctrl+Z brings back both within the
     session.
4. **Render (`src/model/`, pure).** `renderTrack` as described in the
   architecture file: pieces, offset, 5 ms fades. Mutes come in task 06, but
   write the function so they slot in.
5. **Picture (`src/dsp/`, pure).** A function from samples to an 8-bit
   picture: magnitudes normalised so a full-scale sine reads 0 dB, converted
   to dB, scaled over -120 to 0. Hop is `fftSize / 4`.
6. **Draw (`src/render/`).** A WebGL2 renderer as described in the
   architecture file. Colour map: a ramp through `#440154`, `#3b528b`,
   `#21918c`, `#5ec962`, `#fde725`, dark for quiet. Time axis in seconds and
   frequency axis in kHz, labelled.
7. **View.** Default: the whole clip, 0 to 8 kHz, linear, `fftSize` 1024.
   - The plain wheel never affects the spectrogram; it always scrolls the
     page. There is no click-to-focus mode.
   - Shift+wheel pans in time. Ctrl+wheel zooms time around the pointer.
     Ctrl+Shift+wheel zooms frequency. Stop the browser's own page zoom for
     Ctrl+wheel only while the pointer is over a spectrogram.
   - Dragging the time axis also pans.
   - Controls, kept few: window size (label it by what it does, "sharper in
     time" to "sharper in pitch", and say in a short hint that short windows
     show the broad bands of vowels and long windows show the fine stripes of
     pitch), linear or log, and a brightness range.
   - The view and display settings are saved in the document without adding
     undo entries.
8. **Play.** Space plays from the cursor to the end and stops. When playback
   stops by itself, the cursor goes back to where it started, so Space plays
   the same thing again. Space while playing stops. Clicking sets the cursor. The cursor line follows playback,
   driven by the audio clock. No looping.
9. **Highlight.** Dragging across the spectrogram makes a time-range
   highlight. While one is active, Space plays only that range. A name field
   keeps it; named highlights are listed under the cell, and each can be
   activated or deleted. Escape clears a temporary one.
10. **Readout.** One line of text under the spectrogram showing the time,
    frequency and loudness under the pointer. Do not draw crosshairs or
    anything else on the picture.

## Not in this task

- More than one track per cell (task 04). Build for one.
- Lasso shapes and track edits (task 06).
- Saving across reloads (task 03).
- Pitch lines, formant lines or any analysis overlay. These are out of scope
  for the whole project.

## Automated checks

- `toMono16`: stereo averages correctly; every output value is a multiple of
  1/32768; applying it twice changes nothing.
- `renderTrack`: one whole piece at offset 0 returns the source; an offset
  shifts it by the right number of samples; piece edges are faded.
- Picture: a full-scale 1 kHz sine peaks in the right row at about 0 dB.
- Browser: the "prove this first" test.
- Browser: importing a generated WAV creates a source with the right length.
- Browser: recording from the fake microphone for about one second creates a
  source of about one second whose dominant frequency is about 440 Hz.
- Browser: a plain wheel event over the spectrogram leaves the view
  unchanged; Shift+wheel changes the time range.
- Browser: play reaches the end and stops by itself, and the cursor is back
  where it started. With a highlight of
  known length, playback lasts about that long.
- `npm run verify:all` passes.

## Owner checklist

- [ ] I pick my microphone, see the level meter move when I talk, press `R`,
      speak, press `R`, and a spectrogram of what I said appears.
- [ ] I import a music file and its spectrogram appears. A long file warns me
      but still loads.
- [ ] Scrolling the page with the pointer over a spectrogram scrolls the
      page and leaves the spectrogram alone, every time.
- [ ] Shift+wheel slides the spectrogram along in time. Ctrl+wheel zooms in
      and out in time, and Ctrl+Shift+wheel zooms frequency. I note here if
      either zoom gesture feels wrong.
- [ ] After playback stops at the end, Space plays the same stretch again.
- [ ] Zooming and panning feel smooth, and the axes stay correct.
- [ ] Space plays from where I clicked and stops at the end without looping.
- [ ] I drag across one word, press Space, and hear only that word.
- [ ] I name the highlight, make another, and can get back to the first.
- [ ] Moving the window-size control visibly trades fine stripes for sharper
      timing, and the hint helps me understand why.
- [ ] The readout under the pointer shows time, frequency and loudness, and
      nothing is drawn over the picture except my highlight and the cursor.
- [ ] My recording sounds like me, not processed or gated. (If it does not,
      try with Brave Shields off for this site and tell the next session.)

## Handoff notes

(Filled in by the session that finishes this task.)
