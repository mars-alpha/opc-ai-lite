import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../lib/server/admin/api";
import { verifyEvidence } from "../../../../../../../lib/server/content/workbench";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ evidenceId: string }> }
) {
  try {
    const user = await requireAdminRequest(request);
    const { evidenceId } = await params;
    const body = await request.json().catch(() => null);
    return NextResponse.json({ item: await verifyEvidence(user, evidenceId, body) });
  } catch (error) {
    return contentWorkbenchError(error, "EVIDENCE_VERIFY_FAILED") ??
      NextResponse.json({ error: "EVIDENCE_VERIFY_FAILED" }, { status: 500 });
  }
}
