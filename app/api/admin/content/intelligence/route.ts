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
import { compactRadarSnapshotWire, radarListingItem } from "../../../../../lib/content/radar-snapshot-wire";
import {listAiHotspotPractices} from "../../../../../lib/server/content/ai-hotspot-practice-store";
import {readRadarAlgorithmPolicy} from "../../../../../lib/server/content/radar-algorithm-store";
import {evaluateAiHotspotPractice} from "../../../../../lib/server/content/ai-hotspot-practice";
import {readStagedEventValue} from '../../../../../lib/server/content/event-value-runtime';

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
    if(view==='event-value'){
      const eventId=url.searchParams.get('eventId');
      if(!eventId||!/^[a-zA-Z0-9_-]{1,100}$/.test(eventId))return NextResponse.json({error:'INVALID_EVENT_ID'},{status:400});
      return NextResponse.json({view,...await readStagedEventValue(eventId)});
    }

    if (view === "snapshot") {
      const snapshot = await getRadarSnapshot();
      return NextResponse.json({ view, ...(["compact","listing"].includes(url.searchParams.get("transport")??'')
        ? compactRadarSnapshotWire(snapshot,url.searchParams.get('transport')==='listing')
        : snapshot) });
    }
    if(view==='event-detail') {
      const eventId=url.searchParams.get('eventId');
      if(!eventId||!/^[a-zA-Z0-9_-]{1,100}$/.test(eventId)) return NextResponse.json({error:'INVALID_EVENT_ID'},{status:400});
      const snapshot=await getRadarSnapshot();
      let item=snapshot.items.find(item=>item.eventId===eventId);
      const day=url.searchParams.get('day'),asOfRaw=url.searchParams.get('asOf');
      if(!item&&day&&asOfRaw){
        const asOf=new Date(asOfRaw);
        try{dayStart(day);}catch{return NextResponse.json({error:'INVALID_RADAR_DAY'},{status:400});}
        if(!Number.isFinite(asOf.getTime())||asOf.getTime()>Date.now()+60000||day>=calendarWindow(asOf).firstDay) return NextResponse.json({error:'HISTORY_DAY_REQUIRED'},{status:400});
        item=(await listRadarTimelinePage({day,asOf})).items.find(row=>row.eventId===eventId);
      }
      if(!item)return NextResponse.json({error:'EVENT_DETAIL_NOT_FOUND'},{status:404});
      const compact=compactRadarSnapshotWire({items:[item],featured:[],currentHot:[]});
      return NextResponse.json({view,item:compact.items[0]});
    }
    if (view === "ai-hotspot-practice-diagnostics") {
      const algorithm=await readRadarAlgorithmPolicy();
      const page = await listRadarTimelinePage({asOf:new Date(),algorithm});
      return NextResponse.json({view,asOf:page.asOf,
        algorithmRevision:algorithm.revision,events:page.items.map(item=>({eventId:item.eventId,...evaluateAiHotspotPractice(item,new Date(page.asOf),algorithm.policy)}))});
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
      return NextResponse.json({ view, ...page,items:url.searchParams.get('transport')==='listing'?page.items.map(radarListingItem):page.items });
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
