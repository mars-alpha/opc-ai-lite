# DB-RUNTIME-001 — Supabase Migration / Seed / Learning API Smoke

## Goal

把 MVP-002 / MVP-003 从“代码边界完成”推进到真实 PostgreSQL 运行验证。

## Database cleanup

用户已确认 Supabase 为开发数据库，并授权清理旧空 OPC Schema。

清理前已确认旧表均为 0 行，因此不存在业务数据迁移问题。

旧结构由用户在 Supabase SQL Editor 清理后，本任务重新从当前 Migration 建库。

## Migration

```text
npm run db:migrate
PASS
```

当前 Drizzle Migration 已成功应用到 Supabase PostgreSQL。

## Seed

首次执行 Seed 暴露 `server-only` 只适用于 Next runtime、不能被 `tsx` CLI 直接解析的问题。

最小修复：
- 从 `lib/server/db/index.ts` 移除运行时 `server-only` import
- 文件仍保持在 `lib/server/` 边界
- 未改变数据库逻辑

随后：

```text
npm run db:seed
PASS
```

Seed 结果：

```text
Stages   3
Modules  6
Lessons  12
```

## Real API smoke

在本地 Next.js 运行时对真实 Supabase 执行：

1. `GET /api/learning/state`
   - 初始：无 Enrollment / Progress

2. `POST /api/learning/enroll`
   - courseSlug: `ai-literacy`
   - PASS

3. `PUT /api/learning/progress`
   - lessonSlug: `what-is-genai`
   - completed: true
   - PASS

4. 再次 `GET /api/learning/state`
   - 可读回 `ai-literacy` Enrollment
   - 可读回 `what-is-genai` completed

5. 恢复测试状态
   - completed: false
   - PASS

6. 最终 `GET`
   - Enrollment 保留
   - completed 清空

说明真实的 CourseEnrollment 与 LessonProgress 已经跨请求持久化。

## Result

当前学习状态链路已达到：

```text
UI
→ Learning API
→ Server Learning Service
→ Drizzle ORM
→ Supabase PostgreSQL
```

不再只是 localStorage 原型。

localStorage fallback 继续保留作为数据库/API 异常时的开发体验回退。

## Next

MVP-004 — User / Auth 最小闭环。

重点用真实 Session User 替换 Demo User，并完成：

```text
加入学习（注册）
→ 创建 User / Session
→ CourseEnrollment
→ Continue Learning
→ LessonProgress
```

