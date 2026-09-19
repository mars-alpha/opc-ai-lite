import { NextResponse } from "next/server";
import { requireSessionUser } from "../../../../../../lib/server/auth/service";
import { answerLessonCheck } from "../../../../../../lib/server/interactive/service";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ checkId: string }> }
) {
  try {
    const user = await requireSessionUser(request);
    const { checkId } = await params;
    const body = await request.json().catch(() => null);
    return NextResponse.json(
      await answerLessonCheck(user.id, checkId, body?.answer)
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "CHECK_ANSWER_FAILED";
    if (code === "UNAUTHENTICATED") return NextResponse.json({ error: code }, { status: 401 });
    if (code === "INVALID_CHECK_ANSWER") return NextResponse.json({ error: code }, { status: 400 });
    if (code === "CHECK_NOT_FOUND") return NextResponse.json({ error: code }, { status: 404 });
    console.error("[OPC AI] lesson check answer failed", error);
    return NextResponse.json({ error: "CHECK_ANSWER_FAILED" }, { status: 500 });
  }
}

