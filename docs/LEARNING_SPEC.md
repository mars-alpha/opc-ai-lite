# OPC Course Construction Specification

> Task: LEARNING-SPEC-001
>
> Status: APPROVED_BASELINE
>
> Scope: 定义 OPC 课程如何规划、建造、验证、维护，以及未来 Course Builder Skill 的输入输出边界。
>
> 本规范只定义产品与建造规则，不修改当前数据库 Schema，不自动迁移既有课程，不允许 Skill 直接发布课程。

---

## 1. 核心目标

OPC 课程不是“AI 文章库”，而是一条从理解 AI 到使用 AI，再到业务拓展与真实业务落地的能力路径。

固定原则：

```text
课程按能力 / 知识点拆分，不按固定时长拆分
每个 Lesson 只解决一个核心学习问题
每个 Step 只完成一个明确认知或操作任务
不要让用户一直读，要让用户一直完成
课程状态始终可见，主学习区保持专注
稳定核心课程低频更新，动态实践高频更新
```

课程建造的长期架构：

```text
Human defines good course
        ↓
Course Construction Spec
        ↓
Course Builder Skill
        ↓
Structured Lesson Draft / Improvement Proposal
        ↓
Code Validation
        ↓
Human Review
        ↓
Published Course

Code = Truth
Skill = Intelligence
Workflow = Controlled Bridge
Core System = Authority
```

---

## 2. OPC 六阶段学习路径

### Stage 1 — AI Literacy / 看懂 AI

目标：建立现代 AI 基础认知，理解能力、边界、核心概念与基本使用逻辑。

用户完成后应能：

- 理解大模型是什么、擅长什么、不擅长什么；
- 理解 Prompt、Context、Token、多模态等基础概念；
- 理解 Knowledge Base、RAG、API、MCP、Skill、Agent、Workflow；
- 判断 AI 结果什么时候可信、什么时候需要验证；
- 看懂后续课程出现的主要 AI 行业术语。

### Stage 2 — AI Worker / 用好 AI

目标：把 AI 用到个人和工作中的真实任务，而不是只会聊天。

能力范围：

- 清楚描述任务；
- 提供有效上下文；
- 搜索与研究；
- 文件处理；
- 图片 / 音频 / 视频等多模态使用；
- 内容整理与生成；
- 数据与表格辅助；
- 多轮协作；
- 结果验证与修改；
- 形成个人稳定工作方法。

### Stage 3 — AI Workflow / 建立工作流

目标：从“单次使用 AI”升级为“可重复的 AI 工作流程”。

能力范围：

- 任务拆解；
- 流程设计；
- Tool / API / MCP / Skill 的角色理解；
- Agent 与 Workflow 的边界；
- 人工节点与自动节点；
- 输入、输出、状态与错误处理；
- 把重复工作变成稳定流程。

### Stage 4 — AI Growth / 推广、运营与增长

目标：把 AI 能力用于内容、推广、运营和增长业务。

能力范围可包括：

- 内容生产；
- 选题与研究；
- 推广素材；
- 营销文案；
- 社媒运营；
- 用户分析；
- 活动策划；
- 数据复盘；
- 私域运营；
- 客服与销售辅助。

### Stage 5 — AI Solution Builder / AI 解决方案

目标：从“会使用 AI”升级为“能围绕业务问题设计 AI 解决方案”。

标准链路：

```text
发现业务问题
→ 拆解问题
→ 判断适合 AI 的部分
→ 设计解决方案
→ 选择模型 / Workflow / Skill / 数据 / 工具
→ 做原型
→ 测试
→ 验证
→ 交付
```

### Stage 6 — FDE / 真实业务落地

目标：进入真实业务场景完成分析、部署、交付与持续优化。

标准链路：

```text
进入真实业务现场
→ 理解需求
→ 梳理流程
→ 找到 AI 机会
→ 设计方案
→ 搭建 / 部署
→ 验证结果
→ 培训使用
→ 持续优化
```

