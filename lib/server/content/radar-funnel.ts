/** Read-only reference-cohort diagnostics. Never grants collection or column authority. */
export const RADAR_FUNNEL_VERSION='radar-funnel-v1';
export type RadarColumn='featured'|'hot'|'practice';
export type RadarReference={id:string;url:string;sourceId:string;publishedAt:string;basis:'OBSERVED_ONLY'|'INDEPENDENT';labels:Record<RadarColumn,'POSITIVE'|'NEGATIVE'|'UNKNOWN'>};
export type RadarTrace={source:'CURRENT'|'INACTIVE'|'MISSING';rawIds:string[];rawCollectedAt:string|null;systemObservedAt:string|null;systemDiscoveredAt?:string|null;eventIds:string[];canonicalIds:string[];visible:boolean;exclusionReasons:string[];rejected?:{stage:string;reason:string};columns:Record<RadarColumn,{selected:boolean;reasons:string[]}>;snapshot?:{status:'FRESH'|'STALE'|'UNKNOWN';generatedAt:string;items:string[];featured:string[];hot:string[];practice:string[]}};
const columns:RadarColumn[]=['featured','hot','practice'];
const date=(value:string|null|undefined)=>value?Date.parse(value):NaN;
export function validateRadarReference(ref:RadarReference){
 if(!ref.id||!ref.sourceId||!['OBSERVED_ONLY','INDEPENDENT'].includes(ref.basis)||!Number.isFinite(date(ref.publishedAt)))throw Error('RADAR_REFERENCE_INVALID');
 let url:URL;try{url=new URL(ref.url);}catch{throw Error('RADAR_REFERENCE_URL');}
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error('RADAR_REFERENCE_URL');
 if(columns.some(c=>!['POSITIVE','NEGATIVE','UNKNOWN'].includes(ref.labels?.[c])))throw Error('RADAR_REFERENCE_LABEL');
}
export function diagnoseRadarReference(ref:RadarReference,trace:RadarTrace,asOf:string){
 validateRadarReference(ref);const now=date(asOf),published=date(ref.publishedAt);if(!Number.isFinite(now))throw Error('RADAR_AS_OF_INVALID');
 const futureReference=published>now;
 const observed=date(trace.systemObservedAt),collected=date(trace.rawCollectedAt);
 const discovered=trace.systemDiscoveredAt===undefined?Math.max(observed,collected):date(trace.systemDiscoveredAt);
 const validTime=trace.rawIds.length>0&&Number.isFinite(discovered)&&Number.isFinite(collected)&&Number.isFinite(observed)&&collected>=published&&collected<=now&&observed<=now&&discovered>=published&&discovered<=now;
 const delayHours=validTime?(discovered-published)/3600000:null;
 const observationMatured=!futureReference&&now-published>=24*3600000;
 const discoveredWithin24h=futureReference?null:delayHours===null?(observationMatured&&trace.rawIds.length===0?false:null):delayHours<=24;
 const firstGap=futureReference?'FUTURE_REFERENCE':trace.source==='MISSING'?'SOURCE':!trace.rawIds.length?(trace.rejected?'RAW':'ACQUISITION_UNKNOWN'):!Number.isFinite(observed)||observed>now?'EVIDENCE':!trace.eventIds.length?'EVENT':!trace.canonicalIds.length?'CANONICAL':trace.exclusionReasons.includes('EVIDENCE_ASSOCIATION_REJECTED')?'EVIDENCE':!trace.visible?'VISIBILITY':null;
 const outcomes=Object.fromEntries(columns.map(c=>{
  const selected=!futureReference&&trace.visible&&trace.columns[c].selected,label=ref.labels[c];
  const outcome=label==='UNKNOWN'?'UNLABELLED':label==='POSITIVE'?(selected?'TRUE_POSITIVE':'FALSE_NEGATIVE'):(selected?'FALSE_POSITIVE':'TRUE_NEGATIVE');
  const snapshot=!selected?'NOT_SELECTED':!trace.snapshot||trace.snapshot.status==='UNKNOWN'?'UNKNOWN':trace.snapshot.status==='STALE'?'STALE_UNKNOWN':trace.canonicalIds.some(id=>trace.snapshot![c].includes(id))?'PRESENT':'MISSING';
  return [c,{selected,label,outcome,snapshot,reasons:trace.columns[c].reasons}];
 })) as Record<RadarColumn,{selected:boolean;label:string;outcome:string;snapshot:string;reasons:string[]}>;
 return {reference:ref,asOf,firstGap,sourceStatus:trace.source,rawIds:[...new Set(trace.rawIds)],eventIds:[...new Set(trace.eventIds)],canonicalIds:[...new Set(trace.canonicalIds)],visible:!futureReference&&trace.visible,exclusionReasons:trace.exclusionReasons,rejected:trace.rejected??null,delayHours,discoveredWithin24h,observationMatured,columns:outcomes};
}
export type RadarDiagnosis=ReturnType<typeof diagnoseRadarReference>;
export function summarizeRadarFunnel(rows:RadarDiagnosis[]){
 if(new Set(rows.map(r=>r.reference.id)).size!==rows.length)throw Error('RADAR_DUPLICATE_REFERENCE');
 const gaps:Record<string,number>={};for(const row of rows){const key=row.firstGap??'VISIBLE';gaps[key]=(gaps[key]??0)+1;}
 const independent=rows.filter(r=>r.reference.basis==='INDEPENDENT'&&r.firstGap!=='FUTURE_REFERENCE');
 const mature=independent.filter(r=>r.observationMatured),known=mature.filter(r=>r.discoveredWithin24h!==null);
 const comparable=mature.length>0&&known.length===mature.length;
 const quality=Object.fromEntries(columns.map(c=>{
  const labelled=independent.filter(r=>r.columns[c].label!=='UNKNOWN'),count=(outcome:string)=>labelled.filter(r=>r.columns[c].outcome===outcome).length;
  const tp=count('TRUE_POSITIVE'),fp=count('FALSE_POSITIVE'),fn=count('FALSE_NEGATIVE'),tn=count('TRUE_NEGATIVE');
  return [c,{labelled:labelled.length,unlabelled:rows.length-labelled.length,tp,fp,fn,tn,precision:tp+fp?tp/(tp+fp):null,recall:tp+fn?tp/(tp+fn):null}];
 })) as Record<RadarColumn,{labelled:number;unlabelled:number;tp:number;fp:number;fn:number;tn:number;precision:number|null;recall:number|null}>;
 const delays=rows.flatMap(r=>r.delayHours===null?[]:[r.delayHours]).sort((a,b)=>a-b);
 return {version:RADAR_FUNNEL_VERSION,population:'FROZEN_REFERENCE_REPORT_COHORT',references:rows.length,independentReferences:independent.length,gaps,visible:rows.filter(r=>r.visible).length,canonicalEvents:new Set(rows.filter(r=>r.visible).flatMap(r=>r.canonicalIds)).size,matureIndependent:mature.length,censoredIndependent:independent.length-mature.length,unknownTiming:mature.length-known.length,discoveryRecall24h:comparable?known.filter(r=>r.discoveredWithin24h).length/mature.length:null,discoveryRecallStatus:comparable?'MEASURED_REFERENCE_COHORT':'UNKNOWN_INDEPENDENT_OR_TIMING_INCOMPLETE',delayMedianHours:delays.length?delays[Math.floor((delays.length-1)/2)]:null,columns:quality};
}
export function compareRadarFunnel(before:RadarDiagnosis[],after:RadarDiagnosis[]){
 summarizeRadarFunnel(before);summarizeRadarFunnel(after);
 const old=new Map(before.map(r=>[r.reference.id,r]));
 if(before.length!==after.length||after.some(r=>!old.has(r.reference.id)||JSON.stringify(old.get(r.reference.id)!.reference)!==JSON.stringify(r.reference)||old.get(r.reference.id)!.asOf!==r.asOf))throw Error('RADAR_UNPAIRED_REFERENCE_COHORT');
 return {references:after.length,recoveredVisibility:after.filter(r=>r.visible&&!old.get(r.reference.id)!.visible).length,lostVisibility:after.filter(r=>!r.visible&&old.get(r.reference.id)!.visible).length,before:summarizeRadarFunnel(before),after:summarizeRadarFunnel(after)};
}
