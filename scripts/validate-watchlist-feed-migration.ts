import assert from "node:assert/strict";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
import {collectRssDocument} from "../lib/server/content/collection-runner";
import {watchlistFeedFetchUrl,WATCHLIST_FEED_MIGRATIONS} from "../services/overseas-collector-relay/watchlist-feeds";
async function main(){
 assert.equal(watchlistFeedFetchUrl('https://baoyu.io/feed.xml'),'https://s.baoyu.io/feed.xml','PUBLISHER_DECLARED_BAOYU_MIGRATION');
 for(const {from:oldUrl,to:target} of WATCHLIST_FEED_MIGRATIONS){
 const savedFetch=globalThis.fetch,keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OPC_COLLECTION_WATCHLIST_FEEDS"],saved=new Map(keys.map(k=>[k,process.env[k]]));
 let calls=0,mode="ALIAS";
 try{
  process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://relay.example.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture";process.env.OPC_COLLECTION_WATCHLIST_FEEDS="v1";
  globalThis.fetch=async(input,init)=>{
   if(String(input)==="https://relay.example.invalid/v1/collect"){
    if(["OLD_RELAY","SPOOFED_URI","ALIAS_304"].includes(mode))return Response.json({url:mode==="OLD_RELAY"?oldUrl:target,requestedUrl:mode==="SPOOFED_URI"?target:oldUrl,watchlistFeedVersion:mode==="OLD_RELAY"?"watchlist-fixed-feeds-v1":"watchlist-fixed-feeds-v2",status:mode==="ALIAS_304"?304:200,text:mode==="ALIAS_304"?"":"<feed/>",contentType:"application/xml",conditionalProtocol:"source-conditional-http-v1"});
    return handleRelayRequest(new Request(String(input),init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
   }
   calls++;assert.equal(String(input),target,"LEGACY_ROUTE_FETCHES_ONLY_VERIFIED_CANONICAL_FEED");assert.equal(init?.redirect,"error");
   assert.equal(new Headers(init?.headers).get("if-none-match"),mode==="NOT_MODIFIED"?'"new"':null,"OLD_URI_VALIDATOR_MUST_NOT_REACH_NEW_URI");
   if(mode==="NOT_MODIFIED" || mode==="BAD_304")return new Response(null,{status:304});
   if(mode==="REDIRECT")return new Response(null,{status:302,headers:{location:"https://evil.example/feed"}});
   if(mode==="429")return new Response("error",{status:429});
   if(mode==="INVALID")return new Response("<html>error</html>");
   return new Response("<feed/>",{headers:{etag:'"new"'}});
  };
  const migrated=await collectRssDocument(oldUrl,{validators:{etag:'"old"'}});assert.equal(migrated.disposition,"NO_NEW_ITEMS");assert.equal(migrated.validators.etag,null,"NEW_URI_VALIDATOR_NOT_STORED_UNDER_OLD_ROUTE");
  const standalone=await handleRelayRequest(new Request("https://relay.example.invalid/v1/collect",{method:"POST",headers:{authorization:"Bearer fixture"},body:JSON.stringify({provider:"WATCHLIST_FEED",searchQuery:oldUrl,validators:{etag:'"old"'}})}),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});assert.equal(standalone.status,200,"RELAY_ALSO_DROPS_LEGACY_VALIDATORS_WITHOUT_NODE_HELP");
  for(const state of ["OLD_RELAY","SPOOFED_URI","ALIAS_304"]){mode=state;const before=calls;await assert.rejects(collectRssDocument(oldUrl,{validators:{etag:'"old"'}}),/FEED_INVALID/);assert.equal(calls,before);}
  mode="DIRECT";const direct=await collectRssDocument(target);assert.equal(direct.validators.etag,'"new"');
  mode="NOT_MODIFIED";assert.equal((await collectRssDocument(target,{validators:direct.validators})).disposition,"NOT_MODIFIED");
  mode="BAD_304";await assert.rejects(collectRssDocument(oldUrl,{validators:{etag:'"old"'}}),/PAYLOAD_INVALID|FEED_INVALID/);
  for(const [state,error] of [["REDIRECT",/HTTP_302/],["429",/HTTP_429/],["INVALID",/RSS_DOCUMENT_INVALID/]] as const){mode=state;const before=calls;await assert.rejects(collectRssDocument(oldUrl),error);assert.equal(calls,before+1,"NO_UNDECLARED_RETRY_OR_REDIRECT");}
  const request=(searchQuery:string)=>new Request("https://relay.example.invalid/v1/collect",{method:"POST",headers:{authorization:"Bearer fixture"},body:JSON.stringify({provider:"WATCHLIST_FEED",searchQuery})});
  for(const bad of [oldUrl+"?x=1",target+"#fragment",target.replace("https://","https://u:p@"),target.replace(new URL(target).hostname,new URL(target).hostname+".evil.example"),target+"?url=http://localhost"]){const before=calls;assert.equal((await handleRelayRequest(request(bad),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"})).status,400);assert.equal(calls,before);}
  console.log("WATCHLIST_FEED_MIGRATION=PASS;UPSTREAM=MOCK");
 }finally{globalThis.fetch=savedFetch;for(const key of keys){const value=saved.get(key);if(value===undefined)delete process.env[key];else process.env[key]=value;}}
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
