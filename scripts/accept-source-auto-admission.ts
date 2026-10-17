import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {loadEnvConfig} from "@next/env";
import {eq,inArray} from "drizzle-orm";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {contentSources,contentRawItems,contentCollectionRuns,contentAuditRecords,users} from "../lib/server/db/schema";
import {runSourceAutoAdmissionCycle} from "../lib/server/content/source-auto-admission";
import {registerOnboardedSource,SOURCE_ONBOARDING_VERSION} from "../lib/server/content/source-onboarding";
import {SOURCE_AUTO_ADMISSION_VERSION} from "../lib/server/content/source-auto-admission-policy";
import {listSourceQualificationSnapshots} from "../lib/server/content/source-qualification";
import {buildQualificationCheckpoint,SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION} from "../lib/server/content/source-qualification-runtime";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes("--confirm=SOURCE-ADMISSION-DEVELOPMENT"));assert.equal(assertCurrentDatabaseTarget().environment,"development");
 const locked=await withSourceCollectionCycleLock(async()=>{
 const db=getDatabase(),token=randomUUID().replaceAll("-",""),parentId="source_accept_admission_"+token;
 const [admin]=await db.select().from(users).where(eq(users.role,"ADMIN")).limit(1);assert(admin);
 const actor={id:admin.id,email:"source-admission-acceptance@example.invalid",displayName:null,role:"ADMIN" as const};
 const existing=await db.select().from(contentSources);
 const root=["https://til.simonwillison.net/","https://blog.comfy.org/"].find(url=>!existing.some(source=>{try{return new URL(source.canonicalUrl!).href===url;}catch{return false;}}));
 assert(root,"UNUSED_FIXED_RELAY_HOMEPAGE_REQUIRED_FOR_NONDESTRUCTIVE_TEST");
 const feed=root+"acceptance-feed-"+token;
 const originalFetch=globalThis.fetch,envKeys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES","OPC_COLLECTION_SOURCE_ADMISSION"];
 const oldEnv=new Map(envKeys.map(key=>[key,process.env[key]]));
 const rawIds:string[]=[],createdSources:string[]=[];
 let requests=0,upstreamFailure=false;
 await db.insert(contentSources).values({id:parentId,name:"Source admission fixture",sourceType:"MANAGED_SOURCE",collectionMethod:"RSS",canonicalUrl:"https://example.invalid/"+token,metadata:{sourceOnboarding:{version:SOURCE_ONBOARDING_VERSION},sourceRegistry:{owner:"SOURCE_MANAGEMENT"},currentPortfolio:true}});
 const makeRaw=async(suffix:string,claimed=false)=>{
  const id=randomUUID(),url=root+"admission-test-"+token+suffix,contentHash=token+suffix;
  const sourceAdmission=claimed?{version:SOURCE_AUTO_ADMISSION_VERSION,jobId:randomUUID(),originalUrl:url,homepageUrl:root,contentHash,status:"RUNNING",lastAttemptAt:new Date().toISOString(),nextRetryAt:new Date(Date.now()+900000).toISOString()}:undefined;
  await db.insert(contentRawItems).values({id,sourceId:parentId,platform:"WEB",title:"AI workflow source fixture",originalUrl:url,contentHash,metadata:{collectionOrigin:"SYSTEM",...(sourceAdmission?{sourceAdmission}:{})}});rawIds.push(id);
  return {id,url,discovery:{rawItemId:id,jobId:sourceAdmission?.jobId??"unclaimed",pageUrl:url,homepageUrl:root,observedAt:new Date().toISOString()}};
 };
 try{
  process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://relay.example.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture-only";process.env.OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES="v2";process.env.OPC_COLLECTION_SOURCE_ADMISSION="on";
  globalThis.fetch=async(input,init)=>{
   assert.equal(String(input),"https://relay.example.invalid/v1/collect","ONLY_MOCK_RELAY_ALLOWED");requests++;
   const payload=JSON.parse(String(init?.body));assert.equal(payload.provider,"PUBLIC_SOURCE_DOCUMENT");
   if(upstreamFailure)return Response.json({error:"RELAY_UPSTREAM_HTTP_503"},{status:503});
   const url=payload.searchQuery;
   const body=url===feed?`<rss><channel><item><title>AI workflow guide</title><link>${root}test-workflow</link><pubDate>${new Date(Date.now()-60000).toUTCString()}</pubDate></item></channel></rss>`:url===root?`<html><link rel="alternate" type="application/rss+xml" href="${feed}"><a href="/">Home</a></html>`:'<html><a href="/">Home</a></html>';
   return Response.json({status:200,url,text:body,contentType:url===feed?"application/rss+xml":"text/html"});
  };
  // The source insert and its audit are one transaction: an invalid actor rolls both back.
  const proof=await makeRaw("rollback",true);
  await assert.rejects(registerOnboardedSource(actor,{url:root,kind:"WEBSITE"},{automaticDiscovery:{...proof.discovery,jobId:randomUUID()}}),/PROVENANCE_REQUIRED/,"STALE_LEASE_CANNOT_REGISTER");
  await assert.rejects(registerOnboardedSource({...actor,id:"00000000-0000-0000-0000-000000000000"},{url:root,kind:"WEBSITE"},{automaticDiscovery:proof.discovery}));
  assert.equal((await db.select().from(contentSources).where(eq(contentSources.canonicalUrl,root))).length,0,"FAILED_AUDIT_ROLLS_BACK_SOURCE");
  const second=await makeRaw("parallel",true);
  const concurrent=await Promise.all([proof,second].map(raw=>registerOnboardedSource(actor,{url:root,kind:"WEBSITE"},{automaticDiscovery:raw.discovery})));
  createdSources.push(concurrent[0].id);assert.equal(concurrent[0].id,concurrent[1].id,"CONCURRENT_DISCOVERY_HAS_ONE_LOGICAL_SOURCE");
  const source=concurrent[0];assert.equal((source.metadata as any).factualSource,false);assert.equal((source.metadata as any).sourceQualification.qualification,"CONDITIONAL");
  assert.equal((source.metadata as any).sourceRegistry.admissionMode,"AUTOMATIC");
  const candidate=await makeRaw("cycle");
  const cycle=await runSourceAutoAdmissionCycle(actor,{rawItemIds:[candidate.id]});assert.equal(cycle.failed,0);assert.equal(cycle.results[0]?.status,"EXISTING");
  const before=requests;const repeat=await runSourceAutoAdmissionCycle(actor,{rawItemIds:[candidate.id]});assert.equal(repeat.processed,0);assert.equal(requests,before,"ACKNOWLEDGED_INPUT_NOT_REPROBED");
  const late=await makeRaw("late");const budget=await runSourceAutoAdmissionCycle(actor,{rawItemIds:[late.id],budgetMs:34000});assert.equal(budget.processed,0);assert.equal(requests,before,"NO_NEW_PROBE_AFTER_TIME_SLICE");
  upstreamFailure=true;
  const failed=await runSourceAutoAdmissionCycle(actor,{rawItemIds:[late.id]});assert.equal(failed.failed,1);
  const failedRequests=requests;assert.equal((await runSourceAutoAdmissionCycle(actor,{rawItemIds:[late.id]})).processed,0);assert.equal(requests,failedRequests,"FAILED_PROBE_BACKOFF_PERSISTED");upstreamFailure=false;
  const checkpoint=buildQualificationCheckpoint({...source,sourceId:source.id});
  for(let i=0;i<5;i++)await db.insert(contentCollectionRuns).values({sourceId:source.id,sourceName:source.name,collectionMethod:"RSS",status:"SUCCEEDED",startedAt:new Date(Date.now()-(i+1)*900000),finishedAt:new Date(),metadata:{collectionOrigin:"SYSTEM",collectionRuntimeVersion:SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION,qualificationCheckpoint:i===0?checkpoint.checkpoint:"old-route",acquisitionRouteId:"primary"}});
  const [early]=await listSourceQualificationSnapshots([source.id]);assert.equal(early.evidence.liveRunCount,1);assert.notEqual(early.qualification,"AUTO_READY","OLD_ROUTE_SUCCESSES_DO_NOT_MATURE_NEW_ROUTE");
  for(let i=0;i<4;i++)await db.insert(contentCollectionRuns).values({sourceId:source.id,sourceName:source.name,collectionMethod:"RSS",status:"SUCCEEDED",startedAt:new Date(Date.now()-(i+1)*60000),finishedAt:new Date(),metadata:{collectionOrigin:"SYSTEM",collectionRuntimeVersion:SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION,qualificationCheckpoint:checkpoint.checkpoint,acquisitionRouteId:"primary"}});
  const [mature]=await listSourceQualificationSnapshots([source.id]);assert.equal(mature.qualification,"AUTO_READY","CURRENT_CHECKPOINT_MATURES_WITHOUT_HUMAN_GATE");
  await db.update(contentSources).set({status:"ARCHIVED",enabled:false}).where(eq(contentSources.id,source.id));
  const archived=await makeRaw("archived");const blocked=await runSourceAutoAdmissionCycle(actor,{rawItemIds:[archived.id]});assert.equal(blocked.results[0]?.status,"BLOCKED_SOURCE");
  const [unchanged]=await db.select().from(contentSources).where(eq(contentSources.id,source.id));assert.equal(unchanged.status,"ARCHIVED");assert.equal(unchanged.enabled,false);
  await assert.rejects(registerOnboardedSource(actor,{url:root,kind:"WEBSITE"},{automaticDiscovery:{...proof.discovery,rawItemId:randomUUID()}}),/PROVENANCE_REQUIRED/);
  console.log("SOURCE_AUTO_ADMISSION_DATABASE_ACCEPTANCE=PASS;UPSTREAM=MOCK_RELAY");
 }finally{
  globalThis.fetch=originalFetch;
  for(const key of envKeys){const value=oldEnv.get(key);if(value===undefined)delete process.env[key];else process.env[key]=value;}
  const ownSources=await db.select().from(contentSources).where(eq(contentSources.canonicalUrl,root));
  const ids=[...new Set([parentId,...createdSources,...ownSources.filter(source=>(source.metadata as any).automaticDiscovery?.rawItemId && rawIds.includes((source.metadata as any).automaticDiscovery.rawItemId)).map(source=>source.id)])];
  await db.delete(contentAuditRecords).where(inArray(contentAuditRecords.entityId,[...ids,...rawIds]));
  await db.delete(contentRawItems).where(inArray(contentRawItems.sourceId,ids));
  await db.delete(contentCollectionRuns).where(inArray(contentCollectionRuns.sourceId,ids));
  await db.delete(contentSources).where(inArray(contentSources.id,ids));
 }
 });assert.equal(locked.status,"COMPLETED");
}
main().catch(error=>{console.error("SOURCE_AUTO_ADMISSION_DATABASE_ACCEPTANCE=FAILED;CODE="+String(error.code??error.name??"UNKNOWN")+";REASON="+(/^[A-Z0-9_:]+$/.test(error.message)?error.message:"REDACTED")+";ASSERTION="+String(error.operator??"NONE"));process.exitCode=1;}).finally(closeDatabase);
