import { NextResponse } from "next/server";
import { requireAdminUser } from "../../../../../../../lib/server/admin/service";
import { requireSessionUser } from "../../../../../../../lib/server/auth/service";
import {
  approveCourseUpdateCandidateToMaintenance,
  reviewCourseUpdateCandidate
} from "../../../../../../../lib/server/learning-insights/service";

export const dynamic = "force-dynamic";

const statuses = ["APPROVED", "DISMISSED", "NEEDS_REVISION"] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const user = requireAdminUser(await requireSessionUser(request));
    const { candidateId } = await params;
    const body = await request.json().catch(() => null);
    const status = typeof body?.status === "string" ? body.status : "";

    if (!statuses.includes(status as (typeof statuses)[number])) {
      return NextResponse.json({ error: "INVALID_REVIEW_STATUS" }, { status: 400 });
    }

    if (status === "APPROVED") {
      const bridge = await approveCourseUpdateCandidateToMaintenance(candidateId, user);
      return NextResponse.json({ ok: true, bridge });
    }

    await reviewCourseUpdateCandidate(candidateId, {
      status: status as "DISMISSED" | "NEEDS_REVISION",
      reviewedBy: user.email
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = error instanceof Error ? error.message : "CANDIDATE_REVIEW_FAILED";
    if (code === "UNAUTHENTICATED") return NextResponse.json({ error: code }, { status: 401 });
    if (code === "FORBIDDEN") return NextResponse.json({ error: code }, { status: 403 });
    if (code === "CANDIDATE_NOT_FOUND") return NextResponse.json({ error: code }, { status: 404 });
    if (code === "CANDIDATE_NOT_REVIEWABLE" || code === "CANDIDATE_SOURCE_NOT_SUPPORTED" || code === "CANDIDATE_ALREADY_ACTIVE") return NextResponse.json({ error: code }, { status: 409 });
    console.error("[OPC AI] candidate review failed", error);
    return NextResponse.json({ error: "CANDIDATE_REVIEW_FAILED" }, { status: 500 });
  }
}

