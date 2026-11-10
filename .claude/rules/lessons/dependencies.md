---
paths:
  - "package.json"
  - "package-lock.json"
  - "dependencies.allowlist.json"
  - "scripts/check-deps.mjs"
---

# Lessons: dependencies

## Things that went wrong

**Take versions from the registry, never from memory.**
Why: on 2026-11-10 the first commit pinned Vitest 2 and TypeScript 5 from
memory. The registry had Vitest 5 and TypeScript 7.
Check: `npm view <name> version` before writing a version; `npm run check:deps`
fails on a major that differs from the allowlist.

**A package that looks standard may be abandoned.**
Why: on 2026-11-10 an undo helper for the state store was proposed from
memory. Its last publish was two years earlier, so it was dropped and undo is
written in the repo.
Check: `npm view <name> time.modified deprecated`. Older than 18 months or
deprecated means do not add it.

## Known traps, not yet hit

- A made-up package name can still install: people register names that models
  commonly invent. The allowlist is the defence, so never add to it without
  running `npm view` and reading the result.
- The npm download-count service was not reachable from the cloud container on
  2026-11-10. Last publish date was used as the maintenance signal instead.
