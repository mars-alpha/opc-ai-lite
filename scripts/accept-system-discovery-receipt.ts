import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {eq,sql} from 'drizzle-orm';
import {getDatabase,closeDatabase} from '../lib/server/db';
import {contentSources,contentCollectionRuns,contentRawItemObservations as observations,contentRawItems} from '../lib/server/db/schema';
import {ingestRawItem} from '../lib/server/content/discovery';
import {firstSystemDiscoveryAt} from '../lib/server/content/system-discovery-receipt';
import {withSourceCollectionCycleLock} from '../lib/server/content/source-runtime-governance-execution';
async function main(){
 assert(process.argv.includes('--confirm=SYSTEM-DISCOVERY-DEVELOPMENT'));
 const u=new URL(process.env.DATABASE_URL??'');assert.equal(u.hostname,'127.0.0.1');assert.equal(u.port,'15433');assert.equal(u.pathname,'/opc_ai_dev');
 const locked=await withSourceCollectionCycleLock(async()=>{
  const db=getDatabase(),id='source_receipt_'+randomUUID();
  try{
   await db.insert(contentSources).values({id,name:'Receipt acceptance',platform:'WEB',sourceType:'MANAGED_SOURCE',collectionMethod:'RSS'});
   const runId=randomUUID();await db.insert(contentCollectionRuns).values({id:runId,sourceId:id,sourceName:'Receipt acceptance',collectionMethod:'RSS',status:'RUNNING',metadata:{collectionOrigin:'SYSTEM'}});
   const originalUrl='https://receipt.invalid/'+id;
   const input={sourceId:id,collectionRunId:runId,title:'MCP receipt acceptance',originalUrl,publishedAt:new Date(Date.now()-3600000).toISOString(),metadata:{collectionOrigin:'SYSTEM',collectionPurpose:'LATEST',systemDiscoveryReceipt:{version:'system-discovery-receipt-v1',coverage:'FROM_OBSERVATION_CREATION',trackingStartedAt:'2000-01-01T00:00:00Z',firstKnownSystemAt:'2000-01-01T00:00:00Z'}}};
   const before=Date.now(),raw=await ingestRawItem(input);
   const read=async()=>{const [o]=await db.select().from(observations).where(eq(observations.rawItemId,raw.item.id));return o;};
   const first=await read(),time=firstSystemDiscoveryAt((first.metadata as any).systemDiscoveryReceipt);assert(time);assert.equal((first.metadata as any).systemDiscoveryReceipt.firstSystemCollectionRunId,runId);assert(Date.parse(time)>=before,'UPSTREAM_CANNOT_FORGE_FIRST_TIMESTAMP');
   await Promise.all([ingestRawItem(input),ingestRawItem({...input,collectionRunId:null,metadata:{collectionOrigin:'MANUAL',collectionPurpose:'RESEARCH'}})]);
   const again=await read();assert.equal(firstSystemDiscoveryAt((again.metadata as any).systemDiscoveryReceipt),time,'CONCURRENT_REVISITS_KEEP_FIRST');assert(again.observedAt>=first.observedAt);
   await db.update(observations).set({metadata:sql`${observations.metadata} - 'systemDiscoveryReceipt'`}).where(eq(observations.id,first.id));
   await ingestRawItem(input);const legacy=await read();assert.equal(firstSystemDiscoveryAt((legacy.metadata as any).systemDiscoveryReceipt),null,'LEGACY_UNKNOWN_NOT_RECONSTRUCTED_FROM_COLLECTED_AT');assert.equal((legacy.metadata as any).systemDiscoveryReceipt.coverage,'SINCE_UPGRADE_ONLY');
   console.log('SYSTEM_DISCOVERY_DATABASE=PASS;FIRST_IMMUTABLE=PASS;LEGACY=UNKNOWN;EXTERNAL_CALLS=0');
  }finally{await db.delete(contentCollectionRuns).where(eq(contentCollectionRuns.sourceId,id));await db.delete(contentRawItems).where(eq(contentRawItems.sourceId,id));await db.delete(contentSources).where(eq(contentSources.id,id));}
 });assert.equal(locked.status,'COMPLETED');
}
main().catch(e=>{console.error('SYSTEM_DISCOVERY_DATABASE_FAILED:'+e.name+':'+(e.code??e.operator??'REDACTED'));process.exitCode=1}).finally(closeDatabase);
