---
paths:
  - "src/dsp/**"
---

# Lessons: analysis maths (src/dsp)

## Things that went wrong

None yet.

## Conventions the tests depend on

- Spectrogram arrays are frame-major: frame `m`, bin `k` is at `m * bins + k`.
- Frame `m` is centred on sample `m * hop`. Its time is `m * hop / sampleRate`
  seconds; bin `k` is `k * sampleRate / fftSize` Hz.
- `hop` must be at most `fftSize / 2`, or the inverse cannot reconstruct.
- Values are stored as Float32, so a round trip is exact to about 1e-6. Do not
  tighten the round-trip test past 1e-5.

## Known traps, not yet hit

- Nothing in this folder may import the DOM, Web Audio, or another `src/`
  folder. The tests run in plain Node; one such import breaks them all.
- A mask with hard edges makes the result ring. Feather it (`featherMask`)
  before resynthesis in anything the user hears.
- The complex spectrogram of a long file is large (about 46 MB per minute at
  48 kHz, fftSize 2048, hop 512). Keep only magnitudes for drawing and compute
  the complex one for the time span being resynthesised.
- The picture's window size and the resynthesis window size are separate
  settings. Shapes are in seconds and Hz, so they apply to both.
