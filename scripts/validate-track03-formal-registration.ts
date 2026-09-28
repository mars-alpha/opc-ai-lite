import { getAllLessons, getCourse } from "../lib/courses";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { getTrack03BatchARuntimePresentation, track03BatchARuntimeDefinitions } from "../lib/learning/track03-batch-a-runtime";
import { getTrack03BatchesBERuntimePresentation, track03BatchesBERuntimeDefinitions } from "../lib/learning/track03-batches-b-e-runtime";
import { track03Catalog } from "../lib/learning/track-catalog";
function assert(c:unknown,code:string):asserts c{if(!c)throw new Error("TRACK03_FORMAL_REGISTRATION_FAILED:"+code)}
const all=[...track03BatchARuntimeDefinitions,...track03BatchesBERuntimeDefinitions]; assert(all.length===15,"FIFTEEN_RUNTIME_DEFINITIONS");
for(const d of all){const id=d.lesson.id;assert(getLessonSpec("ai-growth",id),"SPEC:"+id);assert(getTrack03BatchARuntimePresentation("ai-growth",id)||getTrack03BatchesBERuntimePresentation("ai-growth",id),"PRESENTATION:"+id)}
const course=getCourse("ai-growth"); assert(course&&getAllLessons(course).length===15,"FORMAL_COURSE_15");
const catalog=track03Catalog.flatMap(s=>s.lessons); assert(catalog.length===15&&catalog.every(x=>x.curriculumStatus==="AVAILABLE"&&x.availability==="AVAILABLE"&&x.runtimeCourseSlug==="ai-growth"&&x.runtimeLessonId===x.lessonId),"CATALOG_ALL_AVAILABLE");
console.log("TRACK03_FIFTEEN_RUNTIME_DEFINITIONS=PASS");console.log("TRACK03_ALL_SPECS_PRESENTATIONS=PASS");console.log("TRACK03_FORMAL_COURSE_15=PASS");console.log("TRACK03_CATALOG_ALL_AVAILABLE=PASS");
