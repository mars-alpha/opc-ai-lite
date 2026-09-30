import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../lib/server/admin/api";
import { reviewContentItem } from "../../../../../../../lib/server/content/workbench";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await requireAdminRequest(request);
    const { itemId } = await params;
    const body = await request.json().catch(() => null);
    return NextResponse.json(await reviewContentItem(user, itemId, body));
  } catch (error) {
    return contentWorkbenchError(error, "CONTENT_REVIEW_FAILED") ??
      NextResponse.json({ error: "CONTENT_REVIEW_FAILED" }, { status: 500 });
  }
}
