import { BeginnerFoundationDraftPreview } from "../../../../../components/BeginnerFoundationDraftPreview";
import {
  continuityTrialContextDraft,
  continuityTrialContextIntro,
  continuityTrialContextKnowledgeDepth
} from "../../../../../fixtures/course-builder/foundation-continuity-trial";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={continuityTrialContextDraft}
      introPreview={continuityTrialContextIntro}
      knowledgeDepth={continuityTrialContextKnowledgeDepth}
      skillVersion="0.2.0"
      batchLabel="Continuity Trial"
      duration="约 14 分钟"
      reviewItems={[
        "是否直接从 Clear Task Brief 进入 Context Pack，而不是重复“AI 不知道你脑里的背景”？",
        "是否没有重讲搜索 / 文件产品能力？",
        "是否继续同一个内容 Artifact？",
        "是否让下一课直接使用 Context-enriched Draft？"
      ]}
    />
  );
}
