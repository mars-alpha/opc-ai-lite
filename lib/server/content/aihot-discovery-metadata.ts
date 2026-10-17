/** Untrusted upstream discovery hints. Never used to grant Fact or column authority. */
const obj=(v:unknown):Record<string,unknown>=>v && typeof v==="object" && !Array.isArray(v)?v as Record<string,unknown>:{};
const text=(v:unknown,max:number)=>typeof v==="string" && v.trim()?v.trim().slice(0,max):null;
function aihotLink(value:unknown,kind:"items"|"story"){
 try{const u=new URL(String(value));return u.protocol==="https:" && ["aihot.news","aihot.virxact.com"].includes(u.hostname) && !u.port && !u.username && !u.password && !u.search && !u.hash && new RegExp("^/"+kind+"/[a-zA-Z0-9-]{1,100}$").test(u.pathname)?u.href:null;}catch{return null;}
}
export function aihotDiscoveryMetadata(item:Record<string,unknown>){
 const links=obj(item.links),attribution=obj(item.attribution);
 const rawScore=item.score??item.card_score??item.ai_score;
 const score=typeof rawScore==="number"?rawScore:typeof rawScore==="string" && /^\d+(?:\.\d+)?$/.test(rawScore)?Number(rawScore):null;
 return {
  upstreamScore:score!==null && Number.isFinite(score) && score>=0 && score<=100?score:null,
  upstreamCategory:text(item.category,80),upstreamSelected:typeof item.selected==="boolean"?item.selected:null,
  upstreamRecommendation:text(item.reason,1000),
  aihotUrl:aihotLink(links.aihot??item.permalink??attribution.url??attribution.canonical,"items"),
  upstreamStoryUrl:aihotLink(links.story,"story"),
  upstreamAttribution:{name:"AIHOT",url:aihotLink(attribution.url??attribution.canonical??links.aihot??item.permalink,"items")},
  sourceRole:"SECONDARY_DISCOVERY",factualSource:false,referenceOnly:true,
  upstreamHintsOnly:true
 };
}
