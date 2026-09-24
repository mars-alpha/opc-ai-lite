"use client";

import Link from "next/link";
import { useState } from "react";
import type { KnowledgeItem } from "../lib/contentDemo";
import { Reveal } from "./Reveal";

export function HotspotPracticeList({ items }: { items: KnowledgeItem[] }) {
  const [visibleCount, setVisibleCount] = useState(3);
  const visibleItems = items.slice(0, visibleCount);

  return (
    <>
      <div className="practice-list">
        {visibleItems.map((item, index) => (
          <Reveal className="practice-row" key={item.id} delay={index * 45}>
            <span className="practice-index">{String(index + 1).padStart(2, "0")}</span>
            <div className="practice-copy">
              <small>{item.stageLabel} · {item.readingTime}</small>
              <h3>{item.title.replace(/^示例：/, "")}</h3>
              <p><b>目标：</b>{item.summary}</p>
              <p className="acceptance"><b>验收：</b>完成对应的单项能力练习，并能说明这个知识点在实际任务中应该如何使用。</p>
            </div>
            <Link className="practice-state" href={"/practice/latest/" + item.id}>进入练习</Link>
          </Reveal>
        ))}
      </div>

      {visibleCount < items.length ? (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => Math.min(count + 3, items.length))}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            margin: "22px auto 0",
            padding: 0,
            border: 0,
            background: "transparent",
            color: "var(--blue)",
            font: "inherit",
            cursor: "pointer"
          }}
        >
          <span>查看更多</span>
          <span aria-hidden="true">⌄</span>
        </button>
      ) : items.length > 3 ? (
        <div
          aria-live="polite"
          style={{
            margin: "22px auto 0",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: "14px"
          }}
        >
          — 已展示全部内容 —
        </div>
      ) : null}
    </>
  );
}
