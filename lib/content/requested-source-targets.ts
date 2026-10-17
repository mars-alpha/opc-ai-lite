/** Operator-requested discovery targets, not a Source seed or authority policy. */
import {CURATED_PUBLISHER_FEEDS} from "../../services/overseas-collector-relay/curated-publisher-feeds";
export type RequestedSourceLane="EDITORIAL_CANDIDATE"|"DISCUSSION_SIGNAL";
export const REQUESTED_SOURCE_TARGETS:Array<{key:string;name:string;lane:RequestedSourceLane;identityUrls:string[]}>=[
 ...([
  ["pytorch","PyTorch Blog"],
  ["baseten","Baseten 工程博客","https://www.baseten.co/blog/"],
  ["huggingface","Hugging Face 官方团队博客","https://huggingface.co/blog","https://huggingface.co/blog/feed.xml"],
  ["lmsys","LMSYS Blog","https://www.lmsys.org/blog/"],
  ["apple_ml","Apple Machine Learning Research"],
  ["modal","Modal 官方工程博客"],
  ["together","Together AI 研究与产品博客"],
  ["vllm","vLLM 官方博客"],
  ["nvidia_technical","NVIDIA Technical Blog：Agentic AI / Generative AI","https://developer.nvidia.com/blog/"],
  ["artificial_analysis","Artificial Analysis","https://artificialanalysis.ai/"],
  ["arena","Arena","https://arena.ai/"],
  ["openrouter","OpenRouter","https://openrouter.ai/"],
  ["unsloth","Unsloth","https://unsloth.ai/blog"],
  ["clement_delangue","Clément Delangue"],
  ["david_singleton","David Singleton"],
  ["marktechpost","MarkTechPost","https://www.marktechpost.com/"],
  ["ithome_ai","IT之家·人工智能","https://www.ithome.com/"],
  ["rohan_paul","Rohan Paul"],
  ["techcrunch_ai","TechCrunch：AI","https://techcrunch.com/category/artificial-intelligence/","https://techcrunch.com/category/artificial-intelligence/feed/"],
  ["decoder","The Decoder：AI News","https://the-decoder.com/","https://the-decoder.com/feed/"],
  ["verge_ai","The Verge：AI","https://www.theverge.com/ai-artificial-intelligence","https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"],
  ["nathan_lambert","Nathan Lambert"],
  ["yuchen_jin","Yuchen Jin"],
  ["testing_catalog","Testing Catalog","https://www.testingcatalog.com/"]
 ] as string[][]).map(([key,name,...hints])=>{const publisher=CURATED_PUBLISHER_FEEDS.find(p=>p.key===key);return {key:"requested_"+key,name,lane:"EDITORIAL_CANDIDATE" as const,identityUrls:publisher?[...new Set([publisher.home,publisher.listing,publisher.feed])]:hints};}),
 ...([
  ["alexandr_wang","Alexandr Wang"],
  ["webrazzi","Webrazzi","https://webrazzi.com/"],
  ["mark_k","@mark_k"],
  ["sanyi","三易生活","https://www.3elife.net/"],
  ["t3n","t3n","https://t3n.de/"],
  ["heise","heise online","https://www.heise.de/"],
  ["silicon_republic","Silicon Republic","https://www.siliconrepublic.com/"],
  ["gihyo","gihyo.jp","https://gihyo.jp/"],
  ["netease_tech","网易科技","https://tech.163.com/"],
  ["cnbeta","cnBeta","https://www.cnbeta.com.tw/"],
  ["analytics_india","Analytics India Magazine","https://analyticsindiamag.com/"],
  ["dev_community","DEV Community","https://dev.to/"],
  ["semianalysis","SemiAnalysis","https://semianalysis.com/"],
  ["36kr_ai","36氪·AI","https://36kr.com/"],
  ["huxiu","虎嗅","https://www.huxiu.com/"]
 ] as string[][]).map(([key,name,...identityUrls])=>({key:"requested_"+key,name,lane:"DISCUSSION_SIGNAL" as const,identityUrls}))
];
