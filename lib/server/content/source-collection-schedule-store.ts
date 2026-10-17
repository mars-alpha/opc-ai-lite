import 'server-only';
import {randomUUID} from 'node:crypto';
import {eq,inArray,sql} from 'drizzle-orm';
import {getDatabase} from '../db';
import {contentSources} from '../db/schema';
import type {AuthUser} from '../auth/service';
import {recordContentAudit} from './workbench';
import {isCurrentSystemCollectionSource} from './source-portfolio-runtime';
import {auditSourceGovernanceExecution,resolveSourceBaseIntervalMinutes} from './source-runtime-governance-execution';
import {SOURCE_COLLECTION_SCHEDULE_VERSION,readSourceSchedule,validateSourceScheduleChanges} from '../../content/source-collection-schedule';
const current=(s:typeof contentSources.$inferSelect)=>isCurrentSystemCollectionSource({...s,enabled:true});
export async function listSourceCollectionSchedules(){
 const rows=(await getDatabase().select().from(contentSources)).filter(current);
 const ids=rows.filter(r=>r.enabled).map(r=>r.id);
 const plans=ids.length?await auditSourceGovernanceExecution({sourceIds:ids}):[];
 const byId=new Map(plans.map(p=>[p.source.id,p]));
 return {asOf:new Date().toISOString(),minIntervalMinutes:5,maxIntervalMinutes:1440,items:rows.map(r=>{
  const schedule=readSourceSchedule(r.metadata),plan=byId.get(r.id);
  return {sourceId:r.id,name:r.name,enabled:r.enabled,intervalMinutes:resolveSourceBaseIntervalMinutes(r),revision:schedule?.revision??'default',updatedAt:schedule?.updatedAt??null,effectiveIntervalMinutes:plan?.execution.effectiveIntervalMinutes??null,nextDueAt:plan?.execution.nextDueAt??null,lastRunAt:plan&&'lastRunAt' in plan?plan.lastRunAt??null:null,action:r.enabled?plan?.execution.action??'BLOCKED_INVALID_INPUT':'DISABLED',reason:r.enabled?plan?.execution.reason??'QUALIFICATION_REQUIRED':'SOURCE_DISABLED'};
 }).sort((a,b)=>a.name.localeCompare(b.name))};
}
export async function saveSourceCollectionSchedules(input:unknown,user:AuthUser){
 const changes=validateSourceScheduleChanges(input).sort((a,b)=>a.sourceId.localeCompare(b.sourceId));
 return getDatabase().transaction(async tx=>{
  const rows=await tx.select().from(contentSources).where(inArray(contentSources.id,changes.map(c=>c.sourceId))).orderBy(contentSources.id).for('update');
  const byId=new Map(rows.map(r=>[r.id,r]));
  // Validate the entire batch before writing any row.
  for(const change of changes){const source=byId.get(change.sourceId);if(!source||!current(source))throw Error('INVALID_SOURCE_SCHEDULE_TARGET');if((readSourceSchedule(source.metadata)?.revision??'default')!==change.expectedRevision)throw Error('SOURCE_SCHEDULE_CONFLICT');}
  const updated=[];
  for(const change of changes){const source=byId.get(change.sourceId)!;const now=new Date(),schedule={version:SOURCE_COLLECTION_SCHEDULE_VERSION,intervalMinutes:change.intervalMinutes,revision:randomUUID(),updatedAt:now.toISOString()};
   await tx.update(contentSources).set({metadata:sql`jsonb_set(${contentSources.metadata},'{collectionSchedule}',${JSON.stringify(schedule)}::jsonb,true)`,updatedAt:now}).where(eq(contentSources.id,source.id));
   await recordContentAudit(user,{action:'SOURCE_COLLECTION_FREQUENCY_UPDATED',entityType:'SOURCE',entityId:source.id,before:{intervalMinutes:resolveSourceBaseIntervalMinutes(source),schedule:readSourceSchedule(source.metadata)},after:schedule,metadata:{effective:'NEXT_SYSTEM_DUE_CHECK',enabledChanged:false,routeChanged:false}},tx);
   updated.push({sourceId:source.id,...schedule});
  }
  return {updated};
 });
}
