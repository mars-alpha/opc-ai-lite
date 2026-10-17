import assert from "node:assert/strict";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
import {collectRssDocument,fetchPublicText} from "../lib/server/content/collection-runner";
import {collectThroughOverseasRelay} from "../lib/server/content/overseas-collector-relay-client";

async function main(){
 const originalFetch=globalThis.fetch;
 const keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES"];
 const saved=new Map(keys.map(key=>[key,process.env[key]]));
 const url="https://simonwillison.net/atom/everything/",deepmind="https://deepmind.google/blog/rss.xml";
 let mode="INITIAL",requests=0;
 try{
  const largeFeed='<rss><channel><item><title>Release</title><description>'+('large feed content '.repeat(30000))+'</description></item></channel></rss>';
  globalThis.fetch=async()=>new Response(largeFeed,{headers:{'content-type':'application/rss+xml'}});
  const compressed=await handleRelayRequest(new Request('https://relay.example.invalid/v1/collect',{method:'POST',headers:{authorization:'Bearer fixture','accept-encoding':'gzip'},body:JSON.stringify({provider:'DEEPMIND_FEED'})}),{OVERSEAS_COLLECTOR_RELAY_SECRET:'fixture'});
  assert.equal(compressed.headers.get('content-encoding'),'gzip','LARGE_RELAY_BODY_IS_COMPRESSED');
  const bytes=await compressed.arrayBuffer();assert(bytes.byteLength<largeFeed.length/4,'TRANSFER_BYTES_REDUCED_WITHOUT_TRUNCATING_FEED');
  const decoded=JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
  assert.equal(decoded.rssText,largeFeed,'COMPRESSED_FEED_ROUNDTRIPS_EXACTLY');
  const disabled=await handleRelayRequest(new Request('https://relay.example.invalid/v1/collect',{method:'POST',headers:{authorization:'Bearer fixture','accept-encoding':'gzip;q=0, br'},body:JSON.stringify({provider:'DEEPMIND_FEED'})}),{OVERSEAS_COLLECTOR_RELAY_SECRET:'fixture'});
  assert.equal(disabled.headers.get('content-encoding'),null,'GZIP_Q_ZERO_IS_RESPECTED');
  assert.equal((await disabled.json()).rssText,largeFeed);
  const compact=await handleRelayRequest(new Request('https://relay.example.invalid/v1/collect',{method:'POST',headers:{authorization:'Bearer fixture','x-opc-relay-compact':'feed-v1'},body:JSON.stringify({provider:'DEEPMIND_FEED'})}),{OVERSEAS_COLLECTOR_RELAY_SECRET:'fixture'});
  const compactBody=await compact.json();assert.equal(compactBody.feedTextAlias,'text','OPT_IN_FEED_TEXT_ALIAS');assert.equal(compactBody.text,largeFeed);assert.equal(compactBody.rssText,undefined,'DUPLICATE_FEED_TEXT_NOT_TRANSFERRED');
  process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://relay.example.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture";process.env.OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES="v2";
  const restored=await collectThroughOverseasRelay({provider:'DEEPMIND_FEED',searchQuery:'',windowHours:168,resultLimit:1,minStars:0},async(_url,init)=>{assert.equal(new Headers(init?.headers).get('x-opc-relay-compact'),'feed-v1');return Response.json(compactBody);});
  assert.equal(restored.rssText,largeFeed,'CLIENT_RESTORES_LEGACY_FEED_ALIAS');
  globalThis.fetch=async(input,init)=>{
   const address=String(input);
   if(address==="https://relay.example.invalid/v1/collect")return handleRelayRequest(new Request(address,init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
   assert([url,deepmind,"https://til.simonwillison.net/feed"].includes(address),"NO_UNMANAGED_NETWORK");requests++;
   const headers=new Headers(init?.headers);
   if(mode==="REDIRECT" && address===url)return new Response(null,{status:302,headers:{location:"https://til.simonwillison.net/feed"}});
   if(mode==="REDIRECT"){assert.equal(headers.get("if-none-match"),null,"INITIAL_VALIDATOR_NOT_FORWARDED_TO_REDIRECT");return new Response('<feed/>',{headers:{etag:'"redirect"'}});}
   if(mode==="INITIAL"){assert.equal(headers.get("if-none-match"),null);return new Response('<feed/>',{headers:{etag:'"v1"',"last-modified":"Wed, 14 Oct 2026 00:00:00 GMT"}});}
   if(mode==="TIMEOUT")throw new DOMException("fixture timeout","AbortError");
   if(mode==="UNEXPECTED_304")return new Response(null,{status:304});
   assert.equal(headers.get("if-none-match"),'"v1"',"VALIDATOR_REACHES_UPSTREAM");
   return new Response(null,{status:304,headers:{etag:'"v1"'}});
  };
  const first=await collectRssDocument(url);assert.equal(first.validators.etag,'"v1"',"RELAY_PRESERVES_UPSTREAM_ETAG");
  mode="NOT_MODIFIED";const second=await collectRssDocument(url,{validators:first.validators});assert.equal(second.disposition,"NOT_MODIFIED");assert.equal(second.validators.lastModified,first.validators.lastModified);
  mode="INITIAL";const dm=await collectRssDocument(deepmind);assert.equal(dm.validators.etag,'"v1"');
  mode="NOT_MODIFIED";assert.equal((await collectRssDocument(deepmind,{validators:dm.validators})).disposition,"NOT_MODIFIED");
  mode="REDIRECT";const redirected=await collectRssDocument(url,{validators:first.validators});assert.equal(redirected.validators.etag,null,"REDIRECT_TARGET_ETAG_NOT_BOUND_TO_INITIAL_ROUTE");
  mode="INITIAL";await collectRssDocument(url,{validators:redirected.validators});
  const mismatched=await collectRssDocument(url,{fetchText:async()=>({status:200,body:'<feed/>',finalUrl:"https://til.simonwillison.net/feed",contentType:"application/xml",etag:'"other"'})});assert.equal(mismatched.validators.etag,null,"FEED_INJECTED_DOCUMENT_URI_SCOPE");
  mode="TIMEOUT";await assert.rejects(collectRssDocument(deepmind),/RELAY_UPSTREAM_TIMEOUT/);
  mode="UNEXPECTED_304";await assert.rejects(collectRssDocument(url));
  const before=requests;await assert.rejects(fetchPublicText(url,undefined,undefined,{etag:'bad\r\ninjected: value'}));assert.equal(requests,before,"INVALID_HEADERS_NEVER_REACH_UPSTREAM");
  const bad=await handleRelayRequest(new Request("https://relay.example.invalid/v1/collect",{method:"POST",headers:{authorization:"Bearer fixture"},body:JSON.stringify({provider:"PUBLIC_SOURCE_DOCUMENT",searchQuery:url,validators:{etag:"bad\r\nheader"}})}),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});assert.equal(bad.status,502);assert.equal(requests,before,"RELAY_ALSO_REJECTS_INVALID_VALIDATOR");
  globalThis.fetch=async()=>Response.json({rssText:'<feed/>'});assert.equal((await collectRssDocument(deepmind)).disposition,"NO_NEW_ITEMS","OLDER_RELAY_200_COMPATIBLE");
  globalThis.fetch=async()=>Response.json({text:"",url,status:304,contentType:""});await assert.rejects(collectRssDocument(url,{validators:first.validators}),"UNVERSIONED_304_REJECTED");
  globalThis.fetch=async()=>Response.json({text:"",url,status:"304",contentType:""});await assert.rejects(collectRssDocument(url,{validators:first.validators}),"NON_NUMERIC_STATUS_REJECTED");
  globalThis.fetch=async()=>{throw new DOMException('fixture headers timeout','TimeoutError');};
  await assert.rejects(collectRssDocument(deepmind),/OVERSEAS_COLLECTOR_RELAY_HEADERS_TIMEOUT/,'HEADERS_FAILURE_IS_DISTINCT_FROM_UPSTREAM');
  globalThis.fetch=async()=>new Response(new ReadableStream({start(controller){controller.error(new DOMException('fixture body timeout','TimeoutError'));}}));
  await assert.rejects(collectRssDocument(deepmind),/OVERSEAS_COLLECTOR_RELAY_BODY_TIMEOUT/,'BODY_FAILURE_IS_DISTINCT_FROM_UPSTREAM');
  console.log("RELAY_FEED_INCREMENTAL=PASS");
 }finally{globalThis.fetch=originalFetch;for(const key of keys){const value=saved.get(key);if(value===undefined)delete process.env[key];else process.env[key]=value;}}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
