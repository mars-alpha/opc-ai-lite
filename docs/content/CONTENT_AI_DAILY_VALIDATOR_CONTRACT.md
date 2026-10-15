# CONTENT_AI_DAILY_VALIDATOR_CONTRACT.md

Status: **CURRENT**  
Task: CONTENT-AI-DAILY-CONTRACT-001  

## 1. Purpose

AI 日报所有 Skill Output 必须经过：

```text
Schema Validation
→ Referential Validation
→ Deterministic Business Validation
→ Persist
```

Validator 是 Core 权威；AI 自评“正确”不构成通过。

## 2. Global Fail-Closed Rules

以下任一条件出现时，禁止进入下一阶段：

- JSON / Schema 无效。
- eventId 不匹配；除 Topic Diagnosis 外的 Artifact 若 contentId 缺失或不匹配。
- parentArtifactId 不存在。
- Source ID 不存在。
- AI 返回未采集 URL 并试图作为正式 Source。
- 引用不存在的 Fact / Number / Outline Section。
- Artifact lineage 断裂。
- schemaVersion 不受支持。

失败后：
- 保留现有正式 Artifact。
- 记录 Validation Result。
- 不静默降级为“看起来可用”。
- 允许人工修正或重新执行当前阶段。

## 3. Validation Result

```ts
type ValidationResult = {
  valid: boolean
  artifactType: string
  artifactId?: string
  errors: {
    code: string
    path?: string
    message: string
    relatedIds?: string[]
  }[]
  warnings: {
    code: string
    path?: string
    message: string
  }[]
  validatedAt: string
}
```

Error 阻断流转；Warning 不自动阻断，但必须在最终 Human Review 可见。

## 4. Topic Diagnosis Validator

必须检查：
- Event 存在。
- Topic Diagnosis 允许 `contentId=null`，不得为了满足 Artifact Envelope 提前创建未 Adopt 的 Content。
- supportingSourceIds 全部存在且属于该 Event / Expansion Evidence。
- verdict 枚举合法。
- evidenceReadiness 与 evidenceGaps 结构合法。
- AI 评估字段不能写入真实 Platform Metrics owner。

禁止：
- 将 AI 估算热度伪装为真实播放量、点赞量或排行。
- Diagnosis 自动改变 Event Decision。

建议错误码：

```text
TD_EVENT_NOT_FOUND
TD_SOURCE_NOT_ALLOWED
TD_FAKE_METRIC_FIELD
TD_INVALID_VERDICT
```

## 5. Evidence Pack Validator

必须检查：
- 每个 Fact 的 sourceIds 非空。
- 所有 sourceIds 存在。
- Timeline / Key Number 的来源存在。
- `locked=true` 的 Fact 不能是 `UNCERTAIN` 或 `CONFLICTING`。
- coverage=SUFFICIENT 不得与“所有关键事实均无来源”等明显冲突状态共存。

机械 Validator 不判断“事实是否真的为真”，但必须保证：

> 每个正式事实声明都有可追溯证据。

建议错误码：

```text
EP_FACT_WITHOUT_SOURCE
EP_SOURCE_NOT_FOUND
EP_LOCKED_FACT_UNCERTAIN
EP_INVALID_TIMELINE_SOURCE
EP_INVALID_NUMBER_SOURCE
```

## 6. Outline Validator

必须检查：
- 所有 evidenceFactIds 来自当前 Evidence Pack。
- 所有 keyNumberIds 来自当前 Evidence Pack。
- sourceIds 必须属于 Evidence Pack。
- 至少一个有效正文 section。
- excludedClaims 不得同时作为 section keyPoint 的确定事实使用。

建议错误码：

```text
OL_UNKNOWN_FACT
OL_UNKNOWN_NUMBER
OL_UNKNOWN_SOURCE
OL_EMPTY_BODY
OL_EXCLUDED_CLAIM_REUSED
```

## 7. Draft Validator

必须检查：
- outlineSectionId 存在。
- evidenceFactIds 属于当前 Evidence Pack。
- Draft sourceIds 属于当前 Evidence Pack。
- lockedFactIds 与 Evidence Pack 中 locked facts 一致或为其子集。
- Draft 不能把 UNCERTAIN / CONFLICTING Fact 无标记写成确定性引用。
- contentHash 可由规范化正文稳定重算。

