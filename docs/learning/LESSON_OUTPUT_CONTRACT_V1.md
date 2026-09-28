# Lesson Output Contract v1

Status: **APPROVED_BASELINE_V1**  
Owner: **Current Course Builder Skill + Deterministic Validators + Human Review Gate**

本规范固定“Formal Brief 已经批准后，一节正式课程应该怎样被输出”。它不新增 Skill，不改变 Unified Lesson Shell，不替代 Six-step Knowledge Point Gate。

## 1. Production position

固定链路：

Curriculum / Knowledge Map
→ Formal Lesson Brief
→ Current Course Builder Skill
→ Lesson Output Contract
→ Deterministic Validators
→ Human Review Gate
→ LessonSpec Registry
→ Runtime Provisioning
→ Runtime Acceptance
→ AVAILABLE

Curriculum 决定学什么和顺序；Formal Brief 决定知识边界；Course Builder 决定怎样把知识教会；Lesson Output Contract 约束输出形态与教学职责。

## 2. Six-step output contract

### Six-step construction method

六步固定的是**每一步的教学责任**，不是固定文案、固定案例模板、固定字段数量或固定答案形状。每节课必须从当前课题、Primary Knowledge Point、Learner Question 和能力目标重新判断怎样教，不得因为上一课或某一 reference lesson 使用了某种结构，就机械复制其外形。

构建顺序固定为：

1. **EXPLAIN — 建立直觉**：让学习者快速明白“我遇到的是什么问题、为什么值得学、本课最重要的判断是什么”。开场可以用真实现象、常见误判、直接问题或简短场景，只保留理解核心问题所需的信息；完整案例、复杂条件与方法展开后移到 Step 2。
2. **EXAMPLE — 让规律在一个真实任务里变得可见**：使用一个自然、可迁移的业务 / 工作场景证明核心规律。当前 Unified Lesson Shell 中间的两张对比卡片必须有内容，用来呈现“原来的做法 / 调整后的做法”或与本课等价的错误 / 正确、边界 A / 边界 B、单一变量变化前 / 后；卡片内容由课题决定，但不能缺失，也不能只是重复 Step 1。
3. **CHECK — 证明学习者真的会判断**：只检查 Step 1–2 已经教过的内容，重点验证判断依据、误区和边界，不考定义背诵。
4. **PRACTICE — 让学习者亲手完成一个最小真实动作**：练习必须直接服务本课能力。字段数量不预设；字段存在的唯一理由是帮助学习者完成这次真实任务。若提供 COPY_TO_AI，所有字段组合后必须已经是一份完整、准确、上下文足够、可直接执行的任务；Reference Fill 是各字段的标准直接值，Reference Answer 是同一份标准任务的纯正文，不带字段主标题。
5. **REVIEW — 留下以后还能调用的判断框架**：围绕本课真正需要长期留下的判断完成复盘；主卡片最低结构、数量边界、说明层与知识覆盖要求统一见本文件下方 **Step 5 — REVIEW**，本概览不重复规则正文。
6. **CAPABILITY — 把课程转成可调用能力**：明确“我现在会做什么 / 我怎样知道自己会了 / 遇到什么情况我应该想到这节课 / 下一步为什么值得继续”。其中“遇到什么情况，我应该想到这节课？”是对**本课能力适用场景与本课价值的总结说明**：说明现实中出现什么问题时，这节课学到的能力正好适用、可以解决什么；不得写成“我会先…… / 接下来应该……”式操作引导，也不得写成课程编排说明或下一课预告。

总原则：**Topic first, responsibility fixed, representation flexible.** 先由课题决定需要教什么，再决定每一步怎样表达；六步负责防止知识没教会，不负责把所有课程做成同一种版式。

### Anti-template / cross-lesson separation gate

同一 Production Batch 内，Course Builder 可以共享数据结构、类型和装配代码，但**共享 helper 不得承担课程文案责任**。Step 1 标题 / 核心与边界说明、Step 3 objective、Step 4 字段名与字段问题、Step 4 总提示与反思、Step 5 mistakes / pitfalls、Step 5 复盘标题与说明、Step 6 objective 等都必须从本课 Primary Knowledge Home 和能力目标重新生成；整批复用同一句或同一组字段只换 lesson title，判定 `LESSON_TEMPLATE_DRIFT_FAIL`。

