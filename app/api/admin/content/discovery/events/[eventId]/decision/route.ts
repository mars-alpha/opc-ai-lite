import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../../lib/server/admin/api";
import {
  recordCandidateDecision
} from "../../../../../../../../lib/server/content/discovery";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await requireAdminRequest(request);
    const { eventId } = await params;
    const body = await request.json().catch(() => null);
    const input = body && typeof body === "object" ? { ...(body as Record<string, unknown>), eventId } : { eventId };
    const item = await recordCandidateDecision(user, input);
    return NextResponse.json({ item, contentId: null, downstreamStatus: "CONTENT_WORKBENCH_DEFERRED" }, { status: 201 });
  } catch (error) {
    return contentWorkbenchError(error, "CANDIDATE_DECISION_FAILED") ??
      NextResponse.json({ error: "CANDIDATE_DECISION_FAILED" }, { status: 500 });
  }
}
