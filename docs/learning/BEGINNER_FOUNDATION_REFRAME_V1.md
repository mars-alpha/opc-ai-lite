# Beginner Foundation Reframe v1

Status: **APPROVED_REFRAME_V1**  
Task: **CURRICULUM-005 — Beginner Foundation Reframe**

## 1. Why this reframe exists

Foundation Batch A 的第一次 Human Review 结论：**技术验收通过，但教学失败。**

失败表现：
- 理论知识过重；
- 新术语连续出现；
- 课程逻辑以“概念分类”而不是“新手问题”组织；
- 学习者还没建立使用直觉，就被要求理解 AI / ML / Generative AI / Model / Training / Inference / Retrieval / Deterministic Logic；
- 对零基础学习者不友好。

因此，Foundation v1 的开场顺序改为：

```text
先知道 AI 能帮我做什么
→ 再知道怎样和 AI 配合
→ 再知道怎样避免被错误结果误导
→ 最后才补模型内部机制
```

核心原则：

1. **先使用世界观，后技术世界观。**
2. **一节课只解决一个学习者问题。**
3. **示例在定义之前。**
4. **每节最多引入 1–2 个新核心术语。**
5. **术语只有在“现在必须知道”时才出现。**
6. **概念关系逐步建立，不在第一批一次性铺开。**
7. **技术实现继续后移到 Advanced / Optional。**
8. **完整知识体系仍保留，但不再决定新手的第一学习顺序。**

---

# 2. Reframed first 8 lessons

## Stage 1 — 先认识 AI 怎么用

目标：先让完全没接触过 AI 的用户知道“AI 能做什么、为什么结果会变化、为什么会出错、自己正在使用的到底是什么”。

| ID | Title | Type | Learner question | Learner outcome | Do NOT teach yet |
| --- | --- | --- | --- | --- | --- |
| F1-01 | AI 到底能帮我做什么 | APPLICATION | 我第一次接触 AI，它和我的工作到底有什么关系？ | 能从写作、整理、总结、分析、找思路等日常任务中识别适合 AI 协助的场景 | 不讲 AI/ML taxonomy、LLM、Training、Token |
| F1-02 | 为什么同一个 AI，有时好用、有时不好用 | APPLICATION | 为什么我问同一个 AI，结果有时很好、有时很差？ | 理解“你给它的信息和要求会影响结果”，开始主动补充任务信息 | 不正式讲 Prompt 结构、Context Window |
| F1-03 | AI 为什么会说错，而且还说得很像真的 | CONCEPT | AI 说得这么肯定，为什么还会错？ | 知道 AI 输出需要判断和核实，尤其是事实、数字、最新信息 | 不讲 next-token prediction、Retrieval 架构、Evaluation 指标 |
| F1-04 | AI 软件里的模型、搜索、文件和记忆是什么关系 | CONCEPT | 我用的 AI 软件里这么多功能，它们到底是什么关系？ | 建立最简单的产品地图：AI 软件由核心模型和搜索/文件/记忆等能力组合而成 | 不讲 API、Tool、RAG、模型参数、产品内部架构 |

## Stage 2 — 学会和 AI 基本协作

目标：用户已经不怕 AI，也知道不能盲信；现在开始学怎样让 AI 更好地完成任务。

| ID | Title | Type | Learner question | Learner outcome | Do NOT teach yet |
| --- | --- | --- | --- | --- | --- |
| F2-01 | Prompt：怎样把想做的事情说清楚 | APPLICATION | 我应该怎样告诉 AI 我要它做什么？ | 能把模糊要求变成包含目标、必要背景和结果要求的清楚任务说明 | 不讲“万能 Prompt 模板”、System Prompt、Prompt Engineering |
| F2-02 | Context：AI 只知道你这次给它看到的东西 | CONCEPT | 为什么我明明知道的背景，AI 却不知道？ | 理解 AI 当前回答依赖它这次能看到的信息，知道什么时候要补资料 | 不讲 Context Window 数字、Token mechanics、Context Engineering |
| F2-03 | 第一次结果不对，怎样继续让 AI 改好 | APPLICATION | AI 第一次做得不好，我应该重来还是继续改？ | 能通过指出偏差、补信息、给示例、让 AI 先提问来逐步改进结果 | 不讲 Workflow loop、Agent self-correction |
| F2-04 | AI 的结果什么时候能直接用，什么时候一定要检查 | APPLICATION | 我怎么判断一份 AI 结果能不能直接使用？ | 能按事实性、风险、可验证性判断是否需要复核，并形成最基础验证习惯 | 不讲正式 Evaluation Framework / Test Set / Regression |

---

# 3. Stage 3 moves technical mechanisms later

Stage 3 改为：**再理解 AI 背后的基本机制**

只有当用户已经会基本使用 AI 后，才学习这些“为什么”。

建议 4 节：
1. **大语言模型是什么：Model 不等于 AI 软件**
2. **Training 与 Inference：模型怎样学会、又怎样被使用**
3. **Token 与概率生成：AI 为什么不是在查一条固定答案**
4. **Context Window：AI 一次能看到的信息为什么有限**

Hallucination（幻觉）已经在 F1-03 以用户问题方式建立直觉，Stage 3 不再重新从定义讲一次。

---

# 4. Heavy concepts moved out of beginner opening

以下内容明确不进入 Beginner Batch A：
- AI / Machine Learning / Generative AI taxonomy
- Training / Inference
- Token mechanics
- Parameters / model size
- Deterministic Logic taxonomy
- Embedding / Vector Search
- Fine-tuning
- API / Tool / MCP
- Agent internal loop

其中：
- Model / Training / Token / Context Window → Stage 3 后置；
- Embedding / Vector Search → Stage 4 后段；
- API / Tool / MCP → Stage 5；
- Skill / Workflow / Agent → Stage 6；
- 工程实现 → Advanced Technical Track。

---

# 5. Old Batch A disposition

旧 COURSE-PRODUCTION-001 的四个 Draft：

- foundation-ai-ml-generative-ai
- foundation-llm-model-vs-product
- foundation-training-inference
- foundation-generation-retrieval-rules

统一状态：

**PEDAGOGY_REJECTED / RETIRE_AS_FAILED_DRAFT_REFERENCE**

规则：
- 不再作为当前生产候选；
- 不得切换 AVAILABLE；
- 不得从学习地图链接为当前 Human Review；
- 保留代码与 Preview 作为历史失败样本；
- 未来若其中某个主题后移后重新生产，必须使用新的 Brief / lessonId，不直接把旧 Draft 修补成正式课。

**技术 PASS 不等于教学 PASS。**

---

# 6. Beginner lesson design constraints

新 Beginner Batch A 必须满足：
- 第一屏必须从生活/工作场景开始；
- 前两步禁止出现术语密集定义表；
- 每节只承担一个主问题；
- 单节最多 1–2 个必须记住的新术语；
- 如果不说英文术语也能讲明白，先用中文直觉；
- Check 检查“会不会判断”，不是检查“会不会背定义”；
- Practice 必须贴近日常工作；
- Review 最多保留 2–4 条判断规则；
- Capability 用“我现在能做什么”表达，而不是“我理解了哪些理论”。

---

# 7. Revised production sequence

下一任务：

**COURSE-PRODUCTION-002 — Beginner Batch A Rebuild**

优先生产：
1. F1-01 AI 到底能帮我做什么
2. F1-02 为什么同一个 AI，有时好用、有时不好用
3. F1-03 AI 为什么会说错，而且还说得很像真的
4. F1-04 AI 软件里的模型、搜索、文件和记忆是什么关系

Human Review 通过后，再生产 F2-01～F2-04。
