import assert from "node:assert/strict";
import {parseBraveSearchResults} from "../services/overseas-collector-relay/brave-search";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
import {collectEventExpansionSearch,ensureExpansionSource,isManagedPracticeSearchReady,providerQueryPlan,selectManagedPracticeSearchSources} from "../lib/server/content/collection-expansion";

async function main(){
 const savedFetch=globalThis.fetch,keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OPC_COLLECTION_BRAVE_SEARCH"],saved=new Map(keys.map(k=>[k,process.env[k]]));
 let calls=0,mode="OK",key:string|undefined="upstream-fixture";
 const sample={web:{results:[{title:"ComfyUI <b>workflow</b>",url:"https://example.com/tutorial#one",description:"<b>Steps</b> and materials",age:"1 day ago",page_age:"2026-10-16"}]}};
 const relayEnv=()=>({OVERSEAS_COLLECTOR_RELAY_SECRET:"relay-fixture",BRAVE_SEARCH_API_KEY:key});
 try{
  process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://relay.example.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="relay-fixture";
  globalThis.fetch=async(input,init)=>{
   if(String(input)==="https://relay.example.invalid/v1/collect")return handleRelayRequest(new Request(String(input),init),relayEnv());
   calls++;const url=new URL(String(input));assert.equal(url.origin+url.pathname,"https://api.search.brave.com/res/v1/web/search");
   assert.equal(url.searchParams.get("count"),"5");assert.equal(url.searchParams.get("offset"),"0");assert.equal(url.searchParams.get("freshness"),"pw");assert.equal(url.searchParams.get("q"),"ComfyUI tutorial");
   const headers=new Headers(init?.headers);assert.equal(headers.get("x-subscription-token"),"upstream-fixture");assert.equal(headers.get("authorization"),null);assert.equal(init?.redirect,"error");assert(init?.signal);
   if(mode==="429")return new Response("upstream-fixture",{status:429});
   if(mode==="REDIRECT")return new Response(null,{status:302,headers:{location:"https://evil.example"}});
   if(mode==="OVERSIZE")return new Response("x".repeat(250001));
   if(mode==="INVALID")return Response.json({error:{message:"upstream-fixture"}});
   if(mode==="NO_WEB")return Response.json({type:"search",query:{original:"ComfyUI tutorial"}});
   return Response.json(mode==="EMPTY"?{web:{results:[]}}:sample);
  };
  const collect=()=>collectEventExpansionSearch("BRAVE_SEARCH","ComfyUI tutorial",168,50,{fetchJson:async()=>{throw new Error("DIRECT_ROUTE_FORBIDDEN");}});
  delete process.env.OPC_COLLECTION_BRAVE_SEARCH;await assert.rejects(collect(),/BRAVE_SEARCH_RELAY_UNAVAILABLE/);assert.equal(calls,0);
  process.env.OPC_COLLECTION_BRAVE_SEARCH="v1";key=undefined;await assert.rejects(collect(),/RELAY_BRAVE_KEY_REQUIRED/);assert.equal(calls,0,"MISSING_KEY_NO_UPSTREAM");key="upstream-fixture";
  const result=await collect();assert.equal(result.items.length,1);assert.equal(result.items[0].publishedAt,null);assert.equal(result.items[0].metadata?.referenceOnly,true);assert.equal(result.items[0].metadata?.bodyStatus,"SEARCH_SNIPPET_ONLY");assert.equal(result.items[0].originalUrl,"https://example.com/tutorial");
  for(const [state,error] of [["429",/RELAY_UPSTREAM_HTTP_429/],["REDIRECT",/RELAY_UPSTREAM_HTTP_302/],["OVERSIZE",/RELAY_UPSTREAM_TOO_LARGE/],["INVALID",/RELAY_UPSTREAM_PAYLOAD_INVALID/],["NO_WEB",/RELAY_UPSTREAM_PAYLOAD_INVALID/]] as const){mode=state;await assert.rejects(collect(),error);}
  mode="EMPTY";assert.equal((await collect()).items.length,0);
  assert.throws(()=>parseBraveSearchResults({web:{results:[null]}}),/BRAVE_SEARCH_RESPONSE_INVALID/);
  const urls=["https://example.com/a#one","https://example.com/a#two","http://127.0.0.1/x","https://localhost/a","https://a.local/test","https://10.0.0.1/a","https://[::1]/a","https://user:pass@example.com/a","https://example.com:8443/a","file:///tmp/a","javascript:alert(1)"];
  assert.equal(parseBraveSearchResults({web:{results:urls.map(url=>({url,title:"Guide",description:"snippet"}))}}).length,1,"SAFE_DEDUPLICATED_REFERENCES_ONLY");
  assert.equal(parseBraveSearchResults({web:{results:Array.from({length:20},(_,i)=>({url:`https://example.com/${i}`,title:"Guide"}))}}).length,5);
  await assert.rejects(ensureExpansionSource("BRAVE_SEARCH"),/BRAVE_SEARCH_MANAGED_SOURCE_REQUIRED/);
  const source={enabled:true,status:"ACTIVE",platform:"WEB",canonicalUrl:"https://search.brave.com/",providerRef:"BRAVE_SEARCH",collectionMethod:"SEARCH",collectionConfig:{provider:"BRAVE_SEARCH",practiceExpansionEnabled:true,acquisition:{routes:[{id:"search",role:"PRIMARY",kind:"SEARCH_DISCOVERY"}]}},metadata:{currentPortfolio:true,runtimeQualification:{effectiveQualification:"CONDITIONAL"}}};
  assert.equal(isManagedPracticeSearchReady(source),true);
  const bili={...source,id:"bili",platform:"BILIBILI",providerRef:"BILIBILI_SEARCH",collectionConfig:{...source.collectionConfig,provider:"BILIBILI_SEARCH"}},brave={...source,id:"brave"};
  assert.deepEqual(selectManagedPracticeSearchSources([bili,brave], ["BILIBILI_SEARCH","BRAVE_SEARCH"]).map(s=>s.id),["brave","bili"],"GENERAL_WEB_PRIMARY_MUST_NOT_BE_PERMANENTLY_STARVED_BY_SUCCESSFUL_EMPTY_PLATFORM_SEARCH");
  delete process.env.OPC_COLLECTION_BRAVE_SEARCH;assert.equal(isManagedPracticeSearchReady(source),false);
  assert.deepEqual(selectManagedPracticeSearchSources([bili,brave],["BILIBILI_SEARCH","BRAVE_SEARCH"]).map(s=>s.id),["bili"]);
  const q={query:"specific tutorial",expansionType:"TUTORIAL" as const,language:"ZH" as const,priority:1};assert.equal(providerQueryPlan("BRAVE_SEARCH",{creatorQueries:[q]},3).length,1);
  console.log("BRAVE_SEARCH_PROTOCOL=PASS;UPSTREAM=MOCK;PAID_CALLS=0");
 }finally{globalThis.fetch=savedFetch;for(const k of keys){const v=saved.get(k);if(v===undefined)delete process.env[k];else process.env[k]=v;}}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
