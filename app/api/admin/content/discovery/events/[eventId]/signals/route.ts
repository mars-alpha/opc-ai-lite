import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../../lib/server/admin/api";
import { calculateEventClusterSignals } from "../../../../../../../../lib/server/content/event-signal";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdminRequest(request);
    const { eventId } = await params;
    return NextResponse.json({ item: await calculateEventClusterSignals(eventId) });
  } catch (error) {
    return contentWorkbenchError(error, "EVENT_SIGNAL_FAILED") ??
      NextResponse.json({ error: "EVENT_SIGNAL_FAILED" }, { status: 500 });
  }
}
