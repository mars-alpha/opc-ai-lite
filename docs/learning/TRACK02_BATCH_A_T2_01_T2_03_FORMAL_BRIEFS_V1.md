# Track 02 Batch A — T2-01～T2-03 Formal Briefs v1

Status: **AVAILABLE / FORMAL_RUNTIME / RUNTIME_ACCEPTANCE_PASS**
Task: TRACK02-BATCH-A-BRIEF-001 — T2-01～T2-03 Formal Brief & Continuity Design
Canonical IDs: T2-01～T2-03
Track Owner: docs/learning/TRACK02_CATALOG_CONTEXT_V1.md
Audit Source: docs/learning/TRACK02_SIX_STEP_AUDIT_V1.md
Historical production evidence: `scripts/_historical-run-track02-batch-a-workflow.ts`, `scripts/_historical-validate-track02-batch-a-drafts.ts`, `scripts/_historical-validate-track02-batch-a-lessonspec-registration.ts`. Current Runtime recovery uses the current provision / acceptance scripts, not these historical production validators.

## 1. Batch purpose

Batch A 是 Track 02「会找答案」的第一批正式课程边界。

它不是搜索工具教程，也不是 Prompt 复习课。它要让初学者第一次把 Track 01 已经掌握的 Prompt / Context / Reliability / Search / Source of Truth 真正用于工作中的研究任务。

用户完成 Batch A 后，应能够：

一个模糊工作问题
→ 定义成可研究问题
→ 找到 / 收集候选来源
→ 判断哪些证据值得使用
→ 对齐多个来源的定义、时间和范围
→ 得到“确定部分 / 冲突部分 / 仍不确定部分”的研究结论

Batch Exit Capability：

> 面对“我不知道答案，需要先查清楚”的真实工作问题，学习者知道怎样先把问题缩小，再判断资料是否可信，并在多个来源不一致时做有证据的综合，而不是把 AI 的第一条回答直接当答案。

## 2. Batch continuity contract

### 2.1 Inherited from Track 01

Batch A 默认学习者已经会：

- 把一个 AI 任务说清楚（T1-02）；
- 提供完成任务所需的最小 Context（T1-03）；
- 对明确问题做定向修改（T1-04）；
- 识别哪些事实、数字、日期、功能或来源必须核验（T1-05）；
- 理解 Search / RAG / Source of Truth 的基本作用（T1-09～T1-10）；
- 知道 AI 可能出错，重要判断不能只凭回答语气。

这些能力在 Track 02 只被调用，不重新定义。

### 2.2 Batch artifact thread

Batch A 使用同一研究对象连续推进，但学员可替换为自己的真实工作问题。

Research Brief
→ Evidence Pack
→ Evidence Synthesis

Artifact continuity 是“自然复用”，不是强制依赖：每节课必须单独打开也能完成 Practice；若学习者有上一课产物，可以直接继续使用。

### 2.3 Default case layer

Production 内部默认案例可使用一个行业中立的小团队工作问题，例如：

> 团队正在考虑是否要增加一种新的客户沟通方式，需要先了解目标用户当前常见做法、公开可查的使用情况，以及不同来源为什么会给出不同结论。

正式学员可见正文不固定上述案例，也不出现 OPC / 项目内部生产标签。Course Builder 应优先使用市场/用户/产品选择、工作工具或服务比较、公开政策/功能/行业数据核验、小团队决策前资料调查等容易理解、可迁移的场景。

## 3. Batch anti-repeat boundary

### 不重新教学 Track 01

- 不重新教 Prompt 四要素；
- 不重新教 Context 是什么；
- 不重新定义 Hallucination；
- 不重新解释 Search / RAG 工作原理；
- 不把“哪些陈述必须核验”再做成 T2-02 主知识。

### 不提前进入 Track 03

- 不教 ICP / Audience Segmentation；
- 不教竞品战略框架；
- 不教内容选题系统；
- 不教 Funnel / Lead / Sales。

真实市场或用户研究只作为研究能力案例。

### 不提前进入 Track 04 / 05

- 不自动化研究 Workflow；
- 不教抓取、API、Agent research pipeline；
- 不进入正式 Problem Discovery / Stakeholder Mapping / Solution Design。

## 4. Shared production constraints

T2-01～T2-03 均使用当前 Unified Lesson Shell：EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY。

固定：

