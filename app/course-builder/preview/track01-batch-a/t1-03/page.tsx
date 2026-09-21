import { BeginnerFoundationDraftPreview } from "../../../../../components/BeginnerFoundationDraftPreview";
import {
  track01T103Draft,
  track01T103Intro,
  track01T103KnowledgeDepth,
  track01T103ReferenceFill
} from "../../../../../fixtures/course-builder/track01-batch-a";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={track01T103Draft}
      introPreview={track01T103Intro}
      knowledgeDepth={track01T103KnowledgeDepth}
      referenceFill={track01T103ReferenceFill}
      reviewLabels={{ primary: "AI 适合做什么", secondary: "AI 不应该替你做什么" }}
      practiceHintsGrouped
      practiceCopyValuesOnly
      skillVersion="0.2.0"
      batchLabel="Track 01 · Batch A · T1-03"
      duration="约 18 分钟"
      reviewItems={[
        "Step 1 是否让学员理解：任务说清楚后，AI 仍可能缺完成任务需要的信息？",
        "Step 2 是否通过信息太少 / 太多 / 刚好够用讲清信息取舍？",
        "Step 3 是否只检查信息是否必要，而不是提前考知识库、RAG 或来源可信度？",
        "Step 4 是否只保留必要的两个字段，并且填完后能直接复制到自己的 AI 软件里验证？",
        "Step 5 是否按 AI 适合做什么 / AI 不应该替你做什么上下对比，并与解释、误区不重复？",
        "学完后，学员是否真的能整理一份足够但不过量的最小信息包？"
      ]}
    />
  );
}
