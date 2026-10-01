import { after, NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../../lib/server/admin/api";
import { ensureContentDraftForEvent } from "../../../../../../../../lib/server/content/adoption";
import { enrichContentBriefAfterAdoption } from "../../../../../../../../lib/server/content/content-brief-enrichment";
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
    const decision = body && typeof body === "object" && typeof (body as Record<string, unknown>).decision === "string"
      ? String((body as Record<string, unknown>).decision)
      : "";
    const content = decision === "ADOPT" ? await ensureContentDraftForEvent(user, eventId) : null;
    if (content) {
      after(async () => {
        try {
          await enrichContentBriefAfterAdoption(user, eventId, content.id);
        } catch (error) {
          console.error("[OPC AI] content brief enrichment failed", error);
        }
      });
    }
    return NextResponse.json({ item, contentId: content?.id ?? null }, { status: 201 });
  } catch (error) {
    return contentWorkbenchError(error, "CANDIDATE_DECISION_FAILED") ??
      NextResponse.json({ error: "CANDIDATE_DECISION_FAILED" }, { status: 500 });
  }
}
