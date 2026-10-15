import {evaluatePublicPracticeAccess} from "./public-practice-access";
export const PRACTICAL_ACTIONABILITY_VERSION = "practical-actionability-v1-deterministic";

// Classify the article, never its publisher: an aggregator can link a valid
// single-topic tutorial, while an original publisher can also issue a digest.
export function isMultiNewsRoundup(title: string | null | undefined) {
  const text = (title ?? "").normalize("NFKC");
  const sections = text.split(/[;；|｜]/).filter(part => part.trim().length > 5);
  const digest = /早知道|早报|晚报|新闻汇总|资讯汇总|每日资讯|新闻速递|daily\s+(?:news|digest)|news\s+roundup|weekly\s+digest/i.test(text);
  const buildingDigest = /^(?:如何|怎么|手把手|教程|how to|tutorial|build\b).*(?:搭建|制作|生成|工作流|build|create|workflow)/i.test(text);
  const newsSubjects = sections.flatMap(part => {
    if (/^(?:该|其|并|同时|支持|新增|the model|it\b)/i.test(part.trim())) return [];
    const match = part.trim().match(/^(.{2,50}?)(?:发布|上线|推出|宣布|融资|收购|\s+(?:launch\w*|releas\w*|announc\w*)\b)/i);
    return match ? [match[1].trim().toLowerCase()] : [];
  });
  return !buildingDigest && (digest || new Set(newsSubjects).size >= 2);
}

export function evaluatePracticeSubject(input: { title?: string | null; excerpt?: string | null; materialQuality?: {eligible:boolean} }) {
  const title = (input.title ?? "").normalize("NFKC");
  const text = `${title} ${input.excerpt ?? ""}`;
  if (isMultiNewsRoundup(title)) return { eligible: false, reason: "MULTI_NEWS_ROUNDUP" };
  const releaseAt = title.search(/发布|上线|推出|宣布|\b(?:announces?|released?|launches?)\b/i);
  const intentAt = title.search(/教程|如何|怎么用|手把手|实操|复现|搭建|用.+(?:制作|整理|生成|改写|剪辑|完成|自动)|tutorial|how to|walkthrough|build.+with/i);
  if (releaseAt >= 0 && (intentAt < 0 || releaseAt < intentAt)) return { eligible: false, reason: "RELEASE_NEWS_SUBJECT" };
  const operation = input.materialQuality?.eligible === true || /安装|配置|步骤|命令|节点|输入|导出|运行|部署|install|configure|command|step|input|export|deploy/i.test(text);
  const task = /制作|整理|生成|改写|剪辑|客服|投流|动画|视频|文章|资料|工作流|任务|生图|工作管理|助手|workflow|automate|pipeline|task|build|assistant|work management|how to remember|context engineering|agent memory/i.test(text);
  // A complete hands-on article need not advertise itself as a "tutorial".
  return { eligible: operation && task, reason: operation && task ? "CONCRETE_PRACTICE_SUBJECT" : "NO_CONCRETE_PRACTICE_SUBJECT" };
}

export function shouldExpandPractice(input: { title?: string | null; excerpt?: string | null; independentParticipants: number; lastAttemptAt: string | null }, now = Date.now()) {
  if (!evaluatePracticeSubject(input).eligible) return { eligible: false, reason: "NOT_PRACTICE_SUBJECT" };
  const attempted = input.lastAttemptAt ? Date.parse(input.lastAttemptAt) : null;
  if (attempted !== null && (!Number.isFinite(attempted) || now - attempted < 6 * 3600000)) return { eligible: false, reason: "SEARCH_COOLDOWN" };
  return { eligible: true, reason: "PRACTICE_DISCUSSION_EXPANSION" };
}

export type PracticalExpansionType = "EXPERIENCE" | "TUTORIAL" | "USE_CASE" | "WORK_IMPACT" | string;

