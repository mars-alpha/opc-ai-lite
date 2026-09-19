import { MEMBERSHIP_BENEFIT_MATRIX, OPC_MEMBERSHIP_PLANS } from "../lib/membership/policy";
import { Reveal } from "./Reveal";

export function MembershipBenefits() {
  return (
    <section className="section membership-section">
      <div className="container">
        <Reveal className="membership-shell">
          <div className="membership-intro">
            <div className="eyebrow">OPC Membership</div>
            <h2 className="section-title small-title">OPC 订阅会员</h2>
            <p>会员权益按当前已开放能力与规划能力分开标注；未接入的课程、日报和深度资料不会提前承诺为已可用。</p>
          </div>

          <div className="membership-plans">
            {OPC_MEMBERSHIP_PLANS.map((plan) => (
              <article className={"membership-plan" + (plan.featured ? " is-featured" : "")} key={plan.code}>
                {plan.featured ? <div className="membership-plan-badge">推荐</div> : null}
                <div>
                  <span className="membership-plan-name">{plan.name}</span>
                  <div className="membership-plan-price"><strong>{plan.priceLabel}</strong><small>{plan.periodLabel}</small></div>
                  <p>{plan.description}</p>
                </div>
                <button className={"btn " + (plan.featured ? "btn-primary" : "btn-secondary") + " membership-pay-button"} type="button" disabled>
                  选择{plan.name}
                </button>
              </article>
            ))}
          </div>

          <div className="membership-payment-note">支付功能接入后启用订阅按钮。</div>

          <div className="membership-benefits-head">
            <div>
              <div className="eyebrow">Benefits</div>
              <h3>会员权益对照</h3>
            </div>
            <span>✓ = 当前已开放；“规划” = 支付 / 权限正式化后再开放</span>
          </div>

          <div className="membership-table-wrap">
            <table className="membership-table">
              <thead>
                <tr>
                  <th>权益</th>
                  <th>免费用户</th>
                  <th>OPC 订阅用户</th>
                </tr>
              </thead>
              <tbody>
                {MEMBERSHIP_BENEFIT_MATRIX.map(([name, free, member]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{free}</td>
                    <td><strong>{member}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
