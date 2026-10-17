import 'server-only';
import {and,asc,eq,inArray,sql} from 'drizzle-orm';
import {getDatabase} from '../db';
import {contentEvents as events,contentEventClusters as clusters,contentEventClusterMembers as members,contentEventRawItems as links,contentRawItems as raws,contentRawItemObservations as observations,contentSources as sources} from '../db/schema';
import {INTELLIGENCE_POLICY_VERSION} from '../../content/intelligence-policy';
import {isCurrentSystemCollectionSource} from './source-portfolio-runtime';
import {sourceContentRule,inferCollectionContentType} from './source-policy';
import {selectCanonicalEventGroups} from './canonical-event';
import {prepareEventExpression,expressionHash} from './event-expression-policy';
type DB=ReturnType<typeof getDatabase>;
const obj=(v:unknown):Record<string,any>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,any>:{};
export function expressionEventEligible(e:typeof events.$inferSelect){const p=obj(obj(e.metadata).eventPolicy);return e.policyVersion===INTELLIGENCE_POLICY_VERSION&&p.version===INTELLIGENCE_POLICY_VERSION&&p.systemObserved===true&&p.aiRelevant===true&&obj(p.operationalUsefulness).eligible!==false;}
const system=(v:unknown)=>{const m=obj(v);return m.collectionOrigin==='SYSTEM'||(Array.isArray(m.collectionContexts)&&m.collectionContexts.some((c:any)=>c.origin==='SYSTEM'));};
/** Shared by SYSTEM and read projection: only direct, current, explicitly SYSTEM fact evidence. */
export function prepareExpressionContext(canonicalId:string,rawRows:(typeof raws.$inferSelect)[],observed:(typeof observations.$inferSelect)[],sourceRows:(typeof sources.$inferSelect)[],asOf:Date){
 const bySource=new Map(sourceRows.map(s=>[s.id,s]));
 const evidence=rawRows.flatMap(r=>{
  const s=bySource.get(r.sourceId);if(!s||!isCurrentSystemCollectionSource(s)||!system(r.metadata)||obj(r.metadata).referenceOnly===true||obj(s.metadata).referenceOnly===true||obj(s.signalConfig).signalOnly===true||r.collectedAt>asOf||(r.publishedAt&&r.publishedAt>asOf))return [];
  if(!observed.some(o=>o.rawItemId===r.id&&o.sourceId===s.id&&o.observedAt<=asOf&&system(o.metadata)))return [];
  const rule=sourceContentRule(s,inferCollectionContentType({metadata:obj(r.metadata),originalUrl:r.originalUrl,collectionMethod:s.collectionMethod,platform:r.platform,source:s}));
  if(rule.role!=='FACT'||rule.confirmationScope==='NONE')return [];
  return [{rawId:r.id,text:[r.title,r.excerpt??''].join('\n'),publishedAt:r.publishedAt?.toISOString()??null,collectedAt:r.collectedAt.toISOString(),authority:rule.confirmationAuthority,scope:rule.confirmationScope}];
 });
 return evidence.length?prepareEventExpression(canonicalId,evidence):null;
}
/** Caller holds the shared clustering advisory lock, no Provider calls inside. */
export async function loadExpressionContext(db:DB,eventId:string,asOf:Date){
 const [membership]=await db.select().from(members).where(eq(members.eventId,eventId));
 const membershipRows=membership?await db.select().from(members).where(eq(members.clusterId,membership.clusterId)):[];
 const clusterRows=membership?await db.select().from(clusters).where(eq(clusters.id,membership.clusterId)):[];
 const ids=[...new Set([eventId,...membershipRows.map(m=>m.eventId),...clusterRows.map(c=>c.primaryEventId)])].sort();
 const eventRows=await db.select().from(events).where(inArray(events.id,ids)).orderBy(asc(events.id)).for('update');
 const [group]=selectCanonicalEventGroups(eventRows,membershipRows,clusterRows,expressionEventEligible,asOf,168);
 if(!group||!eventRows.some(e=>e.id===group.canonicalEventId))return null;
 const linked=await db.select().from(links).where(inArray(links.eventId,group.members.map(e=>e.id)));
 const rawIds=[...new Set(linked.map(l=>l.rawItemId))].sort();if(!rawIds.length)return null;
 const rawRows=await db.select().from(raws).where(inArray(raws.id,rawIds)).orderBy(asc(raws.id)).for('share');
 const observed=await db.select().from(observations).where(inArray(observations.rawItemId,rawIds)).for('share');
 const sourceIds=[...new Set(rawRows.map(r=>r.sourceId))].sort();
 const sourceRows=await db.select().from(sources).where(inArray(sources.id,sourceIds)).orderBy(asc(sources.id)).for('share');
 const prepared=prepareExpressionContext(group.canonicalEventId,rawRows,observed,sourceRows,asOf);if(!prepared)return null;
 return {...prepared,canonicalId:group.canonicalEventId,memberIds:group.members.map(e=>e.id),revision:expressionHash([membershipRows.map(m=>[m.eventId,m.clusterId]).sort(),group.members.map(e=>[e.id,e.title,e.summary]),prepared.fingerprint])};
}
