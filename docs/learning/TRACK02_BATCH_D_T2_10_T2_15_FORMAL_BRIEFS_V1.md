# Track 02 Batch D — T2-10～T2-15 Formal Briefs v1

Status: **AVAILABLE / FORMAL_RUNTIME / RUNTIME_ACCEPTANCE_PASS**
Track Owner: `docs/learning/TRACK02_CATALOG_CONTEXT_V1.md`
Audit: `docs/learning/TRACK02_SIX_STEP_AUDIT_V1.md`
Scope: **会看数据 → 会积累知识 → 会复用方法**（T2-10～T2-15）
Boundary: 继续复用 Unified Lesson Shell / Course Builder Skill v1；不新增 Spreadsheet Editor、Knowledge Base UI、Automation Builder、Renderer、interaction type 或 CSS。
Human Review: **PASS**。原 Preview 保留审阅证据；正式课程由 `lib/learning/track02-batch-d-runtime.ts` + LessonSpec Registry + Formal Runtime 提供。

## Batch goal

把 T2-01～T2-09 已形成的“问题 → 证据 → 成品 → 复杂资料 → 行动”能力，继续扩展为：
1. 面对数字时先定义口径、检查数据质量，再形成可信结论；
2. 面对长期资料时判断什么值得沉淀，并维护可信版本；
3. 面对重复任务时从一次成功过程提炼可复用方法，但不提前进入 Track 04 的自动化设计。

## Batch D Human Review acceptance

- **Step 1 / Step 2 separation**：Step 1 只建立直觉，不复用 Step 2 的完整场景、before / after 或 result。每课 Step 1 必须能在不理解 Step 2 业务细节的情况下独立成立；Step 2 必须提供新的具体案例信息与判断依据。
- **Step 5 acceptance**：主 Review 卡片至少 2 张，上限不固定；两张只是最低要求，只有新增卡片能让本课知识更清晰时才继续增加。每课先定义 must-retain judgments，再检查主卡片 + `knowledgeDepth.review` 是否完整覆盖；缺一个关键判断都不通过，已经讲清也不为了版式继续拆卡。mistakes 不得自动转成 Review。

| Lesson | Step 5 must-retain judgments |
| --- | --- |
| T2-10 | 指标含义；分子/分母；时间与统计对象；不同口径何时不可直接比较；未确认业务规则如何处理 |
| T2-11 | 缺失/重复/单位/异常怎样影响分析；哪些可确定性规范化；哪些必须业务确认；什么时候应停止分析 |
| T2-12 | 业务问题决定分析；计算与关键数字复核；事实/推断/可能原因分离；相关不等因果；样本与范围限制；图表只服务解释 |
| T2-13 | 复用价值；稳定性；来源权威；生命周期；待验证信息如何保存 |
| T2-14 | 来源/版本/状态；Source of Truth 如何确认；冲突如何保留；何时归档而非删除 |
| T2-15 | 固定步骤与变量；人工判断；完成标准；一次成功不等于稳定方法；何时才进入自动化学习 |

## T2-10 — 一个数字到底是什么意思，先把口径搞清楚

Primary Knowledge Home: **Metric Definition / Data Semantics**

- Learner problem：看到“转化率、活跃用户、客单价”等数字就直接比较，却没有先确认公式、单位、时间范围与统计对象。
- Core rule：任何计算前先明确指标名称、业务含义、公式、单位、时间窗口、统计对象/分母。
- Practice：把一个含“访问、注册、付费”的小型业务问题整理成可直接交给 AI 的指标定义任务，先输出指标字典，再允许计算。
- Review：AI 适合解释指标、发现口径冲突、辅助写公式；AI 不应在业务定义缺失时自行选一个“合理公式”。
- Capability：看到数字结论时，会先确认“这个指标怎么算、代表谁、覆盖什么时间”。

## T2-11 — 数据很乱，先别急着让 AI 分析

Primary Knowledge Home: **Data Quality / Cleaning Judgment**

- Learner problem：表格中混有空值、重复、日期/单位不一致和异常值，却直接让 AI 分析。
- Core rule：先检查完整性、唯一性、格式/单位一致性、范围/异常、分类一致性，再决定清洗或分析。
- Practice：用课程内小型 Sample Dataset 输出 quality issues、影响、处理建议，以及“处理前不能下的结论”。
- Review：AI 适合发现规则性数据问题并提出建议；AI 不应未经业务确认删除异常值或猜测缺失值。
- Capability：面对数据任务先判断“数据有没有资格分析”。

## T2-12 — 怎么从数据里得到一个可信的判断

Primary Knowledge Home: **Analytical Question → Calculation → Interpretation → Verification**

- Learner problem：只说“分析这个表”，得到很多数字和图，却没有回答真正业务问题。
- Core rule：业务问题 → 指标 → 计算 → 比较 → 解释 → 复核 → 限制；图表只服务解释。
- Practice：给定小型数据与业务问题，让 AI 明确计算逻辑、复核关键数字、解释结果和限制，必要时提出图表建议。
- Review：AI 适合计算、比较、解释和可视化建议；AI 不应把相关性当因果，也不应在样本不足时下强结论。
- Supporting only：Visualization / Numerical Verification，不拆新课。
- Capability：能从业务问题出发形成可复核的数据判断，而不是只生成“分析结果”。

## T2-13 — 哪些东西值得留下来，哪些不用存

Primary Knowledge Home: **Knowledge Capture / Knowledge Value**

- Learner problem：把聊天、链接、文件全部保存，最后仍找不到真正值得复用的知识。
- Core rule：判断未来复用概率、稳定性、权威性、决策价值与维护成本；临时上下文不等于长期知识。
- Practice：把一组工作信息分类为临时 / 项目事实 / 稳定规则 / 决策记录 / 参考资料，并说明是否值得保存、保存多久。
- Review：AI 适合整理和提炼待保存内容；AI 不应把推测升级为长期事实，也不应替组织决定权威来源。
- Capability：不再“什么都存”，而会先判断是否值得成为知识资产。

## T2-14 — 怎么让知识以后找得到，而且知道哪份可信

Primary Knowledge Home: **Knowledge Organization + Maintenance / Source Governance**

- Learner problem：资料保存很多份，但不知道哪份最新、哪份可信、什么时候应该更新。
- Core rule：知识项需要主题/用途、来源、日期/版本、状态、责任与更新规则、Source of Truth。
- Practice：整理一组新旧资料，输出知识清单、版本/状态、canonical source 和需要归档/更新的项。
- Review：AI 适合整理、去重、标版本和发现冲突；AI 不应自行宣布未经确认的资料成为 Source of Truth。
- Capability：找资料时不仅问“在哪里”，还会确认“哪份是当前可信版本”。

## T2-15 — 这次做得不错，怎么让下次不用重新来

Primary Knowledge Home: **Reusable Work Method / Template / Checklist / SOP-lite**

- Learner problem：同类任务已经做成功过，但下次仍从零回忆、重新问、重新检查。
- Core rule：从成功过程提取固定步骤、变量输入、判断点、检查项、常见失败和完成标准，再选择模板 / Checklist / SOP-lite 保存。
- Practice：从一个已完成任务中提炼 reusable method，并明确固定项、变量、人工判断和验收标准。
- Review：AI 适合抽象步骤、生成模板与 Checklist；AI 不应把一次偶然成功自动认定为稳定流程，也不替用户做高风险判断。
- Boundary：不教授 Trigger / Node / State / Retry / Automation / Agent Design；这些进入 Track 04。
- Capability：第二次遇到同类任务时先复用方法；当方法高频、稳定、值得系统化时，知道下一阶段应进入 Workflow 学习。
