import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {loadEnvConfig} from "@next/env";
import {eq} from "drizzle-orm";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {contentSources,contentCollectionRuns,contentRawItems,users} from "../lib/server/db/schema";
import {runSourceCollection} from "../lib/server/content/collection-runner";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes("--confirm=INCREMENTAL-TRANSPORTS-DEVELOPMENT"));assert.equal(assertCurrentDatabaseTarget().environment,"development");
 const locked=await withSourceCollectionCycleLock(async()=>{
 const db=getDatabase();const [admin]=await db.select().from(users).where(eq(users.role,"ADMIN")).limit(1);assert(admin);
 const actor={id:admin.id,email:"incremental-acceptance@example.invalid",displayName:null,role:"ADMIN" as const};
 const originalFetch=globalThis.fetch,keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES"];
 const saved=new Map(keys.map(key=>[key,process.env[key]]));
 try{
 process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://relay.example.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture";process.env.OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES="v2";
 for(const kind of ["RELAY_PUBLIC","RELAY_DEEPMIND","API"]){
  const id="source_accept_incremental_"+randomUUID().replaceAll("-",""),api=kind==="API";
  const url=api?"https://aihot.virxact.com/api/public/items":kind==="RELAY_PUBLIC"?"https://simonwillison.net/atom/everything/":"https://deepmind.google/blog/rss.xml";
  const route=(routeId:string)=>({acquisition:{routes:[{id:routeId,role:"PRIMARY",kind:api?"PUBLIC_JSON_API":"RSS_ATOM",url,...(api?{runtimeOwner:"RADAR_AI_HOT"}:{})}]}});
  await db.insert(contentSources).values({id,name:"Incremental transport fixture",sourceType:"OFFICIAL",platform:"WEB",collectionMethod:api?"CUSTOM":"RSS",canonicalUrl:url,collectionConfig:route("primary"),metadata:{acceptanceOnly:true}});
  let phase="INITIAL";
  globalThis.fetch=async(input,init)=>{
   if(String(input)==="https://relay.example.invalid/v1/collect")return handleRelayRequest(new Request(String(input),init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
   assert.equal(String(input),url,"ONLY_MOCK_UPSTREAM_ALLOWED");
   const headers=new Headers(init?.headers);
   assert.equal(headers.get("if-none-match"),["INITIAL","ISOLATION","BACKFILL","QUALIFICATION"].includes(phase)?null:'"v1"');
   if(phase==="NOT_MODIFIED")return new Response(null,{status:304});
   if(phase==="INVALID_JSON")return Response.json({error:"not a snapshot"},{headers:{etag:'"invalid"'}});
   if(phase==="CAP")return Response.json({items:Array.from({length:121},(_,i)=>({id:i,title:"AI release",url:`https://example.org/${id}/${i}`,score:10}))},{headers:{etag:'"capped"'}});
   const broken={id:1,title:`OpenAI AI model release ${id}`,url:`https://example.org/${id}`,summary:"API model \u0000 database rejection",score:80,published_at:new Date().toISOString()};
   const body=api?JSON.stringify({items:phase==="BROKEN_COMMIT"?[broken]:[]}):phase==="BROKEN_COMMIT"?`<rss><channel><item><title>${broken.title}</title><link>${broken.url}</link><description>${broken.summary}</description><pubDate>${new Date().toUTCString()}</pubDate></item></channel></rss>`:'<feed/>';
   return new Response(body,{headers:{etag:phase==="INITIAL"?'"v1"':'"v2"'}});
  };
  const checkpoints=async()=>{const [source]=await db.select().from(contentSources).where(eq(contentSources.id,id));return Object.values((source.metadata as any)[api?"apiCheckpoints":"feedCheckpoints"]??{}) as Array<{etag:string}>;};
  try{
   const first=await runSourceCollection(actor,id);assert.equal(first.status,"SUCCEEDED");assert.equal((await checkpoints())[0].etag,'"v1"');
   phase="BROKEN_COMMIT";await assert.rejects(runSourceCollection(actor,id));assert.equal((await checkpoints())[0].etag,'"v1"',"FAILED_RAW_WRITE_DOES_NOT_ADVANCE");
   if(api){
    phase="INVALID_JSON";await assert.rejects(runSourceCollection(actor,id));assert.equal((await checkpoints())[0].etag,'"v1"');
    phase="CAP";const capped=await runSourceCollection(actor,id);assert.equal((capped.metadata as any).apiIncremental.checkpointCommitted,false);assert.equal((await checkpoints())[0].etag,'"v1"');
   }
   phase="NOT_MODIFIED";const unchanged=await runSourceCollection(actor,id);assert.equal(unchanged.receivedCount,0);assert.equal((unchanged.metadata as any)[api?"apiIncremental":"feedIncremental"].disposition,"NOT_MODIFIED");assert.equal((await checkpoints())[0].etag,'"v1"');
   phase="BACKFILL";await runSourceCollection(actor,id,{backfillWindow:{from:new Date(Date.now()-3600000).toISOString(),to:new Date(Date.now()-1000).toISOString()}});assert.equal((await checkpoints())[0].etag,'"v1"');
   phase="QUALIFICATION";await runSourceCollection(actor,id,{qualificationOnly:true,provenance:{origin:"SYSTEM",collectionPurpose:"LATEST",runKind:"SOURCE_QUALIFICATION:INCREMENTAL_ACCEPTANCE"}});assert.equal((await checkpoints())[0].etag,'"v1"');
   await db.update(contentSources).set({collectionConfig:route("changed-route")}).where(eq(contentSources.id,id));
   phase="ISOLATION";await runSourceCollection(actor,id);assert.equal((await checkpoints()).length,2,"ROUTE_KEYS_ARE_ISOLATED");
   console.log("INCREMENTAL_TRANSPORT_DATABASE="+kind+":PASS");
  }finally{
   await db.delete(contentRawItems).where(eq(contentRawItems.sourceId,id));await db.delete(contentCollectionRuns).where(eq(contentCollectionRuns.sourceId,id));await db.delete(contentSources).where(eq(contentSources.id,id));
  }
 }
 }finally{globalThis.fetch=originalFetch;for(const key of keys){const value=saved.get(key);if(value===undefined)delete process.env[key];else process.env[key]=value;}}
 });assert.equal(locked.status,"COMPLETED");console.log("INCREMENTAL_TRANSPORTS_ACCEPTANCE=PASS;UPSTREAM=MOCK;DATABASE=DEVELOPMENT");
}
main().catch(error=>{console.error("INCREMENTAL_TRANSPORTS_ACCEPTANCE=FAILED;CODE="+String(error.code??error.name??"UNKNOWN")+";ASSERTION="+String(error.operator??"NONE")+";REASON="+(/^[A-Z0-9_:]+$/.test(error.message)?error.message:"REDACTED"));process.exitCode=1;}).finally(closeDatabase);
