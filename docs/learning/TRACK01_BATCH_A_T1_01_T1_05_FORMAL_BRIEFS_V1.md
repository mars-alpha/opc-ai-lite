# Track 01 Batch A — T1-01～T1-05 Formal Briefs v1

Status: **BRIEF_READY_V1 / HUMAN_REVIEW_REQUIRED**  
Task: **CURRICULUM-AUDIT-REALIGN-001-R1**  
Canonical IDs: **T1-01～T1-05**  
Course Builder target: **course-builder@0.2.0 + BEGINNER_QUALITY_V1**

## 1. Batch continuity

默认 Case Thread：一个真实内容 / 工作任务，从“想让 AI 帮忙”逐步做到“结果可用且已做最小核验”。

```text
T1-01 选择任务并生成 First Draft
→ T1-02 写成 Clear Task Brief
→ T1-03 补成 Minimum Context Pack
→ T1-04 做两轮 Iteration
→ T1-05 完成 Verification Record
→ Verified Publishable Draft
```

Stable Method Layer 必须行业中立。OPC / 自媒体只作为默认案例层，可替换房地产、电商、教育、企业服务等。

---

## T1-01 — AI 能帮什么，不能帮什么

Type: **APPLICATION**  
Planned Gate: **CHECK + PRACTICE**  
Primary Knowledge Home: **Everyday AI task fit / human judgment boundary**  
Prerequisite: **None**

### Learner Question
面对一个真实任务，我应该把哪部分交给 AI，哪部分保留自己判断？

### Current Learner Job
从自己的真实内容 / 工作需求中选一个任务，判断 AI 可以协助哪里，并完成第一次小生成。

### Inherited Capability / Artifact
无。输入是学习者自己的真实任务想法。

### New Capability
能把任务分成：
- AI 适合协助；
- AI 可以协助但必须核验；
- 不应直接交给 AI 决定。

### Artifact Action / Output
选一个真实任务 → 写一句目标 → 让 AI 先做一个最小版本。

Output: **AI First Draft + Task Fit Note**

### Six-step intent
1. EXPLAIN：不知道 AI 适合做什么，会出现“什么都让 AI 做”或“完全不知道从哪开始”。
2. EXAMPLE：同一个内容任务中，草拟结构可以交给 AI；事实承诺、最终发布决定不能直接交给 AI。
3. CHECK：给 3 个真实小场景，判断“可协助 / 需核验 / 不应直接决定”。
4. PRACTICE：给自己的 3 个任务分类，并选 1 个生成 First Draft。
5. REVIEW：任务是否清楚；AI 是否真的能帮；错误成本是否可接受；最终判断权在哪里。
6. CAPABILITY：能选择一个适合 AI 的真实任务并安全开始。

### Next Reuse
T1-02 直接使用当前任务和 First Draft，把模糊需求改成 Clear Task Brief。

### Anti-repeat / Deferred
- 不正式教 Prompt 结构；
- 不正式教 Context；
- 不定义 Hallucination；
- 不解释模型机制；
- 不展开 Tool / RAG / Agent。

### Grounding
REVIEWED_KNOWLEDGE + current AI product capability examples only as examples.

---

## T1-02 — Prompt：把任务说清楚

Type: **APPLICATION**  
Planned Gate: **CHECK + PRACTICE**  
Primary Knowledge Home: **Prompt foundations / executable task brief**  
Prerequisite: **T1-01**

### Learner Question
为什么“帮我写一下”经常得不到我真正想要的结果？怎样把任务说到 AI 能执行？

### Inherited Capability / Artifact
T1-01 的真实任务 + AI First Draft。

### Current Learner Job
把原始模糊要求重写成一份清楚、可执行、可检查的任务说明。

### New Capability
能明确：
- 要完成什么；
- 给谁使用；
- 有什么关键要求 / 限制；
- 希望输出成什么样。

### Artifact Action / Output
Before / After 对比原始要求，形成 **Clear Task Brief**，再生成 Prompt-improved Draft。

### Six-step intent
1. EXPLAIN：AI 不会自动知道目标、对象和交付标准。
2. EXAMPLE：只改变目标 / 对象 / 要求 / 输出四类关键信息，看结果怎样变化。
3. CHECK：判断哪些任务说明“信息很多但仍不清楚”，哪些真正可执行。
4. PRACTICE：重写自己的任务说明并提交给 AI。
5. REVIEW：目标清楚；对象清楚；必要要求明确；输出可检查。
6. CAPABILITY：能把模糊需求变成 AI 可以执行的任务说明。

### Next Reuse
T1-03 不重写任务目标，而是在 Clear Task Brief 上补足真正需要的资料和背景。

### Anti-repeat / Deferred
- 不教“万能 Prompt 模板”；
- 不教 System Prompt；
- 不展开 Prompt Engineering 技巧；
- 不把文件 / 历史 /工具结果混成 Prompt 本身。

### Grounding
REVIEWED_KNOWLEDGE.

---

## T1-03 — Context：给 AI 足够但不过量的信息

Type: **APPLICATION**  
Planned Gate: **CHECK + PRACTICE**  
Primary Knowledge Home: **Minimum sufficient task context**  
Prerequisite: **T1-02**

### Learner Question
任务已经说清楚了，为什么 AI 还是会缺业务背景、用错资料，或者被太多无关信息干扰？

### Inherited Capability / Artifact
Clear Task Brief + Prompt-improved Draft。

### Current Learner Job
判断 AI 当前真正缺什么资料，并建立 Minimum Context Pack。

### New Capability
能把信息分为：
- Must Know；
- Nice to Know；
- Do Not Load。

同时建立“Context 有限，更多不等于更好”的最低直觉。

