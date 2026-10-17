import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {loadEnvConfig} from '@next/env';
import {eq,inArray,sql} from 'drizzle-orm';
import {getDatabase,closeDatabase} from '../lib/server/db';
import {assertCurrentDatabaseTarget} from '../lib/server/database-target';
import {contentSources as sources,contentEvents as events,contentRawItems as raws,contentRawItemObservations as observations,contentEventRawItems as links,contentEventClusters as clusters,contentEventClusterMembers as members,contentCollectionRuns as runs,contentEventExpansionEvidence as expansions} from '../lib/server/db/schema';
import {withSourceCollectionCycleLock} from '../lib/server/content/source-runtime-governance-execution';
import {SOURCE_ONBOARDING_VERSION} from '../lib/server/content/source-onboarding';
import {INTELLIGENCE_POLICY_VERSION} from '../lib/content/intelligence-policy';
import {inspectRadarFunnel} from '../lib/server/content/radar-funnel-store';
import {readRadarOperations,applyRadarOperations} from '../lib/server/content/radar-snapshot';
import {listRadarCalendarRange} from '../lib/server/content/intelligence-read-model';
import {mergeSystemDiscoveryReceipt} from '../lib/server/content/system-discovery-receipt';
import type {RadarReference} from '../lib/server/content/radar-funnel';
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes('--confirm=RADAR-FUNNEL-DEVELOPMENT'));
 const target=assertCurrentDatabaseTarget();assert.equal(target.environment,'development');assert.equal(target.databaseName,'opc_ai_dev');
 const locked=await withSourceCollectionCycleLock(async()=>{
  const db=getDatabase(),token=randomUUID().replaceAll('-',''),sourceId='source_funnel_'+token,ids:string[]=Array.from({length:4},()=>randomUUID()),rawIds:string[]=Array.from({length:6},()=>randomUUID()),clusterId=randomUUID();
  const published=new Date(Date.now()-36*3600000),collected=new Date(Date.now()-60000),title='Meta releases Muse Spark Open v99',url=(i:number)=>'https://funnel-'+token+'.invalid/'+i;
  const policy={version:INTELLIGENCE_POLICY_VERSION,systemObserved:true,aiRelevant:true,operationalUsefulness:{eligible:true}};
  const reference=(id:string,index:number,source=sourceId):RadarReference=>({id,url:url(index),sourceId:source,publishedAt:published.toISOString(),basis:'OBSERVED_ONLY',labels:{featured:'UNKNOWN',hot:'UNKNOWN',practice:'UNKNOWN'}});
  try{
   await db.insert(sources).values({id:sourceId,name:'Meta fixture',providerRef:token,platform:'WEB',sourceType:'OFFICIAL',collectionMethod:'RSS',enabled:true,canonicalUrl:url(0),metadata:{sourceOnboarding:{version:SOURCE_ONBOARDING_VERSION},sourceRegistry:{owner:'SOURCE_MANAGEMENT'},sourceUniverseRole:'OFFICIAL',factualSource:true,acceptanceOnly:true}});
   await db.insert(events).values(ids.map((id,i)=>({id,title,fingerprint:token+i,eventType:'MODEL_RELEASE',keywords:['Muse Spark Open'],entities:[],firstSeenAt:published,lastSeenAt:collected,eventAt:published,createdAt:collected,archivedAt:i===0?collected:null,policyVersion:INTELLIGENCE_POLICY_VERSION,metadata:{eventPolicy:i===3?{...policy,operationalUsefulness:{eligible:false,reason:'FIXTURE_BLOCK'}}:policy}})));
   await db.insert(clusters).values({id:clusterId,canonicalTitle:title,primaryEventId:ids[0],firstSeenAt:published,lastSeenAt:collected,clusterRuleVersion:'fixture'});
   await db.insert(members).values(ids.slice(0,2).map((eventId,i)=>({eventId,clusterId,role:i===0?'PRIMARY':'MEMBER',clusterRuleVersion:'fixture',mergeScore:99,mergeReason:'FIXTURE'})));
   await db.insert(raws).values(rawIds.map((id,i)=>({id,sourceId,platform:'WEB',title:i===0?'Completely unrelated calendar report':title,excerpt:i===0?null:'Open AI model weights and local inference.',originalUrl:url(i),canonicalUrl:url(i),contentHash:token+i,publishedAt:new Date(published.getTime()-(i===0?60000:0)),collectedAt:collected,createdAt:collected,metadata:{collectionOrigin:i===3?'MANUAL':'SYSTEM',contentType:'OFFICIAL_ANNOUNCEMENT',discoveryFilter:{relationType:'DIRECT'}}})));
   await db.insert(observations).values(rawIds.map((rawItemId,i)=>({rawItemId,sourceId,platform:'WEB',observedAt:collected,metadata:{collectionOrigin:i===3?'MANUAL':'SYSTEM'}})));
   await db.insert(links).values([{eventId:ids[1],rawItemId:rawIds[0]},{eventId:ids[1],rawItemId:rawIds[1]},{eventId:ids[2],rawItemId:rawIds[3]},{eventId:ids[3],rawItemId:rawIds[4]}]);
   await db.insert(expansions).values({eventId:ids[1],rawItemId:rawIds[5],expansionType:'TUTORIAL',mediaType:'ARTICLE',relevanceScore:95,valueScore:95,rankScore:95,createdAt:collected,metadata:{matchedTitleSpecificAnchors:['Muse','Spark','Open'],matchedTitleVersionAnchors:['v99']}});
   await db.insert(runs).values({sourceId,sourceName:'Fixture',collectionMethod:'RSS',status:'SUCCEEDED',startedAt:collected,finishedAt:collected,metadata:{collectionOrigin:'SYSTEM',rejectedSampleCapture:{samples:[{originalUrl:url(8),stage:'DISCOVERY_FILTER',reason:'FIXTURE_REJECT'}]}}});
   // A new source-local receipt cannot erase another source's legacy history.
   const secondSource=sourceId+'_second';
   await db.insert(sources).values({id:secondSource,name:'Second receipt source',platform:'WEB',sourceType:'MANAGED_SOURCE',collectionMethod:'RSS'});
   await db.insert(observations).values({rawItemId:rawIds[1],sourceId:secondSource,platform:'WEB',observedAt:collected,metadata:{collectionOrigin:'SYSTEM',systemDiscoveryReceipt:mergeSystemDiscoveryReceipt(undefined,false,true,collected.toISOString())}});
   const asOf=new Date(Date.now()+500),before=JSON.stringify(await db.select().from(events).where(inArray(events.id,ids)));
   const refs=[reference('official',1),reference('no-event',2),reference('rejected',8),reference('missing',9,'source_missing_'+token),reference('manual',3),reference('blocked',4),reference('unrelated',0),reference('expansion',5)];
   const report=await inspectRadarFunnel(refs,asOf),byId=new Map(report.diagnoses.map(r=>[r.reference.id,r]));
   assert.equal(report.diagnoses.length,8);assert.equal(byId.get('official')?.delayHours,null,'CROSS_SOURCE_LEGACY_TIME_STAYS_UNKNOWN');assert.equal(byId.get('official')?.firstGap,null);assert.equal(byId.get('official')?.visible,true);assert.deepEqual(byId.get('official')?.canonicalIds,[ids[0]]);assert.equal(byId.get('official')?.columns.featured.selected,true,'single official positive retained without threshold changes');
   assert.equal(byId.get('unrelated')?.firstGap,'EVIDENCE','rejected unrelated raw cannot borrow canonical qualification');assert.equal(byId.get('unrelated')?.columns.featured.selected,false);
   assert.equal(byId.get('expansion')?.firstGap,null,'accepted expansion-only reference is not missing Event');assert.equal(byId.get('expansion')?.visible,true);
   assert.equal(byId.get('no-event')?.firstGap,'EVENT');assert.equal(byId.get('rejected')?.firstGap,'RAW');assert.equal(byId.get('missing')?.firstGap,'SOURCE');assert.equal(byId.get('manual')?.firstGap,'EVIDENCE');assert.equal(byId.get('blocked')?.firstGap,'VISIBILITY');assert.equal(report.summary.discoveryRecall24h,null);
   const visible=(await listRadarCalendarRange(new Date(published.getTime()-1),asOf,asOf)).filter(i=>ids.includes(i.eventId));assert.equal(visible.length,1);assert.equal(visible[0].verificationStatus,'CONFIRMED_OFFICIAL','earlier unrelated raw no longer masks fact');
   const item={eventId:ids[0],category:'模型'},snapshot={items:[item],featured:[item],currentHot:[item],aiHotspotPractices:[item],windowEventIndex:[item],totalEventCount7d:1,categoryCounts7d:{全部:1,模型:1}};
   const beforeOverlay=applyRadarOperations(snapshot,[{id:ids[0],archivedAt:collected,discoveryStatus:'UNREVIEWED'}]);
   assert.equal(beforeOverlay.items.length,0);const afterOverlay=await readRadarOperations(snapshot);assert.equal(afterOverlay.items.length,1);assert.equal(afterOverlay.featured.length,1);assert.equal(afterOverlay.currentHot.length,1);assert.equal(afterOverlay.aiHotspotPractices.length,1);
   assert.equal(JSON.stringify(await db.select().from(events).where(inArray(events.id,ids))),before,'read-only audit and operation projection do not mutate original events');
   await db.update(events).set({archivedAt:collected}).where(eq(events.id,ids[1]));assert.equal((await readRadarOperations(snapshot)).items.length,0,'all archived hides card');
   console.log('RADAR_FUNNEL_DEVELOPMENT=PASS;SAME_SAMPLE_SNAPSHOT_BEFORE=0;AFTER=1;EXTERNAL_REQUESTS=0;MODEL_CALLS=0');
  }finally{await db.delete(runs).where(eq(runs.sourceId,sourceId));await db.delete(events).where(inArray(events.id,ids));await db.delete(clusters).where(eq(clusters.id,clusterId));await db.delete(sources).where(inArray(sources.id,[sourceId,sourceId+'_second']));}
 });assert.equal(locked.status,'COMPLETED');
}
main().catch(e=>{console.error(e instanceof assert.AssertionError?e:{code:'RADAR_FUNNEL_ACCEPT_FAILED',message:/^RADAR_[A-Z_]+$/.test(e.message)?e.message:'REDACTED'});process.exitCode=1}).finally(closeDatabase);
