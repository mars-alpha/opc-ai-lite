import fs from "node:fs";
import { getAllLessons, getCourse } from "../lib/courses";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { getTrack03BatchBReviewPresentation, track03BatchBReviewDefinitions } from "../lib/learning/track03-batch-b-review";

function assert(v: unknown,code:string): asserts v { if(!v) throw new Error("TRACK03_BATCH_B_REVIEW_FAILED:"+code); }
const ids=["t3-04-topic-opportunity","t3-05-content-system","t3-06-multimodal-reuse"];
assert(JSON.stringify(track03BatchBReviewDefinitions.map((x)=>x.lesson.id))===JSON.stringify(ids),"REVIEW_IDS");
for(const id of ids){ assert(getTrack03BatchBReviewPresentation("ai-growth",id),"PRESENTATION:"+id); assert(getLessonSpec("ai-growth",id)===null,"NO_FORMAL_SPEC:"+id); }
const course=getCourse("ai-growth"); assert(course && getAllLessons(course).length===3,"FORMAL_COURSE_STILL_THREE");
const page=fs.readFileSync("app/course-builder/preview/track03-batch-b/[lessonId]/page.tsx","utf8");
assert(page.includes("previewMode") && page.includes("previewTriggerScenario") && page.includes("canonicalId.replace"),"PREVIEW_SHELL");
assert(!page.includes("lesson-spec-registry") && !page.includes("provision") && !page.includes("runtimeAcceptance"),"PREVIEW_NO_FORMAL_WRITE");
console.log("TRACK03_BATCH_B_PREVIEW_LESSONS=PASS");
console.log("TRACK03_BATCH_B_PRESENTATION=PASS");
console.log("TRACK03_BATCH_B_NO_FORMAL_SPEC_REGISTRATION=PASS");
console.log("TRACK03_FORMAL_COURSE_STILL_THREE=PASS");
