"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLearningCourseHealthDetail } from "./admin-learning/AdminLearningCourseHealthDetail";
import { AdminLearningCourseQueue } from "./admin-learning/AdminLearningCourseQueue";
import { type CourseLearningHealthView } from "./admin-learning/learning-insight-view";

type Gate1Decision = "ANALYZE" | "WATCH" | "DISMISS";
const PAGE_SIZE = 20;

export function AdminLearningWorkbenchV2({ courses }: { courses: CourseLearningHealthView[] }) {
  const router = useRouter();
  const [items, setItems] = useState(courses);
  const [selectedCourseKey, setSelectedCourseKey] = useState<string | null>(courses[0]?.courseKey ?? null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [analysisRunToken, setAnalysisRunToken] = useState(0);
  const [analysisRunCourseKey, setAnalysisRunCourseKey] = useState<string | null>(null);
  const [compareOpenToken, setCompareOpenToken] = useState(0);
  const [compareOpenCourseKey, setCompareOpenCourseKey] = useState<string | null>(null);
  const [analysisStateByCourse, setAnalysisStateByCourse] = useState<
    Record<string, { running: boolean; ready: boolean; completed: boolean }>
  >({});

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
        return left.curriculumOrder - right.curriculumOrder;
      });
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedCourse =
    items.find((course) => course.courseKey === selectedCourseKey) ??
    pageItems[0] ??
    null;

  useEffect(() => setPage(1), [search, statusFilter]);
  useEffect(() => setItems(courses), [courses]);
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

  function manualEdit() {
    if (!selectedCourse?.maintenanceKey) return;
    window.sessionStorage.setItem("opc_admin_course_selected_key", selectedCourse.maintenanceKey);
    window.sessionStorage.setItem("opc_admin_course_intent", "EDIT");
    window.location.assign(
      "/admin/courses?course=" +
        encodeURIComponent(selectedCourse.maintenanceKey) +
        "&intent=edit"
    );
  }

  async function decide(decision: Gate1Decision) {
    if (!selectedCourse) return;
    if (decision === "ANALYZE") {
      setAnalysisStateByCourse((current) => ({
        ...current,
        [selectedCourse.courseKey]: { running: true, ready: false, completed: false }
      }));
      setAnalysisRunCourseKey(selectedCourse.courseKey);
      setAnalysisRunToken((current) => current + 1);
    }
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(
        "/api/admin/learning/courses/" +
          encodeURIComponent(selectedCourse.courseKey) +
          "/decision" +
          (selectedCourse.simulation ? "?review=1" : ""),
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
        current.map((course) => {
          if (course.courseKey !== selectedCourse.courseKey) return course;
          const issues = course.issues.map((issue) => ({
            ...issue,
            status: statusMap.get(issue.sourceType + ":" + issue.id) ?? issue.status
          }));
          const openIssues = issues.filter(
            (issue) =>
              ["OPEN", "ANALYSIS_READY", "UNDER_REVIEW", "REVIEW_REQUIRED"].includes(
                issue.status
              )
          );
          const openIssueCount = openIssues.length;
          const oldestOpenIssueAt =
            openIssues
              .map((issue) => issue.createdAt)
              .filter(Boolean)
              .sort()[0] ?? null;
          return {
            ...course,
            issues,
            openIssueCount,
            oldestOpenIssueAt,
            healthStatus:
              openIssueCount >= 10 ? "ATTENTION" : openIssueCount >= 5 ? "WATCH" : "NORMAL"
          };
        })
      );
      if (decision === "ANALYZE") {
        setMessage("AI 正在根据有效数据分析整门课程…");
      } else {
        setMessage(
          decision === "WATCH"
            ? "已设为继续观察，后续真实问题会继续累计。"
            : "已将当前可处理问题标记为无需处理。"
        );
        router.refresh();
      }
    } catch {
      if (decision === "ANALYZE") {
        setAnalysisStateByCourse((current) => ({
          ...current,
          [selectedCourse.courseKey]: { running: false, ready: false, completed: false }
        }));
      }
      setMessage("处理失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  const selectedAnalysisState = selectedCourse
    ? analysisStateByCourse[selectedCourse.courseKey] ?? { running: false, ready: false, completed: false }
    : { running: false, ready: false, completed: false };

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
        onManualEdit={manualEdit}
        analysisRunning={selectedAnalysisState.running}
        comparisonReady={selectedAnalysisState.ready}
        analysisCompleted={selectedAnalysisState.completed}
        analysisRunToken={analysisRunToken}
        analysisRunCourseKey={analysisRunCourseKey}
        compareOpenToken={compareOpenToken}
        compareOpenCourseKey={compareOpenCourseKey}
        onOpenCompare={() => {
          if (!selectedCourse) return;
          setCompareOpenCourseKey(selectedCourse.courseKey);
          setCompareOpenToken((current) => current + 1);
        }}
        onAnalysisStateChange={(state) => {
          if (!selectedCourse) return;
          setAnalysisStateByCourse((current) => ({
            ...current,
            [selectedCourse.courseKey]: state
          }));
          if (!state.running && state.ready) {
            setMessage("AI 综合诊断和更新对照已准备完成。");
          }
        }}
        onPublished={() => {
          if (!selectedCourse) return;
          setItems((current) =>
            current.map((course) =>
              course.courseKey !== selectedCourse.courseKey
                ? course
                : {
                    ...course,
                    issues: course.issues.map((issue) => ({
                      ...issue,
                      status: ["REVIEWED", "DISMISSED"].includes(issue.status)
                        ? issue.status
                        : "REVIEWED"
                    })),
                    openIssueCount: 0,
                    oldestOpenIssueAt: null,
                    healthStatus: "NORMAL"
                  }
            )
          );
          router.refresh();
        }}
      />
    </div>
  );
}
