import { FoundationConceptDraftPreview } from "../../../../components/FoundationConceptDraftPreview";
import { foundationGenerationRetrievalBuildDraft, foundationGenerationRetrievalIntroPreview } from "../../../../fixtures/course-builder/foundation-batch-a";

export const dynamic = "force-static";

export default function Page() {
  return (
    <FoundationConceptDraftPreview
      buildDraft={foundationGenerationRetrievalBuildDraft}
      introPreview={foundationGenerationRetrievalIntroPreview}
      duration="约 15 分钟"
      reviewItems={["生成 / 检索 / 确定性规则的分工是否直观？","邮件、政策、折扣、权限这些场景是否贴近真实工作？","有没有提前把 RAG / Tool / Workflow 讲成新主知识？","完成后你能否先判断任务该“生成、查、算还是组合”？"]}
    />
  );
}
