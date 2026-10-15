export const RADAR_SOURCE_PORTFOLIO_VERSION = "bole-radar-v5-aihot-gap-fill";

export type RadarPortfolioSourceType =
  | "OFFICIAL"
  | "MEDIA"
  | "RESEARCH"
  | "DEVELOPER"
  | "SOCIAL";

export type RadarPortfolioEntry = {
  key: string;
  sourceId: string;
  name: string;
  group:
    | "Official AI Updates"
    | "Curated Media"
    | "Follow Builders"
    | "AI HOT"
    | "Hacker News"
    | "GitHub Trending"
    | "Product Hunt"
    | "OPML RSS";
  sourceType: RadarPortfolioSourceType;
  platform: string;
  collectionMethod: "RSS" | "ATOM" | "TREND" | "API" | "SITEMAP";
  canonicalUrl: string | null;
  providerRef: string;
  priority: number;
  freshnessHours: number;
  fallbackWindowHours: number;
  contentTypes: readonly string[];
  acquisition: {
    routes: ReadonlyArray<{
      id: string;
      role: "PRIMARY" | "FALLBACK";
      kind: "RSS_ATOM" | "SITEMAP" | "TREND_DISCOVERY" | "PUBLIC_GENERATED_FEED" | "PUBLIC_JSON_API";
      url?: string;
      runtimeOwner?: string;
      costLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
    }>;
    // Legacy mirror retained during SOURCE-ACQUISITION-ROUTING-004 migration.
    kind: "RSS_ATOM" | "SITEMAP" | "TREND_DISCOVERY" | "PUBLIC_GENERATED_FEED" | "PUBLIC_JSON_API";
    url?: string;
    runtimeOwner?: string;
  };
  policyManaged: boolean;
  factualSource: boolean;
  signalSource: boolean;
  referenceOnly?: boolean;
  coverage?: {
    sourceUniverseRole?: "OFFICIAL" | "PROFESSIONAL_MEDIA" | "RESEARCH" | "CREATOR" | "DEVELOPER_COMMUNITY" | "DISCOVERY_AGGREGATOR" | "SOCIAL";
    evidenceRoles?: Array<"PRIMARY_FACT" | "MEDIA_CONFIRMATION" | "ANALYSIS" | "BENCHMARK" | "TUTORIAL" | "EXPERIENCE" | "ADOPTION" | "SOCIAL_SIGNAL" | "DEMAND_SIGNAL">;
    languageScope?: "ZH" | "EN" | "MIXED";
  };
  keywordPolicy?: {
    mustIncludeAny?: string[];
    excludeAny?: string[];
  };
};

const acquisition = (
  kind: RadarPortfolioEntry["acquisition"]["kind"],
  url?: string,
  runtimeOwner?: string,
  costLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH" =
    kind === "RSS_ATOM" || kind === "PUBLIC_JSON_API" ? "LOW" : "MEDIUM"
): RadarPortfolioEntry["acquisition"] => ({
  routes: [{
    id: "primary",
    role: "PRIMARY",
    kind,
    ...(url ? { url } : {}),
    ...(runtimeOwner ? { runtimeOwner } : {}),
    costLevel
  }],
  kind,
  ...(url ? { url } : {}),
  ...(runtimeOwner ? { runtimeOwner } : {})
});

const acquisitionWithFallback = (
  kind: RadarPortfolioEntry["acquisition"]["kind"],
  primaryUrl: string,
  fallbackUrl: string
): RadarPortfolioEntry["acquisition"] => ({
  routes: [
    { id: "primary", role: "PRIMARY", kind, url: primaryUrl, costLevel: "LOW" },
    { id: "fallback-official-feed", role: "FALLBACK", kind, url: fallbackUrl, costLevel: "LOW" }
  ],
  kind,
  url: primaryUrl
});

