# TRACK01-T11-T20-WORKFLOW-BATCH-001 — T1-11～T1-20 Workflow Batch Generation

Status: **DETERMINISTIC_PASS / HUMAN_REVIEW_PENDING**

## Goal

使用 Stable Course Production Workflow 一次性生成 T1-11～T1-20，而不是逐节手工重复课程生产步骤。

## Workflow run

本次一次性执行：

```text
LOAD_CURRENT_RULE_SOURCES
→ PREPARE_GROUNDING
→ PREPARE_FORMAL_BRIEF
→ RUN_COURSE_BUILDER
→ RUN_DETERMINISTIC_VALIDATORS
→ HUMAN_REVIEW_GATE
```

到 Human Review Gate 停止，不进入 LessonSpec Registry / Runtime。

## Generated drafts

Course Builder Skill: `course-builder@1.0.0`

Generated:
- T1-11 应用程序编程接口（API）
- T1-12 结构化输出（Structured Output）与模式（Schema）
- T1-13 函数调用（Function Calling）与工具使用（Tool Use）
- T1-14 模型上下文协议（MCP）
- T1-15 技能（Skill）
- T1-16 工作流（Workflow）与自动化（Automation）
- T1-17 智能体（Agent）
- T1-18 多模态（Multimodal）
- T1-19 编码（Coding）/ 浏览器（Browser）/ 计算机操作（Computer Use）
- T1-20 隐私（Privacy）/ 权限（Permissions）/ 人在回路（Human-in-the-loop）

Structured source:
`fixtures/course-builder/track01-t111-t120.ts`

Each draft includes:
- LessonSpec
- EXPLAIN / EXAMPLE / CHECK / PRACTICE / REVIEW / CAPABILITY
- 3-question Mastery Sequence
- Step 4 Practice
- Reference Answer
- Review
- Self Assessment
- Intro / Knowledge Depth presentation data

## Frontend boundary

本 Batch 未新增：
- UI
- CSS
- Renderer
- lesson-specific component
- interaction type

继续使用现有 Unified Lesson Shell 表达所有课程内容。

## Deferred knowledge

实际生成 10 节 Draft 时确认：部分工程知识如果强行进入 Track 01，会破坏 Beginner 主问题与六步闭环。

这些内容已更新到：
`docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md`

包括 API integration、Schema engineering、Tool reliability、MCP implementation、Skill lifecycle、Workflow orchestration、Agent engineering、Multimodal pipeline、Browser / Computer Use automation、企业权限与安全治理。

Ledger 已属于 Workflow Required Rule Sources，后续 Track 02～05 规划时继续读取最新版本。

## Validation

- TRACK01_T11_T20_WORKFLOW_BATCH_DRAFTS=PASS
- TRACK01_T11_T20_COURSE_BUILDER_V1=PASS
- TRACK01_T11_T20_SIX_STEP_DRAFTS=PASS
- TRACK01_T11_T20_DETERMINISTIC_VALIDATION=PASS
- TRACK01_T11_T20_HUMAN_REVIEW_PENDING=PASS
- TRACK01_T11_T20_WORKFLOW_RULES_LOADED=PASS
- TRACK01_T11_T20_WORKFLOW_BATCH_GENERATION=PASS
- TRACK01_T11_T20_WORKFLOW_STOPPED_AT_HUMAN_REVIEW=PASS

## Next gate

**T1-11～T1-20 Human Review**

Human Review 可以按 Phase 4 / 5 / 6 分组进行，但不需要重新生成 Draft。只有 Human Review PASS 的课程才继续进入 LessonSpec Registry / Runtime。
