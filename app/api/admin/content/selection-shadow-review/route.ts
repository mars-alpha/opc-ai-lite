import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../lib/server/admin/api";
import {
  listSelectionShadowHumanReview,
  saveSelectionShadowHumanReview
} from "../../../../../lib/server/content/selection-shadow-human-review";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    return NextResponse.json(listSelectionShadowHumanReview());
  } catch (error) {
    return contentWorkbenchError(error, "SELECTION_SHADOW_REVIEW_LOAD_FAILED") ??
      NextResponse.json({ error: error instanceof Error ? error.message : "SELECTION_SHADOW_REVIEW_LOAD_FAILED" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAdminRequest(request);
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
      item: saveSelectionShadowHumanReview({
        ...(body && typeof body === "object" ? body as Record<string, unknown> : {}),
        reviewerEmail: user.email
      })
    });
  } catch (error) {
    return contentWorkbenchError(error, "SELECTION_SHADOW_REVIEW_SAVE_FAILED") ??
      NextResponse.json({ error: error instanceof Error ? error.message : "SELECTION_SHADOW_REVIEW_SAVE_FAILED" }, { status: 500 });
  }
}
