import { NextResponse } from "next/server";
import { requireSessionUser } from "../../../../../../lib/server/auth/service";
import { getLatestPracticeSubmission } from "../../../../../../lib/server/practices/service";
import { submitPractice } from "../../../../../../lib/server/interactive/service";

export const dynamic = "force-dynamic";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const user = await requireSessionUser(request);
    const { practiceId } = await params;
    const latest = await getLatestPracticeSubmission(user.id, practiceId);
    return NextResponse.json({ practiceId, latest });
  } catch (error) {
    const code = error instanceof Error ? error.message : "PRACTICE_SUBMISSION_READ_FAILED";
    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ error: code }, { status: 401 });
    }
    console.error("[OPC AI] practice submission read failed", error);
    return NextResponse.json({ error: "PRACTICE_SUBMISSION_READ_FAILED" }, { status: 500 });
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const user = await requireSessionUser(request);
    const { practiceId } = await params;
    const body = await request.json().catch(() => null);
    const result = await submitPractice(user.id, practiceId, body?.content);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "PRACTICE_SUBMIT_FAILED";
    if (code === "UNAUTHENTICATED") return NextResponse.json({ error: code }, { status: 401 });
    if (code === "INVALID_PRACTICE_CONTENT") {
      return NextResponse.json({ error: code }, { status: 400 });
    }
    if (
      code === "INVALID_SUBMISSION_SCHEMA" ||
      code === "UNSUPPORTED_SUBMISSION_SCHEMA"
    ) {
      return NextResponse.json({ error: code }, { status: 409 });
    }
    if (
      code === "LESSON_LOCKED" ||
      code === "STAGE_PREREQUISITE_REQUIRED" ||
      code === "MEMBERSHIP_REQUIRED"
    ) {
      return NextResponse.json({ error: code }, { status: 403 });
    }
    if (
      code === "PRACTICE_OWNERSHIP_INVALID" ||
      code === "PRACTICE_SOURCE_NOT_PUBLISHED"
    ) {
      return NextResponse.json({ error: code }, { status: 409 });
    }
    if (code === "PRACTICE_NOT_FOUND") return NextResponse.json({ error: code }, { status: 404 });
    console.error("[OPC AI] practice submit failed", error);
    return NextResponse.json({ error: "PRACTICE_SUBMIT_FAILED" }, { status: 500 });
  }
}




