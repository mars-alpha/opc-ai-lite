import {RADAR_SOURCE_PORTFOLIO} from "./radar-source-portfolio";
import {REQUESTED_SOURCE_TARGETS} from "./requested-source-targets";

export const SOURCE_WATCHLIST_GROUPS=["OFFICIAL_PRODUCT","OPEN_SOURCE_RESEARCH","MEDIA_AUTHOR","HANDS_ON"] as const;
type Group=typeof SOURCE_WATCHLIST_GROUPS[number];
export type WatchlistSource={id:string;name:string;providerRef:string|null;canonicalUrl:string|null;urls:string[];current:boolean;status:string;enabled:boolean};
const obj=(v:unknown)=>v && typeof v==="object" && !Array.isArray(v)?v as Record<string,unknown>:{};
export function portfolioSeedRefreshAllowed(source:{status:string;enabled:boolean;metadata:unknown}){
 const metadata=obj(source.metadata);
 return source.status==="ACTIVE" && source.enabled && metadata.managementDisabled!==true && metadata.currentPortfolio!==false;
}
const normalized=(url:string|null)=>{try{return url?new URL(url).href:null;}catch{return null;}};

export function buildSourceWatchlist(sources:WatchlistSource[]){
 const targets=RADAR_SOURCE_PORTFOLIO.map(entry=>{
  const groups:Group[]=[];
  if(entry.sourceType==="OFFICIAL")groups.push("OFFICIAL_PRODUCT");
  if(entry.sourceType==="RESEARCH")groups.push("OPEN_SOURCE_RESEARCH");
  if(["MEDIA","DEVELOPER"].includes(entry.sourceType) && !entry.referenceOnly || entry.coverage?.sourceUniverseRole==="CREATOR")groups.push("MEDIA_AUTHOR");
  if(entry.contentTypes.some(t=>["TUTORIAL","EXPERIENCE","USE_CASE"].includes(t)))groups.push("HANDS_ON");
  return {key:entry.key,sourceId:entry.sourceId,providerRef:entry.providerRef,urls:[entry.canonicalUrl,...entry.acquisition.routes.map(r=>r.url)].filter((u):u is string=>Boolean(u)),groups};
 }).filter(target=>target.groups.length>0);
 // Expected objects are references only: never synthesize Source/official identity.
 targets.push(
  {key:"required_anthropic_news",sourceId:"source_radar_official_anthropic",providerRef:"RADAR_OFFICIAL_ANTHROPIC",urls:["https://www.anthropic.com/news"],groups:["OFFICIAL_PRODUCT"]},
  {key:"required_huggingface_blog",sourceId:"source_radar_official_huggingface",providerRef:"RADAR_OFFICIAL_HUGGINGFACE",urls:["https://huggingface.co/blog/feed.xml"],groups:["OPEN_SOURCE_RESEARCH","HANDS_ON"]},
  {key:"required_claude_code_releases",sourceId:"source_radar_claude_code_changelog",providerRef:"RADAR_CLAUDE_CODE_CHANGELOG",urls:["https://github.com/anthropics/claude-code/releases.atom"],groups:["OFFICIAL_PRODUCT","OPEN_SOURCE_RESEARCH"]}
 );
 const items=targets.map(target=>{
  const urls=new Set(target.urls.map(normalized).filter(Boolean));
  const matches=sources.filter(s=>s.id===target.sourceId || s.providerRef===target.providerRef || [s.canonicalUrl,...s.urls].some(url=>Boolean(normalized(url) && urls.has(normalized(url)))));
  const current=matches.filter(s=>s.current && s.enabled && s.status==="ACTIVE");
  const status=current.length>1?"IDENTITY_AMBIGUOUS":current.length===1?"TRACKED_NOT_PROBED":matches.length?"INACTIVE_EXISTING":"MISSING_SOURCE";
  return {key:target.key,groups:target.groups,status,sourceIds:current.map(s=>s.id),existingSourceIds:matches.map(s=>s.id),declaredUrls:target.urls};
 });
 const requestedSources=REQUESTED_SOURCE_TARGETS.map(target=>{
  const urls=new Set(target.identityUrls.map(normalized).filter(Boolean));
  const matches=sources.filter(s=>[s.canonicalUrl,...s.urls].some(url=>Boolean(normalized(url) && urls.has(normalized(url)))));
  const current=matches.filter(s=>s.current && s.enabled && s.status==="ACTIVE");
  return {...target,status:!target.identityUrls.length?"IDENTITY_UNRESOLVED":current.length>1?"IDENTITY_AMBIGUOUS":current.length===1?"TRACKED_NOT_PROBED":matches.length?"INACTIVE_EXISTING":"MISSING_SOURCE",sourceIds:current.map(s=>s.id),existingSourceIds:matches.map(s=>s.id),verification:"CONFIGURATION_ONLY_NOT_LIVE_ACCEPTANCE"};
 });
 return {version:"source-watchlist-v2",groups:SOURCE_WATCHLIST_GROUPS.map(group=>({group,targets:items.filter(i=>i.groups.includes(group)).length,tracked:items.filter(i=>i.groups.includes(group) && i.status==="TRACKED_NOT_PROBED").length})),items,requestedSources};
}
