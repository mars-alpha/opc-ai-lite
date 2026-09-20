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

NEXT: ACCESS-001 — AI Daily / Knowledge / Practice Access Policy
```

F 的 RULE Runtime 已在远程数据库验证；当前只剩真实 AI Provider 未配置，不能把 RULE Draft 写成 AI Runtime 已验证。

## 当前系统健康

业务代码验证基线：`main@c007b05`。

```text
Git tracked files    202
Text files           195
Binary assets        7
npm run typecheck    PASS
npm run build        PASS
Production build     31 pages/routes
Remote migrations    0000 → 0009 APPLIED
Remote runtime smoke PASS
Test data cleanup    PASS
```

正式 Runtime：Next.js App Router + PostgreSQL + Drizzle。根目录静态 HTML/CSS/JS 是 legacy prototype。

## 当前已完成真实闭环

```text
Auth / Session
Learning State / Enrollment / Progress
Lesson Access / Entitlement / Membership foundation
Admin Course edit / publish
Content admin / publish
Content → Knowledge
Knowledge ↔ PRIMARY / SUPPORTING Content Sources
Knowledge → Latest Practice
Knowledge → Course Update Candidate
Knowledge → Feishu Deep Resource
Knowledge → Practice Draft → Human Review → Latest Practice DRAFT
Knowledge → Course Impact Analysis → Human Confirm → Course Candidate
Practice Read / Submit / RULE Evaluation
Feedback / Event → Course Insight → Candidate → Human Review
```

RUNTIME-001 已真实验证远程数据库上的 0006 / 0007 / 0008 / 0009 与对应业务链路。

## 当前仍未完成

```text
真实 AI Provider Runtime
AI Daily 自动采集 / AI 初筛 / 自动摘要
统一新 Access Policy
Feishu Deep Resource 用户侧访问 / Feishu API sync
Obsidian export
Skill v0.1 真实 AI 数据迭代
Subscription / Order / Payment / WeChat Pay
微信真实 OAuth / Official Account webhook
```

## 已批准但尚未实现的 Access 方向

```text
AI Daily Top3                  FREE
AI Daily 全部                  关注公众号解锁；会员也可访问
Knowledge 正文                 MEMBER
Feishu Deep Resource           MEMBER
Latest Practice 卡片           PUBLIC VISIBLE
Latest Practice 正式详情/实操  MEMBER
由进阶内容进入的正式课程        MEMBER
```

公众号关注不等价于 Membership。下一阶段必须复用现有 Membership / Entitlement / Practice Access 基础，统一接入 Access Resolver，不能在页面中散落权限判断。

## 下一步边界

`ACCESS-001` 只做用户侧真实权限闭环，不扩支付、不做微信 OAuth、不做 AI Daily 自动采集、不做 Obsidian / Media / Feishu 自动同步。

```text
系统可运行
→ 真实 Runtime
→ 用户 Access 正确
→ 真实 MVP 可验收
→ 再增加功能
```
