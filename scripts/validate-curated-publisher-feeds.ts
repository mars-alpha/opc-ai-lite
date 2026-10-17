import assert from "node:assert/strict";
import {publicSourceRoute,AUTHOR_FEED_HOSTS} from "../services/overseas-collector-relay/public-source-routes";
import {publicPracticeRoute} from "../services/overseas-collector-relay/public-practice-routes";
import {discoverPublicFeed} from "../lib/server/content/public-feed-discovery";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
import {publicPublisherIdentity} from "../lib/server/content/source-publisher-identity";
const cases=[
 {home:"https://pytorch.org/",listing:"https://pytorch.org/blog/",feed:"https://pytorch.org/feed/",article:"https://pytorch.org/blog/muse-spark-open/"},
 {home:"https://modal.com/",listing:"https://modal.com/blog",feed:"https://modal.com/blog/atom.xml",article:"https://modal.com/blog/meta-muse-spark-open-now-available-on-modal"},
 {home:"https://machinelearning.apple.com/",listing:"https://machinelearning.apple.com/",feed:"https://machinelearning.apple.com/rss.xml",article:"https://machinelearning.apple.com/research/mlx-distributed-inference"},
 {home:"https://www.together.ai/",listing:"https://www.together.ai/blog",feed:"https://www.together.ai/blog/rss.xml",article:"https://www.together.ai/blog/meta-muse-spark-open"},
 {home:"https://vllm.ai/",listing:"https://vllm.ai/blog",feed:"https://vllm.ai/blog/rss.xml",article:"https://vllm.ai/blog/2026-10-16-kimi-k3-mi355x"}
];
async function main(){
 const saved=globalThis.fetch;let upstream=0;
 try{
  for(const c of cases){
   for(const url of [c.home,c.listing,c.feed])assert.equal(publicPublisherIdentity(url),c.home,"HOME_LISTING_FEED_ONE_LOGICAL_PUBLISHER");
   assert.equal(publicPublisherIdentity(c.listing.replace(/\/$/,"")),c.home,"CANONICAL_TRAILING_SLASH_NORMALIZATION");
   for(const url of [c.article,c.feed+"?key=x",c.home+"other",c.home.replace("https:","http:")])assert.equal(publicPublisherIdentity(url),null,"UNDECLARED_URL_NOT_AN_IDENTITY_ALIAS");
   assert(publicSourceRoute(c.feed)?.authorFeed,"VERIFIED_NATIVE_FEED_HAS_FIXED_SOURCE_ROUTE:"+c.feed);
   assert(AUTHOR_FEED_HOSTS.includes(new URL(c.home).hostname));
   for(const url of [c.home,c.listing,c.article])assert(publicSourceRoute(url));
   assert(publicPracticeRoute(c.article));
   for(const url of [c.feed,c.home,c.listing])assert.equal(publicPracticeRoute(url),null,"DIRECTORY_IS_NOT_ARTICLE");
   for(const url of [c.feed+"?key=x",c.article+"#x",new URL("/api/key",c.home).href,new URL("/blog/a/b",c.home).href])assert.equal(publicSourceRoute(url),null);
   const found=await discoverPublicFeed(c.home,{fetchPage:async()=>({body:"<html></html>",finalUrl:c.home,contentType:"text/html"}),parseFeed:()=>[],collectFeed:async url=>{assert.equal(url,c.feed);return [{title:"AI engineering sample",originalUrl:c.article,publishedAt:"2026-10-15T00:00:00Z"}];},allowedUrl:url=>Boolean(publicSourceRoute(url))});
   assert.equal(found?.url,c.feed,"PUBLISHER_VERIFIED_FIXED_FEED_IS_A_BOUNDED_FALLBACK");
   globalThis.fetch=async(input,init)=>{assert.equal(String(input),c.feed);upstream++;return new Response("<rss><channel/></rss>",{headers:{"content-type":"application/xml",etag:'"test"'}});};
   const response=await handleRelayRequest(new Request("https://fixture.invalid/v1/collect",{method:"POST",headers:{authorization:"Bearer fixture"},body:JSON.stringify({provider:"PUBLIC_SOURCE_DOCUMENT",searchQuery:c.feed})}),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
   assert.equal(response.status,200);assert.equal((await response.json()).url,c.feed);
  }
  assert.equal(upstream,cases.length);
 }finally{globalThis.fetch=saved;}
 console.log("CURATED_PUBLISHER_FEEDS=PASS;UPSTREAM=MOCK;SOURCE_REGISTRATION=NOT_RUN");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
