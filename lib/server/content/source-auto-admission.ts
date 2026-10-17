import "server-only";
import {randomUUID} from "node:crypto";
import {and,asc,eq,gte,inArray,sql} from "drizzle-orm";
import type {AuthUser} from "../auth/service";
import {getDatabase} from "../db";
import {contentRawItems,contentSources} from "../db/schema";
import {fetchPublicText} from "./collection-runner";
import {registerOnboardedSource} from "./source-onboarding";
import {isCurrentSystemCollectionSource,listCurrentSystemCollectionSourceIds} from "./source-portfolio-runtime";
import {isPublicFeedRelayUrl,isPublicSourceRelayEnabled,publicSourceAdmissionHosts} from "./overseas-collector-relay-client";
import {admissionRecord as obj,observedWebsiteHomepage,sourceAdmissionDue,sourceAdmissionMayStart,SOURCE_AUTO_ADMISSION_VERSION} from "./source-auto-admission-policy";

/** Same SYSTEM advisory-lock caller. Raw owns only this reference's discovery receipt. */
export async function runSourceAutoAdmissionCycle(user:AuthUser,options:{maxItems?:number;budgetMs?:number;rawItemIds?:string[]}={}){
 if(user.role!=="ADMIN")throw new Error("FORBIDDEN");
 if(process.env.OPC_COLLECTION_SOURCE_ADMISSION==="off")return {status:"DISABLED",processed:0,failed:0,results:[]};
 if(!isPublicSourceRelayEnabled())return {status:"DEFERRED_RELAY_UNAVAILABLE",processed:0,failed:0,results:[]};
 const startedAt=Date.now(),deadline=startedAt+Math.min(65000,Math.max(0,options.budgetMs??65000));
 const maxItems=Math.max(1,Math.min(2,options.maxItems??2));
 const sourceIds=await listCurrentSystemCollectionSourceIds();
 if(!sourceIds.length)return {status:"NO_CURRENT_SOURCE",processed:0,failed:0,results:[]};
 const db=getDatabase();
 const allowedHosts=publicSourceAdmissionHosts();
 const candidatePattern="^https://("+allowedHosts.map(host=>host.replaceAll(".","[.]")).join("|")+")/";
 const job=sql`${contentRawItems.metadata}->'sourceAdmission'`;
 const rows=await db.select().from(contentRawItems).where(and(
  inArray(contentRawItems.sourceId,sourceIds),gte(contentRawItems.collectedAt,new Date(startedAt-7*86400000)),
  sql`${contentRawItems.metadata}->>'collectionOrigin' = 'SYSTEM'`,
  sql`${contentRawItems.originalUrl} ~* ${candidatePattern}`,
  options.rawItemIds?inArray(contentRawItems.id,options.rawItemIds):undefined,
  sql`(${job}->>'version' is distinct from ${SOURCE_AUTO_ADMISSION_VERSION} or ${job}->>'originalUrl' is distinct from ${contentRawItems.originalUrl} or ${job}->>'contentHash' is distinct from ${contentRawItems.contentHash} or (${job}->>'status' in ('RUNNING','FAILED','DEFERRED') and ${job}->>'nextRetryAt' <= ${new Date(startedAt).toISOString()}))`
 )).orderBy(asc(contentRawItems.collectedAt),asc(contentRawItems.id)).limit(20);
 const results:Array<{rawItemId:string;status:string;reason?:string;sourceId?:string}>=[];
 for(const row of rows){
  if(results.length>=maxItems || !sourceAdmissionMayStart(deadline))break;
  const claim=await db.transaction(async tx=>{
   const [raw]=await tx.select().from(contentRawItems).where(eq(contentRawItems.id,row.id)).for("update");
   const [source]=await tx.select().from(contentSources).where(eq(contentSources.id,row.sourceId));
   if(!raw || !source || !isCurrentSystemCollectionSource(source) || !raw.originalUrl || !isPublicFeedRelayUrl(raw.originalUrl) || !publicSourceAdmissionHosts().includes(new URL(raw.originalUrl).hostname) || !sourceAdmissionDue(raw))return null;
   const now=new Date(),before=obj(obj(raw.metadata).sourceAdmission);
   const state={version:SOURCE_AUTO_ADMISSION_VERSION,jobId:randomUUID(),originalUrl:raw.originalUrl,contentHash:raw.contentHash,status:"RUNNING",lastAttemptAt:now.toISOString(),nextRetryAt:new Date(now.getTime()+15*60000).toISOString(),failures:Number(before.failures)||0};
   await tx.update(contentRawItems).set({metadata:{...obj(raw.metadata),sourceAdmission:state},updatedAt:now}).where(eq(contentRawItems.id,raw.id));
   return {raw,state};
  });
  if(!claim)continue;
  const persist=async(patch:Record<string,unknown>)=>db.transaction(async tx=>{
   const [current]=await tx.select().from(contentRawItems).where(eq(contentRawItems.id,claim.raw.id)).for("update");
   if(!current || obj(obj(current.metadata).sourceAdmission).jobId!==claim.state.jobId || current.contentHash!==claim.raw.contentHash || current.originalUrl!==claim.raw.originalUrl)return false;
   await tx.update(contentRawItems).set({metadata:{...obj(current.metadata),sourceAdmission:{...obj(obj(current.metadata).sourceAdmission),...patch}},updatedAt:new Date()}).where(eq(contentRawItems.id,current.id));
   return true;
  });
  try{
   const page=await fetchPublicText(claim.raw.originalUrl!,"text/html",AbortSignal.timeout(Math.min(15000,Math.max(1,deadline-Date.now()))));
   if(!isPublicFeedRelayUrl(page.finalUrl) || new URL(page.finalUrl).origin!==new URL(claim.raw.originalUrl!).origin)throw new Error("AUTOMATIC_DISCOVERY_REDIRECT_IDENTITY_CHANGED");
   const homepage=observedWebsiteHomepage(page.body,page.finalUrl);
   if(!homepage){await persist({status:"NO_OBSERVED_HOMEPAGE",reason:"NO_OBSERVED_HOMEPAGE"});results.push({rawItemId:row.id,status:"NO_OBSERVED_HOMEPAGE"});continue;}
   const discovery={rawItemId:claim.raw.id,jobId:claim.state.jobId,pageUrl:claim.raw.originalUrl!,homepageUrl:homepage,observedAt:new Date().toISOString()};
   if(!await persist({homepageUrl:homepage,discovery})){results.push({rawItemId:row.id,status:"STALE"});continue;}
   const source=await registerOnboardedSource(user,{url:homepage,kind:"WEBSITE"},{automaticDiscovery:discovery,signal:AbortSignal.timeout(Math.max(1,deadline-Date.now()))});
   const registered=obj(source.metadata).automaticDiscovery && obj(obj(source.metadata).automaticDiscovery).rawItemId===row.id;
   const status=registered?"REGISTERED":"EXISTING";
   const saved=await persist({status,sourceId:source.id,reason:"AUTOMATIC_PUBLIC_FEED_VERIFIED",completedAt:new Date().toISOString()});
   results.push({rawItemId:row.id,status:saved?status:"STALE",sourceId:source.id});
  }catch(error){
   const message=error instanceof Error?error.message:"";
   const reason=/^[A-Z0-9_:]{1,140}$/.test(message)?message:"AUTOMATIC_SOURCE_PROBE_FAILED";
   const protectedSource=["AUTOMATIC_SOURCE_OPERATOR_INTENT_PROTECTED","AUTOMATIC_SOURCE_IDENTITY_AMBIGUOUS"].includes(reason);
   const rejected=/AUTOMATIC_(?:TIME_SEMANTICS|WEBSITE_HOMEPAGE|DISCOVERY_PROVENANCE)/.test(reason);
   const failures=Math.min(10,claim.state.failures+1),hours=Math.min(24,2**(failures-1));
   const status=protectedSource?"BLOCKED_SOURCE":rejected?"REJECTED":"FAILED";
   await persist({status,reason,failures,nextRetryAt:new Date(Date.now()+hours*3600000).toISOString()});
   results.push({rawItemId:row.id,status,reason});
  }
 }
 return {version:SOURCE_AUTO_ADMISSION_VERSION,status:"COMPLETED",processed:results.length,failed:results.filter(item=>item.status==="FAILED").length,elapsedMs:Date.now()-startedAt,timeSliceExhausted:!sourceAdmissionMayStart(deadline),results};
}
