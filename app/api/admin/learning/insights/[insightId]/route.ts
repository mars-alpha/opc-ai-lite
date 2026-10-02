import { NextResponse } from "next/server";
import { requireAdminUser } from "../../../../../../lib/server/admin/service";
import { requireSessionUser } from "../../../../../../lib/server/auth/service";
import { getLearningInsightEvidenceDetail } from "../../../../../../lib/server/learning-insights/evidence-detail";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ insightId: string }> }
) {
  try {
    requireAdminUser(await requireSessionUser(request));
    const { insightId } = await params;
    const detail = await getLearningInsightEvidenceDetail(insightId);
    return NextResponse.json({ detail });
  } catch (error) {
    const code = error instanceof Error ? error.message : "INSIGHT_EVIDENCE_FAILED";
    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ error: code }, { status: 401 });
    }
    if (code === "FORBIDDEN") {
      return NextResponse.json({ error: code }, { status: 403 });
    }
    if (code === "INSIGHT_NOT_FOUND") {
      return NextResponse.json({ error: code }, { status: 404 });
    }
    console.error("[OPC AI] insight evidence failed", error);
    return NextResponse.json({ error: "INSIGHT_EVIDENCE_FAILED" }, { status: 500 });
  }
}
