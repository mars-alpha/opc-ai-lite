import { FoundationConceptDraftPreview } from "../../../../components/FoundationConceptDraftPreview";
import { foundationModelProductBuildDraft, foundationModelProductIntroPreview } from "../../../../fixtures/course-builder/foundation-batch-a";

export const dynamic = "force-static";

export default function Page() {
  return (
    <FoundationConceptDraftPreview
      buildDraft={foundationModelProductBuildDraft}
      introPreview={foundationModelProductIntroPreview}
      duration="约 12 分钟"
      reviewItems={["Model 和 AI Product 的关系是否足够清楚？","有没有提前把 API / Tool / RAG 讲得太深？","“产品新增搜索 ≠ 模型重新训练互联网”这个直觉是否自然？","完成后你是否更容易理解后续 Memory / Tool / Agent？"]}
    />
  );
}
