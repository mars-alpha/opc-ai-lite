import fs from "node:fs";
import { getAllLessons, getCourse } from "../lib/courses";
import { learningTracks, track04Catalog } from "../lib/learning/track-catalog";
import { getCrossTrackNextLesson, learningPathHrefForCourse } from "../lib/learning/track-navigation";
function assert(c:unknown,code:string):asserts c{if(!c)throw new Error("TRACK04_LEARNING_PATH_ACCESS_FAILED:"+code);}
const titles=["先判断什么值得系统化","把人工流程拆清楚","让每一步拿到正确的信息","把外部能力接进流程","让流程出错时仍然可控","判断这套系统是否真的值得长期使用"],counts=[1,4,3,1,4,2];
assert(JSON.stringify(track04Catalog.map(x=>x.title))===JSON.stringify(titles),"STAGE_TITLES");assert(track04Catalog.every(x=>!/^阶段\s*\d*[:：]?/.test(x.title)),"NO_STAGE_PREFIX");assert(JSON.stringify(track04Catalog.map(x=>x.lessons.length))===JSON.stringify(counts),"STAGE_COUNTS");
const items=track04Catalog.flatMap(x=>x.lessons);assert(items.length===15&&items.every(x=>x.availability==="AVAILABLE"),"ALL_AVAILABLE");assert(items.every(x=>x.runtimeCourseSlug==="ai-workflow"&&x.runtimeLessonId===x.lessonId),"RUNTIME_LINKS");assert(learningTracks["ai-workflow"].stages===track04Catalog,"TRACK_REGISTERED");
const course=getCourse("ai-workflow");assert(course&&getAllLessons(course).length===15,"FORMAL_15");assert(course.modules.length===6&&JSON.stringify(course.modules.map(x=>x.lessons.length))===JSON.stringify(counts),"SIDEBAR_GROUPING");assert(JSON.stringify(course.modules.map(x=>x.title))===JSON.stringify(titles),"SIDEBAR_TITLES");
const growth=getCourse("ai-growth");const last=growth?getAllLessons(growth).at(-1):null;assert(Boolean(last),"TRACK03_LAST");const cross=last?getCrossTrackNextLesson("ai-growth",last.id):null;assert(cross?.href==="/courses/ai-workflow/lessons/t4-01-automation-suitability","TRACK03_CONTINUE");
assert(learningPathHrefForCourse("ai-workflow")==="/learning-path?track=ai-workflow#foundation-catalog","RETURN_MAP");
const lessonPage=fs.readFileSync("app/courses/[slug]/lessons/[lessonId]/page.tsx","utf8");assert(lessonPage.includes("getTrack04RuntimePresentation"),"CURRENT_PRESENTATION_ROUTE");
console.log("TRACK04_STAGE_GROUPING=PASS");console.log("TRACK04_LEARNER_STAGE_TITLES_NO_PREFIX=PASS");console.log("TRACK04_SIDEBAR_MAP_CONSISTENCY=PASS");console.log("TRACK04_15_LESSON_CATALOG=PASS");console.log("TRACK04_ALL_RUNTIME_AVAILABLE=PASS");console.log("TRACK04_MEMBER_ACCESS_SEPARATED_FROM_TRACK03=PASS");console.log("TRACK04_TRACK_AWARE_RETURN=PASS");
