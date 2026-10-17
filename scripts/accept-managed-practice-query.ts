import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {loadEnvConfig} from "@next/env";
import {eq,inArray} from "drizzle-orm";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {contentEvents,contentSources,contentExpansionRuns} from "../lib/server/db/schema";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
import {claimManagedPracticeQueryRun,runEventExpansion} from "../lib/server/content/collection-expansion";
import {PRACTICE_DISCOVERY_PURPOSE} from "../lib/server/content/practice-discovery-policy";
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes("--confirm=MANAGED-QUERY-DEVELOPMENT"));assert.equal(assertCurrentDatabaseTarget().environment,"development");
 const locked=await withSourceCollectionCycleLock(async()=>{
 const db=getDatabase(),sourceId="source_accept_query_"+randomUUID().replaceAll("-",""),events=[randomUUID(),randomUUID(),randomUUID(),randomUUID()];
 const actor={id:randomUUID(),email:"managed-query-acceptance@example.invalid",displayName:null,role:"ADMIN" as const};
 let calls=0;
 try{
  await db.insert(contentSources).values({id:sourceId,name:"Managed query fixture",sourceType:"MANAGED_SOURCE",platform:"BILIBILI",collectionMethod:"SEARCH",providerRef:sourceId,canonicalUrl:"https://search.bilibili.com/all",collectionConfig:{provider:"BILIBILI_SEARCH",practiceExpansionEnabled:true,acquisition:{routes:[{id:"fixture",role:"PRIMARY",kind:"SEARCH_DISCOVERY"}]}},metadata:{currentPortfolio:true,runtimeQualification:{effectiveQualification:"CONDITIONAL"},sourceRegistry:{owner:"SOURCE_MANAGEMENT",executionScope:"EVENT_EXPANSION"}},signalConfig:{signalOnly:true}});
  for(const id of events)await db.insert(contentEvents).values({id,fingerprint:id,title:"ComfyUI Fixture"+id.replaceAll("-",""),summary:"AI workflow tutorial fixture",eventAt:new Date(),metadata:{eventPolicy:{aiRelevant:true}}});
  const invoke=()=>runEventExpansion(actor,events[0],{purpose:PRACTICE_DISCOVERY_PURPOSE,managedSourceId:sourceId,maxQueries:3,resultLimit:5,expansionTypes:["EXPERIENCE","TUTORIAL","USE_CASE"]},{fetchJson:async url=>{assert.equal(new URL(url).hostname,"api.bilibili.com");calls++;return {code:0,data:{result:[]}};}});
  const first=await invoke();assert.equal(first.summary.total,2);assert.equal(calls,2);assert.equal(first.managedSearch?.stopReason,"PLAN_NO_NEW_REFERENCES");
  assert.equal((await invoke()).summary.total,0);assert.equal(calls,2,"RESTART_REUSES_PERSISTENT_STOP");
  await db.update(contentEvents).set({summary:"New material fixture B"}).where(eq(contentEvents.id,events[0]));assert.equal((await invoke()).summary.total,2);
  await db.update(contentEvents).set({summary:"New material fixture C"}).where(eq(contentEvents.id,events[0]));assert.equal((await invoke()).summary.total,2);
  await db.update(contentEvents).set({summary:"New material fixture D"}).where(eq(contentEvents.id,events[0]));const capped=await invoke();assert.equal(capped.managedSearch?.stopReason,"DAILY_QUERY_LIMIT");assert.equal(calls,6,"INPUT_CHANGES_CANNOT_ESCAPE_DAILY_CAP");
  const values=(eventId:string,query:string)=>({eventId,sourceId,query,provider:"BILIBILI_SEARCH",windowHours:168,resultLimit:5,status:"RUNNING",metadata:{purpose:PRACTICE_DISCOVERY_PURPOSE}});
  const concurrent=await Promise.all([claimManagedPracticeQueryRun(values(events[1],"first"),"plan"),claimManagedPracticeQueryRun(values(events[1],"first"),"plan")]);
  assert.equal(concurrent.filter(x=>x.run).length,1,"CONCURRENT_CLAIM_PERFORMS_ONE_REQUEST");assert(concurrent.some(x=>x.reason==="QUERY_LEASE_ACTIVE"));
  const active=concurrent.find(x=>x.run)!.run!;
  await db.update(contentExpansionRuns).set({status:"SUCCEEDED",createdCount:1,finishedAt:new Date()}).where(eq(contentExpansionRuns.id,active.id));
  assert.equal((await claimManagedPracticeQueryRun(values(events[1],"first"),"plan")).reason,"QUERY_ALREADY_COMPLETED");
  await db.update(contentExpansionRuns).set({status:"RUNNING",startedAt:new Date(Date.now()-16*60000)}).where(eq(contentExpansionRuns.id,active.id));
  assert((await claimManagedPracticeQueryRun(values(events[1],"second"),"plan")).run,"EXPIRED_LEASE_CAN_RESUME_WITHIN_BUDGET");
  await assert.rejects(claimManagedPracticeQueryRun({...values(events[3],"rollback"),id:active.id},"plan"));
  assert((await claimManagedPracticeQueryRun(values(events[3],"after-rollback"),"plan")).run,"FAILED_INSERT_ROLLS_BACK_QUERY_SLOT");
  const failed=await claimManagedPracticeQueryRun(values(events[2],"failure"),"plan");assert(failed.run);
  await db.update(contentExpansionRuns).set({status:"FAILED",finishedAt:new Date()}).where(eq(contentExpansionRuns.id,failed.run.id));
  assert.equal((await claimManagedPracticeQueryRun(values(events[2],"other"),"changed-plan")).reason,"PROVIDER_BACKOFF");
  await db.update(contentSources).set({enabled:false}).where(eq(contentSources.id,sourceId));assert.equal((await claimManagedPracticeQueryRun(values(events[2],"other"),"plan")).reason,"MANAGED_SEARCH_SOURCE_NOT_READY");
  const [source]=await db.select().from(contentSources).where(eq(contentSources.id,sourceId));assert.equal(source.enabled,false);
  console.log("MANAGED_PRACTICE_QUERY_DATABASE=PASS;DATABASE=DEVELOPMENT;UPSTREAM=MOCK;PAID_CALLS=0");
 }finally{
  await db.delete(contentEvents).where(inArray(contentEvents.id,events));await db.delete(contentSources).where(eq(contentSources.id,sourceId));
 }
 });assert.equal(locked.status,"COMPLETED");
}
main().catch(error=>{console.error("MANAGED_QUERY_DATABASE=FAILED;CODE="+String(error.cause?.code??error.code??error.name??"UNKNOWN")+";ASSERTION="+String(error.operator??"NONE")+";REASON="+(/^[A-Z0-9_:]+$/.test(error.message)?error.message:"REDACTED"));console.error(String(error.stack??"").split("\n").filter((line:string)=>/^\s+at /.test(line)).slice(0,3).join("\n"));process.exitCode=1;}).finally(closeDatabase);
