# TRACK01-T11-T20-LEARNING-EXPERIENCE-REWORK-001

Status: **COMPLETE_QUALITY_REWORK_PASS / RUNTIME_ACCEPTANCE_PASS**
Date: **2026-09-23**

## Goal

根据真实学习体验，对 T1-11～T1-20 做一次课程内容与生产规则回收，修正四类会继续影响后续课程的问题：

1. 学员可见语言中不必要的英文生产词 / 普通说明词；
2. Step 4 Reference Fill 不能直接复制给 AI 得到本课目标输出；
3. Step 5 机械套用固定标题 / 固定两张卡片；
4. Step 6 把“下一课继续什么”误当成现实触发场景。

本任务不修改 Unified Lesson Shell，不新增 UI / Renderer / interaction type，不调整 CSS。

## Result

### 1. 学员可见语言

- T1-12 不再把 `Schema` 作为普通学员字段或说明词裸露，改用“结构规则 / 数据结构规则”。
- T1-14 的 `Beginner` 改为“初学阶段”。
- T1-17 的 `Goal / Observe / Decide / Act / Stop` 改为自然中文“目标 / 当前状态与观察 / 判断与行动 / 停止条件”。
- T1-19 的 `GUI` 改为“图形界面”。
- T1-20 learner-facing `AI Workflow` / `Human-in-the-loop` 改为“AI 工作流 / 人工参与边界”。
- Track 01 全量文本扫描后，仍存在的 `Beginner` 仅位于 researchSummary / qualityProfile 等生产元数据；`GUI` 命中来自内部 `GUIDED` 枚举字符串，不属于学员可见内容。

### 2. Step 4 — Copy-ready Reference Fill

验收原则固定为：学员按字段逐一填写后，字段值按顺序组合，必须已经是一份可以直接复制给 AI、并得到本课目标输出的完整任务。

- T1-11 字段重写为“查询目标 / 必要信息 / 返回要求”。
- T1-12 新增“待处理内容”，字段改为“待处理内容 / 使用场景 / 输出字段 / 字段规则”。
- T1-13～T1-20 Reference Fill 全部改为可直接执行的任务句，而不是抽象短语。
- Reference Answer 与 Reference Fill 继续保持同一标准任务。
- 只有课程本身需要澄清需求时，才允许反问作为主要输出方式。

### 3. Step 5 — Topic-specific Review

`AI适合做什么 / AI不应该替你做什么` 现在只作为 Human Review 的内部审核镜头，不再作为所有课程固定 learner-facing 卡片标题。

当前 T1-11～T1-20 Review 卡片数：

```text
T1-11  3
T1-12  3
T1-13  3
T1-14  2
T1-15  3
T1-16  4
T1-17  3
T1-18  3
T1-19  4
T1-20  4
```

卡片数量按知识密度决定，不为版式凑数。原先重复的 Knowledge Depth 下方两张固定说明已删除。

### 4. Step 6 — Reality Trigger

新增独立 `triggerScenario` presentation 数据。“遇到什么情况，我应该想到这节课？”现在读取每课独立现实场景，不再读取 `lesson.related[0]` 的“下一课继续……”文案。

`Next Lesson Value` 继续只承担后续学习价值，两者彻底分离。

## Rule / Workflow Sync

已同步 COURSE_BUILD_START_HERE、LESSON_OUTPUT_CONTRACT、BEGINNER_LESSON_QUALITY_STANDARD、COURSE_PRODUCTION_GOVERNANCE、COURSE_PRODUCTION_WORKFLOW、TRACK01_T11_T20_FORMAL_BRIEFS、Course Builder Skill v1 与 T1-11～T1-20 Deterministic Validator。

Workflow 生命周期未变化；仍通过 Rule Sources read-latest 消费当前 owner 文件，因此后续课程会复用本次经验，不复制第二套规则正文。

## Validation

```text
TRACK01_T11_T20_CHINESE_FIRST_LEARNER_COPY=PASS
TRACK01_T11_T20_COPY_READY_REFERENCE_ANSWER=PASS
TRACK01_T11_T20_REVIEW_DENSITY_VARIATION=PASS
TRACK01_T11_T20_TRIGGER_SCENARIOS=PASS
learning:course-production-workflow:check PASS
typecheck PASS
learning:formal-registry:check PASS
learning:course-interaction:check PASS
learning:course-current-state:check PASS
```

重新 Provision：

```text
T111_T120_DATABASE_CONFIGURED=true
T1_11_T1_20_RUNTIME_PROVISION=PASS
```

完整 authenticated Runtime Acceptance：

```text
T1_11_RUNTIME_ACCEPTANCE=PASS
T1_12_RUNTIME_ACCEPTANCE=PASS
T1_13_RUNTIME_ACCEPTANCE=PASS
T1_14_RUNTIME_ACCEPTANCE=PASS
T1_15_RUNTIME_ACCEPTANCE=PASS
T1_16_RUNTIME_ACCEPTANCE=PASS
T1_17_RUNTIME_ACCEPTANCE=PASS
T1_18_RUNTIME_ACCEPTANCE=PASS
T1_19_RUNTIME_ACCEPTANCE=PASS
T1_20_RUNTIME_ACCEPTANCE=PASS
T1_11_T1_20_LESSON_SPEC_REGISTRY=PASS
T1_11_T1_20_RUNTIME_PROVISIONED=PASS
T1_11_T1_20_RUNTIME_API=PASS
T1_11_T1_20_CHECK_PRACTICE_GATES=PASS
T1_11_T1_20_PAGE_RENDERING=PASS
T1_11_T1_20_RUNTIME_ACCEPTANCE=PASS
T1_11_T1_20_TEST_DATA_CLEANUP=PASS
```

## Final Boundary

- T1-11～T1-20 仍为 `AVAILABLE / FORMAL_RUNTIME`。
- 现有 Unified Lesson Shell 保持不变。
- 本任务没有新增 UI、Renderer 或 interaction type。
- 本任务没有修改 CSS。
