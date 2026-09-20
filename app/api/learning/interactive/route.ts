import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../../../../lib/server/auth/service";
import { getInteractiveLesson } from "../../../../lib/server/interactive/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const courseSlug = url.searchParams.get("courseSlug");
  const lessonSlug = url.searchParams.get("lessonSlug");
  if (!courseSlug || !lessonSlug) {
    return NextResponse.json({ error: "INVALID_INTERACTIVE_INPUT" }, { status: 400 });
  }

  try {
    const user = await getSessionUser(readSessionToken(request));
    return NextResponse.json(
      await getInteractiveLesson(user?.id ?? null, courseSlug, lessonSlug)
    );
  } catch (error) {
    if (error instanceof Error && error.message === "LESSON_NOT_FOUND") {
      return NextResponse.json({ error: "LESSON_NOT_FOUND" }, { status: 404 });
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
        { status: 403 }
      );
    }
    console.error("[OPC AI] interactive lesson read failed", error);
    return NextResponse.json({ error: "INTERACTIVE_READ_FAILED" }, { status: 500 });
  }
}

