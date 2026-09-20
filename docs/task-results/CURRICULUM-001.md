# CURRICULUM-001 — Formal Curriculum Definition

Status: COMPLETE_DEFINED_V1

## Goal

在 Unified Lesson Shell v1 冻结后，正式定义 OPC 第一版课程地图，结束“测试课程 / 旧目录 / acceptance fixture 混在一起”的状态。

## Result

新增 `docs/learning/FORMAL_CURRICULUM_V1.md`。

Formal Learning Path v1：

```text
Stage 1 AI 基础认知
→ Stage 2 AI 工作应用
→ Stage 3 AI Workflow
→ Stage 4 AI 业务增长与运营
→ Stage 5 FDE / AI 解决方案落地
```

Stage 1 固定覆盖：
Generative AI / Prompt / Context+Token / Memory+RAG / Model+API+Tool / MCP / Skill / Agent / Multimodal。

Stage 2 固定进入研究、文件、数据和真实 Practice。

Stage 3 固定进入任务拆解、Context Engineering、Code/Skill/Tool/Agent 分工、Human-in-the-loop、Evaluation 和 Workflow Project。

Stage 4 / 5 在 v1 中确定长期模块边界，但不在本任务批量写课。

## De-duplication decisions

- Prompt + task-brief 合并为一个正式 Prompt APPLICATION。
- 基础 Context/Token 与后续 Context Engineering 分层，不重复定义。
- 旧 API/Tool/MCP/Agent 大课拆开，避免一节塞太多概念。
- Skill 独立保留。
- Agent 在 Tool/MCP/Skill 后学习。
- 平台/产品-specific 内容降为易变选修层，不作为长期课程骨架。

## First Production Batch

1. 什么是生成式 AI
2. Prompt：怎样把任务说清楚
3. Context 与 Token
4. Memory 与 RAG
5. Model、API 与 Tool

不在本任务直接生成完整内容。

## Boundary

- `lib/courses.ts` 仍是 static/fallback；
- acceptance fixtures 仍不是正式课程 Source of Truth；
- 无 DB / migration / provider / publish 副作用；
- 无 UI / Shell 修改；
- PROJECT Deliverable Runtime 仍未完成。

## Next

`CURRICULUM-002 — First Production Batch Planning`
