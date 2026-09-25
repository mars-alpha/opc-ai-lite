import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("SCRIPT_ENTRYPOINTS_FAILED:" + code);
}

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
  scripts?: Record<string, string>;
};

const scriptEntries = Object.entries(pkg.scripts ?? {});
const referenced = new Map<string, string[]>();

for (const [name, command] of scriptEntries) {
  const match = command.match(/scripts\/([^\s"']+)/);
  if (!match?.[1]) continue;
  const file = match[1];
  const names = referenced.get(file) ?? [];
  names.push(name);
  referenced.set(file, names);
  assert(fs.existsSync("scripts/" + file), "PACKAGE_SCRIPT_TARGET_MISSING:" + name + ":" + file);
  assert(!file.startsWith("_historical-"), "HISTORICAL_SCRIPT_EXPOSED:" + name + ":" + file);
}

const files = fs
  .readdirSync("scripts")
  .filter((file) => file.endsWith(".ts"))
  .sort();

for (const file of files) {
  if (file.startsWith("_historical-")) {
    assert(!referenced.has(file), "HISTORICAL_SCRIPT_REFERENCED:" + file);
    continue;
  }
  assert(referenced.has(file), "CURRENT_SCRIPT_WITHOUT_PACKAGE_ENTRY:" + file);
}

const retired = [
  "accept-learning-runtime-pilots.ts",
  "provision-learning-runtime-pilots.ts",
  "validate-learning-spec.ts",
  "validate-learning-runtime.ts",
  "accept-course-builder-real-draft.ts",
  "accept-course-builder-application-draft.ts",
  "accept-course-builder-practice-draft.ts",
  "accept-course-builder-project-draft.ts",
  "accept-course-builder-concept-mastery.ts",
  "accept-three-question-mastery.ts",
  "accept-course-builder-beginner-quality.ts",
  "accept-beginner-foundation-batch-a.ts",
  "accept-foundation-stage2.ts",
  "accept-foundation-continuity-trial.ts",
  "accept-track01-batch-a.ts"
];

for (const file of retired) {
  assert(!fs.existsSync("scripts/" + file), "RETIRED_SCRIPT_REINTRODUCED:" + file);
  assert(!referenced.has(file), "RETIRED_SCRIPT_EXPOSED:" + file);
}

console.log("SCRIPT_ENTRYPOINTS_ALL_CURRENT_SCRIPTS_EXPOSED=PASS");
console.log("SCRIPT_ENTRYPOINTS_HISTORICAL_NOT_EXPOSED=PASS");
console.log("SCRIPT_ENTRYPOINTS_RETIRED_ABSENT=PASS");
