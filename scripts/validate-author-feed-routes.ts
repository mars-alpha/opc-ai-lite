import assert from "node:assert/strict";
import {observedWebsiteHomepage,automaticSourceProbeDecision} from "../lib/server/content/source-auto-admission-policy";
import {isPublicFeedRelayUrl,collectPublicSourceDocumentThroughRelay,collectThroughOverseasRelay} from "../lib/server/content/overseas-collector-relay-client";
import {publicPracticeRoute} from "../services/overseas-collector-relay/public-practice-routes";
import {discoverPublicFeed} from "../lib/server/content/public-feed-discovery";
import {parseFeedDocument} from "../lib/server/content/collection-runner";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
async function main(){
 const root="https://hamel.dev/",article=root+"blog/posts/evals-faq/",feed=root+"index.xml";
 assert.equal(observedWebsiteHomepage('<a href="../../../index.html">Home</a>',article),root,"FIXED_OBSERVED_HOME_ALIAS");
 assert.equal(observedWebsiteHomepage('<a href="/index.html">Home</a>',"https://unknown.example/post/"),null,"NO_GENERIC_HOME_INFERENCE");
 for(const url of [root,root+"index.html",feed,article,article+"index.html"])assert(isPublicFeedRelayUrl(url),"FIXED_AUTHOR_ROUTE:"+url);
 for(const url of [root+"api/key",feed+"?token=x",root+"blog/posts/a/b/",root+"blog/posts/%2e%2e/",root+"#x","https://user:pass@hamel.dev/","https://hamel.dev.evil/","http://hamel.dev/"])assert.equal(isPublicFeedRelayUrl(url),false,"DENY_UNDECLARED_ROUTE");
 assert.equal(publicPracticeRoute(article)?.kind,"HTML");assert.equal(publicPracticeRoute(feed),null);
 const rss='<rss><channel><item><title>AI evaluation workflow</title><link>'+article+'</link><pubDate>Fri, 16 Oct 2026 01:00:00 GMT</pubDate></item></channel></rss>';
 const discovered=await discoverPublicFeed(root,{fetchPage:async()=>({body:'<link rel="alternate" type="application/rss+xml" href="index.xml">',finalUrl:root,contentType:"text/html"}),parseFeed:parseFeedDocument,collectFeed:async url=>{assert.equal(url,feed);return parseFeedDocument(rss,url);},allowedUrl:isPublicFeedRelayUrl});
 assert.equal(discovered?.url,feed);assert.equal(automaticSourceProbeDecision({canonicalUrl:root,kind:"WEBSITE",acquisition:"RSS_ATOM",acquisitionUrl:feed,check:{passed:true,sampleCount:1},samples:discovered!.samples},Date.parse("2026-10-16T10:00:00Z")).eligible,true);
 const savedFetch=globalThis.fetch,keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES","OPC_COLLECTION_AUTHOR_FEEDS"],saved=new Map(keys.map(k=>[k,process.env[k]]));
 let calls=0,mode="FEED";
 try{
  process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://author-relay.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture";process.env.OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES="v2";delete process.env.OPC_COLLECTION_AUTHOR_FEEDS;
  globalThis.fetch=async(input,init)=>{
   if(String(input)==="https://author-relay.invalid/v1/collect"){
    if(mode==="OLD_RELAY")return Response.json({url:feed,status:200,text:rss,contentType:"application/rss+xml"});
    return handleRelayRequest(new Request(String(input),init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
   }
   calls++;assert.equal(String(input),feed);
   if(mode==="REDIRECT")return new Response(null,{status:302,headers:{location:"https://evil.example/"}});
   if(mode==="304"){assert.equal(new Headers(init?.headers).get("if-none-match"),'"author"');return new Response(null,{status:304});}
   return new Response(rss,{headers:{"content-type":"application/rss+xml",etag:'"author"'}});
  };
  await assert.rejects(collectPublicSourceDocumentThroughRelay(feed));assert.equal(calls,0,"FLAG_OFF_NO_UPSTREAM");
  await assert.rejects(collectThroughOverseasRelay({provider:"PUBLIC_PRACTICE_DOCUMENT",searchQuery:article,windowHours:168,resultLimit:1,minStars:0}),/AUTHOR_FEED_RELAY_DISABLED/);assert.equal(calls,0);
  process.env.OPC_COLLECTION_AUTHOR_FEEDS="v1";const first=await collectPublicSourceDocumentThroughRelay(feed);assert.equal(first.status,200);
  mode="304";assert.equal((await collectPublicSourceDocumentThroughRelay(feed,undefined,{etag:'"author"'})).status,304);
  mode="OLD_RELAY";await assert.rejects(collectPublicSourceDocumentThroughRelay(feed),/FEED_INVALID/);
  await assert.rejects(collectThroughOverseasRelay({provider:"PUBLIC_PRACTICE_DOCUMENT",searchQuery:article,windowHours:168,resultLimit:1,minStars:0}),/FEED_INVALID/);
  mode="REDIRECT";await assert.rejects(collectPublicSourceDocumentThroughRelay(feed));assert.equal(calls,3,"NO_OUTSIDE_HOST_FOLLOW");
 }finally{globalThis.fetch=savedFetch;for(const key of keys){const value=saved.get(key);if(value===undefined)delete process.env[key];else process.env[key]=value;}}
 console.log("AUTHOR_FEED_ROUTES=PASS;UPSTREAM=MOCK");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
