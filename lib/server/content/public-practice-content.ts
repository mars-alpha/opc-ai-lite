import "server-only";
import {createHash} from "node:crypto";
import {collectThroughOverseasRelay} from "./overseas-collector-relay-client";
import {evaluatePracticeMaterials} from "./practice-materials";
import {publicPracticeRoute} from "../../../services/overseas-collector-relay/public-practice-routes";
import {extractPublicPracticeArticle} from "./public-article-extraction";
const obj=(value:unknown):Record<string,any>=>value && typeof value==="object" && !Array.isArray(value)?value as Record<string,any>:{};
const sha=(text:string)=>createHash("sha256").update(text).digest("hex");
export const PUBLIC_PRACTICE_CONTENT_VERSION="public-practice-content-v3";
export function publicPracticeContentDue(input:{originalUrl?:string|null;metadata?:unknown},now=Date.now()) {
 const url=input.originalUrl??"", metadata=obj(input.metadata),receipt=obj(metadata.publicContentReceipt),attempt=obj(metadata.publicContentAttempt);
 const route=publicPracticeRoute(url);
 if((!route || route.kind==="ARTIFACT") && !/^https:\/\/www\.bilibili\.com\/video\/BV[a-zA-Z0-9]+\/?$/.test(url))return {due:false,reason:"NO_PUBLIC_CONTENT_ROUTE"};
 const text=receipt.kind==="BODY"?metadata.bodyText:receipt.kind==="TRANSCRIPT"?metadata.transcriptText:null;
 const age=now-Date.parse(receipt.observedAt);
 const valid=receipt.url===url && receipt.status===200 && receipt.anonymous===true && receipt.serverFetched===true && receipt.complete===true && typeof text==="string" && Boolean(text.trim()) && receipt.sha256===sha(text) && metadata.fullTextTruncated!==true && metadata.transcriptTruncated!==true;
 if(valid && age>=0 && age<(evaluatePracticeMaterials(input).eligible?7*86400000:86400000))return {due:false,reason:"VERIFIED_CONTENT_REUSED"};
 if(attempt.version===PUBLIC_PRACTICE_CONTENT_VERSION && Date.parse(attempt.nextRetryAt)>now)return {due:false,reason:"PUBLIC_CONTENT_RETRY_BACKOFF"};
 return {due:true,reason:"PUBLIC_CONTENT_DUE"};
}
export function normalizePublicTranscript(payload:unknown){
 const cues=obj(payload).body;
 if(!Array.isArray(cues)||!cues.length)throw new Error("PUBLIC_TRANSCRIPT_EMPTY");
 let previous=-1;
 const lines=cues.map(value=>{const c=obj(value);if(!Number.isFinite(c.from)||!Number.isFinite(c.to)||c.from<previous||c.to<=c.from||typeof c.content!=="string"||!c.content.trim())throw new Error("PUBLIC_TRANSCRIPT_INVALID");previous=c.from;return c.content.trim();});
 const text=lines.join("\n");if(text.length>60000)throw new Error("PUBLIC_TRANSCRIPT_TOO_LARGE");
 return {text,cueCount:cues.length,lastCueEnd:obj(cues.at(-1)).to};
}
async function publicJson(url:string,fetchImpl:typeof fetch){
 const u=new URL(url);if(u.protocol!=="https:" || !(u.hostname==="api.bilibili.com" || /(^|\.)hdslb\.com$/.test(u.hostname)))throw new Error("PUBLIC_CONTENT_HOST_DENIED");
 const response=await fetchImpl(u,{redirect:"error",signal:AbortSignal.timeout(5000),headers:{accept:"application/json"}});
 if(response.status!==200)throw new Error("PUBLIC_CONTENT_HTTP_"+response.status);
 const reader=response.body?.getReader();if(!reader)throw new Error("PUBLIC_CONTENT_EMPTY");
 const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const n=await reader.read();if(n.done)break;size+=n.value.byteLength;if(size>1000000)throw new Error("PUBLIC_CONTENT_TOO_LARGE");chunks.push(n.value);}}finally{await reader.cancel();}
 return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
