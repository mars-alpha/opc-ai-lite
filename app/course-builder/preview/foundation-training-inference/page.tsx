import { FoundationConceptDraftPreview } from "../../../../components/FoundationConceptDraftPreview";
import { foundationTrainingInferenceBuildDraft, foundationTrainingInferenceIntroPreview } from "../../../../fixtures/course-builder/foundation-batch-a";

export const dynamic = "force-static";

export default function Page() {
  return (
    <FoundationConceptDraftPreview
      buildDraft={foundationTrainingInferenceBuildDraft}
      introPreview={foundationTrainingInferenceIntroPreview}
      duration="约 12 分钟"
      reviewItems={["Training 与 Inference 是否不用技术背景也能分清？","上传文件不是重新训练这个例子是否有效？","Fine-tuning 是否只点到为止，没有增加负担？","完成后你是否不会再把 Context / Memory 都叫成训练？"]}
    />
  );
}