### Artifact Action / Output
从品牌 / 受众 / 已知事实 / 参考资料 / 限制中选出当前任务真正需要的内容。

Output: **Minimum Context Pack + Context-enriched Draft**

### Six-step intent
1. EXPLAIN：你知道的背景，AI 不会自动知道；资料过多也会稀释重点。
2. EXAMPLE：同一 Task Brief 分别使用缺失 Context、过量 Context、Minimum Context 比较。
3. CHECK：判断哪些信息必须提供、哪些可省略、哪些不该加载。
4. PRACTICE：为自己的任务整理一个最小 Context Pack。
5. REVIEW：当前任务需要什么；什么是权威资料；什么只是噪音；长资料要取舍。
6. CAPABILITY：能为一次 AI 任务准备足够但不过量的上下文。

### Next Reuse
T1-04 直接在 Context-enriched Draft 上定位偏差并迭代，不重新准备一个新任务。

### Anti-repeat / Deferred
- Context Window 只建立“容量有限”直觉，不讲 token 数字；
- 不教 Context Engineering；
- 不教 Memory / Knowledge Base / RAG；
- 不把 Prompt wording 与 Context 来源混为一谈。

### Grounding
REVIEWED_KNOWLEDGE.

---

## T1-04 — Iteration：把第一版结果改到可用

Type: **APPLICATION**  
Planned Gate: **CHECK + PRACTICE**  
Primary Knowledge Home: **Iteration / clarification**  
Prerequisite: **T1-03**

### Learner Question
第一版不满意时，应该怎么继续，而不是反复“重来一次”？

### Inherited Capability / Artifact
Clear Task Brief + Minimum Context Pack + Context-enriched Draft。

### Current Learner Job
定位结果偏差，选择正确的下一步：指出偏差、补信息、给标准 / 示例，或让 AI 先澄清。

### New Capability
能根据结果问题选择下一轮改进动作，而不是无目标重复生成。

### Artifact Action / Output
对当前 Draft 做至少两轮有目的的修改。

Output: **Iteration Notes + Iterated Draft**

### Six-step intent
1. EXPLAIN：第一版常常只是起点；无目标重生成不会稳定变好。
2. EXAMPLE：同一个差结果，对比“再写一次”与“指出偏差 + 补标准”的效果。
3. CHECK：根据不同偏差选择“补信息 / 给示例 / 改限制 / 让 AI 提问”。
4. PRACTICE：完成两轮 Iteration，并记录每轮改了什么、为什么改。
5. REVIEW：先找偏差；只补真正缺的；给可检查标准；必要时先澄清。
6. CAPABILITY：能把一个不满意的 AI 初稿逐步改到可用。

### Next Reuse
T1-05 不再继续润色，而是对 Iterated Draft 做事实、日期、风险和证据核验。

### Anti-repeat / Deferred
- 不讲 Workflow loop；
- 不讲 Agent self-correction；
- 不重新教授 Prompt / Context；
- 不把“改语气”当成完整 Iteration 能力。

### Grounding
REVIEWED_KNOWLEDGE.

---

## T1-05 — 结果可靠性：什么时候必须核验

Type: **APPLICATION**  
Planned Gate: **CHECK + PRACTICE**  
Primary Knowledge Home: **Reliability judgment / verification**  
Prerequisite: **T1-04**

### Learner Question
AI 写得很像真的，我怎样判断哪些可以直接参考、哪些一定要查？

### Inherited Capability / Artifact
Iterated Draft。

### Current Learner Job
对准备发布 / 交付的结果做最小 Verification：识别事实、时效、风险与证据需求。

### New Capability
能按四个维度决定核验强度：
- 事实性；
- 时效性；
- 错误成本 / 风险；
- 是否有可验证来源。

Hallucination 在本课作为“为什么必须检查”的解释知识，不独立成课。

### Artifact Action / Output
标出需要核验的陈述，写清最小检查动作与结果。

Output: **Verification Record + Verified Publishable Draft**

### Six-step intent
1. EXPLAIN：表达流畅、语气确定，不代表事实正确。
2. EXAMPLE：创意措辞、公开事实、最新数据、高风险承诺分别需要不同检查强度。
3. CHECK：判断哪些内容可作为灵感、哪些必须找来源、哪些必须人工确认。
4. PRACTICE：为当前 Draft 标出 verification flags，并完成至少一个真实核验动作。
5. REVIEW：事实；来源；日期；风险。
6. CAPABILITY：能判断 AI 结果何时可用、何时必须验证，并留下 Verification Record。

### Next Reuse
Track 02 直接继承：
- Clear Task Brief；
- Minimum Context Pack；
- Iteration 方法；
- Verification Record；
- Verified Publishable Draft。

后续 Research / Writing / Files / Data 不再重复教授这五项基础协作方法。

### Anti-repeat / Deferred
- 不展开正式 Evaluation framework / baseline / regression；
- 不讲 RAG 工程；
- 不讲权限与高风险自动执行边界（T1-20）；
- 不承诺“核验后一定正确”，只建立可追溯判断。

### Grounding
REVIEWED_KNOWLEDGE + high-freshness examples where current facts are used.

---

## 2. Batch acceptance before Course Builder

进入 Course Builder 前必须由产品负责人确认：
1. T1-01～T1-05 的课程边界与顺序；
2. 五课是否真实形成同一 Artifact Thread；
3. 每课 Step 4 是否足够具体且不重复；
4. T1-05 是否已经吸收 Hallucination / basic Evaluation，但没有越界到 Track 04；
5. 旧 Trial 只作为 reference，不把旧 Check / Practice / Review 静默继承进新 Draft。

通过后，Production Batch 固定为 T1-01～T1-05；一次 generation attempt 使用单一 `course-builder@0.2.0`。
