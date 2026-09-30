import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../lib/server/admin/api";
import { linkEvidenceToContent, listEvidenceForContent } from "../../../../../../../lib/server/content/workbench";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await requireAdminRequest(request);
    const { itemId } = await params;
    return NextResponse.json({ items: await listEvidenceForContent(itemId) });
  } catch (error) {
    return contentWorkbenchError(error, "CONTENT_EVIDENCE_LIST_FAILED") ??
      NextResponse.json({ error: "CONTENT_EVIDENCE_LIST_FAILED" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await requireAdminRequest(request);
    const { itemId } = await params;
    const body = await request.json().catch(() => ({}));
    const evidenceId = typeof body?.evidenceId === "string" ? body.evidenceId : "";
    const role = typeof body?.role === "string" ? body.role : "SUPPORTING";
    return NextResponse.json(await linkEvidenceToContent(user, itemId, evidenceId, role));
  } catch (error) {
    return contentWorkbenchError(error, "CONTENT_EVIDENCE_LINK_FAILED") ??
      NextResponse.json({ error: "CONTENT_EVIDENCE_LINK_FAILED" }, { status: 500 });
  }
}
