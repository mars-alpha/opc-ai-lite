import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../../lib/server/admin/api";
import { getEventExpansionDailyOutput } from "../../../../../../../../lib/server/content/event-expansion-output";
import { runEventExpansionOutputSynthesis } from "../../../../../../../../lib/server/content/event-expansion-output-synthesis";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdminRequest(request);
    const { eventId } = await params;
    return NextResponse.json({ output: await getEventExpansionDailyOutput(eventId) });
  } catch (error) {
    return contentWorkbenchError(error, "EVENT_EXPANSION_OUTPUT_REVIEW_LOAD_FAILED") ??
      NextResponse.json({ error: "EVENT_EXPANSION_OUTPUT_REVIEW_LOAD_FAILED" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdminRequest(request);
    const { eventId } = await params;
    const body = await request.json().catch(() => ({}));
    if (body?.action !== "SYNTHESIZE") {
      return NextResponse.json({ error: "EVENT_EXPANSION_OUTPUT_REVIEW_ACTION_INVALID" }, { status: 400 });
    }
    const output = await getEventExpansionDailyOutput(eventId);
    const result = await runEventExpansionOutputSynthesis(output);
    return NextResponse.json({
      output,
      synthesis: result.output,
      aiRunId: result.aiRunId,
      model: result.config.model,
      provider: result.config.provider
    });
  } catch (error) {
    return contentWorkbenchError(error, "EVENT_EXPANSION_OUTPUT_REVIEW_SYNTHESIS_FAILED") ??
      NextResponse.json({ error: "EVENT_EXPANSION_OUTPUT_REVIEW_SYNTHESIS_FAILED" }, { status: 500 });
  }
}
