import {isMultiNewsRoundup} from './content-evidence-signals';
import {canonicalHotParticipantName} from './topic-momentum';
export const AI_HOTSPOT_PRACTICE_VERSION='ai-hotspot-practice-v1';
export type AiHotspotPracticeLink={sourceName:string;originalUrl:string|null;title?:string|null;expansionType?:string;materialQuality?:{eligible:boolean}};
export type AiHotspotPracticeCandidate={eventId:string;title:string;excerpt?:string|null;originalUrl?:string|null;category?:string;hotParticipants?:Array<{name:string;role?:string}>;topicMomentum?:{independentParticipantCount?:number};evidenceLinks:AiHotspotPracticeLink[];practicalEvidenceLinks?:AiHotspotPracticeLink[]};
export type AiHotspotPracticeRecord={version:typeof AI_HOTSPOT_PRACTICE_VERSION;eventId:string;title:string;summary:string|null;originalUrl:string|null;firstTriggeredAt:string;lastMatchedAt:string;participants:string[];links:AiHotspotPracticeLink[];materialStatus:'VERIFIED_MATERIAL_AVAILABLE'|'MATERIALS_PENDING';triggerReasons:string[]};
export function aiHotspotPracticePublisher(raw:{title?:string|null;originalUrl?:string|null;signalOnly?:boolean;referenceOnly?:boolean;originPublisher?:string|null;author?:string|null;sourceName?:string|null}) {
 if(raw.signalOnly || !raw.originalUrl || isMultiNewsRoundup(raw.title))return null;
 const origin=raw.originPublisher?.trim();
 const author=raw.author?.trim();
 if(raw.referenceOnly && !origin && !author)return null;
 return (origin || author || raw.sourceName?.trim()) || null;
}
const textOf=(i:AiHotspotPracticeCandidate)=>[i.title,i.excerpt,...i.evidenceLinks.flatMap(l=>[l.title]),...(i.practicalEvidenceLinks??[]).map(l=>l.title)].filter(Boolean).join(' ').normalize('NFKC');
export function aiHotspotPracticeSubject(input:{title?:string|null;excerpt?:string|null;category?:string}) {
 const text=`${input.title??''} ${input.excerpt??''}`.normalize('NFKC');
 return !isMultiNewsRoundup(input.title) && (input.category==='模型' || /\b(?:LLM|GPT[ -]?\d|Claude|Gemini|Qwen|DeepSeek|Llama|Grok|Skill|MCP|ComfyUI|Agent|n8n|REA)\b|大模型|语言模型|智能体|工作流|AI工具|AI模型|AI助手/i.test(text));
}
function canonicalExercisePublisher(value:string) {
 const name=value.normalize("NFKC").replace(/^(?:X|Twitter|YouTube|Bilibili)\s*[:：]\s*/i,"").replace(/\s*\(@[^)]+\)\s*$/,"").trim();
 const canonical=canonicalHotParticipantName(name);
 return /^(?:Google\b|Gemini\b)/i.test(canonical)?"Google":canonical;
}
export function evaluateAiHotspotPractice(input:AiHotspotPracticeCandidate,now=new Date()) {
 const participants=[...new Map((input.hotParticipants??[]).filter(p=>p.name.trim() && (p.role==='OFFICIAL' || !/^(?:hacker\s*news|product\s*hunt|dailyhot|ai\s*hot|github)(?:\b|\s|[·:])/i.test(p.name))).map(p=>{const name=canonicalExercisePublisher(p.name);return [name.toLowerCase(),name] as const;})).values()];
 const text=textOf(input);
 const subject=aiHotspotPracticeSubject({...input,excerpt:text});
 const discussion=/分析|解读|实测|评测|测试|对比|实践|运用|应用|教程|配置|部署|工作流|analysis|benchmark|compar(?:e|ison)|evaluat|hands[- ]?on|tutorial|how to|use case|workflow|deploy|configur|build\b|using\b/i.test(text);
 const reasons=[...(!subject?['AI_TOPIC_UNCLEAR_OR_ROUNDUP']:[]),...(participants.length<2?['MULTIPLE_INDEPENDENT_PUBLISHERS_MISSING']:[]),...(!discussion?['ANALYSIS_OR_APPLICATION_MISSING']:[])];
 const links=[...new Map([...input.evidenceLinks,...(input.practicalEvidenceLinks??[])].filter(l=>{try{return /^https?:$/.test(new URL(l.originalUrl??'').protocol);}catch{return false;}}).map(l=>[l.originalUrl,{sourceName:l.sourceName,originalUrl:l.originalUrl,title:l.title??null,expansionType:l.expansionType,...(l.materialQuality?{materialQuality:{eligible:l.materialQuality.eligible}}:{})}])).values()];
 const record:AiHotspotPracticeRecord={version:AI_HOTSPOT_PRACTICE_VERSION,eventId:input.eventId,title:input.title,summary:input.excerpt??null,originalUrl:input.originalUrl??links[0]?.originalUrl??null,firstTriggeredAt:now.toISOString(),lastMatchedAt:now.toISOString(),participants,links,materialStatus:links.some(l=>l.materialQuality?.eligible)?'VERIFIED_MATERIAL_AVAILABLE':'MATERIALS_PENDING',triggerReasons:['AI_TOPIC','MULTIPLE_INDEPENDENT_PUBLISHERS','ANALYSIS_OR_APPLICATION']};
 return {eligible:reasons.length===0,reasons,record:reasons.length?null:record};
}
export function mergeAiHotspotPractice(previous:AiHotspotPracticeRecord|null,next:AiHotspotPracticeRecord|null,_now=new Date()):AiHotspotPracticeRecord {
 if(!previous && !next)throw new Error('AI_HOTSPOT_PRACTICE_NOT_TRIGGERED');
 if(!next)return previous!;
 return {...next,firstTriggeredAt:previous?.firstTriggeredAt??next.firstTriggeredAt,
 participants:[...new Map([...(previous?.participants??[]),...next.participants].map(p=>{const name=canonicalExercisePublisher(p);return [name.toLowerCase(),name] as const;})).values()],
 links:[...new Map([...(previous?.links??[]),...next.links].map(l=>[l.originalUrl,l])).values()],
 materialStatus:previous?.materialStatus==='VERIFIED_MATERIAL_AVAILABLE'?previous.materialStatus:next.materialStatus};
}
export function shouldExpandAiHotspotPractice(input:{title?:string|null;excerpt?:string|null;independentParticipants:number;lastAttemptAt:string|null},now=Date.now()) {
 if(!aiHotspotPracticeSubject(input) || input.independentParticipants<2)return {eligible:false,reason:'AI_HOTSPOT_TRIGGER_MISSING'};
 const last=input.lastAttemptAt?Date.parse(input.lastAttemptAt):null;
 return last!==null && (!Number.isFinite(last)||now-last<6*3600000)?{eligible:false,reason:'SEARCH_COOLDOWN'}:{eligible:true,reason:'AI_HOTSPOT_MATERIAL_EXPANSION'};
}
