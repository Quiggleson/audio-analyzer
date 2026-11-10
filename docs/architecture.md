# Architecture

This is the design every task builds on. `docs/decisions.md` says what was
decided and why; this file says how the pieces fit. If a task file and this
file disagree, stop and ask the owner.

## Folders and who may import whom

| Folder | Holds | May import |
|---|---|---|
| `src/dsp/` | FFT, spectrogram, masks. Pure maths. | nothing |
| `src/model/` | The project document: types, validation, edits, undo, rendering a track to samples, export and import text. Pure. | `dsp` |
| `src/audio/` | Microphone, decoding files, playback. Web Audio. | `dsp`, `model` |
| `src/render/` | WebGL2 drawing of spectrograms. | `dsp`, `model` |
| `src/store/` | The Zustand store, autosave to IndexedDB. | `model`, `audio` |
| `src/ui/` | React components. | everything |
| `e2e/` | Playwright browser tests. | nothing from `src` |

`dsp` and `model` have no DOM and no Web Audio, so they are tested in plain
Node. Put as much behaviour as possible in those two folders: anything there
can be proven by a unit test, and anything outside needs a browser.

## The document

One project is one JSON-serialisable object. Everything the owner makes is in
it except the audio samples, which are stored beside it by source id.

```ts
type Id = string;                     // crypto.randomUUID()

interface ProjectDoc {
  format: "audio-analyzer/project";
  version: 1;
  id: Id;
  title: string;
  createdAt: string;                  // ISO 8601
  updatedAt: string;
  pages: Page[];                      // at least one
  sources: Record<Id, SourceMeta>;
}

interface SourceMeta {
  id: Id;
  name: string;                       // file name, or "Recording"
  origin: "recorded" | "imported";
  sampleRate: number;                 // the real rate; never assume one
  length: number;                     // samples
  createdAt: string;
}

interface Page { id: Id; title: string; cells: Cell[] }

type Cell = MarkdownCell | SpectrogramCell;

interface MarkdownCell { id: Id; kind: "markdown"; text: string }

interface SpectrogramCell {
  id: Id;
  kind: "spectrogram";
  tracks: Track[];
  view: { t0: number; t1: number; f0: number; f1: number };  // timeline s, Hz
  display: {
    fftSize: 256 | 512 | 1024 | 2048 | 4096;
    scale: "linear" | "log";
    minDb: number;
    maxDb: number;
  };
}

interface Track {
  id: Id;
  name: string;
  sourceId: Id | null;                // null until recorded or imported
  offset: number;                     // seconds; slides the whole track
  pieces: Piece[];                    // sorted by start, never overlapping
  mutes: Mute[];
  highlights: Highlight[];
}

interface Piece {
  id: Id;
  sourceStart: number;                // seconds into the source
  sourceEnd: number;
  start: number;                      // seconds after the track's offset
}

type Shape =
  | { kind: "range"; t0: number; t1: number }
  | { kind: "polygon"; points: { t: number; f: number }[] };

interface Highlight { id: Id; name: string; shape: Shape }
interface Mute { id: Id; shape: Shape; silence: "inside" | "outside" }
```

Rules that follow from this:

- **A new track has one piece covering the whole source.** Deleting a time
  range splits a piece in two and leaves a gap. Keeping only a range leaves
  one piece. Dragging a piece changes its `start`. Sliding the track changes
  `offset`. None of these touch the samples.
- **Shapes are in source seconds and Hz.** A highlight or mute belongs to a
  track and is positioned by the time in the source recording, not by where
  it sits on the timeline. So when a piece or a track is moved, its
  highlights move with the sound they describe. To draw a shape, map each
  piece's source range to the timeline and draw the parts that fall inside
  pieces.
- **A highlight with an empty name is temporary.** There is at most one per
  cell; making another replaces it. Naming it keeps it.
- **Highlight names are unique within a page**, so text can link to them.

## Audio samples