### 六阶段总体边界

```text
Stage 1–3
= 学会 AI 基础能力

Stage 4–6
= 用 AI 做业务拓展与真实落地
```

---

## 3. AI 基础必懂概念

以下属于稳定核心知识。它们必须被系统性讲清，但不因为行业热点就各自发展成无限扩张的一级课程体系。

### 必懂概念

1. Large Language Model / 大语言模型
2. 模型能力与边界
3. Prompt / 提示与任务说明
4. Context / 上下文
5. Token
6. Multimodal / 多模态
7. Knowledge Base / 知识库
8. RAG / Retrieval-Augmented Generation
9. API
10. MCP / Model Context Protocol
11. Skill
12. Agent
13. Workflow

### 推荐理解顺序

```text
模型
→ Prompt
→ Context / Token
→ 多模态
→ Knowledge Base
→ RAG
→ API
→ MCP
→ Skill
→ Agent
→ Workflow
```

### 概念课的深度原则

基础阶段首先要求用户做到：

```text
知道它是什么
→ 为什么存在
→ 解决什么问题
→ 和相近概念有什么区别
→ 什么时候会用到
→ 有什么限制 / 风险
```

不要求所有用户在基础阶段立即掌握工程实现。

例如：

- API 基础课不等于程序员 API 开发课；
- MCP 基础课不等于 MCP Server 开发课；
- RAG 基础课不等于向量数据库工程课；
- Agent 基础课不等于复杂 Agent Framework 开发课。

深入实现应在 Workflow / Solution Builder / FDE 阶段按需要出现。

---

## 4. Course Type Matrix

MVP 固定四种课程类型。

| Lesson Type | 目的 | 必备模块 | 默认 Completion Gate |
| --- | --- | --- | --- |
| CONCEPT | 理解一个核心概念 | Explain + Example + Check + Review + Capability | Check 通过 |
| APPLICATION | 把一个知识点用于实际任务 | Explain + Example + Check + Guided Practice + Review + Capability | Check + Practice |
| PRACTICE | 独立完成一项真实能力训练 | Brief + Example + Independent Practice + Evaluate / Revise + Review + Capability | Practice 通过 |
| PROJECT | 综合多个知识点完成真实产出 | Goal + Requirements + Milestones + Deliverable + Evaluation + Reflection | 项目产出达到要求 |

### 课程类型不是页面模板数量

Skill 不得因为遇到新主题就随意创建：

- “Agent 类型”
- “RAG 类型”
- “工具类型”
- “多模态类型”

这些是知识内容，不是课程建造类型。

### 模块允许裁剪，但结构受控

并非每节 Lesson 必须机械使用六步。

允许按 Lesson Type 选择必要 Step，但只能从本规范定义的结构中组合。

Skill 不允许自由发明新的核心课程流程。

---

## 5. Standard Lesson Experience

推荐完整流程：

```text
Step 1  理解
↓
Step 2  案例
↓
Step 3  理解检查
↓
Step 4  自己做 → 检查 → 修改 → 通过
↓
Step 5  学习回顾
↓
Step 6  能力获得
↓
点击“继续下一课”
↓
可选课程评分
↓
下一课
```

### 5.1 课程状态必须始终清晰

Lesson 页面不能因为“沉浸”而隐藏课程上下文。

至少保持：

- 当前课程名称；
- 当前第几课 / 总课数；
- 课程完成进度；
- 已完成 Lesson；
- 当前 Lesson；
- 后续 Lesson；
- 锁定 Lesson；
- 返回学习路径入口。

主学习区可以单 Step 专注，但用户必须始终知道自己在哪里。

### 5.2 Step 1 — 理解

目的：讲清当前 Lesson 的核心知识。

要求：

- 一个 Step 只讲一个核心点；
- 中文优先；
- 必要的行业术语使用“中文 + English”；
- 不为显得专业而堆术语；
- 明确“学完这一小步会知道什么”。

### 5.3 Step 2 — 案例

大多数课程默认需要案例。

