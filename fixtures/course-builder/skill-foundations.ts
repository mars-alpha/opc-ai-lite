import { COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES } from "../../lib/learning/course-builder";

export const skillFoundationsIntroPreview = {
  situation: "你每周都让 AI 整理会议记录，而且每次都要重复输入同一套要求。",
  approaches: [
    {
      label: "临时做法",
      text: "每次重新说明要找决定、负责人、截止时间和待解决问题。"
    },
    {
      label: "可复用做法",
      text: "把这套步骤保存下来，下次处理同类会议记录时直接继续用。"
    }
  ],
  comparison: [
    {
      term: "Prompt（提示词）",
      meaning: "解决这一次怎么做"
    },
    {
      term: "Skill（技能）",
      meaning: "解决以后同类事情怎么做"
    }
  ],
  takeaway: "真正值得做成 Skill 的，不是“重要的任务”，而是“会重复、而且希望稳定执行的方法”。"
} as const;

export const skillFoundationsBuildDraft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "RESEARCH_PACKET",
    sourceLabels: [
      "OpenAI Academy：Using skills（2026-04-10）",
      "OpenAI API 中文文档：技能",
      "OpenAI Developers：构建技能"
    ],
    researchSummary:
      "公开资料把技能描述为可复用的工作流程或指令集合，可包含配套资料与脚本，用来减少重复解释并提高同类任务的一致性。课程因此把技能讲成“把一套反复使用的方法保存下来交给 AI”，同时明确不同 AI 产品对技能的实现和名称可能不同。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    conceptMasteryBeforePractice: true,
    participation: {
      kind: "COPY_TO_AI",
      title: "现在就把一套做法交给你的 AI",
      instruction:
        "把下面这段话复制到你正在使用的 AI 软件中。你用什么 AI 都可以。执行后观察：它是不是开始按照一套固定步骤工作，而不是只回答一个临时问题。",
      prompt:
        "以后我发给你一段会议记录时，请固定按这 4 步处理：1. 找出已经确定的决定；2. 找出每个负责人；3. 找出截止时间；4. 列出仍未解决的问题。最后用“决定 / 负责人 / 截止时间 / 待解决问题”四个栏目输出。",
      reflection:
        "如果下一次再处理会议记录，你还希望 AI 沿用这套步骤，那么你已经体会到“可复用方法”的价值。这就是理解技能最重要的一步。"
    },
    sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
  },
  lessonSpec: {
    version: "1.0.0",
    courseSlug: "ai-literacy",
    lessonId: "skill-foundations",
    title: "Skill（技能）是什么：把常用方法教给 AI",
    lessonType: "CONCEPT",
    learningObjectives: [
      "用自己的话解释什么是技能，以及它为什么适合重复任务。",
      "区分一次性的提示词、可调用的工具、可复用的技能和负责多步行动的智能体。",
      "看到一个重复 AI 任务时，能判断它是否值得沉淀成一套可复用方法。"
    ],
    knowledgePoints: [
      "技能可以理解为交给 AI 的一套可重复使用的做事方法，通常包含步骤、规则、输出要求和必要资料。",
      "Prompt（提示词）通常解决当前一次任务；Skill（技能）把反复验证过的方法保存下来，供以后继续使用。",
      "Tool（工具）提供能力，Skill 规定做法，Agent（智能体）可以在完成目标时组合多种工具和技能。",
      "不同 AI 产品对技能的名称和实现可能不同，因此课程学习的是通用思想，而不是绑定某一个 AI 软件。"
    ],
    prerequisites: [
      "会向 AI 软件输入问题或要求即可，不需要编程基础。"
    ],
    requiresExample: true,
    requiresCheck: true,
    practiceMode: "NONE",
    realAiOperation: "NONE",
    realAiEvidence: "NONE",
    referenceAnswerEnabled: false,
    reviewEnabled: true,
    selfAssessmentEnabled: true,
    courseFeedbackEnabled: true,
    completionGates: ["CHECK"],
    steps: [
      {
        id: "explain",
        kind: "EXPLAIN",
        title: "先从一个重复的小麻烦开始",
        objective: "从日常重复使用 AI 的场景理解为什么需要保存一套做事方法。"
      },
      {
        id: "example",
        kind: "EXAMPLE",
        title: "亲手让 AI 按固定方法工作一次",
        objective: "通过复制一段方法到自己的 AI 软件，直接感受“可复用方法”和临时提问的区别。"
      },
      {
        id: "check",
        kind: "CHECK",
        title: "你会把哪一种任务变成技能？",
        objective: "用生活化场景判断什么任务适合沉淀为可复用方法。"
      },
      {
        id: "practice",
        kind: "PRACTICE",
        title: "把方法交给你的 AI 试一次",
        objective: "亲手复制一套固定方法到自己正在使用的 AI 软件，观察它如何按步骤工作。"
      },
      {
        id: "review",
        kind: "REVIEW",
        title: "用一句话分清四个概念",
        objective: "用中文复盘提示词、工具、技能和智能体各自解决什么问题。"
      },
      {
        id: "capability",
        kind: "CAPABILITY",
        title: "你已经会判断什么时候值得做成技能",
        objective: "把概念转化成以后选择 AI 用法时可以直接使用的判断能力。"
      }
    ],
    capabilityGain: [
      "遇到重复 AI 任务时，能判断是否值得把做法保存成一套可复用方法。",
      "不再把提示词、工具、技能和智能体混成同一个概念。"
    ],
    nextLessonValue:
      "下一步可以继续理解智能体如何为了一个目标组合模型、工具、技能和上下文信息。",
    accessPresentation: {
      showCourseContext: true,
      showLearningPathLink: true,
      inlineConversionCta: false
    }
  },
  content: {
    summary:
      "你不需要懂程序。先用一个重复工作的例子，亲手体验“把一套做法保存下来，让 AI 下次继续照着做”是什么意思。",
    plainExplanation:
      "假设你每周都把会议记录交给 AI，每次都要重新说一遍：“先找决定，再找负责人，再找截止时间，最后列出未解决的问题。”如果这套做法已经证明很好用，就没必要每次重新解释。把这套方法保存成可以重复使用的工作流程，就是 Skill（技能）最容易理解的方式。",
    whyItMatters:
      "学会技能，不是为了多记一个专业名词，而是为了让 AI 从“每次都要重新教”变成“已经知道这类事情应该怎么做”。以后无论你用哪一种 AI 软件，只要它支持类似的可复用工作流程，你都能理解它在解决什么问题。",
    points: [
      "一次提示词：告诉 AI 这一次怎么做。",
      "技能：把以后还会反复使用的方法保存下来。",
      "工具：让 AI 有能力去搜索、读文件、查数据或执行操作。",
      "智能体：为了一个目标，自己决定下一步该用什么信息、工具或技能。"
    ],
    content: [
      "先不要背定义。你只要记住一个问题：这件事以后还会不会重复做？如果答案是“会”，而且每次都希望 AI 按类似步骤完成，就值得考虑把方法保存下来。",
      "技能不一定是一段很长的文字。它可以包含操作步骤、输出格式、判断规则、参考资料，甚至可重复执行的脚本。不同 AI 软件会用不同方式实现，但核心目的都是减少重复说明。",
      "也不是所有东西都要做成技能。像固定公式计算、权限判断这类结果必须完全确定的事情，更适合普通程序。技能更适合需要理解文字、整理内容、分类、生成和综合判断的重复任务。",
      "你现在不需要学习技能文件怎么写，也不需要记住任何系统架构。基础阶段只需要会判断：这是一次性的要求，还是一套以后还想继续使用的方法。"
    ],
    example: {
      title: "每周整理会议记录：从重复解释到保存一套方法",
      situation:
        "你每周都会把会议记录交给 AI，希望得到相同结构的整理结果。",
      before:
        "每次都重新告诉 AI：找出决定、负责人、截止时间和未解决问题；有时还会漏掉其中一项。",
      after:
        "把这套步骤固定成一套可重复使用的方法。下一次处理同类会议记录时，直接沿用这套方法。",
      result:
        "你少了一次重复解释，输出也更稳定。这种“把已经验证过的方法留下来继续用”的思路，就是技能最核心的价值。"
    },
    mistakes: [
      "误区：Skill 就是一句很长的 Prompt｜正确理解：关键不是长度，而是这套方法能不能稳定重复使用。",
      "误区：所有任务都应该做成 Skill｜正确理解：一次性任务通常直接说明就够了，重复任务才值得沉淀。",
      "误区：Skill 就是 Tool｜正确理解：Tool 解决“能做什么”，Skill 更关注“按什么方法做”。",
      "误区：Skill 就是 Agent｜正确理解：Agent 可以组合多个 Skill，但它们不是同一个东西。"
    ],
    related: [
      "前置：会向 AI 软件提出清楚的要求。",
      "关联：接口、工具、模型上下文协议与智能体。",
      "后续：智能体怎样组合工具、技能和上下文信息完成多步任务。"
    ]
  },
  check: {
    id: "check_skill_boundary",
    question:
      "你每周都要把客户反馈交给 AI，并希望它固定分成“问题、原因、紧急程度、建议动作”四部分。下面哪种做法最接近“技能”的思路？",
    options: [
      {
        value: "A",
        label: "每周重新打一遍同样的要求"
      },
      {
        value: "B",
        label: "把这套分类步骤和输出格式保存成以后可以重复使用的方法"
      },
      {
        value: "C",
        label: "换一个更贵的 AI 模型"
      },
      {
        value: "D",
        label: "让 AI 自己修改公司的客户权限"
      }
    ],
    correctValue: "B",
    explanation:
      "关键不是模型贵不贵，也不是让 AI 获得更多权限，而是把已经反复使用的方法保存下来，下次继续沿用。"
  },
  practice: null,
  hints: [
    "先问自己：这个任务以后会不会重复出现？",
    "再问：我是不是希望 AI 下一次继续按照相似步骤和格式完成？"
  ],
  referenceAnswer: null,
  review: [
    "提示词：这一次你希望 AI 怎么做。",
    "技能：以后遇到同类任务时，继续沿用的一套方法。",
    "工具：让 AI 获得搜索、读取、查询或执行等能力。",
    "智能体：围绕目标决定下一步做什么，并组合需要的信息、工具和技能。"
  ],
  selfAssessment: [
    "我能用“会议记录”的例子向别人解释什么是技能。",
    "我能判断一个重复 AI 任务是否值得保存成可复用方法。",
    "我知道技能不等于工具，也不等于智能体。"
  ]
} as const;
