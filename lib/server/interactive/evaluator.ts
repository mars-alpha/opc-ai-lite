export type PracticeContent = {
  goal: string;
  context: string;
  input: string;
  constraint: string;
  output: string;
};

export type RubricCriterion = {
  key: keyof PracticeContent;
  label: string;
  maxScore: number;
  minScore: number;
  example: string;
};

export type CriterionResult = {
  key: keyof PracticeContent;
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

const suggestions: Record<keyof PracticeContent, string> = {
  goal: "写清要完成的具体结果，尽量让别人一眼知道任务结束时应该得到什么。",
  context: "补充使用者、背景和用途，让 AI 知道这个结果为什么要做、给谁用。",
  input: "说明 AI 可以依据哪些材料、数据或事实，不要让它自己猜数据来源。",
  constraint: "补充必须遵守和不能做的事，例如不能编造、字数、语气、范围或禁区。",
  output: "明确最终结构、长度或格式，例如表格、分点、固定栏目或字数范围。"
};

const strongMarkers: Partial<Record<keyof PracticeContent, RegExp>> = {
  constraint: /(不要|不能|不得|必须|以内|不超过|禁止|仅限|只根据)/,
  output: /(表格|分点|列表|部分|栏目|字|格式|JSON|Markdown|标题)/
};

function scoreText(key: keyof PracticeContent, value: string) {
  const text = value.trim();
  if (!text) return 0;
  if (text.length < 8) return 8;
  if (text.length < 16) return 14;
  const marker = strongMarkers[key];
  if (marker && marker.test(text)) return 20;
  return text.length >= 28 ? 20 : 18;
}

export const rulePracticeEvaluator: PracticeEvaluator = async ({
  content,
  rubric,
  passScore
}) => {
  const criteria = rubric.map((criterion): CriterionResult => {
    const value = content[criterion.key] ?? "";
    const score = Math.min(criterion.maxScore, scoreText(criterion.key, value));
    const meetsFloor = score >= criterion.minScore;

    return {
      key: criterion.key,
      label: criterion.label,
      score,
      maxScore: criterion.maxScore,
      minScore: criterion.minScore,
      reason: meetsFloor
        ? "这一项已经提供了足够的任务信息，具备基本可执行性。"
        : value.trim()
          ? "这一项已经有方向，但信息仍偏少，AI 仍需要自行猜测关键条件。"
          : "这一项目前为空，AI 无法从任务简报中获得对应信息。",
      problem: meetsFloor
        ? null
        : value.trim()
          ? "描述过于简略，缺少能直接约束执行的具体信息。"
          : "缺少这一项会让任务边界不完整。",
      suggestion: suggestions[criterion.key],
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
      ? "已经达到本次任务的通过标准。建议复制任务简报，到你常用的 AI 工具中实际验证一次。"
      : "先修改 " + weakest.label + "。重点看“为什么”和“怎么改”，再重新提交。"
  };
};

