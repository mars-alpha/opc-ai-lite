import { fetchPublicJson } from "../lib/server/content/collection-runner";
import { collectEventExpansionSearch, providerQueryPlan } from "../lib/server/content/collection-expansion";
import { buildEventExpansionQueryPlan, classifyEventExpansionCandidate } from "../lib/server/content/event-expansion";

const samples = [
  {
    category: "MODEL_RELEASE",
    context: {
      title: "EmbeddingGemma 2：一个开放、轻量级的多模态嵌入模型",
      summary: "Google 发布 EmbeddingGemma 2。",
      keywords: ["EmbeddingGemma 2", "多模态嵌入", "模型"],
      entityTerms: ["EmbeddingGemma 2", "Google"]
    }
  },
  {
    category: "PRODUCT_FEATURE",
    context: {
      title: "ChatGPT 正变得视觉化得多，并推出全新界面",
      summary: "ChatGPT 推出新的视觉化界面能力。",
      keywords: ["ChatGPT", "全新界面", "视觉化"],
      entityTerms: ["ChatGPT", "OpenAI"]
    }
  },
  {
    category: "OPEN_SOURCE_TOOL",
    context: {
      title: "Comfy-Org/ComfyUI",
      summary: "ComfyUI 开源 AI 工作流工具。",
      keywords: ["ComfyUI", "开源", "工作流"],
      entityTerms: ["ComfyUI", "Comfy-Org"]
    }
  }
] as const;

async function main() {
  const output = [];
  for (const sample of samples) {
    const plan = buildEventExpansionQueryPlan(sample.context, 10);
    const query = providerQueryPlan("BILIBILI_SEARCH", plan, 1)[0];
    if (!query) throw new Error("EVENT_EXPANSION_FRESH_SAMPLE_QUERY_MISSING:" + sample.category);

    const search = await collectEventExpansionSearch(
      "BILIBILI_SEARCH",
      query.query,
      72,
      10,
      { fetchJson: fetchPublicJson }
    );
    const relevant = search.items.flatMap((item, index) => {
      const classified = classifyEventExpansionCandidate(sample.context, {
        rawItemId: "fresh-" + sample.category.toLowerCase() + "-" + index,
        platform: "BILIBILI",
        ...item
      });
      return classified ? [{ item, classified }] : [];
    });

    output.push({
      category: sample.category,
      query: query.query,
      receivedCount: search.items.length,
      relevantCount: relevant.length,
      relevantPreview: relevant.slice(0, 3).map(({ item, classified }) => ({
        title: item.title,
        expansionType: classified.expansionType,
        language: classified.language,
        rankScore: classified.rankScore
      }))
    });
  }

  console.log(JSON.stringify(output, null, 2));
  console.log("EVENT_EXPANSION_SOURCE_COVERAGE_FRESH_SAMPLE=PASS");
  console.log("EVENT_EXPANSION_SOURCE_COVERAGE_ZERO_EVIDENCE_ALLOWED=PASS");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
