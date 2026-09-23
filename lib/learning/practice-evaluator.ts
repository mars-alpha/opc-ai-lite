export type PracticeContent = Record<string, string>;

export type RubricCriterion = {
  key: string;
  label: string;
  maxScore: number;
  minScore: number;
  example: string;
};

export type CriterionResult = {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  minScore: number;
  reason: string;
  problem: string | null;
  suggestion: string;
  example: string;
};

export type EvaluationResult = {
  evaluatorType: "RULE" | "AI";
  score: number;
  passed: boolean;
  criteria: CriterionResult[];
  nextAction: string;
};

export type PracticeEvaluator = (input: {
  content: PracticeContent;
  rubric: RubricCriterion[];
  passScore: number;
}) => Promise<EvaluationResult>;

const taskBriefSuggestions: Record<string, string> = {
  goal: "写清要完成的具体结果，尽量让别人一眼知道任务结束时应该得到什么。",
  context: "补充使用者、背景和用途，让 AI 知道这个结果为什么要做、给谁用。",
  input: "说明 AI 可以依据哪些材料、数据或事实，不要让它自己猜数据来源。",
  constraint: "补充必须遵守和不能做的事，例如不能编造、字数、语气、范围或禁区。",
  output: "明确最终结构、长度或格式，例如表格、分点、固定栏目或字数范围。",
  owner: "写清一个具体负责人或明确角色；一个明确负责人就足够，不需要为了得分凑人数。",
  deadline: "填写一个可以判断是否逾期的具体时间，例如“本周五前”“9 月 25 日 18:00 前”。",
  action: "写成可以判断是否完成的具体行动，不要只写“推进”“跟进”。",
  openIssue: "把还没确定的条件、依赖或决策单独写出来，并说明谁去确认会更清楚。",
  projectGoal: "写清项目服务谁、要解决什么具体问题，以及希望改善什么结果。",
  triggerInput: "说明工作流什么时候启动，以及允许使用哪些真实输入资料。",
  workflowSteps: "按顺序写清普通规则、AI、人工分别做什么，并形成从触发到记录结果的闭环。",
  humanReview: "明确哪些高风险内容或动作必须由人确认，以及 AI 不允许自行决定什么。",
  successMetric: "列出可以真实观察或统计的指标，不要只写“效率更高”“体验更好”。",
  model_core: "指出哪些能力最接近模型本身的理解 / 生成，并写出判断依据。",
  product_layer: "指出哪些能力明显还需要搜索、外部资料、文件处理、权限等产品层能力，并写出理由。",
  uncertain: "指出哪些功能仅凭界面无法判断内部实现，并说明为什么需要保留不确定。"
};

const strongMarkers: Partial<Record<string, RegExp>> = {
  constraint: /(不要|不能|不得|必须|以内|不超过|禁止|仅限|只根据)/,
  output: /(表格|分点|列表|部分|栏目|字|格式|JSON|Markdown|标题)/,
  failure: /(失败|异常|停止|回退|重试|超时|拒绝)/,
  node_roles: /(AI|规则|人工|工具|模型|审批)/
};

const ownerInvalid = /^(大家|相关同事|相关人员|团队|有人|某人|待定|未知)$/;
const deadlineMarker = /(今天|明天|后天|本周|下周|周[一二三四五六日天]|星期[一二三四五六日天]|\d{1,2}[月/-]\d{1,2}|\d{1,2}[:：]\d{2}|前|之前|截止)/;

function semanticScore(key: string, value: string, maxScore: number): number | null {
  const text = value.trim();
  if (!text) return 0;

  if (key === "owner") {
    return ownerInvalid.test(text) ? Math.round(maxScore * 0.4) : maxScore;
  }

  if (key === "deadline") {
    return deadlineMarker.test(text) ? maxScore : Math.round(maxScore * 0.5);
  }

  if (key === "model_core") {
    const hasGeneration = /(生成|新文字|理解|内容生成)/.test(text);
    const hasReason = /(因为|体现|根据输入|核心能力)/.test(text);
    return hasGeneration && hasReason
      ? maxScore
      : hasGeneration || hasReason
        ? Math.round(maxScore * 0.6)
        : Math.round(maxScore * 0.3);
  }

  if (key === "product_layer") {
    const hasExternal = /(搜索|网页|外部信息|文件|权限|工具)/.test(text);
    const hasLayerReason = /(产品层|连接|管理|控制|系统)/.test(text);
    return hasExternal && hasLayerReason
      ? maxScore
      : hasExternal || hasLayerReason
        ? Math.round(maxScore * 0.6)
        : Math.round(maxScore * 0.3);
  }

  if (key === "uncertain") {
    const hasBoundaryExample = /(PDF|文件|记忆|长期偏好|偏好)/.test(text);
    const hasUncertainty = /(不确定|无法判断|不能判断|仅凭|界面|内部实现|进一步确认)/.test(text);
    return hasBoundaryExample && hasUncertainty
      ? maxScore
      : hasBoundaryExample || hasUncertainty
        ? Math.round(maxScore * 0.6)
        : Math.round(maxScore * 0.3);
  }

  return null;
}

function scoreText(key: string, value: string, maxScore: number) {
  const semantic = semanticScore(key, value, maxScore);
  if (semantic !== null) return semantic;

  const text = value.trim();
  let base = 0;
  if (!text) base = 0;
  else if (text.length < 8) base = 8;
  else if (text.length < 16) base = 14;
  else {
    const marker = strongMarkers[key];
    base = marker && marker.test(text) ? 20 : text.length >= 28 ? 20 : 18;
  }

  return Math.min(maxScore, Math.round((base / 20) * maxScore));
}

function suggestionFor(criterion: RubricCriterion) {
  return (
    taskBriefSuggestions[criterion.key] ??
    "补充更具体的“" +
      criterion.label +
      "”，让不了解背景的人也能直接判断是否满足要求。"
  );
}

export const rulePracticeEvaluator: PracticeEvaluator = async ({
  content,
  rubric,
  passScore
}) => {
  if (rubric.length === 0) throw new Error("INVALID_PRACTICE_RUBRIC");

  const criteria = rubric.map((criterion): CriterionResult => {
    const value = content[criterion.key] ?? "";
    const score = scoreText(criterion.key, value, criterion.maxScore);
    const meetsFloor = score >= criterion.minScore;

    return {
      key: criterion.key,
      label: criterion.label,
      score,
      maxScore: criterion.maxScore,
      minScore: criterion.minScore,
      reason: meetsFloor
        ? "这一项已经提供了足够的信息，具备基本可执行性。"
        : value.trim()
          ? "这一项已经有方向，但信息仍偏少，执行时仍需要猜测关键条件。"
          : "这一项目前为空，无法判断是否满足练习要求。",
      problem: meetsFloor
        ? null
        : value.trim()
          ? "描述过于简略，缺少能直接约束执行或验收的具体信息。"
          : "缺少这一项会让练习结果无法完整验收。",
      suggestion: suggestionFor(criterion),
      example: criterion.example
    };
  });

  const score = criteria.reduce((sum, item) => sum + item.score, 0);
  const floorsPassed = criteria.every((item) => item.score >= item.minScore);
  const passed = score >= passScore && floorsPassed;
  const weakest = [...criteria].sort(
    (a, b) => a.score / a.maxScore - b.score / b.maxScore
  )[0];

  return {
    evaluatorType: "RULE",
    score,
    passed,
    criteria,
    nextAction: passed
      ? "已经达到本次练习的通过标准，可以继续学习。"
      : "先修改 " + weakest.label + "。重点看“为什么”和“怎么改”，再重新提交。"
  };
};
