# Track 01 — 28 Formal Candidates Six-step Audit v1

Status: **COMPLETE_AUDITED_V1**  
Task: **CURRICULUM-SIX-STEP-AUDIT-001-R1 — Track 01 28-Candidate Re-audit**  
Scope: **AI 基础认知 / product-level 28 formal candidates only**

## 1. Audit input boundary

本轮只审计产品负责人确认的 **28 个正式 AI 基础认知课程候选**。

明确排除历史 Runtime / UX 测试资产：
- `task-brief`
- `memory-rag`
- `writing-files`
- `task-decomposition`

这些资产曾用于 APPLICATION / CONCEPT / PRACTICE / Generic Runtime 验证，只能作为 UX / Runtime / content reference，不计入 Track 01 Curriculum candidate 数量。

旧文档中“28 / 32”并存属于规划文件与测试资产长期混杂后的事实漂移。后续课程目录只认本文件的 28-candidate audit input 与审计结果。

## 2. Six-step audit rule

每个候选只有同时满足以下条件，才 KEEP 为独立正式课：

1. EXPLAIN：有一个独立真实问题值得学；
2. EXAMPLE：有不可被相邻课替代的核心规律；
3. CHECK：能通过真实判断题检查理解；
4. PRACTICE：能完成一个最小动作 / 产物；
5. REVIEW：能留下 2–4 个长期可复用判断；
6. CAPABILITY：能形成后续课程可调用的新能力。

否则使用 MERGE / SUPPORTING_KNOWLEDGE / DEFER / SPLIT / REMOVE。

## 3. Canonical 28 formal candidates

### Group A — 先会正确使用 AI
1. AI 能帮什么、不能帮什么
2. 输入质量为什么影响结果
3. AI 为什么会说错 / Hallucination
4. AI 产品能力地图
5. Prompt：把任务说清楚
6. Context：给 AI 当前任务需要的信息
7. Iteration / Clarification：把第一版改到可用
8. Reliability Judgment：什么时候必须核验

### Group B — 理解模型与生成机制
9. Model vs AI Product
10. Training / Inference
11. Token / Probability Generation
12. Context Window

### Group C — Memory / Knowledge / RAG
13. Conversation History / Memory
14. Knowledge Base / Source of Truth
15. Search / RAG
16. Embedding / Vector Search

### Group D — 外部连接
17. API
18. Structured Output / Schema
19. Function Calling / Tool Use
20. MCP

### Group E — 复用与执行
21. Skill
22. Workflow / Automation
23. Agent / Workflow Boundary
24. Human-in-the-loop

### Group F — 现代能力与边界
25. Multimodal / Media Capabilities
26. Coding / Browser / Computer Use
27. Privacy / Security / Permissions
28. Evaluation / High-impact Decision Boundary

## 4. 28-candidate Six-step audit

