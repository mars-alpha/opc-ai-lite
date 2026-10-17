import {loadEnvConfig} from "@next/env";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {closeDatabase} from "../lib/server/db";
import {readSourceWatchlist} from "../lib/server/content/source-coverage-report";
import {collectRssDocument} from "../lib/server/content/collection-runner";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
import {WATCHLIST_FEEDS,fixedWatchlistFeedUrl} from "../services/overseas-collector-relay/watchlist-feeds";
loadEnvConfig(process.cwd());
async function main(){
 const target=assertCurrentDatabaseTarget();
 if(target.environment==="production" && !process.argv.includes("--production-read-only"))throw new Error("PRODUCTION_READ_ONLY_FLAG_REQUIRED");
 const report=await readSourceWatchlist();
 const mode=process.argv.find(a=>a.startsWith("--probe="))?.split("=")[1];
 if(!mode){console.log(JSON.stringify(report,null,2));return;}
 if(!["local-handler","relay"].includes(mode))throw new Error("PROBE_MODE_INVALID");
 const requested=process.argv.find(a=>a.startsWith("--source="))?.slice(9);
 if(requested && !WATCHLIST_FEEDS.some(s=>s.sourceId===requested))throw new Error("WATCHLIST_SOURCE_UNKNOWN");
 const readyIds=new Set(report.items.filter(i=>i.status==="TRACKED_NOT_PROBED").flatMap(i=>i.sourceIds));
 const entries=WATCHLIST_FEEDS.filter(e=>(!requested || e.sourceId===requested) && readyIds.has(e.sourceId)).slice(0,3);
 const originalFetch=globalThis.fetch,keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OPC_COLLECTION_WATCHLIST_FEEDS"];
 const saved=new Map(keys.map(k=>[k,process.env[k]]));
 const results:Array<Record<string,unknown>>=[],deadline=Date.now()+60000;
 try{
  if(mode==="local-handler"){
   process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://watchlist-probe.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture-local-only";process.env.OPC_COLLECTION_WATCHLIST_FEEDS="v1";
   globalThis.fetch=async(input,init)=>{
    if(String(input)==="https://watchlist-probe.invalid/v1/collect")return handleRelayRequest(new Request(String(input),init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture-local-only"});
    if(!fixedWatchlistFeedUrl(String(input)))throw new Error("PROBE_UPSTREAM_NOT_ALLOWED");
    return originalFetch(input,init);
   };
  }
  for(const entry of entries)for(const url of entry.urls){
   if(deadline-Date.now()<20000){results.push({sourceId:entry.sourceId,url,status:"SKIPPED_TIME_SLICE"});continue;}
   try{
    const feed=await collectRssDocument(url,{signal:AbortSignal.timeout(Math.min(20000,deadline-Date.now()))});
    const dated=feed.items.filter(i=>i.publishedAt && Number.isFinite(Date.parse(i.publishedAt)) && Date.parse(i.publishedAt)<=Date.now()).length;
    results.push({sourceId:entry.sourceId,url,status:feed.items.length && dated && !feed.truncated?"LIVE_FEED_SAMPLE":"FETCHED_NOT_COMPLETE",samples:feed.items.length,datedSamples:dated,truncated:feed.truncated===true,hasValidator:Boolean(feed.validators.etag || feed.validators.lastModified)});
   }catch(error){const reason=error instanceof Error && /^[A-Z0-9_:]{1,140}$/.test(error.message)?error.message:"PROBE_FAILED";results.push({sourceId:entry.sourceId,url,status:"UNAVAILABLE",reason});}
  }
 }finally{globalThis.fetch=originalFetch;for(const key of keys){const v=saved.get(key);if(v===undefined)delete process.env[key];else process.env[key]=v;}}
 console.log(JSON.stringify({mode,environment:target.environment,databaseMutation:false,productionServerAcceptance:false,asOf:new Date().toISOString(),results},null,2));
}
main().catch(error=>{console.error(error instanceof Error && /^[A-Z0-9_:]+$/.test(error.message)?error.message:"WATCHLIST_INSPECTION_FAILED");process.exitCode=1;}).finally(closeDatabase);
