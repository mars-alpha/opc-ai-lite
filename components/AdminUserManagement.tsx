"use client";

import { useEffect, useState } from "react";

type MembershipState = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "REVOKED" | "NONE";
type DetailMode = "OVERVIEW" | "SETTINGS";
type MembershipMode = "NONE" | "TIMED" | "PERMANENT";

type UserListItem = {
  id: string;
  email: string;
  displayName: string | null;
  role: "USER" | "ADMIN";
  isAdmin: boolean;
  isBootstrapAdmin: boolean;
  accountStatus: "ACTIVE" | "DISABLED";
  createdAt: string;
  membership: {
    state: MembershipState;
    startsAt: string | null;
    expiresAt: string | null;
    source: string | null;
    note: string | null;
  };
};

type UserDetail = UserListItem & {
  learning: {
    completedLessons: number;
    lastLearningAt: string | null;
  };
  audit: Array<{
    id: string;
    action: string;
    actorEmail: string;
    before: unknown;
    after: unknown;
    note: string | null;
    createdAt: string;
  }>;
};

const membershipLabels: Record<MembershipState, string> = {
  ACTIVE: "会员",
  SCHEDULED: "待生效",
  EXPIRED: "已到期",
  REVOKED: "已取消",
  NONE: "非会员"
};

const auditLabels: Record<string, string> = {
  USER_ROLE_UPDATED: "管理员身份变更",
  USER_STATUS_UPDATED: "账号状态变更",
  MEMBERSHIP_UPDATED: "会员权益变更",
  MEMBERSHIP_REVOKED: "会员已取消"
};

function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {})
  }).format(date);
}

function toLocalInput(value: string | null) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

function addDays(base: string, days: number) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return toLocalInput(date.toISOString());
}

function addYear(base: string) {
  const date = new Date(base);
  date.setFullYear(date.getFullYear() + 1);
  return toLocalInput(date.toISOString());
}

