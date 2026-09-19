# MVP-010-D — Stage Project + Latest Practice Samples

Status: COMPLETE

## Goal

在不再修改 Practice 核心模型的前提下，各建立 1 个正式 `STAGE_PROJECT` 与 `LATEST_PRACTICE` 样本，证明它们真实复用 MVP-010 已建立的：

```text
Practice Read
→ Access Resolver
→ Membership Policy
→ Submission Schema Dispatch
→ Submission
→ Evaluation
→ Event
```

## Formal Stage Project sample

正式样本：

```text
id: practice_stage_personal_knowledge_assistant
type: STAGE_PROJECT
accessTier: MEMBER
stageId: stage_chatgpt_worker
submissionSchema: TASK_BRIEF_V1
status: PUBLISHED
```

对应现有产品项目：

```text
/projects/personal-knowledge-assistant
个人知识助手
Stage 1–2
```

`lib/stageProjects.ts` 已记录对应 `practiceId`，让静态产品定义与正式 Practice 数据建立明确引用。

该样本的任务简报围绕：真实问题、使用场景、资料范围、事实/隐私边界、问答测试与失败复盘。

## Formal Latest Practice sample

正式样本：

```text
id: practice_latest_evaluation_workflow
type: LATEST_PRACTICE
accessTier: FREE
sourceContentId: content_demo_evaluation-practice
sourceKnowledgeId: knowledge_demo_evaluation-practice
submissionSchema: TASK_BRIEF_V1
status: PUBLISHED
```

对应现有 AI Daily / Knowledge 示例：

```text
示例：AI 工作流为什么必须有 Evaluation？
destination: PRACTICE_CANDIDATE
```

`lib/contentDemo.ts` 已记录对应 `practiceId`。

该样本把“工作流是否有效”转成正式 Evaluation 实操，要求定义成功目标、业务场景、测试输入、失败边界、人工检查点和结果输出。

## Seed

两个样本都已加入正式 seed：

```text
lib/server/db/seed.ts
```

并真实执行：

```text
npm run db:seed  PASS
```

不会创建第二套 Project / Latest Submission 表。

## Membership Runtime

对 Stage Project 使用临时真实用户验证：

先补齐 Stage 1 学习前置条件，但不授予会员：

```text
getPracticeReadModel()
→ allowed = false
→ reason = MEMBERSHIP_REQUIRED
→ content = null
```

随后授予：

```text
MEMBERSHIP
PRODUCT
OPC_MEMBER
```

重新读取：

```text
allowed = true
reason = MEMBERSHIP
```

说明 `STAGE_PROJECT + MEMBER` 已真实复用 `BIZ-FOUNDATION-001` 的 Membership Policy。

## Stage Project Submit Runtime

会员用户提交正式样本：

```text
practice_stage_personal_knowledge_assistant
→ TASK_BRIEF_V1 validation
→ practice_submissions
→ RULE Evaluation
→ PASSED
→ score = 98
→ attempt = 1
```

PASS。

## Latest Practice Runtime

正式 Latest Practice：

```text
practice_latest_evaluation_workflow
→ source Content / Knowledge 均为 PUBLISHED
→ FREE access
→ canonical read ALLOWED
→ submit
→ RULE Evaluation
→ PASSED
→ score = 96
→ attempt = 1
```

PASS。

## Event Runtime

两个非 Lesson Practice 都真实产生：

```text
submission_created
evaluation_completed
practice_passed
```

事件中的 Practice target / properties 分别正确指向：

```text
STAGE_PROJECT
LATEST_PRACTICE
```

并验证：

```text
lessonId = null
```

没有把 Stage Project / Latest Practice 错误归到某个 Lesson 行为信号。

临时测试用户、会员 Entitlement、Progress、Submission、Evaluation、Event 已通过 user cascade 清理；两个正式 Practice 样本保留。

## Architecture result

至此三种 Practice 已经有真实正式样本：

```text
LESSON_PRACTICE
practice_task_brief_structured

STAGE_PROJECT
practice_stage_personal_knowledge_assistant

LATEST_PRACTICE
practice_latest_evaluation_workflow
```

全部共用：

```text
practices
practice_submissions
practice_evaluations
resolvePracticeAccess()
getPracticeReadModel()
submitPractice()
TASK_BRIEF_V1 validator dispatch
RULE evaluator
learning_events
```

## Frontend boundary

本阶段只把 Stage Project / Content Demo 的产品数据与正式 `practiceId` 建立映射，并完成服务端 Runtime。

现有：

```text
/projects/[slug]
/practice
```

仍主要是静态展示页，尚未把两个新正式样本接成完整提交 UI。

这不影响 D 阶段“正式样本 + 共用核心 Runtime”的验收；前端是否要在 MVP-010 收口前接入，应在下一步 Acceptance / Closeout 时单独决定，避免顺手扩 UI。

## Validation

```text
npm run typecheck             PASS
npm run db:seed               PASS
Formal sample rows            PASS
Stage membership gate         PASS
Stage member access           PASS
Stage Project submit          PASS / 98
Latest Practice read          PASS
Latest Practice submit        PASS / 96
Non-Lesson Events             PASS
Test data cleanup             PASS
npm run build                 PASS
Next.js pages                 31
```

## Next

进入 `MVP-010-ACCEPTANCE — Practice / Project Runtime Acceptance & Closeout`。

下一步不再扩模型，先对 MVP-010 的三类 Practice、权限、Submission、Evaluation、Event、会员、Completion 与前端边界做一次总验收，再决定是否在收口前把 Stage Project / Latest Practice 的正式提交 UI 接到现有页面。