- 不新增 Renderer / Component / UI；
- 不调整 CSS；
- 不新增浏览器、搜索器、引用管理器；
- Step 4 可以把完整研究任务 COPY_TO_AI，但不要求 OPC 自己访问互联网；
- 若外部 AI 不具备搜索能力，课程练习必须仍可通过给定 Sample Source 完成；
- Practice fields 的数量不预设，只为当前完整任务服务；
- Reference Fill 按顺序组合后必须成为可直接运行的任务；
- Reference Answer 不带字段标题或内部 Schema 名。

---

# T2-01 — 把模糊问题变成可研究问题

Type: APPLICATION
Planned Gate: CHECK + PRACTICE
Primary Knowledge Home: Research Question / Scope
Prerequisite: Track 01 Core Baseline

## Learner Question

我知道自己“想了解这个问题”，但为什么让 AI 研究以后总得到一堆泛泛资料？怎样把一个工作问题缩小到真正能查、能回答？

## Current Learner Job

拿一个真实、模糊的“我想了解 X”工作问题，把它变成有明确目的、对象、范围、时间边界和预期判断的 Research Brief。

## Inherited Capability / Artifact

Inherited Capability：

- 会把 AI 任务说清楚；
- 会补必要 Context；
- 知道重要事实需要核验。

Inherited Artifact：可选使用学习者自己的真实工作问题；不要求必须从 Track 01 带入某个文件。

## New Capability

学习者能够判断一个研究问题是否已经具备：

1. 研究目的：为什么要查，最终要支持什么工作判断；
2. 研究对象：具体在查谁 / 什么；
3. 范围：地区、类别、场景或比较边界；
4. 时间：当前、近一年、某一历史时期等；
5. 结果要求：最后希望得到事实清单、比较、趋势、建议前的证据摘要或其他明确产物；
6. 证据要求：哪些结论必须给来源 / 日期 / 原始依据。

核心不是把 Prompt 写得更长，而是让“研究范围”足够清楚，使问题可以被证据回答。

## Artifact Action / Output

Action：把一个模糊工作问题收窄成一份 Research Brief。

Output: Research Brief

最小可观察结果应包含：研究目的、对象/范围、时间边界、需要回答的核心问题、证据要求。

## Six-step intent

1. EXPLAIN：让学习者看懂“问题太大”会迫使 AI 自己猜范围、时间和判断标准，因此答案容易泛化；研究任务的第一步不是搜索，而是先确定到底要查清什么。
2. EXAMPLE：对比“帮我研究 AI 培训市场”和一个有明确用途、对象、地区、时间和输出要求的问题，让差异可见。
3. CHECK：三题只检查研究范围判断，例如识别“仍太宽”“缺时间边界”“目的与输出不一致”；不得退回 Prompt 定义记忆题。
4. PRACTICE：学习者把一个模糊问题整理成完整 Research Brief，并可直接复制给 AI 请求执行研究或先生成研究计划。
5. REVIEW：围绕“AI适合帮助收窄问题、拆研究维度 / AI不应该替你猜真正业务目的”；下方说明层重点解释研究范围为什么影响证据质量、问题太大时为什么应先缩小而不是堆更多资料。
6. CAPABILITY：以后遇到“AI 回答很泛 / 搜到很多但没有用”的情况，能先检查研究问题和 Scope，而不是先换模型。

## Step 3 mastery boundary

正确理解必须表现为“会判断问题是否可研究”，不是背出 Purpose / Scope 等术语。

可检查的认知差异：

- 工作主题 ≠ Research Question；
- 问题可以很具体，但如果没有用途仍可能研究失焦；
- 范围越窄不代表越好，边界必须与真实工作目的匹配；
- 研究问题不是最终结论，不能把想证明的答案预先写进问题。

## Step 4 Practice contract

Practice 必须让用户完成“一份可以直接给 AI 的研究任务”，而不是填写研究术语。

语义上必须覆盖：

- 我为什么要查；
- 我要查什么 / 谁；
- 范围和时间；
- 最重要的 2～4 个待回答问题；
- 来源 / 日期要求；
- 希望 AI 最终怎样整理结果。

字段数量由 Course Builder 决定，只要最终组合完整即可。

Reference / COPY_TO_AI 的语义必须是：说明真实研究目的、对象、范围和时间，列出要回答的问题；对可查证事实、数字和近期变化要求标明来源与日期；资料不足或定义不一致时明确写出，不补成确定结论；最后按指定结构整理结果。

必须包含真实具体的研究对象和待回答问题，不能只复制元说明。

## Step 5 boundary

AI适合做什么：帮助把范围拆清、提出研究维度、按明确问题整理资料。

AI不应该替你做什么：在用户没有说明真实用途时替用户定义业务目标，或把预设观点包装成“研究结论”。

Pitfall 候选：

- 把“主题”当成“研究问题”；
- 一次想查完整个行业；
- 先写结论再让 AI 找材料证明。