Step 4 的字段标题必须直接对应本课要训练的认知动作或业务判断，例如状态课训练“状态 / 进入条件 / 允许动作 / 离开条件”，失败恢复课训练“失败类型 / 可恢复性 / 重试安全 / 停止与转人工”；不得用“真实业务场景 / 已有事实与规则 / 要做的设计 / 输出边界”之类跨课程通用四字段承载所有课。

Step 5 的 mistakes / pitfalls 必须列出**本课最可能出现的具体误判**，不得跨课程复用“技术上能做就应该做 / AI 不应补规则 / 跑通一次就算完成”等通用三句。固定 Review 方向仍为 **AI适合做什么 / AI不应该替你做什么**，但正文必须只回答当前课程。

相邻课程允许承接上一课已经形成的结果，但不得重复教授上一课 Primary Knowledge Home。若两个课程的 Step 1～6 大部分仍在解释同一核心判断，或后一课只是换案例重复前一课的方法，判定 `CROSS_LESSON_KNOWLEDGE_OVERLAP_FAIL`。Human Review 必须特别检查相邻课的“本课新增判断是什么、上一课已经教过什么、下一课才展开什么”。

学员可见的每一步顶部 objective 只负责一句话说明“这一页要做什么”，课程知识、案例、边界和操作要求必须放在本步正文，不得把 objective 写成长段。**六步顶部进度卡片从本课 step.navigationDescription 读取独立描述，逐步准确说清该课当前要学、要判断或要做什么；每张卡片显式两行，每行不超过 9 字，正常桌面宽度下显示不超过两行。不得复用整套通用句，也不得截取课程 step title / objective 代替。navigationDescription 只服务顶部进度卡片，不得进入底部页码。底部页码固定只显示 `1 / 6`～`6 / 6`，页码前后不得附加任何描述。**

正式课程输出还须同时准备以下学员入口文案；这些是课程内容数据，由统一 Shell 展示，不增设页面或交互：

- **学习建议**：`learningRecommendation` 用一句话说明本课会解决什么问题，以及学员开始前可以做的具体准备或补足哪项知识。只在本课确实依赖旧知识时建议回看相应内容，不默认写“复习上一课”。一句话以句号收束，总长不超过 52 字；桌面端须完整显示在两行内，不能靠省略号隐藏必要信息。
- **进度卡片**：六步分别依据本课教学动作写独立的 `navigationDescription`，每条显式换行两行、每行不超过 9 字。六条应分别说明对应步骤的具体任务，不能给不同课复用一组六句通用文案；缺失、空行、超长或重复的描述不得进入正式 Runtime。Step title / objective 与进度卡片各有用途，不互相替代。
- **底部页码**：统一只显示 `当前步 / 6`，即 `1 / 6、2 / 6、3 / 6、4 / 6、5 / 6、6 / 6`。不得在页码前拼接 `navigationDescription`、步骤摘要、教学提示或课程专属描述；课程差异只体现在顶部进度卡片和正文。
- **Step 1 底部说明**：当课程使用当前 Shell 的 intro comparison 呈现时，在 takeaway 之后给出本课自己的 `bottomDetails`，补上学员理解核心判断所需的原因或区分点，不直接重复 takeaway，也不提前讲 Step 2 的完整案例。条数按知识需要决定；零基础课程最多两条。课程 Preview 与 Human Review 必须实际查看底部是否出现、内容是否帮助理解。

### Learner-facing language rule

