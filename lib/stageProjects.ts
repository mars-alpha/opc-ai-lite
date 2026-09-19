export type StageProject = {
  slug: string;
  title: string;
  stages: string;
  stageRange: string;
  summary: string;
  goal: string;
  deliverables: string[];
  acceptance: string[];
  duration: string;
  difficulty: string;
  practiceId?: string;
};

export const stageProjects: StageProject[] = [
  {
    slug: "personal-knowledge-assistant",
    title: "个人知识助手",
    stages: "Stage 1–2",
    stageRange: "AI Literacy → AI Worker",
    summary: "用自己的资料搭建一个可检索、可总结、可持续维护的个人知识助手。",
    goal: "把“理解 RAG + 会用 AI”组合成一个真实可用的小项目。",
    deliverables: ["整理一组真实资料", "设计知识分类与检索方式", "完成 5 个真实问答测试", "记录一次失败案例并优化"],
    acceptance: ["回答能够引用资料中的事实", "能够区分资料内与资料外问题", "至少完成一次人工复核", "形成可复用的使用说明"],
    duration: "2–4 小时",
    difficulty: "入门项目",
    practiceId: "practice_stage_personal_knowledge_assistant"
  },
  {
    slug: "content-ops-workflow",
    title: "内容运营工作流",
    stages: "Stage 3–4",
    stageRange: "AI Workflow → AI Growth",
    summary: "把选题、研究、生成、审核、发布准备与复盘串成一条可重复的 AI 工作流。",
    goal: "从“单次用 AI 写内容”升级到“设计一条可持续运行的内容流程”。",
    deliverables: ["定义内容输入与目标受众", "设计至少 5 个流程节点", "加入人工审核节点", "输出一次完整内容成品"],
    acceptance: ["每个节点都有明确输入输出", "关键风险点保留人工确认", "工作流可以重复执行", "完成一次数据或质量复盘"],
    duration: "4–6 小时",
    difficulty: "进阶项目"
  },
  {
    slug: "ai-solution-design",
    title: "AI 产品方案设计",
    stages: "Stage 5–6",
    stageRange: "AI Solution Builder → FDE",
    summary: "从真实业务问题出发，完成问题定义、方案、原型、评估与落地路径。",
    goal: "训练从“做功能”到“解决业务问题”的完整解决方案能力。",
    deliverables: ["问题与用户场景定义", "Baseline 与目标指标", "MVD / Prototype", "Evaluation 与 Adoption 方案"],
    acceptance: ["问题真实且可验证", "方案明确说明 AI 的角色", "存在结果评价标准", "包含落地与复用路径"],
    duration: "1–2 天",
    difficulty: "综合项目"
  }
];

export function getStageProject(slug: string) {
  return stageProjects.find((project) => project.slug === slug);
}
