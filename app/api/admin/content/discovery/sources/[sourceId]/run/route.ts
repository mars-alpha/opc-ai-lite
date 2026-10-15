import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../../lib/server/admin/api";
import { runSourceCollection } from "../../../../../../../../lib/server/content/collection-runner";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  try {
    const user = await requireAdminRequest(request);
    const { sourceId } = await params;
    await request.json().catch(() => ({}));
    return NextResponse.json({ run: await runSourceCollection(user, sourceId) });
  } catch (error) {
    return contentWorkbenchError(error, "COLLECTION_RUN_FAILED") ??
      NextResponse.json({ error: "COLLECTION_RUN_FAILED" }, { status: 500 });
  }
}
