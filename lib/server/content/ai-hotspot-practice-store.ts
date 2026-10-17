import {readRadarAlgorithmPolicy} from './radar-algorithm-store';
import type {RadarAlgorithmPolicy} from '../../content/radar-algorithm-policy';
import 'server-only';
import {and,eq,inArray,isNull,sql} from 'drizzle-orm';
import {getDatabase} from '../db';
import {contentEvents,contentEventClusterMembers,contentEventClusters,contentEventRawItems,contentRawItems,contentRawItemObservations,contentSources} from '../db/schema';
import {prepareExpressionContext,expressionEventEligible} from './event-expression-context';
import {readEventExpression} from './event-expression-policy';
import {canonicalPracticeRecords,selectCanonicalEventGroups} from './canonical-event';
import {AI_HOTSPOT_PRACTICE_VERSION,evaluateAiHotspotPractice,isToolPracticeRecord,mergeAiHotspotPractice,type AiHotspotPracticeCandidate,type AiHotspotPracticeRecord} from './ai-hotspot-practice';
const obj=(v:unknown):Record<string,unknown>=>v && typeof v==='object' && !Array.isArray(v)?v as Record<string,unknown>:{};
/** Run inside SYSTEM snapshot refresh. Atomic per-key writes preserve other Event metadata. */
export async function recordAiHotspotPracticeTriggers(items:AiHotspotPracticeCandidate[],now=new Date(),policy?:RadarAlgorithmPolicy) {
 policy=policy??(await readRadarAlgorithmPolicy()).policy;
 for(const item of items){const result=evaluateAiHotspotPractice(item,now,policy);const next=result.record;if(!next)continue;
  await getDatabase().transaction(async tx=>{
   await tx.execute(sql`select pg_advisory_xact_lock(hashtext('opc-event-clustering-v6'))`);
   const [membership]=await tx.select().from(contentEventClusterMembers).where(eq(contentEventClusterMembers.eventId,item.eventId));
   const members=membership?await tx.select().from(contentEventClusterMembers).where(eq(contentEventClusterMembers.clusterId,membership.clusterId)):[];
   const rows=await tx.select().from(contentEvents).where(inArray(contentEvents.id,members.length?members.map(m=>m.eventId):[item.eventId])).for('update');
   const active=rows.filter(e=>!e.archivedAt&&e.createdAt<=now&&e.firstSeenAt<=now&&(!e.eventAt||e.eventAt<=now)).sort((a,b)=>a.firstSeenAt.getTime()-b.firstSeenAt.getTime()||a.id.localeCompare(b.id));
   const event=active.find(e=>e.id===item.eventId)??active[0];
   if(!event)return;
   const previous=obj(event.metadata).aiHotspotPractice as AiHotspotPracticeRecord|undefined;
   const record=mergeAiHotspotPractice(previous?.version===AI_HOTSPOT_PRACTICE_VERSION?previous:null,{...next,eventId:event.id});
   await tx.update(contentEvents).set({metadata:sql`jsonb_set(${contentEvents.metadata}, '{aiHotspotPractice}', ${JSON.stringify(record)}::jsonb, true)`}).where(eq(contentEvents.id,event.id));
  });
 }
}
export async function listAiHotspotPractices(policy?:RadarAlgorithmPolicy){
 const config=policy??(await readRadarAlgorithmPolicy()).policy;
 return getDatabase().transaction(async tx=>{
  const rows=await tx.select().from(contentEvents).where(sql`${contentEvents.metadata}->'aiHotspotPractice'->>'version' = ${AI_HOTSPOT_PRACTICE_VERSION}`);
  if(!rows.length)return [];
  const memberships=await tx.select().from(contentEventClusterMembers).where(inArray(contentEventClusterMembers.eventId,rows.map(r=>r.id)));
  const clusterIds=[...new Set(memberships.map(m=>m.clusterId))];
  const clusters=clusterIds.length?await tx.select().from(contentEventClusters).where(inArray(contentEventClusters.id,clusterIds)):[];
  const allMemberships=clusterIds.length?await tx.select().from(contentEventClusterMembers).where(inArray(contentEventClusterMembers.clusterId,clusterIds)):[];
  const ids=[...new Set([...rows.map(r=>r.id),...allMemberships.map(m=>m.eventId)])];
  const events=await tx.select().from(contentEvents).where(inArray(contentEvents.id,ids));
  const now=new Date();
  const groups=selectCanonicalEventGroups(events,allMemberships,clusters,()=>true,now);
  const expressionGroups=selectCanonicalEventGroups(events,allMemberships,clusters,expressionEventEligible,now,168)
   .filter(g=>obj(events.find(e=>e.id===g.canonicalEventId)?.metadata).eventExpression);
  const expressionMemberIds=[...new Set(expressionGroups.flatMap(g=>g.members.map(e=>e.id)))];
  const expressionLinks=expressionMemberIds.length?await tx.select().from(contentEventRawItems).where(inArray(contentEventRawItems.eventId,expressionMemberIds)):[];
  const rawIds=[...new Set(expressionLinks.map(l=>l.rawItemId))];
  const rawRows=rawIds.length?await tx.select().from(contentRawItems).where(inArray(contentRawItems.id,rawIds)):[];
  const observed=rawIds.length?await tx.select().from(contentRawItemObservations).where(inArray(contentRawItemObservations.rawItemId,rawIds)):[];
  const sourceIds=[...new Set(rawRows.map(r=>r.sourceId))];
  const sourceRows=sourceIds.length?await tx.select().from(contentSources).where(inArray(contentSources.id,sourceIds)):[];
  const expressions=new Map(expressionGroups.map(g=>{
   const ids=new Set(expressionLinks.filter(l=>g.members.some(e=>e.id===l.eventId)).map(l=>l.rawItemId));
   return [g.canonicalEventId,readEventExpression(obj(events.find(e=>e.id===g.canonicalEventId)?.metadata).eventExpression,prepareExpressionContext(g.canonicalEventId,rawRows.filter(r=>ids.has(r.id)),observed,sourceRows,now))] as const;
  }));
  const historicalIds=new Set(events.filter(e=>e.createdAt<=now&&e.firstSeenAt<=now&&(!e.eventAt||e.eventAt<=now)).map(e=>e.id));
  return canonicalPracticeRecords(rows.map(r=>({...obj(r.metadata).aiHotspotPractice as AiHotspotPracticeRecord,eventId:r.id})),groups.map(g=>({canonicalEventId:g.canonicalEventId,title:g.representative.title,memberEventIds:[...new Set(allMemberships.filter(m=>m.clusterId===g.clusterId).map(m=>m.eventId).concat(g.members.map(m=>m.id)))].filter(id=>historicalIds.has(id))}))).map(r=>({...r,category:events.find(e=>e.id===r.eventId)?.eventType==='MODEL_RELEASE'?'模型':r.category})).filter(r=>isToolPracticeRecord(r,config)).map(r=>{
   const expression=expressions.get(r.eventId);
   return {...r,originalTitle:r.title,originalSummary:r.summary,title:expression?.titleZh??r.title,summary:expression?.summaryZh??r.summary,eventExpression:{status:expression?'GENERATED':'ORIGINAL_FALLBACK',whyItMatters:expression?.whyItMatters??null,evidenceIds:expression?.evidenceIds??[],uncertainties:expression?.uncertainties??[],authority:'PRESENTATION_ONLY'}};
  });
 },{accessMode:'read only',isolationLevel:'repeatable read'});
}
