# Track 05 Batch A — T5-01～T5-03 Formal Briefs v1

Status: **FORMAL_BRIEF_APPROVED_V1 / READY_FOR_COURSE_BUILDER**
Track Owner: docs/learning/TRACK05_CATALOG_CONTEXT_V1.md
Audit: docs/learning/TRACK05_SIX_STEP_AUDIT_V1.md
Scope: **发现真实业务问题 → 找清关键角色 → 建立当前状态基线**
Boundary: **USE_EXISTING_UNIFIED_LESSON_SHELL_ONLY / NO NEW UI / NO CSS / NO TRACK-SPECIFIC SKILL**

## 1. Batch goal

Batch A 是 Track 05 的业务问题入口。学习者已经在 Track 01～04 学会 AI 协作、常见工作应用、业务增长方法和 Workflow 设计，但进入 FDE 后不能从“我要做一个什么 AI 系统”开始。

本批固定完成三个前置判断：

**先确认真正的问题在哪里 → 再确认谁使用、谁受影响、谁负责、谁批准 → 最后用事实建立当前状态基线。**

三课完成后，学习者应拥有：

- Problem Observation Notes；
- Stakeholder Map；
- Current-State Baseline。

这些产物共同进入 Batch B，用于形成 Problem / Target / Value Brief。

Batch A 不做以下事情：

- 不定义正式 Problem Statement；
- 不定义 Target State / Success Condition；
- 不做 ROI / Business Case；
- 不选择 Build / Buy / Configure / Manual；
- 不设计 Solution Architecture；
- 不做 Prototype / Pilot；
- 不教授 Track 04 Workflow mechanics；
- 不要求真实代码、部署、IAM 配置或平台操作。

## 2. Batch continuity

### Track 04 → T5-01

Track 04 已让学习者能把一条已理解、已验证的重复业务链设计成可解释、可交付的 Workflow Design Blueprint。

Track 05 不默认这个 Workflow 就是“真正应该解决的问题”。T5-01 重新回到业务现场，判断：

> 当前看到的是症状、某个流程摩擦，还是一个真正值得继续追查的业务问题？

### T5-01 → T5-02

T5-01 只确认问题出现在哪里、影响表现是什么、哪些信息仍未知。

T5-02 接着确认：

> 这个问题涉及哪些角色？谁真正使用、受影响、负责结果、提供条件、批准上线？

T5-01 不提前做完整 Stakeholder Map。

### T5-02 → T5-03

T5-02 找清角色之后，T5-03 才能知道当前状态应该向谁、在哪些环节收集什么事实。

T5-03 负责建立：

> 时间、成本、质量、错误/风险、数量/频率等当前事实基线。

T5-02 不提前要求学习者量化完整业务表现。

### T5-03 → Batch B

T5-03 只回答“现在是什么样”。

下一课 T5-04 才把 T5-01～03 的观察、角色和 Baseline 收敛成 Problem Statement / Scope / Constraints。

## 3. Batch longitudinal artifact

Track 03 / 04 已验证业务上下文与 Workflow evidence
→ **T5-01 Problem Observation Notes**
→ **T5-02 Stakeholder Map**
→ **T5-03 Current-State Baseline**
→ Batch B Problem / Target / Value Brief

Artifact 只在自然有用时向后传递，不为串课强行增加字段。

## 4. Common production acceptance

### Step 1 / Step 2 separation

- Step 1 只建立本课的业务判断直觉和一句核心判断；
- Step 2 才使用完整真实案例、对比和判断依据；
- 三课不得共享同一组标题、同一开头模板或同一“先看核心/再看边界”结构；
- Step 1 与 Step 2 不能只是同一案例换一种说法。

### Step 3 acceptance

每课 3 道 required Check：

1. SINGLE_CHOICE / BEST_JUDGMENT；
2. TRUE_FALSE / MISCONCEPTION；
3. MULTI_SELECT / BOUNDARY_CONDITIONS。

题目只测真实业务判断，不考英文名词定义。

### Step 4 acceptance

每课必须形成不同的真实工作产物：

- T5-01：问题观察记录；
- T5-02：关键角色与责任地图；
- T5-03：当前状态基线表。

Reference Fill 必须可以直接复制给 AI 完成当前课目标任务；不能把“我要 AI 完成的任务”等字段说明原样拼进 Prompt。

