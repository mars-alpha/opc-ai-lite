import 'server-only';
import {and,asc,desc,eq,gte,inArray,isNull,lte,sql} from 'drizzle-orm';
import {getDatabase} from '../db';
import {aiRuns,contentEvents as events} from '../db/schema';
import {callConfiguredChatJson,getConfiguredChatModelConfig,type ConfiguredChatModelConfig,type ChatUsage} from '../ai/configured-chat';
import {EVENT_VALUE_SKILL,type ValueOutput} from '../../../skills/event-value-analysis/v1';
import {EVENT_VALUE_VERSION,validateEventValueOutput} from './event-value-policy';
import {expressionHash as valueHash} from './event-expression-policy';
import {loadEventValueContext} from './event-value-context';
import {eventRelationJobDue} from './event-relation-policy';
import {INTELLIGENCE_POLICY_VERSION} from '../../content/intelligence-policy';
const obj=(v:unknown):Record<string,any>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,any>:{};
type DB=ReturnType<typeof getDatabase>;
const lock=(db:DB)=>db.execute(sql`select pg_advisory_xact_lock(hashtext('opc-event-clustering-v6'))`);
export async function runEventValueCycle(options:{eventIds?:string[];maxItems?:number;budgetMs?:number}={},deps:{config?:ConfiguredChatModelConfig|null;fetchImpl?:typeof fetch;now?:()=>number}={}){
 const clock=deps.now??Date.now,start=clock(),deadline=start+Math.max(0,Math.min(65000,options.budgetMs??65000));
 const results:{eventId:string;status:string;aiRunId:string}[]=[];
 const summary=(status:string)=>({status,processed:results.length,enriched:results.filter(r=>r.status==='SUCCEEDED').length,failed:results.filter(r=>r.status==='FAILED').length,stale:results.filter(r=>r.status==='STALE').length,results});
 if(process.env.OPC_COLLECTION_EVENT_VALUE!=='v1')return summary('DISABLED');
 const config=deps.config===undefined?getConfiguredChatModelConfig():deps.config;
 if(!config)return summary('DEFERRED_MODEL_UNCONFIGURED');if(!config.thinkingControl)return summary('DEFERRED_THINKING_CONTROL_UNCONFIGURED');
 if(options.eventIds?.length===0||deadline-clock()<22000)return summary('DEFERRED_TIME_SLICE');
 const modelKey=valueHash([config.provider,config.model,config.baseUrl,config.thinkingControl]);
 const db=getDatabase(),seen=new Set<string>();
 const candidates=await db.select({id:events.id}).from(events).where(and(isNull(events.archivedAt),eq(events.policyVersion,INTELLIGENCE_POLICY_VERSION),gte(events.lastSeenAt,new Date(start-168*3600000)),lte(events.createdAt,new Date(start)),lte(events.firstSeenAt,new Date(start)),options.eventIds?inArray(events.id,options.eventIds):undefined,
 sql`${events.metadata}->'eventPolicy'->>'systemObserved' = 'true'`,sql`${events.metadata}->'eventPolicy'->>'aiRelevant' = 'true'`,sql`${events.metadata}->'eventPolicy'->>'version' = ${INTELLIGENCE_POLICY_VERSION}`,sql`${events.metadata}->'eventPolicy'->'operationalUsefulness'->>'eligible' is distinct from 'false'`,
 sql`(${events.metadata}->>'eventValueScannedAt' is null or ${events.metadata}->>'eventValueScannedAt' <= ${new Date(start-15*60000).toISOString()})`)).orderBy(sql`${events.metadata}->>'eventValueScannedAt' asc nulls first`,asc(events.firstSeenAt),asc(events.id)).limit(20);
 for(const candidate of candidates){
  if(results.length>=Math.min(2,Math.max(1,options.maxItems??2))||deadline-clock()<22000)break;
  const claim=await db.transaction(async tx=>{
   const t=tx as unknown as DB;await lock(t);if(process.env.OPC_COLLECTION_EVENT_VALUE!=='v1')return null;
   const context=await loadEventValueContext(t,candidate.id,new Date(clock()));
   await tx.update(events).set({metadata:sql`jsonb_set(${events.metadata},'{eventValueScannedAt}',${JSON.stringify(new Date(clock()).toISOString())}::jsonb,true)`}).where(inArray(events.id,[...new Set([candidate.id,...(context?.memberIds??[])])]));
   if(!context||seen.has(context.canonicalId))return null;seen.add(context.canonicalId);
   const inputHash=valueHash([context.fingerprint,modelKey]);
   const [old]=await tx.select().from(aiRuns).where(and(eq(aiRuns.taskType,'EVENT_VALUE'),eq(aiRuns.inputHash,inputHash))).orderBy(desc(aiRuns.createdAt),desc(aiRuns.id)).limit(1);
   const before=obj(old?.validatorResult);
   if(old?.status==='SUCCEEDED'){
    try{
     const output=validateEventValueOutput(context.payload,old.rawOutput);
     await tx.update(events).set({metadata:sql`jsonb_set(${events.metadata},'{eventValue}',${JSON.stringify({version:EVENT_VALUE_VERSION,fingerprint:context.fingerprint,modelKey,aiRunId:old.id,status:'STAGED',validation:{citationPresence:'PASS',citationLocation:'PASS',claimCoverage:'PRESENT',semanticSupport:'UNREVIEWED',semanticCoverage:'UNREVIEWED'},generatedAt:old.completedAt?.toISOString()??old.createdAt.toISOString(),output})}::jsonb,true)`}).where(eq(events.id,context.canonicalId));
     return null;
    }catch{/* Validator changes must not keep an invalid successful cache authoritative. */}
   }else if(old&&!eventRelationJobDue({status:old.status,nextRetryAt:before.nextRetryAt},clock()))return null;
   if(old?.status==='RUNNING')await tx.update(aiRuns).set({status:'ABANDONED',errorCode:'PROVIDER_OUTCOME_UNKNOWN',completedAt:new Date(clock())}).where(eq(aiRuns.id,old.id));
   const state={attempts:Number(before.attempts??0)+1,nextRetryAt:new Date(clock()+15*60000).toISOString(),requestAttempts:0,usage:[] as ChatUsage[],usageStatus:'UNKNOWN'};
   const [run]=await tx.insert(aiRuns).values({taskType:'EVENT_VALUE',modelProvider:config.provider,model:config.model,skillVersion:EVENT_VALUE_SKILL.version,promptVersion:EVENT_VALUE_SKILL.promptVersion,rulePackVersions:[context.payload.schemaVersion,EVENT_VALUE_SKILL.outputSchema.schemaVersion],contextIds:[context.canonicalId],evidenceIds:context.payload.evidence.map(e=>e.id),inputHash,status:'RUNNING',validatorResult:state}).returning();
   return {context,run,state};
  });
  if(!claim)continue;
  let output:ValueOutput|undefined,errorCode:string|undefined,requestAttempts=0;const usage:ChatUsage[]=[];
  const record=async()=>{await db.update(aiRuns).set({validatorResult:{...claim.state,requestAttempts,usage,usageStatus:'UNKNOWN'}}).where(eq(aiRuns.id,claim.run.id));};
  try{const value=await callConfiguredChatJson({systemPrompt:EVENT_VALUE_SKILL.systemPrompt,userPayload:claim.context.payload,temperature:0,maxOutputTokens:4500,thinking:'disabled',timeoutMs:Math.min(20000,Math.max(1,deadline-clock()))},{config,fetchImpl:deps.fetchImpl,onAttempt:async()=>{requestAttempts++;await record();},onUsage:async u=>{usage.push(u);await record();}});output=validateEventValueOutput(claim.context.payload,value.data);}
  catch(error){errorCode=error instanceof Error&&/^(EVENT_VALUE|AI_ANALYSIS|AI_THINKING)_[A-Z_]+$/.test(error.message)?error.message:'EVENT_VALUE_PROVIDER_FAILED';}
  const status=await db.transaction(async tx=>{
   const t=tx as unknown as DB;await lock(t);
   const [run]=await tx.select().from(aiRuns).where(eq(aiRuns.id,claim.run.id)).for('update');
   const current=await loadEventValueContext(t,candidate.id,new Date(clock()));
   const valid=run?.status==='RUNNING'&&process.env.OPC_COLLECTION_EVENT_VALUE==='v1'&&current?.canonicalId===claim.context.canonicalId&&current.revision===claim.context.revision&&Date.parse(obj(run.validatorResult).nextRetryAt)>clock();
   const status=valid?(output?'SUCCEEDED':'FAILED'):'STALE';
   if(status==='SUCCEEDED')await tx.update(events).set({metadata:sql`jsonb_set(${events.metadata},'{eventValue}',${JSON.stringify({version:EVENT_VALUE_VERSION,fingerprint:claim.context.fingerprint,modelKey,aiRunId:run.id,status:'STAGED',validation:{citationPresence:'PASS',citationLocation:'PASS',claimCoverage:'PRESENT',semanticSupport:'UNREVIEWED',semanticCoverage:'UNREVIEWED'},generatedAt:new Date(clock()).toISOString(),output})}::jsonb,true)`}).where(eq(events.id,claim.context.canonicalId));
   await tx.update(aiRuns).set({status,rawOutput:output??null,validatorResult:{...claim.state,requestAttempts,usage,usageStatus:requestAttempts>0&&usage.length===requestAttempts&&usage.every(u=>u.status==='REPORTED')?'REPORTED':'UNKNOWN',nextRetryAt:new Date(clock()+Math.min(24,2**Math.min(5,claim.state.attempts-1))*3600000).toISOString(),translationRequested:false},errorCode:errorCode??(valid?null:'EVENT_VALUE_INPUT_CHANGED'),completedAt:new Date(clock())}).where(eq(aiRuns.id,claim.run.id));
   return status;
  });results.push({eventId:claim.context.canonicalId,status,aiRunId:claim.run.id});
 }
 return summary(results.length?'COMPLETED':'NO_DUE_CANDIDATE');
}
/** Read-only staging endpoint: no Provider call and no publication operation. */
export async function readStagedEventValue(eventId:string){
 return getDatabase().transaction(async tx=>{
  const context=await loadEventValueContext(tx as unknown as DB,eventId,new Date());
  if(!context)return {status:'EVIDENCE_OR_TRIGGER_INSUFFICIENT',report:null};
  const [event]=await tx.select({metadata:events.metadata}).from(events).where(eq(events.id,context.canonicalId));
  const stored=obj(obj(event?.metadata).eventValue);
  if(stored.version!==EVENT_VALUE_VERSION||stored.fingerprint!==context.fingerprint)return {status:'NOT_GENERATED_OR_STALE',report:null,inputVersion:context.fingerprint};
  try{return {status:'STAGED',report:{...stored,output:validateEventValueOutput(context.payload,stored.output)},inputVersion:context.fingerprint};}
  catch{return {status:'INVALID',report:null};}
 });
}
