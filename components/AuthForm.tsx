"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialMode: "register" | "login";
  courseSlug?: string;
  returnTo?: string;
};

const errorMessages: Record<string, string> = {
  INVALID_EMAIL: "请输入有效的邮箱地址。",
  INVALID_PASSWORD: "密码需要 8–128 个字符。",
  EMAIL_EXISTS: "这个邮箱已经注册，请直接登录。",
  INVALID_CREDENTIALS: "邮箱或密码不正确。",
  REGISTER_FAILED: "注册失败，请稍后重试。",
  LOGIN_FAILED: "登录失败，请稍后重试。"
};

function safeReturnTo(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function AuthForm({ initialMode, courseSlug, returnTo }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      displayName: mode === "register" ? String(form.get("displayName") ?? "") : undefined
    };

    try {
      const response = await fetch("/api/auth/" + mode, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(errorMessages[data.error] ?? "操作失败，请稍后重试。");
        return;
      }

      if (courseSlug) {
        const enrollResponse = await fetch("/api/learning/enroll", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ courseSlug })
        });
        if (!enrollResponse.ok) {
          setError("账号已创建，但加入课程失败，请返回课程页重试。");
          return;
        }
      }

      window.location.href = safeReturnTo(returnTo);
    } catch {
      setError("网络连接失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-tabs" aria-label="账号操作">
        <button
          type="button"
          className={mode === "register" ? "is-active" : ""}
          onClick={() => {
            setMode("register");
            setError(null);
          }}
        >
          注册
        </button>
        <button
          type="button"
          className={mode === "login" ? "is-active" : ""}
          onClick={() => {
            setMode("login");
            setError(null);
          }}
        >
          登录
        </button>
      </div>

      <div className="auth-heading">
        <div className="kicker">{mode === "register" ? "Join OPC AI" : "Welcome back"}</div>
        <h1>{mode === "register" ? "加入学习" : "继续你的学习"}</h1>
        <p>
          {mode === "register"
            ? "创建账号后，学习进度会保存到你的账户中。"
            : "登录后继续上次的课程与学习进度。"}
        </p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {mode === "register" && (
          <label>
            <span>称呼（可选）</span>
            <input name="displayName" autoComplete="name" maxLength={80} />
          </label>
        )}
        <label>
          <span>邮箱</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
        <label>
          <span>密码</span>
          <input
            name="password"
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            required
            minLength={8}
            maxLength={128}
          />
          {mode === "register" && <small>至少 8 个字符。</small>}
        </label>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <button className="btn btn-primary full-btn" type="submit" disabled={submitting}>
          {submitting
            ? "处理中…"
            : mode === "register"
              ? "注册并加入学习 →"
              : "登录并继续 →"}
        </button>
      </form>

      <p className="auth-footnote">
        第一版 MVP 暂不包含邮箱验证和找回密码；微信登录将在后续渠道阶段接入。
      </p>
    </div>
  );
}

