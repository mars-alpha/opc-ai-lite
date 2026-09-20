# CURRICULUM-001 — Formal Curriculum Definition

Status: COMPLETE_DEFINED_V1_MAINLINE_LOCKED

## Goal

在 Unified Lesson Shell v1 冻结后，正式定义 OPC 第一版课程地图，结束“测试课程 / 旧目录 / acceptance fixture 混在一起”的状态。

## Result

新增 `docs/learning/FORMAL_CURRICULUM_V1.md`。

Formal Learning Path v1 已锁定为：

```text
01 AI 基础认知
→ 02 AI 工作应用
→ 03 AI 推广运营与业务增长
→ 04 AI Workflow 与自动化
→ 05 FDE / AI 解决方案落地
```

AI 基础认知内部固定采用 7 个学习阶段：认识 AI、模型工作方式、AI 沟通、记忆与知识、外部能力连接、复用与执行方式、现代 AI 能力与边界。

完整 Curriculum 与 Production Batch 明确分离：3–5 节只代表一次内容生产批次，不代表完整基础课只有 3–5 节。

## De-duplication decisions

- Prompt + task-brief 合并为一个正式 Prompt APPLICATION。
- 基础 Context/Token 与后续 Context Engineering 分层，不重复定义。
- 旧 API/Tool/MCP/Agent 大课拆开，避免一节塞太多概念。
- Skill 独立保留。
- Agent 在 Tool/MCP/Skill 后学习。
- 平台/产品-specific 内容降为易变选修层，不作为长期课程骨架。
- 每个核心概念只有一个 Primary Knowledge Home；后续课程只应用、深化或工程化，不重新从定义开始教学。

## Production sequencing

先完整设计基础知识地图与 Lesson Brief，再按 3–5 节一个 Production Batch 分批制作。第一批课程数量不是课程范围定义。

## Boundary

- `lib/courses.ts` 仍是 static/fallback；
- acceptance fixtures 仍不是正式课程 Source of Truth；
- 无 DB / migration / provider / publish 副作用；
- 无 UI / Shell 修改；
- PROJECT Deliverable Runtime 仍未完成。

## Next

`CURRICULUM-002 — Foundation Knowledge Map & Lesson Briefs`
