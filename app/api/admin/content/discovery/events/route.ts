import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../lib/server/admin/api";
import { listEvents } from "../../../../../../lib/server/content/discovery";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    return NextResponse.json({ items: await listEvents() });
  } catch (error) {
    return contentWorkbenchError(error, "EVENT_LIST_FAILED") ??
      NextResponse.json({ error: "EVENT_LIST_FAILED" }, { status: 500 });
  }
}
