import "server-only";
import {and,asc,eq,gte,lte,sql,or,isNull,inArray} from "drizzle-orm";
import type {AuthUser} from "../auth/service";
import {getDatabase} from "../db";
import {contentRawItems,contentSources,contentEvents} from "../db/schema";
import {calendarWindow} from "../../content/radar-calendar";
import {collectPublicPracticeContent,mergePublicContentMetadata,publicPracticeContentDue,PUBLIC_PRACTICE_CONTENT_VERSION} from "./public-practice-content";
import {evaluatePracticeMaterials} from "./practice-materials";
import {recordContentAudit} from "./workbench";
const obj=(v:unknown):Record<string,any>=>v && typeof v==="object" && !Array.isArray(v)?v as Record<string,any>:{};
const origin=(url:string|null)=>{try{return new URL(url??"").origin;}catch{return "";}};
const originFailure=(reason:unknown)=>typeof reason==="string" && /TIMEOUT|NETWORK_FAILED|HTTP_(?:403|429|503)|PUBLIC_CONTENT_UNAVAILABLE_NO_LOGIN_FALLBACK/.test(reason);
// Shared JavaScript/PostgreSQL pattern: tool names must be words, not substrings
// such as "how" inside "shareholder". This only selects work for material checks.
export const PRACTICE_MATERIAL_TITLE_PATTERN="(^|[^a-z0-9_])(how|build|deploy|tutorial|workflows?|comfyui|agents?|skills?|mcp|n8n|dify|langgraph|langchain|flowise|openhands|openclaw|cursor|codex|claude[ -]?code)([^a-z0-9_]|$)|教程|实操|智能体|工作流|技能";
export const isPracticeMaterialCandidateTitle=(title:string)=>new RegExp(PRACTICE_MATERIAL_TITLE_PATTERN,"i").test(title);
type MaterialRow={raw:{originalUrl:string|null;metadata:unknown;collectedAt?:Date|string;publishedAt?:Date|string|null}};
export function selectDuePracticeMaterialRows<T extends MaterialRow>(rows:T[],limit:number,now=Date.now(),blockedRows:MaterialRow[]=[]) {
  const blocked=new Set([...rows,...blockedRows].filter(row=>{const a=obj(obj(row.raw.metadata).publicContentAttempt);return a.version===PUBLIC_PRACTICE_CONTENT_VERSION && a.status==="UNAVAILABLE" && Date.parse(a.nextRetryAt)>now && originFailure(a.reason);}).map(row=>origin(row.raw.originalUrl)));
  const waitingSince=(row:T)=>{
    const attempt=obj(obj(row.raw.metadata).publicContentAttempt);
    return Date.parse(attempt.nextRetryAt)||Date.parse(String(row.raw.collectedAt??row.raw.publishedAt??""))||0;
  };
  const pending=rows.filter(row=>!blocked.has(origin(row.raw.originalUrl)) && publicPracticeContentDue(row.raw,now).due)
    .sort((a,b)=>waitingSince(a)-waitingSince(b));
  const selected:T[]=[];
  const bounded=Math.max(1,Math.min(20,limit));
  // Oldest due article from each origin before a second article from any origin.
  while(pending.length && selected.length<bounded){
    const visited=new Set<string>();
    for(let i=0;i<pending.length && selected.length<bounded;){
      const host=origin(pending[i].raw.originalUrl);
      if(visited.has(host)){i++;continue;}
      visited.add(host);selected.push(pending.splice(i,1)[0]);
    }
  }
  return selected;
}

/** Bounded resident memory; the active seven-day queue is scanned before selection. */
export async function scanDuePracticeMaterialRows<T extends MaterialRow>(
  loadPage:(offset:number)=>Promise<T[]>,limit:number,now=Date.now(),blockedRows:MaterialRow[]=[]
) {
  let selected:T[]=[];
  for(let page=0;page<100;page++){
    const rows=await loadPage(page*500);
    selected=selectDuePracticeMaterialRows([...selected,...rows],limit,now,blockedRows);
    if(rows.length<500)return selected;
  }
  // An exceeded scan budget is visible, never a false empty queue/success.
  throw new Error("PUBLIC_CONTENT_QUEUE_SCAN_LIMIT");
}

