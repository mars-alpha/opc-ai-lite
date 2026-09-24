# Beginner Lesson Quality Standard v1

Status: **QUALITY_BASELINE_V1**

适用范围：Foundation Beginner Lesson，以及后续面向零基础学习者的入门课。

## 1. 核心目标

一节 Beginner Lesson 的质量，不以“讲了多少知识”为标准，而以这三个结果为标准：

1. 学习者在第一屏就知道“这和我有什么关系”；
2. 学习过程中始终只解决一个主问题；
3. 学完后能说出“我现在会做什么”。

## 2. Cognitive Load Budget

每节课固定预算：

- 1 个主问题；
- 1 个主概念或判断；
- 最多 1–2 个新核心术语；
- 1 个主要案例；
- Step 1 bottomDetails 最多 2 条；
- Step 2 knowledgeDepth.example 最多 2 条；
- Step 5 主 Review 不设固定数量，只保留本课真正需要长期复用的判断；
- Step 5 `knowledgeDepth.review` 必须保留补充说明层，但数量不固定；只保留真正能进一步解释主卡片的内容，不为版式凑数；
- 不在第一屏或 Check 里提前出现后续课程才需要的专业术语。

如果内容超出预算，优先后移，不通过“再加一张卡片”解决。

## 2.1 Learner-facing Language

面向零基础学习者的课程文案固定遵守：

- 中文表达优先；
- AI 专业术语第一次有意义地出现时默认使用“中文（English）”，例如：提示词（Prompt）、上下文（Context）、迭代（Iteration）；但 RAG、API、MCP 等行业常用技术缩写使用“中文解释（缩写）”，例如“检索增强生成（RAG）”，不展开英文全称；
- 首次说明后优先继续使用中文，不反复堆叠英文；
- 内部工程 / Schema / Artifact 名称不直接作为学习者主要文案，例如 Task Brief 应显示为“任务说明”，Context Pack 应显示为“上下文资料包”；
- 默认 OPC / 自媒体 / 内容运营可以继续作为课程背后的 Case Thread，但除非业务语境确有必要，不在学习者正文反复凸显品牌或行业标签；
- 学习者看到的是可迁移的真实任务，教学设计层保留业务连续性。

固定原则：**内部工程语言 ≠ 学习者界面语言；Case Logic 可以稳定，前台表达必须自然、通用。**
## 2.2 Six-step Content Integrity

六步 Shell 只定义结构，不代表六步内容自动正确。每次 Draft 新版本、Continuity Rework 或 Case Thread 调整后，必须逐步重新确认：

1. EXPLAIN：当前版本真正要建立的直觉；
2. EXAMPLE：当前版本的案例与 Before / After；
3. CHECK：必须使用当前版本知识与案例重新生成三题 Mastery，不允许静默继承旧 Draft 的题目；
4. PRACTICE：必须存在与当前课目标一致的真实学习动作；
5. REVIEW：只复盘当前版本真正教过的判断；
6. CAPABILITY：必须对应当前版本实际获得的能力与 Next Reuse。

特别规则：

- APPLICATION / PRACTICE / PROJECT 的 Step 4 必须有可执行 Practice；
- CONCEPT 可以不设置 PRACTICE Completion Gate，但如果六步 Shell 包含 Step 4，则必须提供真实可操作的轻量 Participation，例如分类、短答、MINI_TASK；不能只有标题、说明文字或空白区域；
- 新 Draft 若通过 spread / inheritance 复用旧 Draft，checkSequence、Practice / Participation、Review、Capability 必须逐项重新确认，不能默认继承即正确；
- Preview 发现 Step 内容与当前 Brief 不一致时，视为 Content Integrity FAIL，不得进入 Human Review PASS。

固定原则：**Six-step structure PASS ≠ Six-step content PASS。**
## 2.3 Mandatory Six-step Knowledge Point Rule

从本规则生效后，**所有新正式课程**，无论属于 Foundation / 工作应用 / 推广运营 / Workflow / FDE，均统一使用六步教学结构：

1. EXPLAIN — 建立直觉
2. EXAMPLE — 讲透方法
3. CHECK — 检查理解
4. PRACTICE — 动手实操
5. REVIEW — 复盘框架
6. CAPABILITY — 能力获得

这不是 Beginner 专属样式，而是 OPC 新课程的统一 Instructional Contract。

每一个正式 Primary Knowledge Point / Primary Knowledge Home 在进入 Course Builder 前，都必须回答：

- Step 1：为什么值得学、与真实任务有什么关系；
- Step 2：核心规律 / 方法是什么，并用例子讲透；
- Step 3：如何验证学习者真的会判断；
- Step 4：学习者能完成什么最小动作 / 产物；
- Step 5：以后真正应该保留哪些可复用判断；
- Step 6：最终获得什么可执行能力，如何自我验收，以及下一步如何继续。

如果一个知识点无法合理形成这六步，不允许为了凑结构硬写内容。必须先回到 Curriculum / Formal Brief 重新判断：

