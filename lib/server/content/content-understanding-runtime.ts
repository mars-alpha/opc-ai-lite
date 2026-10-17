import "server-only";
import {createHash,randomUUID} from "node:crypto";
import {and,asc,eq,gte,inArray,lte,sql} from "drizzle-orm";
import {getConfiguredChatModelConfig,type ConfiguredChatModelConfig,type ChatUsage} from "../ai/configured-chat";
import {getDatabase} from "../db";
import {aiRuns,contentRawItems,contentSources} from "../db/schema";
import {isCurrentSystemCollectionSource,listCurrentSystemCollectionSourceIds} from "./source-portfolio-runtime";
import {analyzeContentUnderstandingMaterial,prepareContentUnderstanding,CONTENT_UNDERSTANDING_VERSION,CONTENT_UNDERSTANDING_PROMPT_VERSION,CONTENT_UNDERSTANDING_SCHEMA_VERSION} from "./content-understanding-enrichment";

export const CONTENT_UNDERSTANDING_JOB_VERSION="material-understanding-job-v1";
const obj=(v:unknown):Record<string,any>=>v && typeof v==="object" && !Array.isArray(v)?v as Record<string,any>:{};
export function understandingJobDue(job:Record<string,any>,inputHash:string,now=Date.now()){
 if(job.version!==CONTENT_UNDERSTANDING_JOB_VERSION || job.inputHash!==inputHash)return true;
 if(job.status==="SUCCEEDED")return false;
 return ["FAILED","RUNNING","STALE"].includes(job.status) && typeof job.nextRetryAt==="string" && Number.isFinite(Date.parse(job.nextRetryAt)) && Date.parse(job.nextRetryAt)<=now;
}
// Uses actual material/source fields, never updatedAt (which also changes for unrelated metadata).
const materialRevision=sql<string>`md5(jsonb_build_array(${contentRawItems.title},${contentRawItems.excerpt},${contentRawItems.author},${contentRawItems.publishedAt},${contentRawItems.originalUrl},${contentRawItems.contentHash},${contentRawItems.metadata}->'fullText',${contentRawItems.metadata}->'bodyText',${contentRawItems.metadata}->'articleText',${contentRawItems.metadata}->'contentText',${contentSources.name},${contentSources.sourceType})::text)`;
export async function runContentUnderstandingCycle(options:{maxItems?:number;budgetMs?:number;rawItemIds?:string[]}={},dependencies:{config?:ConfiguredChatModelConfig|null;fetchImpl?:typeof fetch;now?:()=>number}={}){
 const now=dependencies.now??Date.now,startedAt=now(),deadline=startedAt+Math.max(0,Math.min(65000,options.budgetMs??65000));
 const results:Array<{rawItemId:string;status:string;reason?:string}>=[];
 const summary=(status:string)=>({status,scanned:results.length,enriched:results.filter(r=>r.status==="SUCCEEDED").length,failed:results.filter(r=>r.status==="FAILED").length,stale:results.filter(r=>r.status==="STALE").length,results});
 if(process.env.OPC_COLLECTION_CONTENT_UNDERSTANDING==="off")return summary("DISABLED");
 const config=dependencies.config===undefined?getConfiguredChatModelConfig():dependencies.config;
 if(!config)return summary("DEFERRED_MODEL_UNCONFIGURED");
 if(!config.thinkingControl)return summary("DEFERRED_THINKING_CONTROL_UNCONFIGURED");
 if(deadline-now()<45000)return summary("DEFERRED_TIME_SLICE");
 const sourceIds=await listCurrentSystemCollectionSourceIds({serverRuntimeOnly:true});
 if(!sourceIds.length || options.rawItemIds?.length===0)return summary("NO_CANDIDATE");
 const db=getDatabase(),maxItems=Math.max(1,Math.min(2,options.maxItems??2));
 const modelKey=createHash("sha256").update(JSON.stringify([CONTENT_UNDERSTANDING_VERSION,CONTENT_UNDERSTANDING_PROMPT_VERSION,CONTENT_UNDERSTANDING_SCHEMA_VERSION,config.provider,config.model,config.baseUrl,config.thinkingControl])).digest("hex");
 const job=sql`${contentRawItems.metadata}->'contentUnderstandingJob'`;
 const rows=await db.select({id:contentRawItems.id}).from(contentRawItems).innerJoin(contentSources,eq(contentSources.id,contentRawItems.sourceId)).where(and(
  inArray(contentRawItems.sourceId,sourceIds),gte(contentRawItems.collectedAt,new Date(startedAt-7*86400000)),lte(contentRawItems.collectedAt,new Date(startedAt)),
  sql`${contentRawItems.metadata}->>'collectionOrigin' = 'SYSTEM'`,options.rawItemIds?inArray(contentRawItems.id,options.rawItemIds):undefined,
  sql`(${job}->>'version' is distinct from ${CONTENT_UNDERSTANDING_JOB_VERSION} or ${job}->>'modelKey' is distinct from ${modelKey} or ${job}->>'materialRevision' is distinct from ${materialRevision} or (${job}->>'status' in ('RUNNING','FAILED','STALE') and ${job}->>'nextRetryAt' <= ${new Date(startedAt).toISOString()}))`
 )).orderBy(asc(contentRawItems.collectedAt),asc(contentRawItems.id)).limit(20);
 for(const row of rows){
  if(results.length>=maxItems || deadline-now()<45000)break;
  const claim=await db.transaction(async tx=>{
   const [raw]=await tx.select().from(contentRawItems).where(eq(contentRawItems.id,row.id)).for("update");if(!raw)return null;
   const [source]=await tx.select().from(contentSources).where(eq(contentSources.id,raw.sourceId)).for("share");
   if(!source || !isCurrentSystemCollectionSource(source) || obj(raw.metadata).collectionOrigin!=="SYSTEM")return null;
   const material={...raw,sourceName:source.name,sourceType:source.sourceType};
   const prepared=prepareContentUnderstanding(material,config),before=obj(obj(raw.metadata).contentUnderstandingJob);
   const [revision]=await tx.select({value:materialRevision}).from(contentRawItems).innerJoin(contentSources,eq(contentSources.id,contentRawItems.sourceId)).where(eq(contentRawItems.id,raw.id));
   if(!understandingJobDue(before,prepared.inputHash,now())){
    if(before.materialRevision!==revision.value)await tx.update(contentRawItems).set({metadata:sql`jsonb_set(${contentRawItems.metadata},'{contentUnderstandingJob}',${JSON.stringify({...before,materialRevision:revision.value})}::jsonb,true)`}).where(eq(contentRawItems.id,raw.id));
    return null;
   }
   if(before.status==="RUNNING" && typeof before.aiRunId==="string")await tx.update(aiRuns).set({status:"ABANDONED",errorCode:"PROVIDER_OUTCOME_UNKNOWN",completedAt:new Date()}).where(and(eq(aiRuns.id,before.aiRunId),eq(aiRuns.status,"RUNNING")));
   const [run]=await tx.insert(aiRuns).values({taskType:"CONTENT_MATERIAL_UNDERSTANDING",modelProvider:config.provider,model:config.model,skillVersion:CONTENT_UNDERSTANDING_VERSION,promptVersion:CONTENT_UNDERSTANDING_PROMPT_VERSION,rulePackVersions:[CONTENT_UNDERSTANDING_SCHEMA_VERSION],contextIds:[raw.id],evidenceIds:[raw.id],inputHash:prepared.inputHash,status:"RUNNING"}).returning({id:aiRuns.id});
   const state={version:CONTENT_UNDERSTANDING_JOB_VERSION,jobId:randomUUID(),aiRunId:run.id,inputHash:prepared.inputHash,modelKey,materialRevision:revision.value,status:"RUNNING",attempts:before.inputHash===prepared.inputHash?Number(before.attempts??0)+1:1,lastAttemptAt:new Date(now()).toISOString(),nextRetryAt:new Date(now()+15*60000).toISOString()};
   await tx.update(contentRawItems).set({metadata:sql`jsonb_set(${contentRawItems.metadata},'{contentUnderstandingJob}',${JSON.stringify(state)}::jsonb,true)`,updatedAt:new Date()}).where(eq(contentRawItems.id,raw.id));
   return {material,state};
  });
  if(!claim)continue;
  const usages:ChatUsage[]=[];let requestAttempts=0;
  const finish=async(status:"SUCCEEDED"|"FAILED",output?:Awaited<ReturnType<typeof analyzeContentUnderstandingMaterial>>,reason?:string)=>db.transaction(async tx=>{
   const [current]=await tx.select().from(contentRawItems).where(eq(contentRawItems.id,claim.material.id)).for("update");
   const [source]=current?await tx.select().from(contentSources).where(eq(contentSources.id,current.sourceId)).for("share"):[];
   const sameJob=current && obj(obj(current.metadata).contentUnderstandingJob).jobId===claim.state.jobId;
   const sameInput=source && current && isCurrentSystemCollectionSource(source) && prepareContentUnderstanding({...current,sourceName:source.name,sourceType:source.sourceType},config).inputHash===claim.state.inputHash;
   const finalStatus=sameJob && sameInput?status:"STALE";
   if(sameJob){
    const state={...claim.state,status:finalStatus,reason:reason??null,completedAt:new Date(now()).toISOString(),nextRetryAt:new Date(now()+Math.min(24,2**Math.min(5,claim.state.attempts-1))*3600000).toISOString()};
    const metadata=sql`jsonb_set(${contentRawItems.metadata},'{contentUnderstandingJob}',${JSON.stringify(state)}::jsonb,true)`;
    await tx.update(contentRawItems).set({metadata:finalStatus==="SUCCEEDED" && output?sql`jsonb_set(${metadata},'{contentUnderstanding}',${JSON.stringify(output)}::jsonb,true)`:metadata,updatedAt:new Date()}).where(eq(contentRawItems.id,claim.material.id));
   }
   await tx.update(aiRuns).set({status:finalStatus,rawOutput:output??null,validatorResult:{version:CONTENT_UNDERSTANDING_SCHEMA_VERSION,status:finalStatus,usage:usages,requestAttempts,usageStatus:usages.length===requestAttempts && requestAttempts>0 && usages.every(u=>u.status==="REPORTED")?"REPORTED":"UNKNOWN",translationRequested:false,reason:reason??null},errorCode:reason??(finalStatus==="STALE"?"MATERIAL_REVISION_CHANGED":null),completedAt:new Date()}).where(eq(aiRuns.id,claim.state.aiRunId));
   return finalStatus;
  });
  try{
   const output=await analyzeContentUnderstandingMaterial(claim.material,{config,fetchImpl:dependencies.fetchImpl,deadline:Date.now()+Math.max(1,deadline-now()),onAttempt:async()=>{requestAttempts++;await db.update(aiRuns).set({validatorResult:{version:CONTENT_UNDERSTANDING_SCHEMA_VERSION,requestAttempts,usage:usages,usageStatus:"UNKNOWN",translationRequested:false}}).where(eq(aiRuns.id,claim.state.aiRunId));},onUsage:async usage=>{usages.push(usage);await db.update(aiRuns).set({validatorResult:{version:CONTENT_UNDERSTANDING_SCHEMA_VERSION,requestAttempts,usage:usages,translationRequested:false}}).where(eq(aiRuns.id,claim.state.aiRunId));}});
   results.push({rawItemId:row.id,status:await finish("SUCCEEDED",output)});
  }catch(error){
   const reason=error instanceof Error && /^(AI_|CONTENT_UNDERSTANDING_)[A-Z0-9_]+$/.test(error.message)?error.message:"CONTENT_UNDERSTANDING_PROVIDER_FAILED";
   results.push({rawItemId:row.id,status:await finish("FAILED",undefined,reason),reason});
  }
 }
 return summary(results.length?"COMPLETED":"NO_DUE_CANDIDATE");
}
