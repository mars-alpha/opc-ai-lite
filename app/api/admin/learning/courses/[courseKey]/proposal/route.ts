import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminUser } from "../../../../../../../lib/server/admin/service";
import { requireSessionUser } from "../../../../../../../lib/server/auth/service";
import { getDatabase } from "../../../../../../../lib/server/db";
import { courseInsights } from "../../../../../../../lib/server/db/schema";
import {
  applyLearningInsightTaskB,
  getCurrentLearningInsightTaskB,
  publishLearningInsightTaskB,
  runLearningInsightTaskB
} from "../../../../../../../lib/server/learning-insights/task-b";

export const dynamic = "force-dynamic";

async function reviewMode(request: Request, courseKey: string) {
  if (
    process.env.NODE_ENV === "production" ||
    new URL(request.url).searchParams.get("review") !== "1"
  ) {
    return "PRODUCTION" as const;
  }
  const rows = await getDatabase()
    .select({ evidence: courseInsights.evidence })
    .from(courseInsights)
    .where(eq(courseInsights.lessonId, courseKey));
  const simulation = rows.some((row) => {
    const evidence =
      row.evidence && typeof row.evidence === "object" && !Array.isArray(row.evidence)
        ? (row.evidence as Record<string, unknown>)
        : null;
    return evidence?.simulation === true;
  });
  return simulation ? ("ACCEPTANCE" as const) : ("PRODUCTION" as const);
}

async function allowAcceptancePublish(
  request: Request,
  courseKey: string,
  mode: "PRODUCTION" | "ACCEPTANCE"
) {
  if (
    mode !== "ACCEPTANCE" ||
    process.env.NODE_ENV === "production" ||
    new URL(request.url).searchParams.get("acceptancePublish") !== "1"
  ) {
    return false;
  }
  const rows = await getDatabase()
    .select({ evidence: courseInsights.evidence })
    .from(courseInsights)
    .where(eq(courseInsights.lessonId, courseKey));
  return rows.some((row) => {
    const evidence =
      row.evidence && typeof row.evidence === "object" && !Array.isArray(row.evidence)
        ? (row.evidence as Record<string, unknown>)
        : null;
    return evidence?.manualAcceptance === true;
  });
}
function statusFor(code: string) {
  if (code === "UNAUTHENTICATED") return 401;
  if (code === "FORBIDDEN") return 403;
  if (code === "AI_ANALYSIS_NOT_CONFIGURED") return 503;
  if (code === "CANDIDATE_ALREADY_ACTIVE" || code === "SIMULATION_ACTION_DISABLED") return 409;
  if (
    code.startsWith("TASK_B_") ||
    code === "PATCH_BASELINE_CONFLICT" ||
    code === "UNKNOWN_EVIDENCE_REF"
  ) return 422;
  return 500;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseKey: string }> }
) {
  try {
    requireAdminUser(await requireSessionUser(request));
    const { courseKey } = await params;
    const mode = await reviewMode(request, courseKey);
    return NextResponse.json({ proposal: await getCurrentLearningInsightTaskB(courseKey, mode) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "TASK_B_READ_FAILED";
    const status = statusFor(code);
    if (status >= 500) console.error("[OPC AI] task B read failed", error);
    return NextResponse.json({ error: code }, { status });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseKey: string }> }
) {
  try {
    const user = requireAdminUser(await requireSessionUser(request));
    const { courseKey } = await params;
    const body = await request.json().catch(() => ({}));
    const action = String(body?.action ?? "GENERATE");
    const mode = await reviewMode(request, courseKey);

    if (action === "GENERATE") {
      return NextResponse.json({
        ok: true,
        result: await runLearningInsightTaskB(courseKey, { evidenceMode: mode })
      });
    }
    if (action === "PUBLISH") {
      const acceptancePublish = await allowAcceptancePublish(request, courseKey, mode);
      const edits = Array.isArray(body?.edits)
        ? body.edits.filter(
            (item: unknown): item is { patch_id: string; proposed_value: string } =>
              Boolean(
                item &&
                  typeof item === "object" &&
                  typeof (item as Record<string, unknown>).patch_id === "string" &&
                  typeof (item as Record<string, unknown>).proposed_value === "string"
              )
          )
        : [];
      const manualEdits = Array.isArray(body?.manualEdits)
        ? body.manualEdits.filter(
            (item: unknown): item is { path: string; proposed_value: string } =>
              Boolean(
                item &&
                  typeof item === "object" &&
                  typeof (item as Record<string, unknown>).path === "string" &&
                  typeof (item as Record<string, unknown>).proposed_value === "string"
              )
          )
        : [];
      const result = await publishLearningInsightTaskB(
        user,
        courseKey,
        edits,
        manualEdits,
        mode,
        { allowAcceptancePublish: acceptancePublish }
      );
      revalidatePath(`/courses/${result.courseSlug}/lessons/${result.lessonSlug}`);
      revalidatePath("/learning-path");
      return NextResponse.json({ ok: true, result });
    }
    if (action === "APPLY") {
      const acceptedPatchIds = Array.isArray(body?.acceptedPatchIds)
        ? body.acceptedPatchIds.filter((item: unknown): item is string => typeof item === "string")
        : [];
      return NextResponse.json({
        ok: true,
        result: await applyLearningInsightTaskB(user, courseKey, acceptedPatchIds)
      });
    }
    return NextResponse.json({ error: "TASK_B_INVALID_ACTION" }, { status: 400 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "TASK_B_FAILED";
    const status = statusFor(code);
    if (status >= 500) console.error("[OPC AI] task B failed", error);
    return NextResponse.json({ error: code }, { status });
  }
}