优先结构：

```text
错误 / 模糊示例
→ 更好的示例
→ 为什么更好
→ 用户需要观察什么
```

案例必须服务学习目标，不作为装饰。

### 5.4 Step 3 — 理解检查

目的：验证用户是否真正理解当前关键概念。

规则：

- 作答前不得泄露正确答案；
- 不写“选对某某答案即可进入下一步”；
- 只说明“答对后进入下一步”；
- 用户主动点“还是不懂”时才提供明确提示；
- 答错后的反馈要说明“哪里理解错了”；
- Check 不是为了考试，而是为了确认下一步能否继续。

### 5.5 Step 4 — Practice Closure

这是实操类 Lesson 的关键闭环。

禁止：

```text
[提交并检查]
+
页面底部另一个竞争性的 [下一步]
```

推荐单一主流程：

```text
未提交
→ [检查我的答案]

未通过
→ 显示具体反馈
→ 用户原地修改
→ [修改后重新检查]

已通过
→ 显示通过状态
→ [继续学习 →]
```

Practice 必须尽量在同一 Step 完成：

```text
自己做
→ 检查
→ 看反馈
→ 修改
→ 再检查
→ 通过
```

用户不应该为了修改结果在不同 Step 之间来回跳。

### 5.6 Step 5 — 学习回顾

Step 5 不再承担第二次 Practice，也不重复复制任务内容到真实 AI 工具。

标准内容：

- 本课最关键的知识点；
- 用户刚刚完成了什么；
- “查看我的最终答案”；
- 学习自评；
- 可选择“再练一次”。

学习自评建议：

```text
我可以自己完成
我基本明白，但还需要参考
我还需要再练一次
```

学习自评用于判断用户主观掌握状态，不是课程质量评分，也不是 Completion Gate。

### 5.7 Step 6 — 能力获得

只负责获得感和下一步方向。

标准内容：

```text
本课完成 ✓

你现在会什么
你完成了什么
下一课将学会什么
学习路径 →
```

禁止在 Step 6 放：

- 课程问卷；
- “查看公众号权益”；
- “查看 OPC 会员学习路径”；
- 非当前 Access 阻断所必需的转化 CTA。

---

## 6. “还是不懂”规则

“还是不懂”属于当前 Step 的即时帮助，不是泛化辅导模块。

固定规则：

```text
用户主动点击
→ 只展示当前 Step 的明确提示
→ 提示必须帮助用户完成当前动作
→ 不泄露本应由用户判断的答案
```

禁止：

- “先不用记英文术语”一类泛化提醒；
- 与当前任务无关的学习鸡汤；
- 自动跳转大量复习内容；
- 在用户没有主动求助前直接展示答案。

提示层级以后可以演进为：

```text
方向提示
→ 更具体提示
→ 示例 / 参考
→ 推荐复习
```

但第一版不要求复杂 Hint Engine。

---

## 7. Reference Answer / 学习脚手架

参考答案是新手起步工具，不是标准答案。

标准能力：

```text
查看参考
→ 一键带入
→ 用户阅读并修改
→ 恢复自己的版本
```

固定原则：

- 参考答案必须明确“不是唯一答案”；
- 一键带入后必须可编辑；
- 不覆盖用户原内容而不给恢复路径；
- 使用参考答案不阻止用户完成课程；
- 使用参考答案不自动等于 Mastered；
- 可记录 reference_viewed / reference_applied / reference_restored 作为学习事实。

目标是形成：

```text
模仿
→ 修改
→ 半独立
→ 独立完成
```

---

## 8. Real AI Operation

OPC 不使用“可选加入外部 AI”这一概念。

唯一问题是：

> 这节课的学习目标是否需要用户在真实 AI 产品中实际操作？

机器可读字段：

```text
real_ai_operation:
  NONE
  GUIDED
  REQUIRED

real_ai_evidence:
  NONE
  USER_CONFIRMATION
  ARTIFACT
  SYSTEM_RESULT
```

