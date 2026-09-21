import { BeginnerFoundationDraftPreview } from "../../../../../components/BeginnerFoundationDraftPreview";
import {
  continuityTrialResultQualityDraft,
  continuityTrialResultQualityIntro,
  continuityTrialResultQualityKnowledgeDepth,
  continuityTrialResultQualityReferenceFill
} from "../../../../../fixtures/course-builder/foundation-continuity-trial";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={continuityTrialResultQualityDraft}
      introPreview={continuityTrialResultQualityIntro}
      knowledgeDepth={continuityTrialResultQualityKnowledgeDepth}
      referenceFill={continuityTrialResultQualityReferenceFill}
      skillVersion="0.2.0"
      batchLabel="Continuity Trial"
      duration="约 12 分钟"
      reviewItems={[
        "是否继续上一课同一 Draft，而不是重新开案例？",
        "是否只做单变量实验，没有提前变成 Prompt 课？",
        "是否明确留下 Better Draft + Comparison Note？",
        "下一课是否自然承接 Better Draft 的事实风险检查？"
      ]}
    />
  );
}
