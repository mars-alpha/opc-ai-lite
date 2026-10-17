import assert from "node:assert/strict";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
import {collectRssDocument} from "../lib/server/content/collection-runner";
async function main(){
 const originalFetch=globalThis.fetch,keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OPC_COLLECTION_WATCHLIST_FEEDS"];
 const saved=new Map(keys.map(k=>[k,process.env[k]]));
 const url="https://bair.berkeley.edu/blog/feed.xml";
 let calls=0,mode="INITIAL";
 const request=(query:string,validators?:unknown)=>new Request("https://relay.example.invalid/v1/collect",{method:"POST",headers:{authorization:"Bearer fixture"},body:JSON.stringify({provider:"WATCHLIST_FEED",searchQuery:query,validators})});
 try{
  globalThis.fetch=async(input,init)=>{
   if(String(input)==="https://relay.example.invalid/v1/collect")return handleRelayRequest(new Request(String(input),init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
   assert.equal(String(input),url,"ONLY_FIXED_FEED_UPSTREAM_ALLOWED");calls++;
   assert.equal(init?.redirect,"error","FIXED_FEED_CANNOT_REDIRECT_TO_ANOTHER_RESOURCE");
   if(mode==="HTTP_ERROR")return new Response("upstream failed",{status:503});
   if(mode==="REDIRECT")return new Response(null,{status:302,headers:{location:"https://evil.example/feed"}});
   if(mode==="NOT_MODIFIED"){assert.equal(new Headers(init?.headers).get("if-none-match"),'"feed-v1"');return new Response(null,{status:304});}
   return new Response('<feed/>',{headers:{etag:'"feed-v1"'}});
  };
  const first=await handleRelayRequest(request(url),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});assert.equal(first.status,200,"WATCHLIST_FIXED_FEED_IS_EXECUTABLE");
  for(const bad of ["https://bair.berkeley.edu/blog/",url+"?url=https://evil.example",url+"#fragment","http://bair.berkeley.edu/blog/feed.xml","https://bair.berkeley.edu.evil.example/blog/feed.xml","https://user:password@bair.berkeley.edu/blog/feed.xml"]){const before=calls;assert.equal((await handleRelayRequest(request(bad),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"})).status,400);assert.equal(calls,before,"REJECT_BEFORE_UPSTREAM");}
  process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://relay.example.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture";delete process.env.OPC_COLLECTION_WATCHLIST_FEEDS;
  const before=calls;await assert.rejects(collectRssDocument(url),/WATCHLIST_FEED_RELAY_UNAVAILABLE/);assert.equal(calls,before,"NO_SILENT_DIRECT_FALLBACK");
  process.env.OPC_COLLECTION_WATCHLIST_FEEDS="v1";
  const feed=await collectRssDocument(url);assert.equal(feed.validators.etag,'"feed-v1"');
  mode="NOT_MODIFIED";assert.equal((await collectRssDocument(url,{validators:feed.validators})).disposition,"NOT_MODIFIED");
  mode="HTTP_ERROR";await assert.rejects(collectRssDocument(url),/RELAY_UPSTREAM_HTTP_503/);
  mode="REDIRECT";const beforeRedirect=calls;await assert.rejects(collectRssDocument(url),/RELAY_UPSTREAM_HTTP_302/);assert.equal(calls,beforeRedirect+1,"REDIRECT_TARGET_NOT_FETCHED");
  console.log("WATCHLIST_FIXED_FEED_RELAY=PASS");
 }finally{globalThis.fetch=originalFetch;for(const k of keys){const v=saved.get(k);if(v===undefined)delete process.env[k];else process.env[k]=v;}}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
