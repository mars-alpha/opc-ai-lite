import { NextResponse } from "next/server";
import { requireAdminRequest } from "../../../../../../lib/server/admin/api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireAdminRequest(request);
  return NextResponse.json(
    { error: "FRESH_SCAN_DIRECT_API_RETIRED", owner: "SYSTEM_COLLECTION" },
    { status: 410 }
  );
}
