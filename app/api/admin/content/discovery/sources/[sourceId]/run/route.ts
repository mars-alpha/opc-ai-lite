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
    const body = await request.json().catch(() => ({}));
    const input = body && typeof body === "object" ? (body as { manualUrl?: string }) : {};
    return NextResponse.json({ run: await runSourceCollection(user, sourceId, input) });
  } catch (error) {
    return contentWorkbenchError(error, "COLLECTION_RUN_FAILED") ??
      NextResponse.json({ error: "COLLECTION_RUN_FAILED" }, { status: 500 });
  }
}