export function AdminUserManagement() {
  const [items, setItems] = useState<UserListItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [query, setQuery] = useState("");
  const [accountStatus, setAccountStatus] = useState("ALL");
  const [membership, setMembership] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [detailMode, setDetailMode] = useState<DetailMode>("OVERVIEW");
  const [auditOpen, setAuditOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [settingsRole, setSettingsRole] = useState<"USER" | "ADMIN">("USER");
  const [membershipMode, setMembershipMode] = useState<MembershipMode>("NONE");

  const [membershipForm, setMembershipForm] = useState({
    startsAt: toLocalInput(null),
    expiresAt: addYear(toLocalInput(null)),
    membershipNote: "",
    changeNote: ""
  });

  async function loadUsers(preferredId?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (accountStatus !== "ALL") params.set("accountStatus", accountStatus);
      if (membership !== "ALL") params.set("membership", membership);
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      const response = await fetch("/api/admin/users?" + params.toString(), { cache: "no-store" });
      if (!response.ok) throw new Error("用户列表读取失败");
      const data = await response.json();
      setItems(data.items ?? []);
      const nextId =
        preferredId && data.items?.some((item: UserListItem) => item.id === preferredId)
          ? preferredId
          : selectedId && data.items?.some((item: UserListItem) => item.id === selectedId)
            ? selectedId
            : data.items?.[0]?.id ?? "";
      setSelectedId(nextId);
      if (!nextId) setDetail(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "用户列表读取失败");
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(userId: string) {
    if (!userId) return;
    setDetailLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/users/" + encodeURIComponent(userId), {
        cache: "no-store"
      });
      if (!response.ok) throw new Error("用户详情读取失败");
      const data = await response.json();
      const user = data.user as UserDetail;
      setDetail(user);
      setSettingsRole(user.role);
      const startsAt = toLocalInput(user.membership.startsAt);
      const activeBase =
        user.membership.expiresAt && new Date(user.membership.expiresAt) > new Date()
          ? toLocalInput(user.membership.expiresAt)
          : startsAt;
      setMembershipForm({
        startsAt,
        expiresAt: user.membership.expiresAt ? toLocalInput(user.membership.expiresAt) : addYear(activeBase),
        membershipNote: user.membership.note ?? "",
        changeNote: ""
      });
      setMembershipMode(
        user.membership.state === "NONE" || user.membership.state === "REVOKED"
          ? "NONE"
          : user.membership.startsAt && !user.membership.expiresAt
            ? "PERMANENT"
            : "TIMED"
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "用户详情读取失败");
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadUsers().catch(() => undefined);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query, accountStatus, membership, roleFilter]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId).catch(() => undefined);
  }, [selectedId]);

  async function updateUserFromList(
    item: UserListItem,
    payload: {
      role?: "USER" | "ADMIN";
      accountStatus: "ACTIVE" | "DISABLED";
      changeNote: string;
    }
  ) {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/users/" + encodeURIComponent(item.id), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.error === "CANNOT_DISABLE_SELF") throw new Error("不能停用当前正在操作的管理员账号。");
        if (data.error === "CANNOT_REMOVE_SELF_ADMIN") throw new Error("不能取消当前正在操作账号的管理员身份。");
        if (data.error === "LAST_ADMIN") throw new Error("系统至少需要保留一个正式管理员。");
        if (data.error === "LAST_ACTIVE_ADMIN") throw new Error("系统至少需要保留一个可用的正式管理员。");
        throw new Error("用户资料保存失败");
      }
      setActiveMenuId(null);
      await loadUsers(item.id);
      await loadDetail(item.id);
      setMessage("用户资料已保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "用户资料保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAccountStatusFromList(item: UserListItem) {
    const nextStatus = item.accountStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    const actionLabel = nextStatus === "DISABLED" ? "停用" : "恢复";
    if (!window.confirm(`确认${actionLabel}该用户账号？`)) return;
    await updateUserFromList(item, {
      role: item.role,
      accountStatus: nextStatus,
      changeNote: `管理员${actionLabel}账号`
    });
  }

  function openUserSettings(item: UserListItem) {
    const sameUser = selectedId === item.id;
    setSelectedId(item.id);
    setActiveMenuId(null);
    setDetailMode("SETTINGS");
    setAuditOpen(false);
    setMessage(null);
    if (sameUser) {
      loadDetail(item.id).catch(() => undefined);
    } else {
      setDetail(null);
    }
  }

  async function saveUserSettings() {
    if (!detail) return;
    if (detail.role === "ADMIN" && settingsRole === "USER") {
      if (!window.confirm("确认取消该用户的管理员身份？")) return;
    }
    if (
      membershipMode === "NONE" &&
      detail.membership.state !== "NONE" &&
      detail.membership.state !== "REVOKED"
    ) {
      if (!window.confirm("确认取消该用户当前会员？")) return;
    }

    setSaving(true);
    setMessage(null);
    let roleSaved = false;
    try {
      if (settingsRole !== detail.role) {
        const roleResponse = await fetch("/api/admin/users/" + encodeURIComponent(detail.id), {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            role: settingsRole,
            accountStatus: detail.accountStatus,
            changeNote: settingsRole === "ADMIN" ? "设为管理员" : "取消管理员"
          })
        });
        const roleData = await roleResponse.json();
        if (!roleResponse.ok) {
          if (roleData.error === "CANNOT_REMOVE_SELF_ADMIN") {
            throw new Error("不能取消当前正在操作账号的管理员身份。");
          }
          if (roleData.error === "LAST_ADMIN") {
            throw new Error("系统至少需要保留一个正式管理员。");
          }
          if (roleData.error === "LAST_ACTIVE_ADMIN") {
            throw new Error("系统至少需要保留一个可用的正式管理员。");
          }
          throw new Error("用户身份保存失败。");
        }
        roleSaved = true;
      }

      const hasMembership =
        detail.membership.state !== "NONE" && detail.membership.state !== "REVOKED";
      if (membershipSettingsChanged && membershipMode === "NONE" && hasMembership) {
        const response = await fetch(
          "/api/admin/users/" + encodeURIComponent(detail.id) + "/membership",
          {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "REVOKE", changeNote: "用户设置：取消会员" })
          }
        );
        if (!response.ok) {
          throw new Error(
            roleSaved
              ? "身份已保存，但取消会员失败。已刷新真实状态，请重新处理会员设置。"
              : "取消会员失败。"
          );
        }
      } else if (membershipSettingsChanged && membershipMode !== "NONE") {
        const response = await fetch(
          "/api/admin/users/" + encodeURIComponent(detail.id) + "/membership",
          {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "SET",
            startsAt: new Date(membershipForm.startsAt).toISOString(),
            expiresAt: membershipMode === "PERMANENT"
              ? null
              : new Date(membershipForm.expiresAt).toISOString(),
            permanent: membershipMode === "PERMANENT",
            membershipNote: membershipForm.membershipNote,
            changeNote: membershipForm.changeNote || "用户设置：会员变更"
          })
        }
        );
        if (!response.ok) {
          throw new Error(
            roleSaved
              ? "身份已保存，但会员设置失败。已刷新真实状态，请检查会员时间后重试。"
              : "会员设置保存失败，请检查开始和到期时间。"
          );
        }
      }

      await loadUsers(detail.id);
      await loadDetail(detail.id);
      setDetailMode("OVERVIEW");
      setMessage("用户设置已保存。");
    } catch (error) {
      await loadUsers(detail.id);
      await loadDetail(detail.id);
      setMessage(error instanceof Error ? error.message : "用户设置保存失败");
    } finally {
      setSaving(false);
    }
  }

  function quickExtend(kind: "7" | "30" | "90" | "YEAR") {
    const current =
      detail?.membership.expiresAt && new Date(detail.membership.expiresAt) > new Date()
        ? toLocalInput(detail.membership.expiresAt)
        : toLocalInput(new Date().toISOString());
    setMembershipForm((form) => ({
      ...form,
      expiresAt: kind === "YEAR" ? addYear(current) : addDays(current, Number(kind))
    }));
  }

  const settingsMembershipActive = (() => {
    if (membershipMode === "NONE") return false;
    const startsAt = new Date(membershipForm.startsAt).getTime();
    const now = Date.now();
    if (!Number.isFinite(startsAt) || startsAt > now) return false;
    if (membershipMode === "PERMANENT") return true;
    const expiresAt = new Date(membershipForm.expiresAt).getTime();
    return Number.isFinite(expiresAt) && expiresAt > now;
  })();
  const settingsWorkspaceQualified = settingsRole === "ADMIN" || settingsMembershipActive;
  const settingsWorkspaceReason =
    settingsRole === "ADMIN"
      ? "管理员"
      : settingsMembershipActive
        ? "有效会员"
        : membershipMode === "TIMED" &&
            new Date(membershipForm.startsAt).getTime() > Date.now()
          ? "会员尚未生效"
          : "当前无有效会员";
  const currentMembershipMode: MembershipMode = detail
    ? detail.membership.state === "NONE" || detail.membership.state === "REVOKED"
      ? "NONE"
      : detail.membership.startsAt && !detail.membership.expiresAt
        ? "PERMANENT"
        : "TIMED"
    : "NONE";
  const membershipSettingsChanged = detail
    ? currentMembershipMode !== membershipMode ||
      (membershipMode !== "NONE" &&
        toLocalInput(detail.membership.startsAt) !== membershipForm.startsAt) ||
      (membershipMode === "TIMED" &&
        toLocalInput(detail.membership.expiresAt) !== membershipForm.expiresAt)
    : false;

  return (
    <div className="admin-user-management">
      <section className="admin-user-toolbar">
        <div className="admin-user-search">
          <span>搜索</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="邮箱或用户名称"
          />
        </div>
        <div className="admin-user-filters">
          <select
            value={accountStatus}
            onChange={(event) => setAccountStatus(event.target.value)}
          >
            <option value="ALL">全部账号</option>
            <option value="ACTIVE">正常</option>
            <option value="DISABLED">已停用</option>
          </select>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="ALL">全部身份</option>
            <option value="ADMIN">管理员</option>
            <option value="USER">普通用户</option>
          </select>
          <div className="admin-user-filter-tabs" aria-label="用户权益筛选">
            <button type="button" className={membership === "ALL" ? "is-active" : ""} onClick={() => setMembership("ALL")}>全部用户</button>
            <button type="button" className={membership === "ACTIVE" ? "is-active" : ""} onClick={() => setMembership("ACTIVE")}>有效会员</button>
            <button type="button" className={membership === "EXPIRING" ? "is-active" : ""} onClick={() => setMembership("EXPIRING")}>30 天内到期</button>
            <button type="button" className={membership === "INACTIVE" ? "is-active" : ""} onClick={() => setMembership("INACTIVE")}>已到期 / 已取消</button>
          </div>
        </div>
        <div className="admin-user-toolbar-stat">
          <span>当前结果</span>
          <strong>{items.length}</strong>
        </div>
      </section>

      <div className="admin-user-workspace">
        <section className="admin-user-list-panel">
          <div className="admin-user-panel-head">
            <div>
              <span>USERS & ENTITLEMENTS</span>
              <strong>用户列表</strong>
            </div>
            <small>{loading ? "读取中…" : items.length + " 人"}</small>
          </div>
          <div className="admin-user-list">
            {!loading && items.length === 0 ? (
              <p className="admin-empty">没有符合条件的用户。</p>
            ) : null}
            {items.map((item) => (
              <div
                className={"admin-user-row " + (selectedId === item.id ? "is-active" : "")}
                key={item.id}
              >
                <button
                  type="button"
                  className="admin-user-row-main"
                  onClick={() => {
                    setSelectedId(item.id);
                    setActiveMenuId(null);
                    setDetailMode("OVERVIEW");
                    setAuditOpen(false);
                  }}
                >
                  <div>
                    <strong>{item.displayName || item.email}</strong>
                    <span>{item.email}</span>
                  </div>
                  <div className="admin-user-row-state">
                    <small className={item.isAdmin ? "admin-role-badge" : ""}>
                      {item.isAdmin
                        ? "管理员"
                        : item.membership.state === "ACTIVE"
                          ? "会员"
                          : "免费"}
                    </small>
                    <em>
                      {item.isAdmin
                        ? item.accountStatus === "ACTIVE" ? "账号正常" : "账号已停用"
                        : item.membership.state === "ACTIVE" && item.membership.expiresAt
                          ? formatDate(item.membership.expiresAt) + " 到期"
                          : item.accountStatus === "ACTIVE" ? "账号正常" : "账号已停用"}
                    </em>
                  </div>
                </button>
                <div className="admin-user-row-menu-wrap">
                  <button
                    type="button"
                    className="admin-user-row-menu-trigger"
                    aria-label="账号操作"
                    onClick={() => setActiveMenuId((id) => id === item.id ? null : item.id)}
                  >
                    ···
                  </button>
                </div>
                {activeMenuId === item.id ? (
                  <div className="admin-user-row-actions-inline is-compact">
                    <button type="button" onClick={() => openUserSettings(item)}>
                      用户设置
                    </button>
                    <button
                      type="button"
                      className={item.accountStatus === "ACTIVE" ? "is-danger" : ""}
                      onClick={() => toggleAccountStatusFromList(item)}
                      disabled={saving}
                    >
                      {item.accountStatus === "ACTIVE" ? "停用账号" : "恢复账号"}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="admin-user-detail-panel">
          {!detail || detailLoading ? (
            <div className="admin-user-detail-empty">
              <strong>
                {detailLoading || (detailMode === "SETTINGS" && selectedId)
                  ? detailMode === "SETTINGS"
                    ? "正在读取用户设置…"
                    : "正在读取用户…"
                  : "选择一个用户"}
              </strong>
              <p>
                {detailMode === "SETTINGS"
                  ? "读取完成后可统一设置用户身份与会员。"
                  : "点击用户查看会员、学习和个人 AI 工作台概况。"}
              </p>
            </div>
          ) : (
            <>
              <header className="admin-user-detail-head admin-user-summary-head">
                <div>
                  <div className="admin-user-identity-line">
                    <span className={detail.isAdmin ? "admin-role-badge" : ""}>
                      {detail.isAdmin
                        ? "管理员"
                        : detail.membership.state === "ACTIVE"
                          ? "会员"
                          : "免费用户"}
                    </span>
                    <span>{detail.accountStatus === "ACTIVE" ? "账号正常" : "账号已停用"}</span>
                  </div>
                  <h2>{detail.displayName || "未设置昵称"}</h2>
                  <p>{detail.email}</p>
                </div>
                {detailMode === "SETTINGS" ? <strong className="admin-user-mode-label">用户设置</strong> : null}
              </header>

              {detailMode === "OVERVIEW" ? (
                <>
                  <div className={"admin-user-summary-grid " + (detail.isAdmin ? "is-admin-user" : "")}>
                    {!detail.isAdmin ? (
                      <section className="admin-summary-card">
                        <div className="admin-user-section-title">
                          <strong>会员</strong><span>商业关系</span>
                        </div>
                        <div className="admin-summary-primary">
                          <strong>{membershipLabels[detail.membership.state]}</strong>
                          <span>
                            {detail.membership.state === "ACTIVE"
                              ? detail.membership.expiresAt
                                ? "有效至 " + formatDate(detail.membership.expiresAt)
                                : "长期有效"
                              : "当前没有有效会员"}
                          </span>
                        </div>
                        <dl className="admin-summary-facts">
                          <div><dt>权益来源</dt><dd>{detail.membership.source || "—"}</dd></div>
                        </dl>
                      </section>
                    ) : null}

                    <section className="admin-summary-card">
                      <div className="admin-user-section-title">
                        <strong>学习</strong><span>真实学习事实</span>
                      </div>
                      <div className="admin-summary-primary">
                        <strong>{detail.learning.completedLessons} 节</strong>
                        <span>已完成课程</span>
                      </div>
                      <dl className="admin-summary-facts">
                        <div><dt>最近学习</dt><dd>{formatDate(detail.learning.lastLearningAt, true)}</dd></div>
                      </dl>
                      <span className="admin-summary-footnote">后续学习质量问题由“学习洞察”统一处理。</span>
                    </section>

                    <section className="admin-summary-card">
                      <div className="admin-user-section-title">
                        <strong>个人 AI 工作台</strong><span>使用元数据</span>
                      </div>
                      <div className="admin-summary-primary">
                        <strong>PLANNED</strong>
                        <span>使用记录尚未接入</span>
                      </div>
                      <dl className="admin-summary-facts">
                        <div><dt>最近使用</dt><dd>—</dd></div>
                        <div><dt>近 30 天运行</dt><dd>—</dd></div>
                        <div><dt>成功 / 失败</dt><dd>—</dd></div>
                        <div><dt>导出 / 同步</dt><dd>—</dd></div>
                        <div><dt>Token / 调用量</dt><dd>—</dd></div>
                      </dl>
                      <span className="admin-summary-footnote">只记录使用元数据，不保存用户内容。</span>
                    </section>
                  </div>

                  <section className="admin-data-boundary-note">
                    <strong>个人 AI 工作台数据边界</strong>
                    <span>平台只记录后续接入的使用元数据。用户原始素材、完整 Prompt、AI 完整回复、文章全文、图片 / 音频 / 视频、每一步中间产物继续只保存在本地 IndexedDB。</span>
                  </section>

                  <section className="admin-user-audit-secondary">
                    <button type="button" className="admin-audit-toggle" onClick={() => setAuditOpen((open) => !open)}>
                      <span>管理员操作记录</span>
                      <strong>{auditOpen ? "收起" : "查看最近 20 条"}</strong>
                    </button>
                    {auditOpen ? (
                      <div className="admin-user-audit-list">
                        {detail.audit.length === 0 ? <p className="admin-empty">暂无管理员操作记录。</p> : null}
                        {detail.audit.map((item) => (
                          <div key={item.id}>
                            <div>
                              <strong>{auditLabels[item.action] || item.action}</strong>
                              <span>{formatDate(item.createdAt, true)}</span>
                            </div>
                            <p>{item.note || "未填写变更说明"}</p>
                            <small>{item.actorEmail}</small>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </section>
                </>
              ) : (
                <section className="admin-user-settings">
                  <div className="admin-user-settings-intro">
                    <div>
                      <strong>用户设置</strong>
                      <span>只修改身份与会员事实。学习和工作台数据不会在这里编辑。</span>
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={() => setDetailMode("OVERVIEW")}>
                      返回用户概况
                    </button>
                  </div>

                  <div className="admin-user-settings-section">
                    <div className="admin-user-section-title">
                      <strong>身份</strong><span>决定是否可进入管理后台</span>
                    </div>
                    <div className="admin-user-settings-options">
                      <button
                        type="button"
                        className={settingsRole === "USER" ? "is-active" : ""}
                        onClick={() => setSettingsRole("USER")}
                      >
                        普通用户
                      </button>
                      <button
                        type="button"
                        className={settingsRole === "ADMIN" ? "is-active" : ""}
                        onClick={() => setSettingsRole("ADMIN")}
                      >
                        管理员
                      </button>
                    </div>
                    <p className="admin-user-settings-help">管理员可进入管理后台，并自动获得会员能力；管理员身份不会创建会员记录。</p>
                  </div>

                  <div className="admin-user-settings-section">
                    <div className="admin-user-section-title">
                      <strong>会员</strong><span>商业关系</span>
                    </div>
                    <div className="admin-user-settings-options">
                      <button
                        type="button"
                        className={membershipMode === "NONE" ? "is-active" : ""}
                        onClick={() => setMembershipMode("NONE")}
                      >
                        非会员
                      </button>
                      <button
                        type="button"
                        className={membershipMode === "TIMED" ? "is-active" : ""}
                        onClick={() => setMembershipMode("TIMED")}
                      >
                        定时会员
                      </button>
                      <button
                        type="button"
                        className={membershipMode === "PERMANENT" ? "is-active" : ""}
                        onClick={() => setMembershipMode("PERMANENT")}
                      >
                        永久会员
                      </button>
                    </div>

                    {membershipMode !== "NONE" ? (
                      <>
                        {membershipMode === "TIMED" ? (
                          <div className="admin-membership-quick">
                            <button type="button" onClick={() => quickExtend("7")}>+ 7 天</button>
                            <button type="button" onClick={() => quickExtend("30")}>+ 30 天</button>
                            <button type="button" onClick={() => quickExtend("90")}>+ 90 天</button>
                            <button type="button" onClick={() => quickExtend("YEAR")}>+ 1 年</button>
                          </div>
                        ) : null}
                        <div className="admin-membership-date-grid">
                          <label>
                            <span>开始时间</span>
                            <input
                              type="datetime-local"
                              value={membershipForm.startsAt}
                              onChange={(event) =>
                                setMembershipForm((form) => ({ ...form, startsAt: event.target.value }))
                              }
                            />
                          </label>
                          {membershipMode === "TIMED" ? (
                            <label>
                              <span>到期时间</span>
                              <input
                                type="datetime-local"
                                value={membershipForm.expiresAt}
                                onChange={(event) =>
                                  setMembershipForm((form) => ({ ...form, expiresAt: event.target.value }))
                                }
                              />
                            </label>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <p className="admin-user-settings-help">保存后，该用户不会保留有效会员权益；历史会员记录和学习数据不会删除。</p>
                    )}
                  </div>

                  <div className="admin-user-capability-result">
                    <div>
                      <span>当前能力结果</span>
                      <strong>个人 AI 工作台：{settingsWorkspaceQualified ? "有访问资格" : "暂无访问资格"}</strong>
                    </div>
                    <small>原因：{settingsWorkspaceReason}。访问资格由系统规则计算，不在这里单独配置。</small>
                  </div>

                  <div className="admin-user-settings-actions">
                    <button className="btn btn-primary" type="button" onClick={saveUserSettings} disabled={saving}>
                      {saving ? "保存中…" : "保存用户设置"}
                    </button>
                    <button className="btn btn-secondary" type="button" onClick={() => setDetailMode("OVERVIEW")} disabled={saving}>
                      取消
                    </button>
                  </div>
                </section>
              )}

              {message ? <div className="admin-message">{message}</div> : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
