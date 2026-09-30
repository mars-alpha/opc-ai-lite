import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../lib/server/admin/api";
import { publishContentItem } from "../../../../../../../lib/server/content/workbench";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await requireAdminRequest(request);
    const { itemId } = await params;
    const result = await publishContentItem(user, itemId);
    revalidateTag("opc-published-content");
    return NextResponse.json(result);
  } catch (error) {
    return contentWorkbenchError(error, "CONTENT_PUBLISH_FAILED") ??
      NextResponse.json({ error: "CONTENT_PUBLISH_FAILED" }, { status: 500 });
  }
}
