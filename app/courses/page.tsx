import type { Metadata } from "next";
import { CourseListItem } from "../../components/CourseListItem";
import { courses } from "../../lib/courses";
export const metadata:Metadata={title:"课程"};
export default function CoursesPage(){ return <section className="course-index section"><div className="container">
  <div className="course-brand-lockup"><img src="/opc-logo.png" alt="OPC AI" /><span>Core Learning</span></div>
  <div className="section-head"><div><div className="eyebrow">OPC AI Courses</div><h1 className="section-title">课程索引</h1><p className="section-subtitle">课程统一从学习路径进入；此页仅保留课程索引与兼容入口。</p></div></div>
  <div className="course-list">{courses.map((course)=><CourseListItem key={course.slug} course={course} />)}</div>
</div></section>; }



