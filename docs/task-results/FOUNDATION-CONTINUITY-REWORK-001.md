# FOUNDATION-CONTINUITY-REWORK-001 — Stage 1 + Stage 2 Formal Brief / Artifact Thread Rework

Status: **COMPLETE_BRIEF_READY_CONTINUITY_V1**

## Result

新增 `docs/learning/FOUNDATION_STAGE1_STAGE2_CONTINUITY_BRIEFS_V1.md`，将 F1-01～F2-04 重构为一条连续能力 / Artifact 链。

Canonical lesson IDs 全部保留。

默认 Case Thread：
OPC / 自媒体的一篇 AI 主题内容，从真实想法 → First Draft → Result Comparison → Verification Flags → Source Plan → Clear Task Brief → Context Pack → Iterated Draft → Verification Record → Verified Publishable Draft。

## Key Decisions

- Stage 1 = 第一次把 AI 真正用起来 + 最低必要世界观；
- Stage 2 = 把同一个结果做到可用；
- F1-02 保留独立，但只做最小输入变化实验，不提前教授 Prompt；
- F1-03 保留独立，只负责发现“不能直接信”的位置，不教授完整检查流程；
- F1-04 保留独立，但产品能力地图必须服务当前 Artifact，不做术语百科；
- F2-01 不再重复证明输入质量，正式收束 Prompt；
- F2-02 重点从“AI 不知道你脑里的东西”转为构建 Context Pack；
- F2-03 必须直接修改 F2-02 Artifact；
- F2-04 不再重新解释 AI 会错，而是完成发布前最小核实。

## Course Builder Decision

本任务不修改 Skill。

下一步先做 `FOUNDATION-CONTINUITY-TRIAL-001`，使用 course-builder@0.2.0 重做 3–5 个代表 Lesson，验证 Formal Brief 是否已经足以保持 Continuity。

只有真实样本仍出现系统性重复 / Artifact 断裂 / Case Thread 断裂 / doNotReteach 失守，才启动 COURSE-BUILDER-SKILL-006 / v0.3。

## Boundary

- no lesson body rewrite
- no fixture / preview rewrite
- no Runtime
- no DB / migration
- no catalog enum / availability change
- no publication
