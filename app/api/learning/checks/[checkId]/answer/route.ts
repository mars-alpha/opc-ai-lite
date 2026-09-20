import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../../../../../../lib/server/auth/service";
import {
  answerLessonCheck,
  previewLessonCheck
} from "../../../../../../lib/server/interactive/service";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ checkId: string }> }
) {
  try {
    const user = await getSessionUser(readSessionToken(request));
    const { checkId } = await params;
    const body = await request.json().catch(() => null);
    const preview = body?.preview === true;
    const submittedAnswer = body?.answers ?? body?.answer;
    return NextResponse.json(
      user && !preview
        ? await answerLessonCheck(user.id, checkId, submittedAnswer)
        : await previewLessonCheck(checkId, submittedAnswer)
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "CHECK_ANSWER_FAILED";
    if (code === "UNAUTHENTICATED") return NextResponse.json({ error: code }, { status: 401 });
    if (code === "INVALID_CHECK_ANSWER") return NextResponse.json({ error: code }, { status: 400 });
    if (code === "CHECK_NOT_FOUND") return NextResponse.json({ error: code }, { status: 404 });
    if (code === "LESSON_LOCKED") {
      return NextResponse.json(
        { error: "OFFICIAL_ACCOUNT_FOLLOW_REQUIRED" },
        { status: 403 }
      );
    }
    if (code === "STAGE_PREREQUISITE_REQUIRED") {
      return NextResponse.json({ error: code }, { status: 403 });
    }
    console.error("[OPC AI] lesson check answer failed", error);
    return NextResponse.json({ error: "CHECK_ANSWER_FAILED" }, { status: 500 });
  }
}
