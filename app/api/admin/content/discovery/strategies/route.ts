import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../lib/server/admin/api";
import {
  archiveCollectionStrategy,
  listCollectionStrategies,
  saveCollectionStrategy,
  setCollectionStrategyEnabled,
  testCollectionStrategy
} from "../../../../../../lib/server/content/collection-strategy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    return NextResponse.json({ items: await listCollectionStrategies() });
  } catch (error) {
    return contentWorkbenchError(error, "COLLECTION_STRATEGY_LIST_FAILED") ??
      NextResponse.json({ error: "COLLECTION_STRATEGY_LIST_FAILED" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdminRequest(request);
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const item = await saveCollectionStrategy(user, body ?? {});
    const tested = body?.test === false ? item : await testCollectionStrategy(user, item.id);
    return NextResponse.json({ item: tested }, { status: 201 });
  } catch (error) {
    return contentWorkbenchError(error, "COLLECTION_STRATEGY_SAVE_FAILED") ??
      NextResponse.json({ error: "COLLECTION_STRATEGY_SAVE_FAILED" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAdminRequest(request);
    const body = await request.json().catch(() => null) as { strategyId?: string; enabled?: boolean } | null;
    if (!body?.strategyId || typeof body.enabled !== "boolean") {
      return NextResponse.json({ error: "INVALID_STRATEGY_STATE" }, { status: 400 });
    }
    return NextResponse.json({
      item: await setCollectionStrategyEnabled(user, body.strategyId, body.enabled)
    });
  } catch (error) {
    return contentWorkbenchError(error, "COLLECTION_STRATEGY_STATE_FAILED") ??
      NextResponse.json({ error: "COLLECTION_STRATEGY_STATE_FAILED" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAdminRequest(request);
    const body = await request.json().catch(() => null) as { strategyId?: string } | null;
    if (!body?.strategyId) {
      return NextResponse.json({ error: "INVALID_STRATEGY_ID" }, { status: 400 });
    }
    return NextResponse.json({ item: await archiveCollectionStrategy(user, body.strategyId) });
  } catch (error) {
    return contentWorkbenchError(error, "COLLECTION_STRATEGY_DELETE_FAILED") ??
      NextResponse.json({ error: "COLLECTION_STRATEGY_DELETE_FAILED" }, { status: 500 });
  }
}
