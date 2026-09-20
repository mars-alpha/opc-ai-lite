import { NextResponse } from "next/server";
import { getDatabaseConfig } from "../../../../lib/server/database-config";
import { requireSessionUser } from "../../../../lib/server/auth/service";
import { setLessonCompletion } from "../../../../lib/server/learning/service";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  if (!getDatabaseConfig().configured) {
    return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  if (
    typeof body?.courseSlug !== "string" ||
    typeof body?.lessonSlug !== "string" ||
    typeof body?.completed !== "boolean"
  ) {
    return NextResponse.json({ error: "INVALID_PROGRESS_INPUT" }, { status: 400 });
  }

  try {
    const user = await requireSessionUser(request);
    await setLessonCompletion(user.id, {
      courseSlug: body.courseSlug,
      lessonSlug: body.lessonSlug,
      completed: body.completed
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "LESSON_LOCKED") {
      return NextResponse.json(
        { error: "OFFICIAL_ACCOUNT_FOLLOW_REQUIRED" },
        { status: 403 }
      );
    }
    if (error instanceof Error && error.message === "STAGE_PREREQUISITE_REQUIRED") {
      return NextResponse.json(
        { error: "STAGE_PREREQUISITE_REQUIRED" },
        { status: 409 }
      );
    }
    if (error instanceof Error && error.message === "LESSON_NOT_FOUND") {
      return NextResponse.json({ error: "LESSON_NOT_FOUND" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "CHECK_REQUIRED") {
      return NextResponse.json({ error: "CHECK_REQUIRED" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "PRACTICE_REQUIRED") {
      return NextResponse.json({ error: "PRACTICE_REQUIRED" }, { status: 409 });
    }
    console.error("[OPC AI] progress update failed", error);
    return NextResponse.json({ error: "PROGRESS_UPDATE_FAILED" }, { status: 500 });
  }
}