所有学员可见文案默认中文优先：
- **先说人话，再决定是否需要术语**：面向零基础学习者，先用日常工作语言把意思讲懂，再在确有学习价值时补充专业名词。若一句话去掉英文术语后反而更容易理解且不损失知识，就必须使用中文自然表达。不得把课程写成行业报告、咨询框架或术语表。
- **普通业务术语不因行业常见就保留英文**：如 ICP、Audience、Business Fit、Problem Fit、Value Fit、Evidence、Assumption、Priority、Exclusion、Use Case、Trigger、Current Behavior、Friction、Desired Outcome、Value Proposition、Message Hierarchy、Primary Value、Proof、Secondary Detail、Next Step、CTA、HITL、Growth Review、Landing、Lead、Dashboard 等，学员端统一翻译成自然中文，例如“行动引导”“转人工 / 人工接管”“增长复盘”“承接页面”“线索”“数据看板”；这些不是必须掌握的 AI 通用技术词。
- 非必要英文名称不得直接展示给学员；例如 `Clear Task Brief` 应写成“清晰任务说明”。`Beginner` 应写“初学/初学者”，`Schema` 若不是本课必须掌握的通用术语，应写“结构规则/数据结构规则”；`Goal / Observe / Decide / Act / Stop` 等过程说明优先使用自然中文。
- AI 常用行业术语首次出现默认采用 **中文（English）**，例如“提示词（Prompt）”，后续正文优先使用中文简称。**行业常用技术缩写是例外**：如 RAG、API、MCP，学员端使用“中文解释（缩写）”，例如“检索增强生成（RAG）”“应用程序编程接口（API）”“模型上下文协议（MCP）”；不展开英文全称，避免增加阅读负担。课程标题、阶段内课名、Step 标题，以及学习路径 / 课程表中的阶段说明与课程名称同样适用：普通专业术语遵守中文（English）；行业常用技术缩写使用“中文解释（缩写）”。
- 内部 lessonId、Artifact ID、Schema 名、状态名、课程编排编号等不得出现在学员可见文案中。
- **课程生产与跨板块说明不得进入学员正文**：`Track 03 / Track 04`、Batch、handoff、Workflow Gate、“为下一板块准备输入”“系统化候选”等只属于内部规划或课程治理。当前课只讲当前 Primary Knowledge Home；不得为了说明后续课程边界而把与本课无关的自动化、系统架构或下一板块目标写进 Step 1～6、Check、Practice、Review、Knowledge Depth、Capability 或 Next Lesson Value。
- Deterministic language gate 必须扫描完整学员可见 Draft，包括 Step 文案、intro comparison、Knowledge Depth、Check、Practice、Review、Self Assessment、Trigger Scenario、Capability Gain 与 Next Lesson Value；发现普通业务 / 生产英文标签裸露、内部 Track / Batch / handoff / Workflow 说明或与本课无关的后续板块目标时判定 `LEARNER_LANGUAGE_FAIL` / `CROSS_TRACK_CONTENT_FAIL`。Human Review 继续判断中文是否自然、口语化、像在教人做事，而不是只检查“有没有英文”。

### Step 1 — EXPLAIN

目标：让学习者在最短路径内先看懂“我遇到的这个现象为什么会发生，这节课要帮我解决什么问题”。

必须：第一屏只围绕一个主问题，让学习者无需先理解复杂业务背景就能进入课程。标题和正文应直接、自然、容易理解；可按课题需要使用现象、问题、误判、简短对比或其他方式建立直觉，不固定叙事顺序。若开场需要先解释多个业务事实、角色、数字或条件，说明信息量已经超过 Step 1，应把这些内容后移到 Step 2。

禁止：先堆定义；一开始就展开完整案例；为了“真实”而加入不影响核心疑问的业务细节；同时让学员处理现象、事实边界、方法和结论多层判断；为了后续 Artifact 反推不自然开场；一次塞入多个后续知识。

固定输出责任：**问题直觉 + 学习价值 + 一句核心判断**。不输出完整方法步骤，不展开 Step 2 的业务案例。

若采用 intro comparison，第一步底部说明承担核心判断的简短解释；不能只有场景、两张做法卡和一句 takeaway 就结束，也不能把第二步的案例搬回来凑说明。

Deterministic overlap gate：Step 1 的 `situation`、对比卡正文和底部说明不得直接复用 Step 2 的 `example.situation / before / after / result`；也不得通过代码从 `lesson.example` 自动派生 Step 1。任一主要字段直接复用、或 Step 1 与 Step 2 大段可互换，均视为 `STEP_1_2_OVERLAP_FAIL`。