const rss = (
  key: string,
  name: string,
  group: RadarPortfolioEntry["group"],
  sourceType: RadarPortfolioSourceType,
  url: string,
  providerRef: string,
  priority: number,
  contentTypes: readonly string[],
  options: Partial<Pick<RadarPortfolioEntry, "factualSource" | "signalSource" | "referenceOnly" | "keywordPolicy" | "platform" | "coverage">> = {}
): RadarPortfolioEntry => ({
  key,
  sourceId: "source_radar_" + key,
  name,
  group,
  sourceType,
  platform: options.platform ?? "WEB",
  collectionMethod: url.endsWith(".atom") ? "ATOM" : "RSS",
  canonicalUrl: url,
  providerRef,
  priority,
  freshnessHours: sourceType === "RESEARCH" ? 168 : 96,
  fallbackWindowHours: sourceType === "RESEARCH" ? 336 : 168,
  contentTypes,
  acquisition: acquisition("RSS_ATOM", url),
  policyManaged: true,
  factualSource: options.factualSource ?? ["OFFICIAL", "MEDIA", "RESEARCH"].includes(sourceType),
  signalSource: options.signalSource ?? true,
  referenceOnly: options.referenceOnly ?? ["DEVELOPER", "SOCIAL"].includes(sourceType),
  coverage: options.coverage,
  keywordPolicy: options.keywordPolicy
});

const sitemap = (
  key: string,
  name: string,
  group: RadarPortfolioEntry["group"],
  sourceType: RadarPortfolioSourceType,
  canonicalUrl: string,
  sitemapUrl: string,
  providerRef: string,
  priority: number,
  contentTypes: readonly string[],
  options: Partial<Pick<RadarPortfolioEntry, "factualSource" | "signalSource" | "referenceOnly" | "keywordPolicy" | "platform" | "coverage">> = {}
): RadarPortfolioEntry => ({
  key,
  sourceId: "source_radar_" + key,
  name,
  group,
  sourceType,
  platform: options.platform ?? "WEB",
  collectionMethod: "SITEMAP",
  canonicalUrl,
  providerRef,
  priority,
  freshnessHours: 96,
  fallbackWindowHours: 168,
  contentTypes,
  acquisition: acquisition("SITEMAP", sitemapUrl),
  policyManaged: true,
  factualSource: options.factualSource ?? ["OFFICIAL", "MEDIA", "RESEARCH"].includes(sourceType),
  signalSource: options.signalSource ?? true,
  referenceOnly: options.referenceOnly ?? false,
  coverage: options.coverage,
  keywordPolicy: options.keywordPolicy
});