AI 可以帮助整理、比较、发现信息缺口，但不得虚构：

- 真实业务数据；
- 人员职责；
- 决策权限；
- 历史耗时；
- 成本；
- 错误率；
- 业务影响。

### Step 5 acceptance

每课必须围绕：

- **AI适合做什么**
- **AI不应该替你做什么**

形成至少 2 张主 Review 卡片，并覆盖本课 must-retain judgments。

容易踩的坑必须来自本课真实误判，不能三课复用同一套通用文案。

### Step 6 acceptance

每课必须分别表达：

1. Capability Gain；
2. 至少 2 个 Self Assessment evidence；
3. 独立现实 Trigger Scenario；
4. Next Lesson Value。

Trigger Scenario 是“什么时候应该想到本课”，不是下一课预告。

---

# T5-01 — 别急着想“用什么 AI”，先确认业务到底哪里出了问题

Primary Knowledge Home: **真实问题发现 / 症状与根问题区分（Problem Discovery / Symptom vs Root Problem）**
Lesson Type candidate: **APPLICATION**

Canonical learner result:

> 能从一个业务抱怨、异常结果或流程摩擦出发，区分症状、直接原因与仍需验证的根问题，并形成一份不预设 AI 方案的问题观察记录。

## Learner problem

进入 AI 项目时，人很容易从解决方案开始：

- “我们要做一个 AI 客服”；
- “这里应该上 Agent”；
- “这段流程要自动化”；
- “员工效率太低，需要 AI”。

但这些表达往往混合了：

- 已经看见的症状；
- 对原因的猜测；
- 对解决方案的预设；
- 尚未验证的业务判断。

如果一开始就把“想做什么 AI”当成问题本身，后面的 Stakeholder、Baseline、Value 和 Pilot 都会围绕错误对象展开。

## Core judgment

**先把“看见了什么”与“为什么会这样”分开。症状是证据，根问题是需要验证的解释；在证据不足时，最专业的答案可以是“还不能确定根问题”。**

问题发现至少区分四层：

1. **现象 / 症状**：实际发生了什么；
2. **业务影响**：它造成了什么后果；
3. **可能原因**：当前有哪些解释；
4. **待验证信息**：还缺什么事实才能判断真正原因。

本课不要求学习者一次找到唯一根因，而是避免在证据不足时把猜测写成事实。

## Inherited capability

可直接调用：

- Track 02 Research / File / Data 中的事实整理能力；
- Track 03 已形成的真实业务上下文；
- Track 04 Workflow evidence，用于观察“流程在哪里出现摩擦”。

不得重新教授：

- Workflow suitability；
- Workflow decomposition；
- failure / retry；
- Agent / Tool / MCP；
- 数据分析工具操作。

## Step 1 — 建立直觉

只建立一个直觉：

> **“大家都说这里很麻烦”只能证明有症状，不能证明你已经知道真正的问题。**

轻量例子：

AI 日报总是晚发。表面上像“写作太慢”，但真实原因可能分别是来源收集不稳定、选题判断反复、审核等待、事实核对成本高，甚至根本不是写作环节。

Step 1 不展开完整问题发现框架，不列解决方案。

## Step 2 — 讲透方法

完整案例使用“AI 日报发布时间不稳定”。

案例事实可以包括：

- 每天计划 9:00 发布；
- 最近多次推迟；
- 团队直觉认为“AI 写得不够快”；
- 实际工作链包含来源收集、去重、选题、查证、观点整理、审核、排版和发布。

两张核心对比卡建议承载：

**卡片 A：把症状当根因**

“经常晚发 → 写作慢 → 做一个自动写作 Agent。”

指出问题：直接从结果跳到原因和方案，中间没有证据。

**卡片 B：先形成可验证的问题观察**

“晚发发生在哪些日期 → 延迟集中在哪些步骤 → 哪些事实已知 → 哪些原因只是猜测 → 下一步要向谁或从哪里确认。”

重点讲清：

**观察事实 → 描述影响 → 列出可能原因 → 标记未知 → 再决定下一步调查。**

## Step 3 — 检查理解

1. **SINGLE_CHOICE / BEST_JUDGMENT**
   看到客服回复慢时，哪种做法最合理：先确认慢发生在哪些场景、影响和环节，而不是立即决定上客服机器人。

