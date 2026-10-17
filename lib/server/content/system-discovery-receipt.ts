import {sql,type SQL} from 'drizzle-orm';
export const SYSTEM_DISCOVERY_RECEIPT_VERSION='system-discovery-receipt-v1';
type Receipt={version:typeof SYSTEM_DISCOVERY_RECEIPT_VERSION;coverage:'FROM_OBSERVATION_CREATION'|'SINCE_UPGRADE_ONLY';trackingStartedAt:string;firstKnownSystemAt:string|null;firstSystemCollectionRunId:string|null};
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
export function mergeSystemDiscoveryReceipt(previous:unknown,existing:boolean,system:boolean,at:string,runId:string|null=null):Receipt {
 const p=obj(previous);
 if(p.version===SYSTEM_DISCOVERY_RECEIPT_VERSION) return {...p,firstKnownSystemAt:p.firstKnownSystemAt??(system?at:null),firstSystemCollectionRunId:p.firstKnownSystemAt?p.firstSystemCollectionRunId??null:system?runId:null} as Receipt;
 return {version:SYSTEM_DISCOVERY_RECEIPT_VERSION,coverage:existing?'SINCE_UPGRADE_ONLY':'FROM_OBSERVATION_CREATION',trackingStartedAt:at,firstKnownSystemAt:system?at:null,firstSystemCollectionRunId:system?runId:null};
}
/** Conflict uses the locked database row, never a pre-read snapshot or upstream metadata. */
export function systemDiscoveryConflictReceipt(previous:SQL,system:boolean,at:string,runId:string|null=null) {
 const legacy=JSON.stringify(mergeSystemDiscoveryReceipt(undefined,true,system,at,runId));
 return sql`case when ${previous}->>'version' = ${SYSTEM_DISCOVERY_RECEIPT_VERSION}
   then case when ${system} and (${previous}->>'firstKnownSystemAt') is null
     then ${previous} || jsonb_build_object('firstKnownSystemAt', ${at}::text, 'firstSystemCollectionRunId', ${runId}::text) else ${previous} end
   else ${legacy}::jsonb end`;
}
export function firstSystemDiscoveryAt(value:unknown,now=Date.now()):string|null {
 const p=obj(value),at=p.firstKnownSystemAt,start=Date.parse(String(p.trackingStartedAt));
 return p.version===SYSTEM_DISCOVERY_RECEIPT_VERSION&&p.coverage==='FROM_OBSERVATION_CREATION'&&typeof at==='string'&&Number.isFinite(start)&&Number.isFinite(Date.parse(at))&&Date.parse(at)>=start&&Date.parse(at)<=now?at:null;
}
/** A source-local first cannot erase an untracked history on another source. */
export function firstSystemDiscoveryAcrossSources(receipts:unknown[],now=Date.now()):string|null {
 if(!receipts.length||receipts.some(value=>{const p=obj(value);return p.version!==SYSTEM_DISCOVERY_RECEIPT_VERSION||p.coverage!=='FROM_OBSERVATION_CREATION';}))return null;
 const times=receipts.map(value=>firstSystemDiscoveryAt(value,now)).filter((v):v is string=>v!==null).sort((a,b)=>Date.parse(a)-Date.parse(b));
 return times[0]??null;
}
