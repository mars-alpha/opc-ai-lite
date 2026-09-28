import { getAllLessons, getCourse } from "../lib/courses";
import { learningTracks, track05Catalog } from "../lib/learning/track-catalog";
import { getCrossTrackNextLesson, learningPathHrefForCourse } from "../lib/learning/track-navigation";
function assert(c:unknown,code:string):asserts c{if(!c)throw new Error("TRACK05_LEARNING_PATH_ACCESS_FAILED:"+code);}
const items=track05Catalog.flatMap(x=>x.lessons);const available=items.filter(x=>x.availability==="AVAILABLE");assert(track05Catalog.length===6&&items.length===16,"FULL_DIRECTORY");assert(available.length===16&&available.every(x=>x.runtimeCourseSlug==="fde"&&x.runtimeLessonId===x.lessonId),"ALL_AVAILABLE_RUNTIME_LINKS");assert(learningTracks.fde.stages===track05Catalog,"TRACK_REGISTERED");
const course=getCourse("fde");assert(course&&getAllLessons(course).length===16,"FORMAL_16");assert(course.modules.length===6&&course.modules.map(x=>x.lessons.length).join(",")==="3,3,3,3,3,1","SIDEBAR_6_PHASE_GROUPING");
const workflow=getCourse("ai-workflow");const last=workflow?getAllLessons(workflow).at(-1):null;assert(Boolean(last),"TRACK04_LAST");const cross=last?getCrossTrackNextLesson("ai-workflow",last.id):null;assert(cross?.href==="/courses/fde/lessons/t5-01-problem-discovery","TRACK04_CONTINUE");
assert(learningPathHrefForCourse("fde")==="/learning-path?track=fde#foundation-catalog","RETURN_MAP");
console.log("TRACK05_PATH_FULL_16_LESSON_DIRECTORY=PASS");console.log("TRACK05_PATH_ALL_16_AVAILABLE=PASS");console.log("TRACK05_PATH_RUNTIME_LINKS_ALL_AVAILABLE=PASS");console.log("TRACK05_SIDEBAR_6_PHASE_GROUPING=PASS");console.log("TRACK05_TRACK04_CONTINUITY=PASS");