### Step 2 — EXAMPLE

目标：用一个真实案例直接证明当前课的核心知识。

必须：案例直接服务当前 Primary Knowledge Point，并让学习者看见核心规律如何影响真实结果；Beginner 应制造一个清楚的“原来如此”时刻。当前 Unified Lesson Shell 必须填充 example.before 与 example.after，确保案例正文与“结果”之间存在两张有意义的中间对比卡片；两张卡片的实际关系可按本课使用原来的做法 / 调整后的做法、错误 / 正确、边界 A / 边界 B 或单一变量变化前 / 后，不允许为空，也不能为了有卡片而重复同一句结论。案例可沿用 Formal Brief 已批准的能力连续性或任务方向，但学员可见正文必须自然成立，不得出现“继续前几课”“沿用 OPC / 自媒体任务”等内部课程生产说明。

禁止：为了下一课 handoff 硬造案例；只换皮重复 Step 1；提前教授后续课程知识。

固定输出责任：**具体案例 + 对比 + 结果 + 判断依据 / 边界**。Step 2 必须提供 Step 1 没有展开的新信息。

### Step 3 — CHECK

目标：证明学习者已经理解，才进入实操。

默认 Mastery Sequence：SINGLE_CHOICE / BEST_JUDGMENT → TRUE_FALSE / MISCONCEPTION → MULTI_SELECT / BOUNDARY_CONDITIONS。

必须：只检查 Step 1–2 已经教过的判断；题目像真实情境判断，不是术语背诵；错误反馈解释为什么错，正确反馈解释为什么对。三题 Mastery 中，当前题一旦答对，当前选项与“检查答案”立即锁定，不允许再次改选或重复提交；在学习者主动点击“下一题”前，当前正确题与“下一题”入口必须稳定保留。答错时继续允许修改并重试。

固定输出责任：**最佳判断 → 常见误区 → 边界条件**，三题只验证已教内容。

### Step 4 — PRACTICE

学员可见文案只描述学习动作本身，不展示课程实现或编排说明。除非本身就是学习任务的一部分，否则不得出现“是否需要把 AI 回复粘贴回来”“是否评分”“是否作为 Artifact”“下一步如何回填”等内部流程说明。

目标：把前三步已经理解的知识转成一个最小真实动作，并让学习者能够把这个动作组织成一份可直接交给 AI 执行、可以观察实际结果的完整任务。

Step 4 沿用既定 Practice 交互责任：学习者完成本课练习后，可以检查结果、获得评分与逐项反馈，并按课程需要使用复制提示词、参考答案填充与参考答案复制。具体课程的练习内容、字段设计、评分方式、提示词与参考答案，由 Formal Brief / Course Builder Draft / Human Review 根据本课知识点与学习目标确定。Lesson Type 继续决定 Practice 是否属于 Completion Gate。

必须：只练前三步已经教会的内容；沿用现有 Unified Lesson Shell / Practice fields；字段必须是学习者此刻自然会产生的真实内容；Practice Goal / Instruction 必须自包含，学员单独打开本课也知道现在要做什么；Hint 只写内容本身，编号由 UI 统一生成；多条 Hint 在一个提示框内按 1、2、3… 展示。字段数量不预设，由本课要完成的真实学习动作决定；字段只是把一份完整任务拆开方便学习者思考和填写，若 AI 要准确执行仍缺少目标、输入、背景、边界、要求、输出形式或其他本课必要信息，就继续补足对应字段，不为凑数量而删减，也不为套模板而增加。凡 Step 4 提供“复制到 AI”能力，所有字段按顺序组合后必须成为一份逻辑连续、描述准确、上下文足够、可直接交给 AI 执行并产生可观察结果的任务正文；默认语义是让 AI 直接完成这份任务并返回结果，只有当课程主题本身就是评价、审查或诊断时，才让 AI 执行评价类任务。表单字段标题只用于界面引导，剪贴板默认只按字段顺序复制学习者实际填写的值，不复制字段名、课程标题、内部编号、Artifact / Schema 名或其他课程脚手架。Reference Fill 只包含各字段对应的标准直接值；每个字段值都应贡献任务正文的一部分，按字段顺序组合后必须形成一份完整、准确、可直接运行、能让 AI 产出本课目标结果的标准任务。若缺少真实输入材料，必须把示例材料作为字段补齐；只有课程目标本身是澄清需求时，才允许用反问作为主要输出。Reference Answer 必须与这份标准任务语义一致，是可直接复制给 AI 运行并得到结果的纯正文，不是对字段的解释、点评或答题说明；正文不重复字段主标题，页面展示与“复制参考答案”均直接使用该纯正文。案例底层应来自真实个人/小团队经营中常见的内容、客户、运营、销售、资料、分析或协作任务，但学员可见场景必须保持行业中立、自然真实、可以替换成自己的行业；内部品牌、项目、运营标签或生产 Case Thread 不得写进课程正文。

