import { NextResponse } from "next/server";
import { requireSessionUser } from "../../../../lib/server/auth/service";
import { recordUserRealAiEvidence } from "../../../../lib/server/lesson-runtime/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser(request);
    const body = await request.json().catch(() => null);
    if (
      typeof body?.courseSlug !== "string" ||
      typeof body?.lessonSlug !== "string" ||
      typeof body?.evidenceKind !== "string"
    ) {
      return NextResponse.json({ error: "INVALID_REAL_AI_EVIDENCE_INPUT" }, { status: 400 });
    }

    const result = await recordUserRealAiEvidence(user.id, {
      courseSlug: body.courseSlug,
      lessonSlug: body.lessonSlug,
      evidenceKind: body.evidenceKind,
      confirmed: body.confirmed,
      artifactRef: body.artifactRef
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "REAL_AI_EVIDENCE_FAILED";
    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ error: code }, { status: 401 });
    }
    if (code === "LESSON_NOT_FOUND") {
      return NextResponse.json({ error: code }, { status: 404 });
    }
    if (code === "LESSON_LOCKED") {
      return NextResponse.json(
        { error: "OFFICIAL_ACCOUNT_FOLLOW_REQUIRED" },
        { status: 403 }
      );
    }
    if (code === "STAGE_PREREQUISITE_REQUIRED") {
      return NextResponse.json({ error: code }, { status: 403 });
    }
    if (
      code === "REAL_AI_EVIDENCE_NOT_REQUIRED" ||
      code === "REAL_AI_EVIDENCE_KIND_MISMATCH" ||
      code === "SYSTEM_RESULT_REQUIRES_TRUSTED_SOURCE" ||
      code === "ARTIFACT_EVIDENCE_REQUIRES_RESOLVER"
    ) {
      return NextResponse.json({ error: code }, { status: 409 });
    }
    if (
      code === "REAL_AI_CONFIRMATION_REQUIRED"
    ) {
      return NextResponse.json({ error: code }, { status: 400 });
    }
    console.error("[OPC AI] real AI evidence write failed", error);
    return NextResponse.json({ error: "REAL_AI_EVIDENCE_FAILED" }, { status: 500 });
  }
}
