# MVP-CLOSEOUT-FIX-001 — Product / Access / Data Consistency Fix

Status: COMPLETE

## Goal

根据 `MVP-CLOSEOUT-AUDIT-001` 的发现，只做进入下一阶段前必要的一致性修复；不扩支付、不扩 AI Evaluator、不新增 Submission Schema、不做 N+1 重构。

## 1. Latest Practice 正式用户入口

`/practice` 的 Latest Practice 卡片现在真正读取：

```text
item.practiceId
→ PracticeSubmissionPanel compact
→ GET /api/learning/practices/:practiceId
→ POST /api/learning/practices/:practiceId/submissions
```

正式样本：

```text
practice_latest_evaluation_workflow
```

因此 MVP-010 Acceptance 文档中的“Latest Practice 已接用户侧入口”现在与代码事实一致。

## 2. Basic Practice 双轨边界

`/practice` 下方 4 个本地 `tasks[]` 不迁移数据库。

当前正式定位固定为：

```text
Autonomous Practice / 自主练习示例
→ 不保存进度
→ 不创建 Practice Submission
→ 不产生 Evaluation / Event
```

需要正式记录的实操继续使用：

```text
课程内 LESSON_PRACTICE
Latest Practice
Stage Project
```

这样保留轻量练习入口，同时避免“看起来可提交、实际不保存”的产品误导。

## 3. Lesson-only Practice 边界

以下两个服务端查询已显式增加：

```text
type = LESSON_PRACTICE
```

位置：

```text
getInteractiveLesson()
hasPassedRequiredPractices()
```

因此即使未来非 Lesson Practice 带有 lesson_id，也不会误进入 Interactive Lesson 或阻塞 Lesson Completion。

## 4. Membership Benefit Truthfulness

会员权益矩阵不再把尚未接入 Runtime 的能力显示为已开放 `✓`。

当前明确区分：

```text
✓      = 当前已开放
规划   = 仍是产品计划，尚未形成正式 Access Runtime
```

当前已真实成立的会员能力包括：

```text
Stage 1 指定章节：active Membership 可解锁
MEMBER Practice / Stage Project：active Membership 可解锁
```

以下仍明确标为规划：

```text
完整课程
完整 AI 日报
深度解读 / 课程关联
深度资料 / 扩展教程 / 附件
最新课程内容与新增资料
```

支付按钮继续 disabled，不伪造 Subscription 已上线。

## 5. Stage Project Completion Rule

当前 MVP 固定：

```text
Lesson required Practice
→ 可以阻塞 Lesson Completion

Stage Project
→ 当前为可选综合项目
→ PASSED 保存 Submission / Evaluation / Event
→ 不阻塞下一 Stage
```

若未来需要 required Stage Project，必须新增明确 completion policy 并单独验收，不能复用 Lesson Gate 隐式实现。

该规则已同步到：

```text
docs/domains/COURSE.md
```

## 6. Governance consistency

`TASKS.md` 已修正：

```text
MVP-010 Status = COMPLETE
旧 PASSED / RETRY / REVIEW_REQUIRED
→ SUBMITTED / NEEDS_REVISION / PASSED / EVALUATION_FAILED
```

并加入 `MVP-CLOSEOUT-FIX-001 = COMPLETE`。

`PROJECT_STATUS.md` 的 NOW 已更新为：

```text
MVP-010 COMPLETE
MVP-CLOSEOUT-AUDIT-001 COMPLETE
MVP-CLOSEOUT-FIX-001 COMPLETE
下一阶段待讨论确定
```

不自动从 backlog 启动新任务。

## 7. Deliberately not changed

本任务没有处理：

```text
Subscription / Order / Payment / Refund
AI Evaluator
第二种 Submission Schema
文件 / 图片 / URL Submission
N+1 优化
Entitlement 多 source grant 模型
```

这些仍需未来独立任务与验收。

## Validation

```text
npm run typecheck  PASS
npm run build      PASS
Next.js pages      31
```

Build 包含：

```text
/practice
/projects/[slug]
/api/learning/practices/[practiceId]
/api/learning/practices/[practiceId]/submissions
```

## Closeout

`MVP-CLOSEOUT-FIX-001`：COMPLETE。

MVP-010 后的主要产品 / 权限 / 数据一致性问题已经收掉。下一阶段可以重新按产品主线讨论，不需要再继续为 Practice / Project 核心补结构。
