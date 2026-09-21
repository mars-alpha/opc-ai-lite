import { BeginnerFoundationDraftPreview } from "../../../../../components/BeginnerFoundationDraftPreview";
import {
  track01T102Draft,
  track01T102Intro,
  track01T102KnowledgeDepth,
  track01T102ReferenceFill
} from "../../../../../fixtures/course-builder/track01-batch-a";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={track01T102Draft}
      introPreview={track01T102Intro}
      knowledgeDepth={track01T102KnowledgeDepth}
      referenceFill={track01T102ReferenceFill}
      reviewLabels={{ primary: "AI 适合做什么", secondary: "AI 不应该替你做什么" }}
      practiceHintsGrouped
      skillVersion="0.2.0"
      batchLabel="Track 01 · Batch A · T1-02"
      duration="约 18 分钟"
      reviewItems={[
        "Step 1 是否立刻让零基础学员看懂：问题不是 Prompt 不够长，而是任务没有说清？",
        "Step 2 是否只通过目标 / 对象 / 要求 / 输出四项变化，把核心方法讲透？",
        "Step 3 是否检查任务说明是否真正可执行，而不是考 Prompt 术语？",
        "Step 4 的四个字段是否自然、容易填写，并且没有提前混入 Context？",
        "Step 5 的 4 张卡是否各自承担不同判断，并与下方解释和容易踩的坑不重复？",
        "学完后，学员是否真的能独立写出一份 Clear Task Brief？"
      ]}
    />
  );
}
