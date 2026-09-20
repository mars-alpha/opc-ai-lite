import { NextResponse } from "next/server";

import { requireAdminUser } from "../../../../../../../lib/server/admin/service";
import { requireSessionUser } from "../../../../../../../lib/server/auth/service";
import {
  generatePracticeDraft,
  getPracticeDraftForKnowledge,
  updatePracticeDraft
} from "../../../../../../../lib/server/practices/drafts";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "PRACTICE_DRAFT_FAILED";
  if (code === "UNAUTHENTICATED") return NextResponse.json({ error: code }, { status: 401 });
  if (code === "FORBIDDEN") return NextResponse.json({ error: code }, { status: 403 });
  if (code === "KNOWLEDGE_NOT_FOUND" || code === "DEEP_RESOURCE_NOT_FOUND" || code === "PRACTICE_DRAFT_NOT_FOUND") {
    return NextResponse.json({ error: code }, { status: 404 });
  }
  if (
    code === "KNOWLEDGE_NOT_PUBLISHED" ||
    code === "KNOWLEDGE_NOT_ACTIVE" ||
    code === "DEEP_RESOURCE_NOT_PUBLISHED" ||
    code === "PRACTICE_DRAFT_FINAL"
  ) {
    return NextResponse.json({ error: code }, { status: 409 });
  }
  if (code.startsWith("INVALID_") || code === "UNSUPPORTED_SUBMISSION_SCHEMA") {
    return NextResponse.json({ error: code }, { status: 400 });
  }
  console.error("[OPC AI] practice draft operation failed", error);
  return NextResponse.json({ error: "PRACTICE_DRAFT_FAILED" }, { status: 500 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    requireAdminUser(await requireSessionUser(request));
    const { itemId } = await params;
    return NextResponse.json({ item: await getPracticeDraftForKnowledge(itemId) });
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
    const body = await request.json().catch(() => ({}));
    const result = await generatePracticeDraft(itemId, body ?? {});
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    requireAdminUser(await requireSessionUser(request));
    const { itemId } = await params;
    const body = await request.json().catch(() => null);
    return NextResponse.json({ item: await updatePracticeDraft(itemId, body ?? {}) });
  } catch (error) {
    return errorResponse(error);
  }
}
