import {DEFAULT_RADAR_ALGORITHM_POLICY,columnTextDecision,type RadarAlgorithmPolicy} from '../../content/radar-algorithm-policy';
import {isMultiNewsRoundup} from './content-evidence-signals';
import {canonicalHotParticipantName} from './topic-momentum';
import {classifyEventExpansionCandidate,type EventExpansionContext} from './event-expansion';
import {evaluatePracticeMaterials} from './practice-materials';
export const AI_HOTSPOT_PRACTICE_VERSION='ai-hotspot-practice-v1';
export type AiHotspotPracticeLink={sourceName:string;originalUrl:string|null;title?:string|null;excerpt?:string|null;expansionType?:string;materialQuality?:{eligible:boolean}};
export type AiHotspotPracticeCandidate={eventId:string;title:string;excerpt?:string|null;originalUrl?:string|null;category?:string;hotParticipants?:Array<{name:string;role?:string}>;aiPracticeParticipants?:Array<{name:string;role?:string}>;aiPracticeEvidenceLinks?:AiHotspotPracticeLink[];topicMomentum?:{independentParticipantCount?:number};evidenceLinks:AiHotspotPracticeLink[];practicalEvidenceLinks?:AiHotspotPracticeLink[]};
export type AiHotspotPracticeRecord={version:typeof AI_HOTSPOT_PRACTICE_VERSION;eventId:string;title:string;category?:string;summary:string|null;originalUrl:string|null;firstTriggeredAt:string;lastMatchedAt:string;participants:string[];links:AiHotspotPracticeLink[];materialStatus:'VERIFIED_MATERIAL_AVAILABLE'|'MATERIALS_PENDING';triggerReasons:string[]};
export function aiHotspotPracticePublisher(raw:{title?:string|null;originalUrl?:string|null;signalOnly?:boolean;referenceOnly?:boolean;originPublisher?:string|null;author?:string|null;sourceName?:string|null}) {
 if(raw.signalOnly || !raw.originalUrl || isMultiNewsRoundup(raw.title))return null;
 const origin=raw.originPublisher?.trim();
 const author=raw.author?.trim();
 if(raw.referenceOnly && !origin && !author)return null;
 return (origin || author || raw.sourceName?.trim()) || null;
}
const practiceLinks=(i:AiHotspotPracticeCandidate)=>[...(i.aiPracticeEvidenceLinks??i.evidenceLinks).map(link=>({...link,materialQuality:(i.practicalEvidenceLinks??[]).find(material=>material.originalUrl===link.originalUrl)?.materialQuality??link.materialQuality})),...(i.practicalEvidenceLinks??[])];
const textOf=(i:AiHotspotPracticeCandidate)=>[i.title,i.excerpt,...practiceLinks(i).flatMap(l=>[l.title,l.excerpt])].filter(Boolean).join(' ').normalize('NFKC');
type PracticeReport={id:string;sourceId:string;title:string;excerpt?:string|null;originalUrl:string|null;platform:string;author?:string|null;metadata:unknown};
type PracticeSource={name:string;sourceType:string;metadata:unknown;signalConfig:unknown};
const object=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
/** Reporting participation only; never changes Source/Raw factual authority or material gates. */
export function buildAiHotspotPracticeReports(context:EventExpansionContext,direct:PracticeReport[],expansion:PracticeReport[],sources:ReadonlyMap<string,PracticeSource>){
 const participants=new Map<string,{name:string;role:string}>(),links=new Map<string,AiHotspotPracticeLink>();
 const reports=[...direct,...expansion.filter(raw=>{
  const relation=classifyEventExpansionCandidate(context,{rawItemId:raw.id,title:raw.title,excerpt:raw.excerpt,platform:raw.platform});
  if(!relation)return false;
  // Broad historical expansion may match one vendor or a word in the excerpt.
  // Participation needs title-level coverage of this Event's specific anchors.
  const anchors=relation.metadata.specificAnchors,matched=relation.metadata.matchedTitleSpecificAnchors;
  return anchors.length>0 && matched.length/anchors.length>=0.75 &&
   (matched.length>=2 || relation.metadata.matchedTitleVersionAnchors.some(anchor=>/[a-z]/i.test(anchor)&&/\d/.test(anchor)) || matched.some(anchor=>anchor.length>=8 && !/^(?:learning|intelligence|multimodal|framework|platform|reasoning|specialized)$/i.test(anchor)));
 })];
 for(const raw of reports){
  const source=sources.get(raw.sourceId);if(!source)continue;
  const meta=object(raw.metadata),sourceMeta=object(source.metadata),origin=typeof meta.originPublisher==='string'?meta.originPublisher.trim():null;
  const resolvedDiscoveryReport=raw.sourceId==='source_radar_ai_hot' && meta.collector==='ai-hot' && meta.contentType==='NEWS_ARTICLE' && sourceMeta.sourceUniverseRole==='DISCOVERY_AGGREGATOR' && Boolean(origin) && !/^(?:ai\s*hot|dailyhot|hacker\s*news|product\s*hunt)$/i.test(origin!);
  const resolvedCreatorReport=sourceMeta.sourceUniverseRole==='CREATOR' && meta.collector==='feed' && raw.platform==='WEB';
  const name=aiHotspotPracticePublisher({title:raw.title,originalUrl:raw.originalUrl,signalOnly:object(source.signalConfig).signalOnly===true&&!resolvedDiscoveryReport&&!resolvedCreatorReport,referenceOnly:meta.referenceOnly===true||sourceMeta.referenceOnly===true,originPublisher:origin??(resolvedCreatorReport?raw.author?.trim()||source.name:null),author:raw.author,sourceName:source.name});
  if(!name||!raw.originalUrl)continue;
  let url:URL;try{url=new URL(raw.originalUrl);if(!/^https?:$/.test(url.protocol)||url.username||url.password)continue;}catch{continue;}
  if(links.has(url.href))continue;
  const canonical=canonicalExercisePublisher(name),host=url.hostname.toLowerCase().replace(/^www\./,'');
  const institutional=/^(?:Google|OpenAI|Anthropic|Microsoft|GitHub|NVIDIA|Mistral AI|Hugging Face|Qwen|Meta|xAI|AWS)$/.test(canonical);
  const platform=/^(?:x\.com|twitter\.com|youtube\.com|youtu\.be|bilibili\.com|github\.com)$/.test(host);
  const key=institutional||platform?canonical.toLowerCase():host;
  participants.set(key,participants.get(key)??{name:canonical,role:source.sourceType});
  links.set(url.href,{sourceName:participants.get(key)!.name,originalUrl:url.href,title:raw.title,excerpt:raw.excerpt?.slice(0,1000)??null,materialQuality:evaluatePracticeMaterials(raw)});
 }
 return {participants:[...participants.values()],links:[...links.values()]};
}
export function aiHotspotPracticeSubject(input:{title?:string|null;excerpt?:string|null;category?:string}) {
 // Identify the subject from the event title, not incidental tool mentions in
 // model news, related reports, or AI-written summaries.
 const text=(input.title??'').normalize('NFKC');
 const modelAnnouncement=/(?:发布|推出|上架).{0,35}(?:模型|权重)|\b(?:releases?|launches?|introduc\w*)\b.{0,90}\b(?:model|weights)\b/i.test(text);
 return input.category!=='模型' && !modelAnnouncement && !isMultiNewsRoundup(input.title) && /\b(?:skills?|MCP|ComfyUI|agents?|workflows?|n8n|LangGraph|LangChain|Dify|Flowise|OpenHands|OpenClaw|Cursor|Codex|Claude\s+Code)\b|智能体|工作流|AI工具|AI助手/i.test(text);
}
/** Discovery remains broad enough to research a model/news hotspot. Tool-only
 * eligibility applies to the practice column, never to event research itself. */
