import 'server-only';
import {and,asc,desc,eq,gte,inArray,isNull,lte,sql} from 'drizzle-orm';
import {getDatabase} from '../db';
import {aiRuns,contentEvents as events} from '../db/schema';
import {callConfiguredChatJson,getConfiguredChatModelConfig,type ConfiguredChatModelConfig,type ChatUsage} from '../ai/configured-chat';
import {EVENT_EXPRESSION_SKILL,type ExpressionOutput} from '../../../skills/event-expression/v1';
import {EVENT_EXPRESSION_VERSION,expressionHash,validateEventExpressionOutput} from './event-expression-policy';
import {loadExpressionContext} from './event-expression-context';
import {eventRelationJobDue} from './event-relation-policy';
import {INTELLIGENCE_POLICY_VERSION} from '../../content/intelligence-policy';
const obj=(v:unknown):Record<string,any>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,any>:{};
type DB=ReturnType<typeof getDatabase>;
const lock=(db:DB)=>db.execute(sql`select pg_advisory_xact_lock(hashtext('opc-event-clustering-v6'))`);
export async function runEventExpressionCycle(options:{eventIds?:string[];maxItems?:number;budgetMs?:number}={},deps:{config?:ConfiguredChatModelConfig|null;fetchImpl?:typeof fetch;now?:()=>number}={}){
 const clock=deps.now??Date.now,start=clock(),deadline=start+Math.max(0,Math.min(65000,options.budgetMs??65000));
 const results:{eventId:string;status:string;aiRunId:string}[]=[];
 const summary=(status:string)=>({status,processed:results.length,enriched:results.filter(r=>r.status==='SUCCEEDED').length,failed:results.filter(r=>r.status==='FAILED').length,stale:results.filter(r=>r.status==='STALE').length,results});
 if(process.env.OPC_COLLECTION_EVENT_EXPRESSION!=='v1')return summary('DISABLED');
 const config=deps.config===undefined?getConfiguredChatModelConfig():deps.config;
 if(!config)return summary('DEFERRED_MODEL_UNCONFIGURED');if(!config.thinkingControl)return summary('DEFERRED_THINKING_CONTROL_UNCONFIGURED');
 if(options.eventIds?.length===0||deadline-clock()<22000)return summary('DEFERRED_TIME_SLICE');
 const modelKey=expressionHash([config.provider,config.model,config.baseUrl,config.thinkingControl]);
 const db=getDatabase(),seen=new Set<string>();
 const candidates=await db.select({id:events.id}).from(events).where(and(isNull(events.archivedAt),eq(events.policyVersion,INTELLIGENCE_POLICY_VERSION),gte(events.lastSeenAt,new Date(start-168*3600000)),lte(events.createdAt,new Date(start)),lte(events.firstSeenAt,new Date(start)),options.eventIds?inArray(events.id,options.eventIds):undefined,
 sql`${events.metadata}->'eventPolicy'->>'systemObserved' = 'true'`,sql`${events.metadata}->'eventPolicy'->>'aiRelevant' = 'true'`,sql`${events.metadata}->'eventPolicy'->>'version' = ${INTELLIGENCE_POLICY_VERSION}`,sql`${events.metadata}->'eventPolicy'->'operationalUsefulness'->>'eligible' is distinct from 'false'`,
 sql`(${events.metadata}->>'eventExpressionScannedAt' is null or ${events.metadata}->>'eventExpressionScannedAt' <= ${new Date(start-15*60000).toISOString()})`)).orderBy(sql`${events.metadata}->>'eventExpressionScannedAt' asc nulls first`,asc(events.firstSeenAt),asc(events.id)).limit(20);
 for(const candidate of candidates){
  if(results.length>=Math.min(2,Math.max(1,options.maxItems??2))||deadline-clock()<22000)break;
  const claim=await db.transaction(async tx=>{
   const t=tx as unknown as DB;await lock(t);if(process.env.OPC_COLLECTION_EVENT_EXPRESSION!=='v1')return null;
   const context=await loadExpressionContext(t,candidate.id,new Date(clock()));
   await tx.update(events).set({metadata:sql`jsonb_set(${events.metadata},'{eventExpressionScannedAt}',${JSON.stringify(new Date(clock()).toISOString())}::jsonb,true)`}).where(inArray(events.id,context?.memberIds??[candidate.id]));
   if(!context||seen.has(context.canonicalId))return null;seen.add(context.canonicalId);
   const inputHash=expressionHash([context.fingerprint,modelKey]);
   const [old]=await tx.select().from(aiRuns).where(and(eq(aiRuns.taskType,'EVENT_EXPRESSION'),eq(aiRuns.inputHash,inputHash))).orderBy(desc(aiRuns.createdAt),desc(aiRuns.id)).limit(1);
   const before=obj(old?.validatorResult);
   if(old?.status==='SUCCEEDED'){
    try{
     const output=validateEventExpressionOutput(context.payload,old.rawOutput);
     await tx.update(events).set({metadata:sql`jsonb_set(${events.metadata},'{eventExpression}',${JSON.stringify({version:EVENT_EXPRESSION_VERSION,fingerprint:context.fingerprint,modelKey,aiRunId:old.id,generatedAt:old.completedAt?.toISOString()??old.createdAt.toISOString(),output})}::jsonb,true)`}).where(eq(events.id,context.canonicalId));
     return null;
    }catch{/* Validator changes must not keep an invalid successful cache authoritative. */}
   }else if(old&&!eventRelationJobDue({status:old.status,nextRetryAt:before.nextRetryAt},clock()))return null;
   if(old?.status==='RUNNING')await tx.update(aiRuns).set({status:'ABANDONED',errorCode:'PROVIDER_OUTCOME_UNKNOWN',completedAt:new Date(clock())}).where(eq(aiRuns.id,old.id));
   const state={attempts:Number(before.attempts??0)+1,nextRetryAt:new Date(clock()+15*60000).toISOString(),requestAttempts:0,usage:[] as ChatUsage[],usageStatus:'UNKNOWN'};
   const [run]=await tx.insert(aiRuns).values({taskType:'EVENT_EXPRESSION',modelProvider:config.provider,model:config.model,skillVersion:EVENT_EXPRESSION_SKILL.version,promptVersion:EVENT_EXPRESSION_SKILL.promptVersion,rulePackVersions:[context.payload.schemaVersion,EVENT_EXPRESSION_SKILL.outputSchema.schemaVersion],contextIds:[context.canonicalId],evidenceIds:context.payload.evidence.map(e=>e.rawId),inputHash,status:'RUNNING',validatorResult:state}).returning();
   return {context,run,state};
  });
  if(!claim)continue;
  let output:ExpressionOutput|undefined,errorCode:string|undefined,requestAttempts=0;const usage:ChatUsage[]=[];
  const record=async()=>{await db.update(aiRuns).set({validatorResult:{...claim.state,requestAttempts,usage,usageStatus:'UNKNOWN'}}).where(eq(aiRuns.id,claim.run.id));};
  try{const value=await callConfiguredChatJson({systemPrompt:EVENT_EXPRESSION_SKILL.systemPrompt,userPayload:claim.context.payload,temperature:0,maxOutputTokens:2000,thinking:'disabled',timeoutMs:Math.min(20000,Math.max(1,deadline-clock()))},{config,fetchImpl:deps.fetchImpl,onAttempt:async()=>{requestAttempts++;await record();},onUsage:async u=>{usage.push(u);await record();}});output=validateEventExpressionOutput(claim.context.payload,value.data);}
  catch(error){errorCode=error instanceof Error&&/^(EVENT_EXPRESSION|AI_ANALYSIS|AI_THINKING)_[A-Z_]+$/.test(error.message)?error.message:'EVENT_EXPRESSION_PROVIDER_FAILED';}
  const status=await db.transaction(async tx=>{
   const t=tx as unknown as DB;await lock(t);
   const [run]=await tx.select().from(aiRuns).where(eq(aiRuns.id,claim.run.id)).for('update');
   const current=await loadExpressionContext(t,candidate.id,new Date(clock()));
   const valid=run?.status==='RUNNING'&&process.env.OPC_COLLECTION_EVENT_EXPRESSION==='v1'&&current?.canonicalId===claim.context.canonicalId&&current.revision===claim.context.revision&&Date.parse(obj(run.validatorResult).nextRetryAt)>clock();
   const status=valid?(output?'SUCCEEDED':'FAILED'):'STALE';
   if(status==='SUCCEEDED')await tx.update(events).set({metadata:sql`jsonb_set(${events.metadata},'{eventExpression}',${JSON.stringify({version:EVENT_EXPRESSION_VERSION,fingerprint:claim.context.fingerprint,modelKey,aiRunId:run.id,generatedAt:new Date(clock()).toISOString(),output})}::jsonb,true)`}).where(eq(events.id,claim.context.canonicalId));
   await tx.update(aiRuns).set({status,rawOutput:output??null,validatorResult:{...claim.state,requestAttempts,usage,usageStatus:requestAttempts>0&&usage.length===requestAttempts&&usage.every(u=>u.status==='REPORTED')?'REPORTED':'UNKNOWN',nextRetryAt:new Date(clock()+Math.min(24,2**Math.min(5,claim.state.attempts-1))*3600000).toISOString(),translationRequested:false},errorCode:errorCode??(valid?null:'EVENT_EXPRESSION_INPUT_CHANGED'),completedAt:new Date(clock())}).where(eq(aiRuns.id,claim.run.id));
   return status;
  });results.push({eventId:claim.context.canonicalId,status,aiRunId:claim.run.id});
 }
 return summary(results.length?'COMPLETED':'NO_DUE_CANDIDATE');
}
