import { BeginnerFoundationDraftPreview } from "../../../../components/BeginnerFoundationDraftPreview";
import {
  beginnerAiCanBeWrongDraft,
  beginnerAiCanBeWrongIntro,
  beginnerAiCanBeWrongKnowledgeDepth
} from "../../../../fixtures/course-builder/beginner-foundation-batch-a";

export const dynamic = "force-static";

export default function Page() {
  return (
    <BeginnerFoundationDraftPreview
      buildDraft={beginnerAiCanBeWrongDraft}
      introPreview={beginnerAiCanBeWrongIntro}
      knowledgeDepth={beginnerAiCanBeWrongKnowledgeDepth}
      duration="约 12 分钟"
      reviewItems={[
        "是否只讲清“为什么要检查”，而没有掉进模型生成原理？",
        "事实、数字、日期、最新信息这些例子是否足够生活化？",
        "三道题是在判断风险，而不是背“幻觉”定义吗？",
        "学完后是否知道什么时候可以参考、什么时候一定要核实？"
      ]}
    />
  );
}
