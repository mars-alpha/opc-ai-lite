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
import {githubReleasePage} from "../services/overseas-collector-relay/github-releases";
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes("--confirm=GITHUB-RELEASE-DEVELOPMENT"));assert.equal(assertCurrentDatabaseTarget().environment,"development");
 const locked=await withSourceCollectionCycleLock(async()=>{
 const db=getDatabase(),id="source_accept_release_"+randomUUID().replaceAll("-","");
 const [admin]=await db.select().from(users).where(eq(users.role,"ADMIN")).limit(1);assert(admin);
 const actor={id:admin.id,email:"release-acceptance@example.invalid",displayName:null,role:"ADMIN" as const};
 const originalFetch=globalThis.fetch,keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OPC_COLLECTION_GITHUB_RELEASES"];
 const saved=new Map(keys.map(k=>[k,process.env[k]]));
 const base="https://api.github.com/repos/anthropics/claude-code/releases";
 const config=(routeId:string)=>({acquisition:{routes:[{id:routeId,role:"PRIMARY",kind:"PUBLIC_JSON_API",url:base,runtimeOwner:"GITHUB_RELEASES"}]}});
 let phase="INITIAL",pages:number[]=[];
 const row=(n:number)=>({id:n,name:"Claude AI release "+id+" "+n,tag_name:"v"+n,html_url:"https://github.com/anthropics/claude-code/releases/tag/v"+n,published_at:"2010-01-01T00:00:00Z",draft:false,prerelease:false,body:"Historical AI release notes"});
 try{
  await db.insert(contentSources).values({id,name:"Release pagination fixture",sourceType:"OFFICIAL",platform:"WEB",collectionMethod:"CUSTOM",canonicalUrl:base,collectionConfig:config("primary"),metadata:{acceptanceOnly:true}});
  process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://relay.example.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture";process.env.OPC_COLLECTION_GITHUB_RELEASES="v1";
  globalThis.fetch=async(input,init)=>{
   if(String(input)==="https://relay.example.invalid/v1/collect")return handleRelayRequest(new Request(String(input),init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
   const page=githubReleasePage(String(input));assert(page,"ONLY_FIXED_MOCK_UPSTREAM");pages.push(page.page);
   if(phase==="HTTP_FAIL" && page.page!==1)return new Response("rate limited",{status:429});
   const rows=phase==="RAW_FAIL"?[{...row(999),published_at:new Date().toISOString(),body:"AI release \u0000 database rejection"}]:Array.from({length:30},(_,i)=>row((page.page-1)*30+i+1));
   return Response.json(rows);
  };
  const checkpoints=async()=>{const [source]=await db.select().from(contentSources).where(eq(contentSources.id,id));return Object.values((source.metadata as any).githubReleaseCheckpoints??{}) as Array<{nextPage:number}>;};
  const first=await runSourceCollection(actor,id);assert.equal(first.status,"SUCCEEDED");assert.deepEqual(pages,[1,2,3]);assert.equal((await checkpoints())[0].nextPage,4);
  assert.equal((first.metadata as any).apiIncremental.pagination.sweepReachedEnd,false);
  phase="HTTP_FAIL";pages=[];await assert.rejects(runSourceCollection(actor,id));assert.deepEqual(pages,[1,3]);assert.equal((await checkpoints())[0].nextPage,4,"FAILED_PAGE_DOES_NOT_ADVANCE");
  phase="RAW_FAIL";await assert.rejects(runSourceCollection(actor,id));assert.equal((await checkpoints())[0].nextPage,4,"FAILED_RAW_COMMIT_DOES_NOT_ADVANCE");
  phase="RESUME";pages=[];const resumed=await runSourceCollection(actor,id);assert.equal(resumed.status,"SUCCEEDED");assert.deepEqual(pages,[1,3,4]);assert.equal((await checkpoints())[0].nextPage,5);
  pages=[];await runSourceCollection(actor,id,{backfillWindow:{from:new Date(Date.now()-3600000).toISOString(),to:new Date(Date.now()-1000).toISOString()}});assert.deepEqual(pages,[1,2,3]);assert.equal((await checkpoints())[0].nextPage,5);
  pages=[];await runSourceCollection(actor,id,{qualificationOnly:true,provenance:{origin:"SYSTEM",collectionPurpose:"LATEST",runKind:"SOURCE_QUALIFICATION:RELEASE_ACCEPTANCE"}});assert.deepEqual(pages,[1,2,3]);assert.equal((await checkpoints())[0].nextPage,5);
  await db.update(contentSources).set({collectionConfig:config("changed-route")}).where(eq(contentSources.id,id));pages=[];await runSourceCollection(actor,id);assert.deepEqual(pages,[1,2,3]);assert.equal((await checkpoints()).length,2,"ROUTE_CHECKPOINT_ISOLATION");
 }finally{
  globalThis.fetch=originalFetch;for(const k of keys){const v=saved.get(k);if(v===undefined)delete process.env[k];else process.env[k]=v;}
  await db.delete(contentRawItems).where(eq(contentRawItems.sourceId,id));await db.delete(contentCollectionRuns).where(eq(contentCollectionRuns.sourceId,id));await db.delete(contentSources).where(eq(contentSources.id,id));
 }
 });assert.equal(locked.status,"COMPLETED");console.log("GITHUB_RELEASE_DATABASE=PASS;UPSTREAM=MOCK;DATABASE=DEVELOPMENT;FIXTURES=CLEANED");
}
main().catch(error=>{console.error("GITHUB_RELEASE_DATABASE=FAILED;CODE="+String(error.code??error.name??"UNKNOWN")+";ASSERTION="+String(error.operator??"NONE")+";REASON="+(/^[A-Z0-9_:]+$/.test(error.message)?error.message:"REDACTED"));process.exitCode=1;}).finally(closeDatabase);
