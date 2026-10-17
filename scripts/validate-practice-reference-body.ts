import assert from "node:assert/strict";
import {handleRelayRequest} from "../services/overseas-collector-relay/deno";
import {publicPracticeRoute} from "../services/overseas-collector-relay/public-practice-routes";
import {collectPublicPracticeContent,publicPracticeContentDue} from "../lib/server/content/public-practice-content";
import {evaluatePracticeMaterials} from "../lib/server/content/practice-materials";
async function main(){
 const urls=["https://huggingface.co/blog/nvidia/scaling-indic-pretraining","https://huggingface.co/blog/fine-tune-a-model","https://simonwillison.net/2026/Oct/16/build-an-agent/","https://til.simonwillison.net/llms/build-an-agent"];
 const denied=["https://huggingface.co/api/models","https://huggingface.co/blog","https://huggingface.co/blog/feed.xml","https://huggingface.co/blog/a/b/c","https://simonwillison.net/atom/entries/","https://simonwillison.net/2026/Nope/16/secret/","https://til.simonwillison.net/","https://til.simonwillison.net/a/b/c",...urls.flatMap(url=>[url+"?url=http://127.0.0.1/",url+"#one",url.replace("https://","http://"),url.replace(".net/",".net:444/").replace(".co/",".co:444/"),url.replace("https://","https://user:pass@")])];
 for(const url of urls)assert.equal(publicPracticeRoute(url)?.kind,"HTML","FIXED_SOURCE_ARTICLE_ROUTE_AVAILABLE");
 for(const url of denied)assert.equal(publicPracticeRoute(url),null,url);
 const html='<html><head><title>Build a working assistant</title></head><body><nav>Navigation</nav><article><h1>Build a working assistant</h1><p>Required input: notes and an installed runtime.</p><h2>Step 1</h2><p>Install the package. Configure the input_file=notes.txt and output_file=report.md parameters.</p><h2>Step 2</h2><p>Run the program and export the resulting report.</p><p>'+"The procedure processes the input documents and saves an organized report as output. ".repeat(10)+'</p></article><footer>Unrelated footer</footer></body></html>';
 const savedFetch=globalThis.fetch;let calls=0,mode="OK";
 try{
  globalThis.fetch=async(input,init)=>{
   calls++;assert(urls.includes(String(input)));assert.equal(init?.redirect,"error");assert(init?.signal);
   if(mode==="REDIRECT")return new Response(null,{status:302,headers:{location:"http://127.0.0.1/private"}});
   if(mode==="TOO_LARGE")return new Response("x".repeat(1_500_001));
   return new Response(mode==="INVALID"?"Not an article":html);
  };
  const relay=async(config:any)=>{
   const response=await handleRelayRequest(new Request("https://relay.example.invalid/v1/collect",{method:"POST",headers:{authorization:"Bearer fixture"},body:JSON.stringify(config)}),{OVERSEAS_COLLECTOR_RELAY_SECRET:"fixture"});
   const payload=await response.json();if(!response.ok)throw new Error(payload.error);return payload;
  };
  for(const url of urls){const result=await collectPublicPracticeContent({originalUrl:url,metadata:{referenceOnly:true,bodyStatus:"SEARCH_SNIPPET_ONLY"}},{relay});assert(result?.bodyText);assert(!String(result.bodyText).includes("Unrelated footer"));assert.equal((result.publicContentReceipt as any).url,url);assert.equal(publicPracticeContentDue({originalUrl:url,metadata:result}).due,false);assert(evaluatePracticeMaterials({originalUrl:url,metadata:result}).eligible);}
  const attachmentHtml=html.replace("</article>",'<a href="https://example.com/template.zip">Download workflow template</a></article>');
  const missing=await collectPublicPracticeContent({originalUrl:urls[0]},{relay:async()=>({url:urls[0],fetchedUrl:urls[0],status:200,html:attachmentHtml,observedAt:new Date().toISOString()})});
  assert(evaluatePracticeMaterials({originalUrl:urls[0],metadata:missing}).reasons.includes("REQUIRED_ARTIFACTS_UNVERIFIED"));
  for(const [state,error] of [["REDIRECT",/HTTP_302/],["TOO_LARGE",/TOO_LARGE/],["INVALID",/PAYLOAD_INVALID/]] as const){mode=state;await assert.rejects(collectPublicPracticeContent({originalUrl:urls[0]},{relay}),error);}
  const before=calls;assert.equal(await collectPublicPracticeContent({originalUrl:denied[0]},{relay}),null);assert.equal(calls,before);
  console.log("PRACTICE_REFERENCE_BODY_PROTOCOL=PASS;UPSTREAM=MOCK");
 }finally{globalThis.fetch=savedFetch;}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
