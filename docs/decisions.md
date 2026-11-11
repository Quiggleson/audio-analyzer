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
10. **It is mainly a listening aid.** The owner circles something to hear
    what it is, then listens for it in the full recording. Selecting a plain
    time range across all frequencies is supported the same way. The same
    shapes drive the track edits in decision 23.

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

15. **A project is a notebook.** It has pages; a page is a list of cells; a
    cell is either markdown text or a spectrogram. The owner chose "a notebook
    with spectrograms in it" over "a spectrogram with notes beside it". The
    look to aim for is described in `docs/design.md`.
16. **A spectrogram cell is a stack of tracks on one shared timeline**, with
    its own view (time and frequency range, display settings) and its own
    shapes. Solo analysis is a cell with one track. "Add track" works any
    number of times; the layout is designed for two.
17. **A track holds exactly one recording, a slide offset and a list of
    edits.** Record or import fills it. Re-record replaces it. There is no
    history of takes: the owner re-records only because the last attempt was
    bad.
18. **Re-record can be undone during the session and is not kept after.**
    Re-recording removes the track's highlights, because they described the
    old sound; if any exist, ask before replacing.
19. **Alignment is manual.** The owner drags a track left or right until the
    bright parts line up. No automatic time-warping.
20. **The comparison loop is the main control surface.** One key each for:
    play the reference, play mine, play both, re-record. "Both" can put one
    track in each ear.
21. **Recording while another track plays is supported**, for singing along in
    headphones. Recording lag is corrected with the same slide.

## Highlights and track edits

These replace the vague word "splice". The owner's use cases are:

22. **Highlight part of a track and play only that.** A highlight is a time
    range or a lasso. Play with a highlight active plays only the highlight.
23. **Copy a track to a new track, highlight part of it, then either delete
    the highlight or delete everything except the highlight.** The copy points
    at the same source recording, so copying is cheap and the original track
    is untouched. The deletion is stored as an edit on the track, not applied
    to the audio, so it can be undone. Deleting a stretch of time leaves a
    gap; nothing closes up by itself. The owner drags one side over to close
    the gap if they want it closed. Deleting a lasso silences that patch.
24. **Playback always stops at the end of the track or highlight.** No
    looping and no slow-motion playback. The owner presses play when ready to
    listen closely and does not want a loop to distract.

## Notes, saving and sharing

25. **Notes are the markdown cells.** They sit above and below the
    spectrograms they discuss, like a textbook page. Pages can link to each
    other wiki-style, and text can link to a highlight; following that link
    shows the highlight and can play it. The owner names a highlight (for
    example "harsh s") and links to it by name: `[[Page]]`, `[[#harsh s]]`,
    `[[Page#harsh s]]`. Renaming keeps links working.
26. **The view of each spectrogram cell is saved**, so reopening the project
    shows the same place and settings.
27. **Autosave goes to the browser's IndexedDB, with a visible reminder to
    export.** Browser storage can be cleared without warning; the owner
    accepted that with the reminder.
28. **Export produces one self-contained HTML file, and the app can re-import
    it** to get the full editable project back. One format serves saving,
    backup, moving between machines and sharing, so the file carries
    everything needed to edit.
29. **Opened on its own, the exported file is a read-only notebook** with the
    whole project inside. The recipient can read, play and pan. They cannot
    edit, lasso or record: the point is to show an analysis without giving
    enough freedom to break the example.

## How the work is run and checked

30. **The owner runs the app locally on Debian in Brave.** Brave is built on
    Chromium, the same engine the automated browser tests use. Editing is
    supported on desktop Chromium-family browsers only. Nothing may depend on
    an API that Brave disables by default, such as the File System Access API.
31. **Automated tests use generated audio, never real recordings.** Analysis
    tests use signals with known answers. Browser tests feed a generated WAV
    file in as the microphone (verified 2026-11-10: a 440 Hz file came back
    as 440 Hz at the right level with voice processing off). The repo is
    public, so no recording of the owner's voice is ever committed.
