/** Original publisher declarations verified 2026-10-16. Transport only, never Source seeds. */
export const CURATED_PUBLISHER_FEEDS=[
 {key:"pytorch",home:"https://pytorch.org/",listing:"https://pytorch.org/blog/",feed:"https://pytorch.org/feed/",article:/^\/blog\/[a-z0-9-]+\/$/},
 {key:"modal",home:"https://modal.com/",listing:"https://modal.com/blog",feed:"https://modal.com/blog/atom.xml",article:/^\/blog\/[a-z0-9-]+$/},
 {key:"apple_ml",home:"https://machinelearning.apple.com/",listing:"https://machinelearning.apple.com/",feed:"https://machinelearning.apple.com/rss.xml",article:/^\/research\/[a-z0-9-]+$/},
 {key:"together",home:"https://www.together.ai/",listing:"https://www.together.ai/blog",feed:"https://www.together.ai/blog/rss.xml",article:/^\/blog\/[a-z0-9-]+$/},
 {key:"vllm",home:"https://vllm.ai/",listing:"https://vllm.ai/blog",feed:"https://vllm.ai/blog/rss.xml",article:/^\/blog\/[a-z0-9-]+$/}
];
export function curatedPublisherRoute(input){
 try{
  const u=new URL(input);
  if(u.protocol!=="https:" || u.port || u.username || u.password || u.search || u.hash || u.pathname.length>300 || /%/.test(u.pathname))return null;
  const publisher=CURATED_PUBLISHER_FEEDS.find(p=>new URL(p.home).origin===u.origin);
  if(!publisher)return null;
  if([publisher.home,publisher.listing,publisher.feed].includes(u.href))return {url:u.href,kind:u.href===publisher.feed?"FEED":"INDEX"};
  return publisher.article.test(u.pathname)?{url:u.href,kind:"ARTICLE"}:null;
 }catch{return null;}
}
export function curatedPublisherFeed(input){
 const route=curatedPublisherRoute(input);
 return route?.kind==="INDEX"?CURATED_PUBLISHER_FEEDS.find(p=>new URL(p.home).origin===new URL(route.url).origin)?.feed??null:null;
}
