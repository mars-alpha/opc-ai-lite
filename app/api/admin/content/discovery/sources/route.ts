import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../../lib/server/admin/api";
import {
  archiveDiscoverySource,
  configureDiscoverySource,
  listDiscoverySources,
  setDiscoverySourceEnabled
} from "../../../../../../lib/server/content/discovery";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    return NextResponse.json({ items: await listDiscoverySources() });
  } catch (error) {
    return contentWorkbenchError(error, "DISCOVERY_SOURCE_LIST_FAILED") ??
      NextResponse.json({ error: "DISCOVERY_SOURCE_LIST_FAILED" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdminRequest(request);
    const body = await request.json().catch(() => null);
    return NextResponse.json({ item: await configureDiscoverySource(user, body) });
  } catch (error) {
    return contentWorkbenchError(error, "DISCOVERY_SOURCE_SAVE_FAILED") ??
      NextResponse.json({ error: "DISCOVERY_SOURCE_SAVE_FAILED" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAdminRequest(request);
    const body = await request.json().catch(() => null) as { sourceId?: string; enabled?: boolean } | null;
    if (!body?.sourceId || typeof body.enabled !== "boolean") {
      return NextResponse.json({ error: "INVALID_SOURCE_STATE" }, { status: 400 });
    }
    return NextResponse.json({ item: await setDiscoverySourceEnabled(user, body.sourceId, body.enabled) });
  } catch (error) {
    return contentWorkbenchError(error, "DISCOVERY_SOURCE_STATE_FAILED") ??
      NextResponse.json({ error: "DISCOVERY_SOURCE_STATE_FAILED" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAdminRequest(request);
    const body = await request.json().catch(() => null) as { sourceId?: string } | null;
    if (!body?.sourceId) return NextResponse.json({ error: "INVALID_SOURCE_ID" }, { status: 400 });
    return NextResponse.json({ item: await archiveDiscoverySource(user, body.sourceId) });
  } catch (error) {
    return contentWorkbenchError(error, "DISCOVERY_SOURCE_DELETE_FAILED") ??
      NextResponse.json({ error: "DISCOVERY_SOURCE_DELETE_FAILED" }, { status: 500 });
  }
}
