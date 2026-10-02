"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLearningCourseHealthDetail } from "./admin-learning/AdminLearningCourseHealthDetail";
import { AdminLearningCourseQueue } from "./admin-learning/AdminLearningCourseQueue";
import { type CourseLearningHealthView } from "./admin-learning/learning-insight-view";

type Gate1Decision = "ANALYZE" | "WATCH" | "DISMISS";
const PAGE_SIZE = 20;

export function AdminLearningWorkbenchV2({ courses }: { courses: CourseLearningHealthView[] }) {
  const [items, setItems] = useState(courses);
  const [selectedCourseKey, setSelectedCourseKey] = useState<string | null>(courses[0]?.courseKey ?? null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...items]
      .filter((course) => {
        if (query && !course.lessonTitle.toLowerCase().includes(query)) return false;
        if (statusFilter !== "ALL" && course.healthStatus !== statusFilter) return false;
        return true;
      })
      .sort((left, right) => {
        const rank = { ATTENTION: 3, WATCH: 2, NORMAL: 1 };
        const healthDiff = rank[right.healthStatus] - rank[left.healthStatus];
        if (healthDiff !== 0) return healthDiff;
        const leftOpenAt = left.oldestOpenIssueAt ? Date.parse(left.oldestOpenIssueAt) : Number.POSITIVE_INFINITY;
        const rightOpenAt = right.oldestOpenIssueAt ? Date.parse(right.oldestOpenIssueAt) : Number.POSITIVE_INFINITY;
        if (leftOpenAt !== rightOpenAt) return leftOpenAt - rightOpenAt;
        return left.courseKey.localeCompare(right.courseKey);
      });
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedCourse =
    items.find((course) => course.courseKey === selectedCourseKey) ??
    pageItems[0] ??
    null;

  useEffect(() => setPage(1), [search, statusFilter]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  useEffect(() => {
    if (selectedCourse && filtered.some((course) => course.courseKey === selectedCourse.courseKey)) return;
    const next = pageItems[0] ?? null;
    setSelectedCourseKey(next?.courseKey ?? null);
  }, [filtered, pageItems, selectedCourse]);

  function selectCourse(courseKey: string) {
    const course = items.find((item) => item.courseKey === courseKey) ?? null;
    setSelectedCourseKey(courseKey);
    setMessage(null);
  }

  async function decide(decision: Gate1Decision) {
    if (!selectedCourse) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(
        "/api/admin/learning/courses/" + encodeURIComponent(selectedCourse.courseKey) + "/decision",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ decision })
        }
      );
      const result = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(result?.result?.issueStatuses)) throw new Error("GATE1_FAILED");

      const statusMap = new Map<string, string>(
        result.result.issueStatuses.map(
          (item: { id: string; sourceType: string; status: string }) =>
            [item.sourceType + ":" + item.id, item.status] as const
        )
      );
      setItems((current) =>
        current.map((course) =>
          course.courseKey !== selectedCourse.courseKey
            ? course
            : {
                ...course,
                issues: course.issues.map((issue) => ({
                  ...issue,
                  status: statusMap.get(issue.sourceType + ":" + issue.id) ?? issue.status
                }))
              }
        )
      );
      setMessage(
        decision === "ANALYZE"
          ? "已确认进入整课 AI 诊断准备阶段；当前只记录授权，不会自动修改课程。"
          : decision === "WATCH"
            ? "已设为继续观察，后续真实问题会继续累计。"
            : "已将当前可处理问题标记为无需处理。"
      );
    } catch {
      setMessage("处理失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-learning-v2 admin-learning-health-center">
      <AdminLearningCourseQueue
        courses={pageItems}
        selectedCourseKey={selectedCourse?.courseKey ?? null}
        totalCount={filtered.length}
        page={page}
        totalPages={totalPages}
        search={search}
        statusFilter={statusFilter}
        onSearch={setSearch}
        onStatusFilter={setStatusFilter}
        onSelect={selectCourse}
        onPage={setPage}
      />
      <AdminLearningCourseHealthDetail
        course={selectedCourse}
        busy={busy}
        message={message}
        onDecision={decide}
      />
    </div>
  );
}