禁止：在 Step 4 首次教学新概念；为了下一课 Artifact 强行增加字段；为了套模板固定字段数量；在学员可见 Practice 文案中出现 `T1-01`、`T1-03` 等内部课程编号或依赖“上一课内部产物”才能理解当前任务；复制时把表单字段名或内部脚手架当作提示词正文一起复制；Reference Fill 各字段彼此割裂、组合后无法形成可执行任务；Reference Answer 带字段主标题、只给零散短句或无法直接交给 AI 运行；Hint 文案手写编号；因单节课需要而扩展 Runtime / UI，除非产品负责人明确批准。若未来确有课程需要带标签复制，必须作为显式例外单独批准，不得改变全局默认。

固定输出责任：**最小真实动作 + 必要输入 / 提示 + 可检查结果**。

### Step 5 — REVIEW

目标：把本课收束成以后能复用的判断框架，而不是复述正文。

规则：Step 5 上方主卡片固定围绕 **AI适合做什么 / AI不应该替你做什么** 两个核心复盘方向回答，二者不能删除、不能改成完全自由命题。主卡片**至少 2 张，上限不固定**；同一方向可按本课需要拆成多个能力边界或判断，只以是否把本课真正需要留下的知识讲清楚为准。两张是最低信息承载，不是默认目标；只有新增卡片能让知识更清晰时才继续增加，不为版式凑数。每张主卡片必须给出针对当前课程的具体回答正文，禁止只有标题，也禁止写成“AI可以辅助你 / AI不能替你决定”等跨课程泛化口号。主卡片下方必须保留 `knowledgeDepth.review` 说明层，使用“明确命题 + 回答/解释”方式，用于继续讲清为什么、边界、使用条件和容易混淆的判断；说明数量不固定。上下两层不能机械重复，Pitfalls 只做纠错。

Step 5 验收同时检查**最低结构 + 知识覆盖**：主卡片少于 2 张直接 FAIL；达到 2 张后，不再按数量验收，而看“本课必须留下的判断有没有被讲完整”。Formal Brief 在进入 Course Builder 前必须列出本课的 **must-retain judgments**；Deterministic Validator / Human Review 检查这些判断是否由主卡片 + `knowledgeDepth.review` 完整覆盖。若缺少关键判断，即使已有两张、四张或更多卡片，仍为 `STEP5_KNOWLEDGE_COVERAGE_FAIL`；若至少两张已经完整覆盖，也不得为了数量继续拆卡。`mistakes` / pitfalls 不得自动转换成 Review 主体或说明层。

固定输出责任：**AI 适合做什么 / AI 不应该替你做什么 + 原因、边界、使用条件 + 易错点**。

### Step 6 — CAPABILITY

目标：让学习者知道自己现在真的会什么。

必须能回答：我现在会做什么？我怎样知道自己会了？遇到什么情况，我应该想到这节课？下一课为什么值得继续？

禁止：只有鼓励口号；只重复课程标题；引入新的核心理论。

固定输出责任：**会做什么 + 如何自证 + 现实触发场景 + 下一步价值**。

