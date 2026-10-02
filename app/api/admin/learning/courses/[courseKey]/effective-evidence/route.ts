import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdminUser } from "../../../../../../../lib/server/admin/service";
import { requireSessionUser } from "../../../../../../../lib/server/auth/service";
import { getDatabase } from "../../../../../../../lib/server/db";
import { courseInsights } from "../../../../../../../lib/server/db/schema";
import { buildEffectiveLearningEvidenceSet } from "../../../../../../../lib/server/learning-insights/effective-evidence";

export const dynamic = "force-dynamic";

async function isSimulationReviewCourse(courseKey: string) {
  const rows = await getDatabase()
    .select({ evidence: courseInsights.evidence })
    .from(courseInsights)
    .where(eq(courseInsights.lessonId, courseKey));

  return rows.some((row) => {
    const evidence =
      row.evidence && typeof row.evidence === "object" && !Array.isArray(row.evidence)
        ? (row.evidence as Record<string, unknown>)
        : null;
    return evidence?.simulation === true;
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseKey: string }> }
) {
  try {
    requireAdminUser(await requireSessionUser(request));
    const { courseKey } = await params;
    const wantsVisualReview =
      new URL(request.url).searchParams.get("review") === "1";
    const visualReview =
      process.env.NODE_ENV !== "production" &&
      wantsVisualReview &&
      (await isSimulationReviewCourse(courseKey));

    const evidence = await buildEffectiveLearningEvidenceSet(courseKey, {
      mode: visualReview ? "ACCEPTANCE" : "PRODUCTION"
    });
    return NextResponse.json({ evidence, visualReview });
  } catch (error) {
    const code = error instanceof Error ? error.message : "EFFECTIVE_EVIDENCE_READ_FAILED";
    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ error: code }, { status: 401 });
    }
    if (code === "FORBIDDEN") {
      return NextResponse.json({ error: code }, { status: 403 });
    }
    console.error("[OPC AI] effective evidence read failed", error);
    return NextResponse.json({ error: code }, { status: 500 });
  }
}
