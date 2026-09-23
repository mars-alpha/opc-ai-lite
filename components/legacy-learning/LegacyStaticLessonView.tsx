import Link from "next/link";
import type { Course, Lesson } from "../../lib/courses";
import { LessonCompleteButton } from "../LessonCompleteButton";
import { LessonCourseSidebar } from "../LessonCourseSidebar";
import { LegacyCopyableGuide } from "./LegacyCopyableGuide";
import { LegacyLessonHelpPanel } from "./LegacyLessonHelpPanel";

// Historical static renderer only. New/formal courses must never import this component.
export function LegacyStaticLessonView({
  course,
  lesson,
  lessons,
  index,
  previous,
  next,
  lockedLessonIds,
  authenticated
}: {
  course: Course;
  lesson: Lesson;
  lessons: Lesson[];
  index: number;
  previous: Lesson | null;
  next: Lesson | null;
  lockedLessonIds: string[];
  authenticated: boolean;
}) {
  return <section className="lesson-page">
    <div className="container lesson-shell">
      <LessonCourseSidebar
        course={course}
        currentLessonId={lesson.id}
        lockedLessonIds={lockedLessonIds}
      />

      <article className="lesson-content">
        <div className="lesson-topbar">
          <Link className="back-link" href="/learning-path#progress">← 返回学习路径</Link>
          <span>{index+1} / {lessons.length} · {lesson.duration}</span>
        </div>

        <h1>{lesson.title}</h1>
        <p className="lesson-lead">{lesson.summary}</p>

        <section className="lesson-intro-block">
          <div className="lesson-intro-main">
            <div className="kicker">In plain language</div>
            <h2>先用一句话理解</h2>
            <p>{lesson.plainExplanation}</p>
          </div>
          <div className="lesson-intro-why">
            <span>为什么要学</span>
            <p>{lesson.whyItMatters}</p>
          </div>
        </section>

        <section className="lesson-learning-section">
          <div className="lesson-learning-head">
            <div>
              <div className="kicker">Learning goals</div>
              <h2>本课目标</h2>
            </div>
            <span>学完后你应该能做到</span>
          </div>
          <div className="lesson-goal-list">
            {lesson.points.map((point,pointIndex)=><div className="lesson-goal-row" key={point}><span>0{pointIndex+1}</span><p>{point}</p></div>)}
          </div>
        </section>

        <section className="lesson-reading">
          <div className="kicker">Core concepts</div>
          <h2>核心内容</h2>
          {lesson.content.map((paragraph)=><p key={paragraph}>{paragraph}</p>)}
        </section>

        <section className="lesson-application-zone">
          <div className="lesson-application-head">
            <div className="kicker">From example to action</div>
            <h2>看懂以后，直接拿去用</h2>
            <p>先看一个真实场景，再使用对应的提示词、模板或检查方法。</p>
          </div>

          <div className="lesson-example">
            <div className="kicker">Real example</div>
            <h3>{lesson.example.title}</h3>
            <p>{lesson.example.situation}</p>
            {(lesson.example.before || lesson.example.after) && <div className="lesson-example-compare">
              {lesson.example.before && <div><span>原来的做法</span><p>{lesson.example.before}</p></div>}
              {lesson.example.after && <div><span>调整后的做法</span><p>{lesson.example.after}</p></div>}
            </div>}
            <strong>{lesson.example.result}</strong>
          </div>

          <div className="lesson-guide-list">
            {lesson.guides.map((guide)=><div className={"lesson-guide-card guide-"+guide.type} key={guide.title}>
              <div className="lesson-guide-head">
                <div>
                  <span>{guide.type === "prompt" ? "可复制提示词" : guide.type === "template" ? "任务模板" : guide.type === "steps" ? "操作步骤" : guide.type === "checklist" ? "检查清单" : "示例"}</span>
                  <h3>{guide.title}</h3>
                </div>
                {guide.body && <LegacyCopyableGuide text={guide.body} label={guide.type === "prompt" ? "复制提示词" : "复制模板"} />}
              </div>
              {guide.intro && <p>{guide.intro}</p>}
              {guide.body && <pre>{guide.body}</pre>}
              {guide.items && <ul>{guide.items.map((item)=><li key={item}>{item}</li>)}</ul>}
            </div>)}
          </div>
        </section>

        <section className="lesson-practice-box" id="lesson-practice">
          <div className="kicker">5–20 min practice</div>
          <h2>马上动手</h2>
          <p>{lesson.practice.goal}</p>
          <ol>{lesson.practice.steps.map((step)=><li key={step}>{step}</li>)}</ol>
          <div className="lesson-acceptance">
            <span>验收标准</span>
            <ul>{lesson.practice.acceptance.map((item)=><li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <section className="lesson-wrapup-grid">
          <div className="lesson-mistakes">
            <div className="kicker">Common mistakes</div>
            <h2>常见错误</h2>
            <div>{lesson.mistakes.map((item)=><p key={item}>× {item}</p>)}</div>
          </div>

          <div className="lesson-related">
            <div className="kicker">Related knowledge</div>
            <h2>相关知识与下一步</h2>
            <ul>{lesson.related.map((item)=><li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <section className="lesson-checklist lesson-checklist-compact">
          <div className="kicker">Before complete</div>
          <h2>完成前检查</h2>
          <div className="lesson-check-grid">
            {["我能用自己的话解释本课核心概念","我已经使用本课提供的指引完成一次真实练习","我知道一个常见错误并能避免","我能根据验收标准判断结果是否有效"].map((item)=><div key={item}><span>✓</span><p>{item}</p></div>)}
          </div>
        </section>

        <div className="lesson-complete-wrap"><LessonCompleteButton courseSlug={course.slug} lessonId={lesson.id} /></div>

        <nav className="lesson-nav" aria-label="课时导航">
          {previous?<Link href={"/courses/"+course.slug+"/lessons/"+previous.id}><small>上一课</small><strong>← {previous.title}</strong></Link>:<span />}
          {next
            ? <Link href={"/courses/"+course.slug+"/lessons/"+next.id} className="next"><small>下一课</small><strong>{next.title} →</strong></Link>
            : <Link href="/learning-path#progress" className="next"><small>本阶段课程完成</small><strong>返回学习路径 →</strong></Link>}
        </nav>

        <LegacyLessonHelpPanel
          courseSlug={course.slug}
          lessonSlug={lesson.id}
          authenticated={authenticated}
        />
      </article>
    </div>
  </section>;
}
