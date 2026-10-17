import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {eq,inArray,sql} from 'drizzle-orm';
import {getDatabase,closeDatabase} from '../lib/server/db';
import {users,contentSources,contentCollectionRuns,contentAuditRecords} from '../lib/server/db/schema';
import {SOURCE_ONBOARDING_VERSION} from '../lib/server/content/source-onboarding';
import {listSourceCollectionSchedules,saveSourceCollectionSchedules} from '../lib/server/content/source-collection-schedule-store';
import {auditSourceGovernanceExecution,listDueSourceIdsForAutomaticCycle,resolveSourceBaseIntervalMinutes,withSourceCollectionCycleLock} from '../lib/server/content/source-runtime-governance-execution';
import {readSourceSchedule,isSourceCadenceRun} from '../lib/content/source-collection-schedule';
import {runSourceCollection} from '../lib/server/content/collection-runner';
async function main(){
 assert(process.argv.includes('--confirm=SOURCE-SCHEDULE-STAGING'));
 const url=new URL(process.env.DATABASE_URL??'');assert.equal(url.hostname,'127.0.0.1');assert.equal(url.port,'15433');assert.equal(url.pathname,'/opc_ai_dev');assert.equal(process.env.DATABASE_ENVIRONMENT,'development');
 const db=getDatabase();const [port]=await db.execute(sql`select current_setting('port') port`);assert.equal(port.port,'15433');
 const [admin]=await db.select().from(users).where(eq(users.role,'ADMIN')).limit(1);assert(admin);
 const actor={id:admin.id,email:'schedule-test@example.invalid',role:'ADMIN' as const,displayName:admin.displayName};
 const ids=[0,1].map(()=> 'source_schedule_'+randomUUID());
 globalThis.fetch=async()=>{throw Error('NETWORK_FORBIDDEN');};
 const read=async(id=ids[0])=>{const [s]=await db.select().from(contentSources).where(eq(contentSources.id,id));return s;};
 const change=async(id:string,minutes:number)=>{const s=await read(id);return {sourceId:id,intervalMinutes:minutes,expectedRevision:readSourceSchedule(s.metadata)?.revision??'default'};};
 try{
  await db.insert(contentSources).values(ids.map((id,i)=>({id,name:'Schedule fixture '+i,platform:'WEB',sourceType:'OFFICIAL',collectionMethod:'RSS',enabled:i===0,status:'ACTIVE',canonicalUrl:'https://example.org/feed.xml',collectionConfig:{provider:'UNCHANGED',acquisition:{routes:[{id:'feed',role:'PRIMARY',kind:'RSS_ATOM',url:'https://example.org/feed.xml'}]}},metadata:{keep:'untouched',sourceRegistry:{owner:'SOURCE_MANAGEMENT'},sourceOnboarding:{version:SOURCE_ONBOARDING_VERSION}}})));
  const proposal=await change(ids[0],30),concurrent=await Promise.allSettled([saveSourceCollectionSchedules([proposal],actor),saveSourceCollectionSchedules([proposal],actor)]);
  assert.equal(concurrent.filter(r=>r.status==='fulfilled').length,1);assert.equal(concurrent.filter(r=>r.status==='rejected'&&String(r.reason).includes('CONFLICT')).length,1);
  const first=await read();assert.equal(resolveSourceBaseIntervalMinutes(first),30);assert.equal((first.metadata as any).keep,'untouched');assert.equal((first.collectionConfig as any).provider,'UNCHANGED');
  const secondBefore=await read(ids[1]);await assert.rejects(()=>saveSourceCollectionSchedules([{...proposal,intervalMinutes:60}, {sourceId:ids[1],intervalMinutes:60,expectedRevision:'default'}],actor),/CONFLICT/);assert.deepEqual((await read(ids[1])).metadata,secondBefore.metadata);
  await assert.rejects(()=>saveSourceCollectionSchedules([{...proposal,sourceId:'not-current'}],actor),/INVALID/);
  await saveSourceCollectionSchedules([await change(ids[0],5),await change(ids[1],60)],actor);assert.equal((await read(ids[1])).enabled,false);
  const lock=await withSourceCollectionCycleLock(async()=>{
   const result=await runSourceCollection(actor,ids[0],{provenance:{origin:'SYSTEM',runKind:'SYSTEM_SOURCE_PORTFOLIO',collectionPurpose:'LATEST'}},async()=>[]);assert.equal(result.status,'SUCCEEDED');assert(isSourceCadenceRun(result.metadata));
   const at=result.startedAt;
   for(const input of [{qualificationOnly:true},{backfillWindow:{from:new Date(Date.now()-3600000).toISOString(),to:new Date(Date.now()-1000).toISOString()}}]){
    await assert.rejects(()=>runSourceCollection(actor,ids[0],input,async()=>{throw Error('TEST_FETCH_FAILED');}));
   }
   const probeRuns=await db.select().from(contentCollectionRuns).where(eq(contentCollectionRuns.sourceId,ids[0]));assert.equal(probeRuns.filter(r=>isSourceCadenceRun(r.metadata)).length,1,'FAILED_PROBES_EXCLUDED');
   for(const minutes of [5,60,30]){
    await saveSourceCollectionSchedules([await change(ids[0],minutes)],actor);
    const [plan]=await auditSourceGovernanceExecution({sourceIds:[ids[0]],now:new Date(at.getTime()+60000)});assert.equal(plan.execution.baseIntervalMinutes,minutes);assert.equal((plan as any).lastRunAt,at.toISOString());
    const effective=plan.execution.effectiveIntervalMinutes;assert(effective);
    const before=await listDueSourceIdsForAutomaticCycle({sourceIds:[ids[0]],now:new Date(at.getTime()+effective*60000-1)});assert(!before.sourceIds.includes(ids[0]));
    const due=await listDueSourceIdsForAutomaticCycle({sourceIds:[ids[0]],now:new Date(at.getTime()+effective*60000)});assert(due.sourceIds.includes(ids[0]),'DUE_SELECTED_BY_REAL_SYSTEM_QUERY');
   }
  });assert.equal(lock.status,'COMPLETED');
  const view=await listSourceCollectionSchedules();assert(view.items.some(r=>r.sourceId===ids[0]&&r.intervalMinutes===30));assert(view.items.some(r=>r.sourceId===ids[1]&&r.action==='DISABLED'));
  const audit=await db.select().from(contentAuditRecords).where(inArray(contentAuditRecords.entityId,ids));assert(audit.some(a=>a.action==='SOURCE_COLLECTION_FREQUENCY_UPDATED'));
  console.log('SOURCE_SCHEDULE_PG=PASS;CAS=PASS;ATOMIC_BATCH=PASS;AUDIT=PASS;REAL_RUNNER=PASS;FAILED_PROBE_EXCLUSION=PASS;REAL_DUE_QUERY=PASS;VIRTUAL_CLOCK_BOUNDARIES=PASS;PRODUCTION_WRITE=0;AI_CALLS=0');
 }finally{await db.delete(contentCollectionRuns).where(inArray(contentCollectionRuns.sourceId,ids));await db.delete(contentSources).where(inArray(contentSources.id,ids));}
}
main().catch(e=>{console.error('SOURCE_SCHEDULE_STAGING_FAILED:'+e.name+':'+(e.code??(String(e.message).match(/^[A-Z][A-Z0-9_]+$/)?e.message:'REDACTED')));process.exitCode=1;}).finally(closeDatabase);