export function isFormalPracticalEvidenceSource(input: {
  sourceEnabled: boolean;
  currentPortfolio: boolean;
  sourceUniverseRole: string | null;
  sourceReferenceOnly: boolean;
  rawReferenceOnly: boolean;
  signalOnly: boolean;
}) {
  if (!input.sourceEnabled || !input.currentPortfolio) return false;
  if (input.sourceUniverseRole === "DISCOVERY_AGGREGATOR") return false;
  const referenceLayer = input.sourceReferenceOnly || input.rawReferenceOnly || input.signalOnly;
  if (referenceLayer && input.sourceUniverseRole !== "CREATOR") return false;
  return true;
}

export function evaluatePracticalEvidenceActionability(input: {
  expansionType: PracticalExpansionType;
  title?: string | null;
  excerpt?: string | null;
}) {
  const text = [input.title ?? "", input.excerpt ?? ""].join(" ").normalize("NFKC");
  const procedural = /教程|指南|如何|怎么用|步骤|配置|操作|部署|安装|设置|运行|调用|接入|复现|实现|命令|代码|参数|workflow|tutorial|how to|guide|walkthrough|setup|configure|configuration|install|deploy|run|call|implement|implementation|command|code|step[- ]by[- ]step/i.test(text);
  const experience = /实测|体验|测试|试用|我用|我们用|实际使用|结果|表现|对比|benchmark|tested|testing|hands[- ]?on|experience|we used|i used|in practice|result|results|performance/i.test(text);
  const useCase = /使用案例|应用场景|工作流|用来|用于|帮助.*完成|任务|流程|use case|workflow|used for|use .* to|task|pipeline|automation|automate/i.test(text);
  const workImpact = /工作影响|效率|节省|岗位|团队|生产力|工作方式|工作流程|productivity|team|role|work impact|hours saved|time saved|workflow/i.test(text);
  const specificity = /\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?\s*(?:ms|s|sec|seconds?|min|minutes?|hours?|tokens?|gb|mb)|步骤|第\s*[一二三四五六七八九十0-9]+步|配置|命令|参数|benchmark|latency|throughput|accuracy|score/i.test(text);

  let actionable = false;
  let basis = "INSUFFICIENT_ACTION_DETAIL";
  if (input.expansionType === "TUTORIAL") {
    actionable = procedural || (text.length >= 120 && specificity);
    basis = actionable ? "TUTORIAL_PROCEDURAL_OR_SPECIFIC" : basis;
  } else if (input.expansionType === "EXPERIENCE") {
    actionable = experience && (specificity || procedural || useCase);
    basis = actionable ? "EXPERIENCE_WITH_RESULT_OR_OPERATION" : basis;
  } else if (input.expansionType === "USE_CASE") {
    actionable = useCase && (procedural || experience || specificity);
    basis = actionable ? "USE_CASE_WITH_TASK_AND_OPERATION_OR_RESULT" : basis;
  } else if (input.expansionType === "WORK_IMPACT") {
    actionable = workImpact && (useCase || experience || specificity);
    basis = actionable ? "WORK_IMPACT_WITH_CONCRETE_EFFECT" : basis;
  }

  if (!evaluatePublicPracticeAccess(input).eligible) {actionable=false;basis="HUMAN_OR_FOLLOW_ACCESS_REQUIRED";}
  return { version: PRACTICAL_ACTIONABILITY_VERSION, actionable, basis, signals: { procedural, experience, useCase, workImpact, specificity } };
}

export function isWorthPracticingEligible(item: { title?: string | null; excerpt?: string | null; materialQuality?: {eligible:boolean}; opcValue: { status: string }; coverage: {
  practicalEvidenceCount: number; actionablePracticalEvidenceCount?: number;
  actionablePracticalOriginCount?: number; actionablePracticalTypeCount?: number;
} }) {
  return evaluatePracticeSubject(item).eligible && item.coverage.practicalEvidenceCount > 0 &&
    (item.coverage.actionablePracticalEvidenceCount ?? 0) >= 1;
}
