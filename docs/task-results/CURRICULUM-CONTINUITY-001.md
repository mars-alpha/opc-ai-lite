# CURRICULUM-CONTINUITY-001 — Five-Track Capability Continuity Baseline

Status: **COMPLETE_BASELINE_V1**

## Decision

五大长期板块正式定义为一条连续能力链，而不是五套独立课程：

01 AI 基础认知 → 02 AI 工作应用 → 03 AI 推广运营与业务增长 → 04 AI Workflow 与自动化 → 05 FDE / AI 解决方案落地。

课程方法层必须行业通用；OPC / 自媒体 / 内容运营 → 推广 → 获客 → 业务转化只作为默认贯穿 Case Thread。

## Continuity Contract

后续 Formal Brief 必须明确：Inherited Capabilities / Inherited Artifact / Current Learner Job / New Capability / Artifact Action / Artifact Output / Next Reuse / Do Not Re-teach / Case Thread。

后续课程默认调用前面已经获得的能力，不重新从定义开始教学。APPLICATION / PRACTICE / PROJECT 原则上必须产生或改善可复用 Artifact。

## Stage 1 / Stage 2

当前 Stage 1 / Stage 2 的技术成果保留，但连续性 Human Review 已暴露问题：知识存在重复、案例链断裂、Artifact 没有持续承接。

因此两批均进入 CONTINUITY_REWORK_REQUIRED；Catalog 仍保持 IN_PRODUCTION + COMING_SOON，不进入 Runtime / AVAILABLE。

下一步为 FOUNDATION-CONTINUITY-REWORK-001：先按本 Baseline 重做 Stage 1 + Stage 2 Formal Brief / Artifact Thread，再决定重新生产。

## Course Builder v0.2 Gap Review

v0.2 当前擅长单节质量、Beginner Cognitive Load、Six-step、Three-Question Mastery、Primary/Deferred Terms，但缺少显式 continuity context。

结论：
- 不创建新 Skill；
- 不在本任务升级 Skill；
- v0.2 继续作为当前已实现版本；
- course-builder@0.3.0 Capability Continuity Alignment 有明确候选价值，但必须先用新的 Stage 1/2 Formal Brief 真实验证 v0.2；
- 只有真实样本仍出现系统性重复 / Case Thread 断裂 / Artifact 断裂，才启动 COURSE-BUILDER-SKILL-006。

未来进阶图文课程仍复用 Course Builder 做 Instructional Design；它可以提出 visualNeed / diagramBrief / screenshotNeed / codeExampleNeed，但真正媒体生成应由独立 Media Skill / Workflow 负责。

## Scope

本任务未修改：Skill code、Runtime、DB、Migration、Catalog enum、availability、lesson body、published state。

Validation: docs-only diff review + git diff --check.