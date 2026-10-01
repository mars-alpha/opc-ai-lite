import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../lib/server/admin/api";
import { runFreshScan } from "../../../../../../lib/server/content/discovery";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = await request.json().catch(() => null);
    return NextResponse.json(await runFreshScan(body));
  } catch (error) {
    return contentWorkbenchError(error, "FRESH_SCAN_FAILED") ??
      NextResponse.json({ error: "FRESH_SCAN_FAILED" }, { status: 500 });
  }
}