### NONE

不需要离开 OPC 即可证明本课学习目标。

### GUIDED

真实操作有助于形成完整理解，课程明确引导用户实际执行，再回来继续。

### REQUIRED

如果不在真实 AI 产品中完成操作，就无法证明学会本课核心能力。

`REQUIRED` 不能只是一句课程文案，必须同时定义如何证明已经完成真实操作：

- `USER_CONFIRMATION`：用户明确确认已经在真实工具完成；
- `ARTIFACT`：提交真实操作产生的文件、结果或结构化产物；
- `SYSTEM_RESULT`：由已接入的 Provider / Tool Runtime 返回可验证结果。

当 `real_ai_operation = REQUIRED` 时：

```text
real_ai_evidence != NONE
AND
completion_gates includes REAL_AI
```

固定判断：

```text
只有“不实际操作就无法证明学会”
→ 才使用 REQUIRED
```

禁止因为：

- 页面看起来更丰富；
- 想增加互动；
- 模板默认；
- Skill 自由发挥；

而添加真实 AI 操作。

真实 AI 操作由 Learning Objective 触发，不由 Course Builder Skill 自行装饰。

---

## 9. Feedback Model

必须区分两种完全不同的数据。

### Learning Self-Assessment / 学习自评

问题：

> 我学会了吗？

位置：Step 5。

用途：

- 判断用户主观掌握状态；
- 帮助推荐再练 / 复习；
- 与实际 Check / Practice 数据结合分析。

不作为课程质量评分。

### Course Rating / 课程评分

问题：

> 这节课教得好吗？

出现时机：

```text
Lesson 已完成
→ 用户点击“继续下一课”
→ 出现轻量课程评分
→ 提交 或 跳过
→ 进入下一课
```

建议第一层：

```text
没太学懂
基本有帮助
很有帮助
```

可展开原因：

- 有些地方没讲清楚；
- 案例不够贴近实际；
- 操作步骤不明确；
- 提示还不够；
- 通过标准不直观；
- 练习难度不合适；
- 其他。

规则：

- 永远可跳过；
- 永远不是 Completion Gate；
- 不放在 Step 6 正文里；
- 课程已经完成后才出现。

---

## 10. Access / Conversion UX

课程教学与商业转化必须分离。

### 正常学习中

不提前展示：

- 公众号权益 CTA；
- 会员购买 CTA；
- 与当前任务无关的解锁提示。

### 真实 Access 阻断时

```text
Core Access DENY
→ 显示被锁内容价值
→ 显示真实解锁条件
→ FOLLOW 才提示公众号
→ MEMBER 才提示会员
```

Access Core 永远是权限事实源。

### Step 6

只保留：

```text
学习路径 →
```

### Learning Path

负责清楚说明：

- 免费学习范围；
- 公众号关注解锁范围；
- OPC 会员范围；
- 当前课程与未来课程状态。

Learning Path 是“全局解释权益”的位置，Lesson 正文不是。

---

## 11. Completion Gate

Completion Gate 按 Lesson Type 决定，不是一套规则覆盖所有课。

建议基线：

```text
CONCEPT
→ required Check passed

APPLICATION
→ required Check passed
→ required Practice passed

PRACTICE
→ required Practice passed

PROJECT
→ required Deliverable / Project Evaluation passed

ANY LESSON WITH real_ai_operation = REQUIRED
→ required Real AI evidence passed
```

永远不能作为 Completion Gate：

- 课程评分；
- 学习自评；
- 查看参考答案；
- 点击“还是不懂”；
- 非 REQUIRED 的真实 AI 操作；
- 公众号关注 / 会员转化本身（除非 Access Core 本来就限制该资源）。

---

## 12. Machine-readable Lesson Spec Draft

本任务不修改数据库 Schema。以下是未来 Lesson / Step Contract 的规范草案。

