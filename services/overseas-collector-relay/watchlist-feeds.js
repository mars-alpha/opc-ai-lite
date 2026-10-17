// Transport allowlist only. Source identities/configuration remain in Source Management.
export const WATCHLIST_FEED_POLICY_VERSION="watchlist-fixed-feeds-v2";
// Publisher migration verified from the legacy feed and the direct canonical response.
// This is one logical Source and one upstream, not independent fallback capacity.
export const WATCHLIST_FEED_MIGRATIONS=[
 {sourceId:"source_radar_official_langchain_blog",from:"https://blog.langchain.com/rss.xml",to:"https://www.langchain.com/blog/rss.xml"},
 {sourceId:"source_radar_opml_baoyu",from:"https://baoyu.io/feed.xml",to:"https://s.baoyu.io/feed.xml"}
];
export const WATCHLIST_FEEDS=[
 {sourceId:"source_radar_official_openai",urls:["https://openai.com/news/rss.xml"]},
 {sourceId:"source_radar_official_google_ai",urls:["https://blog.google/innovation-and-ai/technology/ai/rss/","https://blog.google/rss/"]},
 {sourceId:"source_radar_official_aws_ml",urls:["https://aws.amazon.com/blogs/machine-learning/feed/"]},
 {sourceId:"source_radar_official_langchain_blog",urls:["https://blog.langchain.com/rss.xml"]},
 {sourceId:"source_radar_official_ollama_blog",urls:["https://ollama.com/blog/rss.xml"]},
 {sourceId:"source_radar_official_qwen_blog",urls:["https://qwenlm.github.io/blog/index.xml"]},
 {sourceId:"source_radar_research_bair",urls:["https://bair.berkeley.edu/blog/feed.xml"]},
 {sourceId:"source_radar_research_arxiv_cs_ai",urls:["https://export.arxiv.org/api/query?search_query=cat%3Acs.AI&sortBy=submittedDate&sortOrder=descending&max_results=20"]},
 {sourceId:"source_radar_creator_n8n_blog",urls:["https://blog.n8n.io/rss/"]},
 {sourceId:"source_radar_opml_baoyu",urls:["https://baoyu.io/feed.xml"]},
 {sourceId:"source_radar_creator_latent_space",urls:["https://www.latent.space/feed"]},
 {sourceId:"source_radar_creator_ml_mastery",urls:["https://machinelearningmastery.com/feed/"]}
];
const allowed=new Set([...WATCHLIST_FEEDS.flatMap(entry=>entry.urls),...WATCHLIST_FEED_MIGRATIONS.map(entry=>entry.to)]);
export function fixedWatchlistFeedUrl(input){
 try{const url=new URL(input);return url.protocol==="https:" && !url.username && !url.password && !url.port && allowed.has(url.href)?url.href:null;}catch{return null;}
}
export function watchlistFeedFetchUrl(input){
 const url=fixedWatchlistFeedUrl(input);if(!url)return null;
 return WATCHLIST_FEED_MIGRATIONS.find(entry=>entry.from===url)?.to??url;
}