## Step 6 capability evidence

会了的证据：学习者能把一个自己真实的模糊问题改成第三方拿到后也知道“查什么、查到什么程度、什么算完成”的 Research Brief。

Trigger：

> 当你发现自己正在问“帮我全面分析一下 X”，或者 AI 给了很多信息却仍不知道下一步该做什么时，应想到本课。

## Next Reuse

T2-02 直接使用 Research Brief 中的证据要求，进一步判断“找来的这些来源到底值不值得信”。

T2-01 不要求强制生成 Evidence Pack；如果 AI 已经返回来源，可作为 T2-02 的可选输入。

## Anti-repeat / Deferred

- 不重新教学 Prompt foundations；
- 不教完整 Research Methodology；
- 不教市场规模估算模型；
- 不教 Survey / Interview research design；
- 不进入 Track 05 Problem Discovery；
- 不要求联网搜索作为 Completion Gate。

## Grounding

REVIEWED_KNOWLEDGE + current public-source examples only when a real example needs freshness.

---

# T2-02 — 判断来源和证据是否可信

Type: APPLICATION
Planned Gate: CHECK + PRACTICE
Primary Knowledge Home: Source Quality / Evidence Judgment
Prerequisite: T2-01 + Track 01 Reliability / Search / Source of Truth

## Learner Question

AI 已经给了来源、链接和数据，我怎么知道这些东西是真的能支持结论，而不是“看起来有出处”？

## Current Learner Job

面对一组候选来源，判断哪些能真正支撑当前 Research Question，哪些只能当线索、背景或仍需回到原始来源核验。

## Inherited Capability / Artifact

Inherited Capability：

- T1-05：知道哪些陈述必须核验；
- T1-09～T1-10：知道 Search / Source of Truth 的基本作用；
- T2-01：已经有明确 Research Question / Scope。

Inherited Artifact：可选 Research Brief；Practice 必须自带 Sample Sources，因此不依赖用户完成 T2-01。

## New Capability

能够从当前问题出发，对来源做最低证据判断：

1. 来源是谁：原始发布者、官方文档、研究机构、媒体、个人转述等；
2. 是不是原始证据：能否回到第一手数据 / 文件 / 公告；
3. 什么时候发布 / 更新：是否仍适用于当前问题；
4. 对象和范围是什么：样本、地区、人群、版本是否和当前 Research Scope 一致；
5. 它实际证明了什么：Evidence 是否真的支持当前 Claim；
6. 还缺什么：不能确认时明确标为待核验，而不是凭来源看起来“专业”就接受。

这里教的是 Evidence Judgment，不是重新教“哪些内容要核验”。

## Artifact Action / Output

Action：对一组候选来源进行证据审查。

Output: Evidence Pack

Evidence Pack 最少区分：

- 可直接使用的证据；
- 可作为线索但需回原始来源核验；
- 与当前范围不匹配 / 已过期 / 无法支撑 Claim 的材料；
- 仍缺的证据。

## Six-step intent

1. EXPLAIN：让学习者理解“AI 给了链接 ≠ 结论已有证据”；来源是否有用取决于它是谁、何时、针对谁，以及实际证明了什么。
2. EXAMPLE：围绕同一 Claim，对比官方原始资料、媒体转述、无出处二手总结，让证据层级与适用范围可见。
3. CHECK：判断哪个来源最能支撑当前 Claim、哪个只是二手线索、哪个虽然权威但时间/样本不适用；不得只考“官方一定最好”。
4. PRACTICE：使用课程提供的一组 Source Cards / 摘要信息，让学习者要求 AI 按来源、日期、范围、原始性、支持的 Claim、缺口进行审查，再由学习者决定使用等级。
5. REVIEW：AI适合帮助整理来源、追踪证据和暴露缺口；AI不应该因为来源数量多、网站看起来专业或回答语气确定就自动宣布事实成立。
6. CAPABILITY：看到关键数字、政策、功能、研究结论时，能主动问“原始来源是什么？它真的支持这句话吗？适用于我的问题吗？”

## Step 3 mastery boundary

必须能区分：

- Source credibility 与 Claim support 不是同一件事；
- 权威来源也可能因为日期、对象或范围不同而不适用；
- 二手来源不是永远不能用，但关键结论应尽量追到原始依据；
- 多个来源重复同一句话，不代表有多个独立证据。

## Step 4 Practice contract

Practice 默认不依赖实时互联网。

课程必须提供足够的 Sample Source 信息，例如来源主体/类型、日期、摘要或关键原文、原始/转述关系、覆盖对象/地区/样本、当前待判断的 Claim。