32. **One task, one pull request, one owner checklist.** Each task ends with
    a checklist of use cases the owner tries by hand. Automated tests cannot
    judge whether something looks or sounds right; the owner can. The work is
    delivered as a pull request with that checklist in its description. The
    owner reviews, tries it, and merges; the next task starts after that.
33. **Small on purpose.** The owner dislikes Audacity because it is old,
    clunky and full of features they do not care about. Build only what the
    task asks for. Do not add options, menus or settings "for completeness".
34. **The owner is learning.** They know that different parts of a
    spectrogram carry different information about speech, and little more.
    Use plain words in the interface, and where a technical term is needed
    (formant, harmonic, fricative), say what it means where it appears.

## Order of work

35. **Priority, most important first:** saved analyses (export and re-import,
    so the owner can pick up where they left off), the compare loop, notes,
    lasso listening, sharing. `PLAN.md` follows this.

## Added in the second interview round

36. **Nothing is drawn over the spectrogram except the owner's own highlights,
    the playback cursor and piece edges.** No pitch lines, formant lines or
    other analysis overlays; the owner does not want the picture cluttered.
    A text readout under the picture shows time, frequency and loudness at
    the pointer.
37. **Shapes are anchored to the recording, not the timeline.** A highlight is
    stored in seconds into its source, so it moves with its sound when a
    track or a piece is slid.
38. **Every source is stored as mono, 16-bit.** Stereo files are averaged on
    import. Analysis only needs one channel, and rounding once at intake
    makes save, export and re-import bit-exact. The cost is that imported
    music plays back in mono.
39. **Several projects.** The start screen is a plain list; each project is
    exported separately.
40. **Recording controls:** a microphone picker and a level meter; one key
    starts recording and the same key stops it; no countdown.
41. **A built-in starter notebook teaches by having the owner record.** For
    example: say "ssss", and the text explains the hiss they see. It ships no
    audio. It is the last task.

## Added after the sync quiz (2026-11-11)

The owner answered scenario questions against the plan. These settle the
places where the two differed.

42. **When playback stops at the end, the cursor goes back to where playback
    started**, so pressing Space again replays the same thing.
43. **The plain wheel never affects a spectrogram.** It always scrolls the
    page, so reading is never interrupted. Shift+wheel pans the spectrogram in
    time. Ctrl+wheel zooms time around the pointer and Ctrl+Shift+wheel zooms
    frequency. There is no click-to-focus mode. (The owner chose Shift+wheel;
    the two zoom gestures are a proposal for the owner to try in task 02.)
44. **A track can be copied into another spectrogram cell.** This is how the
    owner shows an overview of a recording and, further down the page, a
    zoomed-in figure of the same recording. The copy shares the source.
45. **In a shared file the reader can click to place the cursor and play from
    there.** They cannot make selections.
46. **Links from text point at ids, never at names.** Renaming can therefore
    never break a link. Deleting the target leaves a dead link, shown as dead.
47. **Following a link keeps the current zoom** and scrolls the spectrogram so
    the target is at the start of the view.

## Open

Do not build anything that depends on these until they are settled here.

- **What a highlight is.** The owner's picture differs from the plan's
  "named highlight". They do not attach notes to highlights; a paragraph says
  something like "look at 0:13, see this pattern" and points at a place. The
  likely shape is two things: a temporary selection (for playing only that
  and for edits) and a saved place that text links to. Tasks 02, 05, 06 and
  07 and the `Highlight` type in `docs/architecture.md` still describe the
  old model.
- **Play keys with several tracks.** The owner expects that pressing track 2's
  key while track 1 plays makes both play. Task 04 still says any play key
  stops playback.
- **Mono storage of imported music** (decision 38) has not been confirmed.

## Out of scope

- Separating vocals from instruments.
- Analysing or scoring long recordings such as a 60-minute talk.
- Accounts, a server, or collaboration.
- Editing by the recipient of a shared file.
- Automatic alignment of two tracks.
- Looping and slow-motion playback.
- Pitch, formant or other analysis overlays on the spectrogram.
- Closing gaps automatically after a deletion.
- A history of takes.
- Phones and tablets, for editing.
