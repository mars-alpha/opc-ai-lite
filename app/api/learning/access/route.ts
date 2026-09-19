import { NextResponse } from "next/server";
import {
  getSessionUser,
  readSessionToken
} from "../../../../lib/server/auth/service";
import { getLessonAccess } from "../../../../lib/server/entitlements/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const courseSlug = url.searchParams.get("courseSlug");
  const lessonSlug = url.searchParams.get("lessonSlug");

  if (!courseSlug || !lessonSlug) {
    return NextResponse.json(
      { error: "INVALID_ACCESS_INPUT" },
      { status: 400 }
    );
  }

  const user = await getSessionUser(readSessionToken(request));
  return NextResponse.json(
    await getLessonAccess(user?.id ?? null, courseSlug, lessonSlug)
  );
}

