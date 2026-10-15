import fs from "node:fs";

function must(path: string, token: string) {
  const text = fs.readFileSync(path, "utf8");
  if (!text.includes(token)) throw new Error("OUTPUT_REVIEW_014_FAILED:" + path + ":" + token);
  return text;
}

const page = must("app/admin/expansion-output-review/page.tsx", "UI_IMPLEMENTED / USER_REVIEW_PENDING");
const component = must("components/AdminEventExpansionOutputReview.tsx", "/api/admin/content/intelligence?view=");
must("components/AdminEventExpansionOutputReview.tsx", "/api/admin/content/discovery/events/");
must("components/AdminEventExpansionOutputReview.tsx", "/expansion-output");
must("components/AdminEventExpansionOutputReview.tsx", "result.evidencePack");
const route = must("app/api/admin/content/discovery/events/[eventId]/expansion-output/route.ts", "runEventExpansionOutputSynthesis");
must("app/api/admin/content/discovery/events/[eventId]/expansion-output/route.ts", "getEventExpansionDailyOutput");

if (/result\.evidence\b/.test(component)) throw new Error("OUTPUT_REVIEW_014_FAILED:LEGACY_EVIDENCE_FIELD_FORBIDDEN");
if (/USER_APPROVED/.test(component)) throw new Error("OUTPUT_REVIEW_014_FAILED:UI_MUST_NOT_SELF_APPROVE");
if (/\.insert\(|\.update\(|\.delete\(/.test(route)) throw new Error("OUTPUT_REVIEW_014_FAILED:ROUTE_DIRECT_DB_MUTATION_FORBIDDEN");
if (/seed|fixture/i.test(component + page)) throw new Error("OUTPUT_REVIEW_014_FAILED:FAKE_REVIEW_DATA_FORBIDDEN");

console.log("EVENT_EXPANSION_OUTPUT_014_REVIEW_REAL_EVENT_SOURCE=PASS");
console.log("EVENT_EXPANSION_OUTPUT_014_REVIEW_EXISTING_EXPANSION_REUSE=PASS");
console.log("EVENT_EXPANSION_OUTPUT_014_REVIEW_SYNTHESIS_REUSE=PASS");
console.log("EVENT_EXPANSION_OUTPUT_014_REVIEW_NO_SELF_APPROVAL=PASS");
