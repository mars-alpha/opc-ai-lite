# Foundation Catalog Metadata v1

Status: **COMPLETE_V1**  
Task: **CURRICULUM-004 — Foundation Catalog Metadata Completion**

## 1. Purpose

本文件定义 Track 01 / AI 基础认知的完整前端目录元数据。目标是让下一步 Catalog UI 可以一次展示 7 个 Stage / 28 节课程，同时严格区分“课程已进入 Curriculum”与“课程已经可以进入正式 Lesson Runtime”。

固定规则：

- F1-01～F1-04：`IN_PRODUCTION + COMING_SOON`
- 其余 24 节：`PLANNED + COMING_SOON`
- 当前没有任何 Foundation Lesson 标记为 `AVAILABLE`
- `PLANNED / BRIEF_READY / IN_PRODUCTION` 可以显示在目录，但不得进入空 Lesson 页面
- 只有 `AVAILABLE` 才允许跳转正式 Lesson Runtime
- 本文件是 Catalog planning metadata，不是 Production DB Source of Truth

## 2. Status labels

| curriculumStatus | UI label | Meaning |
| --- | --- | --- |
| PLANNED | 规划中 | 已进入正式 Curriculum，但尚未完成正式 Brief |
| BRIEF_READY | 准备中 | Formal Brief 已完成，可进入 Course Builder / 生产 |
| IN_PRODUCTION | 制作中 | 正在生成、Review 或正式化 |
| AVAILABLE | 已开放 | 正式课程已发布，可进入学习 |

| availability | UI label | Meaning |
| --- | --- | --- |
| LOCKED | 未解锁 | 已开放课程但因学习/权限条件暂不可进入 |
| COMING_SOON | 即将开放 | 尚未正式发布，目录可见但不可进入 |
| AVAILABLE | 开始学习 | 已发布且可进入 |

## 3. Stage metadata

| order | stageId | title | stagePromise | lessonCount |
| ---: | --- | --- | --- | ---: |
| 1 | foundation-1 | 认识 AI | 建立 AI、模型、训练与生成机制的基本世界观。 | 4 |
| 2 | foundation-2 | 理解模型怎么工作 | 看懂 Token、Context Window、幻觉与模型可靠性。 | 4 |
| 3 | foundation-3 | 学会和 AI 沟通 | 学会把任务、上下文、示例与反馈说清楚。 | 4 |
| 4 | foundation-4 | 理解 AI 的记忆与知识 | 分清 Memory、Knowledge Base、Search、RAG 与语义检索。 | 4 |
| 5 | foundation-5 | 理解 AI 如何连接外部世界 | 看懂 API、Structured Output、Tool 与 MCP 怎样让 AI 获得外部能力。 | 4 |
| 6 | foundation-6 | 理解 AI 的复用与执行方式 | 分清 Skill、Workflow、Automation、Agent 与 Human-in-the-loop。 | 6 |
| 7 | foundation-7 | 理解现代 AI 能力与边界 | 理解多模态、操作能力、安全、Evaluation 与自动决策边界。 | 6 |

Total: **7 stages / 28 lessons**

---

# 4. Stage 1 — 认识 AI

| order | lessonId | title | subtitle | learnerOutcome | type | min | status | availability | prerequisites | badge |
| ---: | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| 1 | foundation-ai-ml-generative-ai | AI、机器学习与生成式 AI 到底是什么 | 先分清 AI、机器学习和生成式 AI，不把所有“智能功能”都当成同一种东西。 | 能够判断一个常见产品能力属于规则程序、机器学习还是生成式 AI，并说出三者的核心区别。 | CONCEPT | 12 | IN_PRODUCTION | COMING_SOON | 无 | 基础必修 |
| 2 | foundation-llm-model-vs-product | 大语言模型是什么：Model 不等于 AI 产品 | 理解你正在使用的是一个 AI 产品，而真正负责语言生成的只是其中的 Model。 | 能够区分 Model、AI App 和平台功能，不再把“产品”与“模型”混成同一个概念。 | CONCEPT | 12 | IN_PRODUCTION | COMING_SOON | F1-01 | 基础必修 |
| 3 | foundation-training-inference | Training 与 Inference：模型是怎样“学会”再“使用”的 | 把“模型训练时学到什么”和“你现在问它问题时发生什么”分清楚。 | 能够解释 Training 与 Inference 的区别，并理解聊天时模型通常不是现场重新训练。 | CONCEPT | 12 | IN_PRODUCTION | COMING_SOON | F1-01,F1-02 | 基础必修 |
| 4 | foundation-generation-retrieval-rules | AI 为什么不是数据库：生成、检索与确定性规则的区别 | 学会判断一个答案应该让模型生成、从资料中查找，还是交给普通程序计算。 | 能够针对真实任务判断 Generation、Retrieval、Deterministic Logic 哪一种机制更适合。 | CONCEPT | 15 | IN_PRODUCTION | COMING_SOON | F1-01,F1-02,F1-03 | 基础必修 |

