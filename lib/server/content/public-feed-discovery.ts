import "server-only";
import {Parser} from "htmlparser2";

type FeedItem = {title:string;originalUrl?:string|null;publishedAt?:string|null};
type Dependencies = {
 fetchPage:(url:string)=>Promise<{body:string;finalUrl:string;contentType:string}>;
 parseFeed:(body:string,url:string)=>FeedItem[];
 collectFeed:(url:string)=>Promise<FeedItem[]>;
};

// WHATWG alternate links / RSS Advisory Board autodiscovery. Network and redirect
// safety stay with fetchPublicText/collectRss; this module never fetches arbitrary links.
export function declaredFeedUrls(html:string,pageUrl:string) {
 const links:Array<{href:string;type:string;rel:string}>=[];
 let base=pageUrl;let baseSeen=false;
 const parser=new Parser({onopentag(name,attrs){
  if(name==="base" && attrs.href && !baseSeen){
   baseSeen=true;
   try {const resolved=new URL(attrs.href,pageUrl);if(resolved.origin===new URL(pageUrl).origin) base=resolved.href;}catch{}
  }
  if(name==="link" && attrs.href) links.push({href:attrs.href,type:attrs.type ?? "",rel:attrs.rel ?? ""});
 }},{decodeEntities:true});
 parser.end(html);
 return [...new Set(links.flatMap(link=>{
  if(!link.rel.toLowerCase().split(/\s+/).includes("alternate") || !["application/rss+xml","application/atom+xml"].includes(link.type.toLowerCase().split(";")[0]!.trim())) return [];
  try {const url=new URL(link.href,base);return ["https:","http:"].includes(url.protocol)&&!url.username&&!url.password ? [url.href] : [];}catch{return [];}
 }))].slice(0,4);
}

export async function discoverPublicFeed(canonicalUrl:string,deps:Dependencies) {
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
 const fallback=["/feed.xml","/rss.xml","/feed/","/atom.xml"].map(path=>new URL(path,target.origin).href);
 // At most one page plus eight Feed attempts; no recursive crawling or browser.
 for(const url of [...new Set([...declared,...fallback])].slice(0,8)) {
  try {const items=await deps.collectFeed(url);if(items.length) return result(url,items);}catch{}
 }
 return null;
}