- 是否知识点过小，应并入相邻 Lesson；
- 是否知识点过大，应拆分 Primary Knowledge Home；
- 是否只是辅助知识，不应成为独立正式 Lesson；
- 是否还缺真实应用 / 判断边界，尚未达到正式生产条件。

固定原则：**每个正式知识点都必须通过六步教学检验；不能通过六步检验的知识点，不直接进入正式课程生产。**
## 2.4 Curriculum Audit Use of Six-step

六步同时是课程目录审计工具，而不只是单课生产规则。

对每个候选 Primary Knowledge Point，必须先判断：

- 它是否解决一个独立、真实的学习者问题；
- 是否拥有清晰且不可被相邻课替代的核心规律；
- 是否可以通过判断题检验真正理解；
- 是否能产生一个最小真实动作 / 产物；
- 是否能留下清晰、完整、可长期复用的判断；
- 是否形成一个能被后续课程继续调用的新能力。

审计结论只允许：

- KEEP：保留为独立核心 Lesson；
- MERGE：并入相邻知识点；
- SPLIT：知识过大，拆成多个 Primary Knowledge Home；
- SUPPORTING_KNOWLEDGE：必须知道，但不独立成课；
- DEFER：移到后续进阶 / 选修；
- REMOVE：对主能力链价值不足。

固定：**知识名词存在 ≠ 值得独立成课。课程目录由能力价值和六步可教学性共同决定。**

目录设计顺序固定为：

Capability Map
→ Knowledge Map
→ Six-step Knowledge Point Audit
→ Course Directory
→ Formal Brief
→ Course Builder

Lesson Type 只改变 Step 4 的深度与 Completion Gate，不改变六步结构：

- CONCEPT：Step 4 为轻量可操作 Participation，可不作为 Completion Gate；
- APPLICATION：Step 4 为真实小任务 / Practice；
- PRACTICE：Step 4 为更完整的技能训练；
- PROJECT：Step 4 为阶段性项目产物 / Deliverable。

进阶课程可使用图文、流程图、代码、截图、实验等更丰富媒体，但仍必须通过同一六步检验。

## 3. Six-step quality bar

### Step 1 — 建立直觉

教学责任固定，表现方式不固定。第一屏必须让学习者在不需要先理解复杂业务背景的情况下，快速明白“这是什么问题、为什么值得学、最重要的判断是什么”。可以从现象、问题、误判、简短场景或对比进入，不规定固定叙事顺序，也不要求统一使用某种句式或标签。

第一屏不承担完整案例、完整知识解释、复杂边界判断，也不承担后续知识预告。若去掉业务名称、数字、角色或次要条件后仍能提出同一个核心疑问，就应优先去掉这些信息，把它们留给 Step 2。

Step 1 与 Step 2 必须通过“信息增量”区分：Step 1 只给问题直觉、学习价值和一句核心判断；Step 2 才出现完整案例、具体对比、结果和判断依据。若两步可互换或大段内容相同，视为 **STEP_1_2_OVERLAP_FAIL**。

### Step 2 — 讲透方法

只制造一个“原来如此”时刻。

Step 2 必须用一个真实案例让核心规律变得可见。当前 Unified Lesson Shell 在案例正文和结果之间保留两张中间对比卡片，所有正式课程必须填充这两张卡片。内容可以是“原来的做法 / 调整后的做法”，也可以承载错误 / 正确、边界 A / 边界 B、只改变一个变量前 / 后等与课题更匹配的对比；重点是两张卡片共同把本课规律讲透，不能缺失，也不能机械复制同一句式。

不把 Step 2 变成第二章理论课；两张卡片固定存在，但卡片里教什么必须由课题决定。

六步顶部说明统一保持简短，只说明当前动作，不承担正文教学；目标是一句话，在正常桌面宽度下不超过两行。

### Step 3 — 检查理解

三题 Mastery 保持：

1. SINGLE_CHOICE / BEST_JUDGMENT
2. TRUE_FALSE / MISCONCEPTION
3. MULTI_SELECT / BOUNDARY_CONDITIONS

题目必须像真实判断，不考术语定义。

### Step 4 — 动手实操

目标不是“出现一个互动控件”，而是让学习者真的完成一个最小动作并留下结果。

APPLICATION：

- 一个很小、可以完成的真实任务；
- 卡住可看 Hint；
- 必须有可理解的参考答案或参考填充机制；
- 适合时允许“一键填充参考答案 / 复制自己的结果 / 复制参考答案 / COPY_TO_AI”；一键填充后的字段按顺序组合，必须已经是可以直接复制给 AI、并得到本课目标输出的完整任务，而不是字段解释。
- Practice 不首次引入新核心知识。
- 当 Hint / 操作提醒存在多条时，学习者界面优先按 **1、2、3…** 编号整框排列，不用重复相同标签，也不压成连续段落。

CONCEPT：

