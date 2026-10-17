import {CURATED_PUBLISHER_FEEDS} from "../../../services/overseas-collector-relay/curated-publisher-feeds";
/** A declared publisher home/listing/feed shares one Source, never every URL on a host. */
export function publicPublisherIdentity(input:string):string|null{
 try{
  const url=new URL(input);
  if(url.protocol!=="https:" || url.username || url.password || url.port || url.search || url.hash)return null;
  const normalize=(value:string)=>{const u=new URL(value);if(u.pathname.length>1)u.pathname=u.pathname.replace(/\/+$/,"");return u.href;};
  return CURATED_PUBLISHER_FEEDS.find(p=>[p.home,p.listing,p.feed].some(value=>normalize(value)===normalize(url.href)))?.home??null;
 }catch{return null;}
}
