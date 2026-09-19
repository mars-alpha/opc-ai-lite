import { NextResponse } from "next/server";
import { getDatabaseConfig } from "../../../../lib/server/database-config";
import { requireSessionUser } from "../../../../lib/server/auth/service";
import { enrollInCourse } from "../../../../lib/server/learning/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!getDatabaseConfig().configured) {
    return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const courseSlug = body?.courseSlug;
  if (typeof courseSlug !== "string" || !courseSlug.trim()) {
    return NextResponse.json({ error: "INVALID_COURSE_SLUG" }, { status: 400 });
  }

  try {
    const user = await requireSessionUser(request);
    await enrollInCourse(user.id, courseSlug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "COURSE_NOT_FOUND") {
      return NextResponse.json({ error: "COURSE_NOT_FOUND" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "STAGE_PREREQUISITE_REQUIRED") {
      return NextResponse.json({ error: "STAGE_PREREQUISITE_REQUIRED" }, { status: 409 });
    }
    console.error("[OPC AI] enrollment failed", error);
    return NextResponse.json({ error: "ENROLLMENT_FAILED" }, { status: 500 });
  }
}


