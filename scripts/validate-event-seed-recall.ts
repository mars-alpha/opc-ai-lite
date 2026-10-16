import assert from "node:assert/strict";
import fs from "node:fs";
import {
  scoreEventSeedCandidate,
  selectBestEventSeedCandidate
} from "../lib/server/content/event-seed-clustering";
import { scoreEventClusterCandidate } from "../lib/server/content/event-clustering";

const now = new Date("2026-10-15T14:00:00.000Z");
const seed = (title: string, entities: string[] = ["company_anthropic"]) => ({
  title, entities, keywords: [], eventType: "INDUSTRY_HOTSPOT", observedAt: now
});
const candidate = (id: string, title: string, entities: string[] = ["company_anthropic"]) => ({
  id, title, entities, keywords: [], eventType: "INDUSTRY_HOTSPOT",
  firstSeenAt: now, lastSeenAt: now
});

const revenue = seed("Anthropic tells investors quarterly revenue up nearly 50% to $16.8bn ahead of IPO");
const revenueOtherTitle = candidate("revenue-en", "Anthropic's Q3 revenue hits $16.8B but growth slows ahead of planned November IPO");
const revenueChinese = candidate("revenue-zh", "Bloomberg：Anthropic 三季度收入 16.8B 美元，增速放缓引发 AI 芯片与服务器担忧");
assert(scoreEventSeedCandidate(revenue, revenueOtherTitle), "same revenue fact with different English headlines");
assert(scoreEventSeedCandidate(revenue, revenueChinese), "same revenue fact across languages");

const sourceControl = seed("Claude写代码太快，Git扛不住了：Anthropic仅靠7人，5个月重造版本控制系统");
assert(scoreEventSeedCandidate(sourceControl, candidate("control-zh", "Claude写代码太快，Anthropic连源码系统都重造了，7人只用5个月", [])), "same source-control news with different Chinese headlines");
assert(scoreEventSeedCandidate(sourceControl, candidate("control-en", "Redesigning source control at Anthropic")), "same source-control news across languages");

assert.equal(scoreEventSeedCandidate(revenue, candidate("wrong-amount", "Anthropic Q3 revenue reaches $15.2bn")), null, "different monetary amount must not merge");
assert(scoreEventSeedCandidate(revenue, candidate("same-amount-zh-unit", "Anthropic 三季度营收达到 168 亿美元")), "equivalent Chinese hundred-million amount must merge");
assert.equal(scoreEventSeedCandidate(revenue, candidate("wrong-amount-zh-unit", "Anthropic 三季度营收达到 16.8 亿美元")), null, "different monetary units must not merge");
assert.equal(scoreEventSeedCandidate(revenue, candidate("wrong-topic", "Anthropic raises $16.8B in new financing")), null, "same company and amount with different action must not merge");
assert.equal(scoreEventSeedCandidate(sourceControl, candidate("wrong-entity", "OpenAI redesigns source control", ["company_openai"])), null, "same topic with different company must not merge");
assert.equal(scoreEventSeedCandidate(seed("New AI release", ["company_anthropic"]), candidate("same-title-wrong-entity", "New AI release", ["company_openai"])), null, "identical generic headlines with conflicting entities must not merge");
assert.equal(scoreEventSeedCandidate(sourceControl, candidate("wrong-control-topic", "Anthropic redesigns Git repository settings")), null, "same company with a different Git change must not merge");
assert.equal(scoreEventSeedCandidate(sourceControl, candidate("wrong-control-duration", "Anthropic用7人6个月重造版本控制系统")), null, "conflicting source-control numbers must not merge");
assert.equal(scoreEventSeedCandidate(seed("Meta redesigns source control", ["company_meta"]), candidate("substring-entity", "Metadata redesigns source control", [])), null, "entity name may not match inside an unrelated word");
assert.equal(scoreEventSeedCandidate(seed("Anthropic releases Claude 4.5"), candidate("wrong-version", "Anthropic releases Claude 4.6")), null, "different model versions must not merge");

const manyCandidates = Array.from({ length: 300 }, (_, index) => candidate(String(index), `Unrelated company story number ${index}`, ["company_other"]));
manyCandidates.push(revenueChinese);
assert.equal(selectBestEventSeedCandidate(revenue, manyCandidates)?.eventId, "revenue-zh", "match after first 250 candidates must be found");

const clusterEvent = (id: string, title: string, entities: string[] = ["company_anthropic"]) => ({
  id, title, entities, keywords: [], eventType: "INDUSTRY_HOTSPOT",
  firstSeenAt: now, lastSeenAt: now
});
assert(scoreEventClusterCandidate(clusterEvent("revenue-seed", revenue.title), clusterEvent("revenue-zh", revenueChinese.title)), "same revenue facts must also merge at Event Cluster layer");
assert(scoreEventClusterCandidate(clusterEvent("control-seed", sourceControl.title), clusterEvent("control-en", "Redesigning source control at Anthropic")), "same source-control facts must also merge at Event Cluster layer");
assert.equal(scoreEventClusterCandidate(clusterEvent("revenue-seed", revenue.title), clusterEvent("wrong-amount", "Anthropic Q3 revenue reaches $15.2bn")), null, "Event Cluster must reject different amounts");
assert.equal(scoreEventClusterCandidate(clusterEvent("generic-a", "New AI release", ["company_anthropic"]), clusterEvent("generic-b", "New AI release", ["company_openai"])), null, "Event Cluster must reject conflicting entities even with identical headlines");

const implementation = fs.readFileSync("lib/server/content/event-seed-clustering.ts", "utf8");
assert(!implementation.includes(".limit(250)"), "event candidate query must not truncate at 250");
assert(!fs.readFileSync("lib/server/content/event-clustering.ts", "utf8").includes(".limit(500)"), "cluster candidate query must not truncate at 500");
console.log("EVENT_SEED_RECALL=PASS");
