import { classifyEventExpansionCandidate } from "../lib/server/content/event-expansion";

function assert(condition: unknown, code: string): asserts condition { if (!condition) throw new Error("EVENT_EXPANSION_ANCHOR_SPECIFICITY_FAILED:" + code); console.log(code + "=PASS"); }

const phr = { title: "PHRBench: A Behavioral Evaluation of Post-Hallucination Reasoning in LLMs", summary: null, keywords: ["PHRBench", "Post-Hallucination"], entityTerms: ["PHRBench"] };
assert(!classifyEventExpansionCandidate(phr, { rawItemId:"unrelated", platform:"ARXIV", title:"FORTE: A Production Framework for Feature Evaluation and Deprecation in Industrial Recommender Systems", excerpt:"Production evaluation framework with practical A/B testing results." }), "GENERIC_ACADEMIC_WORDS_DO_NOT_LINK_EVENTS");
assert(Boolean(classifyEventExpansionCandidate(phr, { rawItemId:"related", platform:"MEDIA", title:"PHRBench post-hallucination hands-on evaluation guide", excerpt:"A practical walkthrough reproduces PHRBench post-hallucination evaluation with setup steps." })), "NAMED_EVENT_ANCHOR_STILL_MATCHES");
console.log("EVENT_EXPANSION_ANCHOR_SPECIFICITY=PASS");
