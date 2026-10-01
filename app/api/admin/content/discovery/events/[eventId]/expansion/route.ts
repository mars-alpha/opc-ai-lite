import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../../lib/server/admin/api";
import {
  listEventExpansionRuns,
  runEventExpansion
} from "../../../../../../../../lib/server/content/collection-expansion";
import { getExpansionPlan } from "../../../../../../../../lib/server/content/discovery";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdminRequest(request);
    const { eventId } = await params;
    const [plan, runs] = await Promise.all([
      getExpansionPlan(eventId),
      listEventExpansionRuns(eventId)
    ]);
    return NextResponse.json({ ...plan, runs });
  } catch (error) {
    return contentWorkbenchError(error, "EVENT_EXPANSION_FAILED") ??
      NextResponse.json({ error: "EVENT_EXPANSION_FAILED" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await requireAdminRequest(request);
    const { eventId } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await runEventExpansion(user, eventId, body));
  } catch (error) {
    return contentWorkbenchError(error, "EVENT_EXPANSION_RUN_FAILED") ??
      NextResponse.json({ error: "EVENT_EXPANSION_RUN_FAILED" }, { status: 500 });
  }
}
