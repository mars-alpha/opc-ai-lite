import { COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES } from "../../lib/learning/course-builder";

export const meetingActionListIntroPreview = {
  situation: "会议开完了，大家都说了很多事，但第二天最容易发生什么？",
  approaches: [
    {
      label: "只有会议摘要",
      text: "记录讨论了什么，但谁要做什么、什么时候完成仍然不清楚。"
    },
    {
      label: "可执行行动清单",
      text: "把每个行动、负责人、截止时间和未决问题单独整理出来。"
    }
  ],
  comparison: [
    {
      term: "摘要",
      meaning: "帮助回顾发生了什么"
    },
    {
      term: "行动清单",
      meaning: "帮助下一步真正执行"
    }
  ],
  takeaway: "一份好的会议整理，不只是“记下来”，而是让下一步可以直接行动。"
} as const;

export const meetingActionListReferenceFill = {
  action:
    "完成新品落地页第一版，并把页面链接发到项目群供大家复核。",
  owner:
    "小林",
  deadline:
    "本周五 18:00 前",
  openIssue:
    "最终活动价格还未确认；由阿杰今天向销售负责人确认后同步。"
} as const;

export const meetingActionListBuildDraft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "APPROVED_KNOWLEDGE",
    sourceLabels: [
      "OPC Reviewed Knowledge：会议行动项结构",
      "OPC Reviewed Knowledge：任务可执行性检查"
    ],
    researchSummary:
      "已审核知识把可执行会议行动项归纳为四个最小信息：明确行动、明确负责人、明确时间、明确未决问题或依赖。课程只训练把讨论转成可执行结构，不要求学习项目管理理论。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    participation: {
      kind: "MINI_TASK",
      title: "把会议讨论变成下一步行动",
      instruction:
        "阅读给定会议记录，自己整理行动、负责人、截止时间和未决问题。先自己完成，再用本地检查确认是否达到可执行标准。",
      prompt: null,
      reflection:
        "重点不是写得多，而是别人看到你的行动清单后，是否知道“谁、做什么、什么时候完成、还有什么没确定”。"
    },
    sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
  },
  lessonSpec: {
    version: "1.0.0",
    courseSlug: "ai-literacy",
    lessonId: "meeting-action-list",
    title: "把会议记录整理成可执行行动清单",
    lessonType: "PRACTICE",
    learningObjectives: [
      "从一段会议记录中找出真正需要执行的行动。",
      "把负责人和截止时间写成别人可以直接执行的形式。",
      "把尚未决定的事情单独标成未决问题，而不是混进行动项。"
    ],
    knowledgePoints: [
      "行动项必须说明具体要完成什么，不能只写“跟进一下”或“继续推进”。",
      "负责人要具体到人或明确角色，避免写成“大家”“相关同事”。",
      "截止时间要能判断是否逾期，避免只写“尽快”“有空时”。",
      "尚未确定的条件、依赖或决策应进入未决问题，避免伪装成已经确定的行动。"
    ],
    prerequisites: [
      "会阅读简单的会议记录即可，不需要项目管理基础。"
    ],
    requiresExample: true,
    requiresCheck: true,
    practiceMode: "INDEPENDENT",
    realAiOperation: "NONE",
    realAiEvidence: "NONE",
    referenceAnswerEnabled: true,
    reviewEnabled: true,
    selfAssessmentEnabled: true,
    courseFeedbackEnabled: true,
    completionGates: ["CHECK", "PRACTICE"],
    steps: [
      {
        id: "explain",
        kind: "EXPLAIN",
        title: "会议记录为什么经常没人执行",
        objective: "建立一个直觉：记录讨论不等于形成下一步行动。"
      },
      {
        id: "example",
        kind: "EXAMPLE",
        title: "看一段讨论怎样变成行动清单",
        objective: "通过前后对比看清行动、负责人、时间和未决问题的区别。"
      },
      {
        id: "check",
        kind: "CHECK",
        title: "哪一条才是真正可执行的行动项？",
        objective: "判断行动项是否已经清楚到可以交给别人执行。"
      },
      {
        id: "practice",
        kind: "PRACTICE",
        title: "自己整理一份行动清单",
        objective: "从真实感会议记录中提取四个关键字段，并通过本地规则检查。"
      },
      {
        id: "review",
        kind: "REVIEW",
        title: "以后就用四个问题检查会议记录",
        objective: "形成可复用的会议行动项检查框架。"
      },
      {
        id: "capability",
        kind: "CAPABILITY",
        title: "你已经能把讨论转成下一步行动",
        objective: "明确这项能力可以立即用于工作会议、项目沟通和客户跟进。"
      }
    ],
    capabilityGain: [
      "能把会议里的讨论内容整理成可执行行动项。",
      "能快速发现缺负责人、缺截止时间或仍未决的事项。",
      "可以把同样的四字段结构用于项目会议、客户沟通和团队协作。"
    ],
    nextLessonValue:
      "下一步可以继续学习如何让 AI 根据原始会议记录辅助提取行动项，并人工复核结果。",
    accessPresentation: {
      showCourseContext: true,
      showLearningPathLink: true,
      inlineConversionCta: false
    }
  },
  content: {
    summary:
      "这是一节真正要动手的课：你会从一段会议记录中整理出一份别人可以直接执行的行动清单。",
    plainExplanation:
      "会议记录最常见的问题不是没写，而是写完以后不知道下一步谁做什么。实操时只检查四件事：行动、负责人、截止时间、未决问题。",
    whyItMatters:
      "如果行动项缺少负责人或时间，会议很容易停留在“大家都知道要做”，但没有人真正负责完成。",
    points: [
      "行动：下一步具体要完成什么。",
      "负责人：谁对这件事负责。",
      "截止时间：什么时候前要完成。",
      "未决问题：还有什么条件、依赖或决定没有确定。"
    ],
    content: [
      "把动词写具体，例如“完成落地页第一版”，而不是“继续推进页面”。",
      "负责人尽量写具体人名或明确角色。",
      "无法确认的价格、资源、审批等，不要假装已经确定，单独放进未决问题。"
    ],
    example: {
      title: "从一句会议讨论到可执行行动",
      situation:
        "会议里说：新品页这周要先做出来，小林负责，最好周五前发群里。价格还没定，阿杰今天去问销售。",
      before:
        "新品页继续推进，价格再确认。",
      after:
        "行动：完成新品落地页第一版并发项目群。负责人：小林。截止时间：本周五前。未决问题：最终活动价格未确认，由阿杰今天向销售确认。",
      result:
        "修改后，执行者不需要重新翻会议记录，就能直接知道要做什么；未确定的价格也没有被误当成已确认信息。"
    },
    mistakes: [
      "误区：写了动词就算行动项｜正确理解：行动还要具体到可判断是否完成。",
      "误区：负责人写“大家”也可以｜正确理解：责任人不明确时，任务通常不会真正落地。",
      "误区：截止时间写“尽快”就够了｜正确理解：时间必须能判断是否逾期。",
      "误区：未确定的事情也直接写进行动｜正确理解：先标为未决问题，并明确谁去确认。"
    ],
    related: [
      "会议摘要回答“发生了什么”，行动清单回答“接下来做什么”。",
      "项目任务通常还会增加优先级、状态等字段，但本课先掌握最小四字段。",
      "后续可以让 AI 辅助提取，但最终行动项仍需要人确认责任和时间。"
    ]
  },
  check: {
    id: "check_meeting_action",
    question: "下面哪一条最像真正可以执行的行动项？",
    options: [
      {
        value: "A",
        label: "大家继续推进新品页，尽快完成。"
      },
      {
        value: "B",
        label: "小林在本周五前完成新品落地页第一版，并把链接发到项目群。"
      },
      {
        value: "C",
        label: "新品页很重要，后面重点关注。"
      }
    ],
    correctValue: "B",
    explanation:
      "B 同时说明了具体行动、负责人和截止时间。A 的“大家 / 尽快”无法判断责任和是否逾期；C 只是态度，不是行动项。"
  },
  practice: {
    id: "practice_meeting_action_list",
    title: "从会议记录中整理行动清单",
    goal:
      "会议记录：新品活动下周上线。落地页由小林先做第一版，本周五前发群里。最终价格还没确认，阿杰今天去找销售负责人确认。活动素材由设计组在下周一前准备完。现在先整理其中一条完整行动项，并把未决问题单独写出来。",
    instructions: [
      {
        key: "action",
        label: "行动",
        prompt: "写清楚具体要完成什么，尽量包含可判断完成的结果。"
      },
      {
        key: "owner",
        label: "负责人",
        prompt: "填写这条行动由谁负责。"
      },
      {
        key: "deadline",
        label: "截止时间",
        prompt: "填写一个可以判断是否逾期的时间。"
      },
      {
        key: "openIssue",
        label: "未决问题",
        prompt: "写出目前还没有确定、需要进一步确认的事项。"
      }
    ],
    hints: [
      "先找会议记录里的具体人名和时间，不要自己编造。",
      "行动最好写成“完成什么结果”，不要只写“推进”。",
      "如果某件事还没确定，就放到未决问题，不要假装已经有答案。"
    ],
    rubric: [
      {
        key: "action",
        label: "行动具体",
        maxScore: 30,
        minScore: 18,
        example: "完成新品落地页第一版并发到项目群。"
      },
      {
        key: "owner",
        label: "负责人明确",
        maxScore: 20,
        minScore: 12,
        example: "小林"
      },
      {
        key: "deadline",
        label: "截止时间明确",
        maxScore: 20,
        minScore: 12,
        example: "本周五前"
      },
      {
        key: "openIssue",
        label: "未决问题分离",
        maxScore: 30,
        minScore: 18,
        example: "最终活动价格还未确认，由阿杰今天向销售负责人确认。"
      }
    ],
    passScore: 70
  },
  hints: [
    "先找动词：到底要完成什么。",
    "再找人名和时间。",
    "最后把仍未确定的事项单独拿出来。"
  ],
  referenceAnswer:
    "行动：完成新品落地页第一版，并把页面链接发到项目群供大家复核。\n负责人：小林\n截止时间：本周五 18:00 前\n未决问题：最终活动价格还未确认；由阿杰今天向销售负责人确认后同步。",
  review: [
    "行动：具体要完成什么？",
    "负责人：到底谁负责？",
    "截止时间：什么时候前完成？",
    "未决问题：还有什么没有确定，谁去确认？"
  ],
  selfAssessment: [
    "我能从会议讨论中找出真正的行动项。",
    "我能发现负责人或截止时间是否缺失。",
    "我能把未决问题和已经确定的行动分开。"
  ]
} as const;
