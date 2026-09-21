# Track 01 Batch A — T1-01～T1-05 Formal Briefs v1

Status: **BRIEF_READY_V1 / HUMAN_REVIEW_PASS_BRIEF_LEVEL**
Task: **CURRICULUM-AUDIT-REALIGN-001-R1**  
Canonical IDs: **T1-01～T1-05**  
Course Builder target: **course-builder@0.2.0 + BEGINNER_QUALITY_V1**

## 1. Batch continuity

默认 Case Thread：**OPC / 自媒体 AI 内容任务**。从“看到一个值得分享的 AI 变化、手里只有零散想法”开始，先让 AI 完成一个极简单的整理任务，再逐步做到任务说明清楚、资料足够、迭代完成、结果可用且已做最小核验。学习者始终可以替换成自己的真实工作任务。

```text
T1-01 选择任务并生成 First Draft
→ T1-02 写成 Clear Task Brief
→ T1-03 补成 Minimum Context Pack
→ T1-04 做两轮 Iteration
→ T1-05 完成 Verification Record
→ Verified Publishable Draft
```

Stable Method Layer 必须行业中立。**Batch A 默认连续案例层固定使用 OPC / 自媒体 AI 内容任务**，用于保证 T1-01～T1-05 的同一 Artifact 连续推进；学习者可替换为房地产、电商、教育、企业服务等自己的真实任务，方法与验收标准不变。

### Prompt vs Context fixed boundary

从本版本开始固定：

- **Prompt = AI 要做什么 / Task Instruction**：目标、对象、任务要求、输出形式；
- **Context = AI 为了完成任务需要知道什么 / Task Information**：当前事实、已有资料、业务背景、参考内容。

同一个信息有时可以写进一句 Prompt，但教学判断按“它是在定义任务，还是在提供任务所需信息”区分。T1-02 负责定义任务；T1-03 负责信息取舍。T1-03 不教授 Knowledge Base / Source of Truth 的正式判断。

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
1. EXPLAIN：第一课先完成一个极简单任务——把关于一个 AI 新变化的几句零散想法整理成 3 个清楚重点；先获得“AI 确实帮我完成了一件事”的直观体验，再扩展判断。
2. EXAMPLE：从刚完成的内容整理任务逐步扩展：整理 / 草拟可以交给 AI；事实信息需要谨慎核验；最终发布决定不能直接交给 AI。
3. CHECK：给 3 个真实小场景，判断“可协助 / 需核验 / 不应直接决定”。
4. PRACTICE：写下自己的 3 个真实任务，逐个标记“AI 可协助 / 需谨慎核验 / 人负责最终决定”；从中选 1 个，写一句任务目标并让 AI 生成最小 First Draft。保留 **3-task classification + selected task goal + AI First Draft**。
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
4. PRACTICE：把自己的原始要求拆成四项填写：①任务目标 ②使用对象 ③关键要求 / 限制 ④输出形式；合成为 Clear Task Brief，再提交给 AI 生成新版本。保留 **Before prompt + 4-field Clear Task Brief + Prompt-improved Draft**。
5. REVIEW：目标清楚；对象清楚；必要要求明确；输出可检查。
6. CAPABILITY：能把模糊需求变成 AI 可以执行的任务说明。

### Next Reuse
T1-03 不再修改“AI 要做什么”，而是在 Clear Task Brief 已固定的前提下补足“AI 为了完成这件事需要知道什么”。

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
从当前事实、已有业务资料、参考内容、必要背景中选出本次任务真正需要的信息；目标、对象、任务要求、输出形式继续属于 T1-02，不在本课重新定义。

Output: **Minimum Context Pack + Context-enriched Draft**

### Six-step intent
1. EXPLAIN：你知道的背景，AI 不会自动知道；资料过多也会稀释重点。
2. EXAMPLE：同一 Task Brief 分别使用缺失 Context、过量 Context、Minimum Context 比较。
3. CHECK：判断哪些信息必须提供、哪些可省略、哪些不该加载。
4. PRACTICE：列出手头可提供的信息，并分入三个框：①Must Know ②Nice to Know ③Do Not Load；只把 Must Know 组合成 Minimum Context Pack，交给 AI 再生成一次。保留 **3-bucket information list + Minimum Context Pack + Context-enriched Draft**。
5. REVIEW：当前任务真正缺什么；哪些信息只是“有帮助”但不是必须；哪些信息会制造噪音；长资料需要取舍。
6. CAPABILITY：能为一次 AI 任务准备足够但不过量的上下文。

