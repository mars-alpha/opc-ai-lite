"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { LearningCatalogCourse } from "../lib/learning/catalog";
import { useProgress } from "./ProgressProvider";

const nav = [
  { href: "/", label: "首页" },
  { href: "/learning-path", label: "学习路径" },
  { href: "/ai-daily", label: "AI 日报" },
  { href: "/practice", label: "进阶练习" }
];

function authHref(courseSlug: string, returnTo: string) {
  const params = new URLSearchParams({
    mode: "register",
    courseSlug,
    returnTo
  });
  return "/auth?" + params.toString();
}

export function Header({ catalog }: { catalog: LearningCatalogCourse[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const {
    ready,
    authenticated,
    completedCount,
    isCompleted,
    isEnrolled,
    enrollCourse
  } = useProgress();

  const learningCta = useMemo(() => {
    const fallbackCourse = catalog[0];
    if (!fallbackCourse) return null;

    const enrolled = catalog.filter((course) => isEnrolled(course.slug));
    const active =
      enrolled.find((course) => {
        const lessons = course.lessons;
        const done = completedCount(course.slug);
        return done < lessons.length;
      }) ?? enrolled[0];

    const course = active ?? fallbackCourse;
    const lessons = course.lessons;
    const next = lessons.find((lesson) => !isCompleted(course.slug, lesson.id)) ?? lessons[0];
    if (!next) return null;

    const href = "/courses/" + course.slug + "/lessons/" + next.id;
    return {
      course,
      href,
      enrolled: isEnrolled(course.slug),
      label: authenticated && isEnrolled(course.slug) ? "继续学习" : "加入学习"
    };
  }, [authenticated, catalog, completedCount, isCompleted, isEnrolled]);

  useEffect(() => {
    if (!ready || !learningCta) return;
    const target = authenticated
      ? learningCta.href
      : authHref(learningCta.course.slug, learningCta.href);
    router.prefetch(target);
  }, [authenticated, learningCta, ready, router]);

  async function handleLearningAction() {
    if (!learningCta) return;

    if (!authenticated) {
      router.push(authHref(learningCta.course.slug, learningCta.href));
      return;
    }

    if (learningCta.enrolled) {
      router.push(learningCta.href);
      return;
    }

    setJoining(true);
    try {
      const enrollment = enrollCourse(learningCta.course.slug);
      router.prefetch(learningCta.href);
      await enrollment;
      router.push(learningCta.href);
    } finally {
      setJoining(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } finally {
      setLoggingOut(false);
    }
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    router.prefetch("/ai-daily");
    if (learningCta?.href) router.prefetch(learningCta.href);
  }, [learningCta?.href, router]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          <img src="/opc-logo.png" alt="OPC AI" />
          <span>OPC AI</span>
        </Link>

        <button
          className="menu-toggle"
          aria-label="切换导航"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>

        <nav className={"nav " + (open ? "is-open" : "")}>
          {nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "is-active" : ""}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions">
          {ready && (
            authenticated ? (
              <button
                className="header-account"
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "退出中…" : "退出"}
              </button>
            ) : (
              <Link className="header-account" href="/auth?mode=login">
                登录
              </Link>
            )
          )}
          <button
            className="btn btn-primary header-cta"
            type="button"
            onClick={handleLearningAction}
            disabled={!ready || !learningCta || joining}
          >
            {joining ? "正在加入…" : learningCta?.label ?? "加入学习"} →
          </button>
        </div>
      </div>
    </header>
  );
}




