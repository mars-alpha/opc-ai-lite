import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {loadEnvConfig} from "@next/env";
import {eq} from "drizzle-orm";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {contentSources,contentCollectionRuns,contentRawItems,users} from "../lib/server/db/schema";
import {runSourceCollection} from "../lib/server/content/collection-runner";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
import {listDuePracticeMaterials} from "../lib/server/content/practice-material-backfill";
import {listDiscoveryExpansionCandidates} from "../lib/server/content/intelligence-read-model";
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes("--confirm=FEED-INCREMENTAL-DEVELOPMENT"));
 assert.equal(assertCurrentDatabaseTarget().environment,"development");
 const result=await withSourceCollectionCycleLock(async()=>{
 const db=getDatabase(),id="source_accept_feed_"+randomUUID().replaceAll("-",""),url="https://example.org/feed.xml";
 const [admin]=await db.select().from(users).where(eq(users.role,"ADMIN")).limit(1);assert(admin);
 const actor={id:admin.id,email:"feed-acceptance@example.invalid",displayName:null,role:"ADMIN" as const};
 await db.insert(contentSources).values({id,name:"Acceptance Feed",sourceType:"OFFICIAL",platform:"WEB",collectionMethod:"RSS",canonicalUrl:url,
  collectionConfig:{acquisition:{routes:[{id:"feed",role:"PRIMARY",kind:"RSS_ATOM",url}]}},metadata:{acceptanceOnly:true}});
 const originalFetch=globalThis.fetch;
 let phase="INITIAL",requests=0;
 globalThis.fetch=async(input,init)=>{
  assert.equal(String(input),url,"NO_UNEXPECTED_NETWORK_REQUEST");requests++;
  const headers=new Headers(init?.headers);
  if(phase==="INITIAL"){assert.equal(headers.get("if-none-match"),null);return new Response('<rss><channel><title>Empty</title></channel></rss>',{headers:{etag:'"v1"'}});}
  assert.equal(headers.get("if-none-match"),'"v1"',"COMMITTED_CHECKPOINT_USED");
  if(phase==="BROKEN_COMMIT")return new Response(`<rss><channel><item><title>OpenAI AI release ${id}</title><link>https://example.org/${id}</link><description>API model release \u0000 database rejection</description><pubDate>${new Date().toUTCString()}</pubDate></item></channel></rss>`,{headers:{etag:'"v2"'}});
  return new Response(null,{status:304,headers:{etag:'"v1"'}});
 };
 const checkpoint=async()=>{
  const [source]=await db.select().from(contentSources).where(eq(contentSources.id,id));
  return Object.values((source.metadata as any).feedCheckpoints??{}) as Array<{etag:string}>;
 };
 try{
  const first=await runSourceCollection(actor,id);assert.equal(first.status,"SUCCEEDED");assert.equal((await checkpoint())[0].etag,'"v1"');console.log("FEED_INITIAL_COMMITTED=PASS");
  phase="BROKEN_COMMIT";
  await assert.rejects(runSourceCollection(actor,id),"RAW_COMMIT_FAILURE_MUST_FAIL_RUN");
  assert.equal((await checkpoint())[0].etag,'"v1"',"FAILED_RAW_COMMIT_DOES_NOT_ADVANCE_ETAG");
  phase="NOT_MODIFIED";
  const unchanged=await runSourceCollection(actor,id);assert.equal(unchanged.status,"SUCCEEDED");assert.equal((unchanged.metadata as any).feedIncremental.disposition,"NOT_MODIFIED");
  assert.equal(unchanged.receivedCount,0);assert.equal(requests,3);
  console.log("FEED_INCREMENTAL_DATABASE_ACCEPTANCE=PASS");
 }finally{
  globalThis.fetch=originalFetch;
  await db.delete(contentRawItems).where(eq(contentRawItems.sourceId,id));
  await db.delete(contentCollectionRuns).where(eq(contentCollectionRuns.sourceId,id));
  await db.delete(contentSources).where(eq(contentSources.id,id));
 }
 });
 assert.equal(result.status,"COMPLETED","SYSTEM_LOCK_REQUIRED_FOR_ACCEPTANCE");
 const due=await listDuePracticeMaterials(2);assert(due.length<=2);console.log("PRACTICE_QUEUE_DATABASE_QUERY=PASS");
 const expansion=await listDiscoveryExpansionCandidates(3,{searchReady:false});assert(expansion.length<=3);assert(expansion.every(item=>item.coverage.needsExpansion));console.log("DISCOVERY_QUEUE_DATABASE_QUERY=PASS");
}
main().catch(error=>{console.error("FEED_INCREMENTAL_DATABASE_ACCEPTANCE=FAILED;CODE="+String(error.code??error.name??"UNKNOWN")+";ASSERTION="+String(error.operator??"NONE")+";REASON="+(/^[A-Z0-9_:]+$/.test(error.message)?error.message:"REDACTED"));process.exitCode=1;}).finally(closeDatabase);
