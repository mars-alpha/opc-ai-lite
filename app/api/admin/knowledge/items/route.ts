import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../../../../../lib/server/auth/service";
import { requireAdminUser } from "../../../../../lib/server/admin/service";
import {
  createAdminKnowledgeItem,
  listAdminKnowledgeItems
} from "../../../../../lib/server/content/admin";

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

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    return NextResponse.json({ items: await listAdminKnowledgeItems() });
  } catch (error) {
    const response = authError(error);
    if (response) return response;
    console.error("[OPC AI] admin knowledge list failed", error);
    return NextResponse.json({ error: "ADMIN_KNOWLEDGE_LIST_FAILED" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const body = await request.json().catch(() => null);
    return NextResponse.json({ item: await createAdminKnowledgeItem(body) }, { status: 201 });
  } catch (error) {
    const response = authError(error);
    if (response) return response;
    const code = error instanceof Error ? error.message : "ADMIN_KNOWLEDGE_CREATE_FAILED";
    if (code.startsWith("INVALID_")) return NextResponse.json({ error: code }, { status: 400 });
    console.error("[OPC AI] admin knowledge create failed", error);
    return NextResponse.json({ error: "ADMIN_KNOWLEDGE_CREATE_FAILED" }, { status: 500 });
  }
}

