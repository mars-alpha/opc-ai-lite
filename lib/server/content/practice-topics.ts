import { evaluatePracticeSubject, isMultiNewsRoundup, isWorthPracticingEligible } from "./practical-evidence-actionability";
import {evaluatePracticeMaterials} from "./practice-materials";

type PracticeLink = { sourceName: string; title: string | null; excerpt?: string | null; originKey?: string; parentEventId?: string; parentOpcStatus?: string; originalUrl: string; expansionType: string; metadata?: unknown; materialQuality?: ReturnType<typeof evaluatePracticeMaterials>; presentation?: { displayTitleZh?: string | null; displaySummaryZh?: string | null } };
type PracticeParent = { eventId: string; title: string; excerpt?: string | null; presentation?: { displayTitleZh?: string | null; displaySummaryZh?: string | null }; practicalEvidenceLinks: PracticeLink[]; opcValue: { status: string }; coverage: { practicalEvidenceCount: number; actionablePracticalEvidenceCount?: number; actionablePracticalOriginCount?: number; actionablePracticalTypeCount?: number } };

export function practiceTopicIdentity(link: Pick<PracticeLink,"title">) {
  // Identity must occur in the actual title, never be inherited from release news.
  const title = (link.title ?? "").normalize("NFKC");
  if (isMultiNewsRoundup(title)) return null;
  let tool = title.match(/\b(?:comfyui|rea)\b/i)?.[0]?.toLowerCase();
  if (!tool) {
    const named = title.match(/\b([a-z][a-z0-9_.-]{2,})\s+(?:skill|mcp)\b/i);
    if (named && !/^(?:the|new|best|this|open|use|using|with|any|your|free|top|how)$/i.test(named[1])) tool = named[1].toLowerCase() + ":" + named[0].split(/\s+/).at(-1)!.toLowerCase();
  }
  if (!tool) return null;
  const goals: Array<[string,RegExp]> = [
    ["image-animation",/图生动画|图生视频|image[- ]to[- ](?:video|animation)/i],
    ["text-animation",/文生动画|文生视频|text[- ]to[- ](?:video|animation)/i],
    ["video-script",/视频脚本|video script/i], ["rewrite",/文章改写|人味写作|改写文章|rewrite|humaniz/i],
    ["collect-organize",/信息整理|资料整理|整理资料|收集整理|information collection/i],
    ["customer-service",/客服|customer service/i], ["ads",/投流|广告投放|ad campaign/i],
    ["illustration",/配图|文章排版|illustration/i], ["editing",/视频剪辑|剪辑视频|video editing/i]
    ,["image-generation",/文生图|图生图|生图|图像生成|图片生成|text[- ]to[- ]image|image generation/i]
    ,["work-management",/工作管理|项目管理|任务管理|work management|project management|task management/i]
    ,["assistant",/助手|助理|assistant/i]
  ];
  const goal = goals.find(([,pattern]) => pattern.test(title))?.[0];
  return goal ? { tool, goal, key: `${tool}|${goal}` } : null;
}

/** Presentation projection only. Source facts and parent Event identities stay intact. */
export function buildPracticeTopics<T extends PracticeParent>(items: T[], options: { eligibleOnly?: boolean; includeRejected?: boolean } = {}) {
  const groups = new Map<string,{ identity: NonNullable<ReturnType<typeof practiceTopicIdentity>>; parents: T[]; links: PracticeLink[] }>();
  for (const parent of items) for (const link of parent.practicalEvidenceLinks ?? []) {
    const identity = practiceTopicIdentity(link);
    if (!identity || !link.originalUrl || !link.materialQuality?.eligible || !["TUTORIAL","EXPERIENCE","USE_CASE","WORK_IMPACT"].includes(link.expansionType)) continue;
    const group = groups.get(identity.key) ?? {identity,parents:[],links:[]};
    group.parents.push(parent); group.links.push({...link,parentEventId:link.parentEventId ?? parent.eventId,parentOpcStatus:link.parentOpcStatus ?? parent.opcValue.status}); groups.set(identity.key,group);
  }
  return [...groups.values()].flatMap(group => {
    const links = [...new Map(group.links.map(link => [link.originalUrl,link])).values()];
    const lead = links.find(link => link.expansionType === "TUTORIAL" && evaluatePracticeSubject(link).eligible) ?? links.find(link => evaluatePracticeSubject(link).eligible) ?? (options.includeRejected ? links[0] : undefined);
    if (!lead?.title) return [];
    const parent = group.parents.find(item => item.eventId === lead.parentEventId)!;
    const origins = new Set(links.map(link => (link.originKey ?? link.sourceName).normalize("NFKC").toLocaleLowerCase()));
    const projected = { ...parent, title:lead.title, excerpt:lead.excerpt ?? null, originalUrl:lead.originalUrl,
      presentation:{...parent.presentation,displayTitleZh:lead.presentation?.displayTitleZh ?? lead.title,displaySummaryZh:lead.presentation?.displaySummaryZh ?? lead.excerpt ?? null},
      practicalEvidenceLinks:[lead,...links.filter(link => link !== lead)],
      practiceTopic:{...group.identity,parentEventIds:[...new Set(group.parents.map(item => item.eventId))]},
      coverage:{...parent.coverage,practicalEvidenceCount:links.length,actionablePracticalEvidenceCount:links.length,actionablePracticalOriginCount:origins.size,actionablePracticalTypeCount:new Set(links.map(link => link.expansionType)).size}
    };
    const reasons = [
      ...(!evaluatePracticeSubject(projected).eligible ? [evaluatePracticeSubject(projected).reason] : []),
      ...(links.length<2?["INSUFFICIENT_ACTIONABLE_EVIDENCE"]:[]),
      ...(origins.size<2?["INSUFFICIENT_INDEPENDENT_ORIGINS"]:[]),
      ...(projected.coverage.actionablePracticalTypeCount<2?["INSUFFICIENT_PRACTICE_TYPES"]:[])
    ];
    return (options.includeRejected || (options.eligibleOnly === false ? origins.size >= 2 : isWorthPracticingEligible(projected))) ? [{...projected,practiceEligibility:{eligible:reasons.length===0,reasons}}] : [];
  });
}

export function rebuildVisiblePracticeTopic<T extends {eventId:string}>(item:T, visible:(id:string)=>boolean): T[] {
  const topic = item as T & PracticeParent & {practiceTopic?:unknown};
  if (!topic.practiceTopic || !Array.isArray(topic.practicalEvidenceLinks)) return visible(item.eventId) ? [item] : [];
  const parents = topic.practicalEvidenceLinks.filter(link => visible(link.parentEventId ?? item.eventId)).map(link => ({
    ...topic,eventId:link.parentEventId ?? item.eventId,opcValue:{...topic.opcValue,status:link.parentOpcStatus ?? topic.opcValue.status},practicalEvidenceLinks:[link]
  }));
  return buildPracticeTopics(parents).map(projected => ({...item,...projected}));
}