export const RADAR_SOURCE_PORTFOLIO: readonly RadarPortfolioEntry[] = [
  rss("official_openai","OpenAI News","Official AI Updates","OFFICIAL","https://openai.com/news/rss.xml","RADAR_OFFICIAL_OPENAI",100,["OFFICIAL_ANNOUNCEMENT","CHANGELOG"]),
  rss("official_deepmind","Google DeepMind","Official AI Updates","OFFICIAL","https://deepmind.google/blog/rss.xml","RADAR_OFFICIAL_DEEPMIND",99,["OFFICIAL_ANNOUNCEMENT","RESEARCH_PAPER"]),
  {
    ...rss("official_google_ai","Google AI Blog","Official AI Updates","OFFICIAL","https://blog.google/innovation-and-ai/technology/ai/rss/","RADAR_OFFICIAL_GOOGLE_AI",98,["OFFICIAL_ANNOUNCEMENT"],{
      keywordPolicy:{mustIncludeAny:["ai","artificial intelligence","gemini","deepmind","machine learning","generative ai","agent","llm","google ai"]}
    }),
    acquisition: acquisitionWithFallback("RSS_ATOM","https://blog.google/innovation-and-ai/technology/ai/rss/","https://blog.google/rss/")
  },
  rss("official_aws_ml","AWS Machine Learning Blog","Official AI Updates","OFFICIAL","https://aws.amazon.com/blogs/machine-learning/feed/","RADAR_OFFICIAL_AWS_ML",96,["OFFICIAL_ANNOUNCEMENT","NEWS_ARTICLE"],{platform:"AWS"}),
  rss("official_github_ai","GitHub AI & ML","Official AI Updates","OFFICIAL","https://github.blog/ai-and-ml/feed/","RADAR_OFFICIAL_GITHUB_AI",96,["OFFICIAL_ANNOUNCEMENT","NEWS_ARTICLE"]),
  rss("official_github_changelog","GitHub Changelog","Official AI Updates","OFFICIAL","https://github.blog/changelog/feed/","RADAR_OFFICIAL_GITHUB_CHANGELOG",94,["CHANGELOG"],{
    keywordPolicy:{mustIncludeAny:["ai","artificial intelligence","copilot","agent","models","model","github spark","github models"]}
  }),
  sitemap("official_cohere","Cohere Blog","Official AI Updates","OFFICIAL","https://cohere.com/blog","https://cohere.com/sitemap.xml","RADAR_OFFICIAL_COHERE",95,["OFFICIAL_ANNOUNCEMENT","RESEARCH_PAPER","TUTORIAL"],{
    platform:"COHERE",
    coverage:{sourceUniverseRole:"OFFICIAL",evidenceRoles:["PRIMARY_FACT","ANALYSIS","TUTORIAL"],languageScope:"EN"}
  }),
  rss("official_cloudflare_ai","Cloudflare AI","Official AI Updates","OFFICIAL","https://blog.cloudflare.com/tag/ai/rss","RADAR_OFFICIAL_CLOUDFLARE_AI",94,["OFFICIAL_ANNOUNCEMENT","CHANGELOG","TUTORIAL"],{
    platform:"CLOUDFLARE",
    coverage:{sourceUniverseRole:"OFFICIAL",evidenceRoles:["PRIMARY_FACT","TUTORIAL","EXPERIENCE"],languageScope:"EN"}
  }),
  rss("official_langchain_blog","LangChain Blog","Official AI Updates","OFFICIAL","https://blog.langchain.com/rss.xml","RADAR_OFFICIAL_LANGCHAIN",93,["OFFICIAL_ANNOUNCEMENT","TUTORIAL","EXPERIENCE"],{
    platform:"LANGCHAIN",
    coverage:{sourceUniverseRole:"OFFICIAL",evidenceRoles:["PRIMARY_FACT","TUTORIAL","EXPERIENCE"],languageScope:"EN"}
  }),
  rss("official_ollama_blog","Ollama Blog","Official AI Updates","OFFICIAL","https://ollama.com/blog/rss.xml","RADAR_OFFICIAL_OLLAMA",93,["OFFICIAL_ANNOUNCEMENT","TUTORIAL","EXPERIENCE"],{
    platform:"OLLAMA",
    coverage:{sourceUniverseRole:"OFFICIAL",evidenceRoles:["PRIMARY_FACT","TUTORIAL","EXPERIENCE"],languageScope:"EN"}
  }),
  rss("official_openrouter_blog","OpenRouter Blog","Official AI Updates","OFFICIAL","https://openrouter.ai/blog/feed.xml","RADAR_OFFICIAL_OPENROUTER",92,["OFFICIAL_ANNOUNCEMENT","NEWS_ARTICLE","TUTORIAL"],{
    platform:"OPENROUTER",
    coverage:{sourceUniverseRole:"OFFICIAL",evidenceRoles:["PRIMARY_FACT","ANALYSIS","TUTORIAL","ADOPTION"],languageScope:"EN"}
  }),
  sitemap("official_together_ai","Together AI Blog","Official AI Updates","OFFICIAL","https://www.together.ai/blog","https://www.together.ai/sitemap.xml","RADAR_OFFICIAL_TOGETHER_AI",91,["OFFICIAL_ANNOUNCEMENT","NEWS_ARTICLE","TUTORIAL"],{
    platform:"TOGETHER_AI",
    coverage:{sourceUniverseRole:"OFFICIAL",evidenceRoles:["PRIMARY_FACT","ANALYSIS","TUTORIAL"],languageScope:"EN"}
  }),
  sitemap("official_fireworks_ai","Fireworks AI Blog","Official AI Updates","OFFICIAL","https://fireworks.ai/blog","https://fireworks.ai/sitemap.xml","RADAR_OFFICIAL_FIREWORKS_AI",91,["OFFICIAL_ANNOUNCEMENT","NEWS_ARTICLE","TUTORIAL"],{
    platform:"FIREWORKS_AI",
    coverage:{sourceUniverseRole:"OFFICIAL",evidenceRoles:["PRIMARY_FACT","ANALYSIS","BENCHMARK","TUTORIAL"],languageScope:"EN"}
  }),
  rss("official_qwen_blog","Qwen Blog","Official AI Updates","OFFICIAL","https://qwenlm.github.io/blog/index.xml","RADAR_OFFICIAL_QWEN",95,["OFFICIAL_ANNOUNCEMENT","RESEARCH_PAPER","TUTORIAL","EXPERIENCE"],{
    platform:"QWEN",
    coverage:{sourceUniverseRole:"OFFICIAL",evidenceRoles:["PRIMARY_FACT","ANALYSIS","BENCHMARK","TUTORIAL","EXPERIENCE","ADOPTION"],languageScope:"MIXED"}
  }),
  rss("media_decoder","The Decoder AI News","Curated Media","MEDIA","https://the-decoder.com/feed/","RADAR_MEDIA_DECODER",88,["NEWS_ARTICLE"]),
  rss("media_techcrunch_ai","TechCrunch AI","Curated Media","MEDIA","https://techcrunch.com/category/artificial-intelligence/feed/","RADAR_MEDIA_TECHCRUNCH_AI",90,["NEWS_ARTICLE"]),
  rss("media_ars_ai","Ars Technica AI","Curated Media","MEDIA","https://arstechnica.com/ai/feed/","RADAR_MEDIA_ARS_AI",90,["NEWS_ARTICLE"]),
  rss("media_mit_tech_review_ai","MIT Technology Review AI","Curated Media","MEDIA","https://www.technologyreview.com/topic/artificial-intelligence/feed/","RADAR_MEDIA_MIT_TECH_REVIEW_AI",91,["NEWS_ARTICLE"]),
  rss("media_qbitai","量子位","Curated Media","MEDIA","https://www.qbitai.com/feed","RADAR_MEDIA_QBITAI",90,["NEWS_ARTICLE"],{coverage:{sourceUniverseRole:"PROFESSIONAL_MEDIA",evidenceRoles:["MEDIA_CONFIRMATION","ANALYSIS"],languageScope:"ZH"}}),
  rss("media_geekpark","极客公园 · AI Filter","Curated Media","MEDIA","https://www.geekpark.net/rss","RADAR_MEDIA_GEEKPARK",80,["NEWS_ARTICLE"],{coverage:{languageScope:"ZH"},keywordPolicy:{mustIncludeAny:["ai","人工智能","大模型","模型","智能体","agent","llm","openai","anthropic","claude","chatgpt","gemini","deepseek","智谱","kimi","字节","豆包"]}}),
  rss("media_ifanr","爱范儿 · AI Filter","Curated Media","MEDIA","https://www.ifanr.com/feed","RADAR_MEDIA_IFANR",78,["NEWS_ARTICLE"],{coverage:{languageScope:"ZH"},keywordPolicy:{mustIncludeAny:["ai","人工智能","大模型","模型","智能体","agent","llm","openai","anthropic","claude","chatgpt","gemini","deepseek","智谱","kimi","豆包"]}}),
  rss("media_sspai","少数派 · AI Filter","Curated Media","MEDIA","https://sspai.com/feed","RADAR_MEDIA_SSPAI",78,["NEWS_ARTICLE"],{coverage:{sourceUniverseRole:"PROFESSIONAL_MEDIA",evidenceRoles:["MEDIA_CONFIRMATION","ANALYSIS","TUTORIAL","EXPERIENCE"],languageScope:"ZH"},keywordPolicy:{mustIncludeAny:["ai","人工智能","大模型","模型","智能体","agent","llm","openai","anthropic","claude","chatgpt","gemini","deepseek","智谱","kimi","豆包"]}}),
  rss("media_verge","The Verge · AI Filter","Curated Media","MEDIA","https://www.theverge.com/rss/index.xml","RADAR_MEDIA_VERGE_AI",82,["NEWS_ARTICLE"],{
    keywordPolicy:{mustIncludeAny:["ai","artificial intelligence","openai","anthropic","claude","chatgpt","gpt","gemini","llm","agent","copilot"]}
  }),
  rss("media_marktechpost","MarkTechPost Research","Curated Media","RESEARCH","https://www.marktechpost.com/feed/","RADAR_MEDIA_MARKTECHPOST",80,["RESEARCH_PAPER"],{
    keywordPolicy:{mustIncludeAny:["paper","research","arxiv","benchmark","dataset","model","llm","agent","diffusion","transformer","multimodal","reasoning","inference","training","open-source"]}
  }),
  {
    key:"ai_hot",sourceId:"source_radar_ai_hot",name:"AI HOT",group:"AI HOT",
    sourceType:"MEDIA",platform:"AI_HOT",collectionMethod:"API",canonicalUrl:"https://aihot.virxact.com/api/public/items",
    providerRef:"RADAR_AI_HOT",priority:86,freshnessHours:72,fallbackWindowHours:168,contentTypes:["NEWS_ARTICLE","RESEARCH_PAPER","PRODUCT_LISTING"],
    acquisition:acquisition("PUBLIC_JSON_API","https://aihot.virxact.com/api/public/items","RADAR_AI_HOT","LOW"),
    policyManaged:true,factualSource:false,signalSource:true,referenceOnly:true,
    coverage:{sourceUniverseRole:"DISCOVERY_AGGREGATOR",evidenceRoles:["SOCIAL_SIGNAL"],languageScope:"MIXED"}
  },
  {
    key:"dailyhot_domestic",sourceId:"source_radar_dailyhot_domestic",name:"国内综合热点",group:"AI HOT",
    sourceType:"SOCIAL",platform:"DAILYHOT",collectionMethod:"TREND",canonicalUrl:null,providerRef:"DAILYHOT_DOMESTIC",
    priority:74,freshnessHours:24,fallbackWindowHours:72,contentTypes:["RANKING_ITEM","SOCIAL_POST","NEWS_ARTICLE"],
    acquisition:acquisition("TREND_DISCOVERY"),policyManaged:true,factualSource:false,signalSource:true,referenceOnly:true,
    coverage:{sourceUniverseRole:"DISCOVERY_AGGREGATOR",evidenceRoles:["SOCIAL_SIGNAL","DEMAND_SIGNAL"],languageScope:"ZH"}
  },
  {
    key:"hacker_news",sourceId:"source_radar_hacker_news",name:"Hacker News · AI",group:"Hacker News",
    sourceType:"DEVELOPER",platform:"HACKER_NEWS",collectionMethod:"TREND",canonicalUrl:null,providerRef:"RADAR_TREND_HN_TOP",
    priority:70,freshnessHours:48,fallbackWindowHours:72,contentTypes:["SOCIAL_POST","RANKING_ITEM"],
    acquisition:acquisition("TREND_DISCOVERY"),policyManaged:true,factualSource:false,signalSource:true,referenceOnly:true,
    coverage:{sourceUniverseRole:"DEVELOPER_COMMUNITY",evidenceRoles:["ADOPTION","SOCIAL_SIGNAL"],languageScope:"EN"}
  },
  {
    key:"github_trending",sourceId:"source_radar_github_trending",name:"GitHub Trending · AI",group:"GitHub Trending",
    sourceType:"DEVELOPER",platform:"GITHUB",collectionMethod:"TREND",canonicalUrl:null,providerRef:"RADAR_TREND_GITHUB",
    priority:76,freshnessHours:48,fallbackWindowHours:96,contentTypes:["TRENDING_REPO","REPO_RELEASE"],
    acquisition:acquisition("TREND_DISCOVERY"),policyManaged:true,factualSource:false,signalSource:true,referenceOnly:true,
    coverage:{sourceUniverseRole:"DEVELOPER_COMMUNITY",evidenceRoles:["ADOPTION","SOCIAL_SIGNAL"],languageScope:"EN"}
  },
  rss("product_hunt","Product Hunt","Product Hunt","SOCIAL","https://www.producthunt.com/feed","RADAR_PRODUCT_HUNT",70,["PRODUCT_LISTING"],{factualSource:false,referenceOnly:true,platform:"PRODUCT_HUNT",coverage:{sourceUniverseRole:"DISCOVERY_AGGREGATOR",evidenceRoles:["ADOPTION","SOCIAL_SIGNAL"],languageScope:"EN"}}),

  rss("opml_microsoft_ai","Microsoft AI Blog","OPML RSS","OFFICIAL","https://news.microsoft.com/source/topics/ai/feed/","RADAR_OPML_MICROSOFT_AI",92,["OFFICIAL_ANNOUNCEMENT"]),
  rss("opml_nvidia_genai","NVIDIA Generative AI","OPML RSS","OFFICIAL","https://developer.nvidia.com/blog/category/generative-ai/feed/","RADAR_OPML_NVIDIA_GENAI",91,["OFFICIAL_ANNOUNCEMENT","NEWS_ARTICLE"]),
  rss("opml_wired_ai","Wired AI","OPML RSS","MEDIA","https://www.wired.com/feed/tag/ai/latest/rss","RADAR_OPML_WIRED_AI",82,["NEWS_ARTICLE"]),
  rss("opml_infoq_cn","InfoQ CN","OPML RSS","MEDIA","https://www.infoq.cn/feed","RADAR_OPML_INFOQ_CN",82,["NEWS_ARTICLE"],{coverage:{languageScope:"ZH"}}),
  rss("opml_baoyu","宝玉","OPML RSS","DEVELOPER","https://baoyu.io/feed.xml","RADAR_OPML_BAOYU",78,["NEWS_ARTICLE"],{factualSource:false,referenceOnly:true,coverage:{sourceUniverseRole:"CREATOR",evidenceRoles:["ANALYSIS","EXPERIENCE","TUTORIAL","ADOPTION"],languageScope:"ZH"}}),
  rss("opml_simon_willison","Simon Willison","OPML RSS","DEVELOPER","https://simonwillison.net/atom/everything/","RADAR_OPML_SIMON_WILLISON",80,["NEWS_ARTICLE"],{factualSource:false,referenceOnly:true,coverage:{sourceUniverseRole:"CREATOR",evidenceRoles:["ANALYSIS","EXPERIENCE","TUTORIAL","ADOPTION"],languageScope:"EN"}}),
  rss("research_arxiv_cs_ai","arXiv cs.AI Recent","OPML RSS","RESEARCH","https://export.arxiv.org/api/query?search_query=cat%3Acs.AI&sortBy=submittedDate&sortOrder=descending&max_results=20","RADAR_RESEARCH_ARXIV_CS_AI",86,["RESEARCH_PAPER"],{
    platform:"ARXIV",
    coverage:{sourceUniverseRole:"RESEARCH",evidenceRoles:["ANALYSIS","BENCHMARK"],languageScope:"EN"}
  }),
  rss("research_bair","Berkeley AI Research","OPML RSS","RESEARCH","https://bair.berkeley.edu/blog/feed.xml","RADAR_RESEARCH_BAIR",84,["RESEARCH_PAPER","NEWS_ARTICLE","TUTORIAL"],{
    platform:"BAIR",
    coverage:{sourceUniverseRole:"RESEARCH",evidenceRoles:["ANALYSIS","BENCHMARK","TUTORIAL"],languageScope:"EN"}
  }),
  rss("creator_latent_space","Latent Space","OPML RSS","DEVELOPER","https://www.latent.space/feed","RADAR_CREATOR_LATENT_SPACE",78,["NEWS_ARTICLE","TUTORIAL","EXPERIENCE"],{
    factualSource:false,referenceOnly:true,platform:"WEB",
    coverage:{sourceUniverseRole:"CREATOR",evidenceRoles:["ANALYSIS","TUTORIAL","EXPERIENCE","ADOPTION"],languageScope:"EN"}
  }),
  rss("official_comfy_blog","Comfy Blog","Official AI Updates","OFFICIAL","https://blog.comfy.org/feed","RADAR_OFFICIAL_COMFY_BLOG",86,["OFFICIAL_ANNOUNCEMENT","TUTORIAL","EXPERIENCE"],{
    coverage:{sourceUniverseRole:"OFFICIAL",evidenceRoles:["PRIMARY_FACT","TUTORIAL","EXPERIENCE","ADOPTION"],languageScope:"EN"}
  }),
  rss("creator_n8n_blog","n8n Workflows Blog","OPML RSS","DEVELOPER","https://blog.n8n.io/rss/","RADAR_CREATOR_N8N_BLOG",80,["TUTORIAL","EXPERIENCE","USE_CASE"],{
    factualSource:false,referenceOnly:true,keywordPolicy:{mustIncludeAny:["ai","agent","mcp","llm","assistant","workflow automation"]},
    coverage:{sourceUniverseRole:"CREATOR",evidenceRoles:["TUTORIAL","EXPERIENCE","ADOPTION"],languageScope:"EN"}
  }),
  rss("creator_ml_mastery","Machine Learning Mastery","OPML RSS","DEVELOPER","https://machinelearningmastery.com/feed/","RADAR_CREATOR_ML_MASTERY",76,["TUTORIAL","EXPERIENCE"],{
    factualSource:false,referenceOnly:true,platform:"WEB",
    coverage:{sourceUniverseRole:"CREATOR",evidenceRoles:["TUTORIAL","EXPERIENCE","ADOPTION"],languageScope:"EN"}
  })
];

