import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../../../../../../../lib/server/auth/service";
import { requireAdminUser } from "../../../../../../../lib/server/admin/service";
import {
  getKnowledgeForContent,
  routeContentToKnowledge
} from "../../../../../../../lib/server/content/routing";

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
    return NextResponse.json({ item: await getKnowledgeForContent(itemId) });
  } catch (error) {
    const response = authError(error);
    if (response) return response;
    console.error("[OPC AI] content knowledge read failed", error);
    return NextResponse.json({ error: "CONTENT_KNOWLEDGE_READ_FAILED" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await requireAdmin(request);
    const { itemId } = await params;
    const body = await request.json().catch(() => null);
    const result = await routeContentToKnowledge(itemId, body);
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    const response = authError(error);
    if (response) return response;

    const code = error instanceof Error ? error.message : "CONTENT_KNOWLEDGE_ROUTE_FAILED";
    if (code === "CONTENT_NOT_FOUND") {
      return NextResponse.json({ error: code }, { status: 404 });
    }
    if (code === "CONTENT_NOT_KNOWLEDGE_CAPSULE") {
      return NextResponse.json({ error: code }, { status: 409 });
    }
    if (code.startsWith("INVALID_")) {
      return NextResponse.json({ error: code }, { status: 400 });
    }

    console.error("[OPC AI] content knowledge route failed", error);
    return NextResponse.json({ error: "CONTENT_KNOWLEDGE_ROUTE_FAILED" }, { status: 500 });
  }
}
