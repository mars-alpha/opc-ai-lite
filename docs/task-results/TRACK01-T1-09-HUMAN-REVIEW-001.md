# TRACK01-T1-09-HUMAN-REVIEW-001 — Human Review

Status: **HUMAN_REVIEW_PASS**

Lesson: **T1-09 — 知识库（Knowledge Base）与事实源（Source of Truth）**
Lesson ID: `t1-09-knowledge-source`
Reviewed Draft: **1.0.1-track01-t109-review**
Reviewer authority: 产品负责人已明确要求执行 T1-09 Human Review，并授权通过后继续 LessonSpec Registry + Runtime Provisioning。

## Review result

T1-09 Human Review **PASS**。

本轮按真实前台六步责任逐项检查，不以 Code Validation 替代教学审核。通过条件包括：易理解、认知负担可控、Check 像判断训练、Step 4 真正可做、Step 5 留下长期判断、Step 6 能形成可调用能力，并与 T1-08 / T1-10 保持清楚边界。

## Six-step review

### Step 1 — EXPLAIN

PASS。

最终前台不再提前完整重复 Step 2 的会员价格案例。Step 1 只呈现“资料都在，但来自不同时间 / 用途，甚至互相冲突”的现象，再明确两条核心概念：

- 知识库（Knowledge Base）回答“有哪些资料可以使用”；
- 事实源（Source of Truth）回答“资料冲突时谁拥有最终权威”。

核心判断明确，初学者不需要先理解 RAG、检索、向量数据库等后续机制。

### Step 2 — EXAMPLE

PASS。

使用单一会员价格案例展开 199 / 249 / 299 三个冲突版本。

- 原来的做法：把所有资料当成同等权威，让 AI 自己猜；
- 调整后的做法：明确当前价格配置 / 已发布价格页为正式事实源；
- 结果：答案受业务权威与冲突规则控制，而不是碰巧引用哪份旧资料。

案例证明 Step 1，没有引入新概念。

### Step 3 — CHECK

PASS。

三题依次检查：

1. 冲突时应先确认正式事实源；
2. “放进知识库后 AI 会自动知道最新 / 最权威”是错误认知；
3. 价格、退款政策、正式截止日期属于应提前指定事实源的业务事实。

题目测试判断能力，不是术语背诵；全部属于 Step 1–2 已教学内容。

### Step 4 — PRACTICE

PASS。

学习动作是：为一个真实业务问题写出

1. 业务问题；
2. 可参考资料；
3. 正式事实源；
4. 冲突规则。

四个字段组合后可直接成为完整业务知识规则。Reference Fill 与 Reference Answer 表达同一个标准任务，Reference Answer 不带字段主标题。

COPY_TO_AI 的前台反思已调整为对比“没有规则的回答”和“加入事实源规则后的回答”，与现有 Unified Lesson Shell 的“比较两次结果”表达一致。

本课为 CONCEPT，因此 Practice 不作为 Completion Gate；但 Step 4 仍有完整真实动作，不是空 PRACTICE。

### Step 5 — REVIEW

PASS。

固定回答：

- **AI适合做什么**：基于已确认的正式事实整理、解释、回答，让辅助资料补充背景；
- **AI不应该替你做什么**：在多个业务来源冲突时替业务自行决定哪份才算正式事实。

第二组复盘进一步明确：按事实源和冲突规则保持答案一致，不把旧资料、培训材料和当前正式配置视为同等权威。

两组判断职责不同，不再只是换句话重复。

### Step 6 — CAPABILITY

PASS。

能力获得明确：

- 会区分知识库与事实源；
- 会为真实业务事实指定权威来源；
- 会写资料冲突规则。

自证方式来自 selfAssessment；真实触发情境是“准备把价格、政策、产品状态、客户权益、库存或正式截止日期交给 AI 回答，但手上存在多个版本或不同系统记录”。

下一课价值明确：T1-10 再学习资料很多时怎样找到与问题相关的证据，即 Search / RAG。

## Frontend language review

PASS。

- 专业术语首次出现保持 中文（English）；
- 不暴露内部 artifact / schema / lesson ID；
- 不使用“先判断 / 再判断”等已禁止教学标签；
- Step 1 不堆理论；
- Step 4 字段自然，不为模板凑数；
- Step 5 使用现有“AI适合做什么 / AI不应该替你做什么”前台结构；
- T1-09 不提前教授 Search / RAG / Retrieval / Vector Database / Embedding / MCP。

## Targeted revisions made during Human Review

1. Step 1 从具体 199 / 249 / 299 案例改为一般“多份资料互相冲突”的现象，避免与 Step 2 重复。
2. COPY_TO_AI reflection 改为真实比较“无事实源规则 vs 有事实源规则”的两次结果。
3. Step 5 两组 Review 重新分工，减少语义重复并强化长期判断。
4. Draft version 更新为 `1.0.1-track01-t109-review`。

## Gate decision

**HUMAN_REVIEW_PASS**

允许进入：

`LessonSpec Registry → Runtime Definition → Runtime Provisioning → Runtime Acceptance`

Human Review PASS 不等于 AVAILABLE；正式发布仍要求 Runtime Ready。
