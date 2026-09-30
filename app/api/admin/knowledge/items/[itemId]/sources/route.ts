import { NextResponse } from "next/server";

import { requireAdminUser } from "../../../../../../../lib/server/admin/service";
import { requireSessionUser } from "../../../../../../../lib/server/auth/service";
import {
  addSupportingKnowledgeSource,
  listKnowledgeSources
} from "../../../../../../../lib/server/content/knowledge-sources";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "KNOWLEDGE_SOURCES_FAILED";
  if (code === "UNAUTHENTICATED") return NextResponse.json({ error: code }, { status: 401 });
  if (code === "FORBIDDEN") return NextResponse.json({ error: code }, { status: 403 });
  if (code === "KNOWLEDGE_NOT_FOUND" || code === "CONTENT_NOT_FOUND") {
    return NextResponse.json({ error: code }, { status: 404 });
  }
  if (code === "CONTENT_NOT_PUBLISHED" || code === "CONTENT_VERIFIED_EVIDENCE_REQUIRED") {
    return NextResponse.json({ error: code }, { status: 409 });
  }
  if (code.startsWith("INVALID_")) {
    return NextResponse.json({ error: code }, { status: 400 });
  }

  console.error("[OPC AI] knowledge source operation failed", error);
  return NextResponse.json({ error: "KNOWLEDGE_SOURCES_FAILED" }, { status: 500 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    requireAdminUser(await requireSessionUser(request));
    const { itemId } = await params;
    return NextResponse.json({ items: await listKnowledgeSources(itemId) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = requireAdminUser(await requireSessionUser(request));
    const { itemId } = await params;
    const body = await request.json().catch(() => null);
    const result = await addSupportingKnowledgeSource(
      user,
      itemId,
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>).contentId
        : null
    );
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    return errorResponse(error);
  }
}