---

# 5. Stage 2 — 理解模型怎么工作

| order | lessonId | title | subtitle | learnerOutcome | type | min | status | availability | prerequisites | badge |
| ---: | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| 1 | foundation-token-generation | Token 与概率生成：AI 怎样一句句生成答案 | 看懂模型如何把输入拆成 Token，并一步步生成下一段内容。 | 能解释 Token 与概率生成的基本直觉，不再把 AI 回答理解成“直接查出整段答案”。 | CONCEPT | 12 | PLANNED | COMING_SOON | F1-02,F1-03 | 基础必修 |
| 2 | foundation-context-window | Context Window：模型一次到底能看到多少 | 理解模型的“眼前信息”有范围，资料越多不一定越好。 | 能判断长对话、长文件和大量资料为什么会受到 Context Window 限制。 | CONCEPT | 12 | PLANNED | COMING_SOON | F2-01 | 基础必修 |
| 3 | foundation-hallucination-knowledge-limits | 幻觉与知识边界：为什么 AI 说得像真的也可能错 | AI 可以表达得很自信，但表达流畅不等于事实正确。 | 能识别需要查证的事实型输出，并知道哪些信息不能只靠模型记忆。 | CONCEPT | 14 | PLANNED | COMING_SOON | F1-04,F2-01 | 基础必修 |
| 4 | foundation-model-reliability | 模型能力与可靠性：什么时候应该信、什么时候必须验证 | 不追求“永远正确”，而是学会按风险决定验证强度。 | 能根据任务风险、可验证性和错误成本判断 AI 结果需要怎样复核。 | APPLICATION | 16 | PLANNED | COMING_SOON | F2-02,F2-03 | 应用 |

---

# 6. Stage 3 — 学会和 AI 沟通

| order | lessonId | title | subtitle | learnerOutcome | type | min | status | availability | prerequisites | badge |
| ---: | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| 1 | foundation-prompt | Prompt：怎样把任务说清楚 | 把目标、背景、输入、限制和结果要求交代清楚，减少 AI 猜测。 | 能把模糊需求改写成 AI 更容易执行和检查的任务说明。 | APPLICATION | 18 | PLANNED | COMING_SOON | F2-04 | 应用 |
| 2 | foundation-task-context | Context：AI 当前到底看到了什么 | Prompt 只是你说的话，Context 是模型这次任务真正能看到的全部信息。 | 能区分 Prompt、对话历史、文件、系统信息和工具结果如何进入当前任务。 | CONCEPT | 14 | PLANNED | COMING_SOON | F2-02,F3-01 | 基础必修 |
| 3 | foundation-examples-structured-request | Example 与 Structured Request：复杂要求怎样表达更稳定 | 当文字说明不够时，用示例、结构和格式减少理解偏差。 | 能判断什么时候应该补示例、分字段说明或明确结果格式。 | APPLICATION | 16 | PLANNED | COMING_SOON | F3-01,F3-02 | 应用 |
| 4 | foundation-iteration-clarification | Iteration 与 Clarification：第一次不对，怎样继续和 AI 合作 | 不满意时不要从头重来，要找到偏差并补充真正缺失的信息。 | 能根据结果偏差继续追问、补 Context、要求澄清并逐轮改进。 | APPLICATION | 16 | PLANNED | COMING_SOON | F3-01,F3-03 | 应用 |

---

# 7. Stage 4 — 理解 AI 的记忆与知识

