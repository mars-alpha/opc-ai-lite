# COURSE-BUILDER-SKILL-001 — OPC Course Builder Skill v0.1

Status: CONTRACT_COMPLETE_RUNTIME_PENDING

## Goal

建立最小受控链路：BUILD / IMPROVE → Structured Output → Code Validation → Human Review。

## Implemented

- `skills/course-builder/v0.1.ts`：版本化 Skill 与严格 JSON 输出边界。
- `lib/learning/course-builder.ts`：BUILD / IMPROVE parser、Lesson Spec 校验、required Check / Practice 对齐、Core Authority field rejection、`PENDING_REVIEW` Review Packet。
- `npm run course-builder:check`：验证 BUILD、IMPROVE、Code Validation、Authority Boundary、Human Review Boundary。
- 无数据库 Schema / Migration；无 Provider 调用；无自动 Publish。

## Authority Boundary

Skill 不得输出或修改 publish / published / status / access / accessTier / entitlement / progress / completion / completionState。Review Packet 的 `PENDING_REVIEW` 由 Core 创建，不接受 Skill 自己声明。

## Not Yet Implemented

真实 Provider、Draft persistence、Admin Review UI、Approved Draft → Production Course write-back、批量课程生成均未实现。

## Next

`COURSE-BUILDER-SKILL-001-A — Real Lesson Draft Acceptance`：用真实课程主题验证 BUILD Draft 的教学质量与 Unified Lesson Shell 适配，再决定下一层 Runtime。
