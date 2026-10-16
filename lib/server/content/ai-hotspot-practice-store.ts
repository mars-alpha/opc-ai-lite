import 'server-only';
import {and,eq,isNull,sql} from 'drizzle-orm';
import {getDatabase} from '../db';
import {contentEvents} from '../db/schema';
import {AI_HOTSPOT_PRACTICE_VERSION,evaluateAiHotspotPractice,mergeAiHotspotPractice,type AiHotspotPracticeCandidate,type AiHotspotPracticeRecord} from './ai-hotspot-practice';
const obj=(v:unknown):Record<string,unknown>=>v && typeof v==='object' && !Array.isArray(v)?v as Record<string,unknown>:{};
/** Run inside SYSTEM snapshot refresh. Atomic per-key writes preserve other Event metadata. */
export async function recordAiHotspotPracticeTriggers(items:AiHotspotPracticeCandidate[],now=new Date()) {
 for(const item of items){const result=evaluateAiHotspotPractice(item,now);if(!result.record)continue;
  await getDatabase().transaction(async tx=>{
   const [event]=await tx.select({metadata:contentEvents.metadata}).from(contentEvents).where(and(eq(contentEvents.id,item.eventId),isNull(contentEvents.archivedAt))).for('update');
   if(!event)return;
   const previous=obj(event.metadata).aiHotspotPractice as AiHotspotPracticeRecord|undefined;
   const record=mergeAiHotspotPractice(previous?.version===AI_HOTSPOT_PRACTICE_VERSION?previous:null,result.record);
   await tx.update(contentEvents).set({metadata:sql`jsonb_set(${contentEvents.metadata}, '{aiHotspotPractice}', ${JSON.stringify(record)}::jsonb, true)`}).where(eq(contentEvents.id,item.eventId));
  });
 }
}
export async function listAiHotspotPractices(){
 const rows=await getDatabase().select({metadata:contentEvents.metadata}).from(contentEvents).where(and(isNull(contentEvents.archivedAt),sql`${contentEvents.metadata}->'aiHotspotPractice'->>'version' = ${AI_HOTSPOT_PRACTICE_VERSION}`));
 return rows.map(r=>obj(r.metadata).aiHotspotPractice as AiHotspotPracticeRecord).sort((a,b)=>b.firstTriggeredAt.localeCompare(a.firstTriggeredAt)||a.eventId.localeCompare(b.eventId));
}
