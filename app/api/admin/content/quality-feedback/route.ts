import { NextResponse } from "next/server";
import { adminAuthError, requireAdminRequest } from "../../../../../lib/server/admin/api";
import { listEventQualityFeedback, sourceQualitySummary } from "../../../../../lib/server/content/collection-quality-feedback";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const url = new URL(request.url);
    const sourceId = url.searchParams.get("sourceId");
    if (sourceId) {
      if (!/^source_[A-Za-z0-9_-]{1,153}$/.test(sourceId)) return NextResponse.json({ error: "QUALITY_SOURCE_INVALID" }, { status: 400 });
      return NextResponse.json(await sourceQualitySummary(sourceId, Number(url.searchParams.get("days") ?? 30), Number(url.searchParams.get("cursor")) || undefined, Number(url.searchParams.get("limit")) || 30));
    }
    const eventIds = (url.searchParams.get("eventIds") ?? "").split(",").filter(Boolean);
    if (!eventIds.length || eventIds.length > 100 || eventIds.some(id => !UUID.test(id))) return NextResponse.json({ error: "QUALITY_EVENT_IDS_INVALID" }, { status: 400 });
    return NextResponse.json({ events: await listEventQualityFeedback(eventIds) });
  } catch (error) {
    return adminAuthError(error) ?? NextResponse.json({ error: "QUALITY_FEEDBACK_READ_FAILED" }, { status: 500 });
  }
}
