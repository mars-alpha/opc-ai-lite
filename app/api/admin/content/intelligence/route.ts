import { dayStart, calendarWindow } from "../../../../../lib/content/radar-calendar";
import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../lib/server/admin/api";
import {
  getTodayIntelligenceOverview,
  listCurrentHotTodayIntelligence,
  listDiscoveryExpansionCandidates,
  listLatestTodayIntelligence,
  listRadarTimelinePage,
  listOfficialNewsCandidates,
  listUnverifiedEventCandidates
} from "../../../../../lib/server/content/intelligence-read-model";
import { getTodayIntelligenceSignalReadiness } from "../../../../../lib/server/content/today-intelligence-readiness";
import { listSourceRuntimeOperations } from "../../../../../lib/server/content/source-runtime-operations";
import { getRadarSnapshot } from "../../../../../lib/server/content/radar-snapshot";
import { compactRadarSnapshotWire } from "../../../../../lib/content/radar-snapshot-wire";
import {listAiHotspotPractices} from "../../../../../lib/server/content/ai-hotspot-practice-store";
import {evaluateAiHotspotPractice} from "../../../../../lib/server/content/ai-hotspot-practice";

export const dynamic = "force-dynamic";

function boundedLimit(value: string | null, fallback = 100) {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.max(1, Math.min(500, Math.round(parsed)))
    : fallback;
}

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const url = new URL(request.url);
    const view = (url.searchParams.get("view") ?? "overview").toLowerCase();
    const limit = boundedLimit(url.searchParams.get("limit"));

    if (view === "snapshot") {
      const snapshot = await getRadarSnapshot();
      return NextResponse.json({ view, ...(url.searchParams.get("transport") === "compact"
        ? compactRadarSnapshotWire(snapshot)
        : snapshot) });
    }
    if (view === "ai-hotspot-practice-diagnostics") {
      const page = await listRadarTimelinePage({asOf:new Date()});
      return NextResponse.json({view,asOf:page.asOf,
        events:page.items.map(item=>({eventId:item.eventId,...evaluateAiHotspotPractice(item)}))});
    }
    if (view === "latest") {
      return NextResponse.json({ view, items: await listLatestTodayIntelligence(limit) });
    }
    if (view === "timeline") {
      const day = url.searchParams.get("day");
      const asOfRaw = url.searchParams.get("asOf");
      const asOf = asOfRaw ? new Date(asOfRaw) : new Date();
      if (!day || !Number.isFinite(asOf.getTime()) || asOf.getTime() > Date.now() + 60_000) return NextResponse.json({ error: "INVALID_RADAR_DAY" }, { status: 400 });
      try { dayStart(day); } catch { return NextResponse.json({ error: "INVALID_RADAR_DAY" }, { status: 400 }); }
      if (day >= calendarWindow(asOf).firstDay) return NextResponse.json({ error: "HISTORY_DAY_REQUIRED" }, { status: 400 });
      const page = await listRadarTimelinePage({ day, asOf });
      return NextResponse.json({ view, ...page });
    }
    if (view === "current-hot") {
      return NextResponse.json({
        view,
        formalRanking: true,
        authority: "PRESENTATION_ONLY",
        items: await listCurrentHotTodayIntelligence(limit)
      });
    }
    if (view === "ai-hotspot-practice") {
      return NextResponse.json({ view, items: await listAiHotspotPractices() });
    }

    if (view === "expansion-candidates") {
      return NextResponse.json({ view, items: await listDiscoveryExpansionCandidates(limit) });
    }

    if (view === "official") {
      return NextResponse.json({ view, items: await listOfficialNewsCandidates(limit) });
    }
    if (view === "unverified") {
      return NextResponse.json({ view, items: await listUnverifiedEventCandidates(limit) });
    }
    if (view === "readiness") {
      return NextResponse.json({ view, ...(await getTodayIntelligenceSignalReadiness()) });
    }
    if (view === "source-health") {
      return NextResponse.json({ view, ...(await listSourceRuntimeOperations(limit)) });
    }
    if (view === "overview") {
      return NextResponse.json({ view, ...(await getTodayIntelligenceOverview()) });
    }
    return NextResponse.json({ error: "INTELLIGENCE_VIEW_INVALID" }, { status: 400 });
  } catch (error) {
    return contentWorkbenchError(error, "INTELLIGENCE_READ_FAILED") ??
      NextResponse.json({ error: "INTELLIGENCE_READ_FAILED" }, { status: 500 });
  }
}
