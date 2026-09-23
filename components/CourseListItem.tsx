"use client";
import Link from "next/link";
import type { Course } from "../lib/courses";
import { useProgress } from "./ProgressProvider";

export function CourseListItem({course}:{course:Course}){
  const {ready,authenticated,completedCount}=useProgress();
  const total=course.modules.flatMap((module) => module.lessons).length;
  const count=ready?completedCount(course.slug):0;
  const percent=total?Math.round(count/total*100):0;
  const complete=ready && percent===100;
  const courseHref="/courses/"+course.slug;
  const href=authenticated
    ? courseHref
    : "/auth?mode=login&returnTo="+encodeURIComponent(courseHref);

  return <Link className={"course-list-item "+(complete?"is-complete":"")} href={href}>
    <div className="course-list-art"><img src="/opc-logo.png" alt="" />{complete && <span className="course-art-check">✓</span>}</div>
    <div className="course-list-copy">
      <span>{course.stageLabel} · {course.level}</span>
      <h3>{course.title}</h3>
      <p>{course.summary}</p>
      <div className="mini-progress"><span style={{width:percent+"%"}} /></div>
      <small>{!ready?total+" 课时":complete?"✓ 课程已完成":count>0?count+"/"+total+" 课时完成 · "+percent+"%":"未开始 · "+total+" 课时"}</small>
    </div>
    <span className="round-arrow">→</span>
  </Link>;
}



