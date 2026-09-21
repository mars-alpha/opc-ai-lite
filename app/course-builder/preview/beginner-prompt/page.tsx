import { BeginnerFoundationDraftPreview } from "../../../../components/BeginnerFoundationDraftPreview";
import {
  beginnerPromptDraft,
  beginnerPromptIntro,
  beginnerPromptKnowledgeDepth,
  beginnerPromptReferenceFill
} from "../../../../fixtures/course-builder/beginner-foundation-stage2";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={beginnerPromptDraft}
      introPreview={beginnerPromptIntro}
      knowledgeDepth={beginnerPromptKnowledgeDepth}
      referenceFill={beginnerPromptReferenceFill}
      skillVersion="0.2.0"
      batchLabel="Foundation Stage 2"
      duration="约 16 分钟"
      reviewItems={[
        "是否把 Prompt 讲成“把任务说清楚”，而不是万能模板？",
        "Before / After 是否只改变必要信息，反差够明显？",
        "Practice 是否能让零基础用户独立写出一个可执行任务？",
        "是否没有提前讲 Context Window、模型机制或 Prompt Engineering？"
      ]}
    />
  );
}
