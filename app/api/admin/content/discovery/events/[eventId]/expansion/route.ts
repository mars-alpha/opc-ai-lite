import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../../lib/server/admin/api";
import {
  listEventExpansionEvidence,
  listEventExpansionRuns,
  refreshSourceManagedEventExpansion
} from "../../../../../../../../lib/server/content/collection-expansion";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdminRequest(request);
    const { eventId } = await params;
    const [runs, evidence] = await Promise.all([
      listEventExpansionRuns(eventId),
      listEventExpansionEvidence(eventId)
    ]);
    return NextResponse.json({
      mode: "SOURCE_MANAGEMENT_SYSTEM_COLLECTION_ONLY",
      authority: "REFERENCE_ONLY",
      runs,
      evidence
    });
  } catch (error) {
    return contentWorkbenchError(error, "EVENT_EXPANSION_FAILED") ??
      NextResponse.json({ error: "EVENT_EXPANSION_FAILED" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdminRequest(request);
    const { eventId } = await params;
    await request.json().catch(() => ({}));
    return NextResponse.json(await refreshSourceManagedEventExpansion(eventId, 168));
  } catch (error) {
    return contentWorkbenchError(error, "EVENT_EXPANSION_RUN_FAILED") ??
      NextResponse.json({ error: "EVENT_EXPANSION_RUN_FAILED" }, { status: 500 });
  }
}
