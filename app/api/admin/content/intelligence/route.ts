import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../lib/server/admin/api";
import {
  getTodayIntelligenceOverview,
  listCurrentHotTodayIntelligence,
  listDiscoveryExpansionCandidates,
  listLatestTodayIntelligence,
  listRadarTimeline,
  listRadarTimelinePage,
  listOfficialNewsCandidates,
  listUnverifiedEventCandidates,
  listWorthPracticingTodayIntelligence
} from "../../../../../lib/server/content/intelligence-read-model";
import { getTodayIntelligenceSignalReadiness } from "../../../../../lib/server/content/today-intelligence-readiness";
import { listSourceRuntimeOperations } from "../../../../../lib/server/content/source-runtime-operations";
import { getRadarSnapshot } from "../../../../../lib/server/content/radar-snapshot";

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
      return NextResponse.json({ view, ...(await getRadarSnapshot()) });
    }
    if (view === "latest") {
      return NextResponse.json({ view, items: await listLatestTodayIntelligence(limit) });
    }
    if (view === "timeline") {
      const beforeRaw = url.searchParams.get("before");
      const before = beforeRaw ? new Date(beforeRaw) : null;
      const page = await listRadarTimelinePage({ limit, before: before && Number.isFinite(before.getTime()) ? before : null, windowDays: 7 });
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
    if (view === "practicing") {
      return NextResponse.json({ view, items: await listWorthPracticingTodayIntelligence(limit) });
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
