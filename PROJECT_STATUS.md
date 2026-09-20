# PROJECT_STATUS.md

> 只记录当前阶段与当前健康状态。完整实现事实见 `docs/CURRENT_SYSTEM_FACTS.md`；历史过程见 `docs/task-results/*`。

## 当前阶段

```text
MVP-001 ～ MVP-010                           COMPLETE
MVP-011-A Content Operations Console        COMPLETE
MVP-011-B Content → Knowledge Routing       COMPLETE
MVP-011-C1 Knowledge → Latest Practice      COMPLETE
MVP-011-C2 Multi-source Course Candidate    COMPLETE
MVP-011-D Knowledge Provenance Foundation   COMPLETE
MVP-011-E Deep Resource / Feishu Bridge     COMPLETE
MVP-011-F Knowledge → Practice AI Draft     COMPLETE_WITH_AI_RUNTIME_PENDING
MVP-011-G Knowledge → Course Impact         COMPLETE
RUNTIME-001 Remote Migration + Runtime      COMPLETE
ACCESS-001 Unified Resource Access Policy   COMPLETE
ACCESS-UX-001 Locked Content Conversion UX  COMPLETE
LEARNING-UX-001 Guided Learning Pilot        COMPLETE_WITH_MANUAL_UX_REVIEW_PENDING
LEARNING-UX-001-C Completion Loop            COMPLETE
LEARNING-UX-001-C Acceptance Refinement      COMPLETE
LEARNING-SPEC-001 Course Construction Spec    COMPLETE
LEARNING-UX-001-D Reference Lesson Finalization COMPLETE
LEARNING-SPEC-002 Multi-type Lesson Validation COMPLETE
LEARNING-RUNTIME-001 Generic Lesson Runtime Foundation COMPLETE
LEARNING-RUNTIME-001-A Pilot Provisioning & Acceptance COMPLETE

NEXT: LEARNING-UX-RUNTIME-ALIGN-001 — Reference UX Unification
```

## 当前系统健康

业务代码验证基线：`main@b235da6`。

```text
npm run typecheck     PASS
npm run build         PASS
Production build      30 static pages generated
Remote migrations     0000 → 0009 APPLIED
Remote runtime smoke  PASS
ACCESS runtime smoke  PASS
ACCESS UX render      PASS
Guided Lesson source  PASS
Shared rule evaluator PASS
Completion Loop smoke PASS
Acceptance refinement PASS
Reference Lesson flow PASS
Multi-type Spec check PASS
Generic Runtime check PASS
Generic Practice      PASS
Pilot provisioning    PASS
Pilot runtime accept  PASS
Real AI boundary      PASS
Required Check gate   PASS
Guided Lesson build   PASS
Test data cleanup     PASS
```

正式 Runtime：Next.js App Router + PostgreSQL + Drizzle。根目录静态 HTML/CSS/JS 是 legacy prototype。

## 当前用户 Access

```text
AI Daily Top3                   FREE
AI Daily 全部                   公众号关注 OR OPC_MEMBER
Knowledge 正文                  MEMBER
Feishu Deep Resource            MEMBER
Latest Practice 卡片            PUBLIC VISIBLE
Latest Practice 详情 / 正式实操  MEMBER
进阶内容关联课程入口             MEMBER
```

公众号关注不等价于 Membership。公开 Reader 不读取会员正文 / Deep Resource URL / Practice-Course 私有关系，会员通过 Access 后才读取完整详情。ACCESS-UX-001 进一步固定：受限内容保持可发现，锁定状态必须显示价值说明与对应解锁 CTA，不能因为无权限就把内容入口完全隐藏。

## 当前仍未完成

```text
真实 AI Provider Runtime
AI Daily 自动采集 / AI 初筛 / 自动摘要
Feishu API sync
Obsidian export
Skill v0.1 真实 AI 数据迭代
Subscription / Order / Payment / WeChat Pay
微信真实 OAuth / Official Account webhook
```

## 下一步边界

`LEARNING-RUNTIME-001-A` 已完成两个 Generic Runtime Pilot 的正式 Provisioning 与真实 Runtime Acceptance：`memory-rag` required Check、`task-decomposition` required `STRUCTURED_TEXT_V1` Practice 已写入正式数据库并保持 `PUBLISHED`。Runtime / Completion Gate 已跑通，但这不代表两个 Pilot 已采用最终课程 UX。最新 UX 决策固定：正式课程只保留一套 `task-brief` Reference Lesson Shell（课程上下文 / 侧栏 / 当前课位置 + 单 Step Guided Learning），Lesson Type 只改变 Step 组合、内容与 Completion Gate，不建立 CONCEPT / APPLICATION / PRACTICE 三套视觉产品。此前 `/learning-preview` 三课型演示页因偏离 Reference UX 已删除。下一步先做 `LEARNING-UX-RUNTIME-ALIGN-001`，再进入 Course Builder Skill。

`AI-DAILY-001` 仍保持后续最小内容供给闭环：

```text
External Signal
→ Collect / Normalize / Deduplicate
→ Rule Filter / AI Assist（真实 Provider 可用时）
→ Human Review
→ Publish
```

不扩 Payment / Obsidian / Media / Feishu 自动同步，不建设通用 Skill Platform。

```text
系统可运行
→ 真实 Runtime
→ 用户 Access 正确
→ 内容供给可持续
→ 真实 MVP 可验收
→ 再增加功能
```