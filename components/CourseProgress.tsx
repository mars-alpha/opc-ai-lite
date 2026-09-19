"use client";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Course } from "../lib/courses";
import { useProgress } from "./ProgressProvider";

export function CourseProgress({course}:{course:Course}){
  const {ready,completedCount,isCompleted}=useProgress();
  const lessons=course.modules.flatMap((module) => module.lessons);
  const count=ready?completedCount(course.slug):0;
  const percent=lessons.length?Math.round(count/lessons.length*100):0;
  const next=lessons.find((lesson)=>!isCompleted(course.slug,lesson.id))||lessons[lessons.length-1];
  return <div className="course-progress-card">
    <div className="course-progress-top">
      <div><div className="kicker">Your progress</div><strong>{percent}%</strong><span>{ready?count+" / "+lessons.length+" 课时完成":"正在读取本地进度…"}</span></div>
      <div className="course-progress-ring" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} style={{"--course-progress":percent+"%"} as CSSProperties}><div>{percent}%</div></div>
    </div>
    <div className="course-progress-bar"><span style={{width:percent+"%"}} /></div>
    <Link className="btn btn-primary full-btn" href={"/courses/"+course.slug+"/lessons/"+next.id}>{percent===0?"开始第一课":percent===100?"重新查看课程":"继续学习"} →</Link>
  </div>;
}


