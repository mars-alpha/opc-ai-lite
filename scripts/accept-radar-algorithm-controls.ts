import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {eq,sql} from 'drizzle-orm';
import {getDatabase,closeDatabase} from '../lib/server/db';
import {users,contentSources,contentCollectionRuns,contentAuditRecords} from '../lib/server/db/schema';
import {SOURCE_ONBOARDING_VERSION} from '../lib/server/content/source-onboarding';
import {readRadarAlgorithmPolicy,saveRadarAlgorithmPolicy,RADAR_ALGORITHM_POLICY_KEY} from '../lib/server/content/radar-algorithm-store';
import {readSourceCollectionAnalytics} from '../lib/server/content/source-collection-analytics';
import {DEFAULT_RADAR_ALGORITHM_POLICY} from '../lib/content/radar-algorithm-policy';
import {refreshRadarSnapshot} from '../lib/server/content/radar-snapshot';

async function main(){
 assert(process.argv.includes('--confirm=RADAR-ALGORITHM-STAGING'));
 const url=new URL(process.env.DATABASE_URL??'');assert.equal(url.hostname,'127.0.0.1');assert.equal(url.port,'15433');assert.equal(url.pathname,'/opc_ai_dev');assert.equal(process.env.DATABASE_ENVIRONMENT,'development');
 const db=getDatabase();const [identity]=await db.execute(sql`select current_setting('port') port`);assert.equal(identity.port,'15433');
 globalThis.fetch=async()=>{throw Error('STAGING_NETWORK_FORBIDDEN');};
 const [admin]=await db.select().from(users).where(eq(users.role,'ADMIN')).limit(1);assert(admin);
 const actor={id:admin.id,email:'stage-p4f@example.invalid',role:'ADMIN' as const,displayName:admin.displayName};
 const before=await readRadarAlgorithmPolicy(),id='source_p4k_'+randomUUID();
 try{
  await assert.rejects(()=>saveRadarAlgorithmPolicy({...DEFAULT_RADAR_ALGORITHM_POLICY,practice:{...DEFAULT_RADAR_ALGORITHM_POLICY.practice,minPublishers:1}},before.revision,actor),/INVALID/);
  const proposed=structuredClone(DEFAULT_RADAR_ALGORITHM_POLICY);proposed.hot.halfLifeHours=96;
  const concurrent=await Promise.allSettled([saveRadarAlgorithmPolicy(proposed,before.revision,actor),saveRadarAlgorithmPolicy(proposed,before.revision,actor)]);
  assert.equal(concurrent.filter(r=>r.status==='fulfilled').length,1,'ONE_CONCURRENT_SAVE_WINS');
  assert.equal(concurrent.filter(r=>r.status==='rejected'&&String(r.reason).includes('CONFLICT')).length,1);
  const persisted=await readRadarAlgorithmPolicy();assert.equal(persisted.policy.hot.halfLifeHours,96);
  const audit=await db.select().from(contentAuditRecords).where(eq(contentAuditRecords.entityId,RADAR_ALGORITHM_POLICY_KEY));assert(audit.some(r=>(r.after as any)?.revision===persisted.revision),'AUDIT_WITH_REVISION');
  const snapshot=await refreshRadarSnapshot();assert.equal(snapshot.algorithmRevision,persisted.revision);assert(snapshot.items.every(i=>i.algorithmRevision===persisted.revision),'ONE_POLICY_PER_SNAPSHOT');
  await db.insert(contentSources).values({id,name:'P4K staging counter fixture',platform:'WEB',sourceType:'MANAGED_SOURCE',collectionMethod:'RSS',enabled:false,status:'ACTIVE',metadata:{sourceRegistry:{owner:'SOURCE_MANAGEMENT'},sourceOnboarding:{version:SOURCE_ONBOARDING_VERSION}}});
  const at=new Date(Date.now()-60000);
  await db.insert(contentCollectionRuns).values([
   {sourceId:id,sourceName:'P4K fixture',collectionMethod:'RSS',status:'SUCCEEDED',receivedCount:10,createdCount:4,duplicateCount:3,startedAt:at,finishedAt:new Date(at.getTime()+2000),metadata:{collectionOrigin:'SYSTEM'}},
   {sourceId:id,sourceName:'P4K fixture',collectionMethod:'RSS',status:'FAILED',errorCode:'TEST_UPSTREAM_TIMEOUT',startedAt:at,finishedAt:new Date(at.getTime()+3000),metadata:{collectionOrigin:'SYSTEM'}},
   {sourceId:id,sourceName:'P4K fixture',collectionMethod:'RSS',status:'RUNNING',startedAt:at,metadata:{collectionOrigin:'SYSTEM'}},
   ...[{collectionOrigin:'SYSTEM',qualificationOnly:true},{collectionOrigin:'SYSTEM',backfillWindow:{from:at.toISOString(),to:new Date().toISOString()}},{collectionOrigin:'MANUAL'},{collectionOrigin:'SYSTEM',staleRunRecovery:{excludeFromRuntimeQualification:true}}].map(metadata=>({sourceId:id,sourceName:'P4K excluded fixture',collectionMethod:'RSS',status:'SUCCEEDED',receivedCount:1000,createdCount:1000,startedAt:at,metadata}))
  ]);
  const analytics=await readSourceCollectionAnalytics(7,id);
  assert.equal(analytics.sourceCount,1);assert.equal(analytics.summary.runs,3);assert.equal(analytics.summary.received,10);assert.equal(analytics.summary.created,4);assert.equal(analytics.summary.duplicates,3);assert.equal(analytics.summary.succeeded,1);assert.equal(analytics.summary.failed,1);assert.equal(analytics.summary.running,1);assert.equal(analytics.summary.durationTotalMs,5000);assert.equal(analytics.daily.length,7);assert.equal(analytics.errors[0].code,'TEST_UPSTREAM_TIMEOUT');
  assert.equal(analytics.daily.reduce((n,d)=>n+d.received,0),analytics.summary.received);assert.equal(analytics.snapshot.algorithmRevision,persisted.revision);
  await assert.rejects(()=>readSourceCollectionAnalytics(365),/INVALID/);await assert.rejects(()=>readSourceCollectionAnalytics(7,'not-a-directory-source'),/INVALID/);
  console.log('RADAR_ALGORITHM_PG=PASS;CAS=PASS;AUDIT=PASS;SINGLE_SNAPSHOT_VERSION=PASS;SYSTEM_COUNTERS=PASS;EXCLUDED_RUNS=PASS;PRODUCTION_WRITE=0;AI_CALLS=0');
 }finally{
  await db.delete(contentCollectionRuns).where(eq(contentCollectionRuns.sourceId,id));await db.delete(contentSources).where(eq(contentSources.id,id));
  const current=await readRadarAlgorithmPolicy();await saveRadarAlgorithmPolicy(before.policy,current.revision,actor);await refreshRadarSnapshot();
 }
}
main().catch(e=>{console.error('RADAR_ALGORITHM_STAGING_FAILED:'+e.name+':'+(e.code??(String(e.message).match(/^[A-Z][A-Z0-9_]+$/)?e.message:'REDACTED')));process.exitCode=1;}).finally(closeDatabase);
