# CONTENT_AI_DAILY_STRUCTURED_OUTPUT_CONTRACT.md

Status: **CURRENT**  
Task: CONTENT-AI-DAILY-CONTRACT-001  

## 1. Purpose

定义 AI 日报五阶段 Artifact 的稳定数据边界：

```text
Topic Diagnosis
→ Evidence Pack
→ Outline
→ Draft
→ Formatted Draft
```

具体 Skill 可以替换，业务合同不可随 Skill 输出漂移。

## 2. Common Artifact Envelope

所有 Artifact 都必须包含：

```ts
type ArtifactEnvelope = {
  artifactId: string
  artifactType:
    | "TOPIC_DIAGNOSIS"
    | "EVIDENCE_PACK"
    | "OUTLINE"
    | "DRAFT"
    | "FORMATTED_DRAFT"
  schemaVersion: string
  contentId: string | null
  eventId: string
  version: number
  parentArtifactIds: string[]
  generatedBy: {
    mode: "AI" | "HUMAN" | "CORE"
    adapterId?: string
    skillId?: string
    skillVersion?: string
    modelProfileId?: string
  }
  createdAt: string
}
```

约束：
- `version` 递增，不静默覆盖历史正式 Artifact。
- 下游必须保存上游 Artifact ID。
- Skill 名称不是业务主键。
- 模型和 Skill 信息属于执行 provenance，不属于正式内容身份。
- `TOPIC_DIAGNOSIS` 发生在 Human Adopt 之前，允许 `contentId=null`；从 `EVIDENCE_PACK` 开始必须绑定正式 `contentId`。

## 3. Source Reference

```ts
type SourceReference = {
  sourceId: string
  rawItemId?: string
  url: string
  canonicalUrl?: string
  title?: string
  publisher?: string
  publishedAt?: string
  observedAt: string
}
```

SourceReference 必须指向 Core 已存在来源，AI 不得自行创建虚构 URL。

## 4. Topic Diagnosis

下面的 `ADOPT_RECOMMENDED` / `WATCH_RECOMMENDED` 仅是内容选题诊断的建议枚举，不是热点追踪旧 Event 决策，也不能写入新的采集质量反馈。内容选题入口仍待独立规划。

```ts
type TopicDiagnosis = ArtifactEnvelope & {
  artifactType: "TOPIC_DIAGNOSIS"
  verdict: "ADOPT_RECOMMENDED" | "WATCH_RECOMMENDED" | "REJECT_RECOMMENDED"
  whyItMatters: string
  readerValue: string
  suggestedAngle: string
  duplicationRisk: "LOW" | "MEDIUM" | "HIGH"
  timeliness: "LOW" | "MEDIUM" | "HIGH"
  evidenceReadiness: "INSUFFICIENT" | "PARTIAL" | "SUFFICIENT"
  differentiation: "LOW" | "MEDIUM" | "HIGH"
  evidenceGaps: string[]
  risks: string[]
  supportingSourceIds: string[]
  reasoningSummary: string
}
```

说明：
- 不把 AI 估算的“95/100 热度”保存成平台事实。
- 若未来需要评分，只能作为显式 `AI_ASSESSMENT`，与真实 Metrics 分离。
- `verdict` 是建议，不等于 Event Decision。

## 5. Evidence Pack

```ts
type EvidenceFact = {
  factId: string
  statement: string
  sourceIds: string[]
  status: "SUPPORTED" | "UNCERTAIN" | "CONFLICTING"
  locked: boolean
}

type TimelineItem = {
  itemId: string
  occurredAt?: string
  statement: string
  sourceIds: string[]
}

type KeyNumber = {
  numberId: string
  label: string
  value: string
  sourceIds: string[]
}

type EvidencePack = ArtifactEnvelope & {
  artifactType: "EVIDENCE_PACK"
  coreFact: string
  facts: EvidenceFact[]
  timeline: TimelineItem[]
  keyNumbers: KeyNumber[]
  sourceIds: string[]
  context: string[]
  conflictingClaims: {
    description: string
    sourceIds: string[]
  }[]
  uncertainties: {
    description: string
    sourceIds: string[]
  }[]
  missingEvidence: string[]
  coverage: "INSUFFICIENT" | "PARTIAL" | "SUFFICIENT"
}
```

规则：
- 所有重要事实必须有至少一个真实 Source。
- `locked=true` 只用于有充分来源支撑、后续写作不得改变的事实。
- `UNCERTAIN` / `CONFLICTING` 不得在 Draft 中被写成确定事实。

## 6. Outline

```ts
type VisualIntent =
  | "NONE"
  | "IMAGE"
  | "ILLUSTRATION"
  | "HTML_CARD"
  | "TIMELINE"
  | "COMPARISON"
  | "ANIMATION"

type OutlineSection = {
  sectionId: string
  heading: string
  purpose: string
  keyPoints: string[]
  evidenceFactIds: string[]
  keyNumberIds: string[]
  sourceIds: string[]
  visualIntent: VisualIntent
}

type Outline = ArtifactEnvelope & {
  artifactType: "OUTLINE"
  titleDirection: string
  coreThesis: string
  leadPurpose: string
  sections: OutlineSection[]
  conclusionPurpose: string
  excludedClaims: string[]
}
```

