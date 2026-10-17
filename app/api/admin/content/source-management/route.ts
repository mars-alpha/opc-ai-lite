import {listSourceCollectionSchedules,saveSourceCollectionSchedules} from "../../../../../lib/server/content/source-collection-schedule-store";
import { NextResponse } from "next/server";
import {readRadarAlgorithmPolicy,saveRadarAlgorithmPolicy} from '../../../../../lib/server/content/radar-algorithm-store';
import {readSourceCollectionAnalytics} from '../../../../../lib/server/content/source-collection-analytics';
import {
  contentWorkbenchError,
  requireAdminRequest
} from "../../../../../lib/server/admin/api";
import {
  archiveOperatorSource,
  restoreOperatorSource,
  getSourceManagementDetail,
  getSourceManagementIndex,
  setSourceManagementEnabled
} from "../../../../../lib/server/content/source-management";
import {
  readSourceAiRelevancePolicy,
  saveSourceAiRelevancePolicy
} from "../../../../../lib/server/content/source-management-policy";
import {
  discoverSource,
  previewSourceOnboarding,
  qualifyOnboardedSource,
  registerOnboardedSource,
  runOnboardedSourceCollection
} from "../../../../../lib/server/content/source-onboarding";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") ?? "index";
    if(mode==='frequency')return NextResponse.json(await listSourceCollectionSchedules());
    if(mode==='algorithm')return NextResponse.json(await readRadarAlgorithmPolicy());
    if(mode==='analytics')return NextResponse.json(await readSourceCollectionAnalytics(url.searchParams.get('days')??7,url.searchParams.get('sourceId')));
    if (mode === "detail") {
      const sourceId = url.searchParams.get("sourceId");
      if (!sourceId) throw new Error("SOURCE_ID_REQUIRED");
      return NextResponse.json(await getSourceManagementDetail(sourceId));
    }
    if (mode === "policy") {
      return NextResponse.json(await readSourceAiRelevancePolicy());
    }
    return NextResponse.json(await getSourceManagementIndex());
  } catch (error) {
    return contentWorkbenchError(error, "SOURCE_MANAGEMENT_LIST_FAILED") ??
      NextResponse.json({ error: "SOURCE_MANAGEMENT_LIST_FAILED" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdminRequest(request);
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const action = String(body.action ?? "").toUpperCase();
    if(action==='SAVE_RADAR_ALGORITHM'||action==='SAVE_SOURCE_FREQUENCY'){
      const origin=request.headers.get('origin');
      if(origin){
        // Next's internal request URL may use localhost behind the reverse proxy.
        // The browser's target Host remains the same-origin authority.
        let sameOriginHost=false;
        try{const parsed=new URL(origin);sameOriginHost=['http:','https:'].includes(parsed.protocol)&&parsed.origin===origin&&parsed.host===request.headers.get('host');}catch{}
        if(!sameOriginHost)return NextResponse.json({error:'FORBIDDEN'},{status:403});
      }
      if(action==='SAVE_SOURCE_FREQUENCY')return NextResponse.json(await saveSourceCollectionSchedules(body.changes,user));
      return NextResponse.json(await saveRadarAlgorithmPolicy(body.policy,body.expectedRevision,user));
    }
    if (action === "DISCOVER" || action === "CHECK") {
      return NextResponse.json(await discoverSource({ url: body.url, kind: body.kind, name: body.name }));
    }
    if (action === "PREVIEW") {
      return NextResponse.json(await previewSourceOnboarding({ url: body.url, kind: body.kind, name: body.name }));
    }
    if (action === "REGISTER") {
      return NextResponse.json({ item: await registerOnboardedSource(user, { url: body.url, kind: body.kind, name: body.name }) });
    }
    if (action === "QUALIFY") {
      if (typeof body.sourceId !== "string" || !body.sourceId) throw new Error("SOURCE_ID_REQUIRED");
      return NextResponse.json(await qualifyOnboardedSource(user, body.sourceId));
    }
    if (action === "COLLECT") {
      if (typeof body.sourceId !== "string" || !body.sourceId) throw new Error("SOURCE_ID_REQUIRED");
      const run = await runOnboardedSourceCollection(user, body.sourceId);
      if (run.status !== "SUCCEEDED") return NextResponse.json({error:run.errorCode ?? "SOURCE_COLLECTION_NOT_COMPLETED",run},{status:422});
      return NextResponse.json({run});
    }
    if (action === "SAVE_AI_POLICY") {
      return NextResponse.json(await saveSourceAiRelevancePolicy(body.terms, user, body.reason));
    }
    if (action === "DISABLE_SOURCE" || action === "ENABLE_SOURCE") {
      if (typeof body.sourceId !== "string" || !body.sourceId) throw new Error("SOURCE_ID_REQUIRED");
      return NextResponse.json({
        item: await setSourceManagementEnabled(body.sourceId, action === "ENABLE_SOURCE", user, body.reason)
      });
    }
    if (action === "RESTORE_SOURCE") {
      if (typeof body.sourceId !== "string" || !body.sourceId) throw new Error("SOURCE_ID_REQUIRED");
      return NextResponse.json({ item: await restoreOperatorSource(body.sourceId, user, body.reason) });
    }
    if (action === "ARCHIVE_SOURCE") {
      if (typeof body.sourceId !== "string" || !body.sourceId) throw new Error("SOURCE_ID_REQUIRED");
      return NextResponse.json({ item: await archiveOperatorSource(body.sourceId, user, body.reason) });
    }
    return NextResponse.json({ error: "SOURCE_MANAGEMENT_ACTION_INVALID" }, { status: 400 });
  } catch (error) {
    return contentWorkbenchError(error, "SOURCE_MANAGEMENT_ACTION_FAILED") ??
      NextResponse.json({ error: "SOURCE_MANAGEMENT_ACTION_FAILED" }, { status: 500 });
  }
}
