import "server-only";
import {evaluateCreatorRegistration,evaluatePublicPracticeAccess} from "./public-practice-access";

function obj(value:unknown):Record<string,any>{return value && typeof value==="object" && !Array.isArray(value)?value as Record<string,any>:{};}
async function publicJson(url:string) {
  const target=new URL(url);
  if(target.protocol!=="https:" || !(target.hostname==="api.bilibili.com" || /(^|\.)hdslb\.com$/.test(target.hostname))) throw new Error("PUBLIC_PROBE_HOST_DENIED");
  const response=await fetch(target,{redirect:"error",signal:AbortSignal.timeout(6000),headers:{accept:"application/json"}});
  if(!response.ok) throw new Error("PUBLIC_PROBE_HTTP_"+response.status);
  const reader=response.body?.getReader(); if(!reader) throw new Error("PUBLIC_PROBE_EMPTY");
  let length=0; const chunks:Uint8Array[]=[];
  try { while(true){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>2000000)throw new Error("PUBLIC_PROBE_TOO_LARGE");chunks.push(value);} }
  finally {await reader.cancel();}
  return obj(JSON.parse(Buffer.concat(chunks).toString("utf8")));
}

export async function probePublicCreatorCandidate(input:{platform:string;originalUrl:string|null;title:string;excerpt:string|null}) {
  const access=evaluatePublicPracticeAccess(input);
  const base={version:"public-creator-probe-v1",observedAt:new Date().toISOString(),access,historySamples:0,originality:"UNVERIFIED" as "UNVERIFIED"|"SELF_DECLARED"|"FIRST_PARTY_ATTRIBUTED",serverRouteVerified:false,completeMaterials:false,bodyStatus:"UNAVAILABLE",transcriptStatus:"UNAVAILABLE",transcript:null as string|null,creatorId:null as string|null,detailDescription:null as string|null};
  if(!access.eligible) return {...base,...evaluateCreatorRegistration({...base,accessEligible:false}),status:"EXCLUDED_ACCESS_DEPENDENCY"};
  if(input.platform==="YOUTUBE") return {...base,...evaluateCreatorRegistration({...base,accessEligible:true}),status:"BLOCKED_PUBLIC_AUTHOR_ROUTE",transcriptStatus:"OFFICIAL_CAPTIONS_REQUIRE_OWNER_AUTHORIZATION"};
  const video=input.originalUrl?.match(/^https:\/\/www\.bilibili\.com\/video\/(BV[a-zA-Z0-9]+)(?:[/?#]|$)/)?.[1];
  if(input.platform!=="BILIBILI" || !video) return {...base,...evaluateCreatorRegistration({...base,accessEligible:true}),status:"BLOCKED_PUBLIC_AUTHOR_ROUTE"};
  try {
    const view=await publicJson("https://api.bilibili.com/x/web-interface/view?bvid="+video);
    if(view.code!==0) throw new Error("PUBLIC_DETAIL_REJECTED");
    const data=obj(view.data);base.creatorId=String(obj(data.owner).mid ?? "")||null;
    base.originality=data.copyright===1?"SELF_DECLARED":"UNVERIFIED";
    base.detailDescription=typeof data.desc==="string"?data.desc.slice(0,12000):null;
    base.access=evaluatePublicPracticeAccess({title:input.title,excerpt:[input.excerpt,base.detailDescription].join("\n")});
    if(!base.access.eligible) return {...base,...evaluateCreatorRegistration({...base,accessEligible:false}),status:"EXCLUDED_ACCESS_DEPENDENCY"};
    if(base.creatorId && /^\d+$/.test(base.creatorId)) {
      try {
        const history=await publicJson("https://api.bilibili.com/x/space/arc/search?mid="+base.creatorId+"&ps=5&pn=1");
        const videos=obj(obj(history.data).list).vlist;
        if(history.code===0 && Array.isArray(videos)) base.historySamples=new Set(videos.filter(v=>String(obj(v).mid)===base.creatorId).map(v=>obj(v).bvid)).size;
      }catch { /* No browser/signature/cookie fallback. */ }
    }
    if(data.aid && data.cid) {
      try {
        const player=await publicJson("https://api.bilibili.com/x/player/v2?aid="+encodeURIComponent(String(data.aid))+"&cid="+encodeURIComponent(String(data.cid)));
        const tracks=obj(obj(player.data).subtitle).subtitles;
        const track=Array.isArray(tracks)?obj(tracks[0]):{};
        if(typeof track.subtitle_url==="string") {
          const url=new URL(track.subtitle_url,"https://api.bilibili.com");
          const subtitle=await publicJson(url.toString());const cues=Array.isArray(subtitle.body)?subtitle.body:[];
          base.transcript=cues.map(c=>obj(c).content).filter(t=>typeof t==="string").join("\n").slice(0,60000)||null;
          base.transcriptStatus=base.transcript?"PUBLIC_CAPTIONS_PARTIAL_UNVERIFIED":"UNAVAILABLE";
        }
      }catch { /* Private/owner captions are deliberately unsupported. */ }
    }
    // No implemented author-list adapter or corroborated first-party materials: never promote from one video.
    return {...base,...evaluateCreatorRegistration({...base,accessEligible:base.access.eligible}),status:"INSUFFICIENT_SERVER_MATERIALS"};
  }catch {return {...base,...evaluateCreatorRegistration({...base,accessEligible:base.access.eligible}),status:"PUBLIC_DETAIL_UNAVAILABLE"};}
}
