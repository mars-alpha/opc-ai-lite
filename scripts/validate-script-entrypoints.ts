import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("SCRIPT_ENTRYPOINTS_FAILED:" + code);
}

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
  scripts?: Record<string, string>;
};

const referenced = new Set<string>();
for (const [name, command] of Object.entries(pkg.scripts ?? {})) {
  const match = command.match(/scripts\/([^\s"']+)/);
  if (!match?.[1]) continue;
  const file = match[1];
  assert(fs.existsSync("scripts/" + file), "PACKAGE_SCRIPT_TARGET_MISSING:" + name);
  referenced.add(file);
}

const files = fs.readdirSync("scripts").filter((file) => file.endsWith(".ts")).sort();
for (const file of files) {
  assert(referenced.has(file), "CURRENT_SCRIPT_WITHOUT_PACKAGE_ENTRY:" + file);
  assert(!file.startsWith("_historical-"), "HISTORICAL_SCRIPT_PRESENT:" + file);
  assert(!/^(accept-track|provision-track|validate-track|run-track)/.test(file), "TRACK_ONESHOT_SCRIPT_PRESENT:" + file);
}

const packageCommands = Object.values(pkg.scripts ?? {}).join("\n");
assert(!/runtime:track0|track0\d|batch-[a-z]/i.test(packageCommands), "TRACK_BATCH_COMMAND_EXPOSED");

console.log("SCRIPT_ENTRYPOINTS_ALL_CURRENT_SCRIPTS_EXPOSED=PASS");
console.log("SCRIPT_ENTRYPOINTS_NO_HISTORICAL_SCRIPTS=PASS");
console.log("SCRIPT_ENTRYPOINTS_NO_TRACK_BATCH_ONESHOTS=PASS");