| # | Candidate | Decision | Six-step verdict | Final home |
| ---: | --- | --- | --- | --- |
| 1 | AI 能帮什么、不能帮什么 | KEEP | 有独立任务分类问题；可让学习者给自己的任务做“适合 / 需核验 / 不适合”分类，形成第一项使用能力 | T1-01 |
| 2 | 输入质量为什么影响结果 | MERGE | Step 1/2 有价值，但 Step 4 最终仍是“把任务说清楚”；与 Prompt 的行动和能力结果重复 | T1-02 Prompt supporting |
| 3 | AI 为什么会说错 / Hallucination | MERGE | 原理必须讲，但独立 Practice 最终仍落到“识别并核验风险信息”；并入 Reliability 更完整 | T1-05 Reliability |
| 4 | AI 产品能力地图 | MERGE | 是建立世界观的重要解释层，但独立产物较弱；并入“AI 使用场景”与“Model vs Product”两端 | T1-01 / T1-06 |
| 5 | Prompt：把任务说清楚 | KEEP | 六步完整：模糊需求→结构规律→判断→重写真实任务→复盘→能写可执行任务说明 | T1-02 |
| 6 | Context | KEEP | 有独立问题“AI 缺什么信息”；可产出 Minimum Context Pack，后续所有工作应用复用 | T1-03 |
| 7 | Iteration / Clarification | KEEP | 有独立协作动作；可对真实初稿连续两轮修正，能力结果与 Prompt/Context 不同 | T1-04 |
| 8 | Reliability Judgment | KEEP | 可独立训练“事实性 / 时效性 / 风险 / 可验证性”判断，并产出 Verification Plan | T1-05 |
| 9 | Model vs AI Product | KEEP | 是 AI 世界模型核心边界；可拆解真实 AI 产品并判断哪些是模型、哪些是产品能力 | T1-06 |
| 10 | Training / Inference | MERGE | 对世界观重要，但独立 Practice 与可执行能力较弱；作为 Model 课解释“能力如何形成 / 当前使用发生什么” | T1-06 supporting |
| 11 | Token / Probability Generation | KEEP | 可解释结果变化、非固定答案与约束效果；可比较多次生成并判断波动来源 | T1-07 |
| 12 | Context Window | SUPPORTING_KNOWLEDGE | 必须理解容量有限，但实际行动仍属于 Context 取舍；数字/窗口机制不值得独立占一课 | T1-03 + T1-07 |
| 13 | Conversation History / Memory | KEEP | 可独立训练“什么应留在当前对话、什么适合长期记忆”，有明确分类 Practice | T1-08 |
| 14 | Knowledge Base / Source of Truth | KEEP | 与 Memory 不同：核心是“业务事实应该信哪份”；可为真实业务指定权威来源 | T1-09 |
| 15 | Search / RAG | KEEP | 有完整 Retrieval → Context → Answer 规律，可设计一个带证据的问答链 | T1-10 |
| 16 | Embedding / Vector Search | DEFER | 概念重要但普通基础路径的独立行动价值不足；语义检索直觉可在 RAG 中一句带过，工程细节进入 Technical RAG | Technical RAG |
| 17 | API | KEEP | 有独立系统连接问题；可画 Request → Response，并判断系统边界 | T1-11 |
| 18 | Structured Output / Schema | KEEP | 不是 API 的同义词；可把自由文本转成稳定字段并检查验证规则，后续 Workflow/FDE 高频复用 | T1-12 |
| 19 | Function Calling / Tool Use | KEEP | 可独立判断“回答 vs 调用外部能力”，并为任务定义 Tool 输入 / 输出 / 权限 | T1-13 |
| 20 | MCP | KEEP | 有独立连接标准化问题；可画 Host–MCP–Tool/Resource 关系并区别直接 API/Tool | T1-14 |
| 21 | Skill | KEEP | 可把重复语义方法沉淀成 Skill Brief；与 Prompt、Tool、Workflow 边界明确 | T1-15 |
| 22 | Workflow / Automation | KEEP | 两者在基础层共享同一能力链：把稳定方法变成重复流程，并判断哪些节点适合自动化；可产出最小 Workflow | T1-16 |
| 23 | Agent / Workflow Boundary | KEEP | 定义 Agent 后立即用于判断“固定流程还是动态决策”；定义与边界应在同一六步闭环完成 | T1-17 |
| 24 | Human-in-the-loop | MERGE | 独立概念重要，但最终能力是风险动作的审批/停止/升级；与 Privacy / Permissions / High-impact boundary 合并更完整 | T1-20 |
| 25 | Multimodal / Media Capabilities | KEEP | 可针对真实任务选择文字/图片/语音/视频输入输出，并产出多模态任务设计 | T1-18 |
| 26 | Coding / Browser / Computer Use | KEEP | 三者共同回答“AI 怎样从回答走向操作”，具有独立能力地图与风险判断，不应塞进 Multimodal | T1-19 |
| 27 | Privacy / Security / Permissions | KEEP | 可识别敏感数据、权限等级、可逆性与外部动作，形成安全边界能力 | T1-20 |
| 28 | Evaluation / High-impact Decision Boundary | MERGE | Evaluation 基础中的“结果是否可用”归 Reliability；高风险最终决定权归 Safety / HITL；拆开反而重复 | T1-05 + T1-20 |

## 5. Audit result

28 个正式候选经六步逐项检查后：

- **KEEP / final independent lessons: 20**
- **MERGE: 6**
- **SUPPORTING_KNOWLEDGE: 1**
- **DEFER: 1**
- **SPLIT: 0**
- **REMOVE: 0**

这次没有为了缩短目录 REMOVE 任何有长期价值的知识；知识不是消失，而是进入正确 Primary Home 或后续 Technical Track。

## 6. Final Track 01 course directory — 20 lessons

### Phase 1 — 先真正会用 AI
| ID | Lesson | Core capability |
| --- | --- | --- |
| T1-01 | AI 能帮什么，不能帮什么 | 能判断真实任务是否适合 AI、需要哪类 AI 能力 |
| T1-02 | Prompt：把任务说清楚 | 能把模糊需求变成清楚、可执行、可检查的任务说明 |
| T1-03 | Context：给 AI 足够但不过量的信息 | 能准备 Minimum Sufficient Context，并理解容量有限 |
| T1-04 | Iteration：把第一版结果改到可用 | 能针对偏差补信息、澄清、给标准并逐轮改进 |
| T1-05 | 结果可靠性：什么时候必须核验 | 能按事实、日期、风险、证据决定 Verification 强度 |

