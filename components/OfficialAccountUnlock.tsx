import Link from "next/link";
import { Reveal } from "./Reveal";

export function OfficialAccountUnlock() {
  return (
    <section className="section compact official-unlock-section" id="official-account">
      <div className="container">
        <Reveal className="official-unlock-card">
          <div>
            <div className="eyebrow">公众号学习助手</div>
            <h2>关注公众号，继续解锁学习内容</h2>
            <p>
              关注后可解锁 AI 基础认知课程全章节与完整 AI 日报。后续公众号也将作为学习助手，
              推送新更新的实操项目、进阶练习等学习内容；收到推送不代表已获得这些会员内容的使用权限。
            </p>
          </div>
          <div className="official-unlock-rule">
            <span>公众号学习权益</span>
            <strong>基础课程前三章节 / 部分 AI 日报 → 关注公众号 → 解锁完整内容</strong>
            <small>实操项目、进阶练习与进阶内容仍按实际会员权益判断；未订阅会员时，引导查看 OPC 会员方案。</small>
            <small>真实微信关注验证将在微信渠道接入后自动完成；当前不会提供“我已关注”的手动确认按钮。</small>
            <Link href="/auth?mode=login" className="btn btn-secondary">登录后查看权益状态</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
