import "server-only";
import {getDatabase} from "../db";
import {contentSources} from "../db/schema";
import {buildSourceWatchlist} from "../../content/source-watchlist-policy";
import {isCurrentSystemCollectionSource} from "./source-portfolio-runtime";
import {resolveSourceAcquisitionPlan} from "./source-acquisition-plan";
import {fixedWatchlistFeedUrl} from "../../../services/overseas-collector-relay/watchlist-feeds";
import {isWatchlistFeedRelayEnabled} from "./overseas-collector-relay-client";

export async function readSourceWatchlist(){
 const sources=await getDatabase().select({id:contentSources.id,name:contentSources.name,providerRef:contentSources.providerRef,canonicalUrl:contentSources.canonicalUrl,enabled:contentSources.enabled,status:contentSources.status,platform:contentSources.platform,collectionMethod:contentSources.collectionMethod,metadata:contentSources.metadata,collectionConfig:contentSources.collectionConfig}).from(contentSources);
 const projected=sources.map(source=>{
  const routes=resolveSourceAcquisitionPlan(source).routes;
  return {...source,current:isCurrentSystemCollectionSource(source),urls:routes.map(r=>r.targetUrl).filter((u):u is string=>Boolean(u)),routes};
 });
 const report=buildSourceWatchlist(projected);
 return {...report,items:report.items.map(item=>{
  const selected=projected.filter(s=>item.sourceIds.includes(s.id));
  const routes=selected.flatMap(s=>s.routes.filter(r=>r.enabled && r.serverRuntimeSupported));
  const relayUnavailable=routes.filter(r=>r.targetUrl && fixedWatchlistFeedUrl(r.targetUrl) && !isWatchlistFeedRelayEnabled()).length;
  return {...item,configuredRouteCount:routes.length,relayUnavailable,runtimeReady:item.status!=="TRACKED_NOT_PROBED" || routes.length===0 || relayUnavailable===routes.length?false:null};
 }),asOf:new Date().toISOString(),health:"CONFIGURATION_ONLY_NOT_LIVE_ACCEPTANCE"};
}
