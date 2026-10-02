import { NextResponse } from "next/server";
import { requireAdminUser } from "../../../../../../../lib/server/admin/service";
import { requireSessionUser } from "../../../../../../../lib/server/auth/service";
import {
  decideLearningCourseGate1,
  type LearningIssueGate1Decision
} from "../../../../../../../lib/server/learning-insights/service";

export const dynamic = "force-dynamic";

const decisions: LearningIssueGate1Decision[] = ["ANALYZE", "WATCH", "DISMISS"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseKey: string }> }
) {
  try {
    const user = requireAdminUser(await requireSessionUser(request));
    const { courseKey } = await params;
    const body = await request.json().catch(() => null);
    const decision = body?.decision as LearningIssueGate1Decision | undefined;

    if (!decision || !decisions.includes(decision)) {
      return NextResponse.json({ error: "INVALID_GATE1_DECISION" }, { status: 400 });
    }

    const result = await decideLearningCourseGate1({
      courseKey,
      decision,
      decidedBy: user.email
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const code = error instanceof Error ? error.message : "LEARNING_COURSE_GATE1_FAILED";
    if (code === "UNAUTHENTICATED") return NextResponse.json({ error: code }, { status: 401 });
    if (code === "FORBIDDEN") return NextResponse.json({ error: code }, { status: 403 });
    if (code === "LEARNING_COURSE_ISSUES_NOT_FOUND") {
      return NextResponse.json({ error: code }, { status: 404 });
    }
    if (code === "SIMULATION_ACTION_DISABLED") {
      return NextResponse.json({ error: code }, { status: 409 });
    }
    console.error("[OPC AI] learning course gate1 failed", error);
    return NextResponse.json({ error: "LEARNING_COURSE_GATE1_FAILED" }, { status: 500 });
  }
}
