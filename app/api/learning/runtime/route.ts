import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../../../../lib/server/auth/service";
import { getLessonRuntimeReadModel } from "../../../../lib/server/lesson-runtime/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const courseSlug = url.searchParams.get("courseSlug");
  const lessonSlug = url.searchParams.get("lessonSlug");

  if (!courseSlug || !lessonSlug) {
    return NextResponse.json({ error: "INVALID_RUNTIME_INPUT" }, { status: 400 });
  }

  try {
    const user = await getSessionUser(readSessionToken(request));
    return NextResponse.json(
      await getLessonRuntimeReadModel(user?.id ?? null, courseSlug, lessonSlug)
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "LESSON_RUNTIME_READ_FAILED";
    if (code === "LESSON_NOT_FOUND") {
      return NextResponse.json({ error: code }, { status: 404 });
    }
    if (code === "LESSON_LOCKED") {
      return NextResponse.json(
        { error: "OFFICIAL_ACCOUNT_FOLLOW_REQUIRED" },
        { status: 403 }
      );
    }
    if (code === "STAGE_PREREQUISITE_REQUIRED") {
      return NextResponse.json({ error: code }, { status: 403 });
    }
    console.error("[OPC AI] lesson runtime read failed", error);
    return NextResponse.json({ error: "LESSON_RUNTIME_READ_FAILED" }, { status: 500 });
  }
}
