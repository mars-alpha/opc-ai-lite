import { NextResponse } from "next/server";
import { adminAuthError, requireAdminRequest } from "../../../../../../../../lib/server/admin/api";
import { recordCollectionQualityFeedback } from "../../../../../../../../lib/server/content/collection-quality-feedback";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const user = await requireAdminRequest(request);
    const { eventId } = await params;
    const result = await recordCollectionQualityFeedback(user, eventId, await request.json().catch(() => null));
    return NextResponse.json(result, { status: result.changed ? 201 : 200 });
  } catch (error) {
    const auth = adminAuthError(error);
    if (auth) return auth;
    const code = error instanceof Error && error.message.startsWith("QUALITY_") ? error.message : "QUALITY_FEEDBACK_FAILED";
    const status = code === "QUALITY_EVENT_NOT_FOUND" ? 404 : code === "QUALITY_REQUEST_CONFLICT" ? 409 : code === "QUALITY_FEEDBACK_FAILED" ? 500 : 400;
    return NextResponse.json({ error: code }, { status });
  }
}
