import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../../../../../../lib/server/auth/service";
import { requireAdminUser } from "../../../../../../lib/server/admin/service";
import { getAdminKnowledgeItem } from "../../../../../../lib/server/content/admin";

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
    const item = await getAdminKnowledgeItem(itemId);
    if (!item) return NextResponse.json({ error: "KNOWLEDGE_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    const response = authError(error);
    if (response) return response;
    console.error("[OPC AI] admin knowledge read failed", error);
    return NextResponse.json({ error: "ADMIN_KNOWLEDGE_READ_FAILED" }, { status: 500 });
  }
}

