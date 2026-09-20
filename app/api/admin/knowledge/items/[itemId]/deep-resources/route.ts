import { NextResponse } from "next/server";

import { requireAdminUser } from "../../../../../../../lib/server/admin/service";
import { requireSessionUser } from "../../../../../../../lib/server/auth/service";
import {
  createDeepResourceForKnowledge,
  listDeepResourcesForKnowledge
} from "../../../../../../../lib/server/content/deep-resources";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "KNOWLEDGE_DEEP_RESOURCE_FAILED";
  if (code === "UNAUTHENTICATED") return NextResponse.json({ error: code }, { status: 401 });
  if (code === "FORBIDDEN") return NextResponse.json({ error: code }, { status: 403 });
  if (code === "KNOWLEDGE_NOT_FOUND" || code === "LESSON_NOT_FOUND" || code === "PRACTICE_NOT_FOUND") {
    return NextResponse.json({ error: code }, { status: 404 });
  }
  if (code === "KNOWLEDGE_NOT_PUBLISHED" || code === "DEEP_RESOURCE_URL_EXISTS") {
    return NextResponse.json({ error: code }, { status: 409 });
  }
  if (code.startsWith("INVALID_")) return NextResponse.json({ error: code }, { status: 400 });

  console.error("[OPC AI] knowledge deep resource failed", error);
  return NextResponse.json({ error: "KNOWLEDGE_DEEP_RESOURCE_FAILED" }, { status: 500 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    requireAdminUser(await requireSessionUser(request));
    const { itemId } = await params;
    return NextResponse.json({ items: await listDeepResourcesForKnowledge(itemId) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    requireAdminUser(await requireSessionUser(request));
    const { itemId } = await params;
    const body = await request.json().catch(() => null);
    const result = await createDeepResourceForKnowledge(itemId, body);
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    return errorResponse(error);
  }
}
