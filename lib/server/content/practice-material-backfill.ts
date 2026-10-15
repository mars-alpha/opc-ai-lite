import "server-only";
import {and,desc,eq,gte,lte,sql} from "drizzle-orm";
import type {AuthUser} from "../auth/service";
import {getDatabase} from "../db";
import {contentRawItems,contentSources} from "../db/schema";
import {calendarWindow} from "../../content/radar-calendar";
import {collectPublicPracticeContent,mergePublicContentMetadata,publicPracticeContentDue,PUBLIC_PRACTICE_CONTENT_VERSION} from "./public-practice-content";
import {evaluatePracticeMaterials} from "./practice-materials";
import {recordContentAudit} from "./workbench";
const obj=(v:unknown):Record<string,any>=>v && typeof v==="object" && !Array.isArray(v)?v as Record<string,any>:{};
const origin=(url:string|null)=>{try{return new URL(url??"").origin;}catch{return "";}};
const originFailure=(reason:unknown)=>typeof reason==="string" && /TIMEOUT|NETWORK_FAILED|HTTP_(?:403|429|503)|PUBLIC_CONTENT_UNAVAILABLE_NO_LOGIN_FALLBACK/.test(reason);
export function selectDuePracticeMaterialRows<T extends {raw:{originalUrl:string|null;metadata:unknown}}>(rows:T[],limit:number,now=Date.now()) {
  const blocked=new Set(rows.filter(row=>{const a=obj(obj(row.raw.metadata).publicContentAttempt);return a.version===PUBLIC_PRACTICE_CONTENT_VERSION && a.status==="UNAVAILABLE" && Date.parse(a.nextRetryAt)>now && originFailure(a.reason);}).map(row=>origin(row.raw.originalUrl)));
  return rows.filter(row=>!blocked.has(origin(row.raw.originalUrl)) && publicPracticeContentDue(row.raw,now).due)
    .sort((a,b)=>(Date.parse(obj(obj(a.raw.metadata).publicContentAttempt).observedAt)||0)-(Date.parse(obj(obj(b.raw.metadata).publicContentAttempt).observedAt)||0))
    .slice(0,Math.max(1,Math.min(20,limit)));
}

export async function listDuePracticeMaterials(limit=2,now=new Date()) {
  const window=calendarWindow(now,7);
  const rows=await getDatabase().select({raw:contentRawItems,source:contentSources}).from(contentRawItems)
    .innerJoin(contentSources,eq(contentSources.id,contentRawItems.sourceId))
    .where(and(eq(contentSources.enabled,true),eq(contentSources.status,"ACTIVE"),gte(contentRawItems.publishedAt,window.from),lte(contentRawItems.publishedAt,now),
      sql`${contentSources.metadata}->>'currentPortfolio' = 'true'`,
      sql`${contentRawItems.title} ~* 'how|build|deploy|tutorial|workflow|comfyui|agents|mcp|教程|实操'`))
    .orderBy(desc(contentRawItems.publishedAt),desc(contentRawItems.id)).limit(500);
  return selectDuePracticeMaterialRows(rows,limit,now.getTime());
}

/** Called inside the existing SYSTEM advisory lock; never creates Sources/Raw/Events. */
export async function backfillPracticeMaterials(user:AuthUser,options:{limit?:number;apply?:boolean}={}) {
  if(user.role!=="ADMIN")throw new Error("FORBIDDEN");
  const rows=await listDuePracticeMaterials(options.limit??2);
  if(!options.apply)return {version:PUBLIC_PRACTICE_CONTENT_VERSION,mode:"PLAN",selected:rows.map(({raw})=>({rawItemId:raw.id,url:raw.originalUrl,title:raw.title}))};
  const results=[];
  const blockedOrigins=new Set<string>();
  for(const {raw} of rows) {
    let patch:Record<string,unknown>|null=null,reason:string|null=null;
    try {if(blockedOrigins.has(origin(raw.originalUrl)))reason="PUBLIC_CONTENT_ORIGIN_BACKOFF";else patch=await collectPublicPracticeContent(raw);}catch(error) {
      const message=error instanceof Error?error.message:"";
      reason=error instanceof Error && ["TimeoutError","AbortError"].includes(error.name)?"PUBLIC_CONTENT_TIMEOUT":/^(?:PUBLIC|RELAY|OVERSEAS_COLLECTOR)_[A-Z0-9_]+$/.test(message)?message:"PUBLIC_CONTENT_UNAVAILABLE_NO_LOGIN_FALLBACK";
      if(originFailure(reason))blockedOrigins.add(origin(raw.originalUrl));
    }
    if(!patch && !reason){results.push({rawItemId:raw.id,status:"REUSED"});continue;}
    const result=await getDatabase().transaction(async tx=>{
      const [current]=await tx.select().from(contentRawItems).where(eq(contentRawItems.id,raw.id)).for("update");
      const [source]=await tx.select().from(contentSources).where(eq(contentSources.id,raw.sourceId));
      if(!current || !source?.enabled || source.status!=="ACTIVE" || obj(source.metadata).currentPortfolio!==true)return {rawItemId:raw.id,status:"SOURCE_NO_LONGER_CURRENT"};
      const old=obj(current.metadata),prior=obj(old.publicContentAttempt),failures=reason?Math.min(10,(Number(prior.failures)||0)+1):0;
      const waitHours=reason?Math.min(24,2**(failures-1)):24;
      const attempt={version:PUBLIC_PRACTICE_CONTENT_VERSION,status:reason==="PUBLIC_CONTENT_ORIGIN_BACKOFF"?"DEFERRED_ORIGIN_BACKOFF":reason?"UNAVAILABLE":"FETCHED",reason,failures,observedAt:new Date().toISOString(),nextRetryAt:new Date(Date.now()+waitHours*3600000).toISOString()};
      const metadata=mergePublicContentMetadata(old,{...patch,publicContentAttempt:attempt});
      await tx.update(contentRawItems).set({metadata,updatedAt:new Date()}).where(eq(contentRawItems.id,raw.id));
      await recordContentAudit(user,{action:"PUBLIC_PRACTICE_MATERIAL_FETCH",entityType:"RAW_ITEM",entityId:raw.id,
        before:{sha256:obj(old.publicContentReceipt).sha256??null},after:{attempt,sha256:obj(metadata.publicContentReceipt).sha256??null},metadata:{sourceId:raw.sourceId,origin:"SYSTEM",version:PUBLIC_PRACTICE_CONTENT_VERSION}},tx);
      return {rawItemId:raw.id,status:attempt.status,reason,quality:evaluatePracticeMaterials({...current,metadata})};
    });
    results.push(result);
  }
  return {version:PUBLIC_PRACTICE_CONTENT_VERSION,mode:"APPLY",selected:rows.length,results};
}