2. **TRUE_FALSE / MISCONCEPTION**
   “如果多数员工都认为某个环节是根因，就可以直接把它写成 Problem Statement。” → 错。

3. **MULTI_SELECT / BOUNDARY_CONDITIONS**
   一份合格的问题观察应区分：已观察事实、业务影响、可能原因、待验证信息；不要求现在就确定技术方案或唯一根因。

## Step 4 — 实操

练习产物：**Problem Observation Notes / 问题观察记录**

建议练习场景：

“一个人运营 AI 内容业务。最近 AI 日报经常比计划时间晚 2～4 小时。已知流程包含来源收集、去重、筛选、查证、观点整理、审核、排版、发布，但目前没有逐步骤耗时记录。”

Practice 字段必须围绕**学习者自己想到的真实问题**设计；课程案例只负责一键填充示范。可使用：

1. **我现在最想弄清的问题**
2. **我已经确认的事实**
3. **这件事现在是怎么做的**
4. **我现在怀疑什么，以及为什么**
5. **我希望 AI 帮我补充什么信息**

Reference Fill 组合后必须形成一个完整 AI 任务，要求 AI：

- 读取学习者自己的问题、事实、流程和当前猜测；
- 区分哪些内容属于已确认事实，哪些只是经验判断或猜测；
- 判断最值得优先验证的 1～2 个方向，并说明依据；
- 指出最关键的证据缺口和下一步还应该了解什么；
- 最后把输入优化成一份更清楚、可继续验证的问题观察记录；
- 不把可能原因直接写成确定根因；
- 不提出 AI 工具、智能体、自动化或系统方案；
- 不虚构耗时、人员、成本或错误率。

## Artifact output

**Problem Observation Notes**

至少包含：

- observed symptom；
- business impact；
- candidate causes；
- unknowns；
- next evidence needed。

该产物进入 T5-02 / T5-03，但不等于正式 Problem Statement。

## Must-retain judgments

- 症状不等于根问题；
- 业务抱怨是一条线索，不是完整事实；
- “可能原因”必须与“已验证事实”分开；
- 证据不足时允许明确写“还不知道”；
- 问题发现阶段先调查业务，不预设 AI 方案；
- AI 可以帮助整理证据和提出待验证问题，但不能替业务负责人把猜测升级成事实。

## Step 6 — 能力获得

Capability Gain：

> 我能面对一个模糊业务抱怨，先把症状、影响、可能原因和未知信息拆开，而不是直接跳到 AI 方案。

Self Assessment：

- 我能指出一句业务抱怨里哪些是事实、哪些是推测；
- 我能在证据不足时说清“还需要验证什么”；
- 我不会把想做的工具名称当成问题定义。

Trigger Scenario：

> 当团队一开口就是“我们需要一个 AI 客服 / Agent / 自动化”，但还说不清真正出了什么问题、问题发生在哪里时，应想到这节课。

Next Lesson Value：

> 问题线索已经看清后，还需要确认谁真正经历这个问题、谁对结果负责、谁能提供事实、谁决定方案能不能进入真实工作。

## Anti-repeat / deferred boundary

- ≠ T4-01 Automation Suitability：T4-01 判断一条已理解流程是否值得系统化；T5-01 先问“我们理解的问题本身是否正确”；
- ≠ T5-04 Problem Statement：T5-01 保留未知和多个可能原因，T5-04 才正式收敛问题、范围与约束；
- 不教 Root Cause Analysis 专业工具全套方法（如完整鱼骨图、5 Whys facilitator methodology）；
- 不设计解决方案；
- 不评价技术可行性；
- 不做 ROI；
- 不要求外部最新事实，除非选用真实公开企业案例。

## Grounding

默认使用：

- OPC / 一人公司真实业务情境；
- Track 03 / 04 已形成的业务链与 Workflow evidence；
- REVIEWED_KNOWLEDGE。

如使用真实公司案例，只用于展示“症状 ≠ 根问题”，需要当前公开来源支持具体事实；不得用未经证实的内部原因推测作为案例结论。

---

# T5-02 — 谁在用、谁受影响、谁决定这件事能不能上线

Primary Knowledge Home: **Stakeholder / User / Owner / Approver Map**
Lesson Type candidate: **APPLICATION**

Canonical learner result:

> 能围绕一个已经观察到的业务问题，区分使用者、受影响者、结果负责人、信息/资源提供者和批准者，并形成一份能支持后续调查与方案落地的 Stakeholder Map。

