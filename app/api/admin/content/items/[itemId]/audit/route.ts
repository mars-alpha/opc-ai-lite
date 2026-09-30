import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../lib/server/admin/api";
import { listContentAudit } from "../../../../../../../lib/server/content/workbench";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await requireAdminRequest(request);
    const { itemId } = await params;
    return NextResponse.json({ items: await listContentAudit(itemId) });
  } catch (error) {
    return contentWorkbenchError(error, "CONTENT_AUDIT_LIST_FAILED") ??
      NextResponse.json({ error: "CONTENT_AUDIT_LIST_FAILED" }, { status: 500 });
  }
}
