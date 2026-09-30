"use client";

import { useState } from "react";
import { AdminContentAnalysisPanel } from "./AdminContentAnalysisPanel";
import { AdminContentCandidateGenerator } from "./AdminContentCandidateGenerator";
import { AdminContentConsole } from "./AdminContentConsole";

type Stage = "LIBRARY" | "CANDIDATE" | "REVIEW";

const stages: Array<{ key: Stage; code: string; title: string; description: string }> = [
  { key: "LIBRARY", code: "01", title: "采集与分析", description: "采集器 / Core 带入原始资料，AI / Skill 负责事实提取和判断" },
  { key: "CANDIDATE", code: "02", title: "AI 候选生成", description: "Skill 基于已有素材生成不同内容角度，不从空白人工填写" },
  { key: "REVIEW", code: "03", title: "人工确认", description: "管理员一次性核对证据、候选和去向；通过后进入平台正式状态" }
];

export function AdminPlatformContentWorkspace() {
  const [stage, setStage] = useState<Stage>("LIBRARY");
  const current = stages.find((item) => item.key === stage) ?? stages[0];

  return (
    <div className="admin-platform-content-workspace">
      <div className="admin-platform-flow admin-platform-flow-interactive" role="tablist" aria-label="平台内容阶段">
        {stages.map((item) => (
          <button
            type="button"
            role="tab"
            aria-selected={stage === item.key}
            className={stage === item.key ? "is-active" : ""}
            onClick={() => setStage(item.key)}
            key={item.key}
          >
            <b>{item.code}</b>
            <strong>{item.title}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </div>

      <section className="admin-platform-stage-shell">
        <header className="admin-platform-stage-head">
          <div>
            <span>{current.code} / PLATFORM CONTENT</span>
            <h2>{current.title}</h2>
            <p>{current.description}</p>
          </div>
          <small>外部分发属于独立不可逆动作，需要时再增加确认</small>
        </header>

        {stage === "LIBRARY" ? (
          <AdminContentAnalysisPanel />
        ) : stage === "CANDIDATE" ? (
          <AdminContentCandidateGenerator onCreated={() => setStage("REVIEW")} />
        ) : (
          <AdminContentConsole focus={stage} key={stage} />
        )}
      </section>
    </div>
  );
}
