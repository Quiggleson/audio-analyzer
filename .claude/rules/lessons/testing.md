---
paths:
  - "**/*.test.ts"
  - "e2e/**"
  - "playwright.config.ts"
---

# Lessons: tests

## Things that went wrong

**Do not call `expect` inside a loop over samples or bins.**
Why: on 2026-11-10 a test made about 200,000 `expect` calls and took 1.7 s.
Check: compute a worst case (min, max, largest error) in the loop and assert
on it once afterwards.
Last mattered: 2026-11-10

## Known traps, not yet hit

- Timing assertions vary between machines. Keep the ceiling generous and print
  the measured numbers so a slowdown is visible in the log.
- Test analysis code against signals whose answer is known in advance (a sine
  at a known frequency, two sines to separate), not against saved output from
  an earlier run.
- In the cloud container Chromium and Playwright are already installed, and
  the installed Playwright version can differ from the pinned one (1.63.0 was
  installed when 1.65.0 was current). Do not run `playwright install`. If the
  versions differ, launch with `executablePath: '/opt/pw-browsers/chromium'`.
- To test recording, launch Chromium with `--use-fake-device-for-media-stream`,
  `--use-fake-ui-for-media-stream` and
  `--use-file-for-fake-audio-capture=<absolute path to a WAV>`. Verified
  2026-11-10. The page must be served from `localhost`, not `file://`.
