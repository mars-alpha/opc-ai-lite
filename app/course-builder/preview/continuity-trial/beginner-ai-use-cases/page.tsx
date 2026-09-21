import { BeginnerFoundationDraftPreview } from "../../../../../components/BeginnerFoundationDraftPreview";
import {
  continuityTrialUseCasesDraft,
  continuityTrialUseCasesIntro,
  continuityTrialUseCasesKnowledgeDepth,
  continuityTrialUseCasesReferenceFill
} from "../../../../../fixtures/course-builder/foundation-continuity-trial";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={continuityTrialUseCasesDraft}
      introPreview={continuityTrialUseCasesIntro}
      knowledgeDepth={continuityTrialUseCasesKnowledgeDepth}
      referenceFill={continuityTrialUseCasesReferenceFill}
      skillVersion="0.2.0"
      batchLabel="Continuity Trial"
      duration="约 12 分钟"
      reviewItems={[
        "第一课是否真的生成并保留 AI First Draft，而不是只讲 AI 能做什么？",
        "OPC / 自媒体案例是否只是默认场景，而不是把方法绑死在行业？",
        "是否没有提前教授 Prompt / Context 等后续知识？",
        "学完后能否直接把同一 Draft 带入下一课？"
      ]}
    />
  );
}