规则：
- 每个事实性 section 必须绑定 Evidence。
- `visualIntent` 只说明表达需求，不决定具体工具。
- `excludedClaims` 保存明确禁止写入正文的未证实推断。

## 7. Draft

```ts
type DraftSection = {
  sectionId: string
  outlineSectionId: string
  heading?: string
  content: string
  evidenceFactIds: string[]
  sourceIds: string[]
  assetSlots: {
    slotId: string
    intent: VisualIntent
    purpose: string
  }[]
}

type Draft = ArtifactEnvelope & {
  artifactType: "DRAFT"
  title: string
  subtitle?: string
  lead: string
  sections: DraftSection[]
  conclusion: string
  sourceIds: string[]
  lockedFactIds: string[]
  warnings: string[]
  contentHash: string
}
```

规则：
- `contentHash` 对正文规范化内容计算，供后续排版完整性校验。
- Humanizer 属于 Draft 生成内部步骤，最终业务 Artifact 仍为 Draft。
- Humanizer 处理前后必须使用同一组 `lockedFactIds`。

## 8. Asset Reference

```ts
type AssetReference = {
  assetId: string
  type:
    | "COVER"
    | "IMAGE"
    | "ILLUSTRATION"
    | "HTML_CARD"
    | "VIDEO"
    | "ANIMATION"
  purpose: string
  provider?: string
  storageProvider: "LOCAL" | "COS" | "EXTERNAL" | "UNASSIGNED"
  storageKey?: string
  url?: string
  mimeType?: string
  width?: number
  height?: number
  durationMs?: number
  source: "GENERATED" | "UPLOADED" | "EXTERNAL"
}
```

当前只定义合同，不要求实现 COS / Remotion。

## 9. Formatted Draft

Formatted Draft 不以“重新生成整篇文章”为设计。

正文优先通过 Draft 内容引用组织：

```ts
type ContentBlock =
  | {
      blockId: string
      type: "DRAFT_TEXT"
      draftSectionId: string
      sourceTextHash: string
      style?: {
        emphasis?: string[]
        presentation?: "PARAGRAPH" | "QUOTE" | "LIST"
      }
    }
  | {
      blockId: string
      type: "ASSET"
      assetId: string
      afterDraftSectionId?: string
      caption?: string
    }

type FormattedDraft = ArtifactEnvelope & {
  artifactType: "FORMATTED_DRAFT"
  draftArtifactId: string
  draftContentHash: string
  coverAssetId?: string
  blocks: ContentBlock[]
  assets: AssetReference[]
  formattingSummary: string[]
}
```

关键设计：
- Formatted Draft 保存 Draft 的 hash。
- 文字 Block 指向 Draft Section，而不是再持有自由改写正文。
- 排版层可以增加视觉表现，不拥有事实内容。

若未来业务确实需要“排版时润色一句话”，必须回到 Draft 产生新版本，再重新生成 Formatted Draft。

## 9A. Event Expansion Utility Map — Derived Read Model

EVENT-EXPANSION-OUTPUT-014 是 Evidence 的派生可用性视图，不是第六种正式 Artifact，也不创建第二条事实链。

固定六栏目：WHAT_HAPPENED（发生了什么）、HOW_TO_EXPERIENCE（怎么体验）、HOW_TO_LEARN（怎么学）、HOW_TO_USE（怎么用）、WORK_IMPACT（对什么工作有帮助）、WHY_SHARE（为什么值得分享）。

- WHAT_HAPPENED 仅 Event fact Raw / FACT。
- 其余栏目仅 Expansion Evidence / REFERENCE_ONLY。
- EXPERIENCE/DEMO→体验；TUTORIAL→学习；USE_CASE→使用；WORK_IMPACT→工作影响；SHAREABLE→分享；DISCUSSION v1 不自动映射。
- 非事实栏最多 2 条，事实栏最多 3 条；同一 Raw 不跨栏重复；证据不足保持 EMPTY。
- AI synthesis 只压缩表达并写 ai_runs 审计；正式 Evidence Pack / Outline 仍沿五阶段 Artifact lineage。

## 10. Lineage Example

```text
Event E1
→ Topic Diagnosis TD3
→ 独立内容选题确认（入口待后续规划；不使用采集质量标签）
→ Evidence Pack EP2
→ Outline O4
→ Draft D5
→ Formatted Draft F2
```

任何下游重新生成，都必须明确使用哪个上游版本。

## 11. Contract-Level Acceptance

- 五类 Artifact 均有明确结构。
- Fact → Source 可追溯。
- Outline → Evidence 可追溯。
- Draft → Outline / Evidence 可追溯。
- Formatted Draft → Draft hash 可追溯。
- Skill / Model provenance 与业务身份解耦。
- Asset 只预留，不绑定当前存储厂商。

