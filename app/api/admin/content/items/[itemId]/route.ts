import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../../../../../../lib/server/auth/service";
import { requireAdminUser } from "../../../../../../lib/server/admin/service";
import {
  getAdminContentItem,
  updateAdminContentItem
} from "../../../../../../lib/server/content/admin";

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
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await requireAdmin(request);
    const { itemId } = await params;
    const item = await getAdminContentItem(itemId);
    if (!item) return NextResponse.json({ error: "CONTENT_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    const response = authError(error);
    if (response) return response;
    console.error("[OPC AI] admin content read failed", error);
    return NextResponse.json({ error: "ADMIN_CONTENT_READ_FAILED" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await requireAdmin(request);
    const { itemId } = await params;
    const body = await request.json().catch(() => null);
    return NextResponse.json({ item: await updateAdminContentItem(itemId, body) });
  } catch (error) {
    const response = authError(error);
    if (response) return response;
    const code = error instanceof Error ? error.message : "ADMIN_CONTENT_UPDATE_FAILED";
    if (code === "CONTENT_NOT_FOUND") return NextResponse.json({ error: code }, { status: 404 });
    if (code.startsWith("INVALID_")) return NextResponse.json({ error: code }, { status: 400 });
    console.error("[OPC AI] admin content update failed", error);
    return NextResponse.json({ error: "ADMIN_CONTENT_UPDATE_FAILED" }, { status: 500 });
  }
}

