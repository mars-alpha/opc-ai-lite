import {firstSystemDiscoveryAcrossSources} from './system-discovery-receipt';
import {evaluatePracticeMaterials} from './practice-materials';
import { resolveParticipantIdentity, type ParticipantIdentityInput } from "./participant-identity";

export const EVENT_STORY_READ_MODEL_VERSION = "event-story-read-model-v2-evidence-time";

export type StoryReportInput = ParticipantIdentityInput & {
  reportId: string;
  title: string;
  titleZh?: string | null;
  excerpt?: string | null;
  excerptZh?: string | null;
  originalUrl: string | null;
  publishedAt: Date | string | null;
  collectedAt?:Date|string|null;
  systemDiscoveryReceipts?:unknown[];
};

export type StoryHeatPoint = {
  at: string;
  score: number;
  participantCount: number;
  editorialParticipantCount: number;
  signalParticipantCount: number;
};

function toTime(value: Date | string | null | undefined) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}
function text(value: string | null | undefined) { return (value ?? "").trim(); }
function authorityFor(report: StoryReportInput) {
  const type = report.sourceType.toUpperCase();
  if(report.referenceOnly||report.signalOnly)return "SIGNAL" as const;
  if (type === "OFFICIAL" || type === "RESEARCH") return "PRIMARY" as const;
  if (type === "MEDIA") return "HIGH" as const;
  return "SIGNAL" as const;
}

export function buildEventStoryReadModel(input: {
  eventId: string;
  title: string;
  titleZh?: string | null;
  summary?: string | null;
  summaryZh?: string | null;
  reports: StoryReportInput[];
  heatSeries: StoryHeatPoint[];
  persistedHeatSeries?:StoryHeatPoint[];
  heatAlgorithmVersion?:string;
  asOf?:Date;
}) {
  const asOf=input.asOf??new Date();
  const validPublished=(report:StoryReportInput)=>{const meta=report.metadata as Record<string,unknown>|null;const at=toTime(report.publishedAt);return at>0&&at<=asOf.getTime()&&meta?.publicationTimeBasis!=="UPDATED_ONLY"&&meta?.publicationTimePrecision!=="UNKNOWN"?at:0;};
  const reports = [...input.reports].filter((report) => Boolean(report.originalUrl)).sort((a,b)=>validPublished(b)-validPublished(a)||a.reportId.localeCompare(b.reportId));
  const timeline = reports.map((report)=>{
    const identity=resolveParticipantIdentity(report);
    return { reportId:report.reportId,title:report.title,titleZh:report.titleZh??null,excerpt:report.excerpt??null,excerptZh:report.excerptZh??null,sourceId:report.sourceId,sourceName:report.sourceName,sourceType:report.sourceType,originalUrl:report.originalUrl,publishedAt:validPublished(report)?new Date(validPublished(report)).toISOString():null,timeBasis:validPublished(report)?'SOURCE_REPORTED_PUBLICATION':'UNKNOWN',collectedAt:toTime(report.collectedAt)?new Date(toTime(report.collectedAt)).toISOString():null,firstSystemDiscoveredAt:firstSystemDiscoveryAcrossSources(report.systemDiscoveryReceipts??[],asOf.getTime()),contentState:contentState(report),authority:authorityFor(report),participant:identity };
  });
  const dated=timeline.filter(r=>r.publishedAt!==null);
  const latest=dated[0]??null;
  const earliestKnownReport=dated[dated.length-1]??null;
  const primarySource=timeline.find(r=>r.authority==="PRIMARY")??null;
  const latestReport=timeline.find((report)=>report.authority==="PRIMARY")??timeline.find((report)=>report.authority==="HIGH")??null;
  const overview=text(input.summaryZh)||text(input.summary)||text(input.titleZh)||input.title;
  const latestText=latest?(text(latest.excerptZh)||text(latest.excerpt)||text(latest.titleZh)||latest.title):overview;
  const digest=latest?`${overview}${overview.endsWith("。")?"":"。"} 最新进展：${latestText}`:overview;
  const seen=new Set<string>();
  const developments=timeline.flatMap((report)=>{const label=text(report.titleZh)||report.title;const key=label.normalize("NFKC").toLocaleLowerCase();if(!key||seen.has(key))return[];seen.add(key);return[{id:report.reportId,at:report.publishedAt,title:label,sourceName:report.sourceName,originalUrl:report.originalUrl,authority:report.authority}]}).slice(0,8);
  return {version:EVENT_STORY_READ_MODEL_VERSION,authority:"DERIVED_READ_MODEL" as const,eventId:input.eventId,overview,earliestKnownReport,primarySource,authoritativeReport:latestReport,firstSystemDiscoveredAt:firstSystemDiscoveryAcrossSources(input.reports.flatMap(r=>r.systemDiscoveryReceipts??[]),asOf.getTime()),latest:latest?{text:latestText,reportId:latest.reportId,sourceName:latest.sourceName,originalUrl:latest.originalUrl,publishedAt:latest.publishedAt,authority:latest.authority}:null,latestReport,digest:{text:digest.slice(0,360),mode:"DETERMINISTIC_DERIVED" as const,aiGenerated:false},developments,reportTimeline:timeline,relatedEvents:[] as Array<{eventId:string;title:string;reason:string;score:number}>,heatSeries:{mode:input.persistedHeatSeries?.length?'OBSERVED_HISTORY' as const:'DERIVED_REPLAY' as const,persistedHistory:Boolean(input.persistedHeatSeries?.length),algorithmVersion:input.heatAlgorithmVersion??null,intervalHours:6,windowHours:168,points:input.persistedHeatSeries?.length?input.persistedHeatSeries:input.heatSeries}};
}