### Next Reuse
T1-04 直接在 Context-enriched Draft 上定位偏差并迭代，不重新准备一个新任务。

### Anti-repeat / Deferred
- Context Window 只建立“容量有限”直觉，不讲 token 数字；
- 不教 Context Engineering；
- 不教 Memory / Knowledge Base / Source of Truth / RAG；
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
4. PRACTICE：对当前 Draft 完成两轮 Iteration；每轮都按“发现的偏差 → 选择的修改动作 → 新结果是否改善”记录。保留 **Iteration Note 1 + Iteration Note 2 + final Iterated Draft**。
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
对准备发布 / 交付的结果做两层最小检查：先确认它有没有完成原始 Clear Task Brief，再识别其中哪些内容因事实性、时效性、可验证性或错误后果需要进一步核验。

### New Capability
能先做最低 Task-fit Evaluation，再按四个维度决定核验强度：
- 是否完成原始任务要求；
- 事实性；
- 时效性；
- 是否可验证；
- 错误后果大小。

这里的 Evaluation 只回答“结果有没有完成任务、能不能继续使用”，不进入评分体系或 Evaluation Engineering。

Hallucination 在本课作为“为什么必须检查”的解释知识，不独立成课。

### Artifact Action / Output
先对照 Clear Task Brief 标记“已满足 / 未满足”的关键要求；再标出需要核验的陈述，并写清最小检查动作与结果。

Output: **Verification Record + Verified Publishable Draft**

### Six-step intent
1. EXPLAIN：结果“看起来不错”有两个不同问题：它可能没完成任务，也可能完成了任务但事实不可靠；表达流畅、语气确定不代表正确。
2. EXAMPLE：先对照 Clear Task Brief 判断一个 Draft 是否完成任务，再比较创意措辞、公开事实、最新数据、错误后果较大的信息需要怎样不同程度地核验。
3. CHECK：判断一个结果是“任务没完成”“任务完成但需要核验”还是“可以继续使用”，并识别需要来源或最新信息检查的内容。
4. PRACTICE：①对照自己的 Clear Task Brief 勾选关键要求是否满足；②为当前 Draft 标出 verification flags；③至少完成 1 个真实核验动作。保留 **Task-fit checklist + Verification Flags + one completed verification + Verification Record**。
5. REVIEW：任务对不对；事实要不要查；信息新不新；错了会怎样。
6. CAPABILITY：能先判断结果是否完成任务，再决定哪些内容必须验证，并留下可追溯 Verification Record。

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
- 不讲谁有审批权、AI 可以获得什么权限、哪些动作必须 HITL / Core Authority；这些属于 T1-20；
- 不承诺“核验后一定正确”，只建立可追溯判断。
- “错误后果大小”只用于决定核验强度，不在本课延伸到审批流程、权限控制或自动执行边界。

### Grounding
REVIEWED_KNOWLEDGE + high-freshness examples where current facts are used.

---

## 2. Batch acceptance before Course Builder

进入 Course Builder 前必须由产品负责人确认：
本轮 Human Review revision 已确认：
1. T1-01～T1-05 顺序保持不变，边界 PASS；
2. Prompt vs Context 固定为 Task Instruction vs Task Information；
3. 五课 Step 4 均明确具体动作与保留结果；
4. T1-05 吸收 Hallucination 作为原因解释，并吸收最低 Task-fit Evaluation；
5. T1-05 不进入 T1-20 的 HITL / Permissions / Approval，也不进入 Track 04 Evaluation Engineering；
6. 旧 Trial 只作为 reference，不把旧 Check / Practice / Review 静默继承进新 Draft。

Formal Brief 层 Human Review = **PASS**。Production Batch 固定为 T1-01～T1-05；一次 generation attempt 使用单一 `course-builder@0.2.0`。
