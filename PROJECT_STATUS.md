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

NEXT: discuss / audit MVP-011-F — Knowledge → Practice AI Draft Workflow
```

`*` C2 的 `drizzle/0006_square_sharon_carter.sql` 已生成并提交，但远程数据库尚未执行，因此远程真实 C2 DB Runtime 尚未验证。

`**` D 的 `drizzle/0007_pink_spirit.sql` 已生成并包含旧 Primary Source backfill；远程数据库同样尚未执行，因此 D 的远程真实 DB Runtime 尚未验证。

`***` E 的 `drizzle/0008_overrated_triton.sql` 已生成；远程数据库尚未执行，因此 E 的远程真实 DB Runtime 尚未验证。

## 当前系统健康

全仓事实审计来源基线：`main@5ea3981`。

```text
Git tracked files    190
Text files           183
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
Practice Read / Submit / RULE Evaluation
Feedback / Event → Course Insight → Candidate → Human Review
```

## 当前仍未完成

```text
remote DB migration 0006 / 0007 / 0008
真实 AI Provider Runtime
AI Daily 自动采集 / AI 初筛 / 自动摘要
Feishu Deep Resource user access / real Feishu API sync
Obsidian export
正式 Skill 资产
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

下一步只讨论 / 审计 `MVP-011-F — Knowledge → Practice AI Draft Workflow`。远程 0006 / 0007 / 0008 migration 在真实 Runtime 前仍需明确执行。

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