```ts
type LessonType =
  | "CONCEPT"
  | "APPLICATION"
  | "PRACTICE"
  | "PROJECT";

type RealAiOperation =
  | "NONE"
  | "GUIDED"
  | "REQUIRED";

type RealAiEvidence =
  | "NONE"
  | "USER_CONFIRMATION"
  | "ARTIFACT"
  | "SYSTEM_RESULT";

type PracticeMode =
  | "NONE"
  | "GUIDED"
  | "INDEPENDENT"
  | "PROJECT";

type CompletionGate =
  | "CHECK"
  | "PRACTICE"
  | "DELIVERABLE"
  | "REAL_AI";

type LessonSpec = {
  version: string;
  lessonId: string;
  title: string;

  lessonType: LessonType;

  learningObjectives: string[];
  knowledgePoints: string[];
  prerequisites: string[];

  requiresExample: boolean;
  requiresCheck: boolean;
  practiceMode: PracticeMode;
  realAiOperation: RealAiOperation;
  realAiEvidence: RealAiEvidence;

  referenceAnswerEnabled: boolean;
  reviewEnabled: boolean;
  selfAssessmentEnabled: boolean;
  courseFeedbackEnabled: boolean;

  completionGates: CompletionGate[];

  steps: LessonStepSpec[];

  capabilityGain: string[];
  nextLessonValue?: string;

  accessPresentation: {
    showCourseContext: true;
    showLearningPathLink: true;
    inlineConversionCta: false;
  };
};
```

Step 草案：

```ts
type LessonStepKind =
  | "EXPLAIN"
  | "EXAMPLE"
  | "CHECK"
  | "PRACTICE"
  | "REVIEW"
  | "CAPABILITY";

type LessonStepSpec = {
  id: string;
  kind: LessonStepKind;
  title: string;
  objective: string;

  content?: unknown;
  examples?: unknown[];

  check?: {
    type: string;
    prompt: string;
    options?: unknown[];
    passRule: unknown;
    preAnswerHint?: never;
  };

  hints?: {
    level: number;
    content: string;
  }[];

  practice?: {
    instructions: unknown;
    evaluationRule: unknown;
    referenceAnswer?: unknown;
  };

  canSkip: boolean;
  gate?: "NONE" | "CHECK_PASSED" | "PRACTICE_PASSED" | "REAL_AI_PASSED";
};
```

### Schema 设计原则

- Schema 表达教学意图，不绑定某一个 UI；
- 前端组件按 Spec 渲染；
- Completion 由 Core 解释；
- Skill 只能输出符合 Spec 的 Draft；
- Schema Validation 失败时禁止进入发布审核；
- 第一版不建设复杂 Mastery Schema。

---

## 13. Course Builder Skill Contract

未来名称建议：

```text
OPC Course Builder Skill
```

### 13.1 模式

```text
BUILD
从已审核 Knowledge / 课程规划生成课程 Draft

IMPROVE
根据学习事实 / 课程反馈 / 新 Knowledge
生成已有课程的修改 Proposal
```

### 13.2 输入

BUILD 最少输入：

- Stage；
- Module；
- Lesson topic；
- Lesson Type；
- 目标用户；
- 难度；
- Learning Objectives；
- 前置知识；
- Reviewed Knowledge；
- 已有相邻 Lesson；
- 当前 Course Spec Version。

IMPROVE 可增加：

- 当前 Published Lesson；
- Check 正确率；
- Practice 通过率；
- Hint 使用情况；
- still_confused；
- reference_viewed / applied；
- 学习自评；
- 课程评分；
- Course Insight；
- 新 Reviewed Knowledge；
- Latest Practice 变化。

### 13.3 Structured Output

BUILD：

```text
lesson_metadata
learning_objectives
knowledge_points
lesson_type
steps
examples
check
practice
hints
reference_answer
review
self_assessment
capability_gain
next_lesson_value
real_ai_operation
real_ai_evidence
completion_gates
```

IMPROVE：

```text
change_summary
evidence
affected_steps
proposed_changes
reason
risk
keep_unchanged
validation_plan
```

### 13.4 Skill 禁止行为

