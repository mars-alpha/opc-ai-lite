import { BeginnerFoundationDraftPreview } from "../../../../components/BeginnerFoundationDraftPreview";
import { beginnerAiUseCasesDraft, beginnerAiUseCasesIntro } from "../../../../fixtures/course-builder/beginner-foundation-batch-a";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={beginnerAiUseCasesDraft}
      introPreview={beginnerAiUseCasesIntro}
      duration="约 12 分钟"
      reviewItems={[
        "完全不懂 AI 的人，第一屏能不能马上知道这课和自己有什么关系？",
        "有没有出现不必要的技术名词或分类负担？",
        "练习是不是足够轻，但能让人真的找到自己的第一个使用场景？",
        "学完后会不会产生“原来我今天就能开始用”的感觉？"
      ]}
    />
  );
}
