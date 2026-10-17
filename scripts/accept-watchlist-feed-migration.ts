import assert from "node:assert/strict";
import {createHash,randomUUID} from "node:crypto";
import {loadEnvConfig} from "@next/env";
import {eq} from "drizzle-orm";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {contentSources,contentRawItems,contentCollectionRuns,users} from "../lib/server/db/schema";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
import {runSourceCollection} from "../lib/server/content/collection-runner";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes("--confirm=FEED-MIGRATION-DEVELOPMENT"));assert.equal(assertCurrentDatabaseTarget().environment,"development");
 const result=await withSourceCollectionCycleLock(async()=>{
  const db=getDatabase(),id="source_accept_migration_"+randomUUID().replaceAll("-",""),oldUrl="https://blog.langchain.com/rss.xml",target="https://www.langchain.com/blog/rss.xml";
  const [admin]=await db.select().from(users).where(eq(users.role,"ADMIN")).limit(1);assert(admin);const actor={id:admin.id,email:"feed-migration-acceptance@example.invalid",displayName:null,role:"ADMIN" as const};
  const route=(url:string)=>({acquisition:{routes:[{id:"feed",role:"PRIMARY",kind:"RSS_ATOM",url}]}});
  const oldKey=createHash("sha256").update("feed|"+oldUrl).digest("hex").slice(0,24);
  const savedFetch=globalThis.fetch,keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OPC_COLLECTION_WATCHLIST_FEEDS"],saved=new Map(keys.map(key=>[key,process.env[key]]));
  let phase="EMPTY",calls=0;
  const checkpoints=async()=>{const [source]=await db.select().from(contentSources).where(eq(contentSources.id,id));return (source.metadata as any).feedCheckpoints as Record<string,{url:string;etag:string|null}>;};
  try{
   await db.insert(contentSources).values({id,name:"Feed migration fixture",sourceType:"OFFICIAL",platform:"WEB",collectionMethod:"RSS",providerRef:id,canonicalUrl:oldUrl,collectionConfig:route(oldUrl),metadata:{acceptanceOnly:true,feedCheckpoints:{[oldKey]:{url:oldUrl,etag:'"legacy"'}}}});
   process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://relay.example.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture";process.env.OPC_COLLECTION_WATCHLIST_FEEDS="v1";
   globalThis.fetch=async(input,init)=>{
    if(String(input)==="https://relay.example.invalid/v1/collect")return handleRelayRequest(new Request(String(input),init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
    assert.equal(String(input),target);calls++;
    assert.equal(new Headers(init?.headers).get("if-none-match"),["NOT_MODIFIED","BROKEN_COMMIT","HTTP_ERROR"].includes(phase)?'"new"':null);
    if(phase==="HTTP_ERROR")return new Response("busy",{status:429});
    if(phase==="NOT_MODIFIED")return new Response(null,{status:304});
    // A new URL and title must reach INSERT instead of URL/title deduplication.
    const content=phase==="EMPTY"?"":`<item><title>OpenAI AI model ${phase==="BROKEN_COMMIT"?"database rollback fixture":"release"} ${id}</title><link>https://example.org/${id}/${phase==="BROKEN_COMMIT"?"broken":"release"}</link><description>OpenAI releases an AI model API ${phase==="BROKEN_COMMIT"?"\u0000":"for developers"}</description></item>`;
    return new Response(`<rss><channel>${content}</channel></rss>`,{headers:{etag:phase==="BROKEN_COMMIT"?'"bad"':'"new"'}});
   };
   const first=await runSourceCollection(actor,id);assert.equal(first.status,"SUCCEEDED");assert.equal(first.receivedCount,0);assert.equal(calls,1,"VALID_EMPTY_FEED_MAKES_ONE_REQUEST");assert.equal((await checkpoints())[oldKey].etag,null,"LEGACY_CHECKPOINT_CLEARED_IN_SUCCESS_TRANSACTION");
   phase="CONTENT";await runSourceCollection(actor,id);assert.equal((await db.select().from(contentRawItems).where(eq(contentRawItems.sourceId,id))).length,1);
   await runSourceCollection(actor,id);assert.equal((await db.select().from(contentRawItems).where(eq(contentRawItems.sourceId,id))).length,1,"ALIAS_REPOLL_REUSES_RAW");
   await db.update(contentSources).set({collectionConfig:route(target)}).where(eq(contentSources.id,id));phase="DIRECT";await runSourceCollection(actor,id);
   const stored=Object.values(await checkpoints());assert.equal(stored.length,2);assert.equal(stored.find(c=>c.url===target)?.etag,'"new"');assert.equal(stored.find(c=>c.url===oldUrl)?.etag,null);
   assert.equal((await db.select().from(contentRawItems).where(eq(contentRawItems.sourceId,id))).length,1,"CANONICAL_ROUTE_DOES_NOT_DUPLICATE_RAW_OR_SOURCE");
   const prior=JSON.stringify(await checkpoints());phase="BROKEN_COMMIT";await assert.rejects(runSourceCollection(actor,id));assert.equal(JSON.stringify(await checkpoints()),prior);
   phase="HTTP_ERROR";await assert.rejects(runSourceCollection(actor,id));assert.equal(JSON.stringify(await checkpoints()),prior);
   phase="NOT_MODIFIED";const unchanged=await runSourceCollection(actor,id);assert.equal((unchanged.metadata as any).feedIncremental.disposition,"NOT_MODIFIED");assert.equal(unchanged.receivedCount,0);
   const [source]=await db.select().from(contentSources).where(eq(contentSources.id,id));assert.equal(source.canonicalUrl,oldUrl);assert.equal(source.status,"ACTIVE");assert.equal(source.enabled,true);assert.equal(source.providerRef,id);
   console.log("WATCHLIST_FEED_MIGRATION_DATABASE=PASS;DATABASE=DEVELOPMENT;UPSTREAM=MOCK;PAID_CALLS=0");
  }finally{
   globalThis.fetch=savedFetch;for(const key of keys){const value=saved.get(key);if(value===undefined)delete process.env[key];else process.env[key]=value;}
   await db.delete(contentRawItems).where(eq(contentRawItems.sourceId,id));await db.delete(contentCollectionRuns).where(eq(contentCollectionRuns.sourceId,id));await db.delete(contentSources).where(eq(contentSources.id,id));
  }
 });assert.equal(result.status,"COMPLETED");
}
main().catch(error=>{console.error("FEED_MIGRATION_DATABASE=FAILED;CODE="+String(error.cause?.code??error.code??error.name??"UNKNOWN")+";ASSERTION="+String(error.operator??"NONE")+";REASON="+(/^[A-Z0-9_:]+$/.test(error.message)?error.message:"REDACTED"));console.error(String(error.stack??"").split("\n").filter((line:string)=>/^\s+at /.test(line)).slice(0,3).join("\n"));process.exitCode=1;}).finally(closeDatabase);