## Learner problem

AI 项目经常把“用户”当成唯一角色。

但真实落地中可能出现：

- 使用系统的人并不承担业务结果；
- 受问题影响的人可能根本不操作系统；
- 提供数据和权限的人不是使用者；
- 决定能不能上线的人可能是负责人、合规、IT 或业务 Owner；
- 最终长期维护的人又是另一角色。

如果角色混在一起，项目会出现：

- 问错人；
- 缺关键事实；
- 设计出来没人负责；
- Pilot 有人试但无法上线；
- 使用者满意但 Owner 不认可；
- 业务负责人支持但权限方无法放行。

## Core judgment

**Stakeholder Map 不是“列出所有相关人员”，而是说明：谁经历问题、谁使用结果、谁对业务结果负责、谁提供关键条件、谁拥有批准权。**

至少区分：

1. **使用者（User）**：直接使用方案或结果；
2. **受影响者（Affected）**：工作或结果会被改变；
3. **结果负责人（Owner）**：对业务结果负责；
4. **关键提供者（Provider / Dependency Owner）**：提供数据、知识、权限或资源；
5. **批准者（Approver）**：决定是否可以进入 Pilot / 上线 / 扩大。

同一人可以承担多个角色；角色按责任定义，不按职位名称猜测。

## Previous → Current → Next

Previous T5-01：

已有 Problem Observation Notes，知道问题现象、影响、可能原因和未知信息。

Current T5-02：

确定“应该向谁确认什么、谁承担什么责任、谁能阻止或推动项目”。

Next T5-03：

基于角色地图，从正确来源收集当前状态事实，建立 Baseline。

本课不提前量化完整 Baseline。

## Step 1 — 建立直觉

只建立一个直觉：

> **真正每天使用 AI 的人，不一定是能决定项目是否成功的人。**

轻量例子：

客服人员每天使用知识助手，但投诉率、升级率和服务质量可能由客服主管负责；知识库由运营维护；数据权限由 IT 管；高风险答复上线还可能需要法务或负责人批准。

## Step 2 — 讲透方法

完整案例使用“AI 客服 / FAQ 助手”。

业务中有：

- 一线客服；
- 客服主管；
- 知识库维护者；
- IT / 数据负责人；
- 业务负责人；
- 高风险问题审批方。

两张核心对比卡建议：

**卡片 A：只写‘目标用户 = 客服人员’**

问题：无法回答谁提供知识、谁对错误负责、谁批准上线、谁长期维护。

**卡片 B：按责任画角色**

示例：

- User：客服人员；
- Affected：客服、客户；
- Owner：客服主管；
- Provider：知识库维护者 / IT；
- Approver：业务负责人 / 必要审批角色。

强调：

**角色来自责任与决策权，不来自组织架构图上的头衔猜测。**

## Step 3 — 检查理解

1. **SINGLE_CHOICE / BEST_JUDGMENT**
   如果销售代表使用 AI 线索助手，但销售主管对转化负责，谁更接近业务 Owner：销售主管。

2. **TRUE_FALSE / MISCONCEPTION**
   “只要找到最终使用者，就已经完成 Stakeholder 分析。” → 错。

3. **MULTI_SELECT / BOUNDARY_CONDITIONS**
   Stakeholder Map 可能需要识别：使用者、受影响者、结果 Owner、关键资源/数据提供者、Approver；不要求每个组织都有五个不同的人。

## Step 4 — 实操

练习产物：**Stakeholder Map / 关键角色地图**

建议场景：

“团队考虑改善线索跟进。线索来自内容表单，一人公司负责人负责最终成交，目前由运营人员整理背景并提醒跟进；部分客户信息来自 CRM，自动发送内容需要负责人确认。”

Practice 字段必须围绕**学习者自己的角色问题**设计；课程案例只负责一键填充示范。可使用：

1. **我现在最想弄清的角色问题**
2. **这项工作现在是怎么做的**
3. **我目前知道涉及哪些人和责任**
4. **我目前知道的数据、权限和批准关系**
5. **我希望 AI 帮我进一步判断什么**

Reference Fill 要求 AI：

