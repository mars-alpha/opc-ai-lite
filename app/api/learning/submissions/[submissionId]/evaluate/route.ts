import { NextResponse } from "next/server";
import { requireSessionUser } from "../../../../../../lib/server/auth/service";
import { evaluatePracticeSubmission } from "../../../../../../lib/server/interactive/service";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const user = await requireSessionUser(request);
    const { submissionId } = await params;
    return NextResponse.json(
      await evaluatePracticeSubmission(user.id, submissionId)
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "PRACTICE_EVALUATE_FAILED";
    if (code === "UNAUTHENTICATED") return NextResponse.json({ error: code }, { status: 401 });
    if (code === "SUBMISSION_NOT_FOUND") return NextResponse.json({ error: code }, { status: 404 });
    console.error("[OPC AI] practice evaluate failed", error);
    return NextResponse.json({ error: "PRACTICE_EVALUATE_FAILED" }, { status: 500 });
  }
}

