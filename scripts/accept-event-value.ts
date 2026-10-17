import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {loadEnvConfig} from '@next/env';
import {eq,inArray,sql} from 'drizzle-orm';
import {getDatabase,closeDatabase} from '../lib/server/db';
import {assertCurrentDatabaseTarget} from '../lib/server/database-target';
import {aiRuns,contentEvents as events,contentSources as sources,contentRawItems as raws,contentRawItemObservations as observations,contentEventRawItems as links,contentEventClusters as clusters,contentEventClusterMembers as members} from '../lib/server/db/schema';
import {withSourceCollectionCycleLock} from '../lib/server/content/source-runtime-governance-execution';
import {runEventValueCycle,readStagedEventValue} from '../lib/server/content/event-value-runtime';
import {runEventGapCycle} from '../lib/server/content/event-gap-runtime';
import {loadEventValueContext} from '../lib/server/content/event-value-context';
import {loadEventGapContext} from '../lib/server/content/event-gap-context';
import {validateEventGapOutput} from '../lib/server/content/event-gap-policy';
import {SOURCE_ONBOARDING_VERSION} from '../lib/server/content/source-onboarding';
import {INTELLIGENCE_POLICY_VERSION} from '../lib/content/intelligence-policy';
import {VALUE_SECTIONS} from '../skills/event-value-analysis/v1';
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes('--confirm=EVENT-VALUE-DEVELOPMENT'));assert.equal(assertCurrentDatabaseTarget().environment,'development');
 const locked=await withSourceCollectionCycleLock(async()=>{
  const db=getDatabase(),token=randomUUID().replaceAll('-',''),eventId=randomUUID(),memberId=randomUUID(),clusterId=randomUUID(),sourceId='source_value_'+token,rawId=randomUUID();
  const saved={value:process.env.OPC_COLLECTION_EVENT_VALUE,gap:process.env.OPC_COLLECTION_EVENT_GAP};
  const date=new Date(Date.now()-60000),title='OpenAI Codex MCP workflow v1 release is now available',excerpt='A configurable MCP agent workflow for local tasks.';
  const body='1. Install the package and configure input_file=notes.txt.\n2. Run the MCP agent and export the output report.\nDocumented limits require reviewing generated results.';
  const config={provider:'fixture',model:'fixture',baseUrl:'https://model.invalid',apiKey:'fixture',thinkingControl:'enable_thinking' as const};let calls=0,mode='VALID';
  const fetchImpl:typeof fetch=async(_url,init)=>{
   calls++;const request=JSON.parse(String(init?.body)),input=JSON.parse(request.messages[1].content),e=input.evidence[0];
   const output=input.schemaVersion==='event-gap-input-v1'?{schemaVersion:'event-gap-output-v1',queries:[{query:input.subject+' 原作者 工作流 教程',language:'ZH',expansionType:'TUTORIAL'},{query:input.subject+' workflow repository hands-on',language:'EN',expansionType:'EXPERIENCE'}]}:{schemaVersion:'event-value-output-v1',claims:VALUE_SECTIONS.map(section=>({section,kind:'SOURCE_CLAIM',text:'作者称可配置工作流，并要求检查输出结果。',citations:[{evidenceId:e.id,quote:e.text.slice(0,300)}]})),gaps:['缺少独立实测，不能确认比较条件。'],comparison:{status:'NOT_COMPARABLE',reason:'只有官方资料'}};
   if(mode==='CONCURRENT')assert.equal((await invoke()).processed,0);
   if(mode==='CHANGE')await db.update(raws).set({excerpt:excerpt+' Substantive change during generation.'}).where(eq(raws.id,rawId));
   if(mode==='NETWORK')throw new Error('fixture network error');
   return Response.json({choices:[{message:{content:JSON.stringify(output)}}],usage:{prompt_tokens:100,completion_tokens:50,total_tokens:150}});
  };
  const scan=()=>db.update(events).set({metadata:sql`${events.metadata}-'eventValueScannedAt'-'eventGapScannedAt'`}).where(inArray(events.id,[eventId,memberId]));
  const invoke=async()=>{await scan();return runEventValueCycle({eventIds:[memberId],maxItems:1},{config,fetchImpl});};
  try{
   await db.insert(sources).values({id:sourceId,name:'OpenAI',sourceType:'OFFICIAL',providerRef:token,platform:'WEB',collectionMethod:'RSS',canonicalUrl:'https://openai.com',enabled:true,metadata:{sourceOnboarding:{version:SOURCE_ONBOARDING_VERSION},sourceRegistry:{owner:'SOURCE_MANAGEMENT'},factualSource:true,acceptanceOnly:true}});
   const policy={version:INTELLIGENCE_POLICY_VERSION,systemObserved:true,aiRelevant:true,operationalUsefulness:{eligible:true}};
   await db.insert(events).values({id:eventId,title,summary:excerpt,eventType:'OPEN_SOURCE',fingerprint:token,entities:['OpenAI','Codex'],keywords:['Codex','MCP'],firstSeenAt:date,lastSeenAt:date,eventAt:date,createdAt:date,policyVersion:INTELLIGENCE_POLICY_VERSION,metadata:{eventPolicy:policy}});
   await db.insert(events).values({id:memberId,title,summary:excerpt,eventType:'OPEN_SOURCE',fingerprint:token+'member',entities:['OpenAI','Codex'],keywords:['Codex','MCP'],firstSeenAt:new Date(date.getTime()+1000),lastSeenAt:date,eventAt:date,createdAt:date,policyVersion:INTELLIGENCE_POLICY_VERSION,metadata:{eventPolicy:policy}});
   await db.insert(clusters).values({id:clusterId,canonicalTitle:title,primaryEventId:eventId,clusterRuleVersion:'fixture',firstSeenAt:date,lastSeenAt:date});
   await db.insert(members).values([eventId,memberId].map(id=>({eventId:id,clusterId,role:id===eventId?'PRIMARY':'MEMBER',clusterRuleVersion:'fixture',mergeReason:'FIXTURE',mergeScore:90})));
   await db.insert(raws).values({id:rawId,sourceId,platform:'WEB',title,excerpt,originalUrl:'https://openai.com/'+token,contentHash:token,publishedAt:date,collectedAt:date,metadata:{collectionOrigin:'SYSTEM',contentType:'OFFICIAL_ANNOUNCEMENT',bodyText:body,publicContentReceipt:{url:'https://openai.com/'+token,status:200,anonymous:true,serverFetched:true,complete:true,kind:'BODY',observedAt:date.toISOString()}}});
   await db.insert(observations).values({rawItemId:rawId,sourceId,platform:'WEB',observedAt:date,metadata:{collectionOrigin:'SYSTEM'}});
   await db.insert(links).values({eventId,rawItemId:rawId});
   const context=await loadEventValueContext(db,eventId,new Date());assert(context,'official complete material triggers featured brief');
   assert.equal(context.memberIds.length,2);assert.equal(await loadEventValueContext(db,eventId,new Date(date.getTime()-1000)),null,'asOf excludes future-created evidence and members');
   process.env.OPC_COLLECTION_EVENT_VALUE='off';assert.equal((await invoke()).status,'DISABLED');assert.equal(calls,0);
   process.env.OPC_COLLECTION_EVENT_VALUE='v1';mode='CONCURRENT';assert.equal((await invoke()).enriched,1);assert.equal(calls,1);
   assert.equal((await readStagedEventValue(eventId)).status,'STAGED');assert.equal((await invoke()).processed,0);assert.equal(calls,1);
   assert((await db.select().from(events).where(inArray(events.id,[eventId,memberId]))).every(e=>(e.metadata as any).eventValueScannedAt),'canonical and noncanonical members advance scan watermarks');
   await db.update(raws).set({excerpt:excerpt+' New independent information.'}).where(eq(raws.id,rawId));mode='CHANGE';assert.equal((await invoke()).stale,1);
   assert.equal((await readStagedEventValue(eventId)).status,'NOT_GENERATED_OR_STALE');
   mode='NETWORK';assert.equal((await invoke()).failed,1);const before=calls;assert.equal((await invoke()).processed,0);assert.equal(calls,before);
   const rows=await db.select().from(aiRuns).where(sql`${aiRuns.contextIds} @> ${JSON.stringify([eventId])}::jsonb`);assert(rows.some(r=>r.status==='FAILED'&&(r.validatorResult as any).usageStatus==='UNKNOWN'));
   process.env.OPC_COLLECTION_EVENT_GAP='off';assert.equal((await runEventGapCycle({eventIds:[eventId]},{config,fetchImpl})).status,'DISABLED');
   process.env.OPC_COLLECTION_EVENT_GAP='v1';mode='VALID';await scan();
   const gapContext=await loadEventGapContext(db,eventId,new Date());assert(gapContext,'important official seed can plan a material gap');
   assert.equal((await runEventGapCycle({eventIds:[eventId],maxItems:1},{config,fetchImpl})).enriched,1);
   const gapCalls=calls;await scan();assert.equal((await runEventGapCycle({eventIds:[eventId],maxItems:1},{config,fetchImpl})).processed,0);assert.equal(calls,gapCalls,'unchanged gap uses successful cache');
   const [planned]=await db.select().from(events).where(eq(events.id,eventId));const gapPlan=(planned.metadata as any).eventGap;
   assert.equal(validateEventGapOutput(gapContext.payload,gapPlan.output).queries.length,2);assert.equal(gapPlan.validation,undefined,'query plan cannot claim citation validation');
   await db.update(events).set({metadata:sql`jsonb_set(${events.metadata},'{practiceDiscovery}',${JSON.stringify({status:'RUNNING',lastAttemptAt:new Date().toISOString()})}::jsonb)`}).where(eq(events.id,eventId));
   assert.equal(await loadEventGapContext(db,eventId,new Date()),null,'RUNNING checkpoint prevents duplicate planning');
   assert(await loadEventGapContext(db,eventId,new Date(),{forExecution:true}),'claimed search can consume its current plan');
   assert.equal((await db.select().from(events).where(eq(events.id,eventId)))[0].discoveryStatus,'DISCOVERED','staged report cannot publish or change event status');
   console.log('EVENT_VALUE_GAP_PG_LEASE_CACHE_CAS_BACKOFF_USAGE_STAGING=PASS');
  }finally{
   for(const [key,value] of [['OPC_COLLECTION_EVENT_VALUE',saved.value],['OPC_COLLECTION_EVENT_GAP',saved.gap]])if(value===undefined)delete process.env[key!];else process.env[key!]=value;
   await db.delete(aiRuns).where(sql`${aiRuns.contextIds} @> ${JSON.stringify([eventId])}::jsonb`);
   await db.delete(members).where(eq(members.clusterId,clusterId));await db.delete(clusters).where(eq(clusters.id,clusterId));
   await db.delete(links).where(eq(links.eventId,eventId));await db.delete(observations).where(eq(observations.rawItemId,rawId));await db.delete(raws).where(eq(raws.id,rawId));await db.delete(events).where(inArray(events.id,[eventId,memberId]));await db.delete(sources).where(eq(sources.id,sourceId));
  }
 });assert.equal(locked.status,'COMPLETED');
}
main().catch(error=>{console.error({code:'EVENT_VALUE_ACCEPT_FAILED',message:error instanceof assert.AssertionError?error.message:'REDACTED'});process.exitCode=1;}).finally(closeDatabase);
