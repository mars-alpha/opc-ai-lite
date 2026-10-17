import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import * as policy from "../lib/content/source-watchlist-policy";
import {RADAR_SOURCE_PORTFOLIO} from "../lib/content/radar-source-portfolio";
import {WATCHLIST_FEEDS,WATCHLIST_FEED_MIGRATIONS,watchlistFeedFetchUrl} from "../services/overseas-collector-relay/watchlist-feeds";
for(const migration of WATCHLIST_FEED_MIGRATIONS){
 const entry=WATCHLIST_FEEDS.find(source=>source.sourceId===migration.sourceId);
 assert(entry?.urls.includes(migration.from),"MIGRATION_ORIGIN_BELONGS_TO_EXISTING_SOURCE");
 assert.equal(watchlistFeedFetchUrl(migration.from),migration.to);
 assert.equal(watchlistFeedFetchUrl(migration.to),migration.to);
}
for(const entry of WATCHLIST_FEEDS){
 const source=RADAR_SOURCE_PORTFOLIO.find(s=>s.sourceId===entry.sourceId);
 assert(source,"TRANSPORT_REFERENCES_EXISTING_SOURCE");
 for(const url of entry.urls)assert(JSON.stringify(source).includes(url),"TRANSPORT_URL_IS_DECLARED_BY_SOURCE:"+entry.sourceId);
}
const seedSource=readFileSync("lib/server/content/source-portfolio-runtime.ts","utf8");
assert.equal(seedSource.includes("enabled: !managementDisabled"),false,"SEED_MUST_NOT_REENABLE_AFTER_CONCURRENT_OPERATOR_CHANGE");

for(const file of ["services/overseas-collector-relay/deno.ts"]){
 for(const match of readFileSync(file,"utf8").matchAll(/from\s+"(\.\/[^"\n]+)"/g))assert(existsSync(resolve(dirname(file),match[1])),"DENO_IMPORT_TARGET_EXISTS:"+match[1]);
}
assert.equal(typeof policy.portfolioSeedRefreshAllowed,"function");
const active={status:"ACTIVE",enabled:true,metadata:{currentPortfolio:true}};
assert(policy.portfolioSeedRefreshAllowed(active));
for(const source of [{...active,enabled:false},{...active,status:"ARCHIVED"},{...active,metadata:{currentPortfolio:false}},{...active,metadata:{managementDisabled:true}}])assert.equal(policy.portfolioSeedRefreshAllowed(source),false,"SEED_PRESERVES_OPERATOR_INTENT");
const entry=RADAR_SOURCE_PORTFOLIO.find(s=>s.key==="opml_simon_willison")!;
const project=(id:string,current=true)=>({id,name:"fixture",providerRef:entry.providerRef,canonicalUrl:entry.canonicalUrl,urls:[entry.canonicalUrl!],current,status:"ACTIVE",enabled:true});
const report=policy.buildSourceWatchlist([project(entry.sourceId)]);
assert.equal(report.groups.length,4);
assert.equal(report.items.find(i=>i.key===entry.key)?.status,"TRACKED_NOT_PROBED");
const duplicate=policy.buildSourceWatchlist([project(entry.sourceId),project("other-source")]);assert.equal(duplicate.items.find(i=>i.key===entry.key)?.status,"IDENTITY_AMBIGUOUS");
const retired=policy.buildSourceWatchlist([{...project(entry.sourceId,false),enabled:false,status:"ARCHIVED"}]);assert.equal(retired.items.find(i=>i.key===entry.key)?.status,"INACTIVE_EXISTING");
assert(report.items.some(i=>i.key==="required_anthropic_news" && i.status==="MISSING_SOURCE"));
assert.equal(report.items.some(i=>i.key==="github_trending" && i.groups.includes("OPEN_SOURCE_RESEARCH")),false,"TREND_IS_NOT_RELEASE_COVERAGE");
const requested=report.requestedSources;
assert.equal(requested.length,39,"USER_REQUESTED_SOURCE_TARGETS_ARE_COMPLETE");
assert.equal(requested.filter(i=>i.lane==="EDITORIAL_CANDIDATE").length,24);
assert.equal(requested.filter(i=>i.lane==="DISCUSSION_SIGNAL").length,15);
assert(requested.some(i=>i.key==="requested_mark_k" && i.status==="IDENTITY_UNRESOLVED"));
const pytorch={...project("fixture-pytorch"),canonicalUrl:"https://pytorch.org/feed/",urls:[]};
const findRequested=(sources:policy.WatchlistSource[])=>policy.buildSourceWatchlist(sources).requestedSources.find(i=>i.key==="requested_pytorch")!;
assert.equal(findRequested([pytorch]).status,"TRACKED_NOT_PROBED");
assert.equal(findRequested([{...pytorch,enabled:false,status:"ARCHIVED"}]).status,"INACTIVE_EXISTING");
assert.equal(findRequested([pytorch,{...pytorch,id:"duplicate-pytorch"}]).status,"IDENTITY_AMBIGUOUS");
assert.equal(findRequested([{...pytorch,name:"PyTorch",canonicalUrl:"https://pytorch.org.evil/feed/"}]).status,"MISSING_SOURCE","NO_NAME_OR_HOST_SUFFIX_IDENTITY_MATCH");
console.log("SOURCE_WATCHLIST_IDENTITY_AND_SEED_PROTECTION=PASS");