### Humanizer Guard

Humanizer 前后至少做两类机械保护：

1. Locked Fact 引用集合不变。
2. 受保护 token 不被改写，例如：
   - 日期；
   - 数字；
   - 产品 / 公司专名；
   - 明确 quote；
   - URL / Source reference。

无法通过确定性方法保证的“语义没变”，不得伪装为 Validator 已证明。最终仍由 Human Gate 负责内容责任。

建议错误码：

```text
DR_UNKNOWN_OUTLINE_SECTION
DR_UNKNOWN_FACT
DR_UNKNOWN_SOURCE
DR_LOCKED_FACT_SET_INVALID
DR_PROTECTED_TOKEN_CHANGED
DR_CONTENT_HASH_MISMATCH
```

## 8. Formatted Draft Validator

必须检查：
- draftArtifactId 存在。
- draftContentHash 与当前引用 Draft 一致。
- 每个 DRAFT_TEXT block 指向真实 Draft Section。
- sourceTextHash 与对应 Draft Section 文本一致。
- Asset ID 存在于当前 Asset Registry / Artifact payload。
- Asset placement 指向真实 Draft Section。

Formatted Draft 不允许携带无法追溯到 Draft 的自由正文。

因此“AI 排版不得改事实”优先通过架构保证，而不是依赖模型自觉。

建议错误码：

```text
FD_DRAFT_NOT_FOUND
FD_DRAFT_HASH_MISMATCH
FD_SECTION_NOT_FOUND
FD_SOURCE_TEXT_HASH_MISMATCH
FD_ASSET_NOT_FOUND
FD_FREEFORM_TEXT_NOT_ALLOWED
```

## 9. Publish Gate Validator

正式发布前必须检查：

- Content 属于 AI Daily。
- 当前 Formatted Draft 通过 Validator。
- Formatted Draft 引用的 Draft 版本仍为审核时版本。
- 所有必要 Asset 状态可用。
- 不存在阻断 Error。
- Final Human Gate 已明确确认。
- 发布动作由 Core 执行。

若 Final Review 后 Draft / Asset 被修改，则原 Review 失效，必须重新确认。

## 10. Security / Authority

Validator 必须拒绝：
- Skill 请求写业务状态。
- Skill 请求直接 Publish。
- Skill 自带 database mutation instruction。
- 未授权外部 Source 自动升级为正式 Evidence。

Skill Output 始终被视为不可信输入。

## 10A. Event Expansion Output Validator

- WHAT_HAPPENED 只允许 FACT；其余栏目只允许 REFERENCE_ONLY 且 Expansion Type 必须匹配 allowlist。
- Raw Item 必须来自当前输入；未知引用、跨栏重复引用拒绝。
- EMPTY 栏在 AI synthesis 中必须继续为空。
- 每条 synthesis 必须回传本栏真实 evidenceRawItemIds。
- 新数字/版本/百分比必须存在于引用证据文本；WHAT_HAPPENED 可额外使用 Event title/summary。
- AI 文本不得自行输出 URL/内部字段。Validator 不证明完整语义等价，仍需 Human Review。
- 可重跑：npm run content:expansion:output:accept；npm run content:expansion:output:db:accept。

## 11. Deterministic Acceptance Fixtures

后续实现阶段至少准备：

1. 正常五阶段 happy path。
2. Evidence Fact 缺 Source。
3. Outline 引用未知 Fact。
4. Draft 引用未知 Source。
5. Humanizer 修改受保护数字。
6. Formatted Draft 引用旧 Draft hash。
7. Formatted Draft 注入自由正文。
8. Final Review 后 Draft 变化导致发布拒绝。

本合同阶段只定义 fixtures，不创建数据库和执行代码。

## 12. Contract-Level Acceptance

- 每一阶段都有机械可验证边界。
- 明确 Validator 能证明什么、不能证明什么。
- Fact / Source / lineage 均 fail-closed。
- Humanizer 与 Formatted Draft 的事实保护有确定性机制。
- Publish Gate 不依赖 Skill 自我声明。

