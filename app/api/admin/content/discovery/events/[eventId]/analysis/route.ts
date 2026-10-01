import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../../lib/server/admin/api";
import {
  getCurrentEventAiAnalysis,
  runEventAiAnalysis
} from "../../../../../../../../lib/server/content/event-ai-analysis";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdminRequest(request);
    const { eventId } = await params;
    return NextResponse.json({ item: await getCurrentEventAiAnalysis(eventId) });
  } catch (error) {
    return contentWorkbenchError(error, "EVENT_AI_ANALYSIS_READ_FAILED") ??
      NextResponse.json({ error: "EVENT_AI_ANALYSIS_READ_FAILED" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdminRequest(request);
    const { eventId } = await params;
    return NextResponse.json(await runEventAiAnalysis(eventId), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "AI_ANALYSIS_NOT_CONFIGURED") {
      return NextResponse.json({ error: "AI_ANALYSIS_NOT_CONFIGURED" }, { status: 503 });
    }
    return contentWorkbenchError(error, "EVENT_AI_ANALYSIS_FAILED") ??
      NextResponse.json({ error: "EVENT_AI_ANALYSIS_FAILED" }, { status: 500 });
  }
}
