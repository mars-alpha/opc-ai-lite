import {
  auditFormalLearningIdentities,
  ensureAllFormalLearningIdentities
} from "../lib/server/learning/formal-identity";

const CONFIRM = "LEARNING-IDENTITY-001";

async function main() {
  const run = process.argv.includes("--run");
  const confirmArg = process.argv.find((arg) => arg.startsWith("--confirm="));
  const confirm = confirmArg?.slice("--confirm=".length) ?? "";

  const before = await auditFormalLearningIdentities();
  console.log(
    "FORMAL_LEARNING_IDENTITIES_BEFORE=" +
      before.present +
      "/" +
      before.expected
  );

  if (!run) {
    if (before.missing.length > 0) {
      console.log(
        "FORMAL_LEARNING_IDENTITIES_MISSING=" +
          before.missing.map((item) => item.key).join(",")
      );
    }
    console.log("DRY_RUN_ONLY=PASS");
    return;
  }

  if (confirm !== CONFIRM) {
    throw new Error("CONFIRM_REQUIRED:" + CONFIRM);
  }

  const after = await ensureAllFormalLearningIdentities();
  if (after.present !== after.expected || after.missing.length > 0) {
    throw new Error(
      "FORMAL_LEARNING_IDENTITY_PROVISION_INCOMPLETE:" +
        after.present +
        "/" +
        after.expected
    );
  }

  console.log(
    "FORMAL_LEARNING_IDENTITIES_AFTER=" +
      after.present +
      "/" +
      after.expected
  );
  console.log("FORMAL_LEARNING_IDENTITY_PROVISION=PASS");
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
);
