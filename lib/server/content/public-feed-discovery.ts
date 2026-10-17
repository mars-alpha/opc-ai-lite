import "server-only";
import {Parser} from "htmlparser2";
import {publicSourceFeedAnchor} from "../../../services/overseas-collector-relay/public-source-routes";
import {curatedPublisherFeed} from "../../../services/overseas-collector-relay/curated-publisher-feeds";

type FeedItem = {title:string;originalUrl?:string|null;publishedAt?:string|null};
type Dependencies = {
 fetchPage:(url:string)=>Promise<{body:string;finalUrl:string;contentType:string}>;
 parseFeed:(body:string,url:string)=>FeedItem[];
 collectFeed:(url:string)=>Promise<FeedItem[]>;
 allowedUrl?:(url:string)=>boolean;
};

// WHATWG alternate links / RSS Advisory Board autodiscovery. Network and redirect
// safety stay with fetchPublicText/collectRss; this module never fetches arbitrary links.
export function declaredFeedUrls(html:string,pageUrl:string) {
 const links:Array<{href:string;type:string;rel:string}>=[];
 let base=pageUrl;let baseSeen=false,unsafeBase=false;
 const anchors:string[]=[];
 const parser=new Parser({onopentag(name,attrs){
  if(name==="base" && attrs.href && !baseSeen){
   baseSeen=true;
   try {const resolved=new URL(attrs.href,pageUrl);if(resolved.origin===new URL(pageUrl).origin) base=resolved.href;else unsafeBase=true;}catch{unsafeBase=true;}
  }
  if(name==="link" && attrs.href) links.push({href:attrs.href,type:attrs.type ?? "",rel:attrs.rel ?? ""});
  if(name==="a" && attrs.href)anchors.push(attrs.href);
 }},{decodeEntities:true});
 parser.end(html);
 if(!unsafeBase)for(const href of anchors){try{const observed=publicSourceFeedAnchor(pageUrl,new URL(href,base).href);if(observed)links.push({href:observed,type:"application/rss+xml",rel:"alternate"});}catch{}}
 return [...new Set(links.flatMap(link=>{
  if(!link.rel.toLowerCase().split(/\s+/).includes("alternate") || !["application/rss+xml","application/atom+xml"].includes(link.type.toLowerCase().split(";")[0]!.trim())) return [];
  try {const url=new URL(link.href,base);return ["https:","http:"].includes(url.protocol)&&!url.username&&!url.password ? [url.href] : [];}catch{return [];}
 }))].slice(0,4);
}

export async function discoverPublicFeed(canonicalUrl:string,deps:Dependencies) {
 if(deps.allowedUrl && !deps.allowedUrl(canonicalUrl))return null;
 const result=(url:string,items:FeedItem[])=>({url,sampleCount:Math.min(items.length,5),samples:items.slice(0,3).map(item=>({title:item.title,url:item.originalUrl ?? url,publishedAt:item.publishedAt ?? null}))});
 let declared:string[]=[];
 try {
  const page=await deps.fetchPage(canonicalUrl);
  if(/xml|rss|atom/i.test(page.contentType)||/^\s*(?:<\?xml[^>]*>\s*)?<(?:rss|feed)\b/i.test(page.body)) {
   const items=deps.parseFeed(page.body,page.finalUrl);
   if(items.length) return result(page.finalUrl,items);
  }
  declared=declaredFeedUrls(page.body,page.finalUrl);
 }catch{}
 const target=new URL(canonicalUrl);
 const verified=curatedPublisherFeed(canonicalUrl);
 const fallback=[...(verified?[verified]:[]),...["/feed.xml","/rss.xml","/feed/","/atom.xml"].map(path=>new URL(path,target.origin).href)];
 // At most one page plus eight Feed attempts; no recursive crawling or browser.
 for(const url of [...new Set([...declared,...fallback])].slice(0,8)) {
  if(deps.allowedUrl && !deps.allowedUrl(url))continue;
  try {const items=await deps.collectFeed(url);if(items.length) return result(url,items);}catch{}
 }
 return null;
}
