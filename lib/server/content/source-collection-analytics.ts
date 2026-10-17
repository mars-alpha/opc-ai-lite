import 'server-only';
import {inArray,sql} from 'drizzle-orm';
import {getDatabase} from '../db';
import {contentSources,contentCollectionRuns as runs,contentRadarSnapshots} from '../db/schema';
import {isCurrentSystemCollectionSource} from './source-portfolio-runtime';
import {eq} from 'drizzle-orm';

/** Run counters are not a Raw→Event conversion funnel or a recall estimate. */
export async function readSourceCollectionAnalytics(daysInput:unknown=7,sourceIdInput:unknown=null){
 const days=Number(daysInput);if(![7,14,30].includes(days))throw new Error('INVALID_ANALYTICS_WINDOW');
 if(sourceIdInput!==null&&(typeof sourceIdInput!=='string'||sourceIdInput.length>200))throw new Error('INVALID_ANALYTICS_SOURCE');
 const now=new Date(),today=new Date(now.getTime()+8*3600000).toISOString().slice(0,10),from=new Date(`${today}T00:00:00+08:00`);from.setUTCDate(from.getUTCDate()-(days-1));
 return getDatabase().transaction(async tx=>{
  await tx.execute(sql`set local statement_timeout = '8000ms'`);
  const all=await tx.select().from(contentSources);
  const sources=all.filter(s=>s.status==='ACTIVE'&&isCurrentSystemCollectionSource({...s,enabled:true}));
  if(sourceIdInput&&!sources.some(s=>s.id===sourceIdInput))throw new Error('INVALID_ANALYTICS_SOURCE');
  const scoped=sources.filter(s=>!sourceIdInput||s.id===sourceIdInput),ids=scoped.map(s=>s.id);
  const grouped=ids.length?await tx.select({
   day:sql<string>`to_char(${runs.startedAt} at time zone 'Asia/Shanghai','YYYY-MM-DD')`,sourceId:runs.sourceId,status:runs.status,errorCode:runs.errorCode,
   count:sql<number>`count(*)::int`,received:sql<number>`coalesce(sum(${runs.receivedCount}),0)::float8`,created:sql<number>`coalesce(sum(${runs.createdCount}),0)::float8`,duplicates:sql<number>`coalesce(sum(${runs.duplicateCount}),0)::float8`,
   durationTotalMs:sql<number>`coalesce(sum(extract(epoch from (${runs.finishedAt}-${runs.startedAt}))*1000) filter (where ${runs.finishedAt}>=${runs.startedAt}),0)::float8`,
   durationCount:sql<number>`count(*) filter (where ${runs.finishedAt}>=${runs.startedAt})::int`
  }).from(runs).where(sql`${inArray(runs.sourceId,ids)} and ${runs.startedAt}>=${from.toISOString()} and ${runs.startedAt}<=${now.toISOString()} and ${runs.metadata}->>'collectionOrigin'='SYSTEM' and (${runs.metadata}->>'qualificationOnly') is distinct from 'true' and (${runs.metadata}->>'backfillWindow') is null and (${runs.metadata}->'staleRunRecovery'->>'excludeFromRuntimeQualification') is distinct from 'true'`).groupBy(sql`1`,runs.sourceId,runs.status,runs.errorCode):[];
  const empty=()=>({runs:0,succeeded:0,failed:0,running:0,received:0,created:0,duplicates:0,durationTotalMs:0,durationCount:0});
  const summary=empty(),daily=Array.from({length:days},(_,i)=>({day:new Date(from.getTime()+i*86400000+8*3600000).toISOString().slice(0,10),...empty()}));
  const bySource=new Map(scoped.map(s=>[s.id,{sourceId:s.id,name:s.name,enabled:s.enabled,...empty()}]));
  const errors=new Map<string,number>();
  for(const g of grouped){
   const day=daily.find(d=>d.day===g.day),source=bySource.get(g.sourceId!);
   for(const target of [summary,day,source]){if(!target)continue;target.runs+=g.count;target.received+=g.received;target.created+=g.created;target.duplicates+=g.duplicates;target.durationTotalMs+=g.durationTotalMs;target.durationCount+=g.durationCount;if(g.status==='SUCCEEDED')target.succeeded+=g.count;else if(g.status==='RUNNING')target.running+=g.count;else target.failed+=g.count;}
   if(g.status!=='SUCCEEDED'&&g.status!=='RUNNING')errors.set(g.errorCode??'UNKNOWN_FAILURE',(errors.get(g.errorCode??'UNKNOWN_FAILURE')??0)+g.count);
  }
  const [snapshot]=await tx.select({algorithmRevision:sql<string|null>`${contentRadarSnapshots.payload}->>'algorithmRevision'`,generatedAt:contentRadarSnapshots.generatedAt}).from(contentRadarSnapshots).where(eq(contentRadarSnapshots.key,'CURRENT')).limit(1);
  return {asOf:now.toISOString(),from:from.toISOString(),days,timeZone:'Asia/Shanghai',sourceId:sourceIdInput,scope:'CURRENT_DIRECTORY_SYSTEM_RUNS',sourceCount:scoped.length,summary,daily,sources:[...bySource.values()].sort((a,b)=>b.created-a.created||b.received-a.received||a.name.localeCompare(b.name)),errors:[...errors].map(([code,count])=>({code,count})).sort((a,b)=>b.count-a.count),snapshot:{generatedAt:snapshot?.generatedAt.toISOString()??null,algorithmRevision:snapshot?.algorithmRevision??null},definitions:{received:'Run接收计数，可能包含重复或过滤前内容',created:'Run记录的新增Raw数，不是独立事件数',duplicates:'Run识别的重复次数，不是全局去重率',successRate:'成功Run / 已结束Run；运行中不计分母',scope:'当前来源目录（含停用来源）的SYSTEM正式运行；排除资格探测、回填与过期恢复运行；按开始时间归日'}};
 },{accessMode:'read only',isolationLevel:'repeatable read'});
}
