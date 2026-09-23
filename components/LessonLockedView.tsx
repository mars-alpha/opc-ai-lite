import Link from "next/link";
import type { Course, Lesson } from "../lib/courses";
import { LessonCourseSidebar } from "./LessonCourseSidebar";
import { LockedAccessCta } from "./LockedAccessCta";

type AccessReason =
  | "PUBLIC"
  | "ENTITLED"
  | "OFFICIAL_ACCOUNT_FOLLOW_REQUIRED"
  | "PREREQUISITE_STAGE_REQUIRED";

export function LessonLockedView({
  course,
  lesson,
  index,
  lessonsLength,
  lockedLessonIds,
  accessReason
}: {
  course: Course;
  lesson: Lesson;
  index: number;
  lessonsLength: number;
  lockedLessonIds: string[];
  accessReason: AccessReason;
}) {
  return (
    <section className="lesson-page">
      <div className="container lesson-shell">
        <LessonCourseSidebar
          course={course}
          currentLessonId={lesson.id}
          lockedLessonIds={lockedLessonIds}
        />

        <article className="lesson-content lesson-locked-content">
          <div className="lesson-topbar">
            <Link className="back-link" href="/learning-path#progress">← 返回学习路径</Link>
            <span>{index + 1} / {lessonsLength} · 已锁定</span>
          </div>

          <div className="lesson-lock-panel">
            <div className="lesson-lock-icon" aria-hidden="true">🔒</div>
            {accessReason === "PREREQUISITE_STAGE_REQUIRED" ? (
              <>
                <div className="kicker">Learning path</div>
                <h1>先完成前面的学习阶段</h1>
                <p>学习路径按阶段递进开放。完成前置阶段后，本阶段会自动解锁，避免跳过基础能力直接进入后续课程。</p>
                <div className="lesson-lock-rule">
                  <span>当前解锁规则</span>
                  <strong>完成前置阶段 → 解锁下一阶段</strong>
                  <small>直接访问课程链接或加入学习也不能绕过服务端学习顺序。</small>
                </div>
                <div className="lesson-lock-actions">
                  <Link className="btn btn-primary" href="/learning-path#progress">返回学习路径 →</Link>
                </div>
              </>
            ) : (
              <>
                <div className="kicker">Official account unlock</div>
                <h1>关注公众号，解锁后续课程</h1>
                <p>
                  Stage 1 前三节可以直接体验。从第 4 节开始需要公众号关注权益。
                  关注状态确认后，OPC 会通过服务端 Entitlement 自动开放后续课程。
                </p>
                <div className="lesson-lock-rule">
                  <span>当前解锁规则</span>
                  <strong>前三节免费学习 → 关注公众号解锁后续课程</strong>
                  <small>登录、加入课程、学习进度和公众号权益是四个独立状态。</small>
                </div>
                <LockedAccessCta kind="FOLLOW" compact />
              </>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