- 只做轻量分类 / 判断 / 短答 / MINI_TASK；
- 不新增 Completion Gate；
- 只要要求学习者输入或产出内容，就必须提供至少一种辅助：Hint、参考答案、参考填充或 Copy；
- 不能只有说明文字和“完成这一步”按钮。

### Step 5 — 复盘框架

Step 5 的主体是“这一课以后真正要留下的知识 / 判断框架”，不是误区卡片集合。

规则：

- Step 5 上方主 Review 卡片固定围绕 **AI适合做什么 / AI不应该替你做什么** 两个核心方向回答；这两个方向属于统一复盘框架，不能删除或改成完全自由命题。
- 主卡片数量不固定；同一方向可以根据本课知识密度拆成多个能力边界或判断，只以是否把课程讲透为准，不为版式凑数。
- 每张主卡片必须给出本课独有、以后能直接调用的具体回答正文，不能只有标题，也不能退化成“AI可以辅助你 / AI不能替你决定”等泛化口号。
- mistakes / 误区只作为辅助纠偏，不得取代 Review 主体；
- “容易踩的坑”如果有多条，使用独立白色卡片按 **1、2、3…** 顺序排列；每项直接展示“问题 + 正确理解”，不重复使用“注意”等相同标签；
- 主卡片下方必须保留 `knowledgeDepth.review` 说明层，使用“明确命题 + 回答/解释”方式组织；每项先提出当前课题的明确判断，再解释为什么、边界、使用条件或容易混淆之处。说明数量由课题需要决定，不固定为 1、2 或其他数量。
- 上方主卡片负责形成两个核心方向的复盘框架，下方说明负责解释框架背后的原因与边界；两层不能机械重复，也不能把真正的核心回答藏到下方；
- 不重新复述整节课，也不引入新知识。

### Step 6 — 能力获得

Step 6 要回答四件事：

1. **我现在能做什么**：Capability Gain 必须是可执行能力，而不是“我理解了”；
2. **我怎么知道自己真的会了**：Self Assessment 至少给出 2 个可以自我判断的证据；
3. **遇到什么情况，我应该想到这节课**：每节课都必须描述一条独立、具体、可以在现实工作中识别的触发情境，让学习者以后遇到类似问题时马上知道应该调用这项能力；它与“下一步为什么值得继续”是两份不同内容，禁止用下一课预告代替触发场景；
4. **下一步为什么值得继续**：Next Lesson Value 要说明能力如何自然延伸，而不是只报下一个知识名词。

固定原则：**Capability 不是结课口号，而是学习结果的自我验收。**

### 3.2 Market scope default

课程案例或练习如果涉及市场分析、用户需求、竞争、价格、渠道、市场规模等商业判断，且 Brief 未指定地区，默认使用**中国市场**。其他地区只在课程目标明确需要时出现，并必须在学员可见任务里说明地区边界。

## 3.1 Every-step Clarity Gate

六步课程的最终目标不是“把六个页面做出来”，而是让学习者在每一步都明确理解一个核心问题：

1. 建立直觉：**为什么这件事值得学、和我有什么关系？**
2. 讲透方法：**这件事最核心的规律 / 方法到底是什么？**
3. 检查理解：**我是不是真的会判断，而不是只听懂了？**
4. 动手实操：**我能不能亲手完成一个最小真实动作；需要 AI 时，我写出的内容能不能直接让 AI 执行？**
5. 复盘框架：**以后再遇到类似问题，我真正应该记住哪些判断？**
6. 能力获得：**我现在真正会做什么，怎样证明自己会了，什么情况会让我想到调用这项能力？**

Production / Human Review 必须逐步回答以上问题。任何一步如果只有版式、标题、卡片或交互，但没有把本步核心知识说清楚，均视为 **STEP_FOCUS_FAIL**。

“讲清楚”不等于堆更多文字。优先使用：
- 一句明确结论；
- 一个能解释结论的例子；
- 一个边界或反例；
- 一个让学习者亲自判断 / 操作的动作。

固定原则：**少展示，多理解；每一步只解决一个最重要的问题，但必须把这个问题讲透。**

Anti-template rule：同一六步可以产生完全不同的课程表现。Formal Brief / Course Builder 必须先根据当前课题确定必要知识与学习动作，再决定案例形式、Practice 字段和文字组织；不得因为 reference lesson、上一课或既有 UI 曾使用某种结构，就把它升级成默认教学模板。

## 4. Forbidden beginner drift

除非该课就是对应 Primary Knowledge Home，否则 Beginner opening 不得顺手引入：

- Training / Inference
- Token mechanics
- Embedding / Vector Search
- API / Tool / MCP
- Agent internals
- Deterministic Logic taxonomy
- Evaluation engineering

“以后会学”也优先用中文自然语言描述，不提前堆专业名词。

## 5. Production rule

Course Builder 生产 Beginner Lesson 时必须同时通过：

Curriculum Brief
→ Beginner Cognitive Load Budget
→ Six-step quality bar
→ Automated structural acceptance
→ Human Review

技术 PASS 不等于教学 PASS。
