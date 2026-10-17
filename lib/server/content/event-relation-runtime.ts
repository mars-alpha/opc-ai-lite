import 'server-only';
import {and,asc,desc,eq,gte,inArray,isNull,lte,ne,sql} from 'drizzle-orm';
import {getDatabase} from '../db';
import {aiRuns,contentEvents as events,contentEventClusters as clusters,contentEventClusterMembers as members,contentEventRawItems as links,contentRawItems as raws,contentRawItemObservations as observations,contentSources as sources} from '../db/schema';
import {getConfiguredChatModelConfig,callConfiguredChatJson,type ConfiguredChatModelConfig,type ChatUsage} from '../ai/configured-chat';
import {EVENT_RELATION_SKILL,type RelationEvent} from '../../../skills/event-relation/v1';
import {EVENT_RELATION_TASK,prepareEventRelation,validateEventRelationOutput,eventRelationJobDue} from './event-relation-policy';
import {eventRelationHardConflict,ensurePrimaryCluster,mergeEventClusters,scoreEventClusterCandidate} from './event-clustering';
import {isCurrentSystemCollectionSource} from './source-portfolio-runtime';
const obj=(v:unknown):Record<string,any>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,any>:{};
type DB=ReturnType<typeof getDatabase>;
const lock=(db:DB)=>db.execute(sql`select pg_advisory_xact_lock(hashtext('opc-event-clustering-v6'))`);
const strings=(v:unknown)=>Array.isArray(v)?v.filter((x):x is string=>typeof x==='string'):[];
const system=(v:unknown)=>{const m=obj(v);return String(m.collectionOrigin??'').toUpperCase()==='SYSTEM'||(Array.isArray(m.collectionContexts)&&m.collectionContexts.some((c:any)=>c.origin==='SYSTEM'));};
/** Short transaction only; Provider I/O happens after all input locks are released. */
async function loadGroup(db:DB,eventId:string,now:number){
 const membership=await db.select().from(members).where(eq(members.eventId,eventId));
 const clusterId=membership[0]?.clusterId??null;
 const membershipRows=clusterId?await db.select().from(members).where(eq(members.clusterId,clusterId)):[];
 const ids=membershipRows.length?membershipRows.map(m=>m.eventId).sort():[eventId];if(ids.length>8)return null;
 const eventRows=await db.select().from(events).where(inArray(events.id,ids)).orderBy(asc(events.id)).for('update');
 if(eventRows.length!==ids.length||eventRows.some(e=>e.archivedAt||e.createdAt.getTime()>now||e.firstSeenAt.getTime()>now||(e.eventAt?.getTime()??e.firstSeenAt.getTime())>now||now-(e.eventAt?.getTime()??e.firstSeenAt.getTime())>168*3600000))return null;
 const linked=await db.select().from(links).where(inArray(links.eventId,ids));
 const rawIds=[...new Set(linked.map(l=>l.rawItemId))].sort();if(!rawIds.length)return null;
 const rawRows=await db.select().from(raws).where(inArray(raws.id,rawIds)).orderBy(asc(raws.id)).for('share');
 const observed=await db.select().from(observations).where(inArray(observations.rawItemId,rawIds)).for('share');
 const sourceIds=[...new Set(rawRows.map(r=>r.sourceId))].sort();
 const sourceRows=sourceIds.length?await db.select().from(sources).where(inArray(sources.id,sourceIds)).orderBy(asc(sources.id)).for('share'):[];
 const current=new Set(sourceRows.filter(s=>isCurrentSystemCollectionSource(s)).map(s=>s.id));
 const evidence=rawRows.filter(r=>current.has(r.sourceId)&&system(r.metadata)&&!obj(r.metadata).referenceOnly&&r.collectedAt.getTime()<=now&&(!r.publishedAt||r.publishedAt.getTime()<=now)&&observed.some(o=>o.rawItemId===r.id&&o.sourceId===r.sourceId&&o.observedAt.getTime()<=now&&system(o.metadata)));
 const input:RelationEvent[]=eventRows.map(e=>({eventId:e.id,title:e.title,firstSeenAt:e.firstSeenAt.toISOString(),entities:strings(e.entities),subjectEntityId:e.subjectEntityId,eventType:e.eventType,
  evidence:evidence.filter(r=>linked.some(l=>l.eventId===e.id&&l.rawItemId===r.id)).sort((a,b)=>(a.publishedAt??a.collectedAt).getTime()-(b.publishedAt??b.collectedAt).getTime()||a.id.localeCompare(b.id)).slice(0,3).map(r=>({rawId:r.id,sourceId:r.sourceId,text:[r.title,r.excerpt??''].join('\n').slice(0,2000),publishedAt:r.publishedAt?.toISOString()??null}))}));
 if(input.some(e=>!e.evidence.length))return null;
 const clusterRows=clusterId?await db.select().from(clusters).where(eq(clusters.id,clusterId)):[];
 return {clusterId,input,eventRows,membershipRows,clusterRows};
}
async function loadPair(db:DB,a:string,b:string,config:ConfiguredChatModelConfig,now:number){
 const ids=[a,b].sort();let left=await loadGroup(db,ids[0],now),right=await loadGroup(db,ids[1],now);
 if(!left||!right||(left.clusterId&&left.clusterId===right.clusterId)||left.input.length+right.input.length>8)return null;
 if(left.input[0].eventId>right.input[0].eventId)[left,right]=[right,left];
 return {...prepareEventRelation(left.input,right.input,config),left,right};
}
/** SYSTEM stage. No read API calls this function. ai_runs is its persistent task ledger. */
export async function runEventRelationCycle(options:{eventIds?:string[];maxItems?:number;budgetMs?:number}={},deps:{config?:ConfiguredChatModelConfig|null;fetchImpl?:typeof fetch;now?:()=>number}={}){
 const clock=deps.now??Date.now,started=clock(),deadline=started+Math.min(65000,Math.max(0,options.budgetMs??65000));
 const results:{status:string;aiRunId:string;reason?:string}[]=[];
 const summary=(status:string)=>({status,processed:results.length,merged:results.filter(r=>r.status==='MERGED').length,failed:results.filter(r=>r.status==='FAILED').length,stale:results.filter(r=>r.status==='STALE').length,results});
 if(process.env.OPC_COLLECTION_EVENT_RELATION!=='v1')return summary('DISABLED');
 const config=deps.config===undefined?getConfiguredChatModelConfig():deps.config;
 if(!config)return summary('DEFERRED_MODEL_UNCONFIGURED');
 if(!config.thinkingControl)return summary('DEFERRED_THINKING_CONTROL_UNCONFIGURED');
 if(options.eventIds?.length===0||deadline-clock()<22000)return summary('DEFERRED_TIME_SLICE');
 const db=getDatabase(),maxItems=Math.min(2,Math.max(1,options.maxItems??2));
 const active=and(isNull(events.archivedAt),gte(events.lastSeenAt,new Date(started-168*3600000)),lte(events.firstSeenAt,new Date(started)),lte(events.createdAt,new Date(started)));
 const anchors=await db.select().from(events).where(and(active,sql`jsonb_array_length(${events.entities}) > 0`,options.eventIds?inArray(events.id,options.eventIds):undefined,
  sql`(${events.metadata}->>'eventRelationScannedAt' is null or ${events.metadata}->>'eventRelationScannedAt' <= ${new Date(started-15*60000).toISOString()})`
 )).orderBy(sql`${events.metadata}->>'eventRelationScannedAt' asc nulls first`,asc(events.firstSeenAt),asc(events.id)).limit(10);
 for(const anchor of anchors){
  if(results.length>=maxItems||deadline-clock()<22000)break;
  const entityIds=strings(anchor.entities);if(!entityIds.length)continue;
  const storedCursor=obj(anchor.metadata).eventRelationCandidateCursor;
  const cursor=typeof storedCursor==='string'&&/^[a-f0-9-]{36}$/i.test(storedCursor)?storedCursor:null;
  const candidates=await db.select().from(events).where(and(active,cursor?sql`${events.id} > ${cursor}::uuid`:undefined,ne(events.id,anchor.id),options.eventIds?inArray(events.id,options.eventIds):undefined,
   gte(events.firstSeenAt,new Date(anchor.firstSeenAt.getTime()-72*3600000)),lte(events.firstSeenAt,new Date(anchor.firstSeenAt.getTime()+72*3600000)),
   sql`${events.entities} ?| ARRAY[${sql.join(entityIds.map(e=>sql`${e}`),sql`, `)}]`
  )).orderBy(asc(events.id)).limit(40);
  let lastCandidate=cursor,completedPage=true;
  for(const candidate of candidates){
   if(results.length>=maxItems||deadline-clock()<22000){completedPage=false;break;}
   lastCandidate=candidate.id;
   if(eventRelationHardConflict(anchor,candidate)||scoreEventClusterCandidate(anchor,candidate))continue;
   const claim=await db.transaction(async tx=>{
    const t=tx as unknown as DB;await lock(t);if(process.env.OPC_COLLECTION_EVENT_RELATION!=='v1')return null;
    const pair=await loadPair(t,anchor.id,candidate.id,config,clock());if(!pair)return null;
    const [old]=await tx.select().from(aiRuns).where(and(eq(aiRuns.taskType,EVENT_RELATION_TASK),eq(aiRuns.inputHash,pair.inputHash))).orderBy(desc(aiRuns.createdAt),desc(aiRuns.id)).limit(1);
    const state=obj(old?.validatorResult);
    if(old&&!eventRelationJobDue({status:old.status,nextRetryAt:state.nextRetryAt},clock()))return null;
    if(old?.status==='RUNNING')await tx.update(aiRuns).set({status:'ABANDONED',errorCode:'PROVIDER_OUTCOME_UNKNOWN',completedAt:new Date(clock())}).where(eq(aiRuns.id,old.id));
    const attempts=Number(state.attempts??0)+1;
    const job={attempts,nextRetryAt:new Date(clock()+15*60000).toISOString(),requestAttempts:0,usage:[] as ChatUsage[],usageStatus:'UNKNOWN'};
    const [run]=await tx.insert(aiRuns).values({taskType:EVENT_RELATION_TASK,modelProvider:config.provider,model:config.model,skillVersion:EVENT_RELATION_SKILL.version,promptVersion:EVENT_RELATION_SKILL.promptVersion,rulePackVersions:[pair.payload.schemaVersion,EVENT_RELATION_SKILL.outputSchema.schemaVersion],contextIds:[...pair.payload.left,...pair.payload.right].map(e=>e.eventId),evidenceIds:[...pair.payload.left,...pair.payload.right].flatMap(e=>e.evidence.map(r=>r.rawId)),inputHash:pair.inputHash,validatorResult:job,status:'RUNNING'}).returning();
    return {pair,run,job};
   });
   if(!claim)continue;
   const usage:ChatUsage[]=[];let requestAttempts=0,output:ReturnType<typeof validateEventRelationOutput>|undefined,errorCode:string|undefined;
   try{
    const value=await callConfiguredChatJson({systemPrompt:EVENT_RELATION_SKILL.systemPrompt,userPayload:claim.pair.payload,temperature:0,maxOutputTokens:2500,thinking:'disabled',timeoutMs:Math.min(20000,Math.max(1,deadline-clock()))},{config,fetchImpl:deps.fetchImpl,
     onAttempt:async()=>{requestAttempts++;await db.update(aiRuns).set({validatorResult:{...claim.job,requestAttempts,usage,usageStatus:'UNKNOWN'}}).where(eq(aiRuns.id,claim.run.id));},
     onUsage:async u=>{usage.push(u);await db.update(aiRuns).set({validatorResult:{...claim.job,requestAttempts,usage,usageStatus:'UNKNOWN'}}).where(eq(aiRuns.id,claim.run.id));}});
    output=validateEventRelationOutput(claim.pair.payload,value.data);
   }catch(error){errorCode=error instanceof Error&&/^(?:EVENT_RELATION|AI_ANALYSIS|AI_THINKING)_[A-Z_]+$/.test(error.message)?error.message:'EVENT_RELATION_PROVIDER_FAILED';}
   const final=await db.transaction(async tx=>{
    const t=tx as unknown as DB;await lock(t);
    const [run]=await tx.select().from(aiRuns).where(eq(aiRuns.id,claim.run.id)).for('update');
    const pair=await loadPair(t,anchor.id,candidate.id,config,clock());
    const valid=run?.status==='RUNNING'&&process.env.OPC_COLLECTION_EVENT_RELATION==='v1'&&pair?.inputHash===claim.pair.inputHash&&Date.parse(obj(run.validatorResult).nextRetryAt)>clock();
    const status=valid?errorCode?'FAILED':'SUCCEEDED':'STALE';let merged=false;
    const before=output?.mergeAllowed&&valid?{clusters:[...pair!.left.clusterRows,...pair!.right.clusterRows],members:[...pair!.left.membershipRows,...pair!.right.membershipRows]}:null;
    if(valid&&output?.mergeAllowed){
     const left=await ensurePrimaryCluster(pair!.left.eventRows[0],t),right=await ensurePrimaryCluster(pair!.right.eventRows[0],t);
     await mergeEventClusters({leftClusterId:left.id,rightClusterId:right.id,reason:{eventId:candidate.id,score:98,reason:'ACTION_ENTITY_MATCH',metadata:{titleScore:0,tokenOverlap:0,jaccard:0,keywordOverlap:0,entityOverlap:0,sharedTokenCount:0,hoursApart:0,rules:['AI_RELATION_CORE_VALIDATED',claim.run.id,claim.pair.inputHash]}}},t);merged=true;
    }
    const nextRetryAt=new Date(clock()+Math.min(24,2**Math.min(5,claim.job.attempts-1))*3600000).toISOString();
    await tx.update(aiRuns).set({status,rawOutput:output?{...output.output,beforeMapping:before}:null,validatorResult:{...claim.job,requestAttempts,usage,usageStatus:requestAttempts>0&&usage.length===requestAttempts&&usage.every(u=>u.status==='REPORTED')?'REPORTED':'UNKNOWN',nextRetryAt,mergeApplied:merged},errorCode:errorCode??(valid?null:'EVENT_RELATION_INPUT_CHANGED'),completedAt:new Date(clock())}).where(eq(aiRuns.id,claim.run.id));
    return merged?'MERGED':status;
   });
   results.push({status:final,aiRunId:claim.run.id,...(errorCode?{reason:errorCode}:{})});
  }
  const nextCursor=completedPage&&candidates.length<40?null:lastCandidate;
  await db.update(events).set({metadata:sql`jsonb_set(jsonb_set(${events.metadata},'{eventRelationScannedAt}',${JSON.stringify(new Date(clock()).toISOString())}::jsonb,true),'{eventRelationCandidateCursor}',${JSON.stringify(nextCursor)}::jsonb,true)`}).where(eq(events.id,anchor.id));
 }
 return summary(results.length?'COMPLETED':'NO_DUE_CANDIDATE');
}
