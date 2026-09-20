import Link from "next/link";

type LockedAccessCtaProps = {
  kind: "FOLLOW" | "MEMBER";
  loginHref?: string;
  compact?: boolean;
};

export function LockedAccessCta({ kind, loginHref, compact = false }: LockedAccessCtaProps) {
  const isFollow = kind === "FOLLOW";

  return (
    <div className={"locked-access-cta" + (compact ? " is-compact" : "")}>
      <div className="locked-access-icon" aria-hidden="true">⌁</div>
      <div className="locked-access-copy">
        <span>{isFollow ? "公众号权益" : "OPC Membership"}</span>
        <strong>{isFollow ? "关注公众号，解锁完整 AI Daily" : "OPC 会员专享 · 解锁完整内容"}</strong>
        <p>
          {isFollow
            ? "Top 3 免费查看。关注公众号后，系统确认权益即可查看完整 AI Daily；OPC 会员同样可访问。"
            : "标题与摘要保持公开；正文、Deep Resource、正式实操与进阶课程需要有效 OPC Membership。"}
        </p>
      </div>
      <div className="locked-access-actions">
        <Link className="btn btn-primary" href={isFollow ? "/#official-account" : "/#membership"}>
          {isFollow ? "查看关注解锁方式" : "查看 OPC 会员方案"}
        </Link>
        {isFollow ? (
          <>
            <Link className="btn btn-secondary" href="/#membership">或加入 OPC 会员</Link>
            {loginHref ? <Link className="btn btn-secondary" href={loginHref}>登录后查看权益状态</Link> : null}
          </>
        ) : loginHref ? (
          <Link className="btn btn-secondary" href={loginHref}>登录后查看状态</Link>
        ) : null}
      </div>
    </div>
  );
}