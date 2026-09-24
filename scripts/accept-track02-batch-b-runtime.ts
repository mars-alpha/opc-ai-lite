import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";

loadEnvConfig(process.cwd());

import { OPC_MEMBERSHIP_PRODUCT } from "../lib/membership/policy";
import { TRACK02_RUNTIME_COURSE_SLUG } from "../lib/learning/track02-batch-a-runtime";
import {
  track02BatchBRuntimeDefinitions
} from "../lib/learning/track02-batch-b-runtime";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { entitlements, users } from "../lib/server/db/schema";
import {
  getLearningPrerequisiteRecommendation,
  getLessonAccess,
  getStageAccess
} from "../lib/server/entitlements/service";
import {
  answerLessonCheck,
  getRequiredCheckGateState,
  getRequiredPracticeGateState,
  submitPractice
} from "../lib/server/interactive/service";
import {
  getLessonProgressRuntimeState,
  setLessonCompletion
} from "../lib/server/learning/service";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { buildLessonRuntimePlan } from "../lib/learning/lesson-runtime";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK02_BATCH_B_RUNTIME_ACCEPTANCE_FAILED:" + code);
}

function checkId(lessonSlug: string, order: number) {
  return "check_ai_work_" + lessonSlug.replace(/-/g, "_") + "_" + order;
}

async function main() {
  const [user] = await getDatabase()
    .insert(users)
    .values({ displayName: "TRACK02_BATCH_B_RUNTIME_ACCEPTANCE" })
    .returning({ id: users.id });
  if (!user) throw new Error("TRACK02_ACCEPTANCE_USER_CREATE_FAILED");

  try {
    const firstLesson = track02BatchBRuntimeDefinitions[0]!.lesson.id;
    const stageAccess = await getStageAccess(user.id, TRACK02_RUNTIME_COURSE_SLUG);
    assert(stageAccess.allowed, "T1_MUST_NOT_BE_HARD_STAGE_GATE");

    const prerequisite = await getLearningPrerequisiteRecommendation(
      user.id,
      TRACK02_RUNTIME_COURSE_SLUG
    );
    assert(!prerequisite.satisfied, "FRESH_USER_SHOULD_RECEIVE_T1_RECOMMENDATION");

    const beforeMembership = await getLessonAccess(
      user.id,
      TRACK02_RUNTIME_COURSE_SLUG,
      firstLesson
    );
    assert(
      !beforeMembership.allowed && beforeMembership.reason === "MEMBERSHIP_REQUIRED",
      "NON_MEMBER_MUST_BE_DENIED"
    );

    await getDatabase().insert(entitlements).values({
      userId: user.id,
      type: OPC_MEMBERSHIP_PRODUCT.entitlementType,
      resourceType: OPC_MEMBERSHIP_PRODUCT.resourceType,
      resourceId: OPC_MEMBERSHIP_PRODUCT.resourceId,
      source: "ADMIN"
    });

    const afterMembership = await getLessonAccess(
      user.id,
      TRACK02_RUNTIME_COURSE_SLUG,
      firstLesson
    );
    assert(
      afterMembership.allowed && afterMembership.reason === "ENTITLED",
      "MEMBER_MUST_ACCESS_WITHOUT_T1_COMPLETION"
    );

    for (const definition of track02BatchBRuntimeDefinitions) {
      const lessonSlug = definition.lesson.id;
      const spec = getLessonSpec(TRACK02_RUNTIME_COURSE_SLUG, lessonSlug);
      assert(spec, "SPEC_REGISTERED:" + lessonSlug);
      const plan = buildLessonRuntimePlan(spec);
      const [initialCheckGate, initialPracticeGate] = await Promise.all([
        getRequiredCheckGateState(user.id, "lesson_ai_work_" + lessonSlug.replace(/-/g, "_")),
        getRequiredPracticeGateState(user.id, "lesson_ai_work_" + lessonSlug.replace(/-/g, "_"))
      ]);
      const blockers = [
        ...(plan.requiresCheck && !initialCheckGate.configured ? ["CHECK_NOT_CONFIGURED"] : []),
        ...(plan.requiresPractice && !initialPracticeGate.configured ? ["PRACTICE_NOT_CONFIGURED"] : [])
      ];
      const configurationReady = blockers.length === 0;
      const enforcementActive = blockers.length === 0;

      assert(configurationReady, "CONFIGURATION_READY:" + lessonSlug);
      assert(enforcementActive, "ENFORCEMENT_ACTIVE:" + lessonSlug);
      assert(initialCheckGate.requiredIds.length === 3, "THREE_CHECKS:" + lessonSlug);
      assert(initialPracticeGate.requiredIds.length === 1, "ONE_PRACTICE:" + lessonSlug);
      assert(!initialCheckGate.passed, "CHECK_NOT_PREPASSED:" + lessonSlug);
      assert(!initialPracticeGate.passed, "PRACTICE_NOT_PREPASSED:" + lessonSlug);

      for (const check of definition.checks) {
        const answer = check.type === "MULTI_SELECT"
          ? check.correctAnswers
          : check.correctAnswer;
        const result = await answerLessonCheck(
          user.id,
          checkId(lessonSlug, check.order),
          answer
        );
        assert(result.correct, "CHECK_MUST_PASS:" + lessonSlug + ":" + check.order);
      }

      const practice = await submitPractice(
        user.id,
        definition.practice.id,
        definition.referenceFill
      );
      assert(practice.status === "PASSED", "PRACTICE_MUST_PASS:" + lessonSlug);

      const [readyCheckGate, readyPracticeGate] = await Promise.all([
        getRequiredCheckGateState(user.id, "lesson_ai_work_" + lessonSlug.replace(/-/g, "_")),
        getRequiredPracticeGateState(user.id, "lesson_ai_work_" + lessonSlug.replace(/-/g, "_"))
      ]);
      assert(readyCheckGate.passed, "CHECK_GATE_PASSED:" + lessonSlug);
      assert(readyPracticeGate.passed, "PRACTICE_GATE_PASSED:" + lessonSlug);

      await setLessonCompletion(user.id, {
        courseSlug: TRACK02_RUNTIME_COURSE_SLUG,
        lessonSlug,
        completed: true
      });

      const completed = await getLessonProgressRuntimeState(
        user.id,
        TRACK02_RUNTIME_COURSE_SLUG,
        lessonSlug
      );
      assert(completed.completed, "COMPLETION_PERSISTED:" + lessonSlug);
      assert(completed.currentStep === 6, "COMPLETION_STEP_6:" + lessonSlug);
    }

    console.log("TRACK02_BATCH_B_RUNTIME_ACCESS_SEPARATION=PASS");
    console.log("TRACK02_BATCH_B_RUNTIME_MEMBER_ACCESS=PASS");
    console.log("TRACK02_BATCH_B_RUNTIME_CONFIGURATION_READY=PASS");
    console.log("TRACK02_BATCH_B_RUNTIME_ENFORCEMENT_ACTIVE=PASS");
    console.log("TRACK02_BATCH_B_RUNTIME_CHECK_GATE=PASS");
    console.log("TRACK02_BATCH_B_RUNTIME_PRACTICE_GATE=PASS");
    console.log("TRACK02_BATCH_B_RUNTIME_COMPLETION=PASS");
    console.log("TRACK02_BATCH_B_RUNTIME_ACCEPTANCE=PASS");
  } finally {
    await getDatabase().delete(users).where(eq(users.id, user.id));
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});