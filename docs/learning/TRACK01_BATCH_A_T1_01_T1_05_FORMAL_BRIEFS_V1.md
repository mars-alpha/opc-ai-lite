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
做一条 OPC / 自媒体内容时，哪些步骤可以先让 AI 帮一把？

### Current Learner Job
从 OPC / 自媒体内容生产中，看见 AI 最容易协助的入口，并找出一个可以先交给 AI 帮一步的内容步骤。

### Inherited Capability / Artifact
无。输入是学习者自己的真实任务想法。

### New Capability
能从 OPC / 自媒体内容任务中识别 AI 常见的协助入口：
- 起草标题 / 开头 / 结构；
- 整理 / 总结已有资料；
- 围绕主题找表达角度；
并知道重要事实需要核验、最终决定仍由人负责。

### Artifact Action / Output
选一条自己真实准备做的内容 → 写清 AI 可以先帮哪一个小步骤。

Output: **Task Fit Note**

### Six-step intent
1. EXPLAIN：从 OPC / 自媒体做一条内容的真实流程开始，讲清 AI 最常见的价值是先帮忙起草、整理资料和找表达角度。
2. EXAMPLE：围绕同一条内容，用“想标题 / 整理已有资料 / 列表达角度”三个直观步骤讲透同一个原则：AI 先完成容易检查的中间工作，人继续负责事实准确性、取舍和最终发布判断。
3. CHECK：给 3 个真实小场景，检查学习者是否能识别哪些工作适合 AI 先协助，以及最终判断不能直接交出去。
4. PRACTICE：沿用现有填写字段，写 1 条自己准备做的真实 OPC / 自媒体内容，再写 **AI 先帮哪一步**。提示区 UI 使用一个提示框，内部由界面自动按 1、2、3… 排列；提示文案本身不带编号，避免重复。保留 **task + help step**。
5. REVIEW：每张卡固定上下对比：上层标签 **AI 适合做什么**，填写适合交给 AI 的具体动作；下层标签 **AI 不应该替你做什么**，填写必须保留给人的边界。三张卡分别对应：第一版、创意方案、整理比较。下面补充描述继续解释“为什么”，容易踩的坑继续负责纠错。
6. CAPABILITY：能选择一个适合 AI 的真实任务并安全开始。

### Next Reuse
T1-02 可以继续使用当前真实任务与 help step，把模糊需求改成 Clear Task Brief；T1-01 不为下一课强制生产额外字段。

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
T1-01 的真实任务 + `AI 先帮哪一步`。T1-02 不依赖外部 AI First Draft。

### Current Learner Job
把原始模糊要求重写成一份清楚、可执行、可检查的任务说明。

### New Capability
能明确：
- 要完成什么；
- 给谁使用；
- 有什么关键要求 / 限制；
- 希望输出成什么样。

### Artifact Action / Output
把原始模糊要求拆成 **任务目标 / 使用对象 / 关键要求与限制 / 输出形式** 四项，形成 **Clear Task Brief**。可选复制给常用 AI 体验结果差异，但课程 Artifact 不要求回填 AI 回复。

### Six-step intent
1. EXPLAIN：AI 不会自动知道目标、对象和交付标准。
2. EXAMPLE：只改变目标 / 对象 / 要求 / 输出四类关键信息，看结果怎样变化。
3. CHECK：判断哪些任务说明“信息很多但仍不清楚”，哪些真正可执行。
4. PRACTICE：把自己的原始要求拆成四项填写：任务目标 / 使用对象 / 关键要求与限制 / 输出形式，形成 Clear Task Brief。提示区由 UI 自动编号，不在 Hint 文案内手写编号。可选复制 Clear Task Brief 给常用 AI 体验结果差异，但课程只保留 **4-field Clear Task Brief**，不要求回填 AI 回复。
5. REVIEW：固定用上下对比卡呈现四项：上层 **AI 适合做什么**＝把任务目标 / 使用对象 / 关键要求 / 输出形式说清楚；下层 **AI 不应该替你做什么**＝替你猜目标、猜对象、替你决定模糊要求、猜最终交付形式。
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

## T1-03 — 上下文（Context）：给 AI 足够但不过量的信息

Type: **APPLICATION**  
Planned Gate: **CHECK + PRACTICE**  
Primary Knowledge Home: **Minimum sufficient task context**  
Prerequisite: **T1-02**

### Learner Question
任务已经说清楚了，为什么 AI 还是会缺业务背景、用错资料，或者被太多无关信息干扰？

### Inherited Capability / Artifact
已经说清楚的任务说明。T1-03 不依赖外部 AI 回复。

### Current Learner Job
判断完成当前任务真正需要哪些信息，并整理成一份最小信息包。

### New Capability
能把信息分为：
- 必须知道；
- 有帮助但非必须；
- 暂时不要放。

同时建立“上下文（Context）有限，更多不等于更好”的最低直觉。

### Artifact Action / Output
从当前事实、已有业务资料、参考内容、必要背景中选出本次任务真正需要的信息；目标、对象、任务要求、输出形式继续属于 T1-02，不在本课重新定义。

Output: **三类信息清单 + 最小信息包**

### Six-step intent
1. EXPLAIN：你知道的背景，AI 不会自动知道；资料过多也会稀释重点。
2. EXAMPLE：同一个内容任务分别比较“信息不够”“信息太多”“刚好够用”三种情况。
3. CHECK：判断哪些信息必须提供、哪些有帮助但非必须、哪些暂时不要放。
4. PRACTICE：把自己手头与任务有关的信息分入三个框：必须知道 / 有帮助但非必须 / 暂时不要放；再只从“必须知道”里整理出一份最小信息包。课程不要求回填外部 AI 回复。保留 **三类信息清单 + 最小信息包**。
5. REVIEW：每张卡固定上下对比：上层 **AI 适合做什么**＝帮助你选出真正需要的信息；下层 **AI 不应该替你做什么**＝替你决定哪些背景一定正确、哪些资料值得信任。卡片数量按知识密度 2–4 张。
6. CAPABILITY：能为一次 AI 任务准备足够但不过量的上下文（Context）。

### Next Reuse
下一课可以继续使用当前任务与最小信息包来学习如何修改第一版结果；本课不为下一课强制制造额外字段或外部回复。

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
