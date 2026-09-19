import Link from "next/link";
import { HeroVisual } from "../../components/HeroVisual";
import { PageHero } from "../../components/PageHero";
import { Reveal } from "../../components/Reveal";
import { LatestPracticeCard } from "../../components/LatestPracticeCard";
import { knowledgeItems } from "../../lib/contentDemo";

const tasks = [
  {
    stage: "Stage 1 · AI Literacy",
    title: "验证一次 AI 回答，而不是直接相信它",
    time: "10 分钟",
    goal: "选择一个你熟悉的问题，要求 AI 给出答案与依据，再人工检查至少一个关键事实。",
    acceptance: "能指出答案中哪些是事实、哪些需要进一步验证。"
  },
  {
    stage: "Stage 2 · AI Worker",
    title: "把一个模糊需求改写成任务简报",
    time: "15 分钟",
    goal: "用 Goal / Context / Input / Constraint / Output 描述一个真实工作任务。",
    acceptance: "第二次输出比第一次更符合目标，并能说明改善来自哪里。"
  },
  {
    stage: "Stage 3 · AI Workflow",
    title: "把一个重复任务拆成工作流节点",
    time: "30 分钟",
    goal: "选一个每周都会重复的任务，拆成输入、生成、判断、人工确认和输出节点。",
    acceptance: "每个节点都有明确输入输出，并至少保留一个人工判断点。"
  },
  {
    stage: "Stage 4+ · Growth / Solution",
    title: "用 OPC 四问筛掉一个伪 AI 需求",
    time: "20 分钟",
    goal: "回答：谁真的在痛？值不值得解决？AI 能不能解决？怎么证明有效？",
    acceptance: "能明确给出继续验证或停止投入的理由。"
  }
];

const latestPractice = knowledgeItems.slice(0, 3);

export default function PracticePage() {
  return (
    <>
      <PageHero
        eyebrow="Practice · Verify · Grow"
        title={<>把知识<br /><span className="accent">练成能力</span></>}
        description="基础 Practice 用短任务练一个能力；最新技术实操则来自 AI 日报中真正值得动手验证的新变化。"
        actions={
          <>
            <Link className="btn btn-primary" href="#tasks">选择一个短实操</Link>
            <Link className="btn btn-secondary" href="#latest">查看最新技术实操</Link>
          </>
        }
        metrics={[
          { value: "10–60 min", label: "短实操 · 一个任务一个结果" },
          { value: "4 Questions", label: "谁痛 / 值不值 / AI 能否解决 / 如何证明" },
          { value: "Daily → Practice", label: "值得动手的新变化进入最新技术实操" }
        ]}
        visual={
          <HeroVisual
            cards={[
              { title: "Practice", value: "短任务", detail: "快速应用一个知识点，马上看到结果。" },
              { title: "Acceptance", value: "明确验收", detail: "不是做过就算完成，要知道什么叫有效。" },
              { title: "Latest", value: "新技术实操", detail: "只把 AI 日报里值得验证的新变化变成任务。" }
            ]}
            eyebrow="Make it real"
            caption="用真实结果验证学习"
          />
        }
      />

      <section className="section compact">
        <div className="container">
          <div className="opc-four">
            {["谁真的在痛？", "值不值得解决？", "AI 能不能解决？", "怎么证明有效？"].map((question, index) => (
              <div key={question}><span>0{index + 1}</span><strong>{question}</strong></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="latest">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">From AI Daily</div>
              <h2 className="section-title">最新技术实操</h2>
              <p className="section-subtitle">源于 AI 日报更新。不是每个新工具都要练，只有被判断为“值得动手”的变化才进入这里。</p>
            </div>
            <Link className="btn btn-secondary" href="/practice/latest">查看更多</Link>
          </Reveal>

          <div className="latest-practice-grid">
            {latestPractice.map((item) => (
              <LatestPracticeCard item={item} key={item.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="tasks">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Autonomous Practice · 不保存进度</div>
              <h2 className="section-title">一次只练一个能力</h2>
              <p className="section-subtitle">这里是自主练习示例，不写入正式 Practice / Submission 记录。需要保存进度与评价的实操，请使用上方“最新技术实操”或课程内正式 Practice。</p>
            </div>
          </Reveal>
          <div className="practice-list">
            {tasks.map((task, index) => (
              <Reveal className="practice-row" key={task.title} delay={index * 45}>
                <span className="practice-index">0{index + 1}</span>
                <div className="practice-copy">
                  <small>{task.stage} · {task.time}</small>
                  <h3>{task.title}</h3>
                  <p><b>目标：</b>{task.goal}</p>
                  <p className="acceptance"><b>验收：</b>{task.acceptance}</p>
                </div>
                <span className="practice-state">自主练习</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}



