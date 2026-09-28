import { getAllLessons, getCourse } from "../lib/courses";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { getTrack05RuntimePresentation, track05RuntimeDefinitions } from "../lib/learning/track05-runtime";
import { FORMAL_RUNTIME_COURSE_SLUGS, LEGACY_STATIC_COURSE_SLUGS } from "../lib/learning/course-runtime-boundaries";
import { track05Catalog } from "../lib/learning/track-catalog";
function assert(c:unknown,code:string):asserts c{if(!c)throw new Error("TRACK05_FORMAL_REGISTRATION_FAILED:"+code);}
assert(track05RuntimeDefinitions.length===16,"SIXTEEN_RUNTIME_DEFINITIONS");
for(const d of track05RuntimeDefinitions){const id=d.lesson.id;assert(getLessonSpec("fde",id),"SPEC:"+id);assert(getTrack05RuntimePresentation("fde",id),"PRESENTATION:"+id);}
const course=getCourse("fde");assert(course&&getAllLessons(course).length===16,"FORMAL_COURSE_16");assert(course.modules.length===6,"SIX_MODULES");assert(course.modules.map(x=>x.lessons.length).join(",")==="3,3,3,3,3,1","MODULE_COUNTS");
const catalog=track05Catalog.flatMap(s=>s.lessons);const available=catalog.filter(x=>x.availability==="AVAILABLE");assert(catalog.length===16&&available.length===16,"CATALOG_16_ALL_AVAILABLE");assert(available.every(x=>x.runtimeCourseSlug==="fde"&&x.runtimeLessonId===x.lessonId),"AVAILABLE_RUNTIME_LINKS");
assert(FORMAL_RUNTIME_COURSE_SLUGS.includes("fde"),"FORMAL_RUNTIME_BOUNDARY");assert(!LEGACY_STATIC_COURSE_SLUGS.includes("fde" as never),"NO_LEGACY_BOUNDARY");
console.log("TRACK05_16_RUNTIME_DEFINITIONS=PASS");console.log("TRACK05_ALL_SPECS_PRESENTATIONS=PASS");console.log("TRACK05_FORMAL_COURSE_16=PASS");console.log("TRACK05_FORMAL_6_PHASE_MODULES=PASS");console.log("TRACK05_CATALOG_16_ALL_AVAILABLE=PASS");console.log("TRACK05_RUNTIME_BOUNDARY_FORMAL=PASS");
