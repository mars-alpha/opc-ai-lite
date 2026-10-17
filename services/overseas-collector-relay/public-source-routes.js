/** Shared public source transport policy. No Source identity or qualification grant. */
import {CURATED_PUBLISHER_FEEDS,curatedPublisherRoute} from "./curated-publisher-feeds.js";
export const PUBLIC_SOURCE_ROUTE_PROTOCOL="public-source-routes-v3";
export const LEGACY_PUBLIC_SOURCE_HOSTS=["simonwillison.net","til.simonwillison.net","blog.comfy.org"];
export const AUTHOR_FEED_HOSTS=["hamel.dev","eugeneyan.com",...CURATED_PUBLISHER_FEEDS.map(p=>new URL(p.home).hostname)];
/** Publisher-verified alias only; other hosts and slash patterns stay distinct. */
export function publicSourceArticleAlias(input){
 try{const u=new URL(input);return u.protocol==="https:" && u.hostname==="eugeneyan.com" && !u.port && !u.username && !u.password && !u.search && !u.hash && /^\/\/writing\/[a-z0-9-]+\/$/.test(u.pathname)?u.origin+u.pathname.slice(1):null;}catch{return null;}
}
/** Only an actually observed anchor on this exact homepage is a Feed declaration. */
export function publicSourceFeedAnchor(pageUrl,href){
 try{return pageUrl==="https://eugeneyan.com/" && new URL(href,pageUrl).href==="https://eugeneyan.com/rss/"?"https://eugeneyan.com/rss/":null;}catch{return null;}
}
export function publicSourceRoute(input){
 try{
  const u=new URL(input);
  if(u.protocol!=="https:" || u.port || u.username || u.password)return null;
  if(LEGACY_PUBLIC_SOURCE_HOSTS.includes(u.hostname))return {url:u.href,authorFeed:false};
  const curated=curatedPublisherRoute(input);if(curated)return {url:curated.url,authorFeed:true};
  if(u.hostname==="eugeneyan.com" && !u.search && !u.hash && u.pathname.length<=300 && !/%/.test(u.pathname)){
   const alias=publicSourceArticleAlias(u.href);
   return alias || ["/","/rss/"].includes(u.pathname) || /^\/writing\/[a-z0-9-]+\/$/.test(u.pathname)?{url:alias??u.href,authorFeed:true}:null;
  }
  if(u.hostname!=="hamel.dev" || u.search || u.hash || u.pathname.length>300 || /%/.test(u.pathname))return null;
  return ["/","/index.html","/index.xml"].includes(u.pathname) || /^\/blog\/posts\/[a-z0-9-]+\/(?:index\.html)?$/.test(u.pathname)?{url:u.href,authorFeed:true}:null;
 }catch{return null;}
}
/** Normalize only a verified, actually observed publisher home alias. */
export function publicSourceHomepageAlias(input){
 const route=publicSourceRoute(input);
 return route?.authorFeed && route.url==="https://hamel.dev/index.html"?"https://hamel.dev/":null;
}
