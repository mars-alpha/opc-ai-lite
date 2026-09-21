import { BeginnerFoundationDraftPreview } from "../../../../../components/BeginnerFoundationDraftPreview";
import {
  continuityTrialPromptDraft,
  continuityTrialPromptIntro,
  continuityTrialPromptKnowledgeDepth,
  continuityTrialPromptReferenceFill
} from "../../../../../fixtures/course-builder/foundation-continuity-trial";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={continuityTrialPromptDraft}
      introPreview={continuityTrialPromptIntro}
      knowledgeDepth={continuityTrialPromptKnowledgeDepth}
      referenceFill={continuityTrialPromptReferenceFill}
      skillVersion="0.2.0"
      batchLabel="Continuity Trial"
      duration="约 15 分钟"
      reviewItems={[
        "是否没有再次证明“输入清楚会更好”？",
        "是否把前面零散经验正式整理成 Clear Task Brief？",
        "Practice 是否继续使用同一 OPC / 自媒体内容？",
        "是否明确让下一课继续补 Context Pack？"
      ]}
    />
  );
}
