import fs from "node:fs";
import { getAllLessons, getCourse } from "../lib/courses";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { getTrack04RuntimePresentation, track04RuntimeDefinitions } from "../lib/learning/track04-runtime";
import { FORMAL_RUNTIME_COURSE_SLUGS, LEGACY_STATIC_COURSE_SLUGS } from "../lib/learning/course-runtime-boundaries";
import { track04Catalog } from "../lib/learning/track-catalog";
function assert(c:unknown,code:string):asserts c{if(!c)throw new Error("TRACK04_FORMAL_REGISTRATION_FAILED:"+code);}
const counts=[1,4,3,1,4,2];
const titles=["先判断什么值得系统化","把人工流程拆清楚","让每一步拿到正确的信息","把外部能力接进流程","让流程出错时仍然可控","判断这套系统是否真的值得长期使用"];
assert(track04RuntimeDefinitions.length===15,"FIFTEEN_RUNTIME_DEFINITIONS");
for(const d of track04RuntimeDefinitions){const id=d.lesson.id;assert(getLessonSpec("ai-workflow",id),"SPEC:"+id);assert(getTrack04RuntimePresentation("ai-workflow",id),"PRESENTATION:"+id);}
const course=getCourse("ai-workflow");assert(course&&getAllLessons(course).length===15,"FORMAL_COURSE_15");assert(course.modules.length===6,"SIX_MODULES");assert(JSON.stringify(course.modules.map(x=>x.lessons.length))===JSON.stringify(counts),"MODULE_COUNTS");assert(JSON.stringify(course.modules.map(x=>x.title))===JSON.stringify(titles),"MODULE_TITLES");assert(course.modules.every(x=>!/^阶段/.test(x.title)),"NO_STAGE_PREFIX");
const catalog=track04Catalog.flatMap(s=>s.lessons);assert(catalog.length===15&&catalog.every(x=>x.availability==="AVAILABLE"),"CATALOG_ALL_AVAILABLE");assert(catalog.every(x=>x.runtimeCourseSlug==="ai-workflow"&&x.runtimeLessonId===x.lessonId),"CATALOG_RUNTIME_LINKS");assert(JSON.stringify(catalog.map(x=>x.lessonId))===JSON.stringify(track04RuntimeDefinitions.map(x=>x.lesson.id)),"CATALOG_RUNTIME_ID_PARITY");
assert(FORMAL_RUNTIME_COURSE_SLUGS.includes("ai-workflow"),"FORMAL_RUNTIME_BOUNDARY");assert(!LEGACY_STATIC_COURSE_SLUGS.includes("ai-workflow" as never),"NO_LEGACY_BOUNDARY");assert(!getAllLessons(course!).some(x=>x.id==="task-decomposition"),"OLD_SAMPLE_NOT_FORMAL_COURSE");
console.log("TRACK04_15_RUNTIME_DEFINITIONS=PASS");console.log("TRACK04_ALL_SPECS_PRESENTATIONS=PASS");console.log("TRACK04_FORMAL_COURSE_15=PASS");console.log("TRACK04_FORMAL_STAGE_GROUPING=PASS");console.log("TRACK04_CATALOG_ALL_AVAILABLE=PASS");console.log("TRACK04_CANONICAL_RUNTIME_IDS=PASS");console.log("TRACK04_RUNTIME_BOUNDARY_FORMAL=PASS");
