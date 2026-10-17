import {loadEnvConfig} from "@next/env";
import {collectGithubReleaseDocument} from "../lib/server/content/github-release-pagination";
import {collectGithubReleasePageThroughRelay} from "../lib/server/content/overseas-collector-relay-client";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
import {GITHUB_RELEASE_REPOSITORIES,githubReleasePage} from "../services/overseas-collector-relay/github-releases";
loadEnvConfig(process.cwd());
async function main(){
 const mode=process.argv.find(a=>a.startsWith("--mode="))?.slice(7)??"relay";
 if(!["relay","local-handler"].includes(mode))throw new Error("PROBE_MODE_INVALID");
 const repository=process.argv.find(a=>a.startsWith("--repository="))?.slice(13)??GITHUB_RELEASE_REPOSITORIES[0];
 if(!GITHUB_RELEASE_REPOSITORIES.includes(repository))throw new Error("GITHUB_RELEASE_ROUTE_NOT_ALLOWED");
 const originalFetch=globalThis.fetch,keys=["OVERSEAS_COLLECTOR_RELAY_URL","OVERSEAS_COLLECTOR_RELAY_SECRET","OPC_COLLECTION_GITHUB_RELEASES"];
 const saved=new Map(keys.map(k=>[k,process.env[k]]));
 try{
  if(mode==="local-handler"){
   process.env.OVERSEAS_COLLECTOR_RELAY_URL="https://release-probe.invalid";process.env.OVERSEAS_COLLECTOR_RELAY_SECRET="fixture";process.env.OPC_COLLECTION_GITHUB_RELEASES="v1";
   globalThis.fetch=async(input,init)=>{
    if(String(input)==="https://release-probe.invalid/v1/collect")return handleRelayRequest(new Request(String(input),init),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
    if(githubReleasePage(String(input))?.base!==`https://api.github.com/repos/${repository}/releases`)throw new Error("PROBE_UPSTREAM_NOT_ALLOWED");
    return originalFetch(input,init);
   };
  }
  const result=await collectGithubReleaseDocument({url:`https://api.github.com/repos/${repository}/releases`,fetchPage:collectGithubReleasePageThroughRelay});
  console.log(JSON.stringify({mode,repository,asOf:new Date().toISOString(),databaseMutation:false,productionServerAcceptance:false,status:result.items.length?"LIVE_RELEASE_SAMPLE":"EMPTY_SAMPLE",samples:result.items.length,datedSamples:result.items.filter(i=>i.publishedAt && Number.isFinite(Date.parse(i.publishedAt))).length,pagination:result.pagination},null,2));
 }finally{globalThis.fetch=originalFetch;for(const k of keys){const v=saved.get(k);if(v===undefined)delete process.env[k];else process.env[k]=v;}}
}
main().catch(error=>{console.error(JSON.stringify({status:"UNAVAILABLE",productionServerAcceptance:false,reason:error instanceof Error && /^[A-Z0-9_:]+$/.test(error.message)?error.message:"PROBE_FAILED"}));process.exitCode=1;});
