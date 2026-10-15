import {
  buildCreatorFirstEventExpansionQueryPlan,
  buildEventExpansionQueryPlan
} from "../lib/server/content/event-expansion";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("EVENT_EXPANSION_QUERY_NARROWING_FAILED:" + code);
  console.log(code + "=PASS");
}

const context = {
  title: "Claude Code 2.0 agent workflow release",
  summary: "Claude Code agent workflow update for developers",
  keywords: ["Claude Code", "agent workflow", "2.0"],
  entityTerms: ["Claude Code", "Claude 2.0"]
};

const full = buildEventExpansionQueryPlan(context, 10);
assert(full.queries.some((item) => item.expansionType === "TUTORIAL"), "DEFAULT_PLAN_TUTORIAL_PRESENT");
assert(full.queries.some((item) => item.expansionType === "WORK_IMPACT"), "DEFAULT_PLAN_WORK_IMPACT_PRESENT");

const narrowed = buildEventExpansionQueryPlan(context, 10, ["EXPERIENCE", "USE_CASE"]);
assert(narrowed.queries.length > 0, "NARROWED_PLAN_NOT_EMPTY");
assert(
  narrowed.queries.every((item) => item.expansionType === "EXPERIENCE" || item.expansionType === "USE_CASE"),
  "NARROWED_PLAN_ONLY_REQUESTED_TYPES"
);
assert(!narrowed.queries.some((item) => item.expansionType === "TUTORIAL"), "NARROWED_PLAN_NO_TUTORIAL");
assert(!narrowed.queries.some((item) => item.expansionType === "WORK_IMPACT"), "NARROWED_PLAN_NO_WORK_IMPACT");

const creatorNarrowed = buildCreatorFirstEventExpansionQueryPlan(context, 10, ["EXPERIENCE", "USE_CASE"]);
assert(creatorNarrowed.creatorSearchEligible, "CREATOR_PLAN_ELIGIBLE");
assert(
  creatorNarrowed.creatorQueries.every((item) =>
    item.expansionType === "EXPERIENCE" || item.expansionType === "USE_CASE"
  ),
  "CREATOR_PLAN_ONLY_REQUESTED_TYPES"
);

const none = buildEventExpansionQueryPlan(context, 10, []);
const creatorNone = buildCreatorFirstEventExpansionQueryPlan(context, 10, []);
assert(none.queries.length === 0, "EXPLICIT_EMPTY_PLAN_MEANS_NO_QUERY");
assert(creatorNone.creatorQueries.length === 0, "EXPLICIT_EMPTY_CREATOR_PLAN_MEANS_NO_QUERY");

console.log("EVENT_EXPANSION_QUERY_NARROWING=PASS");
