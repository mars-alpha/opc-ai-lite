import {
  track01T101Draft,
  track01T101Intro,
  track01T101KnowledgeDepth,
  track01T101ReferenceFill,
  track01T102Draft,
  track01T102Intro,
  track01T102KnowledgeDepth,
  track01T102ReferenceFill,
  track01T103Draft,
  track01T103Intro,
  track01T103KnowledgeDepth,
  track01T103ReferenceFill,
  track01T104Draft,
  track01T104Intro,
  track01T104KnowledgeDepth,
  track01T104ReferenceFill,
  track01T105Draft,
  track01T105Intro,
  track01T105KnowledgeDepth,
  track01T105ReferenceFill
} from "../fixtures/course-builder/track01-batch-a";
import {
  TRACK01_PHASE1_COURSE_SLUG,
  getTrack01Phase1RuntimePresentation,
  track01Phase1RuntimeDefinitions
} from "../lib/learning/track01-phase1-runtime";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("PARITY_FAILED:" + code);
}

function same(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

const approved = [
  { id: "T1-01", draft: track01T101Draft, intro: track01T101Intro, depth: track01T101KnowledgeDepth, fill: track01T101ReferenceFill },
  { id: "T1-02", draft: track01T102Draft, intro: track01T102Intro, depth: track01T102KnowledgeDepth, fill: track01T102ReferenceFill },
  { id: "T1-03", draft: track01T103Draft, intro: track01T103Intro, depth: track01T103KnowledgeDepth, fill: track01T103ReferenceFill },
  { id: "T1-04", draft: track01T104Draft, intro: track01T104Intro, depth: track01T104KnowledgeDepth, fill: track01T104ReferenceFill },
  { id: "T1-05", draft: track01T105Draft, intro: track01T105Intro, depth: track01T105KnowledgeDepth, fill: track01T105ReferenceFill }
] as const;

for (const source of approved) {
  const definition = track01Phase1RuntimeDefinitions.find((item) => item.canonicalId === source.id);
  assert(definition, source.id + "_DEFINITION");
  const presentation = getTrack01Phase1RuntimePresentation(
    TRACK01_PHASE1_COURSE_SLUG,
    source.draft.lessonSpec.lessonId
  );
  assert(presentation, source.id + "_PRESENTATION");

  assert(same(definition.spec, source.draft.lessonSpec), source.id + "_LESSON_SPEC");
  assert(same(presentation.introComparison, source.intro), source.id + "_STEP1_INTRO");
  assert(same(presentation.checkSequence, source.draft.checkSequence ?? []), source.id + "_STEP3_CHECKS");
  assert(same(presentation.practice, source.draft.practice), source.id + "_STEP4_PRACTICE");
  assert(same(presentation.activity, source.draft.pedagogy.participation), source.id + "_STEP4_ACTIVITY");
  assert(presentation.referenceAnswer === source.draft.referenceAnswer, source.id + "_REFERENCE_ANSWER");
  assert(same(presentation.referenceFill, source.fill), source.id + "_REFERENCE_FILL");
  assert(same(presentation.reviewItems, source.draft.review), source.id + "_STEP5_REVIEW");
  assert(same(presentation.knowledgeDepth, source.depth), source.id + "_KNOWLEDGE_DEPTH");
  assert(same(presentation.selfAssessment, source.draft.selfAssessment), source.id + "_STEP6_SELF_ASSESSMENT");
  assert(presentation.practiceCopyValuesOnly === true, source.id + "_COPY_VALUES_ONLY");
  assert(presentation.practiceHintsGrouped === true, source.id + "_HINTS_GROUPED");
  assert(presentation.reviewCardFill === true, source.id + "_REVIEW_CARD_FILL");
  assert(presentation.reviewLabels === null, source.id + "_REVIEW_USES_GENERIC_LABELS");

  console.log(source.id + "_INTERACTION_PARITY=PASS");
}

console.log("TRACK01_PHASE1_INTERACTION_PARITY=PASS");