- 先理解学习者自己提出的角色问题和已经知道的实际情况；
- 判断当前角色分工是否覆盖实际执行、结果责任、关键数据/权限和试点/对外执行批准；
- 判断哪里存在责任重叠、责任空缺或未经确认的关系，并说明这些缺口为什么会影响落地；
- 告诉学习者接下来还应该向哪些人确认什么；
- 最后优化成一份更清楚的关键角色地图；
- 所有未经确认的职责或权限必须标记“待确认”；
- 不虚构具体组织职位、权限或个人姓名；
- 不替组织直接决定新的真实责任；
- 不设计解决方案。

## Artifact input

T5-01 Problem Observation Notes。

## Artifact output

**Stakeholder Map**

至少包含：

- role / stakeholder；
- responsibility type；
- relation to problem；
- evidence or assumption；
- key question / decision needed。

该产物进入 T5-03，并持续被 T5-11 Pilot Design、T5-14 Adoption、T5-15 Ownership 复用。

## Must-retain judgments

- User ≠ Owner ≠ Approver；
- 受影响者可能不是直接使用者；
- 数据 / 知识 / 权限提供者可能决定方案能否落地；
- 角色按责任和决策权识别，不按职位名称猜；
- 同一人可以承担多个角色；
- 不确定的责任必须标记待确认；
- AI 可以帮助整理角色关系，但不能替组织分配真实职责或批准权。

## Step 6 — 能力获得

Capability Gain：

> 我能围绕一个真实业务问题找清关键角色，并区分谁使用、谁受影响、谁负责结果、谁提供条件、谁批准。

Self Assessment：

- 我不会再把“用户”当成项目里唯一重要的人；
- 我能指出谁对结果负责、谁拥有关键依赖或决策权；
- 我能把未经确认的组织责任标成待确认，而不是让 AI 猜。

Trigger Scenario：

> 当一个 AI 方案看起来“用户很需要”，但团队说不清谁提供数据、谁负责错误、谁批准试点或谁长期维护时，应想到这节课。

Next Lesson Value：

> 角色找清以后，下一步要从正确的人和记录中获得事实：现在到底花多少时间、发生多频繁、哪里出错、造成多大影响。

## Anti-repeat / deferred boundary

- ≠ Track 03 Audience：Track 03 的 Audience 关注市场/客户对象；T5-02 关注一个解决方案项目内部的责任、影响和决策角色；
- ≠ T4-06 Responsibility：T4-06 分配 Workflow 节点由 AI / code / tool / human 谁执行；T5-02 识别业务项目中谁使用、承担结果、提供条件和批准；
- ≠ T5-14 Adoption：这里识别角色，不教 change management / training / trust；
- ≠ T5-15 Ownership：这里识别当前责任与决策角色，不定义长期运营模型；
- 不教完整 RACI / org design；
- 不配置 IAM / RBAC / ABAC；
- 不推断真实公司内部权限。

## Grounding

默认使用：

- OPC / 一人公司线索跟进、客服、内容业务；
- Track 03 business context；
- T5-01 Problem Observation Notes；
- REVIEWED_KNOWLEDGE。

使用真实企业组织案例时，只描述公开确认的职责；不得把推测的内部决策关系写成事实。

---

# T5-03 — 现在到底有多慢、多贵、多容易出错

Primary Knowledge Home: **Current-State Baseline / Cost-of-Problem**
Lesson Type candidate: **APPLICATION**

Canonical learner result:

> 能为一个已确认的业务问题建立最小可用 Current-State Baseline，把时间、数量/频率、成本、质量、错误/风险等当前事实与估算、缺失数据分开，为后续价值判断提供比较起点。

## Learner problem

很多 AI 项目只知道：

- “现在很慢”；
- “人工成本很高”；
- “经常出错”；
- “大家都不满意”。

这些描述足以说明有问题，却不足以在 Pilot 后回答：

> 到底有没有变好？

如果没有 Baseline，项目结束后容易变成：

- “感觉快了一点”；
- “大家觉得不错”；
- “AI 应该节省了很多时间”。

而无法判断真实业务结果。

## Core judgment

**Baseline 不是预测 AI 能带来多少收益，而是记录“现在到底是什么样”。没有当前事实，就没有未来可比较的 Outcome。**

最小 Baseline 从与当前问题真正相关的维度中选择，不要求每课全部填写：

