import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {loadEnvConfig} from "@next/env";
import {and,eq,or} from "drizzle-orm";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {contentEvents,contentSources,contentRawItems,contentAuditRecords,contentExpansionRuns,users} from "../lib/server/db/schema";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
import {registerManagedPracticeSearch} from "../lib/server/content/managed-practice-search";
import {runEventExpansion,isManagedPracticeSearchReady} from "../lib/server/content/collection-expansion";
import {PRACTICE_DISCOVERY_PURPOSE} from "../lib/server/content/practice-discovery-policy";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes("--confirm=BRAVE-SEARCH-DEVELOPMENT"));assert.equal(assertCurrentDatabaseTarget().environment,"development");
 const savedFetch=globalThis.fetch,keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OPC_COLLECTION_BRAVE_SEARCH"],saved=new Map(keys.map(k=>[k,process.env[k]]));
 try{
  const locked=await withSourceCollectionCycleLock(async()=>{
   const db=getDatabase(),sourceId="source_operator_practice_brave",eventId=randomUUID(),secondEventId=randomUUID();let ownsSource=false,calls=0,mode="PROBE";
   assert.equal((await db.select().from(contentSources).where(or(eq(contentSources.id,sourceId),eq(contentSources.providerRef,"BRAVE_SEARCH")))).length,0,"EXISTING_SOURCE_MUST_NOT_BE_MODIFIED_BY_FIXTURE");
   const [admin]=await db.select().from(users).where(eq(users.role,"ADMIN")).limit(1);assert(admin);
   const actor={id:admin.id,email:"brave-acceptance@example.invalid",displayName:null,role:"ADMIN" as const};
   process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://relay.example.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture";
   globalThis.fetch=async(input,init)=>{
    if(String(input)==="https://relay.example.invalid/v1/collect")return handleRelayRequest(new Request(String(input),init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture",BRAVE_SEARCH_API_KEY:"mock-only"});
    assert.equal(new URL(String(input)).hostname,"api.search.brave.com");calls++;
    return Response.json({web:{results:mode==="PROBE"?[{title:"ComfyUI fixture tutorial "+eventId,url:`https://fixture.example.com/${eventId}`,description:"Step by step public ComfyUI workflow materials fixture"}]:mode==="NONEMPTY"?[{title:"ComfyUI Fixture"+eventId.replaceAll("-","")+" tutorial workflow",url:`https://fixture.example.com/${eventId}/tutorial`,description:"Step by step ComfyUI workflow tutorial: load model, connect nodes, run generation and export image. Public workflow materials and examples."}]:[]}});
   };
   try{
    delete process.env.OPC_COLLECTION_BRAVE_SEARCH;await assert.rejects(registerManagedPracticeSearch(actor,"BRAVE_SEARCH"),/BRAVE_SEARCH_RELAY_UNAVAILABLE/);assert.equal(calls,0);
    process.env.OPC_COLLECTION_BRAVE_SEARCH="v1";
    const registered=await registerManagedPracticeSearch(actor,"BRAVE_SEARCH");ownsSource=true;assert.equal(registered.sourceId,sourceId);assert.equal(registered.ingested,1);
    const [source]=await db.select().from(contentSources).where(eq(contentSources.id,sourceId));assert(isManagedPracticeSearchReady(source));assert.equal(source.authorityScore,0);
    const raws=await db.select().from(contentRawItems).where(eq(contentRawItems.sourceId,sourceId));assert.equal(raws.length,1);assert.equal(raws[0].publishedAt,null);assert.equal((raws[0].metadata as any).bodyStatus,"SEARCH_SNIPPET_ONLY");assert.equal((raws[0].metadata as any).factualSource,false);
    assert.equal((await db.select().from(contentAuditRecords).where(eq(contentAuditRecords.entityId,sourceId))).length,1);
    mode="EMPTY";await db.insert(contentEvents).values({id:eventId,fingerprint:eventId,title:"ComfyUI Fixture"+eventId.replaceAll("-",""),summary:"AI workflow tutorial fixture",eventAt:new Date(),metadata:{eventPolicy:{aiRelevant:true}}});
    const invoke=(id=eventId)=>runEventExpansion(actor,id,{purpose:PRACTICE_DISCOVERY_PURPOSE,managedSourceId:sourceId,maxQueries:3,resultLimit:5,expansionTypes:["EXPERIENCE","TUTORIAL","USE_CASE"]});
    assert.equal((await invoke()).summary.total,2);assert.equal((await invoke()).summary.total,0);assert.equal(calls,3,"PROBE_PLUS_TWO_EMPTY_QUERIES_THEN_PERSISTENT_STOP");
    assert.equal((await db.select().from(contentExpansionRuns).where(eq(contentExpansionRuns.eventId,eventId))).length,2);
    mode="NONEMPTY";await db.insert(contentEvents).values({id:secondEventId,fingerprint:secondEventId,title:"ComfyUI Fixture"+eventId.replaceAll("-",""),summary:"AI workflow tutorial fixture",eventAt:new Date(),metadata:{eventPolicy:{aiRelevant:true}}});
    assert.equal((await invoke(secondEventId)).summary.created,1,"NONEMPTY_SEARCH_TRAVERSES_QUALITY_RELEVANCE_GATES_TO_RAW");
    const discovered=await db.select().from(contentRawItems).where(eq(contentRawItems.sourceId,sourceId));assert.equal(discovered.length,2);assert(discovered.every(raw=>raw.publishedAt===null && (raw.metadata as any).referenceOnly===true && (raw.metadata as any).factualSource===false));
    await db.update(contentSources).set({enabled:false}).where(eq(contentSources.id,sourceId));
    await assert.rejects(registerManagedPracticeSearch(actor,"BRAVE_SEARCH"),/MANAGED_SEARCH_REQUIRES_OPERATOR_RESTORE/);
    await assert.rejects(invoke(),/MANAGED_SEARCH_SOURCE_NOT_READY/);
    assert.equal((await db.select().from(contentSources).where(eq(contentSources.id,sourceId)))[0].enabled,false);
    console.log("BRAVE_SEARCH_DATABASE=PASS;DATABASE=DEVELOPMENT;UPSTREAM=MOCK;PAID_CALLS=0");
   }finally{
    await db.delete(contentEvents).where(eq(contentEvents.id,eventId));
    await db.delete(contentEvents).where(eq(contentEvents.id,secondEventId));
    if(ownsSource){await db.delete(contentAuditRecords).where(and(eq(contentAuditRecords.entityId,sourceId),eq(contentAuditRecords.actorEmail,actor.email)));await db.delete(contentRawItems).where(eq(contentRawItems.sourceId,sourceId));await db.delete(contentSources).where(eq(contentSources.id,sourceId));}
   }
  });assert.equal(locked.status,"COMPLETED");
 }finally{globalThis.fetch=savedFetch;for(const k of keys){const v=saved.get(k);if(v===undefined)delete process.env[k];else process.env[k]=v;}}
}
main().catch(error=>{console.error("BRAVE_SEARCH_DATABASE=FAILED;CODE="+String(error.cause?.code??error.code??error.name??"UNKNOWN")+";ASSERTION="+String(error.operator??"NONE")+";REASON="+(/^[A-Z0-9_:]+$/.test(error.message)?error.message:"REDACTED"));console.error(String(error.stack??"").split("\n").filter((line:string)=>/^\s+at /.test(line)).slice(0,3).join("\n"));process.exitCode=1;}).finally(closeDatabase);