type Dependencies={relay?: (config:Parameters<typeof collectThroughOverseasRelay>[0])=>Promise<Record<string,unknown>>;fetchImpl?:typeof fetch};
export async function collectPublicPracticeContent(input:{originalUrl?:string|null;metadata?:unknown},deps:Dependencies={}):Promise<Record<string,unknown>|null>{
 const url=input.originalUrl??"";
 if(!publicPracticeContentDue(input).due)return null;
 const route=publicPracticeRoute(url);
 if(route && route.kind!=="ARTIFACT"){
  const canonical=route.url;
  const result=await (deps.relay??collectThroughOverseasRelay)({provider:"PUBLIC_PRACTICE_DOCUMENT",searchQuery:canonical,windowHours:168,resultLimit:1,minStars:0});
  if(result.url!==canonical || result.fetchedUrl!==(route.kind==="HTML"?canonical:canonical+".md") || result.status!==200)throw new Error("PUBLIC_DOCUMENT_INVALID");
  if(route.kind==="HTML") {
   if(typeof result.html!=="string")throw new Error("PUBLIC_DOCUMENT_INVALID");
   const article=extractPublicPracticeArticle(result.html,canonical);
   const requiredMaterials:Record<string,unknown>[]=[];
   const links=[...new Map(article.materialLinks.map(link=>[link.url,link])).values()];
   for(const link of links.slice(0,2)) {
    const artifactUrl=link.url.replace("https://github.com/Comfy-Org/ComfyUI_Nvidia_VFX_Nodes/blob/main/","https://raw.githubusercontent.com/Comfy-Org/ComfyUI_Nvidia_VFX_Nodes/main/");
    if(publicPracticeRoute(artifactUrl)?.kind!=="ARTIFACT")continue;
    try {
     const artifact=await (deps.relay??collectThroughOverseasRelay)({provider:"PUBLIC_PRACTICE_DOCUMENT",searchQuery:artifactUrl,windowHours:168,resultLimit:1,minStars:0});
     if(artifact.url!==artifactUrl || artifact.status!==200 || typeof artifact.artifactText!=="string" || Buffer.byteLength(artifact.artifactText)>1_500_000)continue;
     const workflow=JSON.parse(artifact.artifactText);
     if(!Array.isArray(workflow.nodes) || !workflow.nodes.length || !Array.isArray(workflow.links))continue;
     requiredMaterials.push({url:link.url,fetchedUrl:artifactUrl,status:200,anonymous:true,serverFetched:true,observedAt:artifact.observedAt,sha256:sha(artifact.artifactText),bytes:Buffer.byteLength(artifact.artifactText),nodeCount:workflow.nodes.length,verification:"DOWNLOADED_COMPLETE_STRUCTURE_VERIFIED_NOT_EXECUTED"});
    } catch {/* The body is retained; a missing dependency never becomes verified. */}
   }
   return {bodyText:article.text,fullTextTruncated:false,bodyStatus:"COMPLETE_PUBLIC_ARTICLE",publicContentReceipt:{version:2,url,fetchedUrl:canonical,status:200,anonymous:true,serverFetched:true,complete:true,kind:"BODY",observedAt:result.observedAt,sha256:sha(article.text),characters:article.text.length,extraction:"MOZILLA_READABILITY_STATIC_DOM",originalTitle:article.title,author:article.byline,requiresExternalMaterials:links.length>0,requiredMaterials,unverifiedMaterialCount:links.length-requiredMaterials.length,materialLinks:links}};
  }
  if(typeof result.text!=="string" || !result.text.trim() || result.text.length>60000)throw new Error("PUBLIC_DOCUMENT_INVALID");
  const text=result.text;
  return {bodyText:text,fullTextTruncated:false,bodyStatus:"COMPLETE_PUBLIC_MARKDOWN",publicContentReceipt:{version:1,url,fetchedUrl:result.fetchedUrl,status:200,anonymous:true,serverFetched:true,complete:true,kind:"BODY",observedAt:result.observedAt,sha256:sha(text),characters:text.length,requiresExternalMaterials:result.requiresExternalMaterials===true,requiredMaterials:result.requiredMaterials??[],unverifiedMaterialCount:result.unverifiedMaterialCount??0}};
 }
 const bvid=url.match(/^https:\/\/www\.bilibili\.com\/video\/(BV[a-zA-Z0-9]+)\/?$/)?.[1];
 if(!bvid)return null;
 const fetchImpl=deps.fetchImpl??fetch;
 const view=obj(await publicJson("https://api.bilibili.com/x/web-interface/view?bvid="+bvid,fetchImpl));
 if(view.code!==0)throw new Error("PUBLIC_VIDEO_UNAVAILABLE");
 const data=obj(view.data);
 if(!Number.isSafeInteger(data.aid)||!Number.isSafeInteger(data.cid))throw new Error("PUBLIC_VIDEO_IDS_INVALID");
 const player=obj(await publicJson(`https://api.bilibili.com/x/player/v2?aid=${data.aid}&cid=${data.cid}`,fetchImpl));
 const tracks=obj(obj(player.data).subtitle).subtitles;
 const track=Array.isArray(tracks)?tracks.find(t=>typeof obj(t).subtitle_url==="string"):null;
 if(player.code!==0||!track)throw new Error("PUBLIC_CAPTIONS_UNAVAILABLE_NO_LOGIN_FALLBACK");
 const trackUrl=new URL(obj(track).subtitle_url,"https://api.bilibili.com").href;
 const transcript=normalizePublicTranscript(await publicJson(trackUrl,fetchImpl));
 return {transcriptText:transcript.text,transcriptStatus:"COMPLETE_PUBLIC_CAPTIONS",transcriptTruncated:false,publicContentReceipt:{version:1,url,fetchedUrl:trackUrl,status:200,anonymous:true,serverFetched:true,complete:true,kind:"TRANSCRIPT",observedAt:new Date().toISOString(),sha256:sha(transcript.text),characters:transcript.text.length,cueCount:transcript.cueCount,lastCueEnd:transcript.lastCueEnd}};
}
/** Material-only upgrades cannot replace source identity, editorial decisions or facts. */
export function mergePublicContentMetadata(existing:unknown,incoming:unknown):Record<string,unknown>{
 const current=obj(existing), next=obj(incoming), receipt=obj(next.publicContentReceipt);
 if(receipt.complete!==true || receipt.serverFetched!==true || receipt.anonymous!==true)return {...current,...(next.publicContentAttempt?{publicContentAttempt:next.publicContentAttempt}:{})};
 const text=receipt.kind==="BODY"?next.bodyText:next.transcriptText;
 if(typeof text!=="string" || receipt.sha256!==sha(text))return current;
 const keys=["bodyText","bodyStatus","transcriptText","transcriptStatus","transcriptTruncated","fullTextTruncated","publicContentReceipt","publicContentAttempt"];
 if(next.collector==="pixaroma-public-workflows" && next.publicMaterials)keys.push("publicMaterials");
 return {...current,...Object.fromEntries(keys.filter(key=>key in next).map(key=>[key,next[key]]))};
}
