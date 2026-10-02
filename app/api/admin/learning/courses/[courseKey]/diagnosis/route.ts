import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdminUser } from "../../../../../../../lib/server/admin/service";
import { requireSessionUser } from "../../../../../../../lib/server/auth/service";
import { getDatabase } from "../../../../../../../lib/server/db";
import { courseInsights } from "../../../../../../../lib/server/db/schema";
import {
  getCurrentLearningInsightTaskA,
  runLearningInsightTaskA
} from "../../../../../../../lib/server/learning-insights/task-a";

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

function statusFor(code: string) {
  if (code === "UNAUTHENTICATED") return 401;
  if (code === "FORBIDDEN") return 403;
  if (code === "TASK_A_FORMAL_COURSE_NOT_FOUND" || code === "TASK_A_ISSUES_NOT_FOUND") return 404;
  if (code === "TASK_A_GATE1_NOT_AUTHORIZED" || code === "SIMULATION_ACTION_DISABLED") return 409;
  if (code === "AI_ANALYSIS_NOT_CONFIGURED") return 503;
  if (code === "AI_ANALYSIS_PROVIDER_FAILED" || code === "AI_ANALYSIS_EMPTY") return 502;
  if (
    code.startsWith("TASK_A_") ||
    code === "UNKNOWN_EVIDENCE_REF" ||
    code === "UNKNOWN_COURSE_ID" ||
    code === "DUPLICATE_COURSE_ID" ||
    code === "TARGET_COURSE_NOT_DECLARED" ||
    code === "INVALID_STEP_NUMBER" ||
    code === "DECISION_CONTRADICTION"
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
    const diagnosis = await getCurrentLearningInsightTaskA(courseKey, mode);
    return NextResponse.json({ diagnosis });
  } catch (error) {
    const code = error instanceof Error ? error.message : "LEARNING_INSIGHT_TASK_A_READ_FAILED";
    const status = statusFor(code);
    if (status >= 500) console.error("[OPC AI] task A read failed", error);
    return NextResponse.json({ error: code }, { status });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseKey: string }> }
) {
  try {
    requireAdminUser(await requireSessionUser(request));
    const { courseKey } = await params;
    const mode = await reviewMode(request, courseKey);
    const result = await runLearningInsightTaskA(courseKey, { evidenceMode: mode });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const code = error instanceof Error ? error.message : "LEARNING_INSIGHT_TASK_A_FAILED";
    const status = statusFor(code);
    if (status >= 500) console.error("[OPC AI] task A failed", error);
    return NextResponse.json({ error: code }, { status });
  }
}
