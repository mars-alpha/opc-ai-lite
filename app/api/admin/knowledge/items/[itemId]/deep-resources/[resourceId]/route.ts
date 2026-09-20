import { NextResponse } from "next/server";

import { requireAdminUser } from "../../../../../../../../lib/server/admin/service";
import { requireSessionUser } from "../../../../../../../../lib/server/auth/service";
import { updateDeepResourceForKnowledge } from "../../../../../../../../lib/server/content/deep-resources";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "KNOWLEDGE_DEEP_RESOURCE_UPDATE_FAILED";
  if (code === "UNAUTHENTICATED") return NextResponse.json({ error: code }, { status: 401 });
  if (code === "FORBIDDEN") return NextResponse.json({ error: code }, { status: 403 });
  if (
    code === "KNOWLEDGE_NOT_FOUND" ||
    code === "DEEP_RESOURCE_NOT_FOUND" ||
    code === "LESSON_NOT_FOUND" ||
    code === "PRACTICE_NOT_FOUND"
  ) {
    return NextResponse.json({ error: code }, { status: 404 });
  }
  if (code === "KNOWLEDGE_NOT_PUBLISHED" || code === "DEEP_RESOURCE_URL_EXISTS") {
    return NextResponse.json({ error: code }, { status: 409 });
  }
  if (code.startsWith("INVALID_")) return NextResponse.json({ error: code }, { status: 400 });

  console.error("[OPC AI] knowledge deep resource update failed", error);
  return NextResponse.json({ error: "KNOWLEDGE_DEEP_RESOURCE_UPDATE_FAILED" }, { status: 500 });
}

export async function PUT(
  request: Request,
  {
    params
  }: {
    params: Promise<{ itemId: string; resourceId: string }>;
  }
) {
  try {
    requireAdminUser(await requireSessionUser(request));
    const { itemId, resourceId } = await params;
    const body = await request.json().catch(() => null);
    return NextResponse.json({
      item: await updateDeepResourceForKnowledge(itemId, resourceId, body)
    });
  } catch (error) {
    return errorResponse(error);
  }
}
