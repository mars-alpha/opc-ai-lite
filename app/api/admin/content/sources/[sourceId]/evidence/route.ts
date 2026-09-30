import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../lib/server/admin/api";
import { createEvidence, listEvidenceForSource } from "../../../../../../../lib/server/content/workbench";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  try {
    await requireAdminRequest(request);
    const { sourceId } = await params;
    return NextResponse.json({ items: await listEvidenceForSource(sourceId) });
  } catch (error) {
    return contentWorkbenchError(error, "EVIDENCE_LIST_FAILED") ??
      NextResponse.json({ error: "EVIDENCE_LIST_FAILED" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  try {
    const user = await requireAdminRequest(request);
    const { sourceId } = await params;
    const body = await request.json().catch(() => null);
    return NextResponse.json({ item: await createEvidence(user, sourceId, body) }, { status: 201 });
  } catch (error) {
    return contentWorkbenchError(error, "EVIDENCE_CREATE_FAILED") ??
      NextResponse.json({ error: "EVIDENCE_CREATE_FAILED" }, { status: 500 });
  }
}
