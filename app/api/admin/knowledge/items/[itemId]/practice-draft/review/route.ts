import { NextResponse } from "next/server";

import { requireAdminUser } from "../../../../../../../../lib/server/admin/service";
import { requireSessionUser } from "../../../../../../../../lib/server/auth/service";
import { reviewPracticeDraft } from "../../../../../../../../lib/server/practices/drafts";

export const dynamic = "force-dynamic";

const statuses = ["APPROVED", "NEEDS_REVISION", "DISMISSED"] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = requireAdminUser(await requireSessionUser(request));
    const { itemId } = await params;
    const body = await request.json().catch(() => null);
    const status = typeof body?.status === "string" ? body.status : "";
    if (!statuses.includes(status as (typeof statuses)[number])) {
      return NextResponse.json({ error: "INVALID_REVIEW_STATUS" }, { status: 400 });
    }

    const item = await reviewPracticeDraft(itemId, {
      status: status as (typeof statuses)[number],
      reviewedBy: user.email,
      reviewNote: typeof body?.reviewNote === "string" ? body.reviewNote : null
    });
    return NextResponse.json({ item });
  } catch (error) {
    const code = error instanceof Error ? error.message : "PRACTICE_DRAFT_REVIEW_FAILED";
    if (code === "UNAUTHENTICATED") return NextResponse.json({ error: code }, { status: 401 });
    if (code === "FORBIDDEN") return NextResponse.json({ error: code }, { status: 403 });
    if (code === "KNOWLEDGE_NOT_FOUND" || code === "PRACTICE_DRAFT_NOT_FOUND") {
      return NextResponse.json({ error: code }, { status: 404 });
    }
    if (code === "LATEST_PRACTICE_EXISTS" || code === "PRACTICE_DRAFT_FINAL") {
      return NextResponse.json({ error: code }, { status: 409 });
    }
    if (code.startsWith("INVALID_") || code === "UNSUPPORTED_SUBMISSION_SCHEMA") {
      return NextResponse.json({ error: code }, { status: 400 });
    }
    console.error("[OPC AI] practice draft review failed", error);
    return NextResponse.json({ error: "PRACTICE_DRAFT_REVIEW_FAILED" }, { status: 500 });
  }
}
