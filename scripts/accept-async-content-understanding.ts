import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {loadEnvConfig} from "@next/env";
import {eq,sql} from "drizzle-orm";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {contentSources,contentRawItems,aiRuns} from "../lib/server/db/schema";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
import {SOURCE_ONBOARDING_VERSION} from "../lib/server/content/source-onboarding";
import {runContentUnderstandingCycle} from "../lib/server/content/content-understanding-runtime";
import {buildContentPresentationEnrichment} from "../lib/server/content/presentation-enrichment";
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes("--confirm=ASYNC-UNDERSTANDING-DEVELOPMENT"));assert.equal(assertCurrentDatabaseTarget().environment,"development");
 const locked=await withSourceCollectionCycleLock(async()=>{
  const db=getDatabase(),id="source_accept_understanding_"+randomUUID().replaceAll("-",""),rawId=randomUUID();
  const config={baseUrl:"https://model.invalid",apiKey:"fixture",model:"fixture",provider:"fixture",thinkingControl:"enable_thinking" as const};
  const savedFlag=process.env.OPC_COLLECTION_CONTENT_UNDERSTANDING;delete process.env.OPC_COLLECTION_CONTENT_UNDERSTANDING;
  let calls=0,mode="GOOD",revision=0;
  const raw=async()=>{const [row]=await db.select().from(contentRawItems).where(eq(contentRawItems.id,rawId));return row;};
  const job=async()=>((await raw()).metadata as any).contentUnderstandingJob;
  const change=async()=>{revision++;await db.update(contentRawItems).set({excerpt:"OpenAI coding tool API update "+"notes ".repeat(revision)}).where(eq(contentRawItems.id,rawId));};
  const output={itemType:"product_launch",authorRole:"principal",tags:["产品更新","编码"],titleZh:"OpenAI 发布编码工具",summaryZh:"OpenAI 发布编码工具，提供 API。",editorialJudgment:"可了解编码工具的功能与接口。",fact:null,uncertainties:[]};
  const invoke=()=>runContentUnderstandingCycle({rawItemIds:[rawId]},{config,fetchImpl});
  const fetchImpl:typeof fetch=async(_url,init)=>{
   calls++;assert.equal(String(_url),"https://model.invalid/chat/completions");
   const body=JSON.parse(String(init?.body));assert.equal(body.max_tokens,1800);assert.equal(body.enable_thinking,false);
   assert.equal(body.messages[0].content.includes("不要全文翻译"),true);
   if(mode==="CHANGE")await change();
   if(mode==="METADATA")await db.update(contentRawItems).set({metadata:sql`${contentRawItems.metadata} || '{"operatorNote":"new"}'::jsonb`}).where(eq(contentRawItems.id,rawId));
   if(mode==="CONCURRENT"){const other=await invoke();assert.equal(other.enriched,0);}
   if(mode==="DISABLE")await db.update(contentSources).set({enabled:false}).where(eq(contentSources.id,id));
   if(mode==="NEW_LEASE")await db.update(contentRawItems).set({metadata:sql`jsonb_set(${contentRawItems.metadata},'{contentUnderstandingJob,jobId}','"new-owner"'::jsonb)`}).where(eq(contentRawItems.id,rawId));
   if(mode==="REPAIR_NETWORK" && JSON.parse(body.messages[1].content).invalidOutput)throw new Error("fixture network failure");
   return Response.json({choices:[{message:{content:mode==="BAD_JSON"?"invalid":JSON.stringify(mode==="REPAIR_NETWORK"?{...output,summaryZh:"OpenAI tool improves 90%."}:output)}}],usage:{prompt_tokens:100,completion_tokens:50,total_tokens:150}});
  };
  try{
   await db.insert(contentSources).values({id,name:"OpenAI",sourceType:"OFFICIAL",platform:"WEB",collectionMethod:"RSS",canonicalUrl:"https://example.org/fixture",collectionConfig:{acquisition:{routes:[{id:"fixture",role:"PRIMARY",kind:"RSS_ATOM",url:"https://example.org/feed"}]}},metadata:{sourceOnboarding:{version:SOURCE_ONBOARDING_VERSION},sourceRegistry:{owner:"SOURCE_MANAGEMENT"},acceptanceOnly:true}});
   await db.insert(contentRawItems).values({id:rawId,sourceId:id,platform:"WEB",externalId:rawId,title:"OpenAI releases a coding tool",excerpt:"OpenAI releases a coding tool with an API.",originalUrl:"https://example.org/"+rawId,contentHash:rawId,author:"OpenAI",publishedAt:new Date(),collectedAt:new Date(Date.now()-60000),metadata:{collectionOrigin:"SYSTEM",operatorNote:"preserve",fullText:"OpenAI releases a coding tool with an API. ".repeat(10)}});
   assert.equal((await invoke()).enriched,1);assert.equal(calls,1);
   let state=await job(),row=await raw();assert.equal((row.metadata as any).operatorNote,"preserve");assert.equal((row.metadata as any).contentUnderstanding.fullTextTranslationStatus,"NOT_REQUESTED");
   const [run]=await db.select().from(aiRuns).where(eq(aiRuns.id,state.aiRunId));assert.equal((run.validatorResult as any).usage[0].totalTokens,150);assert.equal(run.status,"SUCCEEDED");
   assert.equal(buildContentPresentationEnrichment({eventTitle:row.title,eventSummary:null,representativeRaw:row}).displayTitleZh,output.titleZh,"CURRENT_UNDERSTANDING_DISPLAYED");
   await invoke();assert.equal(calls,1,"SAME_REVISION_AFTER_RESTART_DOES_NOT_RECALL");
   await db.update(contentRawItems).set({metadata:sql`${contentRawItems.metadata} || '{"other":"metadata"}'::jsonb`}).where(eq(contentRawItems.id,rawId));await invoke();assert.equal(calls,1);
   await change();mode="CHANGE";assert.equal((await invoke()).stale,1);row=await raw();assert.notEqual((row.metadata as any).contentUnderstanding.inputHash,(await job()).inputHash);
   const presentation=buildContentPresentationEnrichment({eventTitle:row.title,eventSummary:null,representativeRaw:row});assert.equal(presentation.displayTitleZh,row.title,"STALE_UNDERSTANDING_NOT_DISPLAYED");
   mode="GOOD";assert.equal((await invoke()).enriched,1);
   await change();mode="METADATA";assert.equal((await invoke()).enriched,1);assert.equal(((await raw()).metadata as any).operatorNote,"new","CONCURRENT_OTHER_METADATA_PRESERVED");
   await change();mode="BAD_JSON";assert.equal((await invoke()).failed,1);const failedCalls=calls;state=await job();const [failedRun]=await db.select().from(aiRuns).where(eq(aiRuns.id,state.aiRunId));assert.equal((failedRun.validatorResult as any).usage[0].totalTokens,150,"BILLED_INVALID_JSON_USAGE_RETAINED");
   await invoke();assert.equal(calls,failedCalls,"FAILURE_BACKOFF");
   const blockedBefore=await job();
   await db.update(contentRawItems).set({metadata:sql`${contentRawItems.metadata} || '{"bodyText":"unused body changed"}'::jsonb`}).where(eq(contentRawItems.id,rawId));
   await invoke();const blockedAfter=await job();assert.equal(calls,failedCalls);assert.equal(blockedAfter.nextRetryAt,blockedBefore.nextRetryAt);assert.notEqual(blockedAfter.materialRevision,blockedBefore.materialRevision,"UNCHANGED_INPUT_SYNC_REVISION_DURING_BACKOFF_PREVENTS_WINDOW_STARVATION");
   await db.update(contentRawItems).set({metadata:sql`jsonb_set(${contentRawItems.metadata},'{contentUnderstandingJob,nextRetryAt}',${JSON.stringify(new Date(Date.now()-1000).toISOString())}::jsonb)`}).where(eq(contentRawItems.id,rawId));mode="GOOD";assert.equal((await invoke()).enriched,1);
   await change();mode="REPAIR_NETWORK";assert.equal((await invoke()).failed,1);state=await job();
   const [partialUsage]=await db.select().from(aiRuns).where(eq(aiRuns.id,state.aiRunId));assert.equal((partialUsage.validatorResult as any).requestAttempts,2);assert.equal((partialUsage.validatorResult as any).usage.length,1);assert.equal((partialUsage.validatorResult as any).usageStatus,"UNKNOWN","REPAIR_NETWORK_OUTCOME_NOT_COUNTED_AS_FULLY_REPORTED");
   await change();mode="CONCURRENT";const before=calls;assert.equal((await invoke()).enriched,1);assert.equal(calls,before+1,"CONCURRENT_DUPLICATE_DOES_NOT_RECALL");
   state=await job();
   await db.update(contentRawItems).set({metadata:sql`jsonb_set(${contentRawItems.metadata},'{contentUnderstandingJob}',${JSON.stringify({...state,status:"RUNNING",nextRetryAt:new Date(Date.now()-1000).toISOString()})}::jsonb)`}).where(eq(contentRawItems.id,rawId));
   await db.update(aiRuns).set({status:"RUNNING"}).where(eq(aiRuns.id,state.aiRunId));mode="GOOD";assert.equal((await invoke()).enriched,1);
   const [abandoned]=await db.select().from(aiRuns).where(eq(aiRuns.id,state.aiRunId));assert.equal(abandoned.status,"ABANDONED");assert.equal(abandoned.errorCode,"PROVIDER_OUTCOME_UNKNOWN");
   await change();mode="NEW_LEASE";assert.equal((await invoke()).stale,1);assert.equal((await job()).jobId,"new-owner","OLD_LEASE_CANNOT_OVERWRITE_NEW_OWNER");
   await change();mode="DISABLE";assert.equal((await invoke()).stale,1);const [disabled]=await db.select().from(contentSources).where(eq(contentSources.id,id));assert.equal(disabled.enabled,false);
   console.log("ASYNC_UNDERSTANDING_DATABASE=PASS;MODEL=MOCK;DATABASE=DEVELOPMENT;PAID_CALLS=0");
  }finally{
   if(savedFlag===undefined)delete process.env.OPC_COLLECTION_CONTENT_UNDERSTANDING;else process.env.OPC_COLLECTION_CONTENT_UNDERSTANDING=savedFlag;
   await db.delete(aiRuns).where(sql`${aiRuns.evidenceIds} @> ${JSON.stringify([rawId])}::jsonb`);
   await db.delete(contentRawItems).where(eq(contentRawItems.id,rawId));await db.delete(contentSources).where(eq(contentSources.id,id));
  }
 });assert.equal(locked.status,"COMPLETED");
}
main().catch(error=>{console.error("ASYNC_UNDERSTANDING_DATABASE=FAILED;CODE="+String(error.code??error.name??"UNKNOWN")+";ASSERTION="+String(error.operator??"NONE")+";REASON="+(/^[A-Z0-9_:]+$/.test(error.message)?error.message:"REDACTED"));process.exitCode=1;}).finally(closeDatabase);