Skill 不能：

- 直接发布 Published Course；
- 修改 Access / Entitlement；
- 修改用户学习进度；
- 修改 Completion 状态；
- 自己新增数据库 Schema；
- 自由创造新的核心 Lesson Flow；
- 把课程评分设为 Gate；
- 为了丰富页面随意加真实 AI 操作；
- 未经证据直接重写稳定核心课程；
- 绕过 Human Review。

标准链：

```text
Skill Draft / Proposal
→ Schema Validation
→ Rule Validation
→ Human Review
→ Core writes Production Data
```

---

## 14. Course Maintenance Strategy

课程不是同一个更新频率。

### Stable Core Course / 低频

包括：

- AI 基础概念；
- 基础使用方法；
- Workflow 原理；
- Growth 基础方法；
- Solution Builder 方法论；
- FDE 方法论。

只有在方法论明显变化或真实学习数据长期证明需要调整时更新。

### Examples / Practice / 中频

包括：

- 案例；
- 实操题；
- Reference Answer；
- 工具操作示例；
- 业务场景。

根据真实用户反馈、工具变化和业务实践更新。

### Dynamic Layer / 高频

包括：

- AI Daily；
- Latest Practice；
- Reviewed Knowledge；
- 新工具 / 新模型动态；
- 最新行业实践。

动态层负责“跟上 AI”，而不是让核心课程每天重写。

标准关系：

```text
Stable Course
+
Updated Examples / Practice
+
AI Daily
+
Knowledge
+
Latest Practice
```

---

## 15. Skill 使用策略

Course Builder Skill 不承担“每天重写所有课程”。

### 第一次

主要用于：

```text
读取现有课程
→ 按 OPC Course Spec 标准化
→ 生成缺失案例 / Check / Practice / Review / Capability
→ Human Review
→ 分批迁移
```

### 后续

低频维护：

```text
Learning Data
+
Course Feedback
+
Reviewed Knowledge
+
Latest Practice
↓
Course Builder Skill IMPROVE
↓
Change Proposal
↓
Human Review
```

高频更新进入 Knowledge / AI Daily / Latest Practice，而不是强行修改 Published Course。

---

## 16. Validation Strategy

LEARNING-SPEC-001 完成后不直接批量迁移全部课程。

固定验证顺序：

```text
1. task-brief
   → 作为 Reference Lesson
   → 按最终 Spec 完成第 4 / 5 / 6 步与课程评分

2. 再选择 2–3 个不同类型 Lesson
   → 一节 Concept
   → 一节 Practice / Application
   → 一节 Workflow / Tool-concept related Lesson

3. 验证同一 Spec 是否适配

4. 建 Course Builder Skill v0.1

5. 用真实课程跑 BUILD

6. 人工 Review

7. 稳定后批量完善全部课程
```

通过标准不是“Skill 能生成内容”，而是：

- 结构一致；
- 教学逻辑一致；
- Completion Gate 正确；
- 不泄露答案；
- Practice 可闭环；
- 用户知道自己学到哪里；
- Skill 输出无需大量人工重写；
- Access / Feedback / Core 状态不被 Skill 越权。

---

## 17. Out of Scope for LEARNING-SPEC-001

本任务明确不做：

- 不新增 Migration；
- 不修改数据库 Schema；
- 不批量迁移现有 Lesson；
- 不实现 Course Builder Skill；
- 不实现 Mastery Engine；
- 不实现 Recommendation Engine；
- 不改 Access Core；
- 不发布新课程；
- 不让 AI 自动更新 Published Course。

---

## 18. 当前下一步

本规范批准后：

```text
LEARNING-SPEC-001
↓
LEARNING-UX-001-D / Reference Lesson Finalization
按 Spec 完成 task-brief 最终页面逻辑
↓
选择 2–3 节不同类型课程验证 Spec
↓
COURSE-BUILDER-SKILL-001
OPC Course Builder Skill v0.1
↓
批量完善现有课程
```
