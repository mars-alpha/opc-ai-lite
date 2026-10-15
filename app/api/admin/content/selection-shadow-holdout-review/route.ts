import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../lib/server/admin/api";
import {
  listSelectionShadowHumanReview,
  saveSelectionShadowHumanReview
} from "../../../../../lib/server/content/selection-shadow-human-review";
import {
  readSelectionShadowHoldoutManifest,
  SELECTION_SHADOW_HOLDOUT_PATH
} from "../../../../../lib/server/content/selection-shadow-holdout";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    return NextResponse.json({
      ...listSelectionShadowHumanReview(SELECTION_SHADOW_HOLDOUT_PATH),
      holdoutManifest: readSelectionShadowHoldoutManifest()
    });
  } catch (error) {
    return contentWorkbenchError(error, "SELECTION_SHADOW_HOLDOUT_REVIEW_LOAD_FAILED") ??
      NextResponse.json({ error: error instanceof Error ? error.message : "SELECTION_SHADOW_HOLDOUT_REVIEW_LOAD_FAILED" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAdminRequest(request);
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
      item: saveSelectionShadowHumanReview({
        ...(body && typeof body === "object" ? body as Record<string, unknown> : {}),
        reviewerEmail: user.email,
        filePath: SELECTION_SHADOW_HOLDOUT_PATH
      })
    });
  } catch (error) {
    return contentWorkbenchError(error, "SELECTION_SHADOW_HOLDOUT_REVIEW_SAVE_FAILED") ??
      NextResponse.json({ error: error instanceof Error ? error.message : "SELECTION_SHADOW_HOLDOUT_REVIEW_SAVE_FAILED" }, { status: 500 });
  }
}