- Every source is stored as **mono, 16-bit, at the rate it was captured or
  decoded at**. A stereo file is averaged to mono on import. Samples are
  rounded to 16-bit once, at intake, so that saving, exporting and
  re-importing are bit-exact from then on.
- In memory a source is a `Float32Array` in the range -1 to 1 whose values are
  exact multiples of 1/32768.
- Sources are immutable. Re-recording creates a new source and points the
  track at it.

## Everything you hear is rendered first

There is one audio path. Before playing, the track is rendered to a single
buffer by a pure function in `src/model/`:

```ts
renderTrack(track: Track, source: Float32Array, sampleRate: number): Float32Array
```

It places each piece at `offset + piece.start`, applies a 5 ms fade at every
piece edge (a hard cut clicks), and applies the track's mutes: a range mute
zeroes samples, a polygon mute goes through the reversible spectrogram in
`src/dsp/` with a feathered mask. Playing a highlight renders the same way and
then plays only that slice (range) or only what is inside the shape (polygon).

Playback takes rendered buffers and starts them. Two tracks played together
are two buffers started with the same `when` from one `AudioContext`. Playback
always stops at the end; there is no looping.

Because rendering is pure, every edit (delete, keep, mute, slide) is tested in
Node by checking the samples.

## Drawing

- The picture is computed from the rendered track, so edits and mutes are
  visible in it.
- Magnitudes in dB are scaled to 8 bits over a fixed -120 to 0 dB range and
  uploaded as `R8` textures, one column per frame. `R8` filters smoothly on
  every WebGL2 device; float textures need an extension.
- A texture is at most 2048 frames wide. Longer clips use several textures
  side by side. (The headless test browser reported a limit of 8192.)
- The shader applies the colour map, `minDb`/`maxDb`, and the linear or log
  frequency scale. Changing any of them redraws without recomputing.
- Changing `fftSize` recomputes the picture. Hop is `fftSize / 4`.
- Highlights, the playback cursor and piece edges are drawn on a 2D canvas
  layered over the WebGL canvas.
- Nothing else is drawn over the spectrogram. Analysis overlays such as pitch
  or formant lines are out of scope; the owner does not want the picture
  cluttered.

## State, undo and saving

- One Zustand store holds the open `ProjectDoc`, the samples by source id, and
  transient UI state (active highlight, playback position, which cell has
  focus).
- Document edits go through functions in `src/model/` that take a document and
  return a new one. They never mutate.
- Undo is a stack of previous documents, capped at 100. Pan, zoom and display
  changes update the document but do not add undo entries. A burst of typing
  in a markdown cell is one entry, added when the cell loses focus.
- Autosave writes the document to IndexedDB shortly after each change, and
  each source's samples once, when the source is created.
- A source that no track points to is deleted at the start of the next
  session, not immediately, so undoing a re-record works within a session.

## The exported file

One HTML file carries the whole project:

```html
<!doctype html>
<html>
  <head><meta charset="utf-8"><title>PROJECT TITLE</title></head>
  <body>
    <script type="application/json" id="aa-project">{ ...ProjectDoc... }</script>
    <script type="application/octet-stream" id="aa-source-SOURCEID">BASE64 WAV</script>
    <!-- one per source -->
    <!-- the read-only viewer, added in task 07 -->
  </body>
</html>
```

- Each source is a standard 16-bit mono WAV file, base64 encoded.
- Text placed inside a `<script>` element must not contain `</script` or
  `<!--`. Write every `<` in the JSON as `<`.
- Import parses the file with `DOMParser`, reads those elements, validates the
  document, and rejects a `version` it does not know with a clear message.
- `import(export(project))` must give back a document and samples that are
  exactly equal to the originals. This is tested.

## Testing

- `npm run verify` is fast: checks, type check, unit tests.
- `npm run verify:all` adds a production build and the browser tests. It must
  pass before a pull request is opened.
- Browser tests feed a generated WAV in as the microphone and can read pixels
  back from the WebGL canvas, so both recording and drawing are checked
  against known signals. Both were verified to work on 2026-11-10.
