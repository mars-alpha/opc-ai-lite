export const SOURCE_COLLECTION_SCHEDULE_VERSION='source-collection-schedule-v1';
export const MIN_SOURCE_INTERVAL_MINUTES=5;
export const MAX_SOURCE_INTERVAL_MINUTES=1440;
export type SourceScheduleChange={sourceId:string;intervalMinutes:number;expectedRevision:string};
export type SourceSchedule={version:typeof SOURCE_COLLECTION_SCHEDULE_VERSION;intervalMinutes:number;revision:string;updatedAt?:string};
function record(v:unknown):Record<string,unknown>{return v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};}
function validInterval(v:unknown):v is number{return typeof v==='number'&&Number.isInteger(v)&&v>=MIN_SOURCE_INTERVAL_MINUTES&&v<=MAX_SOURCE_INTERVAL_MINUTES;}
export function validateSourceScheduleChanges(value:unknown):SourceScheduleChange[]{
 if(!Array.isArray(value)||!value.length||value.length>1000)throw Error('INVALID_SOURCE_SCHEDULE');
 const ids=new Set<string>();
 for(const v of value){const r=record(v);if(Object.keys(r).length!==3||typeof r.sourceId!=='string'||!r.sourceId||r.sourceId.length>200||ids.has(r.sourceId)||!validInterval(r.intervalMinutes)||typeof r.expectedRevision!=='string'||!r.expectedRevision||r.expectedRevision.length>100)throw Error('INVALID_SOURCE_SCHEDULE');ids.add(r.sourceId);}
 return structuredClone(value);
}
export function readSourceSchedule(metadata:unknown):SourceSchedule|null{
 const value=record(metadata).collectionSchedule;if(value===undefined||value===null)return null;
 const r=record(value);if(r.version!==SOURCE_COLLECTION_SCHEDULE_VERSION||!validInterval(r.intervalMinutes)||typeof r.revision!=='string'||!r.revision)throw Error('INVALID_SOURCE_SCHEDULE');
 return r as SourceSchedule;
}
export function isSourceCadenceRun(metadata:unknown){const r=record(metadata);return r.collectionOrigin==='SYSTEM'&&!/^SOURCE_QUALIFICATION(?:$|:)/.test(String(r.collectionRunKind??''))&&r.qualificationOnly!==true&&r.backfillWindow==null&&record(r.staleRunRecovery).excludeFromRuntimeQualification!==true;}
