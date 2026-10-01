import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../lib/server/admin/api";
import { listCollectionRuns } from "../../../../../../lib/server/content/discovery";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    return NextResponse.json({ items: await listCollectionRuns() });
  } catch (error) {
    return contentWorkbenchError(error, "COLLECTION_RUN_LIST_FAILED") ??
      NextResponse.json({ error: "COLLECTION_RUN_LIST_FAILED" }, { status: 500 });
  }
}
