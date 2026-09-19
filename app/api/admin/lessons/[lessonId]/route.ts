import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../../../../../lib/server/auth/service";
import { getAdminLesson, requireAdminUser, updateAdminLesson } from "../../../../../lib/server/admin/service";

export const dynamic = "force-dynamic";

async function requireAdmin(request: Request) {
  const user = await getSessionUser(readSessionToken(request));
  return requireAdminUser(user);
}

function authError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHENTICATED") {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    await requireAdmin(request);
    const { lessonId } = await params;
    const lesson = await getAdminLesson(lessonId);
    if (!lesson) return NextResponse.json({ error: "LESSON_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ lesson });
  } catch (error) {
    const response = authError(error);
    if (response) return response;
    console.error("[OPC AI] admin lesson read failed", error);
    return NextResponse.json({ error: "ADMIN_READ_FAILED" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    await requireAdmin(request);
    const { lessonId } = await params;
    const body = await request.json().catch(() => null);
    return NextResponse.json({ lesson: await updateAdminLesson(lessonId, body) });
  } catch (error) {
    const response = authError(error);
    if (response) return response;
    const code = error instanceof Error ? error.message : "ADMIN_UPDATE_FAILED";
    if (code === "LESSON_NOT_FOUND") return NextResponse.json({ error: code }, { status: 404 });
    if (code.startsWith("INVALID_")) return NextResponse.json({ error: code }, { status: 400 });
    console.error("[OPC AI] admin lesson update failed", error);
    return NextResponse.json({ error: "ADMIN_UPDATE_FAILED" }, { status: 500 });
  }
}

