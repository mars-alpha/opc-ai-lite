import Link from "next/link";
import { HeroVisual } from "../../../components/HeroVisual";
import { LatestPracticeCard } from "../../../components/LatestPracticeCard";
import { PageHero } from "../../../components/PageHero";
import { Reveal } from "../../../components/Reveal";
import { knowledgeItems } from "../../../lib/contentDemo";

export default function LatestPracticePage() {
  return (
    <>
      <PageHero
        eyebrow="Latest Practice"
        title={<>全部最新技术实操</>}
        description="把 AI Daily 中值得继续理解、验证或进入课程的新变化集中在这里。先了解变化，再决定是否进入关联课程。"
        actions={<Link className="btn btn-secondary" href="/practice#latest">返回进阶练习</Link>}
        metrics={[
          { value: String(knowledgeItems.length), label: "当前最新条目" },
          { value: "Daily → Practice", label: "从变化进入学习与验证" },
          { value: "Article / Course", label: "文稿与课程分开承载" }
        ]}
        visual={
          <HeroVisual
            cards={[
              { title: "Article", value: "先理解变化", detail: "独立文稿说明变化真正意味着什么。" },
              { title: "Course", value: "再进入课程", detail: "有关联课程时继续系统学习。" },
              { title: "Practice", value: "最后验证", detail: "只把值得动手的变化转成实操。" }
            ]}
            eyebrow="Latest learning"
            caption="最新变化也要有清晰学习入口"
          />
        }
      />

      <section className="section compact">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Latest knowledge & practice</div>
              <h2 className="section-title">所有最新技术内容</h2>
              <p className="section-subtitle">有对应课程时直接进入课程；没有课程时进入独立文稿页，不再把用户带回 AI 日报。</p>
            </div>
          </Reveal>

          <div className="latest-practice-grid latest-practice-index-grid">
            {knowledgeItems.map((item) => <LatestPracticeCard item={item} key={item.id} />)}
          </div>
        </div>
      </section>
    </>
  );
}
