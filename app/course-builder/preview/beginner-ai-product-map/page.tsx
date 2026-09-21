import { BeginnerFoundationDraftPreview } from "../../../../components/BeginnerFoundationDraftPreview";
import {
  beginnerAiProductMapDraft,
  beginnerAiProductMapIntro,
  beginnerAiProductMapKnowledgeDepth
} from "../../../../fixtures/course-builder/beginner-foundation-batch-a";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={beginnerAiProductMapDraft}
      introPreview={beginnerAiProductMapIntro}
      knowledgeDepth={beginnerAiProductMapKnowledgeDepth}
      duration="约 12 分钟"
      reviewItems={[
        "Model 是否只作为一个必要新词出现，而不是一整套系统架构？",
        "搜索、文件、记忆的关系是否看一遍就有位置感？",
        "有没有提前讲 API / Tool / RAG 等后续概念？",
        "学完后是否觉得地图更清楚，而不是多记了一堆术语？"
      ]}
    />
  );
}
