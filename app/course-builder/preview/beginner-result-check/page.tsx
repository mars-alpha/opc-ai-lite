import { BeginnerFoundationDraftPreview } from "../../../../components/BeginnerFoundationDraftPreview";
import {
  beginnerResultCheckDraft,
  beginnerResultCheckIntro,
  beginnerResultCheckKnowledgeDepth,
  beginnerResultCheckReferenceFill
} from "../../../../fixtures/course-builder/beginner-foundation-stage2";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={beginnerResultCheckDraft}
      introPreview={beginnerResultCheckIntro}
      knowledgeDepth={beginnerResultCheckKnowledgeDepth}
      referenceFill={beginnerResultCheckReferenceFill}
      skillVersion="0.2.0"
      batchLabel="Foundation Stage 2"
      duration="约 16 分钟"
      reviewItems={[
        "是否能自然区分低风险创意和高风险事实？",
        "Check 是否像真实使用判断，而不是可靠性知识考试？",
        "Practice 是否能产出一个具体检查动作？",
        "是否没有提前进入正式 Evaluation Framework？"
      ]}
    />
  );
}