学习者组成一份可直接给 AI 执行的 Evidence Review Task，要求 AI：

- 分析每个来源能证明什么；
- 指出它不能证明什么；
- 标出日期 / 范围不匹配；
- 建议哪些应回原文核验；
- 明确仍缺的证据。

Reference Fill / Answer 必须包含真实 Sample Sources，不允许只写“请判断来源是否可信”。

## Step 5 boundary

AI适合做什么：整理来源元信息、对照 Claim、发现证据缺口、帮助追踪原始来源。

AI不应该替你做什么：仅凭网站名气、链接数量或语言风格决定事实真假，也不能虚构自己已经打开并核验了没有实际访问的来源。

Pitfall 候选：

- “有链接就可信”；
- “官方来源能证明任何相关说法”；
- “三篇文章都这么写，所以一定是真的”。

## Step 6 capability evidence

会了的证据：学习者能对一组来源说明“哪些能支撑当前 Claim、为什么、适用范围是什么、还缺什么”，而不是只给“可信 / 不可信”标签。

Trigger：

> 当 AI 给你一个具体数字、政策、功能说明、行业结论或引用链接，而这个信息会影响发布、购买、汇报或决策时，应想到本课。

## Next Reuse

T2-03 使用 Evidence Pack 继续解决：即使每个来源都看过了，为什么它们仍可能给出不同答案，以及怎样形成不强行消除分歧的综合结论。

## Anti-repeat / Deferred

- 不重复 T1-05 的“哪些内容必须核验”；
- 不教学术系统综述；
- 不教统计显著性 / 研究设计评价；
- 不要求学习者掌握 citation manager；
- 不做浏览器事实核查产品功能；
- 不进入 Track 05 formal discovery evidence framework。

## Grounding

REVIEWED_KNOWLEDGE；若正式案例使用真实近期数据，Grounding Packet 必须记录原始来源与日期。

---

# T2-03 — 处理多个答案和来源冲突

Type: APPLICATION
Planned Gate: CHECK + PRACTICE
Primary Knowledge Home: Multi-source Synthesis / Conflict Handling
Prerequisite: T2-01, T2-02

## Learner Question

我已经找了几个看起来都不错的来源，但数字和结论不一样，到底该信谁？是不是选最多人说的那个就行？

## Current Learner Job

面对多个来源对同一问题给出的不同说法，先找到差异来自哪里，再形成带条件、带证据、保留不确定性的综合结论。

## Inherited Capability / Artifact

Inherited Capability：

- T2-01：问题与 Scope 已明确；
- T2-02：知道每个来源各自能证明什么、有什么证据缺口。

Inherited Artifact：可选 Evidence Pack；Practice 必须提供独立 Sample Evidence Set。

## New Capability

遇到冲突时，不先“投票”，而按以下顺序对齐：

1. Definition：是不是在说同一个指标 / 概念；
2. Population / Scope：对象、地区、样本是否一致；
3. Time：是不是不同时间的结果；
4. Method / Evidence：数据来源和计算方式是否不同；
5. Claim strength：一个说事实，一个可能只是分析 / 推断；
6. Residual uncertainty：对齐后是否仍存在真正无法消除的冲突。

最终输出应区分：

- 多来源一致的部分；
- 看似冲突但可以解释的部分；
- 真正仍冲突的部分；
- 当前证据不足、不能确定的部分。

## Artifact Action / Output

Action：把多个来源从“并排摆放”升级成 Evidence Synthesis。

Output: Evidence Synthesis

## Six-step intent

1. EXPLAIN：让学习者看懂多个来源不同不一定是谁错了，常见原因是定义、时间、样本或方法不同；“多数来源说一样”也不能代替证据对齐。
2. EXAMPLE：使用同一指标出现两个不同数字的简单案例，先展示表面冲突，再揭示一个统计“注册用户”、另一个统计“月活用户”或时间窗口不同。
3. CHECK：判断差异最可能来自 Definition / Time / Scope / Evidence，识别哪些情况必须保留不确定性；不要求背分类名称。
4. PRACTICE：给 2～3 个来源摘要，让学习者组成完整 Synthesis Task：要求 AI 对齐定义、对象、时间、方法，输出一致点、差异原因、真正冲突和当前可下的结论。
5. REVIEW：AI适合做多来源对齐、归纳和显示冲突；AI不应该为了“给一个答案”而抹掉不确定性，也不应使用简单多数票替代证据质量。
6. CAPABILITY：遇到“为什么每份资料都不一样”时，能先解释差异，再决定可以确定到什么程度。

