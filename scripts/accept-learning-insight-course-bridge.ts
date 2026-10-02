import { and, eq, inArray } from "drizzle-orm";
import { approveCourseUpdateCandidateToMaintenance } from "../lib/server/learning-insights/service";
import { listAdminCourseRegistry } from "../lib/server/admin/course-registry";
import { formalRuntimeLessonId } from "../lib/server/learning/formal-identity";
import { getDatabase } from "../lib/server/db";
import { courseUpdateCandidates } from "../lib/server/db/schema";

const CONFIRM = "LEARNING-INSIGHT-BRIDGE-001";

async function main() {
  const run = process.argv.includes("--run");
  const confirmArg = process.argv.find((arg) => arg.startsWith("--confirm="));
  const confirm = confirmArg?.slice("--confirm=".length) ?? "";
  const db = getDatabase();

  const active = await db
    .select({
      id: courseUpdateCandidates.id,
      lessonId: courseUpdateCandidates.lessonId
    })
    .from(courseUpdateCandidates)
    .where(
      and(
        eq(courseUpdateCandidates.sourceType, "ADMIN_MANUAL"),
        inArray(courseUpdateCandidates.status, ["DRAFT", "REVIEW"])
      )
    );

  const activeLessonIds = new Set(active.map((item) => item.lessonId));
  const target = listAdminCourseRegistry().items.find(
    (item) =>
      item.lessonId !== "t1-01-ai-task-fit" &&
      !activeLessonIds.has(
        formalRuntimeLessonId(item.runtimeCourseSlug, item.runtimeLessonId)
      )
  );

  if (!target) throw new Error("NO_SAFE_LESSON_FOR_BRIDGE_ACCEPTANCE");

  console.log(
    "LEARNING_INSIGHT_BRIDGE_ACCEPT_TARGET=" +
      target.runtimeCourseSlug +
      "/" +
      target.runtimeLessonId
  );

  if (!run) {
    console.log("DRY_RUN_ONLY=PASS");
    return;
  }
  if (confirm !== CONFIRM) {
    throw new Error("CONFIRM_REQUIRED:" + CONFIRM);
  }

  let sourceId: string | null = null;
  let adminCandidateId: string | null = null;
  let conflictSourceId: string | null = null;

  try {
    const lessonId = formalRuntimeLessonId(
      target.runtimeCourseSlug,
      target.runtimeLessonId
    );

    const [source] = await db
      .insert(courseUpdateCandidates)
      .values({
        lessonId,
        sourceType: "LEARNING_INSIGHT",
        insightId: null,
        sourceKnowledgeId: null,
        disposition: "CONTENT_UPDATE",
        proposal: {
          diagnosis: {
            rootCause: "Bridge acceptance temporary learning insight",
            recommendation: ["temporary acceptance only"]
          },
          source: "LEARNING_INSIGHT",
          requiresHumanReview: true
        },
        status: "PENDING_REVIEW"
      })
      .returning({ id: courseUpdateCandidates.id });

    sourceId = source.id;

    const bridge = await approveCourseUpdateCandidateToMaintenance(
      sourceId,
      { email: "bridge.acceptance@local.test" } as never
    );
    adminCandidateId = bridge.adminCandidateId;

    const [sourceAfter] = await db
      .select({
        status: courseUpdateCandidates.status,
        reviewedBy: courseUpdateCandidates.reviewedBy
      })
      .from(courseUpdateCandidates)
      .where(eq(courseUpdateCandidates.id, sourceId))
      .limit(1);

    const [adminAfter] = await db
      .select({
        status: courseUpdateCandidates.status,
        sourceType: courseUpdateCandidates.sourceType,
        proposal: courseUpdateCandidates.proposal
      })
      .from(courseUpdateCandidates)
      .where(eq(courseUpdateCandidates.id, adminCandidateId))
      .limit(1);

    const proposal =
      adminAfter?.proposal &&
      typeof adminAfter.proposal === "object" &&
      !Array.isArray(adminAfter.proposal)
        ? (adminAfter.proposal as Record<string, unknown>)
        : null;
    const sourceContext =
      proposal?.sourceContext &&
      typeof proposal.sourceContext === "object" &&
      !Array.isArray(proposal.sourceContext)
        ? (proposal.sourceContext as Record<string, unknown>)
        : null;

    const accepted =
      sourceAfter?.status === "APPROVED" &&
      adminAfter?.status === "DRAFT" &&
      adminAfter?.sourceType === "ADMIN_MANUAL" &&
      sourceContext?.type === "LEARNING_INSIGHT" &&
      sourceContext?.sourceCandidateId === sourceId &&
      typeof proposal?.updateReason === "string" &&
      proposal.updateReason.includes(
        "Bridge acceptance temporary learning insight"
      ) &&
      bridge.courseSlug === target.runtimeCourseSlug &&
      bridge.lessonSlug === target.runtimeLessonId;

    if (!accepted) throw new Error("LEARNING_INSIGHT_BRIDGE_DB_ACCEPT_FAILED");

    console.log("LEARNING_INSIGHT_BRIDGE_DB_ACCEPT=PASS");

    const [conflictSource] = await db
      .insert(courseUpdateCandidates)
      .values({
        lessonId,
        sourceType: "LEARNING_INSIGHT",
        insightId: null,
        sourceKnowledgeId: null,
        disposition: "CONTENT_UPDATE",
        proposal: {
          diagnosis: {
            rootCause: "Bridge acceptance conflict insight"
          },
          source: "LEARNING_INSIGHT",
          requiresHumanReview: true
        },
        status: "PENDING_REVIEW"
      })
      .returning({ id: courseUpdateCandidates.id });

    conflictSourceId = conflictSource.id;
    let conflictCode = "";
    try {
      await approveCourseUpdateCandidateToMaintenance(
        conflictSourceId,
        { email: "bridge.acceptance@local.test" } as never
      );
    } catch (error) {
      conflictCode = error instanceof Error ? error.message : String(error);
    }

    const [conflictAfter] = await db
      .select({ status: courseUpdateCandidates.status })
      .from(courseUpdateCandidates)
      .where(eq(courseUpdateCandidates.id, conflictSourceId))
      .limit(1);

    if (
      conflictCode !== "CANDIDATE_ALREADY_ACTIVE" ||
      conflictAfter?.status !== "PENDING_REVIEW"
    ) {
      throw new Error("LEARNING_INSIGHT_BRIDGE_ACTIVE_GUARD_DB_ACCEPT_FAILED");
    }

    console.log("LEARNING_INSIGHT_BRIDGE_ACTIVE_GUARD_DB_ACCEPT=PASS");
  } finally {
    if (conflictSourceId) {
      await db
        .delete(courseUpdateCandidates)
        .where(eq(courseUpdateCandidates.id, conflictSourceId));
    }
    if (adminCandidateId) {
      await db
        .delete(courseUpdateCandidates)
        .where(eq(courseUpdateCandidates.id, adminCandidateId));
    }
    if (sourceId) {
      await db
        .delete(courseUpdateCandidates)
        .where(eq(courseUpdateCandidates.id, sourceId));
    }
    console.log("LEARNING_INSIGHT_BRIDGE_TEST_DATA_CLEANUP=PASS");
  }
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
);
