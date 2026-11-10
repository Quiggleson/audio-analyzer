# Decisions

These were settled with the owner on 2026-11-10. Each has its reason so you
can tell when a situation is outside what the decision was meant to cover. If
one looks wrong, stop and raise it with the owner; do not work around it.

## What the app is for

1. **Purpose.** The owner wants to get comfortable reading spectrograms, to
   find out why their speech is harder to understand than average, and to get
   better at mimicking songs and professional voices. The loop is: record,
   look closely, hear that something is off, find what in the sound explains
   it, compare against a reference, re-record.
2. **Comparison is about patterns, not sound quality.** A professional clip
   differs in microphone and processing as well as voice. The owner compares
   timing and speech patterns, and also compares their own recordings against
   each other.
3. **One user, no backend.** It is a static site. Recordings stay in the
   browser unless the owner exports them.

## Shape of the system

4. **Browser app in TypeScript: React, Vite, Zustand, WebGL2 for the
   spectrogram.** The browser gives microphone access, GPU drawing and sharing
   without installs. The colour map and the frequency scale are applied in the
   shader, so changing contrast or switching linear and log is instant.
5. **No audio or DSP packages.** The FFT, spectrogram, mask, and later pitch
   and formant tracking are written in `src/dsp/` and tested against signals
   with known answers. Reason: audio packages are often old and unmaintained,
   and the maths is small and does not rot.
6. **Every package is on an enforced allowlist.** See `CLAUDE.md`.
7. **Positions are seconds and Hz.** A lasso, a highlight, a clip boundary and
   a note anchor are all shapes in time and frequency. Consequence: the
   picture can be recomputed at any window size without breaking them, so
   window size is a user control (short windows show formants, long windows
   show harmonics).
8. **Nothing destroys audio.** A source recording is never modified. Trimming
   and splicing are ranges into a source.

## Lasso

9. **Render, then play.** Circling a region computes the reversible
   spectrogram for that time span, multiplies by a feathered mask, converts
   back to audio and plays the result. It is not a real-time filter. Measured:
   a 60 s clip analyses in about 0.4 s and resynthesises in about 0.5 s, so a
   typical 10 s clip is around 150 ms.
10. **It is a listening aid, not an editor.** The owner circles something to
    hear what it is, then listens for it in the full recording. Selecting a
    plain time range across all frequencies is supported the same way.

## Recordings

11. **Clips are typically 10 s and rarely over 60 s.** The design assumes a
    whole clip's picture fits in memory.
12. **Import has no length cap.** Files over about five minutes show a
    warning. To keep long files affordable, only magnitudes are kept for
    drawing; the complex spectrogram is computed for the span being
    resynthesised.
13. **Full mixes are imported as they are.** Isolating a voice from
    instruments is the owner's job, outside the app.
14. **Recording captures raw samples with the browser's voice processing
    off.** Echo cancellation, noise suppression and automatic gain would
    distort what is being studied.

## Document model

15. **A project has sections. A section is a stack of tracks on one shared
    timeline.** Solo analysis is a section with one track. "Add track" works
    any number of times; the layout is designed for two.
16. **A track holds exactly one recording and a slide offset.** Record or
    import fills it. Re-record replaces it. There is no history of takes: the
    owner re-records only because the last attempt was bad.
17. **Re-record can be undone during the session and is not kept after.**
    Shapes on a re-recorded track stay where they are; if any exist, ask
    before replacing.
18. **Alignment is manual.** The owner drags a track left or right until the
    bright parts line up. No automatic time-warping.
19. **The comparison loop is the main control surface.** One key each for:
    play the reference, play mine, play both, re-record. "Both" can put one
    track in each ear.
20. **Recording while another track plays is supported**, for singing along in
    headphones. Recording lag is corrected with the same slide.

## Notes and sharing

21. **Notes are wiki-style markdown attached to shapes and to the project.**
    A note can link to another note and to a shape; following a shape link
    moves the view there and can play it.
22. **Saved views.** The owner can return to the same place and settings in a
    later session.
23. **Sharing exports the whole project as one self-contained, read-only HTML
    file** with the viewer, audio, shapes and notes inside. It works when
    emailed or put on any static host. The recipient can view, play and pan.
    They cannot edit, lasso or record: the point is to show an analysis
    without giving enough freedom to break the example.
24. **Autosave goes to the browser's IndexedDB.**
25. **The shared HTML file is also the project file.** The app can re-import
    it and get the full editable project back, so one format serves sharing,
    backup and moving between machines. The file must therefore carry
    everything needed to edit, not only what the read-only viewer shows.

## Out of scope

- Separating vocals from instruments.
- Analysing or scoring long recordings such as a 60-minute talk.
- Accounts, a server, or collaboration.
- Editing by the recipient of a shared file.
- Automatic alignment of two tracks.
