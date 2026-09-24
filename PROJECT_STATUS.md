# PROJECT_STATUS.md

> 只记录当前阶段与当前健康状态。完整实现事实见 `docs/CURRENT_SYSTEM_FACTS.md`；历史任务摘要见 `TASKS.md`。`docs/task-results/*` 不作为 current state source。

## 当前阶段

```text
MVP Core / Content-Knowledge Pipeline     COMPLETE / AI_PROVIDER_PENDING_WHERE_REQUIRED
Formal Runtime + Access                  COMPLETE
Unified Lesson Shell v1                  FROZEN / ACCEPTANCE PASS
Course Production Workflow               STABLE / CURRENT SKILL VIA REGISTRY
Track 01 Formal Curriculum               T1-01～T1-20 AVAILABLE / FORMAL_RUNTIME
Track 02 Directory                       T2-01～T2-15 DIRECTORY_APPROVED_V1 / 15 KEEP
Track 02 Batch A                         T2-01～T2-03 BRIEF_READY_V1 / COURSE_BUILDER_PENDING
RUNTIME-INFRA-PERF-003                    PROPOSED / NOT_STARTED
CURRENT                                  T2-01～T2-03 ready for universal Course Production Workflow
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
Course Production Workflow               PASS
Current Course Builder Skill registry    PASS
Track 02 current owners / context         PASS
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

T2-01～T2-03 已完成 Formal Brief，可直接进入：

```text
Course Production Workflow
→ Current Course Builder Skill
→ Deterministic Validators
→ Human Review Gate
```

生产范围继续锁定 T2-01～T2-03，不扩大到 T2-04～T2-15。

AI Daily 等后续产品能力继续遵循：

```text
系统可运行
→ 真实 Runtime
→ 用户 Access 正确
→ 内容供给可持续
→ 真实 MVP 可验收
→ 再增加功能
```