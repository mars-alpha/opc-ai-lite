import Link from "next/link";
import { Reveal } from "./Reveal";

export function OfficialAccountUnlock({
  authenticated,
  followUnlocked,
  membershipActive
}: {
  authenticated: boolean;
  followUnlocked: boolean;
  membershipActive: boolean;
}) {
  const statusLabel = membershipActive
    ? "OPC 会员权益已生效"
    : followUnlocked
      ? "公众号权益已解锁"
      : "公众号权益待解锁";

  return (
    <section className="section compact official-unlock-section" id="official-account">
      <div className="container">
        <Reveal className="official-unlock-card">
          <div>
            <div className="eyebrow">公众号学习助手</div>
            <h2>关注公众号，继续解锁学习内容</h2>
            <p>
              关注后即可解锁 AI 基础认知课程全章节与完整 AI 日报，并持续收到新课程、实操项目与进阶练习更新，
              让值得学的内容主动来到你面前。
            </p>
          </div>
          <div className="official-unlock-rule">
            <span>公众号学习权益</span>
            <strong>关注公众号 → 解锁完整内容</strong>
            <small>解锁 AI 基础认知完整课程与完整 AI 日报，学习不再停在部分内容。</small>
            <small>持续收到课程更新、实操项目与进阶练习提醒，把新知识及时变成可用能力。</small>
            {authenticated ? (
              <span className="btn btn-secondary" role="status">{statusLabel}</span>
            ) : (
              <Link
                href={"/auth?mode=login&returnTo=" + encodeURIComponent("/#official-account")}
                className="btn btn-secondary"
              >
                登录后查看权益状态
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
