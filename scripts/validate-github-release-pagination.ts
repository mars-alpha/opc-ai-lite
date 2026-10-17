import assert from "node:assert/strict";
import * as release from "../lib/server/content/source-acquisition-runtime-adapters";
import {githubReleaseBase,githubReleasePage} from "../services/overseas-collector-relay/github-releases";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
import {collectGithubReleasePageThroughRelay} from "../lib/server/content/overseas-collector-relay-client";
async function main(){
 assert.equal(typeof (release as Record<string,unknown>).collectGithubReleaseDocument,"function","GITHUB_RELEASES_HAS_PERSISTENT_PAGINATION");
 const base="https://api.github.com/repos/anthropics/claude-code/releases";
 const row=(id:number)=>({id,name:"Claude AI release "+id,tag_name:"v"+id,html_url:"https://github.com/anthropics/claude-code/releases/tag/v"+id,published_at:"2026-10-15T12:00:00Z",draft:false,prerelease:false,body:"AI agent release notes",author:{login:"claude"}});
 for(const bad of [base+"?page=1",base+"/latest",base.replace("api.github.com","api.github.com.evil.org"),base.replace("anthropics","unknown"),base+"#secret",base.replace("https:","http:")])assert.equal(githubReleaseBase(bad),null);
 for(const query of ["?per_page=100&page=1","?per_page=30&page=0","?per_page=30&page=01","?per_page=30&page=1001","?per_page=30&page=1&url=https://evil.org","?per_page=30&page=1&page=2"])assert.equal(githubReleasePage(base+query),null);
 let calls:number[]=[],rows=Array.from({length:150},(_,i)=>row(1000-i));
 const fetchPage=async(url:string)=>{const page=githubReleasePage(url)!;calls.push(page.page);return {url,status:200,link:null,body:JSON.stringify(rows.slice((page.page-1)*30,page.page*30))};};
 const first=await release.collectGithubReleaseDocument({url:base,fetchPage});assert.deepEqual(calls,[1,2,3]);assert.equal(first.items.length,90);assert.equal(first.checkpoint.nextPage,4);assert.equal(first.pagination.sweepReachedEnd,false);
 rows.unshift(row(1001));calls=[];
 const second=await release.collectGithubReleaseDocument({url:base,checkpoint:JSON.parse(JSON.stringify(first.checkpoint)),fetchPage});assert.deepEqual(calls,[1,3,4],"HEAD_AND_PREVIOUS_PAGE_REPLAY_AFTER_RESTART");assert(second.items.some(r=>r.externalId==="1001"));assert.equal(second.checkpoint.nextPage,5);
 calls=[];const last=await release.collectGithubReleaseDocument({url:base,checkpoint:second.checkpoint,fetchPage});assert.deepEqual(calls,[1,4,5]);assert.equal(last.checkpoint.nextPage,6);
 calls=[];const end=await release.collectGithubReleaseDocument({url:base,checkpoint:last.checkpoint,fetchPage});assert.deepEqual(calls,[1,5,6]);assert.equal(end.pagination.sweepReachedEnd,true);assert.equal(end.checkpoint.nextPage,2);
 const same=await release.collectGithubReleaseDocument({url:base,fetchPage:async url=>({url,status:200,link:null,body:JSON.stringify([row(1),row(1),{...row(2),prerelease:true},{...row(3),draft:true}])})});assert.equal(same.items.length,2);assert.equal(same.items[0].externalId,"1");assert.equal(same.items[1].metadata?.prerelease,true);
 const empty=await release.collectGithubReleaseDocument({url:base,fetchPage:async url=>({url,status:200,link:null,body:"[]"})});assert.equal(empty.disposition,"NO_NEW_ITEMS");assert.equal(empty.pagination.sweepReachedEnd,true);
 const numericLink=await release.collectGithubReleaseDocument({url:base,fetchPage:async url=>({url,status:200,link:githubReleasePage(url)!.page===1?'<https://api.github.com/repositories/937253475/releases?per_page=30&page=2>; rel="next"':null,body:JSON.stringify([row(1)])})});assert.deepEqual(numericLink.pagination.scannedPages,[1,2],"VERIFIED_REPOSITORY_ID_LINK_IS_NOT_AN_ARBITRARY_REDIRECT");
 for(const body of ['{}','{bad',JSON.stringify([{...row(1),published_at:null}]),JSON.stringify([{...row(1),html_url:"https://evil.org/x"}])])await assert.rejects(release.collectGithubReleaseDocument({url:base,fetchPage:async url=>({url,status:200,link:null,body})}),/GITHUB_RELEASE_PAYLOAD_INVALID/);
 await assert.rejects(release.collectGithubReleaseDocument({url:base,fetchPage:async url=>({url,status:200,link:'<https://evil.org/x>; rel="next"',body:JSON.stringify([row(1)])})}),/GITHUB_RELEASE_PAYLOAD_INVALID/);
 await assert.rejects(release.collectGithubReleaseDocument({url:base,fetchPage:async url=>({url,status:200,link:'<https://api.github.com/repositories/307213173/releases?per_page=30&page=2>; rel="next"',body:JSON.stringify([row(1)])})}),/GITHUB_RELEASE_PAYLOAD_INVALID/);
 calls=[];const limit=await release.collectGithubReleaseDocument({url:base,checkpoint:{version:first.checkpoint.version,nextPage:1000},fetchPage:async url=>{const page=githubReleasePage(url)!.page;calls.push(page);return {url,status:200,link:page===1000?'<'+base+'?per_page=30&page=1001>; rel="next"':null,body:JSON.stringify(Array.from({length:30},(_,i)=>row(i+1)))};}});assert.equal(limit.pagination.pageLimitReached,true);assert.equal(limit.checkpoint.nextPage,2);assert.deepEqual(calls,[1,999,1000]);
 const cancelled=AbortSignal.abort();await assert.rejects(release.collectGithubReleaseDocument({url:base,signal:cancelled,fetchPage}));
 const originalFetch=globalThis.fetch,keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OPC_COLLECTION_GITHUB_RELEASES"];
 const saved=new Map(keys.map(k=>[k,process.env[k]]));
 try{
  let upstream=0,mode="OK";globalThis.fetch=async(input,init)=>{
   if(String(input)==="https://relay.invalid/v1/collect")return handleRelayRequest(new Request(String(input),init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
   upstream++;assert.equal(String(input),base+"?per_page=30&page=2");assert.equal(init?.redirect,"error");
   if(mode==="429")return new Response(null,{status:429});
   if(mode==="302")return new Response(null,{status:302,headers:{location:"https://evil.org/x"}});
   return Response.json([row(1)],{headers:{link:'<'+base+'?per_page=30&page=3>; rel="next"'}});
  };
  const relay=await handleRelayRequest(new Request("https://relay.invalid/v1/collect",{method:"POST",headers:{authorization:"Bearer fixture"},body:JSON.stringify({provider:"GITHUB_RELEASES",searchQuery:base+"?per_page=30&page=2"})}),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});assert.equal(relay.status,200,"FIXED_RELEASE_API_EXECUTABLE");assert.equal(upstream,1);
  process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://relay.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture";delete process.env.OPC_COLLECTION_GITHUB_RELEASES;
  await assert.rejects(collectGithubReleasePageThroughRelay(base+"?per_page=30&page=2"),/GITHUB_RELEASE_RELAY_UNAVAILABLE/);assert.equal(upstream,1,"MISSING_CONFIG_CANNOT_FALL_BACK_DIRECTLY");
  process.env.OPC_COLLECTION_GITHUB_RELEASES="v1";assert.equal((await collectGithubReleasePageThroughRelay(base+"?per_page=30&page=2")).status,200);
  mode="429";await assert.rejects(collectGithubReleasePageThroughRelay(base+"?per_page=30&page=2"),/RELAY_UPSTREAM_HTTP_429/);
  mode="302";await assert.rejects(collectGithubReleasePageThroughRelay(base+"?per_page=30&page=2"),/RELAY_UPSTREAM_HTTP_302/);
  const before=upstream;
  for(const bad of [base+"?per_page=100&page=1",base+"?per_page=30&page=1&url=https://evil.org"]){const response=await handleRelayRequest(new Request("https://relay.invalid/v1/collect",{method:"POST",headers:{authorization:"Bearer fixture"},body:JSON.stringify({provider:"GITHUB_RELEASES",searchQuery:bad})}),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});assert.equal(response.status,400);}
  assert.equal(upstream,before,"BAD_URL_REJECTED_BEFORE_FETCH");
 }finally{globalThis.fetch=originalFetch;for(const k of keys){const v=saved.get(k);if(v===undefined)delete process.env[k];else process.env[k]=v;}}
 console.log("GITHUB_RELEASE_PAGINATION=PASS");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
