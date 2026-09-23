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
COURSE-PRODUCTION-TRACK01-A-004 T1-04 Purposeful Iteration Pilot COMPLETE_T1-04_HUMAN_REVIEW_PASS
COURSE-PRODUCTION-TRACK01-A-005 T1-04 Closure & T1-05 Reliability Pilot COMPLETE_T1-05_HUMAN_REVIEW_PASS
TRACK01-PHASE1-RUNTIME-001 T1-01～T1-05 Runtime Provisioning & Acceptance HISTORICAL_BASELINE_SUPERSEDED_BY_001_B
TRACK01-PHASE1-RUNTIME-001-B Lesson Runtime State Flow Consolidation COMPLETE_CORE_IMPLEMENTATION_ACCEPTED
TRACK01-RUNTIME-PERF-002 Critical Path Reduction COMPLETE_BROWSER_ACCEPTANCE_PASS_WITH_INFRA_LIMITATION
FACT-ALIGN-002 Runtime / Access / Course Production Fact Realignment COMPLETE_FACTS_ALIGNED
ACCESS-RESUME-ACCEPTANCE-001 Access + Resume Acceptance COMPLETE_PASS
TRACK01-PHASE2-CURRICULUM-001 Core Learning Path Freeze COMPLETE_FROZEN
TRACK01-PHASE2-T1-06-001 T1-06 Formal Brief COMPLETE_HUMAN_REVIEW_PASS
TRACK01-PHASE2-T1-06-002 T1-06 Course Builder v0.2 Draft Production COMPLETE_DRAFT_HUMAN_REVIEW_PASS
TRACK01-PHASE2-T1-06-003 T1-06 Runtime Provisioning & Acceptance COMPLETE_RUNTIME_ACCEPTANCE_PASS
TRACK01-PHASE2-T1-06-004 T1-06 Content & Step4 Experience Correction COMPLETE_ACCEPTANCE_PASS
TRACK01-PHASE2-T1-07-001 T1-07 Formal Brief COMPLETE_HUMAN_REVIEW_PASS
TRACK01-PHASE2-T1-07-002 T1-07 Course Builder v0.2 Draft Production COMPLETE_DRAFT_HUMAN_REVIEW_PASS
TRACK01-PHASE2-T1-07-003 T1-07 Runtime Provisioning & Acceptance COMPLETE_RUNTIME_ACCEPTANCE_PASS
TRACK01-T1-09-PRODUCTION-001 Knowledge Base / Source of Truth Formal Production COMPLETE_RUNTIME_ACCEPTANCE_PASS_AVAILABLE
TRACK01-T1-10-PRODUCTION-001 Search / RAG Formal Production COMPLETE_RUNTIME_ACCEPTANCE_PASS_AVAILABLE
COURSE-BUILDER-SKILL-V1-WORKFLOW-001 Stable Course Production Workflow COMPLETE_ARCHITECTURE_ACCEPTANCE_PASS
TRACK01-T11-T20-WORKFLOW-BATCH-001 T1-11～T1-20 Workflow Batch Draft Generation DETERMINISTIC_PASS
TRACK01-T11-T20-HUMAN-REVIEW-001 T1-11～T1-20 Batch Human Review COMPLETE_HUMAN_REVIEW_PASS
TRACK01-T11-T20-RUNTIME-001 T1-11～T1-20 Batch Runtime Provisioning & Acceptance COMPLETE_RUNTIME_ACCEPTANCE_PASS_AVAILABLE
TRACK01-T11-T20-LEARNING-EXPERIENCE-REWORK-001 T1-11～T1-20 Post-runtime Learning Experience Rework COMPLETE_QUALITY_REWORK_RUNTIME_ACCEPTANCE_PASS

CURRENT: foundation-ai T1-01～T1-20 已全部进入正式 Runtime。T1-11～T1-20 已完成 Course Production Workflow、10/10 Human Review、Runtime Provisioning / Acceptance，并在真实体验后完成 Learning Experience Rework：中文优先、Copy-ready Step 4、按知识密度组织的 Step 5、独立现实触发 Step 6 均已进入确定性校验；修改后 10/10 Runtime Acceptance 再次 PASS。全批继续沿用现有 Unified Lesson Shell，没有新增 UI / Renderer / interaction type，也没有调整 CSS；未展开知识继续由 Deferred Knowledge Ledger 作为 Track 02～05 规划输入。
```

## 当前系统健康

当前业务代码验证基线：Phase 1 foundation-ai Runtime（latest local typecheck/build PASS；focused Runtime Acceptance PASS）。

```text
npm run typecheck     PASS
npm run build         PASS
Production build      PASS（page count 不作为当前验收事实）
Local npm run dev      DIRECT_NEXT_NODE_ENTRY
DB migrations         historical remote-smoke 0000→0009; 0010–0013 exist/use in later Runtime work; each release target must verify its own migration journal
Remote runtime smoke  PASS
ACCESS runtime smoke  PASS
ACCESS UX render      PASS
Access + Resume accept PASS
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
Formal Check Runtime   SERVER-AUTHORITATIVE / FOCUSED ACCEPTANCE PASS
Three-question mastery SERVER STATE PASS / 001-B CONSOLIDATED
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

当前 Access 详细矩阵以 `docs/CURRENT_SYSTEM_FACTS.md` 为唯一事实源。本文件只保留阶段摘要：匿名用户不能进入正式课程 Runtime；FOLLOWER 与 MEMBER 权限保持分层。

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

## 当前工程治理补充

Runtime / Access / Resume 的实现事实统一记录在 `docs/CURRENT_SYSTEM_FACTS.md`；本文件不再复制状态模型正文。

## 下一步边界

Track 01 的 T1-01～T1-20 已完成正式生产与 Runtime Acceptance，并全部进入 AVAILABLE。课程生产基线现已提升为全板块通用 Workflow：全局 Rule Sources 只保存跨板块长期规则；每次运行必须解析当前 Track / 板块 Catalog、上一课→本课→下一课连续性、Formal Brief、Deferred Knowledge Boundary 与必要 Grounding，并通过 `courseContextReady` 后才能进入 Course Builder。Track 02～05 按各自能力目标重新做 Six-step Knowledge Point Gate；Deferred 条目不自动升级为课程。现有 Unified Lesson Shell 继续作为冻结前端边界，后续课程内容任务不新增 UI、不调整 CSS。

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

\n