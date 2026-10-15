import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../../lib/server/admin/api";
import {
  listDemandSignals,
  runCommentDemandMining,
  type CommentDemandTriggerInput
} from "../../../../../../../../lib/server/content/comment-insight";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdminRequest(request);
    const { eventId } = await params;
    return NextResponse.json({ items: await listDemandSignals(eventId) });
  } catch (error) {
    return contentWorkbenchError(error, "COMMENT_INSIGHT_READ_FAILED") ??
      NextResponse.json({ error: "COMMENT_INSIGHT_READ_FAILED" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await requireAdminRequest(request);
    const { eventId } = await params;
    const body = await request.json().catch(() => ({})) as { trigger?: unknown };
    const trigger: CommentDemandTriggerInput = body.trigger === "ADMIN_EXPLICIT" ? "ADMIN_EXPLICIT" : "AUTO";
    return NextResponse.json({ items: await runCommentDemandMining(user, eventId, trigger), trigger }, { status: 201 });
  } catch (error) {
    return contentWorkbenchError(error, "COMMENT_INSIGHT_FAILED") ??
      NextResponse.json({ error: error instanceof Error ? error.message : "COMMENT_INSIGHT_FAILED" }, { status: 400 });
  }
}
