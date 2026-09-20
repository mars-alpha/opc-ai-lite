# CURRICULUM-002 — Foundation Knowledge Map & Lesson Briefs

Status: COMPLETE_DEFINED_V1

## Result

新增 `docs/learning/FOUNDATION_KNOWLEDGE_MAP_V1.md`。

Track 01 / AI 基础认知现已从 7 个高层学习阶段展开为 **28 个 Lesson Brief**。

固定原则：
- 每个核心概念只有一个 Primary Knowledge Home；
- 后续课程只应用 / 深化 / 工程化，不重新定义；
- 基础课讲清概念、关系、判断和边界；
- SDK / MCP Server / Agent Runtime / Vector DB tuning 等进入 Technical Track；
- Curriculum 完整范围与 Production Batch 分离。

## Foundation distribution

- Stage 1 认识 AI：4 lessons
- Stage 2 模型怎么工作：4 lessons
- Stage 3 与 AI 沟通：4 lessons
- Stage 4 Memory / Knowledge / RAG：4 lessons
- Stage 5 API / Tool / MCP：4 lessons
- Stage 6 Skill / Workflow / Automation / Agent / HITL：6 lessons
- Stage 7 Multimodal / modern capability / safety / evaluation：6 lessons

Total: **28**

## Asset migration

- prompt-foundations → REUSE + FORMALIZE → F3-01
- skill-foundations → REUSE + FORMALIZE → F6-01
- task-brief → MERGE into F3-01
- context-token → SPLIT
- memory-rag → SPLIT
- api-agent → RETIRE AS SINGLE FORMAL LESSON / SPLIT
- work/practice/workflow fixtures remain outside Foundation where appropriate

## Production

Recommended first production batch is Batch A:
F1-01 → F1-04.

The existing Prompt sample remains the most mature Human Review reference but does not change curriculum order.

## Next

`CURRICULUM-003 — Foundation Batch A Brief Finalization`
