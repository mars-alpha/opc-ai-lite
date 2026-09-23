import { BeginnerFoundationDraftPreview } from "../../../../../components/BeginnerFoundationDraftPreview";
import {
  track01T104Draft,
  track01T104Intro,
  track01T104KnowledgeDepth,
  track01T104ReferenceFill
} from "../../../../../fixtures/course-builder/track01-batch-a";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={track01T104Draft}
      introPreview={track01T104Intro}
      knowledgeDepth={track01T104KnowledgeDepth}
      referenceFill={track01T104ReferenceFill}
      reviewLabels={{ primary: "AI 适合做什么", secondary: "AI 不应该替你做什么" }}
      practiceHintsGrouped
      skillVersion="0.2.0"
      batchLabel="Track 01 · Batch A · T1-04"
      duration="约 18 分钟"
      reviewItems={[
        "Step 1 是否让初学者理解：第一版不满意，不等于整份内容都要重写？",
        "Step 2 是否清楚对比“重新写好一点”和“只改第 2 个要点 + 明确标准”？",
        "Step 3 是否只检查定向修改判断，不要求学员独立诊断复杂问题？",
        "Step 4 是否由课程直接给定问题，只让学员填写“我希望改成什么样 / 这次的具体要求”？",
        "参考答案是否是一份可直接复制到 AI 验证的 OPC / 自媒体完整修改要求？",
        "Step 5 是否按本课真实知识需要设置主卡片，具体回答两个固定核心方向，而不是为了版式预设数量？"
      ]}
    />
  );
}
