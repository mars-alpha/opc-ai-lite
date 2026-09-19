"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { destinationLabel, type KnowledgeItem } from "../lib/contentDemo";

export function DailyFeed({ items }: { items: KnowledgeItem[] }) {
  const categories = useMemo(
    () => ["全部", ...Array.from(new Set(items.map((item) => item.category)))],
    [items]
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
        <p>前台只展示已发布内容；当前开发数据仍用于验证 Daily → Knowledge → Course 的产品关系。</p>
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
          const href = item.courseSlug && item.lessonId
            ? "/courses/" + item.courseSlug + "/lessons/" + item.lessonId
            : item.courseSlug
              ? "/courses/" + item.courseSlug
              : "/learning-path";

          return (
            <article className="daily-item" key={item.id}>
              <div className={"row-thumb daily-thumb thumb-" + ((index % 3) + 1)} />
              <div className="daily-item-copy">
                <div className="daily-meta">
                  <span>{item.category}</span>
                  <span>{item.readingTime}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <div className="daily-relation">
                  <span>{item.stageLabel}</span>
                  <span>{item.impactLabel}</span>
                </div>
                <div className="tag-row">
                  <span className="tag">{destinationLabel[item.destination]}</span>
                </div>
              </div>
              <Link className="round-arrow" href={href} aria-label={"查看相关课程：" + item.title}>→</Link>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <div className="empty-state">
            <strong>没有找到相关内容</strong>
            <p>换一个关键词或分类试试。</p>
          </div>
        )}
      </div>
    </div>
  );
}

