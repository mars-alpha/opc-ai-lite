// Shared protocol boundary; neither discovery snippets nor crawl ages establish facts/dates.
export const BRAVE_SEARCH_PROTOCOL = "brave-search-bounded-v1";
export const BRAVE_SEARCH_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";
function clean(value,limit){return typeof value==="string"?value.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,limit):"";}
function referenceUrl(value){
 try{
  if(typeof value!=="string" || value.length>4096)return null;
  const url=new URL(value),host=url.hostname;
  // References are never fetched here. Reject local/IP/credential URLs before downstream ingestion.
  if(url.protocol!=="https:" || url.port || url.username || url.password || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/i.test(host) || /(?:^|\.)(?:localhost|local|internal|test|invalid|example|onion)$/i.test(host))return null;
  url.hash="";return url.href;
 }catch{return null;}
}
export function parseBraveSearchResults(payload,resultLimit=5){
 const rows=payload?.web?.results;
 if(!payload || typeof payload!=="object" || Array.isArray(payload) || payload.error || !Array.isArray(rows) || rows.length>20)throw new Error("BRAVE_SEARCH_RESPONSE_INVALID");
 const seen=new Set(),items=[];
 for(const row of rows){
  if(!row || typeof row!=="object" || Array.isArray(row) || typeof row.title!=="string" || !row.title.trim() || typeof row.url!=="string" || (row.description!==undefined && typeof row.description!=="string"))throw new Error("BRAVE_SEARCH_RESPONSE_INVALID");
  const originalUrl=referenceUrl(row.url),title=clean(row.title,450);
  if(!originalUrl || !title || seen.has(originalUrl))continue;seen.add(originalUrl);
  items.push({originalUrl,title,excerpt:clean(row.description,2000)||null,publishedAt:null,metadata:{collector:"search",searchProvider:"BRAVE_SEARCH",referenceOnly:true,factualSource:false,bodyStatus:"SEARCH_SNIPPET_ONLY",sourceMode:"BOUNDED_WEB_SEARCH",searchProtocol:BRAVE_SEARCH_PROTOCOL}});
 }
 const limit=Number.isFinite(resultLimit)?Math.max(1,Math.min(5,Math.floor(resultLimit))):5;
 return items.slice(0,limit);
}