### Phase 2 — 理解 AI 为什么这样工作
| ID | Lesson | Core capability |
| --- | --- | --- |
| T1-06 | 模型与 AI 产品：你使用的到底是什么 | 能区分 Model / AI Product，并理解 Training / Inference 的基本关系 |
| T1-07 | Token 与概率生成：为什么 AI 每次答案会变化 | 能理解生成机制并管理结果波动 |

### Phase 3 — 理解 AI 的记忆与知识
| ID | Lesson | Core capability |
| --- | --- | --- |
| T1-08 | Conversation History 与 Memory：AI 到底“记住”什么 | 能决定临时上下文与长期记忆的归属 |
| T1-09 | Knowledge Base 与 Source of Truth：AI 应该相信哪份资料 | 能为业务事实指定稳定权威来源 |
| T1-10 | Search 与 RAG：AI 怎样先找证据再回答 | 能判断何时需要检索，并理解带证据问答链 |

### Phase 4 — 理解 AI 如何连接外部世界
| ID | Lesson | Core capability |
| --- | --- | --- |
| T1-11 | API：AI 产品怎样和其他系统交换信息 | 能理解 Request / Response 与系统连接边界 |
| T1-12 | Structured Output 与 Schema：怎样让系统稳定接收 AI 结果 | 能定义字段、结构与基础验证规则 |
| T1-13 | Function Calling 与 Tool Use：AI 怎样调用外部能力 | 能判断什么时候需要 Tool，并识别输入 / 输出 / 权限 |
| T1-14 | MCP：为什么 AI 需要统一连接工具与资源 | 能解释 MCP 与 API / Tool 的区别和价值 |

### Phase 5 — 理解 AI 的复用与执行
| ID | Lesson | Core capability |
| --- | --- | --- |
| T1-15 | Skill：把可复用的方法交给 AI | 能判断什么方法值得沉淀成 Skill，并定义 Skill Brief |
| T1-16 | Workflow 与 Automation：把一次方法变成可重复流程 | 能设计最小 Workflow，并判断哪些节点适合自动化 |
| T1-17 | Agent：什么时候才需要动态决策 | 能用 Goal / State / Observe / Decide / Act / Stop 理解 Agent，并选择 Workflow 或 Agent |

### Phase 6 — 理解现代 AI 能力与安全边界
| ID | Lesson | Core capability |
| --- | --- | --- |
| T1-18 | Multimodal：文字、图片、语音、视频怎样一起工作 | 能为真实任务选择合适输入 / 输出模态 |
| T1-19 | Coding、Browser 与 Computer Use：AI 怎样从回答走向操作 | 能区分生成代码、浏览研究与界面操作的能力和风险 |
| T1-20 | Privacy、Permissions 与 Human-in-the-loop：什么不能直接交给 AI | 能识别敏感数据、高权限、高风险动作，并设置人工确认 / Core Authority |

## 7. Knowledge preserved after merge

| Merged / deferred knowledge | Where learner still learns it |
| --- | --- |
| Input quality | T1-02 Prompt |
| Hallucination | T1-05 Reliability |
| Product capability map | T1-01 + T1-06 |
| Training / Inference | T1-06 |
| Context Window | T1-03 + T1-07 |
| Embedding / Vector Search intuition | T1-10 supporting; implementation in Technical RAG |
| HITL | T1-20 |
| Evaluation basics | T1-05 |
| High-impact decision boundary | T1-20 |

## 8. Why 20, not 17

17-course v1 over-merged several knowledge areas.

This re-audit restores three independently teachable capabilities:
- Knowledge Base / Source of Truth stays separate from Memory;
- Structured Output / Schema stays separate from API;
- Coding / Browser / Computer Use stays separate from Multimodal.

These topics each have their own learner problem, judgment rule, minimum action, reusable review framework and downstream capability, so they pass the six-step independent Lesson Gate.

## 9. Production rule after this audit

- Track 01 canonical course count = **20**.
- Do not continue using 17 as target.
- Old F1/F2/F3… IDs are historical mapping only.
- Four Runtime test assets are explicitly outside Curriculum candidate count.
- Next step is not lesson generation. First realign Catalog / Formal Brief / continuity mapping to T1-01～T1-20.
- First production batch remains small (3–5 lessons) after Formal Brief approval.
