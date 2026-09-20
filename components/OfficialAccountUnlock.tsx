import Link from "next/link";
import { Reveal } from "./Reveal";

export function OfficialAccountUnlock() {
  return (
    <section className="section compact official-unlock-section" id="official-account">
      <div className="container">
        <Reveal className="official-unlock-card">
          <div>
            <div className="eyebrow">Official Account</div>
            <h2>关注公众号，解锁完整 AI Daily</h2>
            <p>
              AI Daily Top 3 永久免费。关注公众号后，公众号权益只负责解锁完整 AI Daily，
              不等价于 OPC Membership，也不会解锁会员 Knowledge、Deep Resource 或正式实操。
            </p>
          </div>
          <div className="official-unlock-rule">
            <span>当前解锁路径</span>
            <strong>Top 3 免费 → 关注公众号 → 完整 AI Daily</strong>
            <small>真实微信关注验证将在微信渠道接入后自动完成；当前不会提供“我已关注”的手动确认按钮。</small>
            <Link href="/auth?mode=login" className="btn btn-secondary">登录后查看权益状态</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
