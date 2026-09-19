# PROJECT_STATUS.md

> 只记录当前阶段与当前健康状态。完整实现事实见 `docs/CURRENT_SYSTEM_FACTS.md`；历史过程见 `docs/task-results/*`。

## 当前阶段

```text
MVP-001 ～ MVP-010                         COMPLETE
MVP-011-A Content Operations Console      COMPLETE
MVP-011-B Content → Knowledge Routing     COMPLETE
MVP-011-C1 Knowledge → Latest Practice    COMPLETE
MVP-011-C2 Multi-source Course Candidate  CODE COMPLETE*

NEXT: MVP-011-D — Knowledge Asset Model audit
```

`*` C2 的 `drizzle/0006_square_sharon_carter.sql` 已生成并提交，但远程数据库尚未执行，因此远程真实 C2 DB Runtime 尚未验证。

## 当前系统健康

全仓事实审计来源基线：`main@5ea3981`。

```text
Git tracked files    176
Text files           169
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
Practice Read / Submit / RULE Evaluation
Feedback / Event → Course Insight → Candidate → Human Review
```

## 当前仍未完成

```text
remote DB migration 0006
真实 AI Provider Runtime
AI Daily 自动采集 / AI 初筛 / 自动摘要
Feishu Deep Resource bridge
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

`MVP-011-D — Knowledge Asset Model` 先做只读审计和最小模型判断：

- 优先复用现有 Content / Knowledge / Practice / Course Candidate；
- 先确认缺什么关系，再决定是否改 Schema；
- 不在同一任务顺手建设 Feishu、Obsidian、Skill、Media Factory；
- 若发现当前系统运行阻塞，先修运行，再继续功能；
- 远程 0006 migration 是 C2 Runtime 前置条件，不自动执行。

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
