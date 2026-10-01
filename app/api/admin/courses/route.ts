import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser, readSessionToken } from "../../../../lib/server/auth/service";
import { requireAdminUser } from "../../../../lib/server/admin/service";
import {
  cancelAdminCourseCandidate,
  getAdminCourseMaintenanceRegistry,
  publishAdminCourseCandidate,
  returnAdminCourseCandidateToEdit,
  saveAdminCourseCandidate,
  startAdminCourseCandidate,
  startAdminCourseRestoreCandidate,
  submitAdminCourseCandidate
} from "../../../../lib/server/admin/course-maintenance";

export const dynamic = "force-dynamic";

function statusForError(message: string) {
  if (message === "UNAUTHENTICATED") return 401;
  if (message === "FORBIDDEN") return 403;
  if (
    message === "LESSON_NOT_FOUND" ||
    message === "ADMIN_COURSE_NOT_FOUND" ||
    message === "CANDIDATE_NOT_FOUND"
  ) return 404;
  if (
    message.startsWith("INVALID_") ||
    message.endsWith("_REQUIRED") ||
    message.includes("NOT_EDITABLE") ||
    message.includes("NOT_REVIEWABLE") ||
    message.includes("NOT_IN_REVIEW") ||
    message.includes("NOT_ACTIVE") ||
    message.includes("BASE_VERSION_CONFLICT") ||
    message === "CANDIDATE_ALREADY_ACTIVE" ||
    message === "CANNOT_RESTORE_CURRENT_VERSION" ||
    message === "RESTORE_SOURCE_NOT_PUBLISHED"
  ) return 409;
  return 500;
}

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(readSessionToken(request));
    requireAdminUser(user);
    return NextResponse.json(await getAdminCourseMaintenanceRegistry());
  } catch (error) {
    const message = error instanceof Error ? error.message : "ADMIN_COURSE_REGISTRY_FAILED";
    if (!["UNAUTHENTICATED", "FORBIDDEN"].includes(message)) {
      console.error("[OPC AI] admin course registry failed", error);
    }
    return NextResponse.json({ error: message }, { status: statusForError(message) });
  }
}

export async function POST(request: Request) {
  try {
    const user = requireAdminUser(
      await getSessionUser(readSessionToken(request))
    );
    const input = await request.json();
    const action = typeof input?.action === "string" ? input.action : "";

    if (action === "START") {
      const item = await startAdminCourseCandidate(
        user,
        String(input.courseSlug ?? ""),
        String(input.lessonSlug ?? "")
      );
      return NextResponse.json({ item });
    }

    const candidateId = String(input?.candidateId ?? "").trim();
    if (!candidateId) {
      return NextResponse.json({ error: "CANDIDATE_ID_REQUIRED" }, { status: 400 });
    }

    if (action === "RESTORE") {
      const item = await startAdminCourseRestoreCandidate(user, candidateId);
      return NextResponse.json({ item });
    }
    if (action === "SAVE") {
      const item = await saveAdminCourseCandidate(candidateId, {
        updateReason: input.updateReason,
        snapshot: input.snapshot
      });
      return NextResponse.json({ item });
    }
    if (action === "SUBMIT") {
      const item = await submitAdminCourseCandidate(candidateId);
      return NextResponse.json({ item });
    }
    if (action === "RETURN") {
      await returnAdminCourseCandidateToEdit(candidateId);
      return NextResponse.json({ ok: true });
    }
    if (action === "CANCEL") {
      await cancelAdminCourseCandidate(candidateId);
      return NextResponse.json({ ok: true });
    }
    if (action === "PUBLISH") {
      const result = await publishAdminCourseCandidate(candidateId, user);
      revalidatePath(`/courses/${result.courseSlug}/lessons/${result.lessonSlug}`);
      revalidatePath("/learning-path");
      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.json({ error: "INVALID_ACTION" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ADMIN_COURSE_ACTION_FAILED";
    if (!["UNAUTHENTICATED", "FORBIDDEN"].includes(message)) {
      console.error("[OPC AI] admin course action failed", error);
    }
    return NextResponse.json({ error: message }, { status: statusForError(message) });
  }
}

