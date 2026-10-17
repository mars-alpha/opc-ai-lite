import 'server-only';
import {createHash} from 'node:crypto';
import {EVENT_RELATION_SKILL,type RelationEvent,type RelationInput,type RelationOutput,type RelationPair} from '../../../skills/event-relation/v1';
import {eventRelationHardConflict} from './event-clustering';

export const EVENT_RELATION_TASK='EVENT_RELATION';
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
const fail=():never=>{throw new Error('EVENT_RELATION_INVALID_OUTPUT');};
export function prepareEventRelation(left:RelationEvent[],right:RelationEvent[],model:{provider:string;model:string;baseUrl:string;thinkingControl?:string}){
 const ordered=(items:RelationEvent[])=>items.map(e=>({...e,entities:[...e.entities].sort(),evidence:[...e.evidence].sort((a,b)=>a.rawId.localeCompare(b.rawId))})).sort((a,b)=>a.eventId.localeCompare(b.eventId));
 const payload:RelationInput={schemaVersion:'event-relation-input-v1',left:ordered(left),right:ordered(right)};
 if(!left.length||!right.length||left.length+right.length>8||new Set([...left,...right].map(e=>e.eventId)).size!==left.length+right.length||[...left,...right].some(e=>!e.evidence.length||e.evidence.length>3||!Number.isFinite(Date.parse(e.firstSeenAt))||e.title.length>1000||e.evidence.some(r=>!r.text||r.text.length>2000)))throw new Error('EVENT_RELATION_INVALID_INPUT');
 const inputHash=createHash('sha256').update(JSON.stringify([EVENT_RELATION_SKILL.version,EVENT_RELATION_SKILL.promptVersion,payload,{provider:model.provider,model:model.model,baseUrl:model.baseUrl,thinkingControl:model.thinkingControl??null}])).digest('hex');
 return {payload,inputHash};
}

export function validateEventRelationOutput(input:RelationInput,value:unknown):{output:RelationOutput;mergeAllowed:boolean}{
 const root=obj(value);
 if(root.schemaVersion!=='event-relation-output-v1'||Object.keys(root).some(k=>!['schemaVersion','pairs'].includes(k))||!Array.isArray(root.pairs)||root.pairs.length!==input.left.length*input.right.length)fail();
 const pairs:RelationPair[]=[],seen=new Set<string>();let mergeAllowed=true;
 for(const item of root.pairs as unknown[]){
  const p=obj(item),a=input.left.find(e=>e.eventId===p.leftId),b=input.right.find(e=>e.eventId===p.rightId);
  const key=String(p.leftId)+'|'+String(p.rightId);
  if(!a||!b||seen.has(key)||Object.keys(p).some(k=>!['leftId','rightId','relation','confidence','objectKey','reason','evidence'].includes(k)))fail();seen.add(key);
  if(!['SAME_EVENT','SUPPORTING_REPORT','RELATED_EVENT','UNRELATED','UNKNOWN'].includes(String(p.relation))||typeof p.confidence!=='number'||!Number.isFinite(p.confidence)||p.confidence<0||p.confidence>1||typeof p.reason!=='string'||!p.reason.trim()||p.reason.length>300||typeof p.objectKey!=='string'||p.objectKey.length>120||!Array.isArray(p.evidence)||p.evidence.length<2||p.evidence.length>6)fail();
  const cited=new Set<string>();
  for(const citation of p.evidence as unknown[]){const c=obj(citation),event=[a!,b!].find(e=>e.eventId===c.eventId),raw=event?.evidence.find(r=>r.rawId===c.rawId);
   if(!raw||typeof c.quote!=='string'||c.quote.length<8||c.quote.length>300||!raw.text.includes(c.quote)||Object.keys(c).some(k=>!['eventId','rawId','quote'].includes(k)))fail();cited.add(event!.eventId);
  }
  if(cited.size!==2)fail();
  const positive=['SAME_EVENT','SUPPORTING_REPORT'].includes(String(p.relation));
  if(positive){
   const name=(p.objectKey as string).trim().toLowerCase();
   if(name.length<4||/^(?:meta|openai|anthropic|google|microsoft|nvidia|hugging face|ai|llm|agent|model|模型|人工智能|transformer|api|sdk|研究|教程)$/i.test(name)||![a!,b!].every(e=>e.evidence.some(r=>r.text.toLowerCase().includes(name))))fail();
   if((p.confidence as number)<0.98||eventRelationHardConflict(toEvent(a!),toEvent(b!))||a!.evidence.some(x=>b!.evidence.some(y=>eventRelationHardConflict({...toEvent(a!),title:x.text},{...toEvent(b!),title:y.text}))))mergeAllowed=false;
  }else mergeAllowed=false;
  pairs.push(p as unknown as RelationPair);
 }
 const dates=[...input.left,...input.right].map(e=>Date.parse(e.firstSeenAt));
 if(Math.max(...dates)-Math.min(...dates)>72*3600000)mergeAllowed=false;
 const publicationDates=[...input.left,...input.right].map(e=>e.evidence.flatMap(r=>r.publishedAt&&Number.isFinite(Date.parse(r.publishedAt))?[Date.parse(r.publishedAt)]:[]));
 if(publicationDates.some(d=>!d.length)||Math.max(...publicationDates.flat())-Math.min(...publicationDates.flat())>72*3600000)mergeAllowed=false;
 return {output:{schemaVersion:'event-relation-output-v1',pairs},mergeAllowed};
}
function toEvent(e:RelationEvent){return {id:e.eventId,title:e.title,entities:e.entities,keywords:[],eventType:e.eventType,subjectEntityId:e.subjectEntityId,firstSeenAt:new Date(e.firstSeenAt),lastSeenAt:new Date(e.firstSeenAt)};}
export function eventRelationJobDue(job:{status:string;nextRetryAt?:string},now:number){
 if(job.status==='SUCCEEDED')return false;
 return typeof job.nextRetryAt==='string'&&Number.isFinite(Date.parse(job.nextRetryAt))&&Date.parse(job.nextRetryAt)<=now;
}