## Step 3 mastery boundary

学习者必须能判断：

- 不同数字未必是真冲突；
- 同一来源被多篇文章转述仍然只是一个证据链；
- 新数据与旧数据不同可能反映时间变化；
- 定义无法对齐时，不能硬合成一个平均数；
- 证据不足时，“暂时不能确定”是合法结论。

## Step 4 Practice contract

课程提供 2～3 个足够完整的 Sample Evidence Sources。

COPY_TO_AI 任务必须要求：

- 先提取各来源的核心 Claim；
- 对齐定义、对象 / 样本、地区、时间、方法 / 来源；
- 识别真正一致的部分；
- 解释表面冲突；
- 保留仍无法解释的冲突；
- 给出“当前证据支持什么 / 不支持什么”；
- 禁止在证据不足时强行选一个单一答案。

本课不要求用户自己计算复杂统计，也不需要新增对比表 UI；Structured Output 可以通过现有文本 / Practice fields 表达。

## Step 5 boundary

AI适合做什么：快速并排对齐多个来源、寻找口径和时间差异、组织综合结论。

AI不应该替你做什么：为了看起来有结论而隐藏分歧，或把“来源多”直接等同于“证据强”。

Pitfall 候选：

- 多数票决定事实；
- 把不同定义的数据直接平均；
- 强迫 AI 给唯一答案；
- 把无法确认写成确定判断。

## Step 6 capability evidence

会了的证据：学习者能把多个不一致来源整理成“共识 / 可解释差异 / 真冲突 / 未确定”四类，并写出一个证据强度与措辞匹配的结论。

Trigger：

> 当你搜索同一个问题，发现不同网站、报告、AI 产品给出的数字或结论不一致时，应想到本课。

## Next Reuse

完成 T2-03 后，学习者已经得到一份可信的 Evidence Synthesis。Track 02 Phase 2 的 T2-04 将不再研究“事实是什么”，而开始解决“同样的信息应该怎样面向不同对象表达”。

Batch A → Batch B 的衔接固定为：

Evidence Synthesis
→ Audience / Purpose Brief
→ Deliverable

## Anti-repeat / Deferred

- 不教正式 Meta-analysis；
- 不教复杂统计合并；
- 不教 Bayesian evidence weighting；
- 不做竞品战略结论；
- 不进入 Track 05 Problem Discovery；
- 不让 Course Builder 把“冲突处理”退化成“哪条来源更权威”的 T2-02 重复题。

## Grounding

REVIEWED_KNOWLEDGE；正式案例若使用真实公开数据，必须保存当期 Grounding Packet。

---

## 5. Batch-level continuity acceptance

Course Builder 前必须满足：

1. T2-01 的新知识明确是 Research Question / Scope，不是 Prompt foundations；
2. T2-02 的新知识明确是 Evidence Judgment，不是 T1-05 Reliability 重讲；
3. T2-03 的新知识明确是 Multi-source Synthesis / Conflict Handling，不是 T2-02 的来源可信度重复；
4. 三课都能在无实时联网能力下通过 Sample Input 完成；联网 Search 只能作为扩展体验；
5. 每节 Step 4 的 Reference Fill / Answer 都是具体、可执行的 AI 任务，不是教学说明；
6. 每节 Step 3 均为理解判断，不考英文术语；
7. Step 5 固定“AI适合做什么 / AI不应该替你做什么”核心方向，但具体内容与下方说明由本课决定；
8. Step 6 Trigger 必须是学习者未来真实会遇到的工作情境，与 Next Lesson Value 分开；
9. Batch Artifact Thread 自然推进，但任何单课都不得为了 handoff 强行增加无关字段；
10. 不新增 UI、不调整 CSS、不增加文件上传 / Search / citation 专属交互。

## 6. Course Builder handoff

本文件完成后允许的下一步是：

TRACK02_CATALOG_CONTEXT_V1
+ TRACK02_SIX_STEP_AUDIT_V1
+ TRACK02_BATCH_A_T2_01_T2_03_FORMAL_BRIEFS_V1
+ FIVE_TRACK_CAPABILITY_CONTINUITY_V1
+ DEFERRED_KNOWLEDGE_LEDGER_V1
+ current grounding
→ PREPARE_GROUNDING
→ PREPARE_FORMAL_BRIEF
→ courseContextReady=true
→ Current Course Builder Skill

Formal Brief 不批准：

- 一次性生产 T2-04～T2-15；
- 修改 Track 02 目录；
- 修改 Unified Lesson Shell；
- 新增 UI / CSS；
- 把当前 Brief 中的字段语义复制成全局固定模板。
