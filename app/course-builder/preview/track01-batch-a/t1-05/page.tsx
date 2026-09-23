import { BeginnerFoundationDraftPreview } from "../../../../../components/BeginnerFoundationDraftPreview";
import {
  track01T105Draft,
  track01T105Intro,
  track01T105KnowledgeDepth,
  track01T105ReferenceFill
} from "../../../../../fixtures/course-builder/track01-batch-a";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={track01T105Draft}
      introPreview={track01T105Intro}
      knowledgeDepth={track01T105KnowledgeDepth}
      referenceFill={track01T105ReferenceFill}
      reviewLabels={{ primary: "AI 适合做什么", secondary: "AI 不应该替你做什么" }}
      practiceHintsGrouped
      skillVersion="0.2.0"
      batchLabel="Track 01 · Batch A · T1-05"
      duration="约 18 分钟"
      reviewItems={[
        "Step 1 是否让学员理解：表达流畅、语气确定，不等于事实已经正确？",
        "Step 2 是否用 OPC / 自媒体内容清楚区分创意表达与必须核验的事实、最新信息？",
        "Step 3 是否只检查最低可靠性判断，没有提前进入来源冲突、证据体系或评测工程？",
        "Step 4 是否只要求“我准备核验的内容 / 我会去核对什么”，不要求初学者完成复杂研究？",
        "参考答案是否是一份可直接用于整理核验清单的 OPC / 自媒体完整案例？",
        "Step 5 是否按本课真实知识需要设置主卡片并具体回答两个固定核心方向，而不是为了版式预设数量？"
      ]}
    />
  );
}
