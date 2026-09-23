import { NextResponse } from "next/server";
import { requireSessionUser } from "../../../../lib/server/auth/service";
import {
  HELP_ISSUE_TYPES,
  submitLearningFeedback
} from "../../../../lib/server/learning-insights/service";
import { createRuntimeTiming } from "../../../../lib/server/runtime-performance";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser(request);
    const timing = createRuntimeTiming("learning_feedback");
    const body = await request.json().catch(() => null);
    const issueType = typeof body?.issueType === "string" ? body.issueType : "";

    if (
      issueType !== "LESSON_HELPFULNESS" &&
      !HELP_ISSUE_TYPES.includes(issueType as (typeof HELP_ISSUE_TYPES)[number])
    ) {
      return NextResponse.json({ error: "INVALID_FEEDBACK" }, { status: 400 });
    }

    const result = await submitLearningFeedback(user.id, {
      courseSlug: typeof body?.courseSlug === "string" ? body.courseSlug : "",
      lessonSlug: typeof body?.lessonSlug === "string" ? body.lessonSlug : "",
      issueType: issueType as
        | (typeof HELP_ISSUE_TYPES)[number]
        | "LESSON_HELPFULNESS",
      comment: typeof body?.comment === "string" ? body.comment : "",
      helpfulness:
        body?.helpfulness === "HELPFUL" || body?.helpfulness === "NOT_HELPFUL"
          ? body.helpfulness
          : undefined,
      reasons: Array.isArray(body?.reasons)
        ? body.reasons.filter((value: unknown): value is string => typeof value === "string")
        : [],
      resolutionStatus: body?.resolutionStatus === "RESOLVED" ? "RESOLVED" : "UNRESOLVED",
      relatedLessonId:
        typeof body?.relatedLessonId === "string" ? body.relatedLessonId : null
    });

    timing.finish({ issue_type: issueType, stored: result.stored });
    return NextResponse.json(result, { status: result.stored ? 201 : 200 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "FEEDBACK_FAILED";
    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ error: code }, { status: 401 });
    }
    if (code === "INVALID_FEEDBACK") {
      return NextResponse.json({ error: code }, { status: 400 });
    }
    if (code === "LESSON_NOT_FOUND") {
      return NextResponse.json({ error: code }, { status: 404 });
    }
    console.error("[OPC AI] learning feedback failed", error);
    return NextResponse.json({ error: "FEEDBACK_FAILED" }, { status: 500 });
  }
}
