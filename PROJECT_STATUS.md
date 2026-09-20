# PROJECT_STATUS.md

> 只记录当前阶段与当前健康状态。完整实现事实见 `docs/CURRENT_SYSTEM_FACTS.md`；历史过程见 `docs/task-results/*`。

## 当前阶段

```text
MVP-001 ～ MVP-010                         COMPLETE
MVP-011-A Content Operations Console      COMPLETE
MVP-011-B Content → Knowledge Routing     COMPLETE
MVP-011-C1 Knowledge → Latest Practice    COMPLETE
MVP-011-C2 Multi-source Course Candidate  CODE COMPLETE*
MVP-011-D Knowledge Provenance Foundation  CODE COMPLETE**
MVP-011-E Deep Resource / Feishu Bridge     CODE COMPLETE***
MVP-011-F Knowledge → Practice AI Draft     CODE COMPLETE****
MVP-011-G Knowledge → Course Impact Analysis CODE COMPLETE

NEXT: re-audit product priority before next implementation task
```

`*` C2 的 `drizzle/0006_square_sharon_carter.sql` 已生成并提交，但远程数据库尚未执行，因此远程真实 C2 DB Runtime 尚未验证。

`**` D 的 `drizzle/0007_pink_spirit.sql` 已生成并包含旧 Primary Source backfill；远程数据库同样尚未执行，因此 D 的远程真实 DB Runtime 尚未验证。

`***` E 的 `drizzle/0008_overrated_triton.sql` 已生成；远程数据库尚未执行，因此 E 的远程真实 DB Runtime 尚未验证。

`****` F 的 `drizzle/0009_chief_marvex.sql` 已生成；远程数据库尚未执行。当前 AI Provider 也未配置，因此只验证了 RULE Draft 路径，没有真实 AI Draft Runtime 证据。

## 当前系统健康

当前验证基线：`main@5575934`。

```text
Git tracked files    201
Text files           194
Binary assets        7
npm run typecheck    PASS
npm run build        PASS
Production build     31 pages/routes
```

当前正式 Runtime：Next.js App Router + PostgreSQL + Drizzle。根目录静态 HTML/CSS/JS 是 legacy prototype，不是正式应用。

## 当前已完成闭环

```text
Auth / Session
Learning State / Enrollment / Progress
Lesson Access / Entitlement / Membership foundation
Admin Course edit / publish
Content admin / publish
Content → Knowledge
Knowledge → Latest Practice
Knowledge → Course Update Candidate
Knowledge ↔ multiple Content Sources (PRIMARY / SUPPORTING)
Knowledge → Feishu Deep Resource (Admin bridge)
Knowledge → Practice Draft → Human Review → Latest Practice DRAFT
Knowledge → Course Impact Analysis → Human Confirm → Course Candidate
Practice Read / Submit / RULE Evaluation
Feedback / Event → Course Insight → Candidate → Human Review
```

## 当前仍未完成

```text
remote DB migration 0006 / 0007 / 0008 / 0009
真实 AI Provider Runtime
AI Daily 自动采集 / AI 初筛 / 自动摘要
Feishu Deep Resource user access / real Feishu API sync
Obsidian export
真实 AI Practice Draft Runtime / Skill v0.1 quality validation
新 AI Daily / Knowledge / Practice 权限策略接入
Subscription / Order / Payment / WeChat Pay
微信真实 OAuth / Official Account webhook
```

## 已批准但尚未实现的权限方向

```text
AI Daily Top3                  FREE
AI Daily 全部                  关注公众号解锁；会员也可访问
Knowledge 正文                 MEMBER
Feishu Deep Resource           MEMBER
Latest Practice 卡片           PUBLIC VISIBLE
Latest Practice 正式详情/实操  MEMBER
由进阶内容进入的正式课程        MEMBER
```

公众号关注不等价于 Membership。当前代码仍主要用公众号关注 Entitlement 解锁 Stage 1 指定章节；新规则必须后续统一接入 Access Resolver 后才算实现。

## 当前产品 / 架构主线

```text
External Signal
→ AI Assist / Human Review
→ Reviewed OPC Knowledge
→ Feishu / Practice / Course Candidate / Obsidian / Skill / Media Asset
→ Published Experience
```

Knowledge 保持核心知识资产。Feishu、Obsidian、Skill、Media Asset 都不能成为平行 Production Source of Truth。

## 下一步边界

`MVP-011-D — Knowledge Provenance Foundation` 已按最小范围完成：

- `knowledge_items.sourceContentId` 保留为 Primary Source 快捷字段；
- 新增 `knowledge_source_links` 支持 PRIMARY / SUPPORTING；
- Content → Knowledge 与 Supporting Content 查询保持幂等；
- Admin 可查看来源并补充 Supporting Content；
- 没有提前建设 Feishu、Obsidian、Skill、Media Factory。

`MVP-011-E — Deep Resource / Feishu Bridge` 已按最小范围完成：

- 新增 Knowledge-owned `knowledge_deep_resources`，不复用强制 Lesson ownership 的 `lesson_resources`；
- Knowledge 必填，Lesson / Practice 可选；
- 只保存 FEISHU URL / ref / title / summary / status；
- Admin 可创建、查看、更新；
- Published Deep Resource 要求 Knowledge 先 PUBLISHED；
- 没有接 Feishu API / OAuth / Bot / 自动同步，也没有接用户侧 Membership Access。

`MVP-011-F — Knowledge → Practice AI Draft Workflow` 已按最小范围完成：

- 新增独立 `practice_drafts` 审核层，不把候选混入正式 `practices`；
- Published / active Knowledge 才能生成 Draft；可选引用 Published Deep Resource；
- Provider 可用时调用 Practice Draft Skill v0.1；Provider 缺失/失败时明确退回 RULE Draft 并记录原因；
- 支持人工修改、APPROVED / NEEDS_REVISION / DISMISSED；
- APPROVED 只创建正式 `LATEST_PRACTICE` DRAFT；
- 已有正式 Latest Practice 时拒绝覆盖；
- 首个版本化 Skill 已落盘到 `skills/practice-draft/v0.1.ts`。

`MVP-011-G — Knowledge → Course Impact Analysis` 已按最小范围完成：

- 没有新增 Analysis 表或 migration；
- 只分析 Published Lesson catalog，并返回临时建议；
- Provider 可用时调用 AI；当前环境未配置 Provider，因此验证的是 conservative RULE 路径；
- RULE 只有在 Knowledge 已有 lessonId / stageId 关联时才建议 Lesson，否则返回空；
- 管理员必须点击采用、人工确认 lessonId / disposition / proposal 后，才复用现有 Candidate API 落库；
- Candidate 仍进入 PENDING_REVIEW，AI/RULE 不会自动批准，也不会修改 Lesson。

下一步先重新审计产品主线优先级，不自动进入新功能。远程 0006-0009 migration 仍需在真实 Runtime 前明确执行。

## 固定开发流程

以后所有任务遵守 `AGENTS.md`：

```text
读取当前事实 + 对应代码
→ 最小范围实现
→ typecheck / build / 必要 runtime
→ 同步 CURRENT_SYSTEM_FACTS / PROJECT_STATUS / TASKS
→ diff review
→ atomic commit
→ git status clean
→ 重新读取当前事实后再讨论下一阶段
```