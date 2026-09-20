export const memoryRagCheckSeed = {
  id: "check_memory_rag_source",
  type: "SINGLE_CHOICE" as const,
  question:
    "客服要根据经常更新、并且需要追溯来源的公司政策回答用户时，哪种机制更适合把相关资料取回给模型？",
  options: [
    { value: "MEMORY", label: "Memory（记忆）" },
    { value: "RAG", label: "RAG（检索增强生成）" },
    { value: "PROMPT", label: "只写更长的 Prompt" },
    { value: "TOKEN", label: "增加 Token 数量" }
  ],
  correctAnswer: "RAG",
  explanation:
    "RAG 会在回答前从外部知识源检索与当前问题相关的资料，更适合需要更新和追溯来源的知识。",
  required: true,
  order: 1,
  status: "PUBLISHED" as const
};

export const taskDecompositionPracticeSeed = {
  id: "practice_task_decomposition_nodes",
  title: "把一个重复任务拆成可检查的工作流节点",
  goal:
    "选择一个真实重复任务，拆成 4–7 个节点，并为关键节点说明输入输出、处理角色和失败处理。",
  instructions: [
    {
      key: "final_result",
      label: "最终结果",
      prompt: "这个工作流最终必须交付什么可判断完成的结果？"
    },
    {
      key: "workflow_nodes",
      label: "工作流节点",
      prompt: "按顺序写出 4–7 个节点，并说明每个节点的输入与输出。"
    },
    {
      key: "node_roles",
      label: "节点角色",
      prompt: "标出哪些节点由 AI / 规则 / 人工 / 工具处理，并说明至少一个判断节点。"
    },
    {
      key: "failure",
      label: "失败处理",
      prompt: "至少选择一个节点，写清失败、数据缺失或超时时应该停止、回退还是转人工。"
    }
  ],
  hints: [
    "先写最终交付结果，再倒推中间节点。",
    "生成与判断尽量分开，不要把所有动作塞进一个节点。",
    "至少保留一个人工或规则判断节点，并给失败情况明确出口。"
  ],
  submissionSchema: {
    kind: "STRUCTURED_TEXT_V1" as const,
    fields: [
      { key: "final_result", label: "最终结果", minLength: 8, maxLength: 3000 },
      { key: "workflow_nodes", label: "工作流节点", minLength: 16, maxLength: 6000 },
      { key: "node_roles", label: "节点角色", minLength: 8, maxLength: 3000 },
      { key: "failure", label: "失败处理", minLength: 8, maxLength: 3000 }
    ]
  },
  rubric: [
    {
      key: "final_result",
      label: "最终结果",
      maxScore: 25,
      minScore: 15,
      example: "例如：每周五输出一份已经过事实检查、可人工确认后发布的公众号周报。"
    },
    {
      key: "workflow_nodes",
      label: "工作流节点",
      maxScore: 25,
      minScore: 15,
      example: "例如：选题输入 → 资料检索 → 草稿 → 事实检查 → 人工审核 → 发布。"
    },
    {
      key: "node_roles",
      label: "节点角色",
      maxScore: 25,
      minScore: 15,
      example: "例如：草稿由 AI 生成，事实检查由规则 + 人工判断，发布由工具执行。"
    },
    {
      key: "failure",
      label: "失败处理",
      maxScore: 25,
      minScore: 15,
      example: "例如：资料不足时停止生成并转人工补充，不允许自动进入发布。"
    }
  ],
  passScore: 80,
  required: true,
  status: "PUBLISHED" as const
};

export const taskBriefRuntimeFixture = {
  schema: { kind: "TASK_BRIEF_V1" as const },
  content: {
    goal: "把本周项目会议记录整理成一份行动摘要。",
    context: "给项目负责人在明天例会前查看和安排后续工作。",
    input: "只依据会议记录、任务清单和已经确认的截止时间。",
    constraint: "不得补充原文没有的事实；不确定内容必须标记待确认。",
    output: "按事项、负责人、截止时间、风险四栏表格输出。"
  },
  rubric: [
    { key: "goal", label: "Goal", maxScore: 20, minScore: 12, example: "明确最终结果。" },
    { key: "context", label: "Context", maxScore: 20, minScore: 12, example: "明确使用场景。" },
    { key: "input", label: "Input", maxScore: 20, minScore: 12, example: "明确依据资料。" },
    { key: "constraint", label: "Constraint", maxScore: 20, minScore: 12, example: "明确不能编造。" },
    { key: "output", label: "Output", maxScore: 20, minScore: 12, example: "明确输出格式。" }
  ],
  passScore: 80
};

export const taskDecompositionRuntimeFixture = {
  schema: taskDecompositionPracticeSeed.submissionSchema,
  content: {
    final_result: "每周五生成一份可由负责人确认后发布的项目周报。",
    workflow_nodes:
      "项目记录输入 → 资料归类 → AI 生成草稿 → 规则检查关键字段 → 人工审核 → 发布工具执行。",
    node_roles:
      "资料归类用规则，草稿由 AI 生成，关键事实由规则检查，发布前由人工判断，发布由工具执行。",
    failure:
      "资料缺失或检查失败时必须停止流程并转人工补充；审核拒绝时回到草稿节点修改，不得直接发布。"
  },
  rubric: taskDecompositionPracticeSeed.rubric,
  passScore: taskDecompositionPracticeSeed.passScore
};
