import { NextResponse } from "next/server";

import { requireAdminUser } from "../../../../../../../lib/server/admin/service";
import { requireSessionUser } from "../../../../../../../lib/server/auth/service";
import { analyzeKnowledgeCourseImpact } from "../../../../../../../lib/server/course-candidates/impact";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "COURSE_IMPACT_ANALYSIS_FAILED";
  if (code === "UNAUTHENTICATED") return NextResponse.json({ error: code }, { status: 401 });
  if (code === "FORBIDDEN") return NextResponse.json({ error: code }, { status: 403 });
  if (code === "KNOWLEDGE_NOT_FOUND") return NextResponse.json({ error: code }, { status: 404 });
  if (
    code === "KNOWLEDGE_NOT_PUBLISHED" ||
    code === "KNOWLEDGE_NOT_ACTIVE" ||
    code === "NO_PUBLISHED_LESSONS"
  ) {
    return NextResponse.json({ error: code }, { status: 409 });
  }
  console.error("[OPC AI] course impact analysis failed", error);
  return NextResponse.json({ error: "COURSE_IMPACT_ANALYSIS_FAILED" }, { status: 500 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    requireAdminUser(await requireSessionUser(request));
    const { itemId } = await params;
    return NextResponse.json(await analyzeKnowledgeCourseImpact(itemId));
  } catch (error) {
    return errorResponse(error);
  }
}
