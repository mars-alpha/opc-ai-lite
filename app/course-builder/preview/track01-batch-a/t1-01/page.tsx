import { BeginnerFoundationDraftPreview } from "../../../../../components/BeginnerFoundationDraftPreview";
import {
  track01T101Draft,
  track01T101Intro,
  track01T101KnowledgeDepth,
  track01T101ReferenceFill
} from "../../../../../fixtures/course-builder/track01-batch-a";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={track01T101Draft}
      introPreview={track01T101Intro}
      knowledgeDepth={track01T101KnowledgeDepth}
      referenceFill={track01T101ReferenceFill}
      skillVersion="0.2.0"
      batchLabel="Track 01 · Batch A · T1-01"
      duration="约 15 分钟"
      reviewItems={[
        "第一屏是否让零基础学习者立刻明白：这一课学的是任务边界，不是 AI 功能清单？",
        "Step 3 是否真的在训练“可协助 / 需谨慎核验 / 人负责最终决定”的判断，而不是考术语？",
        "Step 4 是否能完成 3 个真实任务分类，并留下一个真实 AI 第一版供 T1-02 继续使用？",
        "是否没有提前教授 Prompt / Context / Hallucination / HITL 等后续知识？",
        "Step 5 的 4 个判断是否清楚、可长期复用，而且没有越界到正式 Verification？"
      ]}
    />
  );
}
