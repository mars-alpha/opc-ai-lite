import { BeginnerFoundationDraftPreview } from "../../../../components/BeginnerFoundationDraftPreview";
import {
  beginnerAiResultQualityDraft,
  beginnerAiResultQualityIntro,
  beginnerAiResultQualityKnowledgeDepth,
  beginnerAiResultQualityReferenceFill
} from "../../../../fixtures/course-builder/beginner-foundation-batch-a";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={beginnerAiResultQualityDraft}
      introPreview={beginnerAiResultQualityIntro}
      knowledgeDepth={beginnerAiResultQualityKnowledgeDepth}
      referenceFill={beginnerAiResultQualityReferenceFill}
      duration="约 12 分钟"
      reviewItems={[
        "是否不用先学 Prompt / Context 定义，也能理解“AI 不知道你没说的东西”？",
        "模糊要求和补充关键信息的对比是否自然？",
        "练习有没有从理论变成一个很容易动手的小任务？",
        "学完后是否会先检查缺失信息，而不是直接觉得 AI 不好用？"
      ]}
    />
  );
}
