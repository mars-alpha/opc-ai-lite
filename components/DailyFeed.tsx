"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { destinationLabel, type KnowledgeItem } from "../lib/contentDemo";
import { LockedAccessCta } from "./LockedAccessCta";

type FullAccess = { allowed: boolean; reason: string };

export function DailyFeed({
  items,
  fullAccess,
  lockedFrom = 3,
  courseEntryAllowed = false
}: {
  items: KnowledgeItem[];
  fullAccess?: FullAccess;
  lockedFrom?: number;
  courseEntryAllowed?: boolean;
}) {
  const categories = useMemo(
    () => ["全部", ...Array.from(new Set(items.map((item) => item.category)))],
    [items]
  );
  const lockedIds = useMemo(
    () => new Set(items.slice(lockedFrom).map((item) => item.id)),
    [items, lockedFrom]
  );
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const categoryMatch = category === "全部" || item.category === category;
      const searchMatch =
        !normalized ||
        item.title.toLowerCase().includes(normalized) ||
        item.summary.toLowerCase().includes(normalized) ||
        item.stage.toLowerCase().includes(normalized);
      return categoryMatch && searchMatch;
    });
  }, [category, items, query]);

  return (
    <div className="daily-feed">
      <div className="demo-note">
        <span>OPC AI Daily</span>
        <p>
          {fullAccess?.allowed
            ? fullAccess.reason === "MEMBERSHIP"
              ? "当前 OPC 会员权益已生效，可查看全部已发布 AI Daily。"
              : "当前公众号关注权益已生效，可查看全部已发布 AI Daily。"
            : lockedIds.size > 0
              ? "Top 3 免费阅读全文；后续内容继续展示标题与摘要，关注公众号或加入 OPC 会员后解锁完整内容。"
              : "当前展示已发布 AI Daily。"}
        </p>
      </div>

      <div className="daily-toolbar">
        <div className="filter-row" aria-label="AI 日报分类">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={"filter-chip " + (category === item ? "active" : "")}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索变化、课程或 Stage"
            aria-label="搜索日报内容"
          />
        </label>
      </div>

      <div className="daily-results">
        {filtered.map((item, index) => {
          const isLocked = !fullAccess?.allowed && lockedIds.has(item.id);
          const courseHref =
            item.courseSlug && item.lessonId
              ? "/courses/" + item.courseSlug + "/lessons/" + item.lessonId
              : item.courseSlug
                ? "/courses/" + item.courseSlug
                : null;
          const href = courseEntryAllowed && courseHref ? courseHref : "/learning-path";

          return (
            <article className={"daily-item" + (isLocked ? " is-locked" : "")} key={item.id}>
              <div className={"row-thumb daily-thumb thumb-" + ((index % 3) + 1)} />
              <div className="daily-item-copy">
                <div className="daily-meta">
                  <span>{item.category}</span>
                  <span>{item.readingTime}</span>
                  {isLocked ? <span className="locked-badge">锁定</span> : null}
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <div className="daily-relation">
                  <span>{item.stageLabel}</span>
                  <span>{item.impactLabel}</span>
                </div>
                <div className="tag-row">
                  <span className="tag">{destinationLabel[item.destination]}</span>
                  {isLocked ? <span className="tag locked-tag">关注公众号解锁完整内容</span> : null}
                </div>
              </div>
              {isLocked ? (
                <a className="round-arrow is-locked" href="#daily-unlock" aria-label={"解锁：" + item.title}>⌁</a>
              ) : (
                <Link
                  className="round-arrow"
                  href={href}
                  aria-label={courseEntryAllowed && courseHref ? "查看相关课程：" + item.title : "查看学习路径：" + item.title}
                >
                  →
                </Link>
              )}
            </article>
          );
        })}

        {filtered.length === 0 ? (
          <div className="empty-state">
            <strong>没有找到相关内容</strong>
            <p>换一个关键词或分类试试。</p>
          </div>
        ) : null}

        {!fullAccess?.allowed && lockedIds.size > 0 ? (
          <div id="daily-unlock">
            <LockedAccessCta kind="FOLLOW" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
