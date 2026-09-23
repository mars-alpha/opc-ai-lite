import { NextResponse } from "next/server";
import { requireSessionUser } from "../../../../../lib/server/auth/service";
import { resetLessonChecksForRelearn } from "../../../../../lib/server/interactive/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser(request);
    const body = await request.json().catch(() => null);
    const courseSlug = body?.courseSlug;
    const lessonSlug = body?.lessonSlug;

    if (
      typeof courseSlug !== "string" ||
      typeof lessonSlug !== "string" ||
      (body?.currentStep !== undefined &&
        (!Number.isInteger(body.currentStep) || body.currentStep < 1 || body.currentStep > 6))
    ) {
      return NextResponse.json({ error: "INVALID_RELEARN_REQUEST" }, { status: 400 });
    }

    return NextResponse.json(
      await resetLessonChecksForRelearn(
        user.id,
        courseSlug,
        lessonSlug,
        typeof body?.currentStep === "number" ? body.currentStep : undefined
      )
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "CHECK_RELEARN_RESET_FAILED";
    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ error: code }, { status: 401 });
    }
    if (code === "LESSON_NOT_FOUND" || code === "CHECK_NOT_FOUND") {
      return NextResponse.json({ error: code }, { status: 404 });
    }
    if (code === "LESSON_LOCKED" || code === "STAGE_PREREQUISITE_REQUIRED") {
      return NextResponse.json({ error: code }, { status: 403 });
    }
    console.error("[OPC AI] check relearn reset failed", error);
    return NextResponse.json({ error: "CHECK_RELEARN_RESET_FAILED" }, { status: 500 });
  }
}
