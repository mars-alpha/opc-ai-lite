import { BeginnerFoundationDraftPreview } from "../../../../components/BeginnerFoundationDraftPreview";
import {
  beginnerIterationDraft,
  beginnerIterationIntro,
  beginnerIterationKnowledgeDepth,
  beginnerIterationReferenceFill
} from "../../../../fixtures/course-builder/beginner-foundation-stage2";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={beginnerIterationDraft}
      introPreview={beginnerIterationIntro}
      knowledgeDepth={beginnerIterationKnowledgeDepth}
      referenceFill={beginnerIterationReferenceFill}
      skillVersion="0.2.0"
      batchLabel="Foundation Stage 2"
      duration="约 16 分钟"
      reviewItems={[
        "是否把“再来一个”清楚地升级成具体反馈？",
        "Practice 是否真的能训练下一轮反馈，而不是背概念？",
        "COPY_TO_AI 是否有真实比较价值？",
        "是否没有把 Iteration 偷换成 Workflow / Agent 自动循环？"
      ]}
    />
  );
}
