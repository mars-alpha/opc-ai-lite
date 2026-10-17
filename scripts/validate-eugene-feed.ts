import assert from "node:assert/strict";
import {declaredFeedUrls,discoverPublicFeed} from "../lib/server/content/public-feed-discovery";
import {parseFeedDocument} from "../lib/server/content/collection-runner";
import {canonicalizeOriginalUrl} from "../lib/server/content/discovery";
import {observedWebsiteHomepage} from "../lib/server/content/source-auto-admission-policy";
import {isPublicFeedRelayUrl,collectPublicSourceDocumentThroughRelay} from "../lib/server/content/overseas-collector-relay-client";
import {publicPracticeRoute} from "../services/overseas-collector-relay/public-practice-routes";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
async function main(){
 const root="https://eugeneyan.com/",feed=root+"rss/",article=root+"writing/cybersecurity-evals/",alias=root+"/writing/cybersecurity-evals/";
 assert.deepEqual(declaredFeedUrls('<a href="/rss/">RSS</a>',root),[feed],"OBSERVED_FIXED_RSS_ANCHOR");
 for(const html of ['<a href="https://evil.example/rss/">RSS</a>','<a href="/rss/?token=x">RSS</a>','<a href="/private/feed">RSS</a>'])assert.deepEqual(declaredFeedUrls(html,root),[]);
 assert.deepEqual(declaredFeedUrls('<a href="/rss/">RSS</a>',"https://unknown.example/"),[],"NO_GENERIC_ANCHOR_DISCOVERY");
 assert.deepEqual(declaredFeedUrls('<base href="https://evil.example/"><a href="/rss/">RSS</a>',root),[],"CROSS_ORIGIN_BASE_CANNOT_DECLARE_FIXED_FEED");
 assert.deepEqual(declaredFeedUrls('<base href="/other/"><a href="rss/">RSS</a>',root),[],"ACTUAL_RESOLVED_ANCHOR_REQUIRED");
 const rss=`<rss><channel><item><title>AI evals</title><link>${alias}</link><pubDate>Sun, 21 Jun 2026 00:00:00 GMT</pubDate></item></channel></rss>`;
 assert.equal(parseFeedDocument(rss,feed)[0].originalUrl,article,"FEED_USES_VERIFIED_ARTICLE_CANONICAL");
 assert.equal(canonicalizeOriginalUrl(alias),canonicalizeOriginalUrl(article));
 assert.notEqual(canonicalizeOriginalUrl("https://unknown.example//writing/test/"),canonicalizeOriginalUrl("https://unknown.example/writing/test/"));
 assert.equal(observedWebsiteHomepage('<a href="/">Home</a>',alias),root);
 for(const url of [root,feed,article,alias])assert(isPublicFeedRelayUrl(url));
 for(const url of [root+"rss/?x=1",root+"api/key",root+"writing/a/b/",root+"///writing/test/",root+"writing/a/#x","https://eugeneyan.com.evil/","http://eugeneyan.com/"])assert.equal(isPublicFeedRelayUrl(url),false);
 assert.equal(publicPracticeRoute(alias)?.url,article);assert.equal(publicPracticeRoute(feed),null);
 const found=await discoverPublicFeed(root,{fetchPage:async()=>({body:'<a href="/rss/">RSS</a>',finalUrl:root,contentType:"text/html"}),parseFeed:parseFeedDocument,collectFeed:async url=>{assert.equal(url,feed);return parseFeedDocument(rss,url);},allowedUrl:isPublicFeedRelayUrl});assert.equal(found?.url,feed);
 const savedFetch=globalThis.fetch,keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES","OPC_COLLECTION_AUTHOR_FEEDS"],saved=new Map(keys.map(k=>[k,process.env[k]]));let mode="ALIAS",calls=0;
 try{
  process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://eugene-relay.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture";process.env.OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES="v2";delete process.env.OPC_COLLECTION_AUTHOR_FEEDS;
  globalThis.fetch=async(input,init)=>{
   if(String(input)==="https://eugene-relay.invalid/v1/collect"){
    if(mode==="OLD")return Response.json({url:article,status:200,text:"<html></html>",contentType:"text/html",publicSourceRouteProtocol:"public-source-routes-v1"});
    return handleRelayRequest(new Request(String(input),init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
   }
   assert.equal(String(input),article);calls++;
   assert.equal(new Headers(init?.headers).get("if-none-match"),mode==="304"?'"new"':null,"ALIAS_NEVER_FORWARDS_OLD_VALIDATOR");
   if(mode==="304" || mode==="BAD304")return new Response(null,{status:304});
   if(mode==="REDIRECT")return new Response(null,{status:302,headers:{location:"https://evil.example/"}});
   return new Response("<html><article>Evaluation</article></html>",{headers:{etag:'"new"',"content-type":"text/html"}});
  };
  await assert.rejects(collectPublicSourceDocumentThroughRelay(feed));assert.equal(calls,0);
  process.env.OPC_COLLECTION_AUTHOR_FEEDS="v1";const result=await collectPublicSourceDocumentThroughRelay(alias,undefined,{etag:'"old"'});assert.equal(result.finalUrl,article);assert.equal(result.etag,null);
  mode="304";assert.equal((await collectPublicSourceDocumentThroughRelay(article,undefined,{etag:'"new"'})).status,304);
  mode="BAD304";await assert.rejects(collectPublicSourceDocumentThroughRelay(alias,undefined,{etag:'"old"'}));
  mode="OLD";await assert.rejects(collectPublicSourceDocumentThroughRelay(alias),/FEED_INVALID/);
  mode="REDIRECT";await assert.rejects(collectPublicSourceDocumentThroughRelay(article));
  mode="ALIAS";
  const direct=await handleRelayRequest(new Request("https://eugene-relay.invalid/v1/collect",{method:"POST",headers:{authorization:"Bearer fixture","content-type":"application/json"},body:JSON.stringify({provider:"PUBLIC_SOURCE_DOCUMENT",searchQuery:alias,validators:{etag:'"old"',lastModified:"Wed, 01 Jan 2025 00:00:00 GMT"}})}),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
  assert.equal(direct.status,200,"DIRECT_DENO_ALIAS_STRIPS_VALIDATORS_WITHOUT_NODE");
 }finally{globalThis.fetch=savedFetch;for(const key of keys){const value=saved.get(key);if(value===undefined)delete process.env[key];else process.env[key]=value;}}
 console.log("EUGENE_FEED_AND_ALIASES=PASS;UPSTREAM=MOCK");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
