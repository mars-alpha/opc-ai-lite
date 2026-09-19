import Link from "next/link";
import { HeroVisual } from "../../../components/HeroVisual";
import { LatestPracticeCard } from "../../../components/LatestPracticeCard";
import { PageHero } from "../../../components/PageHero";
import { Reveal } from "../../../components/Reveal";
import { listPublishedLatestPracticeItemsWithFallback } from "../../../lib/server/practices/latest-reader";

export const dynamic = "force-dynamic";

export default async function LatestPracticePage() {
  const items = await listPublishedLatestPracticeItemsWithFallback();

  return (
    <>
      <PageHero
        eyebrow="Latest Practice"
        title={<>全部最新技术实操</>}
        description="把已发布 Knowledge 中值得继续理解、验证或进入课程的新变化集中在这里。"
        actions={<Link className="btn btn-secondary" href="/practice#latest">返回进阶练习</Link>}
        metrics={[
          { value: String(items.length), label: "当前最新条目" },
          { value: "Knowledge → Practice", label: "正式内容驱动实操" },
          { value: "Article / Course / Practice", label: "阅读、课程、实操各有入口" }
        ]}
        visual={
          <HeroVisual
            cards={[
              { title: "Article", value: "先理解变化", detail: "独立文稿说明变化真正意味着什么。" },
              { title: "Course", value: "再进入课程", detail: "有关联课程时继续系统学习。" },
              { title: "Practice", value: "最后验证", detail: "有正式 Practice 时直接提交并获得评价。" }
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
              <div className="eyebrow">Published Knowledge & Practice</div>
              <h2 className="section-title">所有最新技术内容</h2>
              <p className="section-subtitle">正式 Published Knowledge 是主数据源；有关联课程、Practice 或仅文稿时，分别提供清晰入口。</p>
            </div>
          </Reveal>

          <div className="latest-practice-grid latest-practice-index-grid">
            {items.map((item) => <LatestPracticeCard item={item} key={item.id} />)}
          </div>
        </div>
      </section>
    </>
  );
}