function aiHotDiscussionSubject(input:{title?:string|null;excerpt?:string|null;category?:string}){
 const text=`${input.title??''} ${input.excerpt??''}`.normalize('NFKC');
 return !isMultiNewsRoundup(input.title)&&(aiHotspotPracticeSubject(input)||input.category==='模型'||/\b(?:LLM|GPT[ -]?\d|Claude|Gemini|Qwen|DeepSeek|Llama|Grok)\b|大模型|语言模型|AI模型/i.test(text));
}
/** Re-check historical presentation without deleting its original trigger/audit. */
export function isToolPracticeRecord(record:AiHotspotPracticeRecord,policy:RadarAlgorithmPolicy=DEFAULT_RADAR_ALGORITHM_POLICY){
 const originalTitle='originalTitle' in record && typeof record.originalTitle==='string'?record.originalTitle:record.title;
 return aiHotspotPracticeSubject({title:originalTitle,category:record.category}) && record.participants.length>=policy.practice.minPublishers && columnTextDecision(`${originalTitle} ${record.summary??''}`,policy.practice).eligible && record.links.some(link=>{
  try{const url=new URL(link.originalUrl??'');return /^https?:$/.test(url.protocol)&&!url.username&&!url.password&&link.materialQuality?.eligible===true;}catch{return false;}
 });
}
function canonicalExercisePublisher(value:string) {
 const name=value.normalize("NFKC").replace(/^(?:X|Twitter|YouTube|Bilibili)\s*[:：]\s*/i,"").replace(/\s*\(@[^)]+\)\s*$/,"").trim();
 const canonical=canonicalHotParticipantName(name);
 return /^(?:Google\b|Gemini\b)/i.test(canonical)?"Google":canonical;
}
export function aiHotspotPracticePublishers(input:Pick<AiHotspotPracticeCandidate,'hotParticipants'|'aiPracticeParticipants'>) {
 return [...new Map((input.aiPracticeParticipants??input.hotParticipants??[]).filter(p=>p.name.trim() && (p.role==='OFFICIAL' || !/^(?:hacker\s*news|product\s*hunt|dailyhot|ai\s*hot|github)(?:\b|\s|[·:])/i.test(p.name))).map(p=>{const name=canonicalExercisePublisher(p.name);return [name.toLowerCase(),name] as const;})).values()];
}
export function evaluateAiHotspotPractice(input:AiHotspotPracticeCandidate,now=new Date(),policy:RadarAlgorithmPolicy=DEFAULT_RADAR_ALGORITHM_POLICY) {
 const participants=aiHotspotPracticePublishers(input);
 const text=textOf(input);
 const subject=aiHotspotPracticeSubject(input);
 const material=practiceLinks(input).some(link=>{
  try{const url=new URL(link.originalUrl??'');return /^https?:$/.test(url.protocol)&&!url.username&&!url.password&&link.materialQuality?.eligible===true;}catch{return false;}
 });
 const discussion=/分析|解读|实测|评测|测试|对比|实践|运用|应用|教程|配置|部署|工作流|analysis|benchmark|compar(?:e|ison)|evaluat|hands[- ]?on|tutorial|how to|use case|workflow|deploy|configur|build\b|using\b/i.test(text);
 const textRule=columnTextDecision(`${input.title} ${input.excerpt??''}`,policy.practice);
 const reasons=[...(!textRule.eligible?['COLUMN_TEXT_RULE_REJECTED']:[]),...(!subject?['PRACTICAL_TOOL_TOPIC_REQUIRED']:[]),...(participants.length<policy.practice.minPublishers?['MULTIPLE_INDEPENDENT_PUBLISHERS_MISSING']:[]),...(!discussion?['ANALYSIS_OR_APPLICATION_MISSING']:[]),...(!material?['VERIFIED_TOOL_MATERIAL_REQUIRED']:[])];
 const links=[...new Map(practiceLinks(input).filter(l=>{try{return /^https?:$/.test(new URL(l.originalUrl??'').protocol);}catch{return false;}}).map(l=>[l.originalUrl,{sourceName:l.sourceName,originalUrl:l.originalUrl,title:l.title??null,expansionType:l.expansionType,...(l.materialQuality?{materialQuality:{eligible:l.materialQuality.eligible}}:{})}])).values()];
 const record:AiHotspotPracticeRecord={version:AI_HOTSPOT_PRACTICE_VERSION,eventId:input.eventId,title:input.title,category:input.category,summary:input.excerpt??null,originalUrl:input.originalUrl??links[0]?.originalUrl??null,firstTriggeredAt:now.toISOString(),lastMatchedAt:now.toISOString(),participants,links,materialStatus:links.some(l=>l.materialQuality?.eligible)?'VERIFIED_MATERIAL_AVAILABLE':'MATERIALS_PENDING',triggerReasons:['AI_TOPIC','MULTIPLE_INDEPENDENT_PUBLISHERS','ANALYSIS_OR_APPLICATION']};
 return {eligible:reasons.length===0,reasons,record:reasons.length?null:record};
}
export function mergeAiHotspotPractice(previous:AiHotspotPracticeRecord|null,next:AiHotspotPracticeRecord|null,_now=new Date()):AiHotspotPracticeRecord {
 if(!previous && !next)throw new Error('AI_HOTSPOT_PRACTICE_NOT_TRIGGERED');
 if(!next)return previous!;
 return {...next,firstTriggeredAt:previous&&previous.firstTriggeredAt<next.firstTriggeredAt?previous.firstTriggeredAt:next.firstTriggeredAt,
 lastMatchedAt:previous&&previous.lastMatchedAt>next.lastMatchedAt?previous.lastMatchedAt:next.lastMatchedAt,
 participants:[...new Map([...(previous?.participants??[]),...next.participants].map(p=>{const name=canonicalExercisePublisher(p);return [name.toLowerCase(),name] as const;})).values()],
 links:[...new Map([...(previous?.links??[]),...next.links].map(l=>[l.originalUrl,l])).values()],
 materialStatus:previous?.materialStatus==='VERIFIED_MATERIAL_AVAILABLE'?previous.materialStatus:next.materialStatus};
}
export function shouldExpandHotDiscussion(input:{title?:string|null;excerpt?:string|null;category?:string;independentParticipants:number;lastAttemptAt:string|null;importantOfficialSeed?:boolean},now=Date.now()) {
 if(!aiHotDiscussionSubject(input) || (input.independentParticipants<2 && !(input.importantOfficialSeed && input.independentParticipants>=1)))return {eligible:false,reason:'AI_HOTSPOT_TRIGGER_MISSING'};
 const last=input.lastAttemptAt?Date.parse(input.lastAttemptAt):null;
 return last!==null && (!Number.isFinite(last)||now-last<6*3600000)?{eligible:false,reason:'SEARCH_COOLDOWN'}:{eligible:true,reason:'AI_HOTSPOT_MATERIAL_EXPANSION'};
}