Step 6 的“遇到什么情况，我应该想到这节课？”是每节课的必填学习结果，必须写成**独立、具体、可识别的真实触发情境**，例如某类结果开始出现、某个判断拿不准、某类风险出现或某项任务卡住。学习者只看这一句，也应知道现实工作中什么时候要调用本课能力；不得写成“本课只使用某知识”“上一课已经学过某能力”“下一课将继续某主题”等课程编排说明。

该触发说明的表达责任是“**什么现实情况 + 本课能力为什么适用/能解决什么**”，属于课程总结，不是操作指令。默认避免使用“我会先…… / 你应该先…… / 接下来做……”作为主体句式；真正的步骤和动作属于 Step 1～5 或 Practice，不应在这里再次引导。

### Learner-visible course numbering rule

学员端可以显示正常课程序号，例如 `07 / 08 / 09`；但课程标题、侧栏卡片标题和 Step 卡片标题不得把内部生产身份直接拼进标题，例如 `T2-07`、Track 名、Batch 名、内部 Lesson ID。内部身份仍保留给 Catalog、Workflow、Validator 与开发定位；Human Review Preview 应模拟正式学员视角，只显示正常序号。

## 3. Artifact rule

Artifact 必须自然产生：Natural Learning Action → Natural Learner Output → Optional Next Reuse。

禁止：Next Lesson Needs Artifact → Reverse-engineer Current Practice → Force Extra Fields。

下一课可以复用当前课自然产生的 Artifact，但不得反向要求当前课生产不自然的字段。

## 4. Case Thread rule

- Stable Method Layer 保持行业中立；底层任务可以来自个人或小团队真实经营工作流，但学员看到的是可迁移到不同职业与行业的通用业务场景；
- Production Brief 已明确 Case Thread 时，Course Builder 应保持能力与任务连续性，但不得把内部 Case Thread 名称或讨论过程直接写给学员；
- 学员可见案例应选择自然、真实、容易理解且不依赖特定品牌背景的场景；
- 学习者应能替换成自己的真实行业任务；
- Case Thread 不能压过单课教学自然度；若冲突，回到 Formal Brief / Human Review 处理。
- 涉及市场分析、市场规模、竞争格局、用户、价格、渠道或本地化市场判断时，若 Formal Brief 没有明确其他地区，默认以**中国市场**为分析范围；其他国家或地区必须显式写明，不得由 AI 自行猜测。

## 5. Deterministic validation vs Human Review

Code Validation 可以判断：六步顺序完整；正式课六步 `navigationDescription` 存在且每条两行、每行长度合规；`navigationDescription` 只用于顶部进度卡片且底部页码只渲染 `当前步 / 6`；学习建议为一句话且满足长度要求；intro comparison 的底部说明存在；Review 在启用时存在有效内容；Hint 不含手写编号；Mastery Sequence 完整；deferredTerms 不泄漏；Capability 不能只写“理解了”；Schema / Completion Gate / authority boundary 正确。Review 数量、表达是否完整清楚属于 Human Review，不由固定数量规则决定。

Human Review 必须判断：学习建议能否讲清本课和具体准备、完整显示为两行；六张进度卡片是否逐课逐步准确；Step 1 底部说明是否出现并帮助理解且不重复 takeaway；Step 1 是否真实自然且只解决当前主问题；Step 2 是否真正让核心规律变得可见，而不是机械套案例模板；Step 3 是否像理解判断；Step 4 是否完成真实学习动作、字段是否只为任务完整性服务、COPY_TO_AI / Reference 是否形成完整可运行任务；Artifact 是否被强行制造；Step 5 卡片 / 描述 / pitfalls 是否互补；Step 6 是否形成可执行能力并给出具体触发情境；学员可见正文是否混入课程编排或生产说明；整节课是否愿意继续学。

技术 PASS 永远不等于教学 PASS。

## 6. Reference lesson

T1-01 `AI 能帮什么，不能帮什么` 是 Lesson Output Contract v1 的首个 Human Review reference candidate。

第 1～5 板块的正式课程统一继承本 Contract；切换板块只替换当前目录、Formal Brief、知识边界和 Grounding，继续复用同一个 Course Builder Skill、Workflow、校验与 Human Review。改变输出契约时先更新本 owner 及必要校验，不在单节课里静默漂移。
