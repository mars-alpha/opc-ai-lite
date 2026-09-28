import Link from "next/link";
import { cookies } from "next/headers";
import { HeroVisual } from "../components/HeroVisual";
import { MembershipBenefits } from "../components/MembershipBenefits";
import { OfficialAccountUnlock } from "../components/OfficialAccountUnlock";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { getSessionUser, SESSION_COOKIE } from "../lib/server/auth/service";
import { hasOfficialAccountFollowEntitlement } from "../lib/server/entitlements/service";
import { getMembershipStatus } from "../lib/server/membership/service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);
  const [followUnlocked, membership] = user
    ? await Promise.all([
        hasOfficialAccountFollowEntitlement(user.id),
        getMembershipStatus(user.id)
      ])
    : [false, { active: false }];

  return (
    <>
      <PageHero
        eyebrow="Open the future of learning"
        title={<>持续更新的<br /><span className="accent">AI 学习平台</span></>}
        description="系统学习 AI，理解真正值得关注的变化，再用短实操和阶段项目把知识变成能力。"
        actions={
          <>
            <Link className="btn btn-primary" href="/learning-path">开始学习</Link>
            <Link className="btn btn-secondary" href="/ai-daily">看看最新变化</Link>
          </>
        }
        metrics={[
          { value: "系统学习", label: "六阶段课程建立完整 AI 能力结构" },
          { value: "持续更新", label: "AI 日报筛选真正值得关注的新变化" },
          { value: "实操验证", label: "用短练习与阶段项目检验是否掌握" }
        ]}
        visual={
          <HeroVisual
            cards={[
              { title: "学习", value: "从能力出发", detail: "不按工具堆课，按真实能力成长组织。" },
              { title: "最新", value: "只看有价值变化", detail: "判断是否形成知识、实操或课程影响。" },
              { title: "实操", value: "用结果验证学习", detail: "10–60 分钟任务 + 阶段项目。" }
            ]}
            caption="更大的世界，从这里开始"
          />
        }
      />

      <OfficialAccountUnlock
        authenticated={Boolean(user)}
        followUnlocked={followUnlocked}
        membershipActive={membership.active}
      />

      <section className="section" id="about">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">How OPC AI works</div>
              <h2 className="section-title">学习、更新、实践<br />只保留三条主线</h2>
              <p className="section-subtitle">不追逐工具数量，也不把所有内容都做成课程。核心课程负责长期能力，动态内容负责更新认知，实操负责验证结果。</p>
            </div>
          </Reveal>
          <div className="core-lines">
            {[
              ["01", "系统学习", "Learning Path → Stage → Module → Lesson", "/learning-path", "建立长期稳定的 AI 能力结构。"],
              ["02", "动态更新", "Daily Item → Knowledge Capsule → Course Impact", "/ai-daily", "把新变化压缩成真正值得知道的知识。"],
              ["03", "实操验证", "Practice → Acceptance → Project", "/practice", "通过真实任务和验收结果确认是否掌握。"]
            ].map(([index, title, flow, href, detail]) => (
              <Reveal className="core-line" key={index}>
                <span>{index}</span>
                <div>
                  <h3>{title}</h3>
                  <small>{flow}</small>
                  <p>{detail}</p>
                </div>
                <Link href={href}>进入 →</Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <MembershipBenefits />
    </>
  );
}
