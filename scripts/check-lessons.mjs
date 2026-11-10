// Keeps the lessons files from rotting. Fails if a lessons file is over the
// line cap, has no `paths:` frontmatter (so it would not load on demand), or
// has a lesson with no "Last mattered" date. Run by `npm run verify`.
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const MAX_LINES = 60;
const dir = fileURLToPath(new URL("../.claude/rules/lessons/", import.meta.url));
const problems = [];

for (const name of readdirSync(dir).filter((n) => n.endsWith(".md"))) {
  const text = readFileSync(dir + name, "utf8");
  const lines = text.split("\n");
  if (lines.at(-1) === "") lines.pop();

  if (lines.length > MAX_LINES) {
    problems.push(
      `${name}: ${lines.length} lines, cap is ${MAX_LINES}. Turn a lesson into a check, ` +
        `merge two, or delete the one with the oldest "Last mattered" date.`,
    );
  }
  if (!/^---\n(?:.*\n)*?paths:\n(?:\s+- .+\n)+(?:.*\n)*?---\n/.test(text)) {
    problems.push(`${name}: needs frontmatter with a non-empty "paths:" list`);
  }

  // A lesson is a bold line inside the "Things that went wrong" section.
  const start = lines.findIndex((l) => l.startsWith("## Things that went wrong"));
  if (start === -1) {
    problems.push(`${name}: missing a "## Things that went wrong" section`);
    continue;
  }
  let end = lines.findIndex((l, i) => i > start && l.startsWith("## "));
  if (end === -1) end = lines.length;
  const section = lines.slice(start + 1, end);
  const lessons = section.filter((l) => l.startsWith("**")).length;
  const dated = section.filter((l) => /^Last mattered: \d{4}-\d{2}-\d{2}$/.test(l)).length;
  if (lessons !== dated) {
    problems.push(`${name}: ${lessons} lessons but ${dated} "Last mattered: YYYY-MM-DD" lines`);
  }
}

if (problems.length > 0) {
  console.error("Lessons check failed:\n" + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}
console.log("Lessons check passed.");
