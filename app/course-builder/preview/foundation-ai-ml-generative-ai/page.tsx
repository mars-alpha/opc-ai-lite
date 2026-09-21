import { FoundationConceptDraftPreview } from "../../../../components/FoundationConceptDraftPreview";
import { foundationAiMlBuildDraft, foundationAiMlIntroPreview } from "../../../../fixtures/course-builder/foundation-batch-a";

export const dynamic = "force-static";

export default function Page() {
  return (
    <FoundationConceptDraftPreview
      buildDraft={foundationAiMlBuildDraft}
      introPreview={foundationAiMlIntroPreview}
      duration="约 12 分钟"
      reviewItems={["第一步能不能一眼看懂“规则 / 判断 / 生成”的差别？","是否避免把 AI 历史和技术细节讲得太重？","三道题是否真的需要理解，而不是看答案就知道？","完成后你能不能给日常功能做基本分类？"]}
    />
  );
}