export const RADAR_SOURCE_IDS = new Set(RADAR_SOURCE_PORTFOLIO.map((item) => item.sourceId));

export function radarPortfolioEntryBySourceId(sourceId: string) {
  return RADAR_SOURCE_PORTFOLIO.find((item) => item.sourceId === sourceId) ?? null;
}

export const RADAR_OPTIONAL_CAPABILITIES = [
  { key:"dailyhot_domestic", name:"DailyHotApi 国内聚合发现", status:"LIVE_SELF_HOSTED_QUALIFIED", reason:"官方 DailyHotApi 2.0.8 已由 PM2 自托管；017 只启用通过 live qualification 且有边际覆盖价值的 Route，固定为 Discovery Signal。" },
  { key:"ai_breakfast", name:"AI Breakfast", status:"DISABLED_UNSTABLE", reason:"Reference runtime currently returns 403 through Jina." },
  { key:"waytoagi", name:"WaytoAGI", status:"CONDITIONAL", reason:"Requires a dedicated Feishu update-log parser before AUTO." },
  { key:"claude_code_changelog", name:"Claude Code Changelog", status:"DISABLED_UNSTABLE", reason:"GitHub releases Atom recent success rate was 29%; official repository feed.xml is not reachable from the current server network path, so it is excluded from the stable baseline." },
  { key:"huggingface_official", name:"Hugging Face Blog", status:"CONDITIONAL", reason:"Official RSS exists, but the current server network path cannot fetch huggingface.co reliably; keep out of AUTO until live qualification passes." },
  { key:"mistral_official", name:"Mistral AI News", status:"CONDITIONAL", reason:"AIHOT public sample uses the official RSS, but the current server network path cannot fetch mistral.ai reliably; keep out of AUTO until live qualification passes." },
  { key:"google_research", name:"Google Research", status:"CONDITIONAL", reason:"AIHOT public sample uses the official RSS, but the current server network path cannot fetch research.google reliably; keep out of AUTO until live qualification passes." },
  { key:"microsoft_research", name:"Microsoft Research", status:"CONDITIONAL", reason:"Official feed currently returns HTTP 403 from the server path; do not add to the stable baseline until a qualified route exists." },
  { key:"import_ai", name:"Import AI", status:"CONDITIONAL", reason:"Useful creator/research commentary source from the AIHOT public sample, but the current server path cannot fetch the Substack feed reliably." },
  { key:"meta_ai_official", name:"AI at Meta", status:"CONDITIONAL", reason:"High-value first-party gap. The public blog is readable, but no stable RSS/sitemap route has passed current server qualification; register only after a bounded adapter check." },
] as const;
