// Fails if package.json contains a dependency that is not on the allowlist,
// is not pinned to an exact version, or is on a different major version from
// the one that was verified. Run by `npm run verify` and by CI.
import { readFileSync } from "node:fs";

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const pkg = read("../package.json");
const allow = read("../dependencies.allowlist.json").packages;

const problems = [];
const major = (v) => v.split(".")[0];

for (const field of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
  for (const [name, range] of Object.entries(pkg[field] ?? {})) {
    // Type-only packages are allowed when the package they describe is.
    const base = name.startsWith("@types/") ? name.slice("@types/".length) : name;
    const entry = allow[name] ?? (name !== base ? allow[base] : undefined);
    if (!entry) {
      problems.push(`${name}: not in dependencies.allowlist.json`);
      continue;
    }
    if (!/^\d+\.\d+\.\d+$/.test(range)) {
      problems.push(`${name}: "${range}" is not an exact version (no ^, ~, ranges, tags or URLs)`);
      continue;
    }
    if (allow[name] && major(range) !== major(entry.version)) {
      problems.push(`${name}: ${range} is a different major from the verified ${entry.version}`);
    }
  }
}

if (problems.length > 0) {
  console.error("Dependency check failed:\n" + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}
console.log("Dependency check passed.");
