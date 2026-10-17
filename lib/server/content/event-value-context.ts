import 'server-only';
import {inArray} from 'drizzle-orm';
import {getDatabase} from '../db';
import {contentRawItems,contentSources} from '../db/schema';
import {loadEventValueCandidate} from './intelligence-read-model';
import {prepareEventValue} from './event-value-policy';
import {expressionHash} from './event-expression-policy';
import {resolveParticipantIdentity,isIndependentTestPublisher} from './participant-identity';
import {sourceContentRule,inferCollectionContentType} from './source-policy';
import type {ValueEvidence} from '../../../skills/event-value-analysis/v1';
const obj=(v:unknown):Record<string,any>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,any>:{};
export async function loadEventValueContext(db:ReturnType<typeof getDatabase>,eventId:string,asOf:Date){
 const item=await loadEventValueCandidate(db,eventId,asOf);if(!item)return null;
 const ids=[...new Set([...(item.evidenceLineage?.directRawIds??[]),...(item.evidenceLineage?.expansionRawIds??[])])].sort();if(!ids.length)return null;
 const rawRows=await db.select().from(contentRawItems).where(inArray(contentRawItems.id,ids)).for('share');
 const sources=await db.select().from(contentSources).where(inArray(contentSources.id,[...new Set(rawRows.map(r=>r.sourceId))])).for('share');
 const evidence:ValueEvidence[]=rawRows.flatMap(raw=>{
  const source=sources.find(s=>s.id===raw.sourceId),m=obj(raw.metadata),receipt=obj(m.publicContentReceipt);
  if(!source||!source.enabled||source.status!=='ACTIVE'||!raw.originalUrl||raw.collectedAt>asOf||(raw.publishedAt&&raw.publishedAt>asOf))return [];
  const identity=resolveParticipantIdentity({sourceId:source.id,sourceName:source.name,sourceType:source.sourceType,platform:raw.platform,canonicalUrl:source.canonicalUrl,author:raw.author,metadata:m,sourceMetadata:source.metadata,referenceOnly:m.referenceOnly===true||obj(source.metadata).referenceOnly===true,signalOnly:obj(source.signalConfig).signalOnly===true});
  if(identity.role!=='EDITORIAL'||!identity.participantKey)return [];
  const body=receipt.kind==='BODY'?m.bodyText:receipt.kind==='TRANSCRIPT'?m.transcriptText:null;
  const fetched=receipt.url===raw.originalUrl&&receipt.serverFetched===true&&receipt.anonymous===true&&receipt.status===200&&Number.isFinite(Date.parse(receipt.observedAt))&&Date.parse(receipt.observedAt)<=asOf.getTime();
  const complete=fetched&&receipt.complete===true&&typeof body==='string'&&body.length>0&&m.fullTextTruncated!==true&&m.transcriptTruncated!==true;
  const text=[raw.title,raw.excerpt??'',fetched&&typeof body==='string'?body:''].join('\n');
  const rule=sourceContentRule(source,inferCollectionContentType({metadata:m,originalUrl:raw.originalUrl,collectionMethod:source.collectionMethod,platform:raw.platform,source}));
  const primary=['OFFICIAL','RESEARCH'].includes(source.sourceType)&&m.referenceOnly!==true&&obj(source.metadata).referenceOnly!==true&&rule.role==='FACT'&&rule.confirmationScope!=='NONE';
  const independent=isIndependentTestPublisher({sourceId:source.id,sourceType:source.sourceType,sourceName:source.name,platform:raw.platform,canonicalUrl:source.canonicalUrl,originalUrl:raw.originalUrl,author:raw.author,metadata:m,sourceMetadata:source.metadata,referenceOnly:m.referenceOnly===true||obj(source.metadata).referenceOnly===true,signalOnly:obj(source.signalConfig).signalOnly===true});
  const role:ValueEvidence['role']=/争议|失败|修正|反例|failure|correction|disput|limitation/i.test(raw.title)?'COUNTER':primary?'PRIMARY':independent&&/实测|评测|benchmark|hands[- ]?on|tested/i.test(raw.title)?'TEST':'ANALYSIS';
  return [{id:raw.id,url:raw.originalUrl,text,documentVersion:expressionHash(text),publisherKey:identity.participantKey,role,complete,publishedAt:raw.publishedAt?.toISOString()??null}];
 });
 const prepared=prepareEventValue(item.eventId,{hot:item.currentHot.eligible,featured:item.curation.curated},evidence);if(!prepared)return null;
 const memberIds=[...(item.evidenceLineage?.memberEventIds??[item.eventId])].sort();
 return {...prepared,canonicalId:item.eventId,memberIds,revision:expressionHash([memberIds,prepared.fingerprint,item.algorithmRevision,item.verificationStatus,item.currentHot.eligible,item.curation.curated])};
}
