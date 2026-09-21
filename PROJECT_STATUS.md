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
COURSE-BUILDER-SKILL-002-E Formal Check Types Runtime Completion CODE_COMPLETE_LOCAL_MIGRATION_READY_REMOTE_PENDING
COURSE-BUILDER-SKILL-002-F Three-Question Mastery Sequence COMPLETE_CODE_READY_REMOTE_MIGRATIONS_PENDING
COURSE-BUILDER-SKILL-003-A Real PRACTICE Lesson Acceptance TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING
COURSE-BUILDER-SKILL-004-A Real PROJECT Lesson Acceptance TECHNICAL_ACCEPTANCE_PASS_RUNTIME_BLOCKED_HUMAN_REVIEW_PENDING
LEARNING-UX-FINAL-001 Unified Lesson Shell Freeze COMPLETE_FROZEN_V1
CURRICULUM-001 Formal Curriculum Definition COMPLETE_DEFINED_V1_MAINLINE_LOCKED
CURRICULUM-002 Foundation Knowledge Map & Lesson Briefs COMPLETE_DEFINED_V1
CURRICULUM-003 Foundation Batch A Brief Finalization COMPLETE_BRIEF_READY_V1
CURRICULUM-004 Foundation Catalog Metadata Completion COMPLETE_CATALOG_READY_V1
LEARNING-CATALOG-001 Formal Curriculum Catalog UI COMPLETE_UI_V1
LEARNING-CATALOG-001-A Navigation & Progress Refinement COMPLETE_UI_REFINEMENT_V1
COURSE-PRODUCTION-001 Foundation Batch A Real Lessons PEDAGOGY_REJECTED_RETIRED_REFERENCE
CURRICULUM-005 Beginner Foundation Reframe COMPLETE_REFRAMED_V1
COURSE-PRODUCTION-002 Beginner Batch A Rebuild CONTINUITY_REWORK_REQUIRED_RUNTIME_PAUSED
COURSE-PRODUCTION-002-A Beginner Batch A Experience Restoration COMPLETE_EXPERIENCE_RESTORED_V1
COURSE-UX-QUALITY-001 Beginner Lesson Quality Pass COMPLETE_QUALITY_BASELINE_V1_HUMAN_REVIEW_PASS
COURSE-BUILDER-SKILL-005 Beginner Quality Alignment COMPLETE_V02_QUALITY_ALIGNED
SKILL-GOV-001 Skill Responsibility & Orchestration Baseline COMPLETE_GOVERNANCE_BASELINE_V1
COURSE-GOV-001 Course Production Governance Baseline COMPLETE_GOVERNANCE_BASELINE_V1
FACT-DRIFT-AUDIT-001 Current Fact Drift Audit COMPLETE_DOCS_ALIGNED
COURSE-PRODUCTION-003 Foundation Stage 2 Collaboration Batch TECHNICAL_ACCEPTANCE_PASS_CONTINUITY_REWORK_REQUIRED
DEV-RUNTIME-FIX-001 Windows Dev Startup COMPLETE_DEV_START_FIX
CURRICULUM-CONTINUITY-001 Five-Track Capability Continuity Baseline COMPLETE_BASELINE_V1
FOUNDATION-CONTINUITY-REWORK-001 Stage 1 + Stage 2 Formal Brief / Artifact Thread Rework COMPLETE_BRIEF_READY_CONTINUITY_V1
FOUNDATION-CONTINUITY-TRIAL-001 Course Builder v0.2 Continuity Trial TECHNICAL_PASS_HUMAN_REVIEW_PENDING
FOUNDATION-CONTINUITY-TRIAL-001-A Learner-facing Language & Case Neutralization COMPLETE_REVIEW_PENDING
FOUNDATION-CONTINUITY-TRIAL-001-B Six-Step Content Integrity TECHNICAL_PASS_TARGETED_HUMAN_REVIEW_PENDING
FOUNDATION-CONTINUITY-TRIAL-001-C Six-Step Pedagogy Refinement TECHNICAL_PASS_TARGETED_HUMAN_REVIEW_PENDING
FOUNDATION-CONTINUITY-TRIAL-001-D Step Focus & Review Clarity TECHNICAL_PASS_TARGETED_HUMAN_REVIEW_PENDING
FOUNDATION-CONTINUITY-TRIAL-001-E Numbered Guidance Readability TECHNICAL_PASS_TARGETED_HUMAN_REVIEW_PENDING
COURSE-GOV-SIX-STEP-001 Mandatory Six-step Rule for All New Courses COMPLETE_GOVERNANCE_BASELINE
CURRICULUM-SIX-STEP-PLANNING-001 Core Curriculum Audit Direction COMPLETE_DIRECTION_LOCKED
CURRICULUM-SIX-STEP-AUDIT-001 Five-Track Core Curriculum & Knowledge Point Audit SUPERSEDED_TRACK01_V1
CURRICULUM-SIX-STEP-AUDIT-001-R1 Track 01 28-Candidate Six-step Re-audit COMPLETE_AUDITED_V1_20_LESSONS
CURRICULUM-AUDIT-REALIGN-001-R1 Track 01 20-Lesson Canonical Realignment COMPLETE_REALIGNED_V1
TRACK01-BATCH-A-BRIEF-REVIEW-001 T1-01～T1-05 Human Review Revision COMPLETE_HUMAN_REVIEW_PASS_BRIEF_LEVEL

COURSE-PRODUCTION-TRACK01-A-001 Track 01 Batch A T1-01 Pilot COMPLETE_HUMAN_REVIEW_PASS
COURSE-BUILDER-SKILL-005-A Lesson Output Contract v1 COMPLETE_BASELINE_V1
COURSE-PRODUCTION-TRACK01-A-002 T1-01 Closure & T1-02 Prompt Pilot COMPLETE_T1-02_HUMAN_REVIEW_PASS
COURSE-PRODUCTION-TRACK01-A-003 T1-02 Closure & T1-03 Context Pilot COMPLETE_T1-03_HUMAN_REVIEW_PASS

NEXT: discuss T1-04 Iteration pilot scope before production; T1-01～T1-03 remain not AVAILABLE until separate Runtime Provisioning / Runtime Acceptance.
```

## 当前系统健康

当前业务代码验证基线：FOUNDATION-CONTINUITY-TRIAL-001（typecheck/build PASS，51 pages）。

```text
npm run typecheck     PASS
npm run build         PASS
Production build      51 pages generated
Local npm run dev      DIRECT_NEXT_NODE_ENTRY
Remote migrations     0000 → 0009 APPLIED; 0010–0011 GENERATED / NOT APPLIED
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
Formal Check Runtime   CODE PASS / MIGRATION 0010 PENDING
Three-question mastery PASS / MIGRATIONS 0010–0011 PENDING
Unified Lesson Shell v1 FROZEN / ACCEPTANCE PASS
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

`COURSE-BUILDER-SKILL-002-F` 已把新课程 Step 3 固化为 Three-Question Mastery Sequence：SINGLE_CHOICE → TRUE_FALSE → MULTI_SELECT，一次只显示一题。答错必须展示错误反馈并重新选择，不能跳题；答对后展示正确反馈才出现“下一题”；三题全部答对后 CHECK Gate 才通过。Prompt APPLICATION 已作为真实样板升级。正式 Runtime 复用 `lesson_checks` 多行 + order，不新增题组表。0010 与新增 0011 migration 均只在本地生成，远程 DB 仍为 0009。

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
