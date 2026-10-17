import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {loadEnvConfig} from "@next/env";
import {eq,inArray,and} from "drizzle-orm";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {contentSources,contentEvents,contentRawItems,contentAuditRecords,users} from "../lib/server/db/schema";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
import {listDuePracticeMaterials,backfillPracticeMaterials} from "../lib/server/content/practice-material-backfill";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes("--confirm=PRACTICE-REFERENCE-DEVELOPMENT"));assert.equal(assertCurrentDatabaseTarget().environment,"development");
 const savedFetch=globalThis.fetch,envKeys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET"],saved=new Map(envKeys.map(k=>[k,process.env[k]]));
 try{
 const locked=await withSourceCollectionCycleLock(async()=>{
  const db=getDatabase(),sourceId="source_accept_body_"+randomUUID().replaceAll("-",""),events=[randomUUID(),randomUUID(),randomUUID(),randomUUID()],rawIds:string[]=[],now=new Date();
  const [admin]=await db.select().from(users).where(eq(users.role,"ADMIN")).limit(1);assert(admin);const actor={id:admin.id,email:"practice-body-acceptance@example.invalid",displayName:null,role:"ADMIN" as const};
  const baseMetadata={collectionOrigin:"SYSTEM",referenceOnly:true,factualSource:false,bodyStatus:"SEARCH_SNIPPET_ONLY",practiceDiscovery:{status:"PENDING_SOURCE_REVIEW",targetEventId:events[0]},operatorNote:"preserve"};
  const makeRaw=async(label:string,patch:Record<string,any>={})=>{
   const id=randomUUID();rawIds.push(id);await db.insert(contentRawItems).values({id,sourceId,platform:"WEB",originalUrl:"https://huggingface.co/blog/fixture-"+id,title:"Build AI workflow "+label,excerpt:"Search description only",contentHash:id,publishedAt:null,collectedAt:now,metadata:baseMetadata,...patch});return id;
  };
  const html='<html><head><title>Build an assistant</title></head><body><article><h1>Build an assistant</h1><p>Required input: notes and a local runtime.</p><h2>Step 1</h2><p>Install the package and configure input_file=notes.txt and output_file=report.md.</p><h2>Step 2</h2><p>Run the program and export the output report.</p><p>'+"This procedure reads the input documents and writes the result as an organized report. ".repeat(10)+'</p></article></body></html>';
  let mode="OK",mutateId="",calls=0;
  try{
   await db.insert(contentSources).values({id:sourceId,name:"Reference body fixture",sourceType:"MANAGED_SOURCE",platform:"WEB",providerRef:sourceId,collectionMethod:"SEARCH",metadata:{currentPortfolio:true,runtimeQualification:{effectiveQualification:"CONDITIONAL"},sourceRegistry:{executionScope:"EVENT_EXPANSION"}}});
   for(let i=0;i<events.length;i++)await db.insert(contentEvents).values({id:events[i],fingerprint:events[i],title:"AI event fixture",eventAt:new Date(now.getTime()+(i===1?-169*3600000:i===3?3600000:0)),archivedAt:i===2?now:null});
   const valid=await makeRaw("valid"),dated=await makeRaw("dated",{publishedAt:now,metadata:{}});
   await makeRaw("orphan",{metadata:{}});await makeRaw("missing-event",{metadata:{...baseMetadata,practiceDiscovery:{status:"PENDING_SOURCE_REVIEW",targetEventId:"not-a-uuid"}}});
   for(const [label,eventId] of [["old-event",events[1]],["archived-event",events[2]],["future-event",events[3]]] as const)await makeRaw(label,{metadata:{...baseMetadata,practiceDiscovery:{status:"PENDING_SOURCE_REVIEW",targetEventId:eventId}}});
   await makeRaw("old-collection",{collectedAt:new Date(now.getTime()-169*3600000)});await makeRaw("future-collection",{collectedAt:new Date(now.getTime()+3600000)});
   await makeRaw("untrusted-scope",{metadata:{...baseMetadata,referenceOnly:false}});await makeRaw("not-pending",{metadata:{...baseMetadata,practiceDiscovery:{status:"OTHER",targetEventId:events[0]}}});
   assert.deepEqual(new Set((await listDuePracticeMaterials(20,now,rawIds)).map(r=>r.raw.id)),new Set([valid,dated]),"DATED_AND_LINKED_UNDATED_REFERENCE_QUEUE_WITHOUT_INVENTING_DATE");
   const toolRows=[];
   for(const title of ['Create a Skill for document processing','Agent configuration walkthrough','n8n execution guide','Dify application setup','LangGraph quickstart','LangChain integration guide'])toolRows.push(await makeRaw('tool',{title}));
   const unrelated=await makeRaw('unrelated',{title:'Shareholder growth report'});
   assert.deepEqual(new Set((await listDuePracticeMaterials(20,now,[...toolRows,unrelated])).map(r=>r.raw.id)),new Set(toolRows),'TOOL_NAMES_ENTER_BODY_QUEUE_WITHOUT_SUBSTRING_FALSE_POSITIVES');

   process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://relay.example.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture";
   globalThis.fetch=async(input,init)=>{
    if(String(input)==="https://relay.example.invalid/v1/collect")return handleRelayRequest(new Request(String(input),init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
    assert.equal(new URL(String(input)).hostname,"huggingface.co");calls++;
    if(mode==="RAW_CHANGED")await db.update(contentRawItems).set({originalUrl:"https://huggingface.co/blog/replaced-"+mutateId,contentHash:randomUUID()}).where(eq(contentRawItems.id,mutateId));
    if(mode==="EVENT_ARCHIVED")await db.update(contentEvents).set({archivedAt:new Date()}).where(eq(contentEvents.id,events[0]));
    if(mode==="SOURCE_DISABLED")await db.update(contentSources).set({enabled:false}).where(eq(contentSources.id,sourceId));
    return new Response(html);
   };
   const fetched=await backfillPracticeMaterials(actor,{limit:1,apply:true,rawItemIds:[valid]});assert.equal(fetched.results?.[0]?.status,"FETCHED");
   const [raw]=await db.select().from(contentRawItems).where(eq(contentRawItems.id,valid));assert.equal(raw.publishedAt,null);assert.equal((raw.metadata as any).operatorNote,"preserve");assert.equal((raw.metadata as any).factualSource,false);assert((raw.metadata as any).publicContentReceipt.complete);assert.equal((raw.metadata as any).publicContentReceipt.url,raw.originalUrl);
   assert.equal((await listDuePracticeMaterials(20,now,[valid])).length,0,"RECEIPT_REUSES_MATERIAL_WITHOUT_REWRITING_DATE");
   mutateId=await makeRaw("changed");mode="RAW_CHANGED";const changed=await backfillPracticeMaterials(actor,{limit:1,apply:true,rawItemIds:[mutateId]});assert.equal(changed.results?.[0]?.status,"RAW_CHANGED");
   assert.equal(((await db.select().from(contentRawItems).where(eq(contentRawItems.id,mutateId)))[0].metadata as any).publicContentReceipt,undefined);
   mutateId=await makeRaw("archived-after-fetch");mode="EVENT_ARCHIVED";const archived=await backfillPracticeMaterials(actor,{limit:1,apply:true,rawItemIds:[mutateId]});assert.equal(archived.results?.[0]?.status,"CANDIDATE_NO_LONGER_ELIGIBLE");
   await db.update(contentEvents).set({archivedAt:null}).where(eq(contentEvents.id,events[0]));
   mutateId=await makeRaw("disabled");mode="SOURCE_DISABLED";const disabled=await backfillPracticeMaterials(actor,{limit:1,apply:true,rawItemIds:[mutateId]});assert.equal(disabled.results?.[0]?.status,"SOURCE_NO_LONGER_CURRENT");
   assert.equal((await listDuePracticeMaterials(20,now,rawIds)).length,0);assert.equal(calls,4);
   console.log("PRACTICE_REFERENCE_BODY_DATABASE=PASS;DATABASE=DEVELOPMENT;UPSTREAM=MOCK;PAID_CALLS=0");
  }finally{
   if(rawIds.length){await db.delete(contentAuditRecords).where(and(inArray(contentAuditRecords.entityId,rawIds),eq(contentAuditRecords.actorEmail,actor.email)));await db.delete(contentRawItems).where(inArray(contentRawItems.id,rawIds));}
   await db.delete(contentEvents).where(inArray(contentEvents.id,events));await db.delete(contentSources).where(eq(contentSources.id,sourceId));
  }
 });assert.equal(locked.status,"COMPLETED");
 }finally{globalThis.fetch=savedFetch;for(const key of envKeys){const v=saved.get(key);if(v===undefined)delete process.env[key];else process.env[key]=v;}}
}
main().catch(error=>{console.error("PRACTICE_REFERENCE_BODY_DATABASE=FAILED;CODE="+String(error.cause?.code??error.code??error.name??"UNKNOWN")+";ASSERTION="+String(error.operator??"NONE")+";REASON="+(/^[A-Z0-9_:]+$/.test(error.message)?error.message:"REDACTED"));console.error(String(error.stack??"").split("\n").filter((line:string)=>/^\s+at /.test(line)).slice(0,3).join("\n"));process.exitCode=1;}).finally(closeDatabase);
