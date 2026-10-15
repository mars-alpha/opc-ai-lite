import { evaluatePracticalEvidenceActionability, isFormalPracticalEvidenceSource } from "../lib/server/content/practical-evidence-actionability";

function assert(condition: unknown, code: string): asserts condition { if (!condition) throw new Error(code); }
assert(evaluatePracticalEvidenceActionability({ expansionType:"TUTORIAL", title:"Deploy an agent", excerpt:"Step-by-step setup, configure the API and run the command." }).actionable, "TUTORIAL_ACTIONABLE");
assert(evaluatePracticalEvidenceActionability({ expansionType:"EXPERIENCE", title:"Hands-on test", excerpt:"We tested the model on 100 tasks and measured 22% lower latency." }).actionable, "EXPERIENCE_ACTIONABLE");
assert(evaluatePracticalEvidenceActionability({ expansionType:"USE_CASE", title:"AI workflow", excerpt:"Use the agent to automate invoice review; the workflow reduced processing time by 30%." }).actionable, "USE_CASE_ACTIONABLE");
assert(!evaluatePracticalEvidenceActionability({ expansionType:"EXPERIENCE", title:"New model announced", excerpt:"The company announced a new model." }).actionable, "NEWS_NOT_ACTIONABLE");
assert(isFormalPracticalEvidenceSource({ sourceEnabled:true, currentPortfolio:true, sourceUniverseRole:"OFFICIAL", sourceReferenceOnly:false, rawReferenceOnly:false, signalOnly:false }), "CURRENT_SOURCE_ELIGIBLE");
assert(!isFormalPracticalEvidenceSource({ sourceEnabled:false, currentPortfolio:false, sourceUniverseRole:"CREATOR", sourceReferenceOnly:true, rawReferenceOnly:true, signalOnly:true }), "RETIRED_SOURCE_REJECTED");
assert(isFormalPracticalEvidenceSource({ sourceEnabled:true, currentPortfolio:true, sourceUniverseRole:"CREATOR", sourceReferenceOnly:true, rawReferenceOnly:true, signalOnly:true }), "CURRENT_CREATOR_REFERENCE_EVIDENCE_ELIGIBLE");
assert(!isFormalPracticalEvidenceSource({ sourceEnabled:true, currentPortfolio:true, sourceUniverseRole:"DISCOVERY_AGGREGATOR", sourceReferenceOnly:true, rawReferenceOnly:false, signalOnly:true }), "DISCOVERY_AGGREGATOR_REJECTED");
console.log(JSON.stringify({task:"PRACTICAL-ACTIONABILITY",status:"PASS"},null,2));
