import { BeginnerFoundationDraftPreview } from "../../../../../components/BeginnerFoundationDraftPreview";
import {
  continuityTrialIterationDraft,
  continuityTrialIterationIntro,
  continuityTrialIterationKnowledgeDepth,
  continuityTrialIterationReferenceFill
} from "../../../../../fixtures/course-builder/foundation-continuity-trial";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={continuityTrialIterationDraft}
      introPreview={continuityTrialIterationIntro}
      knowledgeDepth={continuityTrialIterationKnowledgeDepth}
      referenceFill={continuityTrialIterationReferenceFill}
      skillVersion="0.2.0"
      batchLabel="Continuity Trial"
      duration="约 15 分钟"
      reviewItems={[
        "是否真的修改同一份 Context-enriched Draft，而不是换客户消息案例？",
        "是否不再重讲 Prompt / Context？",
        "是否清楚表达“保留有效部分 + 指出具体偏差 + 修改”？",
        "是否留下 Iterated Draft 给 Result Check？"
      ]}
    />
  );
}
