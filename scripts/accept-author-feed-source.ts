import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {loadEnvConfig} from "@next/env";
import {eq,inArray,or} from "drizzle-orm";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {contentSources,contentRawItems,contentAuditRecords,users} from "../lib/server/db/schema";
import {runSourceAutoAdmissionCycle} from "../lib/server/content/source-auto-admission";
import {SOURCE_ONBOARDING_VERSION} from "../lib/server/content/source-onboarding";
import {collectPublicPracticeContent} from "../lib/server/content/public-practice-content";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
import {ingestRawItem} from "../lib/server/content/discovery";
import {CURATED_PUBLISHER_FEEDS} from "../services/overseas-collector-relay/curated-publisher-feeds";
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes("--confirm=AUTHOR-FEED-DEVELOPMENT"));assert.equal(assertCurrentDatabaseTarget().environment,"development");
 const author=process.argv.find(arg=>arg.startsWith("--author="))?.slice(9)??"hamel";const publisher=CURATED_PUBLISHER_FEEDS.find(p=>p.key===author);assert(["hamel","eugene"].includes(author)||publisher,"FIXED_AUTHOR_REQUIRED");
 const locked=await withSourceCollectionCycleLock(async()=>{
  const db=getDatabase(),token=randomUUID().replaceAll("-",""),parentId="source_accept_author_"+token,root=publisher?.home??(author==="hamel"?"https://hamel.dev/":"https://eugeneyan.com/"),feed=publisher?.feed??root+(author==="hamel"?"index.xml":"rss/");
  assert.equal((await db.select({id:contentSources.id}).from(contentSources).where(or(eq(contentSources.canonicalUrl,root),eq(contentSources.canonicalUrl,feed),eq(contentSources.canonicalUrl,root+"index.html"),...(publisher?[eq(contentSources.canonicalUrl,publisher.listing)]:[])))).length,0,"UNUSED_FIXED_AUTHOR_IDENTITY_REQUIRED");
  const [admin]=await db.select().from(users).where(eq(users.role,"ADMIN")).limit(1);assert(admin);const actor={id:admin.id,email:"author-feed-acceptance@example.invalid",displayName:null,role:"ADMIN" as const};
  const keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES","OPC_COLLECTION_AUTHOR_FEEDS","OPC_COLLECTION_SOURCE_ADMISSION"],saved=new Map(keys.map(k=>[k,process.env[k]])),savedFetch=globalThis.fetch;
  const rawIds:string[]=[],createdIds:string[]=[];let calls=0;
  const article=root+(publisher?(author==="apple_ml"?"research/":"blog/"):(author==="hamel"?"blog/posts/":"writing/"))+"fixture-"+token+(!publisher||author==="pytorch"?"/":""),observedArticle=author==="eugene"?article.replace("/writing/","//writing/"):article;
  const makeRaw=async()=>{const id=randomUUID();rawIds.push(id);await db.insert(contentRawItems).values({id,sourceId:parentId,platform:"WEB",title:"AI evals fixture",originalUrl:observedArticle,contentHash:id,metadata:{collectionOrigin:"SYSTEM"}});return id;};
  try{
   await db.insert(contentSources).values({id:parentId,name:"Author reference fixture",sourceType:"MANAGED_SOURCE",collectionMethod:"RSS",canonicalUrl:"https://example.invalid/"+token,metadata:{sourceOnboarding:{version:SOURCE_ONBOARDING_VERSION},sourceRegistry:{owner:"SOURCE_MANAGEMENT"},currentPortfolio:true}});
   process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://author-relay.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture";process.env.OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES="v2";process.env.OPC_COLLECTION_SOURCE_ADMISSION="on";delete process.env.OPC_COLLECTION_AUTHOR_FEEDS;
   const html='<html><head><title>Build AI evals</title></head><body><a href="'+(author==="hamel"?"../../../index.html":"/")+'">Home</a><article><h1>Build AI evals</h1><h2>Step 1</h2><p>Collect representative inputs and record expected outputs.</p><h2>Step 2</h2><p>'+"Run evaluations and inspect failures before changing prompts. ".repeat(40)+'</p></article></body></html>';
   globalThis.fetch=async(input,init)=>{
    if(String(input)==="https://author-relay.invalid/v1/collect")return handleRelayRequest(new Request(String(input),init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
    calls++;assert([root,feed,article].includes(String(input)),"FIXED_MOCK_UPSTREAM_ONLY");
    const body=String(input)===feed?`<rss><channel><item><title>AI eval workflow</title><link>${observedArticle}</link><pubDate>${new Date(Date.now()-60000).toUTCString()}</pubDate></item></channel></rss>`:String(input)===root?(publisher?"<html></html>":author==="hamel"?'<html><head><link rel="alternate" type="application/rss+xml" href="index.xml"></head></html>':'<html><a href="/rss/">RSS</a></html>'):html;
    return new Response(body,{headers:{"content-type":String(input)===feed?"application/rss+xml":"text/html"}});
   };
   const rawId=await makeRaw();assert.equal((await runSourceAutoAdmissionCycle(actor,{rawItemIds:[rawId]})).processed,0);assert.equal(calls,0,"FLAG_OFF_NO_UPSTREAM");
   process.env.OPC_COLLECTION_AUTHOR_FEEDS="v1";
   const aliasId=parentId+"_alias";createdIds.push(aliasId);
   await db.insert(contentSources).values({id:aliasId,name:"Archived home alias fixture",sourceType:"MANAGED_SOURCE",collectionMethod:"UNRESOLVED",canonicalUrl:author==="hamel"?root+"index.html":root,status:"ARCHIVED",enabled:false,metadata:{acceptanceOnly:true}});
   const blocked=await runSourceAutoAdmissionCycle(actor,{rawItemIds:[rawId]});assert.equal(blocked.results[0]?.status,"BLOCKED_SOURCE","ARCHIVED_HOME_ALIAS_BLOCKS_NEW_ROOT_SOURCE");
   assert.equal((await db.select({id:contentSources.id}).from(contentSources).where(eq(contentSources.canonicalUrl,root))).length,author==="hamel"?0:1,"NO_SECOND_LOGICAL_SOURCE");
   await db.delete(contentSources).where(eq(contentSources.id,aliasId));
   if(author==="pytorch"){
    const listingId=parentId+"_listing";createdIds.push(listingId);
    await db.insert(contentSources).values({id:listingId,name:"Existing publisher listing fixture",sourceType:"MANAGED_SOURCE",collectionMethod:"UNRESOLVED",canonicalUrl:publisher!.listing,status:"ACTIVE",enabled:true,metadata:{acceptanceOnly:true,currentPortfolio:true,sourceOnboarding:{version:SOURCE_ONBOARDING_VERSION}}});
    const listingRaw=await makeRaw(),reuse=await runSourceAutoAdmissionCycle(actor,{rawItemIds:[listingRaw]});
    assert.equal(reuse.results[0]?.status,"EXISTING","PUBLISHER_HOME_REUSES_BLOG_IDENTITY");assert.equal(reuse.results[0]?.sourceId,listingId);
    assert.equal((await db.select().from(contentSources).where(eq(contentSources.canonicalUrl,root))).length,0,"NO_PUBLISHER_HOME_DUPLICATE");
    await db.delete(contentSources).where(eq(contentSources.id,listingId));
   }
   // A fresh observed Raw after removing our archived fixture can prove registration.
   const freshId=await makeRaw();
   const first=await runSourceAutoAdmissionCycle(actor,{rawItemIds:[freshId]});assert.equal(first.failed,0);assert.equal(first.results[0]?.status,"REGISTERED");const sourceId=first.results[0].sourceId!;createdIds.push(sourceId);
   const [source]=await db.select().from(contentSources).where(eq(contentSources.id,sourceId));assert.equal(source.canonicalUrl,root);assert.equal((source.metadata as any).sourceQualification.qualification,"CONDITIONAL");assert.equal((source.metadata as any).factualSource,false);
   assert(JSON.stringify(source.collectionConfig).includes(feed));
   const attempts=calls;assert.equal((await runSourceAutoAdmissionCycle(actor,{rawItemIds:[freshId]})).processed,0);assert.equal(calls,attempts,"REPEAT_INPUT_NO_REQUEST");
   const second=await makeRaw();assert.equal((await runSourceAutoAdmissionCycle(actor,{rawItemIds:[second]})).results[0]?.sourceId,sourceId,"ONE_LOGICAL_AUTHOR_SOURCE");
   const material=await collectPublicPracticeContent({originalUrl:observedArticle,metadata:{referenceOnly:true,bodyStatus:"SEARCH_SNIPPET_ONLY"}});assert(String(material?.bodyText).includes("Run evaluations"));assert.equal((material?.publicContentReceipt as any).url,observedArticle);assert.equal((material?.publicContentReceipt as any).fetchedUrl,article);
   if(author==="eugene"){
    const one=await ingestRawItem({sourceId,title:"AI evaluation material "+token,originalUrl:observedArticle,contentHash:randomUUID()});rawIds.push(one.item.id);
    const two=await ingestRawItem({sourceId,title:"Different AI article label "+token,originalUrl:article,contentHash:randomUUID()});assert.equal(one.item.id,two.item.id,"CANONICAL_ALIAS_DEDUPS_WITH_DIFFERENT_TITLES_AND_HASHES");assert.equal(two.created,false);
   }
   await db.update(contentSources).set({status:"ARCHIVED",enabled:false}).where(eq(contentSources.id,sourceId));const third=await makeRaw();assert.equal((await runSourceAutoAdmissionCycle(actor,{rawItemIds:[third]})).results[0]?.status,"BLOCKED_SOURCE");
   const [archived]=await db.select().from(contentSources).where(eq(contentSources.id,sourceId));assert.equal(archived.status,"ARCHIVED");assert.equal(archived.enabled,false);
   console.log("AUTHOR_FEED_SOURCE_DATABASE=PASS;AUTHOR="+author+";DATABASE=DEVELOPMENT;UPSTREAM=MOCK;PAID_CALLS=0");
  }finally{
   globalThis.fetch=savedFetch;for(const key of keys){const value=saved.get(key);if(value===undefined)delete process.env[key];else process.env[key]=value;}
   // Discover only our own automatic registration if an assertion failed before ID capture.
   const owned=await db.select().from(contentSources).where(eq(contentSources.canonicalUrl,root));
   const ids=[parentId,...createdIds,...owned.filter(s=>rawIds.includes(String((s.metadata as any).automaticDiscovery?.rawItemId))).map(s=>s.id)];
   await db.delete(contentAuditRecords).where(inArray(contentAuditRecords.entityId,[...ids,...rawIds]));await db.delete(contentRawItems).where(inArray(contentRawItems.id,rawIds));await db.delete(contentSources).where(inArray(contentSources.id,ids));
  }
 });assert.equal(locked.status,"COMPLETED");
}
main().catch(error=>{console.error("AUTHOR_FEED_SOURCE_DATABASE=FAILED;CODE="+String(error.code??error.name??"UNKNOWN")+";ASSERTION="+String(error.operator??"NONE")+";REASON="+(/^[A-Z0-9_:]+$/.test(error.message)?error.message:"REDACTED"));process.exitCode=1;}).finally(closeDatabase);
