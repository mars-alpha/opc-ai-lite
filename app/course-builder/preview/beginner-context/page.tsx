import { BeginnerFoundationDraftPreview } from "../../../../components/BeginnerFoundationDraftPreview";
import {
  beginnerContextDraft,
  beginnerContextIntro,
  beginnerContextKnowledgeDepth
} from "../../../../fixtures/course-builder/beginner-foundation-stage2";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={beginnerContextDraft}
      introPreview={beginnerContextIntro}
      knowledgeDepth={beginnerContextKnowledgeDepth}
      skillVersion="0.2.0"
      batchLabel="Foundation Stage 2"
      duration="约 14 分钟"
      reviewItems={[
        "是否能用“AI 这次看到了什么”理解 Context？",
        "是否没有滑向 Token / Context Window 的技术解释？",
        "Concept Step 4 是否只是轻量判断，没有新增 Completion Gate？",
        "学完后是否真的会检查缺失背景？"
      ]}
    />
  );
}
