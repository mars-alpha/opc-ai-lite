import "server-only";
import type {NormalizedCollectedItem} from "./collection-runner";
import {githubReleaseBase,githubReleaseNextPage,GITHUB_RELEASE_POLICY_VERSION,GITHUB_RELEASE_PAGE_SIZE,GITHUB_RELEASE_MAX_PAGE} from "../../../services/overseas-collector-relay/github-releases";
export type GithubReleaseCheckpoint={version:string;nextPage:number};
export type GithubReleasePageDocument={url:string;status:number;body:string;link:string|null};
const invalid=()=>new Error("GITHUB_RELEASE_PAYLOAD_INVALID");
export async function collectGithubReleaseDocument(input:{url:string;checkpoint?:unknown;signal?:AbortSignal;fetchPage:(url:string,signal:AbortSignal)=>Promise<GithubReleasePageDocument>}){
 const base=githubReleaseBase(input.url);if(!base)throw new Error("GITHUB_RELEASE_ROUTE_NOT_ALLOWED");
 const checkpoint=input.checkpoint as Partial<GithubReleaseCheckpoint>|undefined;
 const resume=checkpoint?.version===GITHUB_RELEASE_POLICY_VERSION && Number.isInteger(checkpoint.nextPage) && checkpoint.nextPage!>=2 && checkpoint.nextPage!<=GITHUB_RELEASE_MAX_PAGE?checkpoint.nextPage!:2;
 const pages=[...new Set([1,Math.max(2,resume-1),resume])];
 // Fresh scans have room for a third page; later scans replay the previous page.
 if(pages.length===2)pages.push(resume+1);
 const signal=AbortSignal.any([AbortSignal.timeout(30000),...(input.signal?[input.signal]:[])]);
 const items=new Map<string,NormalizedCollectedItem>(),scanned:number[]=[];
 let nextPage=resume,exhausted=false,pageLimitReached=false;
 for(const page of pages){
  if(page>GITHUB_RELEASE_MAX_PAGE){pageLimitReached=true;break;}
  signal.throwIfAborted();
  const url=`${base}?per_page=${GITHUB_RELEASE_PAGE_SIZE}&page=${page}`;
  const document=await input.fetchPage(url,signal);
  if(document.url!==url || document.status!==200)throw invalid();
  let rows:unknown;try{rows=JSON.parse(document.body);}catch{throw invalid();}
  if(!Array.isArray(rows) || rows.length>GITHUB_RELEASE_PAGE_SIZE)throw invalid();
  for(const row of rows){
   if(!row || typeof row!=="object")throw invalid();const r=row as Record<string,unknown>;
   if(typeof r.draft!=="boolean" || typeof r.prerelease!=="boolean" || !Number.isSafeInteger(r.id) || Number(r.id)<=0)throw invalid();
   if(r.draft)continue;
   const title=typeof r.name==="string" && r.name.trim()?r.name.trim():typeof r.tag_name==="string"?r.tag_name.trim():"";
   const publishedAt=typeof r.published_at==="string"?r.published_at:"";
   let html:URL;try{html=new URL(String(r.html_url));}catch{throw invalid();}
   const repo=new URL(base).pathname.slice(7,-9);
   if(!title || !Number.isFinite(Date.parse(publishedAt)) || html.protocol!=="https:" || html.hostname!=="github.com" || html.username || html.password || html.port || html.search || html.hash || !html.pathname.startsWith(`/${repo}/releases/tag/`) || (r.body!==null && typeof r.body!=="string"))throw invalid();
   const author=r.author && typeof r.author==="object"?(r.author as Record<string,unknown>).login:null;
   const externalId=String(r.id);
   if(!items.has(externalId))items.set(externalId,{externalId,originalUrl:html.href,title:title.slice(0,500),publishedAt,author:typeof author==="string"?author:null,excerpt:typeof r.body==="string"?r.body.slice(0,12000):null,metadata:{collector:"github-releases",contentType:"CHANGELOG",repository:repo,tag:r.tag_name,prerelease:r.prerelease,upstreamUpdatedAt:r.updated_at??null,coverage:"BOUNDED_PAGES_NO_ARCHIVE_GUARANTEE"}});
  }
  scanned.push(page);
  const nextLinks=(document.link??"").split(",").filter(part=>/;\s*rel="?next"?(?:\s*;|\s*$)/.test(part));
  if(nextLinks.length>1)throw invalid();
  if(nextLinks.length){const match=nextLinks[0].match(/^\s*<([^>]+)>/);const next=match?githubReleaseNextPage(match[1],base):null;if(!next || next.page!==page+1)throw invalid();}
  const hasMore=nextLinks.length>0 || rows.length===GITHUB_RELEASE_PAGE_SIZE;
  if(!hasMore){exhausted=true;nextPage=2;break;}
  nextPage=Math.max(nextPage,page+1);
 }
 if(nextPage>GITHUB_RELEASE_MAX_PAGE){pageLimitReached=true;nextPage=2;}
 return {items:[...items.values()],validators:{},truncated:false,disposition:items.size?"FETCHED":"NO_NEW_ITEMS",checkpoint:{version:GITHUB_RELEASE_POLICY_VERSION,nextPage},pagination:{version:GITHUB_RELEASE_POLICY_VERSION,scannedPages:scanned,nextPage,sweepReachedEnd:exhausted,pageLimitReached,coverage:"BOUNDED_PAGES_NO_ARCHIVE_GUARANTEE"}};
}