1. **时间**：完成一次 / 一周 / 一月花多久；
2. **数量 / 频率**：多久发生一次、处理多少件；
3. **直接成本**：人工、外包、工具等已知成本；
4. **质量**：返工、遗漏、一致性、通过率等可观察指标；
5. **错误 / 风险**：错误次数、严重问题、人工升级等；
6. **业务结果**：只有当它与当前问题直接相关且已有可靠数据时才记录。

每个数据必须标记：

- 已测量事实；
- 合理估算；
- 主观感受；
- 尚未获取。

## Previous → Current → Next

Previous T5-02：

已有 Stakeholder Map，知道应该向谁确认流程、数据、结果与权限。

Current T5-03：

从正确来源记录当前事实，建立未来可比较的 Baseline。

Next T5-04：

把 T5-01 问题观察 + T5-02 Stakeholder + T5-03 Baseline 收敛成正式 Problem Statement / Scope / Constraints。

本课不提前定义 Target State 或 Value Hypothesis。

## Step 1 — 建立直觉

只建立一个直觉：

> **“现在很慢”不是 Baseline；只有未来还能用同一口径比较的事实，才是 Baseline。**

轻量例子：

“做 AI 日报很耗时间”很模糊；“最近 10 个工作日，从开始收集到可发布平均约 3 小时，其中人工查证和审核约占一半”才接近可比较事实——前提是数据真实存在。

## Step 2 — 讲透方法

完整案例使用“AI 日报生产成本”。

已知事实示例可以明确标为“案例数据”，例如：

- 每个工作日 1 期；
- 一周 5 期；
- 过去一周记录到总处理时间 15 小时；
- 其中查证与审核约 8 小时；
- 5 期中有 2 期因事实核对返工；
- 暂无可靠的“每篇带来多少转化”数据。

两张核心对比卡建议：

**卡片 A：感受型 Baseline**

“很慢、很累、经常返工、应该能省很多时间。”

**卡片 B：可比较 Baseline**

“统计周期、处理量、总耗时、关键返工次数、数据来源、未知项。”

重点讲清：

**同一口径 + 明确周期 + 数据来源 + 事实/估算分离。**

## Step 3 — 检查理解

1. **SINGLE_CHOICE / BEST_JUDGMENT**
   哪条更适合作为 Baseline：“过去 4 周平均每周处理 80 条线索，人工整理约 5 小时”优于“线索很多，很费时间”。

2. **TRUE_FALSE / MISCONCEPTION**
   “为了让 Business Case 完整，可以先让 AI 根据经验估算目前成本和错误率。” → 错。

3. **MULTI_SELECT / BOUNDARY_CONDITIONS**
   Baseline 应关注：测量周期、口径、来源、当前值、事实/估算/未知状态；不要求现在设定未来目标或 ROI。

## Step 4 — 实操

练习产物：**Current-State Baseline / 当前状态基线表**

建议场景：

“运营人员每周整理内容线索并跟进。已知过去 4 周每周约 60～90 条线索；团队只记录了处理总时长，没有完整记录遗漏率、成交率和重复跟进次数。”

Practice 字段必须围绕**学习者自己想看清的现状问题**设计；课程案例只负责一键填充示范。可使用：

1. **我现在最想看清的现状问题**
2. **我目前已经有的数字或记录**
3. **我现在观察到但还没完整统计的问题**
4. **这些信息分别来自哪里**
5. **我希望 AI 帮我补充判断什么**

Reference Fill 要求 AI：

- 先理解学习者自己想看清的现状问题；
- 分析每项信息属于可作为当前基线的事实、估算、主观观察还是未知；
- 判断现有信息是否足够支持未来比较，并指出最关键的数据缺口；
- 只保留与当前问题直接相关的指标，优化成一份带统计周期、当前值/状态、来源与证据质量的当前状态基线；
- 最后给出下一步最值得补采的 2～3 项数据；
- 不虚构任何数字；
- 不使用行业平均值替代真实现状；
- 不设定改善目标；
- 不计算投资回报；
- 不提出解决方案。

## Artifact input

- T5-01 Problem Observation Notes；
- T5-02 Stakeholder Map；
- 现有业务记录 / 人工观察 / 可获得数据。

## Artifact output

**Current-State Baseline**

至少包含：

- metric / observation；
- current value or state；
- measurement period；
- source；
- evidence quality（measured / estimated / subjective / unknown）；
- missing data。

该产物将进入：

- T5-04 Problem Statement；
- T5-06 Value Hypothesis；
- T5-11 Pilot Design；
- T5-13 Baseline-to-Outcome Evaluation。

