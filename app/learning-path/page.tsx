import Link from "next/link";
import { cookies } from "next/headers";
import { HeroVisual } from "../../components/HeroVisual";
import { LearningBlockProgress } from "../../components/LearningBlockProgress";
import { LearningTrackPreference } from "../../components/LearningTrackPreference";
import { PageHero } from "../../components/PageHero";
import { Reveal } from "../../components/Reveal";
import { TrackCatalog } from "../../components/TrackCatalog";
import { getLearningTrack } from "../../lib/learning/track-catalog";

const stages = [
  ["01", "foundation-ai", "AI Foundation", "AI 基础认知", "真正看懂 AI、模型、Prompt、RAG、Tool、Agent 与现代 AI 能力边界"],
  ["02", "ai-work", "AI Work", "AI 工作应用", "把 AI 用进研究、写作、文件、数据、知识和重复工作"],
  ["03", "ai-growth", "AI Growth", "AI 推广运营与业务增长", "把 AI 放进内容、获客、销售、客服与运营流程"],
  ["04", "ai-workflow", "AI Workflow", "AI Workflow 与自动化", "设计可控、可重复、可评估的 AI 工作系统"],
  ["05", "fde", "FDE", "FDE / AI 解决方案落地", "从真实业务问题出发，完成发现、设计、试点、评估与落地"]
] as const;

export default async function LearningPathPage({
  searchParams
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track: requestedTrack } = await searchParams;
  const cookieStore = await cookies();
  const rememberedTrack = cookieStore.get("opc_learning_track")?.value;
  const track = getLearningTrack(requestedTrack ?? rememberedTrack);

  return (
    <>
      <LearningTrackPreference track={track.slug} />
      <PageHero
        eyebrow="Learning Path"
        title={<>从看懂 AI，<span className="accent">到把 AI 用进真实业务</span></>}
        description="从 AI 基础认知开始，逐步走向工作应用、业务增长、工作流设计与解决方案落地。学完五大板块，你会更清楚地判断 AI 能做什么、怎么用进真实工作，并把方法沉淀成可复用、可交付的能力。"
        actions={<><Link className="btn btn-primary" href="#foundation-catalog">进入学习地图</Link><Link className="btn btn-secondary" href="/practice">AI热点练习</Link></>}
        metrics={[
          { value: "5", label: "五大长期学习板块" },
          { value: track.stageLabel.split(" ")[0], label: track.slug === "ai-work" ? "当前能力分组" : "当前学习阶段" },
          { value: String(track.stages.flatMap((stage) => stage.lessons).length), label: "当前核心课程" }
        ]}
        visual={
          <HeroVisual
            cards={[
              { title: "CURRENT", value: track.title, detail: "从理解 AI 到真正会用，先建立稳定的判断与协作基础。" },
              { title: "CATALOG", value: track.stages.flatMap((stage) => stage.lessons).length + " 节", detail: "每一课解决一个真实问题，把知识逐步变成能直接使用的方法。" },
              { title: "PATH", value: "5 大板块", detail: "最终获得从 AI 使用、业务增长到工作流与解决方案落地的完整能力链。" }
            ]}
            eyebrow="OPC Learning"
            caption={"当前： " + track.title}
          />
        }
      />

      <section className="section compact" id="foundation-catalog">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Learning Map</div>
              <h2 className="section-title">学习地图</h2>
              <p className="section-subtitle">沿着五大板块持续学习，你会从“知道 AI 能做什么”，走到“能把 AI 稳定用进工作、业务和真实解决方案”。</p>
            </div>
          </Reveal>

          <nav className="learning-block-nav" aria-label="五大长期学习板块">
            {stages.map(([index, slug, en, title, detail]) => {
              const active = slug === track.slug;
              const inner = <>
                <div className="learning-block-nav-heading">
                  <span className="learning-block-nav-index">{index}</span>
                  <small className="learning-block-nav-track">{en}</small>
                </div>
                <div className="learning-block-nav-copy">
                  <strong>{title}</strong>
                  <span>{detail}</span>
                </div>
                <em>{active ? "当前" : slug ? "切换" : "后续开放"}</em>
              </>;
              return slug ? (
                <Link
                  className={"learning-block-nav-item " + (active ? "is-active" : "")}
                  key={index}
                  href={"/learning-path?track=" + slug + "#foundation-catalog"}
                  scroll
                >
                  {inner}
                </Link>
              ) : (
                <div className="learning-block-nav-item is-coming" key={index}>{inner}</div>
              );
            })}
          </nav>

          <Reveal className="section-head foundation-catalog-heading">
            <div>
              <div className="eyebrow">{track.eyebrow}</div>
              <h2 className="section-title">{track.title}</h2>
              <p className="section-subtitle">{track.description}</p>
            </div>
            <div className="foundation-catalog-summary">
              <strong>{track.stages.length}</strong><span>学习分组</span>
              <strong>{track.stages.flatMap((stage) => stage.lessons).length}</strong><span>核心课程</span>
            </div>
          </Reveal>

          <div className="foundation-learning-layout">
            <LearningBlockProgress track={track} />
            <TrackCatalog track={track} />
          </div>
        </div>
      </section>

    </>
  );
}
