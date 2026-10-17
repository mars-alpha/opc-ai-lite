import {createHash} from "node:crypto";
export const MANAGED_PRACTICE_QUERY_VERSION="managed-practice-query-v2";
/** Request dedup expires with the existing six-hour discovery cooldown. */
export function managedPracticeSearchGeneration(now=Date.now()) {
 if (!Number.isFinite(now)||now<0) throw Error("QUERY_GENERATION_TIME_INVALID");
 return Math.floor(now/(6*3600000));
}
export const MANAGED_PRACTICE_QUERY_PURPOSE="PRACTICAL_MATERIAL_DISCOVERY";
type QueryHistory={status:string;createdCount:number;startedAt:Date;provider:string;query:string;metadata:unknown};
const obj=(v:unknown):Record<string,any>=>v && typeof v==="object" && !Array.isArray(v)?v as Record<string,any>:{};
const normalized=(q:string)=>q.normalize("NFKC").trim().replace(/\s+/g," ").toLowerCase();
export function managedPracticePlanKey(context:unknown){return createHash("sha256").update(JSON.stringify([MANAGED_PRACTICE_QUERY_VERSION,context])).digest("hex");}
export function managedPracticeQueryDecision(request:{planKey:string;provider:string;query:string;now:number},history:QueryHistory[]){
 const {planKey,provider,query,now}=request;
 const rows=history.filter(row=>obj(row.metadata).purpose===MANAGED_PRACTICE_QUERY_PURPOSE);
 const deny=(reason:string)=>({allowed:false,reason});
 if(rows.some(row=>!Number.isFinite(row.startedAt.getTime()) || row.startedAt.getTime()>now))return deny("INVALID_QUERY_HISTORY");
 if(rows.filter(row=>row.startedAt.getTime()>now-24*3600000).length>=6)return deny("DAILY_QUERY_LIMIT");
 if(rows.some(row=>row.status==="RUNNING" && row.startedAt.getTime()>now-15*60000))return deny("QUERY_LEASE_ACTIVE");
 const same=rows.filter(row=>obj(obj(row.metadata).managedSearch).planKey===planKey).sort((a,b)=>b.startedAt.getTime()-a.startedAt.getTime());
 const completed=same.filter(row=>row.status==="SUCCEEDED");
 if(completed.length>=2 && completed.slice(0,2).every(row=>row.createdCount===0))return deny("PLAN_NO_NEW_REFERENCES");
 if(completed.some(row=>row.provider===provider && normalized(row.query)===normalized(query)))return deny("QUERY_ALREADY_COMPLETED");
 if(rows.some(row=>row.provider===provider && row.status==="FAILED" && row.startedAt.getTime()>now-3600000))return deny("PROVIDER_BACKOFF");
 return {allowed:true,reason:"QUERY_DUE"};
}
/** One primary and one configured fallback share three query attempts. A successful empty result stops. */
export async function runManagedSearchWithFallback<T,R extends {summary:{total:number;failed:number};managedSearch?:{stopReason:string|null}|null}>(routes:T[],execute:(route:T,remaining:number)=>Promise<R>){
 let requestCount=0,failed=false;
 const attempts:Array<{route:T;result?:R;error?:string}>=[];
 for(const route of routes.slice(0,2)){
  if(requestCount>=3)break;
  // The runtime records each attempted query before network IO; thrown setup errors perform no request.
  const result=await execute(route,3-requestCount);
  if(result.summary.total>3-requestCount)throw new Error("MANAGED_SEARCH_REQUEST_BOUNDARY_VIOLATION");
  requestCount+=result.summary.total;
  const expectedStop=["DAILY_QUERY_LIMIT","QUERY_LEASE_ACTIVE","PLAN_NO_NEW_REFERENCES","QUERY_ALREADY_COMPLETED","EVENT_NOT_AVAILABLE"].includes(result.managedSearch?.stopReason??"");
  const unavailable=result.summary.total===0 && !expectedStop;
  failed ||= result.summary.failed>0 || unavailable;attempts.push({route,result});
  if(result.summary.failed===0 && !unavailable)break;
 }
 return {attempts,requestCount,failed};
}
