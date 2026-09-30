import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../../../../../lib/server/auth/service";
import { requireAdminUser } from "../../../../../lib/server/admin/service";
import { getAdminUserDetail, updateAdminUser } from "../../../../../lib/server/admin/users";

export const dynamic = "force-dynamic";

async function actor(request: Request) {
  return requireAdminUser(await getSessionUser(readSessionToken(request)));
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
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await actor(request);
    const { userId } = await params;
    const user = await getAdminUserDetail(userId);
    if (!user) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    const response = authError(error);
    if (response) return response;
    console.error("[OPC AI] admin user read failed", error);
    return NextResponse.json({ error: "ADMIN_USER_READ_FAILED" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await actor(request);
    const { userId } = await params;
    const body = await request.json().catch(() => null);
    if (
      admin.id === userId &&
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      (body as { accountStatus?: unknown }).accountStatus === "DISABLED"
    ) {
      return NextResponse.json({ error: "CANNOT_DISABLE_SELF" }, { status: 400 });
    }
    if (
      admin.id === userId &&
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      (body as { role?: unknown }).role === "USER"
    ) {
      return NextResponse.json({ error: "CANNOT_REMOVE_SELF_ADMIN" }, { status: 400 });
    }
    return NextResponse.json({ user: await updateAdminUser(userId, body, admin) });
  } catch (error) {
    const response = authError(error);
    if (response) return response;
    const code = error instanceof Error ? error.message : "ADMIN_USER_UPDATE_FAILED";
    if (code === "USER_NOT_FOUND") return NextResponse.json({ error: code }, { status: 404 });
    if (code === "LAST_ADMIN" || code === "LAST_ACTIVE_ADMIN") {
      return NextResponse.json({ error: code }, { status: 400 });
    }
    if (code.startsWith("INVALID_")) return NextResponse.json({ error: code }, { status: 400 });
    console.error("[OPC AI] admin user update failed", error);
    return NextResponse.json({ error: "ADMIN_USER_UPDATE_FAILED" }, { status: 500 });
  }
}