function materialCandidateConditions(now:Date,rawItemIds?:string[]){
  const window=calendarWindow(now,7),recentFrom=new Date(now.getTime()-168*3600000);
  return and(eq(contentSources.enabled,true),eq(contentSources.status,"ACTIVE"),
      or(and(gte(contentRawItems.publishedAt,window.from),lte(contentRawItems.publishedAt,now)),
        and(isNull(contentRawItems.publishedAt),gte(contentRawItems.collectedAt,recentFrom),lte(contentRawItems.collectedAt,now),
          sql`${contentRawItems.metadata}->>'collectionOrigin' = 'SYSTEM'`,
          sql`${contentRawItems.metadata}->>'referenceOnly' = 'true'`,
          sql`${contentRawItems.metadata}->'practiceDiscovery'->>'status' = 'PENDING_SOURCE_REVIEW'`,
          sql`exists (select 1 from ${contentEvents} where ${contentEvents.id}::text = ${contentRawItems.metadata}->'practiceDiscovery'->>'targetEventId'
              and ${contentEvents.archivedAt} is null and coalesce(${contentEvents.eventAt},${contentEvents.firstSeenAt}) >= ${recentFrom.toISOString()}
              and coalesce(${contentEvents.eventAt},${contentEvents.firstSeenAt}) <= ${now.toISOString()})`)),
      sql`${contentSources.metadata}->>'currentPortfolio' = 'true'`,
      rawItemIds?inArray(contentRawItems.id,rawItemIds):undefined,
      sql`${contentRawItems.title} ~* ${PRACTICE_MATERIAL_TITLE_PATTERN}`);
}

export async function listDuePracticeMaterials(limit=2,now=new Date(),rawItemIds?:string[]) {
  return getDatabase().transaction(async tx=>{
  const conditions=materialCandidateConditions(now,rawItemIds);
  const blockedRows=await tx.select({raw:{originalUrl:contentRawItems.originalUrl,metadata:contentRawItems.metadata}}).from(contentRawItems)
    .innerJoin(contentSources,eq(contentSources.id,contentRawItems.sourceId))
    .where(and(conditions,sql`${contentRawItems.metadata}->'publicContentAttempt'->>'status' = 'UNAVAILABLE'`,
      sql`${contentRawItems.metadata}->'publicContentAttempt'->>'nextRetryAt' > ${now.toISOString()}`));
  return scanDuePracticeMaterialRows(offset=>tx.select({raw:contentRawItems,source:contentSources}).from(contentRawItems)
    .innerJoin(contentSources,eq(contentSources.id,contentRawItems.sourceId))
    .where(conditions)
    .orderBy(sql`coalesce(${contentRawItems.metadata}->'publicContentAttempt'->>'nextRetryAt', to_char(${contentRawItems.collectedAt} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))`,asc(contentRawItems.id)).limit(500).offset(offset),limit,now.getTime(),blockedRows);
  },{isolationLevel:"repeatable read",accessMode:"read only"});
}

/** Called inside the existing SYSTEM advisory lock; never creates Sources/Raw/Events. */
export async function backfillPracticeMaterials(user:AuthUser,options:{limit?:number;apply?:boolean;rawItemIds?:string[]}={}) {
  if(user.role!=="ADMIN")throw new Error("FORBIDDEN");
  const rows=await listDuePracticeMaterials(options.limit??2,new Date(),options.rawItemIds);
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
      const [source]=await tx.select().from(contentSources).where(eq(contentSources.id,raw.sourceId)).for("share");
      if(!current || !source?.enabled || source.status!=="ACTIVE" || obj(source.metadata).currentPortfolio!==true)return {rawItemId:raw.id,status:"SOURCE_NO_LONGER_CURRENT"};
      if(current.sourceId!==raw.sourceId || current.originalUrl!==raw.originalUrl || current.contentHash!==raw.contentHash)return {rawItemId:raw.id,status:"RAW_CHANGED"};
      const [eligible]=await tx.select({id:contentRawItems.id}).from(contentRawItems).innerJoin(contentSources,eq(contentSources.id,contentRawItems.sourceId))
        .where(and(eq(contentRawItems.id,raw.id),materialCandidateConditions(new Date()))).limit(1);
      if(!eligible)return {rawItemId:raw.id,status:"CANDIDATE_NO_LONGER_ELIGIBLE"};
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
