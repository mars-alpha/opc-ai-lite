import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../lib/server/admin/api";
import { listRawItems } from "../../../../../../lib/server/content/discovery";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "100");
    return NextResponse.json({ items: await listRawItems(Number.isFinite(limit) ? limit : 100) });
  } catch (error) {
    return contentWorkbenchError(error, "RAW_ITEM_LIST_FAILED") ??
      NextResponse.json({ error: "RAW_ITEM_LIST_FAILED" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await requireAdminRequest(request);
  return NextResponse.json(
    { error: "RAW_ITEM_DIRECT_INGEST_RETIRED", owner: "SYSTEM_COLLECTION" },
    { status: 410 }
  );
}
