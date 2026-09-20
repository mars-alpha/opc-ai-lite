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

NEXT: AI-DAILY-001 — 最小自动采集 → 审核 → 发布
```

## 当前系统健康

业务代码验证基线：`main@1622a79`。

```text
npm run typecheck     PASS
npm run build         PASS
Production build      30 static pages generated
Remote migrations     0000 → 0009 APPLIED
Remote runtime smoke  PASS
ACCESS runtime smoke  PASS
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

公众号关注不等价于 Membership。公开 Reader 不读取会员正文 / Deep Resource URL / Practice-Course 私有关系，会员通过 Access 后才读取完整详情。

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

`AI-DAILY-001` 只做最小内容供给闭环：

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