| order | lessonId | title | subtitle | learnerOutcome | type | min | status | availability | prerequisites | badge |
| ---: | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| 1 | foundation-history-memory | Conversation History 与 Memory：AI 的“记住”有几种 | 当前对话、长期偏好和真正知识资料不是同一种“记忆”。 | 能区分 Conversation History 与长期 Memory，以及它们各自适合保存什么。 | CONCEPT | 14 | PLANNED | COMING_SOON | F3-02 | 基础必修 |
| 2 | foundation-knowledge-source-of-truth | Knowledge Base 与 Source of Truth：AI 应该相信哪份资料 | 资料很多不等于知识可靠，关键是明确哪份信息才是正式事实源。 | 能为一个业务知识问题指定可信 Source of Truth，并理解 Knowledge Base 的作用。 | CONCEPT | 14 | PLANNED | COMING_SOON | F4-01 | 基础必修 |
| 3 | foundation-search-rag | Search 与 RAG：AI 怎样先找资料再回答 | 先找到相关资料，再把证据交给模型组织回答。 | 能解释 Retrieval → Context → Answer 的基本流程，并区分 Search、RAG 与 Memory。 | CONCEPT | 16 | PLANNED | COMING_SOON | F4-02,F2-03 | 基础必修 |
| 4 | foundation-embedding-vector-search | Embedding 与 Vector Search：为什么系统能“按意思”找资料 | 不只按关键词匹配，还能按语义相似度寻找相关内容。 | 能解释 Embedding 与 Vector Search 的直觉，并知道语义相似不等于事实一定正确。 | CONCEPT | 14 | PLANNED | COMING_SOON | F4-03 | 进阶基础 |

---

# 8. Stage 5 — 理解 AI 如何连接外部世界

| order | lessonId | title | subtitle | learnerOutcome | type | min | status | availability | prerequisites | badge |
| ---: | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| 1 | foundation-api | API：AI 产品怎样和其他系统交换信息 | AI 产品不是孤岛，API 让系统之间可以按约定交换请求和结果。 | 能理解 API 的 request/response 直觉，并区分 Model 与外部系统连接层。 | CONCEPT | 14 | PLANNED | COMING_SOON | F1-02,F3-02 | 基础必修 |
| 2 | foundation-structured-output-schema | Structured Output 与 Schema：为什么系统不能只接收一段自然语言 | 人可以读自由文本，系统更需要稳定字段和明确结构。 | 能解释 Structured Output 和 Schema 为什么是 AI 进入系统流程的重要基础。 | CONCEPT | 14 | PLANNED | COMING_SOON | F5-01 | 基础必修 |
| 3 | foundation-function-calling-tool-use | Function Calling 与 Tool Use：AI 怎样调用外部能力 | 模型可以决定“需要做什么”，Tool 才真正提供搜索、查询或执行能力。 | 能区分文本生成、Function Calling 与 Tool Use，并判断什么时候需要外部能力。 | CONCEPT | 16 | PLANNED | COMING_SOON | F5-01,F5-02 | 基础必修 |
| 4 | foundation-mcp | MCP：为什么 AI 需要统一连接工具与资源 | 当工具和数据越来越多，AI 需要更标准的方式发现和使用外部能力。 | 能解释 MCP 与 API、Tool 的关系，以及它解决的连接标准化问题。 | CONCEPT | 16 | PLANNED | COMING_SOON | F5-03 | 基础必修 |

---

# 9. Stage 6 — 理解 AI 的复用与执行方式

| order | lessonId | title | subtitle | learnerOutcome | type | min | status | availability | prerequisites | badge |
| ---: | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| 1 | foundation-skill | Skill：把可复用的方法交给 AI | 不必每次重新教，把经过验证的方法保存下来重复使用。 | 能区分 Prompt、Skill 与 Tool，并判断一个任务是否值得沉淀成 Skill。 | CONCEPT | 16 | PLANNED | COMING_SOON | F3-01,F5-03 | 基础必修 |
| 2 | foundation-workflow | Workflow：从一次任务变成可重复流程 | 把多个步骤、输入输出和检查点连起来，形成稳定工作方式。 | 能解释 Workflow 的基本结构，并区分一次性任务和可重复流程。 | CONCEPT | 16 | PLANNED | COMING_SOON | F6-01,F5-03 | 基础必修 |
| 3 | foundation-automation | Automation：什么值得自动，什么不应该自动 | 自动化不是越多越好，稳定、可逆和风险可控才值得自动。 | 能根据规则稳定性、可逆性和错误成本判断一个步骤是否适合自动化。 | APPLICATION | 18 | PLANNED | COMING_SOON | F6-02,F2-04 | 应用 |
| 4 | foundation-agent | Agent：从固定流程到动态决策循环 | Agent 不只是“更聪明的聊天”，而是会根据目标和结果决定下一步。 | 能解释 Agent 的 Goal、State、Observe、Decide、Act、Stop 基本循环。 | CONCEPT | 18 | PLANNED | COMING_SOON | F5-03,F6-01,F6-02 | 基础必修 |
| 5 | foundation-workflow-vs-agent | Workflow 与 Agent：什么时候用固定流程，什么时候需要动态决策 | 不是所有流程都需要 Agent，能固定就不要为了“智能”增加复杂度。 | 能根据任务变化程度、规则稳定性和风险选择 Workflow 或 Agent。 | APPLICATION | 18 | PLANNED | COMING_SOON | F6-02,F6-04 | 应用 |
| 6 | foundation-human-in-the-loop | Human-in-the-loop：为什么成熟 AI 系统不是“全自动” | 自动执行前要知道什么时候必须停下来让人确认。 | 能识别需要人工审批、异常升级或最终确认的高风险步骤。 | CONCEPT | 16 | PLANNED | COMING_SOON | F6-03,F6-04 | 基础必修 |

