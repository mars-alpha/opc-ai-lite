# PROJECT_STATUS.md

> 只记录当前阶段与当前健康状态。完整实现事实见 `docs/CURRENT_SYSTEM_FACTS.md`；历史任务摘要见 `TASKS.md`。`docs/task-results/*` 不作为 current state source。

## 当前阶段

```text
MVP Core / Content-Knowledge Pipeline     COMPLETE / AI_PROVIDER_PENDING_WHERE_REQUIRED
Formal Runtime + Access                  COMPLETE
Unified Lesson Shell v1                  FROZEN / ACCEPTANCE PASS
Course Production Workflow               STABLE / GOVERNANCE CHECK PASS / CURRENT SKILL VIA REGISTRY
Track 01 Formal Curriculum               T1-01～T1-20 AVAILABLE / FORMAL_RUNTIME
Track 02 Directory                       T2-01～T2-15 DIRECTORY_APPROVED_V1 / 15 KEEP
Track 02 Batch A                         T2-01～T2-03 AVAILABLE / FORMAL_RUNTIME
Track 02 Batch B                         T2-04～T2-06 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE PASS
Track 02 Batch C                         T2-07～T2-09 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE PASS
Track 02 Batch D                         T2-10～T2-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE PASS
Track 03 Directory                       T3-01～T3-15 DIRECTORY_APPROVED_V1 / 15 KEEP
Track 03 Formal Curriculum               T3-01～T3-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE PASS
Track 04 Directory                       T4-01～T4-15 DIRECTORY_APPROVED_V1 / 15 KEEP
Track 04 Formal Curriculum               T4-01～T4-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE PASS
Track 04 Runtime                         15 LESSONS PROVISIONED / ACCEPTANCE PASS
Track 04 Learning Map                    15 LESSON DIRECTORY / ALL AVAILABLE
Track 05 Directory                       T5-01～T5-16 / 6 PHASES / 15 KNOWLEDGE HOMES + 1 CAPSTONE
Track 05 Formal Curriculum               T5-01～T5-16 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE PASS
Track 05 Runtime                          6 MODULES / 16 LESSONS / 48 CHECKS / 16 PRACTICES / ACCEPTANCE PASS
Track 05 Learning Map                     16 LESSON DIRECTORY / ALL AVAILABLE
RUNTIME-INFRA-PERF-003                    PROPOSED / NOT_STARTED
CURRENT                                  LEARNING PATH FROZEN / ENTRYPOINTS ITERATING / RELEASE CANDIDATE
```

## 当前系统健康

```text
Next.js App Router                       ACTIVE
PostgreSQL + Drizzle                     ACTIVE
Formal Lesson Runtime                    PASS
Track 01 20 Lesson Runtime mappings      PASS
Unified Lesson Shell v1                  FROZEN / PASS
Check / Practice server authority        PASS
Completion / Rating / Resume             PASS
Course Production Workflow               PASS / ANTI-DRIFT GOVERNANCE PASS
Script entrypoint governance             PASS / CURRENT ENTRIES ONLY
Current Course Builder Skill registry    PASS
Course six-step content responsibility   FROZEN / EXPERIENCE_REVIEW_PASS
Track 02 current owners / context         PASS
Track 02 Learning Map / Access           FROZEN / IMPLEMENTATION PASS
Track 02 Batch A Runtime                 PROVISIONED / ACCEPTANCE PASS
Track 02 Batch B Runtime                 PROVISIONED / ACCEPTANCE PASS
Track 02 Batch C Runtime                 PROVISIONED / ACCEPTANCE PASS
Track 02 Batch D Runtime                 PROVISIONED / ACCEPTANCE PASS
Track 03 Runtime                         15 LESSONS PROVISIONED / ACCEPTANCE PASS
Track 03 Learning Map                    15 LESSON DIRECTORY / ALL AVAILABLE
Track 05 Runtime                         6 MODULES / 16 LESSONS PROVISIONED / ACCEPTANCE PASS
Track 05 Learning Map                    16 LESSONS / 6 PHASES / ALL AVAILABLE
Membership / Follow benefit model        FROZEN / CURRENT
Frontend information architecture        FROZEN / CURRENT
Frontend UI/CSS freeze for course work   ACTIVE
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
Subscription / Order / Payment / WeChat Pay
微信真实 OAuth / Official Account webhook
RUNTIME-INFRA-PERF-003
```

## 当前工程治理

- Runtime / Access / Resume 的实现事实统一记录在 `docs/CURRENT_SYSTEM_FACTS.md`。
- 课程生产只从 `COURSE_BUILD_START_HERE.md` → current Rule Sources → current Track Context → current Formal Brief 进入。
- Track 切换只替换 Context，不复制 Workflow、不新建 Track-specific Course Builder Skill。
- 历史 task-result、旧 Foundation F-ID、旧 Skill 版本与旧 Pending 状态不得用于恢复 current state。
- 普通课程内容任务不得新增 UI、Renderer 或调整 CSS。

## 下一步

Track 03 与 Track 04 已全部正式上线。Track 05 目录已批准，Batch A T5-01～T5-03 已正式上线并完成 Runtime Acceptance；下一步按已批准生产批次进入 Batch B T5-04～T5-06 Formal Brief。

AI Daily 等后续产品能力继续遵循：

```text
系统可运行
→ 真实 Runtime
→ 用户 Access 正确
→ 内容供给可持续
→ 真实 MVP 可验收
→ 再增加功能
```

Learning Path Baseline                    TRACK01～05 FROZEN / NO STRUCTURE OR COURSE COPY CHANGES
Current Product Focus                     HOME / AI DAILY / PRACTICE / OFFICIAL ACCOUNT / MEMBERSHIP
Release Target                            opcai.fun via 1.14.180.16 / Nginx / PM2 / Next.js:3000
