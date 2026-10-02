export type LearningIssueView = {
  id: string;
  sourceType: "INSIGHT" | "QUALITY_RISK";
  issueCategory: string;
  issueKey: string;
  status: string;
  distinctUserCount: number;
  evidence: unknown;
  createdAt: string;
  updatedAt: string;
  directComment?: string | null;
  simulation?: boolean;
};

export type LearningIssueGroupView = {
  category: string;
  occurrenceCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  affectedUserCount: number;
  issueIds: string[];
};

export type CourseLearningHealthView = {
  courseKey: string;
  lessonTitle: string;
  issueCount: number;
  feedbackCount: number;
  openIssueCount: number;
  affectedUserCount: number;
  updateCount: number;
  firstIssueAt: string;
  oldestOpenIssueAt: string | null;
  latestIssueAt: string;
  healthStatus: "ATTENTION" | "WATCH" | "NORMAL";
  issueGroups: LearningIssueGroupView[];
  issues: LearningIssueView[];
  simulation?: boolean;
};

export function issueLabel(category: string) {
  const labels: Record<string, string> = {
    DONT_UNDERSTAND: "理解困难",
    DONT_KNOW_HOW: "不知道怎么做",
    CHECK_DIFFICULTY: "检查理解异常",
    PRACTICE_DIFFICULTY: "实操困难",
    HIGH_HINT_USAGE: "提示依赖高",
    LOW_HELPFULNESS: "帮助度低",
    CONTENT_OUTDATED: "内容待更新核查",
    CONTENT_INCORRECT: "内容疑似错误",
    EVALUATION_DISPUTE: "评分疑问",
    OTHER: "其它待判断"
  };
  return labels[category] ?? "其它待判断";
}

export function isGovernanceIssueCategory(category: string) {
  return ["CONTENT_OUTDATED", "CONTENT_INCORRECT"].includes(category);
}

export function issueFamily(category: string) {
  if (["DONT_UNDERSTAND", "DONT_KNOW_HOW", "CHECK_DIFFICULTY", "HIGH_HINT_USAGE", "LOW_HELPFULNESS"].includes(category)) {
    return "LEARNING";
  }
  if (category === "PRACTICE_DIFFICULTY") return "PRACTICE";
  if (["CONTENT_OUTDATED", "CONTENT_INCORRECT"].includes(category)) return "CONTENT";
  return "OTHER";
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    OPEN: "待处理",
    REVIEW_REQUIRED: "待处理",
    ANALYSIS_READY: "已授权 AI 分析",
    UNDER_REVIEW: "处理中",
    REVIEWED: "已处理",
    DISMISSED: "无需处理"
  };
  return labels[status] ?? "待处理";
}

export function healthLabel(status: CourseLearningHealthView["healthStatus"]) {
  if (status === "ATTENTION") return "需要检查";
  if (status === "WATCH") return "关注";
  return "正常";
}

export function courseStatus(course: CourseLearningHealthView) {
  if (course.issues.some((issue) => ["ANALYSIS_READY", "UNDER_REVIEW"].includes(issue.status))) {
    return "已进入分析";
  }
  if (course.issues.length > 0 && course.issues.every((issue) => issue.status === "DISMISSED")) {
    return "无需处理";
  }
  return "待判断";
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN");
}

export function durationLabel(firstSeenAt: string, lastSeenAt: string) {
  const days = Math.max(
    0,
    Math.floor((Date.parse(lastSeenAt) - Date.parse(firstSeenAt)) / (24 * 60 * 60 * 1000))
  );
  if (days === 0) return "同日";
  return days + " 天";
}

export function metricSummary(issue: LearningIssueView) {
  const evidence =
    issue.evidence && typeof issue.evidence === "object" && !Array.isArray(issue.evidence)
      ? (issue.evidence as Record<string, unknown>)
      : null;
  const parts: string[] = [];
  if (typeof evidence?.incorrectRate === "number") parts.push("错误率 " + evidence.incorrectRate + "%");
  if (typeof evidence?.firstPassRate === "number") parts.push("首次通过 " + evidence.firstPassRate + "%");
  if (typeof evidence?.hintUsageRate === "number") parts.push("提示使用 " + evidence.hintUsageRate + "%");
  if (typeof evidence?.notHelpfulRate === "number") parts.push("低帮助度 " + evidence.notHelpfulRate + "%");
  if (issue.sourceType === "INSIGHT" && !isGovernanceIssueCategory(issue.issueCategory) && issue.distinctUserCount > 0) parts.push("至少 " + issue.distinctUserCount + " 位学员");
  return parts.join(" · ");
}