---

# 10. Stage 7 — 理解现代 AI 能力与边界

| order | lessonId | title | subtitle | learnerOutcome | type | min | status | availability | prerequisites | badge |
| ---: | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| 1 | foundation-multimodal | Multimodal：文字、图片、语音、视频怎样进入同一个 AI 系统 | 现代 AI 已经不只处理文字，不同模态可以一起成为任务输入和输出。 | 能解释 Multimodal 的基本概念，并判断不同任务更适合哪种输入输出形式。 | CONCEPT | 14 | PLANNED | COMING_SOON | F1-02,F3-02 | 基础必修 |
| 2 | foundation-media-capabilities | AI 图像、语音与视频：生成与理解分别能做什么 | 图像、语音和视频既可以被 AI 理解，也可以由 AI 生成，但能力边界不同。 | 能为常见工作任务选择图像、语音或视频理解/生成能力。 | APPLICATION | 18 | PLANNED | COMING_SOON | F7-01 | 应用 |
| 3 | foundation-coding-browser-computer-use | Coding、Browser 与 Computer Use：AI 怎样从回答走向操作 | 写代码、浏览网页和操作界面是三种不同层次的 AI 执行能力。 | 能区分 Coding、Browser Research 与 Computer Use，并理解它们各自的风险和适用场景。 | CONCEPT | 16 | PLANNED | COMING_SOON | F5-03,F7-01 | 进阶基础 |
| 4 | foundation-privacy-security-permissions | Privacy、Security 与 Permissions：哪些数据和动作不能随便交给 AI | AI 能处理数据不代表它应该获得所有数据和权限。 | 能识别敏感信息、高权限操作和需要限制访问的典型场景。 | CONCEPT | 16 | PLANNED | COMING_SOON | F5-01,F6-06 | 基础必修 |
| 5 | foundation-evaluation | Evaluation 基础：怎样知道 AI 结果真的可用 | “看起来不错”不是验收标准，要检查事实、任务完成度和稳定性。 | 能使用一套基础标准判断 AI 结果是否完成任务、是否可靠、是否值得继续使用。 | APPLICATION | 18 | PLANNED | COMING_SOON | F2-04,F6-03 | 应用 |
| 6 | foundation-ai-decision-boundary | AI 决策边界：什么事情不应该直接交给 AI 自动决定 | 能生成建议不等于应该拥有最终决定权。 | 能识别资金、权限、发布、承诺等需要人工或 Core System 最终控制的动作。 | APPLICATION | 18 | PLANNED | COMING_SOON | F6-06,F7-04,F7-05 | 应用 |

---

# 11. Catalog behavior rules

下一步 `LEARNING-CATALOG-001` 必须遵守：

1. Catalog 展示 7 Stage / 28 Lesson 的完整学习路径。
2. Stage 顺序和 Lesson 顺序以本文件为准。
3. F1-01～F1-04 显示“准备中 / 即将开放”。
4. 其余 24 节显示“规划中 / 即将开放”。
5. 所有 `COMING_SOON` 课程不可进入空 Lesson Runtime。
6. 当前没有任何 Foundation Lesson 可以显示“开始学习”。
7. Catalog 可以显示 prerequisites，但普通 Foundation 浏览不需要强制隐藏后续课程。
8. `lessonType` 前端建议映射：
   - CONCEPT → 理解
   - APPLICATION → 应用
   - PRACTICE → 实操
   - PROJECT → 项目
9. 预计时长是目录规划值，正式课程 Human Review 后允许校正。
10. 不得从旧 `lib/courses.ts` 补齐或覆盖本 Catalog Metadata。
