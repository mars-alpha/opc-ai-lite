import assert from "node:assert/strict";
import {filterCheapDiscoveryCandidates,filterDiscoveryCandidates} from "../lib/server/content/discovery-filter";
import {declaredFeedUrls,discoverPublicFeed} from "../lib/server/content/public-feed-discovery";
async function main() {
const terms = [{id:"custom",value:"奇点工坊",kind:"INCLUDE" as const},{id:"exclude",value:"抽奖",kind:"EXCLUDE" as const}];
const options = {relevanceTerms:terms,requireExplicitAiRelation:true,sourceType:"MEDIA"};
const excluded = {title:"OpenAI 发布新模型并举办抽奖",originalUrl:"https://example.org/news/1"};
assert.equal(filterCheapDiscoveryCandidates([excluded],options).items.length,0,"GLOBAL_EXCLUDE_MUST_REACH_FEED_CHEAP_FILTER");
assert.equal((await filterDiscoveryCandidates([excluded],options)).items.length,0,"GLOBAL_EXCLUDE_MUST_REACH_FULL_FILTER");
const included = {excerpt:"OpenAI",title:"奇点工坊发布工作流与完整操作教程",originalUrl:"https://example.org/news/2"};
assert.equal((await filterDiscoveryCandidates([included],options)).items.length,1,"CUSTOM_INCLUDE_MUST_EXTEND_RECALL");
assert.equal((await filterDiscoveryCandidates([{...included,publishedAt:"2000-01-01T00:00:00Z"}],options)).items.length,0,"INCLUDE_CANNOT_BYPASS_FRESHNESS");
const calls:string[]=[];
const feed = await discoverPublicFeed("https://example.org/blog/", {
 fetchPage:async()=>({body:'<html><head><base href="/blog/"><link TYPE="application/atom+xml" REL="alternate stylesheet" href="../syndication/custom?x=1&amp;y=2"></head></html>',finalUrl:"https://example.org/blog/",contentType:"text/html"}),
 parseFeed:()=>[],
 collectFeed:async(url)=>{calls.push(url);if(url!=="https://example.org/syndication/custom?x=1&y=2") throw Error("NOT_FOUND");return [{title:"Actual tutorial",originalUrl:"https://example.org/tutorial"}];}
});
assert.equal(feed?.url,"https://example.org/syndication/custom?x=1&y=2","DECLARED_NONSTANDARD_FEED_MUST_BE_DISCOVERED");
assert.equal(calls.length,1,"DECLARED_FEED_BEFORE_GUESSES");
assert.deepEqual(declaredFeedUrls('<script>"<link rel=alternate type=application/rss+xml href=/fake>"</script><link rel=alternate type=application/rss+xml href=javascript:alert(1)>',"https://example.org"),[]);
assert.equal((await filterDiscoveryCandidates([{title:"City museum opens new exhibition",excerpt:"奇点工坊",originalUrl:"https://example.org/museum"}],options)).items.length,0,"INCIDENTAL_EXCERPT_DOES_NOT_GRANT_RELEVANCE");
const both=[...terms,{id:"same",kind:"EXCLUDE" as const,value:"奇点工坊"}];
assert.equal((await filterDiscoveryCandidates([included],{...options,relevanceTerms:both})).items.length,0,"EXCLUDE_WINS_INCLUDE");
const direct=await discoverPublicFeed("https://example.org/custom-feed",{fetchPage:async()=>({body:"<feed></feed>",contentType:"application/atom+xml",finalUrl:"https://example.org/custom-feed"}),parseFeed:()=>[{title:"Direct",originalUrl:"https://example.org/post"}],collectFeed:async()=>{throw Error("MUST_REUSE_DOWNLOADED_FEED");}});
assert.equal(direct?.url,"https://example.org/custom-feed");
console.log("SOURCE_INPUT_FILTER_RUNTIME=PASS");

}
main().catch(error=>{console.error(error);process.exitCode=1;});
