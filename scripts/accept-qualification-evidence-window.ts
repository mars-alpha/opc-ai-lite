import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {loadEnvConfig} from "@next/env";
import {eq} from "drizzle-orm";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {contentSources,contentCollectionRuns} from "../lib/server/db/schema";
import {listSourceQualificationSnapshots} from "../lib/server/content/source-qualification";
import {buildQualificationCheckpoint,refreshSourceRuntimeQualification,SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION} from "../lib/server/content/source-qualification-runtime";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes("--confirm=QUALIFICATION-EVIDENCE-DEVELOPMENT"));assert.equal(assertCurrentDatabaseTarget().environment,"development");
 const locked=await withSourceCollectionCycleLock(async()=>{
  const db=getDatabase(),id="source_accept_evidence_"+randomUUID().replaceAll("-",""),now=Date.now();
  try{
   const [source]=await db.insert(contentSources).values({id,name:"Qualification evidence fixture",sourceType:"OFFICIAL",platform:"WEB",collectionMethod:"RSS",canonicalUrl:"https://example.invalid/feed",collectionConfig:{acquisition:{routes:[{id:"primary",role:"PRIMARY",kind:"RSS_ATOM",url:"https://example.invalid/feed"}]}},metadata:{acceptanceOnly:true,currentPortfolio:true}}).returning();
   const checkpoint=buildQualificationCheckpoint({...source,sourceId:id}).checkpoint;
   const add=async(status:string,minute:number,metadata:Record<string,unknown>={})=>db.insert(contentCollectionRuns).values({sourceId:id,sourceName:source.name,collectionMethod:"RSS",status,startedAt:new Date(now-minute*60000),finishedAt:new Date(),metadata:{collectionOrigin:"SYSTEM",collectionRuntimeVersion:SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION,qualificationCheckpoint:checkpoint,acquisitionRouteId:"primary",...metadata}});
   await add("SUCCEEDED",60);
   for(let i=0;i<13;i++)await add("SUCCEEDED",i+1,{qualificationCheckpoint:"old"});
   await add("SUCCEEDED",14,{collectionRuntimeVersion:"old"});await add("SUCCEEDED",15,{qualificationOnly:true});await add("SUCCEEDED",16,{collectionOrigin:"ADMIN"});await add("SUCCEEDED",17,{staleRunRecovery:{excludeFromRuntimeQualification:true}});await add("SUCCEEDED",-60);await add("SUCCEEDED",181*1440);
   const [early]=await listSourceQualificationSnapshots([id]);assert.equal(early.evidence.liveRunCount,1,"CURRENT_RUN_NOT_CROWDED_OUT");assert.notEqual(early.qualification,"AUTO_READY");
   for(let i=0;i<4;i++)await add("SUCCEEDED",61+i);
   const [mature]=await listSourceQualificationSnapshots([id]);assert.equal(mature.evidence.liveRunCount,5);assert.equal(mature.evidence.successfulLiveRunCount,5);assert.equal(mature.qualification,"AUTO_READY");
   for(let i=0;i<6;i++)await add("FAILED",30+i);
   const failure=await refreshSourceRuntimeQualification(id,"AUTO_READY");assert.equal(failure.effectiveQualification,"DISABLED","CURRENT_FAILURES_NOT_MASKED_BY_NOISE");assert.equal(failure.consecutiveFailures,6);assert.equal(failure.recentProductionStatuses.length,6);
   const [disabled]=await listSourceQualificationSnapshots([id]);assert.equal(disabled.qualification,"DISABLED");assert.equal(disabled.evidence.successfulLiveRunCount,0,"READ_WINDOW_MATCHES_RUNTIME_EVIDENCE");
   await add("SUCCEEDED",0.1);const sticky=await refreshSourceRuntimeQualification(id,"AUTO_READY");assert.equal(sticky.effectiveQualification,"DISABLED","EXISTING_RECERTIFICATION_GATE_PRESERVED");assert.equal(sticky.consecutiveFailures,0);
   const [untouched]=await db.select().from(contentSources).where(eq(contentSources.id,id));assert.equal(untouched.status,"ACTIVE");assert.equal(untouched.enabled,true);assert.equal(untouched.canonicalUrl,source.canonicalUrl);
   console.log("QUALIFICATION_EVIDENCE_DATABASE=PASS;DATABASE=DEVELOPMENT;NETWORK_CALLS=0");
  }finally{await db.delete(contentCollectionRuns).where(eq(contentCollectionRuns.sourceId,id));await db.delete(contentSources).where(eq(contentSources.id,id));}
 });assert.equal(locked.status,"COMPLETED");
}
main().catch(error=>{console.error("QUALIFICATION_EVIDENCE_DATABASE=FAILED;CODE="+String(error.code??error.name??"UNKNOWN")+";ASSERTION="+String(error.operator??"NONE")+";REASON="+(/^[A-Z0-9_:]+$/.test(error.message)?error.message:"REDACTED"));process.exitCode=1;}).finally(closeDatabase);
