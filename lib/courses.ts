import { track01Phase1Course } from "./learning/track01-phase1-runtime";
import { track02CourseWithBatchD } from "./learning/track02-batch-d-runtime";
import { track03FullCourse } from "./learning/track03-batches-b-e-runtime";
import { track04Course } from "./learning/track04-runtime";
import { track05Course } from "./learning/track05-runtime";

export type LessonGuideBlock = {
  type: "prompt" | "template" | "steps" | "checklist" | "example";
  title: string;
  intro?: string;
  body?: string;
  items?: string[];
};

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  summary: string;
  plainExplanation: string;
  whyItMatters: string;
  points: string[];
  content: string[];
  example: { title: string; situation: string; before?: string; after?: string; result: string };
  guides: LessonGuideBlock[];
  practice: { goal: string; steps: string[]; acceptance: string[] };
  mistakes: string[];
  related: string[];
};

export type CourseModule = { id:string; title:string; description:string; lessons:Lesson[] };
export type Course = { slug:string; title:string; stage:string; stageLabel:string; level:string; duration:string; summary:string; outcome:string; modules:CourseModule[] };

export const courses: Course[] = [
  track01Phase1Course,
  track02CourseWithBatchD,
  track03FullCourse,
  track04Course,
  track05Course
];

export function getCourse(slug:string){ return courses.find((course)=>course.slug===slug); }
export function getAllLessons(course:Course){ return course.modules.flatMap((module)=>module.lessons); }
export function getLesson(course:Course, lessonId:string){ return getAllLessons(course).find((lesson)=>lesson.id===lessonId); }

