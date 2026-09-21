# Lesson Output Contract v1

Status: **APPROVED_BASELINE_V1**  
Owner: **Course Builder Skill v0.2 + Code Validation + Human Review**

本规范固定“Formal Brief 已经批准后，一节正式课程应该怎样被输出”。它不新增 Skill，不改变 Unified Lesson Shell，不替代 Six-step Knowledge Point Gate。

## 1. Production position

固定链路：

Curriculum / Knowledge Map
→ Formal Lesson Brief
→ Course Builder v0.2
→ Lesson Output Contract
→ Code Validation
→ Draft Preview
→ Human Review
→ Runtime Provisioning
→ Runtime Acceptance
→ AVAILABLE

Curriculum 决定学什么和顺序；Formal Brief 决定知识边界；Course Builder 决定怎样把知识教会；Lesson Output Contract 约束输出形态与教学职责。

## 2. Six-step output contract

### Learner-facing language rule

所有学员可见文案默认中文优先：
- 非必要英文名称不得直接展示给学员；例如 `Clear Task Brief` 应写成“清晰任务说明”。
- AI 常用行业术语允许保留英文，但首次出现采用 **中文（English）**，例如“提示词（Prompt）”；后续正文优先使用中文简称。
- 内部 lessonId、Artifact ID、Schema 名、状态名、课程编排编号等不得出现在学员可见文案中。

### Step 1 — EXPLAIN

目标：让学习者先看懂“这和我有什么关系”。

必须：从目标用户能立即理解的真实问题 / 场景进入；讲清为什么值得学、解决什么问题、最重要的判断原则；Beginner 课程先建立直觉，再引入必要术语。

禁止：先堆定义；为了后续 Artifact 反推一个不自然的开场；一次塞入多个后续知识。

### Step 2 — EXAMPLE

目标：用一个真实案例直接证明当前课的核心知识。

必须：案例直接服务当前 Primary Knowledge Point；Beginner 优先使用 Before → 关键变化 → After → 为什么变化；案例必须延续 Formal Brief 已批准的 Case Thread。

禁止：为了下一课 handoff 硬造案例；只换皮重复 Step 1；提前教授后续课程知识。

### Step 3 — CHECK

目标：证明学习者已经理解，才进入实操。

默认 Mastery Sequence：SINGLE_CHOICE / BEST_JUDGMENT → TRUE_FALSE / MISCONCEPTION → MULTI_SELECT / BOUNDARY_CONDITIONS。

必须：只检查 Step 1–2 已经教过的判断；题目像真实情境判断，不是术语背诵；错误反馈解释为什么错，正确反馈解释为什么对。

### Step 4 — PRACTICE

目标：把前三步已经理解的知识转成一个最小真实动作。

必须：只练前三步已经教会的内容；沿用现有 Unified Lesson Shell / Practice fields；字段必须是学习者此刻自然会产生的真实内容；Practice Goal / Instruction 必须自包含，学员单独打开本课也知道现在要做什么；Hint 只写内容本身，编号由 UI 统一生成；多条 Hint 在一个提示框内按 1、2、3… 展示；Reference Fill 只包含字段直接值。凡 Step 4 提供“复制到 AI”能力，表单字段标题只用于界面引导，剪贴板默认只复制学习者实际填写的字段值，不复制字段名、课程标题、内部编号、Artifact / Schema 名或其他课程脚手架。此类课程的 Reference Answer / Reference Fill 必须共同组成一份完整、可直接复制到 AI 验证的成品样例，而不是彼此孤立的字段碎片；默认优先使用 OPC / 自媒体真实任务构造样例，Stable Method Layer 仍保持行业中立。

禁止：在 Step 4 首次教学新概念；为了下一课 Artifact 强行增加字段；在学员可见 Practice 文案中出现 `T1-01`、`T1-03` 等内部课程编号或依赖“上一课内部产物”才能理解当前任务；复制时把表单字段名或内部脚手架当作提示词正文一起复制；Reference Answer 只给零散短句、导致一键填充后仍不能直接验证；Hint 文案手写编号；因单节课需要而扩展 Runtime / UI，除非产品负责人明确批准。若未来确有课程需要带标签复制，必须作为显式例外单独批准，不得改变全局默认。

### Step 5 — REVIEW

目标：把本课收束成以后能复用的判断框架，而不是复述正文。

规则：使用 **2–4 张卡片**，数量由知识密度决定；卡片只放当前课已经学过的判断。Review Card 负责可迁移判断；Knowledge Depth / 补充描述负责解释“为什么”；Pitfalls 负责纠正错误理解；三层不得重复。

Step 5 Review Card 的展示固定使用上下对比：上层标签 **“AI 适合做什么”**，对应核心判断；下层标签 **“AI 不应该替你做什么”**，对应边界理解。每张卡都必须把同一个知识点拆成这两个方向，让学习者上下对照理解。卡片数量仍按知识密度使用 2–4 张。补充描述负责解释“为什么”，Pitfalls 负责纠错，不得与卡片重复。

### Step 6 — CAPABILITY

目标：让学习者知道自己现在真的会什么。

必须能回答：我现在会做什么？我怎样知道自己会了？我马上可以用在哪里？下一课为什么值得继续？

禁止：只有鼓励口号；只重复课程标题；引入新的核心理论。

## 3. Artifact rule

Artifact 必须自然产生：Natural Learning Action → Natural Learner Output → Optional Next Reuse。

禁止：Next Lesson Needs Artifact → Reverse-engineer Current Practice → Force Extra Fields。

下一课可以复用当前课自然产生的 Artifact，但不得反向要求当前课生产不自然的字段。

## 4. Case Thread rule

- Stable Method Layer 保持行业中立；
- Production Brief 已明确默认 Case Thread 时，Course Builder 必须遵守；
- Track 01 Batch A 当前默认 Case Thread = **OPC / 自媒体 AI 内容任务**；
- 学习者可以替换成自己的真实行业任务；
- Case Thread 不能压过单课教学自然度；若冲突，回到 Formal Brief / Human Review 处理。

## 5. Deterministic validation vs Human Review

Code Validation 可以判断：六步顺序完整；Beginner Review 2–4 项；Hint 不含手写编号；Mastery Sequence 完整；deferredTerms 不泄漏；Capability 不能只写“理解了”；Schema / Completion Gate / authority boundary 正确。

Human Review 必须判断：Step 1 是否真实自然；Step 2 是否讲透核心知识；Step 3 是否像理解判断；Step 4 字段是否自然；Artifact 是否被强行制造；Step 5 卡片 / 描述 / pitfalls 是否互补；Step 6 是否形成可执行能力；整节课是否愿意继续学。

技术 PASS 永远不等于教学 PASS。

## 6. Reference lesson

T1-01 `AI 能帮什么，不能帮什么` 是 Lesson Output Contract v1 的首个 Human Review reference candidate。

后续 T1-02～T1-20 生产必须继承本 Contract；若需要改变 Contract，先讨论并版本化，不在单节课里静默漂移。
