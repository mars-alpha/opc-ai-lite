import assert from "node:assert/strict";
import {collectPublicPracticeContent,normalizePublicTranscript,mergePublicContentMetadata} from "../lib/server/content/public-practice-content";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
async function main(){
 assert.throws(()=>normalizePublicTranscript({body:[]}),/EMPTY/);
 assert.throws(()=>normalizePublicTranscript({body:[{from:2,to:1,content:"bad"}]}),/INVALID/);
 assert.equal(normalizePublicTranscript({body:[{from:0,to:1,content:"首先安装工具"},{from:1,to:2,content:"然后运行"}]}).text,"首先安装工具\n然后运行");
 const url="https://docs.comfy.org/tutorials/basic/text-to-image";
 const text="1. Configure input image.\n2. Run the workflow.\n3. Export the result.";
 const result=await collectPublicPracticeContent({originalUrl:url,metadata:{}},{relay:async()=>({provider:"PUBLIC_PRACTICE_DOCUMENT",url,fetchedUrl:url+".md",status:200,text,observedAt:new Date().toISOString()})});
 assert(result);
 assert.equal(result.bodyText,text);assert.equal((result.publicContentReceipt as any).url,url);
 assert.equal((result.publicContentReceipt as any).complete,true);
 assert.equal(await collectPublicPracticeContent({originalUrl:"https://127.0.0.1/private",metadata:{}}),null);
 const merged=mergePublicContentMetadata({manualDecision:"KEEP"},result);
 assert.equal(merged.manualDecision,"KEEP");assert.equal(merged.bodyText,text);
 assert.deepEqual(mergePublicContentMetadata(merged,{...result,publicContentReceipt:{...(result.publicContentReceipt as object),sha256:"bad"}}),merged);
 assert.deepEqual(mergePublicContentMetadata(merged,{...result,publicContentReceipt:{...(result.publicContentReceipt as object),anonymous:false}}),merged);
 assert.throws(()=>normalizePublicTranscript({body:[{from:2,to:3,content:"first"},{from:1,to:2,content:"backwards"}]}),/INVALID/);
 assert.throws(()=>normalizePublicTranscript({body:[{from:0,to:1,content:"x".repeat(60001)}]}),/TOO_LARGE/);
 assert.equal(mergePublicContentMetadata(merged,{publicContentAttempt:{status:"FAILED"}}).bodyText,text);
 const previous=globalThis.fetch;
 globalThis.fetch=async(input)=>{assert.equal(String(input),url+".md");return new Response(text);};
 try {
  const request=(searchQuery:string)=>new Request("https://relay.example/v1/collect",{method:"POST",headers:{authorization:"Bearer test"},body:JSON.stringify({provider:"PUBLIC_PRACTICE_DOCUMENT",searchQuery})});
  assert.equal((await handleRelayRequest(request(url),{OVERSEAS_COLLECTOR_RELAY_SECRET:"test"})).status,200);
  assert.equal((await handleRelayRequest(request("https://127.0.0.1/private"),{OVERSEAS_COLLECTOR_RELAY_SECRET:"test"})).status,400);
 }finally{globalThis.fetch=previous;}
 console.log("PUBLIC_PRACTICE_CONTENT=PASS");
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
