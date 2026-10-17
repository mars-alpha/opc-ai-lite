import {mergeAiHotspotPractice,type AiHotspotPracticeRecord} from './ai-hotspot-practice';
type EventIdentity = { id:string; firstSeenAt:Date; lastSeenAt:Date; createdAt:Date; archivedAt:Date|null; eventAt:Date|null };
/** A representative may change; canonical identity remains the stored primary ID. */
export function selectCanonicalEventGroups<T extends EventIdentity>(events:T[], memberships:{eventId:string;clusterId:string}[], clusters:{id:string;primaryEventId:string}[], eligible:(event:T)=>boolean, asOf:Date,maxMemberAgeHours=Infinity) {
 const byEvent=new Map(memberships.map(m=>[m.eventId,m.clusterId])), primary=new Map(clusters.map(c=>[c.id,c.primaryEventId]));
 const grouped=new Map<string,T[]>();
 for(const event of events){
  if(event.archivedAt||event.createdAt>asOf||event.firstSeenAt>asOf||(event.eventAt&&event.eventAt>asOf)||!eligible(event))continue;
  const key=byEvent.get(event.id)??event.id;
  const members=grouped.get(key)??[];members.push(event);grouped.set(key,members);
 }
 return [...grouped].map(([key,active])=>{
  const fresh=active.filter(e=>asOf.getTime()-(e.eventAt??e.firstSeenAt).getTime()<=maxMemberAgeHours*3600000);
  const members=fresh.length?fresh:active;
  members.sort((a,b)=>(a.eventAt??a.firstSeenAt).getTime()-(b.eventAt??b.firstSeenAt).getTime()||a.id.localeCompare(b.id));
  const canonicalEventId=primary.get(key)??members[0].id;
  return {canonicalEventId,clusterId:primary.has(key)?key:null,representative:members.find(e=>e.id===canonicalEventId)??members[0],members,
   timelineAt:members[0].eventAt??members[0].firstSeenAt,
   firstSeenAt:new Date(Math.min(...members.map(e=>e.firstSeenAt.getTime()))),
   lastSeenAt:new Date(Math.min(asOf.getTime(),Math.max(...members.map(e=>e.lastSeenAt.getTime()))))};
 });
}

export function canonicalPracticeRecords(records:AiHotspotPracticeRecord[], groups:{canonicalEventId:string;memberEventIds:string[];title:string}[]) {
 const byEvent=new Map(records.map(r=>[r.eventId,r]));
 return groups.flatMap(group=>{
  const original=group.memberEventIds.flatMap(id=>{const r=byEvent.get(id);return r?[r]:[];});
  let merged:AiHotspotPracticeRecord|null=null;
  for(const r of original)merged=mergeAiHotspotPractice(merged,r);
  return merged?[{...merged,eventId:group.canonicalEventId,title:group.title}]:[];
 }).sort((a,b)=>b.firstTriggeredAt.localeCompare(a.firstTriggeredAt)||a.eventId.localeCompare(b.eventId));
}

/** Operation overlays follow active canonical members just like the timeline projection. */
export function canonicalOperationStates<T extends EventIdentity & {discoveryStatus:string}>(events:T[],memberships:{eventId:string;clusterId:string}[],clusters:{id:string;primaryEventId:string}[],asOf=new Date()){
 return selectCanonicalEventGroups(events,memberships,clusters,()=>true,asOf).map(g=>({id:g.canonicalEventId,archivedAt:null,discoveryStatus:g.representative.discoveryStatus}));
}
