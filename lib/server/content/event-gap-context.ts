import 'server-only';
import {getDatabase} from '../db';
import {loadEventValueCandidate} from './intelligence-read-model';
import {practiceDiscoveryDecision,practiceEvidenceGap} from './practice-discovery-policy';
import {gapPlanHash} from './event-gap-policy';
import {expressionHash} from './event-expression-policy';
import type {GapInput} from '../../../skills/event-discovery-plan/v1';
export async function loadEventGapContext(db:ReturnType<typeof getDatabase>,eventId:string,asOf:Date,options:{forExecution?:boolean}={}){
 const item=await loadEventValueCandidate(db,eventId,asOf);if(!item||!practiceDiscoveryDecision(item,options.forExecution?null:item.practiceDiscovery,asOf.getTime()).eligible)return null;
 const gap=practiceEvidenceGap(item),subject=item.title.trim().slice(0,180);
 const payload:GapInput={schemaVersion:'event-gap-input-v1',eventId:item.eventId,subject,gap:gap.action,gapFingerprint:gap.fingerprint,evidence:[...(item.evidenceLineage?.directRawIds??[])].map((id,index)=>({id,text:index===0?[item.title,item.excerpt??''].join('\n').slice(0,3000):''})).filter(e=>e.text)};
 if(!payload.evidence.length)return null;
 const fingerprint=gapPlanHash(payload);
 const memberIds=[...(item.evidenceLineage?.memberEventIds??[item.eventId])].sort();
 return {payload,fingerprint,canonicalId:item.eventId,memberIds,revision:expressionHash([memberIds,fingerprint])};
}
