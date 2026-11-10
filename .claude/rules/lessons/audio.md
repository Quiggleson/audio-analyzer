---
paths:
  - "src/audio/**"
---

# Lessons: recording, decoding and playback (src/audio)

## Things that went wrong

None yet.

## Known traps, not yet hit

- Browsers apply echo cancellation, noise suppression and automatic gain to
  microphone input by default. All three distort what this app studies.
  Request the microphone with all three set to false, then read back the
  track's actual settings and show the user if any stayed on.
- `MediaRecorder` produces compressed audio. Capture raw samples with an
  `AudioWorklet` instead. Do not use `ScriptProcessorNode`; it is deprecated.
- `decodeAudioData` resamples to the `AudioContext`'s sample rate, which
  varies by machine. Store the actual sample rate with every source and
  compute seconds and Hz from it, never from an assumed 44100 or 48000.
- An `AudioContext` starts suspended until a user gesture. Resume it inside
  the click or key handler that starts playback or recording.
- To play two tracks together, schedule both with `start(when, offset)` using
  one `when` taken from the same context's `currentTime`. Starting them in
  separate calls with no `when` lets them drift apart.
- Drive the playback cursor from `AudioContext.currentTime`, not from timers.
