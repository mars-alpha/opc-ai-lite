import { drainLearningBehaviorJobs } from "../lib/server/learning-behavior-worker";
import { closeDatabase } from "../lib/server/db";

const limitArg = process.argv.find((value) => value.startsWith("--limit="));
const parsed = limitArg ? Number(limitArg.slice("--limit=".length)) : 20;
const limit = Number.isFinite(parsed) ? parsed : 20;

drainLearningBehaviorJobs(limit)
  .then((result) => {
    console.log(JSON.stringify(result));
    process.exitCode = result.failed > 0 ? 1 : 0;
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
