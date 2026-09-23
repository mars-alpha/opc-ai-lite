import "server-only";

import {
  claimLearningBehaviorJobs,
  completeBackgroundJob,
  failBackgroundJob
} from "./background-jobs";
import { refreshLearningBehaviorSignals } from "./learning-insights/service";

export async function drainLearningBehaviorJobs(limit = 20) {
  const jobs = await claimLearningBehaviorJobs(limit);
  let completed = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      await refreshLearningBehaviorSignals(job.payload.lessonId, job.payload.signal);
      await completeBackgroundJob(job.id);
      completed += 1;
    } catch (error) {
      await failBackgroundJob(job.id, error);
      failed += 1;
    }
  }

  return { claimed: jobs.length, completed, failed };
}
