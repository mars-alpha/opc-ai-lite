# TRACK01-T11-T20-RUNTIME-001 — T1-11～T1-20 Batch Runtime Provisioning & Acceptance

Status: **COMPLETE_RUNTIME_ACCEPTANCE_PASS / AVAILABLE**

## Scope

承接 T1-11～T1-20 已完成的 Deterministic Validation 与 Human Review，将 10 节课批次接入现有 `foundation-ai` 正式 Runtime。

固定边界：

- 复用现有 Unified Lesson Shell；
- 不新增 UI；
- 不新增 Renderer；
- 不新增 interaction type；
- 不调整 CSS；
- 不建立第二套 Lesson / Check / Practice Runtime。

## Runtime integration

正式链路：

```text
Course Builder Draft
→ LessonSpec Registry
→ Phase 4～6 Runtime Definition
→ PostgreSQL Provisioning
→ Runtime API
→ Check / Practice Gate
→ Completion
→ Actual Course Page
→ AVAILABLE
```

Phase mapping：

- Phase 4：T1-11～T1-14
- Phase 5：T1-15～T1-17
- Phase 6：T1-18～T1-20

APPLICATION 课程沿用 `CHECK + PRACTICE` completion gate；CONCEPT 课程沿用 `CHECK` gate，同时保留 optional Step 4 Practice。

## Acceptance

最终 authenticated Runtime Acceptance：

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

Acceptance 真实验证了 Registry、数据库 Runtime hydration、三题 Check、Practice、currentStep、Completion 与实际课程页，不以 fixture-only PASS 代替 Runtime 验收。

## Runtime correction found during acceptance

批次接入时发现 Beginner Practice 的短但有效参考答案可能被现有 rule evaluator 的固定 rubric floor 判为未达标。

修正只调整 T1-11～T1-20 Draft 生成的 rubric floor，使其与现有 rule evaluator 的长度评分区间一致；没有降低总 passScore，也没有绕过 Practice Gate。

同时确认一次开发服务器 Hot Reload 导致的 `.next` Webpack module cache 异常属于开发缓存问题；清理构建缓存并从干净 dev compilation 重跑后，10/10 Runtime Acceptance 全部 PASS。

## Deferred knowledge

Runtime 接入没有发现需要通过扩展 UI 才能补足的 Track 01 核心知识。现有 `DEFERRED_KNOWLEDGE_LEDGER_V1.md` 边界继续有效，供 Track 02～05 后续重新做 Six-step Knowledge Point Gate。

## Final decision

T1-11～T1-20：**AVAILABLE / FORMAL_RUNTIME**。

Track 01 T1-01～T1-20 至此全部进入正式 Runtime。
