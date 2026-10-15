import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../../../lib/server/admin/api";
import {
  getCurrentTopicDiagnosis,
  runTopicDiagnosis
} from "../../../../../../../../lib/server/content/topic-diagnosis";
import { presentTopicDiagnosisArtifact } from "../../../../../../../../lib/server/content/topic-diagnosis-presentation";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdminRequest(request);
    const { eventId } = await params;
    return NextResponse.json({
      item: presentTopicDiagnosisArtifact(await getCurrentTopicDiagnosis(eventId))
    });
  } catch (error) {
    return contentWorkbenchError(error, "TOPIC_DIAGNOSIS_READ_FAILED") ??
      NextResponse.json({ error: "TOPIC_DIAGNOSIS_READ_FAILED" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await requireAdminRequest(request);
    const { eventId } = await params;
    return NextResponse.json({
      item: presentTopicDiagnosisArtifact(await runTopicDiagnosis(user, eventId))
    }, { status: 201 });
  } catch (error) {
    return contentWorkbenchError(error, "TOPIC_DIAGNOSIS_FAILED") ??
      NextResponse.json({ error: "TOPIC_DIAGNOSIS_FAILED" }, { status: 500 });
  }
}
