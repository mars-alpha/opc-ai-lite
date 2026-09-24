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
        <span>{isFollow ? "公众号权益" : "OPC 会员权益"}</span>
        <strong>{isFollow ? "关注公众号，解锁完整 AI 日报" : "继续学习更多 AI 实用内容"}</strong>
        <p>
          {isFollow
            ? "可先体验基础课程前三章节与部分 AI 日报；关注公众号后，可继续解锁基础课程全章节与完整 AI 日报。"
            : "解锁 AI 工作应用、完整 AI 日报、进阶练习、实操项目与后续进阶内容。"}
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