## Must-retain judgments

- Baseline 记录“现在”，不预测“以后”；
- 没有相同口径的 Baseline，Pilot Outcome 无法比较；
- 不是指标越多越好，只记录与问题相关的最小事实；
- 时间、频率、成本、质量、错误/风险都是候选维度，不要求机械全填；
- 测量事实、估算、主观感受和未知必须分开；
- 没有数据时应记录缺口，而不是让 AI 补数字；
- AI 可以整理、检查口径和发现缺失项，但不能生成真实业务 Baseline。

## Step 6 — 能力获得

Capability Gain：

> 我能把“现在很慢、很贵、经常出错”变成一组有周期、有来源、未来可以比较的 Current-State Baseline。

Self Assessment：

- 我能区分测量事实、估算、感受和未知；
- 我能选择与当前问题真正相关的少量 Baseline，而不是堆指标；
- 我不会为了让方案看起来完整而让 AI 猜业务数据。

Trigger Scenario：

> 当团队准备讨论“AI 能省多少时间、降低多少成本、提升多少质量”，却没人能说清目前的真实水平和数据来源时，应想到这节课。

Next Lesson Value：

> 问题现象、关键角色和当前事实都清楚以后，下一步才能把这些材料收敛成一个真正可执行、边界明确的 Problem Statement。

## Anti-repeat / deferred boundary

- ≠ T2 Data：Track 02 教如何理解和分析数据；T5-03 决定一个 FDE 项目为了未来比较，最低需要记录哪些当前业务事实；
- ≠ T4-15 Workflow Evaluation：T4-15 检查 Workflow 是否按预期运行；T5-03 建立业务问题进入方案前的 Current-State Baseline；
- ≠ T5-06 Value Hypothesis：本课只记录当前成本/表现，不判断“值不值得投入多少”；
- ≠ T5-13 Evaluation Decision：本课建立 Before，T5-13 才用 Pilot Outcome 与 Baseline 做投资判断；
- 不教完整财务模型；
- 不做复杂统计推断；
- 不要求数据仓库、BI 或 observability engineering；
- 不虚构缺失数据。

## Grounding

默认优先使用：

- 学习者已有真实业务记录；
- OPC / 一人公司的内容、线索、客服、运营复盘场景；
- Track 02 已掌握的数据理解能力；
- T5-01 / T5-02 产物；
- REVIEWED_KNOWLEDGE。

只有使用真实外部企业指标或行业 benchmark 时才需要 current public-source grounding；行业 benchmark 不能替代学习者自己的 Current-State Baseline。

---

# 5. Batch A Course Builder handoff contract

只有以下条件全部满足，才允许 Batch A 进入 Course Builder：

- T5-01～T5-03 三份 Formal Brief 均存在；
- 每课 Primary Knowledge Home 唯一；
- previous → current → next continuity 明确；
- 三个 Step 4 Practice 训练不同能力，不复用固定字段模板；
- T5-01 不提前定义 Problem Statement / Solution；
- T5-02 不退化为 Audience / 用户画像，也不提前教授 Adoption；
- T5-03 不提前做 Target / ROI / Business Case；
- Track 04 Workflow knowledge 只作为 inherited capability；
- Technical / Enterprise 实现保持 Deferred；
- Grounding 可以由现有真实业务上下文 + REVIEWED_KNOWLEDGE 支撑；
- 不新增 UI / CSS / Renderer / interaction type。

Context handoff:

```text
TRACK05_CATALOG_CONTEXT_V1
+ TRACK05_SIX_STEP_AUDIT_V1
+ TRACK05_BATCH_A_T5_01_T5_03_FORMAL_BRIEFS_V1
+ FIVE_TRACK_CAPABILITY_CONTINUITY_V1
+ DEFERRED_KNOWLEDGE_LEDGER_V1
+ current grounding
→ PREPARE_GROUNDING
→ PREPARE_FORMAL_BRIEF
→ courseContextReady=true
→ Current Course Builder Skill
```

## 6. Current Gate

**BATCH_A_FORMAL_BRIEF_APPROVED_V1 → COURSE BUILDER DRAFT T5-01～T5-03**

本文件批准的是教学边界与生产 Context，不代表 Lesson Draft、Human Review、LessonSpec、Runtime 或 AVAILABLE 已完成。
