import "server-only";
import {Parser} from "htmlparser2";
import {isPublicFeedRelayUrl} from "./overseas-collector-relay-client";
import {publicSourceHomepageAlias} from "../../../services/overseas-collector-relay/public-source-routes";

export const SOURCE_AUTO_ADMISSION_VERSION="source-auto-admission-v1";
export const sourceAdmissionMayStart=(deadline:number,now=Date.now())=>deadline-now>=35000;
export const admissionRecord=(value:unknown):Record<string,unknown>=>value && typeof value==="object" && !Array.isArray(value)?value as Record<string,unknown>:{};

/** Only an actually observed same-origin root link identifies a website here. */
export function observedWebsiteHomepage(html:string,pageUrl:string):string|null{
 try{
  const page=new URL(pageUrl);if(page.protocol!=="https:" || page.username || page.password || page.port)return null;
  const links:string[]=[];let base=page.href,baseSeen=false,unsafeBase=false;
  new Parser({onopentag(name,attrs){
   if(name==="base" && attrs.href && !baseSeen){baseSeen=true;try{const u=new URL(attrs.href,page);if(u.origin!==page.origin)unsafeBase=true;else base=u.href;}catch{unsafeBase=true;}}
   if(attrs.href && (name==="a" || name==="link" && (attrs.rel??"").toLowerCase().split(/\s+/).includes("home")))links.push(attrs.href);
  }},{decodeEntities:true}).end(html);
  if(unsafeBase)return null;
  for(const href of links){try{const u=new URL(href,base);if(u.origin===page.origin && !u.search && !u.hash && !u.username && !u.password){if(u.pathname==="/")return u.href;const alias=publicSourceHomepageAlias(u.href);if(alias)return alias;}}catch{}}
 }catch{}
 return null;
}

type Probe={canonicalUrl:string;kind:string;acquisition:string;acquisitionUrl:string|null;check:{passed:boolean;sampleCount:number};samples:Array<{title:string;url:string;publishedAt:string|null}>};
export function automaticSourceProbeDecision(candidate:Probe,now=Date.now()){
 let homepage=false;try{const url=new URL(candidate.canonicalUrl);homepage=url.pathname==="/" && !url.search && !url.hash;}catch{}
 if(!homepage || candidate.kind!=="WEBSITE")return {eligible:false,reason:"AUTOMATIC_WEBSITE_HOMEPAGE_REQUIRED"};
 if(!isPublicFeedRelayUrl(candidate.canonicalUrl) || !candidate.acquisitionUrl || !isPublicFeedRelayUrl(candidate.acquisitionUrl) || new URL(candidate.acquisitionUrl).origin!==new URL(candidate.canonicalUrl).origin || candidate.acquisition!=="RSS_ATOM")return {eligible:false,reason:"AUTOMATIC_RELAY_ROUTE_UNAVAILABLE"};
 if(!candidate.check.passed || candidate.check.sampleCount<1)return {eligible:false,reason:"AUTOMATIC_LIVE_SAMPLE_REQUIRED"};
 const dated=candidate.samples.some(sample=>{
  try{const url=new URL(sample.url),at=Date.parse(sample.publishedAt??"");return sample.title.trim().length>=3 && url.protocol==="https:" && !url.username && !url.password && !url.port && Number.isFinite(at) && at<=now;}catch{return false;}
 });
 return dated?{eligible:true,reason:"AUTOMATIC_PUBLIC_FEED_VERIFIED"}:{eligible:false,reason:"AUTOMATIC_TIME_SEMANTICS_UNVERIFIED"};
}

export function sourceAdmissionDue(raw:{originalUrl:string|null;contentHash:string;metadata:unknown},now=Date.now()){
 const state=admissionRecord(admissionRecord(raw.metadata).sourceAdmission);
 if(state.version!==SOURCE_AUTO_ADMISSION_VERSION || state.originalUrl!==raw.originalUrl || state.contentHash!==raw.contentHash)return true;
 if(["REGISTERED","EXISTING","BLOCKED_SOURCE","NO_OBSERVED_HOMEPAGE","REJECTED"].includes(String(state.status)))return false;
 const next=Date.parse(String(state.nextRetryAt??"")),attempt=Date.parse(String(state.lastAttemptAt??""));
 return Number.isFinite(next) && Number.isFinite(attempt) && attempt<=now && next<=now;
}
