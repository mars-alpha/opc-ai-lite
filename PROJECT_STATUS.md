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
LEARNING-UX-RUNTIME-ALIGN-001 Reference UX Unification COMPLETE
COURSE-BUILDER-SKILL-001 Course Builder Skill v0.1 CONTRACT_COMPLETE_RUNTIME_PENDING
COURSE-BUILDER-SKILL-001-A Real Lesson Draft Acceptance TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING
COURSE-BUILDER-SKILL-001-B Draft Preview & Human Review PREVIEW_READY
COURSE-BUILDER-SKILL-001-C Beginner Pedagogy & Knowledge Grounding COMPLETE
COURSE-BUILDER-SKILL-001-D Six-Step Beginner Experience & Visual Hierarchy COMPLETE
COURSE-BUILDER-SKILL-001-E First Step Interactive Intro COMPLETE
COURSE-BUILDER-SKILL-001-F First Step Direct Comparison COMPLETE
COURSE-BUILDER-SKILL-002-A Real APPLICATION Lesson Acceptance TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING
COURSE-BUILDER-SKILL-002-B Knowledge Depth Expansion COMPLETE_HUMAN_REVIEW_PENDING
COURSE-BUILDER-SKILL-002-C Six-Step Knowledge Responsibility Contract COMPLETE
COURSE-BUILDER-SKILL-002-D Concept Mastery Before Practice Contract COMPLETE
COURSE-BUILDER-SKILL-003-A Real PRACTICE Lesson Acceptance TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING
COURSE-BUILDER-SKILL-004-A Real PROJECT Lesson Acceptance TECHNICAL_ACCEPTANCE_PASS_RUNTIME_BLOCKED_HUMAN_REVIEW_PENDING

NEXT: Human Review — open /course-builder/preview/ai-workflow-project and review the real PROJECT lesson
```

## 当前系统健康

业务代码验证基线：`main@b235da6`。

```text
npm run typecheck     PASS
npm run build         PASS
Production build      34 static pages generated
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
Unified Reference UX   PASS
Course Builder contract PASS
Real Lesson Draft       PASS
Draft Preview route     PASS
Course grounding rules  PASS
Terminology readability PASS
AI-tool-neutral rules   PASS
Beginner participation  PASS
Six-step concept UX     PASS
Visual hierarchy        PASS
First-step direct compare PASS
APPLICATION Draft       PASS
Check / Practice schema PASS
APPLICATION Practice gate PASS
Step feedback isolation PASS
Practice reference answer PASS
Practice one-click fill PASS
APPLICATION knowledge depth PASS
Six-step responsibility contract PASS
Concept mastery before practice PASS
Check single / true-false / multi-select PASS
PRACTICE Draft          PASS
PRACTICE independent mode PASS
PRACTICE completion gate PASS
PRACTICE one-owner scoring PASS
PRACTICE knowledge depth PASS
PROJECT Draft           PASS
PROJECT mode            PASS
PROJECT Deliverable gate declared PASS
PROJECT Deliverable runtime BLOCKED (expected)
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

`COURSE-BUILDER-SKILL-002-D` 已固化 Concept Mastery Before Practice：四种 Lesson Type 的 BUILD Draft 必须 `conceptMasteryBeforePractice=true`，前 3 步按 EXPLAIN → EXAMPLE → CHECK 完成概念理解闭环，第 4 步 PRACTICE 原则上不得首次教授新的核心概念。Course Builder Check 现在支持 SINGLE_CHOICE / TRUE_FALSE / MULTI_SELECT；Draft Preview 可确定性判分。正式学习 Runtime 的 Check 持久化仍为旧单答案模型，本任务未改 DB/API。

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