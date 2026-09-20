import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CopyableGuide } from "../../../../../components/CopyableGuide";
import { GenericLessonRuntimePanel } from "../../../../../components/GenericLessonRuntimePanel";
import { LessonCompleteButton } from "../../../../../components/LessonCompleteButton";
import { LessonCourseSidebar } from "../../../../../components/LessonCourseSidebar";
import { LessonHelpPanel } from "../../../../../components/LessonHelpPanel";
import { LessonFeedbackPrompt } from "../../../../../components/LessonFeedbackPrompt";
import { LockedAccessCta } from "../../../../../components/LockedAccessCta";
import { courses,getAllLessons,getCourse,getLesson } from "../../../../../lib/courses";
import { getLessonSpec } from "../../../../../lib/learning/lesson-spec-registry";
import { SESSION_COOKIE } from "../../../../../lib/server/auth/service";
import { getLessonPageContext } from "../../../../../lib/server/lesson-page/service";
import { getLessonRuntimeReadModel } from "../../../../../lib/server/lesson-runtime/service";

export function generateStaticParams(){ return courses.flatMap((course)=>getAllLessons(course).map((lesson)=>({slug:course.slug,lessonId:lesson.id}))); }

export default async function LessonPage({params}:{params:Promise<{slug:string;lessonId:string}>}){
  const {slug,lessonId}=await params;
  const course=getCourse(slug);
  if(!course) notFound();
  const staticLesson=getLesson(course,lessonId);
  if(!staticLesson) notFound();

  const cookieStore=await cookies();
  const { user, lesson, access, lockedLessonIds } = await getLessonPageContext({
    sessionToken: cookieStore.get(SESSION_COOKIE)?.value ?? null,
    courseSlug: course.slug,
    lessonSlug: lessonId,
    staticLesson
  });

  const lessons=getAllLessons(course);
  const index=lessons.findIndex((item)=>item.id===lesson.id);
  const previous=index>0?lessons[index-1]:null;
  const next=index<lessons.length-1?lessons[index+1]:null;
  const currentPath="/courses/"+course.slug+"/lessons/"+lesson.id;
  const loginHref="/auth?mode=login&returnTo="+encodeURIComponent(currentPath);

  const registeredSpec = getLessonSpec(course.slug, lesson.id);
  const runtimeReadModel =
    registeredSpec && access.allowed
      ? await getLessonRuntimeReadModel(
          user?.id ?? null,
          course.slug,
          lesson.id
        ).catch(() => null)
      : null;
  const genericRuntimePlan =
    runtimeReadModel?.registered
      ? runtimeReadModel.plan
      : null;

  if (genericRuntimePlan) {
  return <section className="lesson-page">
      <div className="container lesson-shell guided-learning-shell">
        <LessonCourseSidebar
          course={course}
          currentLessonId={lesson.id}
          lockedLessonIds={lockedLessonIds}
        />

        <article className="lesson-content lesson-content-guided">
          <div className="lesson-topbar">
            <Link className="back-link" href="/learning-path#progress">← 返回学习路径</Link>
            <span>第 {index+1} / {lessons.length} 课 · 引导式学习</span>
          </div>

          <div className="guided-lesson-hero">
            <div className="kicker">OPC 引导式课程 · {genericRuntimePlan.lessonType}</div>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
            <div className="guided-lesson-outcome">
              <span>完成后你会获得</span>
              <strong>{genericRuntimePlan.capabilityGain[0]}</strong>
            </div>
          </div>

          <GenericLessonRuntimePanel
            courseSlug={course.slug}
            lessonSlug={lesson.id}
            plan={genericRuntimePlan}
            lesson={lesson}
          />

          <div className="lesson-complete-wrap">
            {runtimeReadModel?.configurationReady ? (
              <LessonCompleteButton courseSlug={course.slug} lessonId={lesson.id} requiresPractice={genericRuntimePlan.requiresPractice} />
            ) : (
              <div className="guided-preview-complete-note">
                <strong>本课完成条件尚未全部接入</strong>
                <p>你仍然使用同一套引导式课程体验学习，但系统不会在 required Check / Practice / REAL_AI 证据链未准备好时提前开放正式完成状态。</p>
              </div>
            )}
          </div>

          <nav className="lesson-nav lesson-nav-with-rating" aria-label="课时导航">
            {previous?<Link href={"/courses/"+course.slug+"/lessons/"+previous.id}><small>上一课</small><strong>← {previous.title}</strong></Link>:<span />}
            <LessonFeedbackPrompt
              courseSlug={course.slug}
              lessonSlug={lesson.id}
              nextHref={next ? "/courses/"+course.slug+"/lessons/"+next.id : "/learning-path#progress"}
              nextTitle={next ? next.title : "返回学习路径"}
              nextLabel={next ? "继续下一课" : "本阶段课程完成"}
            />
          </nav>

        </article>
      </div>
    </section>;
  }

  if(!access.allowed){
  return <section className="lesson-page">
      <div className="container lesson-shell">
        <LessonCourseSidebar
          course={course}
          currentLessonId={lesson.id}
          lockedLessonIds={lockedLessonIds}
        />

        <article className="lesson-content lesson-locked-content">
          <div className="lesson-topbar">
            <Link className="back-link" href="/learning-path#progress">← 返回学习路径</Link>
            <span>{index+1} / {lessons.length} · 已锁定</span>
          </div>

          <div className="lesson-lock-panel">
            <div className="lesson-lock-icon" aria-hidden="true">🔒</div>
            {access.reason === "PREREQUISITE_STAGE_REQUIRED" ? (
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
                <LockedAccessCta kind="FOLLOW" loginHref={!user ? loginHref : undefined} compact />
              </>
            )}
          </div>
        </article>
      </div>
    </section>;
  }

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
                {guide.body && <CopyableGuide text={guide.body} label={guide.type === "prompt" ? "复制提示词" : "复制模板"} />}
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

        <LessonHelpPanel
          courseSlug={course.slug}
          lessonSlug={lesson.id}
          authenticated={Boolean(user)}
        />
      </article>
    </div>
  </section>;
}











