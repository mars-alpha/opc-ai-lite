# FACT-DRIFT-AUDIT-001 — Current Fact Drift Audit

Status: COMPLETE_DOCS_ALIGNED

## Scope

对当前 Git / canonical docs / current status 进行事实漂移审计，只修文档，不修改业务代码、Runtime、DB、Migration、Provider 或课程发布状态。

## MUST_FIX findings

1. `PROJECT_STATUS.md` 仍把 COURSE-PRODUCTION-001 标为 Human Review Pending，但该批已被 CURRICULUM-005 明确判定为 PEDAGOGY_REJECTED / RETIRED。
2. `PROJECT_STATUS.md` / `TASKS.md` 仍把新 Beginner Batch A 写成 Human Review Pending，但当前质量样板已经得到产品负责人认可；真实状态应为 Human Review PASS、Runtime 尚未 Provision、Catalog 仍 IN_PRODUCTION + COMING_SOON。
3. `PROJECT_STATUS.md` 的业务代码验证基线仍指向旧 `main@b235da6` 与 34 pages；最近一次业务代码完整验证基线是 Course Builder v0.2 的 `main@38b256f`，typecheck/build PASS，42 pages。
4. `FOUNDATION_KNOWLEDGE_MAP_V1.md` 的 Global Primary Knowledge Home matrix 仍残留 CURRICULUM-005 前旧编号，例如 Token→F2-01、Prompt→F3-01，与当前 Stage 2/3 课程定义冲突。
5. 同一 Knowledge Map 的 existing asset disposition / production readiness / next task 仍使用旧课程编号和旧生产顺序。
6. `FORMAL_CURRICULUM_V1.md` 的 Stage 1 下方仍保留 pre-reframe Module 1.1 / 1.2 九课结构，与当前 7-stage / 28-lesson map 冲突；生产链也未包含 Preview / Runtime gates。

## SHOULD_FIX findings

- 当时发现旧 `FOUNDATION_CATALOG_METADATA_V1.md` 存在状态漂移；该旧 Catalog 现已被 Track 01 v2 owner 取代并删除，此条仅保留历史审计证据。
- 旧失败 Batch Brief 文件虽然顶部已明确 RETIRED，但 Status 仍写 BRIEF_READY_V1，容易被自动读取误判，应改为 RETIRED_FAILED_REFERENCE。

## HISTORICAL_OK

以下不改写：
- docs/task-results/COURSE-PRODUCTION-002.md
- docs/task-results/COURSE-PRODUCTION-002-A.md
- 其他历史 task-results 中当时的 Human Review Pending / Next

原因：task-result 是历史证据，保留当时状态；当前事实由 CURRENT_SYSTEM_FACTS / PROJECT_STATUS / canonical learning docs 覆盖。

## Result

已对齐：
- Stage 1 current Human Review state
- latest verified business-code baseline
- Foundation Primary Knowledge Home matrix
- asset migration mapping
- production batch sequencing
- formal curriculum Stage 1 canonical source
- course production chain
- catalog Human Review wording

未改变：
- Catalog enum / availability
- Lesson IDs / types / gates
- Runtime / DB / migrations
- Skill versions
- any Foundation lesson publication state