function contentState(report:StoryReportInput){
 const m=(report.metadata??{}) as Record<string,any>,r=m.publicContentReceipt??{};
 const retrieved=r.serverFetched===true&&r.anonymous===true&&r.status===200&&r.url===report.originalUrl;
 const text=r.kind==='BODY'?m.bodyText:r.kind==='TRANSCRIPT'?m.transcriptText:null;
 const quality=evaluatePracticeMaterials(report);
 return {linkRetained:Boolean(report.originalUrl),bodyRetrieved:retrieved&&typeof text==='string'&&text.length>0,bodyComplete:retrieved&&r.complete===true&&typeof text==='string'&&text.length>0&&m.fullTextTruncated!==true&&m.transcriptTruncated!==true,attachmentVerified:quality.eligible&&(quality.kind==='VERIFIED_WORKFLOW_AND_STEPS'||(r.requiresExternalMaterials===true&&Array.isArray(r.requiredMaterials)&&r.requiredMaterials.length>0)),platformExecuted:false};
}
function tokens(value:string){return new Set(value.normalize("NFKC").toLocaleLowerCase().replace(/[^a-z0-9\p{Script=Han}]+/gu," ").split(/\s+/).filter((token)=>token.length>=3));}
export function attachRelatedEventStories<T extends {eventId:string;title:string;presentation?:{displayTitleZh?:string|null}|null;eventType?:string|null;story:ReturnType<typeof buildEventStoryReadModel>}>(items:T[]){
  return items.map((item)=>{const left=tokens(item.presentation?.displayTitleZh||item.title);const related=items.flatMap((candidate)=>{if(candidate.eventId===item.eventId)return[];const right=tokens(candidate.presentation?.displayTitleZh||candidate.title);const overlap=[...left].filter((token)=>right.has(token)).length;const denominator=Math.max(1,Math.min(left.size,right.size));const lexical=overlap/denominator;const sameType=Boolean(item.eventType&&candidate.eventType===item.eventType);const score=Math.round((lexical*0.8+(sameType?0.2:0))*100);if(overlap<2||score<58)return[];return[{eventId:candidate.eventId,title:candidate.presentation?.displayTitleZh||candidate.title,reason:sameType?"同类事件且标题实体/主题重叠":"标题实体/主题重叠",score}]}).sort((a,b)=>b.score-a.score).slice(0,5);return{...item,story:{...item.story,relatedEvents:related}};});
}
