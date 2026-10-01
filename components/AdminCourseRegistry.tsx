"use client";

import { useEffect, useMemo, useState } from "react";

type RegistryItem = {
  trackSlug: string;
  trackIndex: string;
  trackTitle: string;
  stageId: string;
  stageTitle: string;
  stageOrder: number;
  lessonId: string;
  lessonTitle: string;
  lessonSubtitle: string;
  learnerOutcome: string;
  lessonOrder: number;
  lessonType: "CONCEPT" | "APPLICATION" | "PRACTICE" | "PROJECT";
  specVersion: string;
  runtimeCourseSlug: string;
  runtimeLessonId: string;
  availability: "AVAILABLE";
  contentState: "FROZEN";
  maintenance?: CourseMaintenance | null;
  preview?: {
    courseHeader: { title: string; catalogTitle?: string; catalogSubtitle: string; lessonPageLead: string };
    stepMeta: { id: string; kind: "EXPLAIN" | "EXAMPLE" | "CHECK" | "PRACTICE" | "REVIEW" | "CAPABILITY"; title: string; objective: string; navigationDescription: string }[];
    intro: {
      title: string;
      situation: string;
      approaches: { label: string; text: string }[];
      takeaway: string;
      bottomDetails: { title: string; text: string }[];
    };
    example: {
      title: string;
      situation: string;
      before: string;
      after: string;
      result: string;
      knowledgeDepth: { title: string; text: string }[];
    };
    checks: {
      id: string;
      questionType: "SINGLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";
      masteryRole?: "BEST_JUDGMENT" | "MISCONCEPTION" | "BOUNDARY_CONDITIONS";
      question: string;
      options: { value: string; label: string }[];
      correctValues: string[];
      explanation: string;
      correctFeedback: string;
      incorrectFeedback: string;
    }[];
    practice: {
      id: string;
      title: string;
      goal: string;
      instructions: { key: string; label: string; prompt: string }[];
      hints: string[];
      rubric: { key: string; label: string; maxScore: number; minScore: number; example: string }[];
      passScore: number;
      activity: { title: string; instruction: string; prompt: string; reflection: string };
      referenceAnswer: string;
      referenceFill: Record<string, string>;
    };
    review: {
      items: string[];
      labels: { primary: string; secondary: string };
      knowledgeDepth: { title: string; text: string }[];
      mistakes: string[];
      related: string[];
    };
    capability: {
      title: string;
      gain: string[];
      selfAssessment: string[];
      triggerScenario: string;
      nextLessonValue: string;
    };
  };
};

type RegistryResponse = {
  summary: {
    tracks: number;
    stages: number;
    lessons: number;
    availableLessons: number;
    frozenLessons: number;
  };
  items: RegistryItem[];
};

type CourseView = "DETAIL" | "EDIT" | "REVIEW" | "DONE";

const lessonTypeLabel = {
  CONCEPT: "概念课",
  APPLICATION: "应用课",
  PRACTICE: "实操课",
  PROJECT: "项目课"
} as const;

const demoSteps = ["建立直觉", "讲透方法", "检查理解", "实操", "复盘判断框架", "能力获得"];

type CandidateVersion = NonNullable<RegistryItem["preview"]>;
type CandidateStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "CANCELLED";
type CandidateRecord = {
  id: string;
  status: CandidateStatus;
  updateReason: string;
  baseSnapshot: CandidateVersion;
  snapshot: CandidateVersion;
  baseSpecVersion: string;
  baseLessonVersion: number;
  publishedVersion: number | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
type CourseMaintenance = {
  currentVersion: number;
  activeCandidate: CandidateRecord | null;
  versions: CandidateRecord[];
  lastPublishedAt: string | null;
};

type CandidateDiffItem = {
  section: string;
  label: string;
  before: string;
  after: string;
};

function diffText(value: string | string[] | Record<string, string>) {
  if (Array.isArray(value)) return value.join("\n");
  if (typeof value === "object") {
    return Object.entries(value).map(([key, text]) => `${key}：${text}`).join("\n");
  }
  return value;
}

function buildCandidateDiff(current: CandidateVersion, candidate: CandidateVersion): CandidateDiffItem[] {
  const diffs: CandidateDiffItem[] = [];
  const add = (section: string, label: string, beforeValue: string | string[] | Record<string, string>, afterValue: string | string[] | Record<string, string>) => {
    const before = diffText(beforeValue);
    const after = diffText(afterValue);
    if (before !== after) diffs.push({ section, label, before, after });
  };

  add("课程页", "主标题", current.courseHeader.title, candidate.courseHeader.title);
  add("课程目录 · 导航卡片", "标题", current.courseHeader.catalogTitle?.trim() || current.courseHeader.title, candidate.courseHeader.catalogTitle?.trim() || candidate.courseHeader.title);
  add("课程页", "顶部说明", current.courseHeader.lessonPageLead, candidate.courseHeader.lessonPageLead);
  add("课程页", "完成后你会获得", current.capability.gain[0] ?? "", candidate.capability.gain[0] ?? "");
  add("课程目录 · 导航卡片", "副标题", current.courseHeader.catalogSubtitle, candidate.courseHeader.catalogSubtitle);

  demoSteps.forEach((stepLabel, index) => {
    const section = `${index + 1}. ${stepLabel}`;
    add(section, "步骤标题", current.stepMeta[index]?.title ?? "", candidate.stepMeta[index]?.title ?? "");
    add(section, "步骤说明", current.stepMeta[index]?.objective ?? "", candidate.stepMeta[index]?.objective ?? "");
    add(section, "进度卡文案", current.stepMeta[index]?.navigationDescription ?? "", candidate.stepMeta[index]?.navigationDescription ?? "");
  });

  add("1. 建立直觉", "场景标题", current.intro.title, candidate.intro.title);
  add("1. 建立直觉", "场景说明", current.intro.situation, candidate.intro.situation);
  add("1. 建立直觉", "两种做法", current.intro.approaches.map((item) => `${item.label}：${item.text}`), candidate.intro.approaches.map((item) => `${item.label}：${item.text}`));
  add("1. 建立直觉", "记住这一句", current.intro.takeaway, candidate.intro.takeaway);
  add("1. 建立直觉", "补充说明", current.intro.bottomDetails.map((item) => `${item.title}：${item.text}`), candidate.intro.bottomDetails.map((item) => `${item.title}：${item.text}`));

  add("2. 讲透方法", "案例标题", current.example.title, candidate.example.title);
  add("2. 讲透方法", "案例场景", current.example.situation, candidate.example.situation);
  add("2. 讲透方法", "原来的做法", current.example.before, candidate.example.before);
  add("2. 讲透方法", "调整后的做法", current.example.after, candidate.example.after);
  add("2. 讲透方法", "结果", current.example.result, candidate.example.result);
  add("2. 讲透方法", "案例补充说明", current.example.knowledgeDepth.map((item) => `${item.title}：${item.text}`), candidate.example.knowledgeDepth.map((item) => `${item.title}：${item.text}`));

  const checkCount = Math.max(current.checks.length, candidate.checks.length);
  for (let index = 0; index < checkCount; index += 1) {
    const before = current.checks[index];
    const after = candidate.checks[index];
    add("3. 检查理解", `第 ${index + 1} 题`, before?.question ?? "", after?.question ?? "");
    add("3. 检查理解", `第 ${index + 1} 题选项`, before?.options.map((item) => item.label) ?? [], after?.options.map((item) => item.label) ?? []);
    add("3. 检查理解", `第 ${index + 1} 题答对反馈`, before?.correctFeedback ?? "", after?.correctFeedback ?? "");
    add("3. 检查理解", `第 ${index + 1} 题答错反馈`, before?.incorrectFeedback ?? "", after?.incorrectFeedback ?? "");
  }

  add("4. 实操", "实操标题", current.practice.title, candidate.practice.title);
  add("4. 实操", "实操目标", current.practice.goal, candidate.practice.goal);
  add("4. 实操", "实操字段", current.practice.instructions.map((item) => `${item.label}：${item.prompt}`), candidate.practice.instructions.map((item) => `${item.label}：${item.prompt}`));
  add("4. 实操", "提示", current.practice.hints, candidate.practice.hints);
  add("4. 实操", "评分规则", current.practice.rubric.map((item) => `${item.label}：${item.minScore}/${item.maxScore} · ${item.example}`), candidate.practice.rubric.map((item) => `${item.label}：${item.minScore}/${item.maxScore} · ${item.example}`));
  add("4. 实操", "通过分数", String(current.practice.passScore), String(candidate.practice.passScore));
  add("4. 实操", "AI 操作说明", current.practice.activity.instruction, candidate.practice.activity.instruction);
  add("4. 实操", "比较两次结果", current.practice.activity.reflection, candidate.practice.activity.reflection);
  add("4. 实操", "参考答案", current.practice.referenceAnswer, candidate.practice.referenceAnswer);
  add("4. 实操", "一键填充内容", current.practice.referenceFill, candidate.practice.referenceFill);

  add("5. 复盘判断框架", "卡片标签", [current.review.labels.primary, current.review.labels.secondary], [candidate.review.labels.primary, candidate.review.labels.secondary]);
  add("5. 复盘判断框架", "判断卡片", current.review.items, candidate.review.items);
  add("5. 复盘判断框架", "卡片下方说明", current.review.knowledgeDepth.map((item) => `${item.title}：${item.text}`), candidate.review.knowledgeDepth.map((item) => `${item.title}：${item.text}`));
  add("5. 复盘判断框架", "容易踩的坑", current.review.mistakes, candidate.review.mistakes);
  add("5. 复盘判断框架", "下一步关联", current.review.related, candidate.review.related);

  add("6. 能力获得", "标题", current.capability.title, candidate.capability.title);
  add("6. 能力获得", "能力内容", current.capability.gain, candidate.capability.gain);
  add("6. 能力获得", "怎么知道自己真的会了", current.capability.selfAssessment, candidate.capability.selfAssessment);
  add("6. 能力获得", "触发场景", current.capability.triggerScenario, candidate.capability.triggerScenario);
  add("6. 能力获得", "下一步为什么值得继续", current.capability.nextLessonValue, candidate.capability.nextLessonValue);

  return diffs;
}

function CandidateField({
  label,
  value,
  onChange,
  multiline = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="admin-candidate-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function CandidateStringList({
  label,
  values,
  onChange,
  structureEditing = false,
  minItems = 0,
  addLabel = "新增一项"
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  structureEditing?: boolean;
  minItems?: number;
  addLabel?: string;
}) {
  return (
    <div className="admin-candidate-group">
      <div className="admin-candidate-group-head">
        <strong>{label}</strong>
        {structureEditing && (
          <button type="button" onClick={() => onChange([...values, ""])}>{addLabel}</button>
        )}
      </div>
      <div className="admin-candidate-list">
        {values.map((value, index) => (
          <div className="admin-candidate-editable-item" key={index}>
            <textarea
              value={value}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            {structureEditing && (
              <button
                type="button"
                className="admin-candidate-remove"
                disabled={values.length <= minItems}
                onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
              >
                删除
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CandidateEditorStep({
  candidate,
  stepIndex,
  update
}: {
  candidate: CandidateVersion;
  stepIndex: number;
  update: (mutator: (draft: CandidateVersion) => void) => void;
}) {
  const meta = candidate.stepMeta[stepIndex];

  return (
    <div className="admin-candidate-step">
      <div className="admin-editor-section-head">
        <div>
          <strong>{demoSteps[stepIndex]}</strong>
          <span>候选版本 · 当前修改不会影响正式课程</span>
        </div>
      </div>

      <div className="admin-candidate-fields">
        <CandidateField label="步骤标题（当前步骤顶部）" value={meta.title} onChange={(value) => update((draft) => { draft.stepMeta[stepIndex].title = value; })} />
        <CandidateField label="步骤说明（当前步骤标题下方）" value={meta.objective} multiline onChange={(value) => update((draft) => { draft.stepMeta[stepIndex].objective = value; })} />
        <CandidateField label="顶部六张进度卡文案" value={meta.navigationDescription} multiline onChange={(value) => update((draft) => { draft.stepMeta[stepIndex].navigationDescription = value; })} />
      </div>

      {stepIndex === 0 && (
        <>
          <div className="admin-candidate-fields">
            <CandidateField label="场景标题" value={candidate.intro.title} onChange={(value) => update((draft) => { draft.intro.title = value; })} />
            <CandidateField label="场景说明" value={candidate.intro.situation} multiline onChange={(value) => update((draft) => { draft.intro.situation = value; })} />
          </div>
          <div className="admin-candidate-group">
            <div className="admin-candidate-group-head">
              <strong>两种做法</strong>
              <button type="button" onClick={() => update((draft) => { draft.intro.approaches.push({ label: "", text: "" }); })}>新增做法</button>
            </div>
            {candidate.intro.approaches.map((item, index) => (
              <div className="admin-candidate-object" key={index}>
                <div className="admin-candidate-object-head">
                  <span>做法 {index + 1}</span>
                  <button
                    type="button"
                    className="admin-candidate-remove"
                    disabled={candidate.intro.approaches.length <= 1}
                    onClick={() => update((draft) => { draft.intro.approaches.splice(index, 1); })}
                  >
                    删除
                  </button>
                </div>
                <CandidateField label="标题" value={item.label} onChange={(value) => update((draft) => { draft.intro.approaches[index].label = value; })} />
                <CandidateField label="说明" value={item.text} multiline onChange={(value) => update((draft) => { draft.intro.approaches[index].text = value; })} />
              </div>
            ))}
          </div>
          <CandidateField label="记住这一句" value={candidate.intro.takeaway} multiline onChange={(value) => update((draft) => { draft.intro.takeaway = value; })} />
          <div className="admin-candidate-group">
            <div className="admin-candidate-group-head">
              <strong>补充说明</strong>
              <button type="button" onClick={() => update((draft) => { draft.intro.bottomDetails.push({ title: "", text: "" }); })}>新增说明</button>
            </div>
            {candidate.intro.bottomDetails.map((item, index) => (
              <div className="admin-candidate-object" key={index}>
                <div className="admin-candidate-object-head">
                  <span>说明 {index + 1}</span>
                  <button type="button" className="admin-candidate-remove" onClick={() => update((draft) => { draft.intro.bottomDetails.splice(index, 1); })}>删除</button>
                </div>
                <CandidateField label="标题" value={item.title} onChange={(value) => update((draft) => { draft.intro.bottomDetails[index].title = value; })} />
                <CandidateField label="正文" value={item.text} multiline onChange={(value) => update((draft) => { draft.intro.bottomDetails[index].text = value; })} />
              </div>
            ))}
          </div>
        </>
      )}

      {stepIndex === 1 && (
        <>
          <div className="admin-candidate-fields">
            <CandidateField label="案例标题" value={candidate.example.title} onChange={(value) => update((draft) => { draft.example.title = value; })} />
            <CandidateField label="案例场景" value={candidate.example.situation} multiline onChange={(value) => update((draft) => { draft.example.situation = value; })} />
            <CandidateField label="原来的做法" value={candidate.example.before} multiline onChange={(value) => update((draft) => { draft.example.before = value; })} />
            <CandidateField label="调整后的做法" value={candidate.example.after} multiline onChange={(value) => update((draft) => { draft.example.after = value; })} />
            <CandidateField label="结果" value={candidate.example.result} multiline onChange={(value) => update((draft) => { draft.example.result = value; })} />
          </div>
          <div className="admin-candidate-group">
            <div className="admin-candidate-group-head">
              <strong>案例下方补充说明</strong>
              <button type="button" onClick={() => update((draft) => { draft.example.knowledgeDepth.push({ title: "", text: "" }); })}>新增说明</button>
            </div>
            {candidate.example.knowledgeDepth.map((item, index) => (
              <div className="admin-candidate-object" key={index}>
                <div className="admin-candidate-object-head">
                  <span>说明 {index + 1}</span>
                  <button type="button" className="admin-candidate-remove" onClick={() => update((draft) => { draft.example.knowledgeDepth.splice(index, 1); })}>删除</button>
                </div>
                <CandidateField label="标题" value={item.title} onChange={(value) => update((draft) => { draft.example.knowledgeDepth[index].title = value; })} />
                <CandidateField label="正文" value={item.text} multiline onChange={(value) => update((draft) => { draft.example.knowledgeDepth[index].text = value; })} />
              </div>
            ))}
          </div>
        </>
      )}

      {stepIndex === 2 && (
        <div className="admin-candidate-group">
          <strong>检查题</strong>
          {candidate.checks.map((check, checkIndex) => (
            <div className="admin-candidate-question" key={check.id}>
              <div className="admin-candidate-structural">
                <span>{check.questionType}</span>
                <span>{check.masteryRole ?? "—"}</span>
              </div>
              <CandidateField label={"第 " + (checkIndex + 1) + " 题"} value={check.question} multiline onChange={(value) => update((draft) => { draft.checks[checkIndex].question = value; })} />
              <div className="admin-candidate-options">
                {check.options.map((option, optionIndex) => (
                  <label className="admin-candidate-option" key={option.value}>
                    <input
                      type="checkbox"
                      checked={check.correctValues.includes(option.value)}
                      onChange={(event) => update((draft) => {
                        const current = draft.checks[checkIndex].correctValues;
                        draft.checks[checkIndex].correctValues = event.target.checked
                          ? [...new Set([...current, option.value])]
                          : current.filter((value) => value !== option.value);
                      })}
                    />
                    <span>{option.value}</span>
                    <input value={option.label} onChange={(event) => update((draft) => { draft.checks[checkIndex].options[optionIndex].label = event.target.value; })} />
                  </label>
                ))}
              </div>
              <CandidateField label="答对后显示：为什么这个判断正确" value={check.correctFeedback} multiline onChange={(value) => update((draft) => { draft.checks[checkIndex].correctFeedback = value; })} />
              <CandidateField label="答错后显示：为什么这个判断不成立" value={check.incorrectFeedback} multiline onChange={(value) => update((draft) => { draft.checks[checkIndex].incorrectFeedback = value; })} />
            </div>
          ))}
        </div>
      )}

      {stepIndex === 3 && (
        <>
          <div className="admin-candidate-fields">
            <CandidateField label="实操标题" value={candidate.practice.title} onChange={(value) => update((draft) => { draft.practice.title = value; })} />
            <CandidateField label="实操目标" value={candidate.practice.goal} multiline onChange={(value) => update((draft) => { draft.practice.goal = value; })} />
          </div>
          <div className="admin-candidate-group">
            <strong>实操字段</strong>
            {candidate.practice.instructions.map((item, index) => (
              <div className="admin-candidate-object" key={item.key}>
                <div className="admin-candidate-structural"><span>{item.key}</span></div>
                <CandidateField label="字段名称" value={item.label} onChange={(value) => update((draft) => { draft.practice.instructions[index].label = value; })} />
                <CandidateField label="填写说明" value={item.prompt} multiline onChange={(value) => update((draft) => { draft.practice.instructions[index].prompt = value; })} />
              </div>
            ))}
          </div>
          <CandidateStringList label="提示" values={candidate.practice.hints} onChange={(values) => update((draft) => { draft.practice.hints = values; })} />
          <div className="admin-candidate-group">
            <strong>放进你的 AI 软件试一下</strong>
            <CandidateField label="操作说明" value={candidate.practice.activity.instruction} multiline onChange={(value) => update((draft) => { draft.practice.activity.instruction = value; })} />
            <CandidateField label="比较两次结果" value={candidate.practice.activity.reflection} multiline onChange={(value) => update((draft) => { draft.practice.activity.reflection = value; })} />
          </div>
          <div className="admin-candidate-group">
            <strong>检查结果规则（提交实操后使用）</strong>
            {candidate.practice.rubric.map((item, index) => (
              <div className="admin-candidate-object" key={item.key}>
                <div className="admin-candidate-structural"><span>{item.key}</span></div>
                <CandidateField label="评分项" value={item.label} onChange={(value) => update((draft) => { draft.practice.rubric[index].label = value; })} />
                <CandidateField label="评分参考示例" value={item.example} multiline onChange={(value) => update((draft) => { draft.practice.rubric[index].example = value; })} />
                <div className="admin-candidate-number-row">
                  <label><span>最低分</span><input type="number" value={item.minScore} onChange={(event) => update((draft) => { draft.practice.rubric[index].minScore = Number(event.target.value); })} /></label>
                  <label><span>满分</span><input type="number" value={item.maxScore} onChange={(event) => update((draft) => { draft.practice.rubric[index].maxScore = Number(event.target.value); })} /></label>
                </div>
              </div>
            ))}
            <div className="admin-candidate-number-row">
              <label><span>通过分数</span><input type="number" value={candidate.practice.passScore} onChange={(event) => update((draft) => { draft.practice.passScore = Number(event.target.value); })} /></label>
            </div>
          </div>
          <CandidateField label="还是卡住？参考答案" value={candidate.practice.referenceAnswer} multiline onChange={(value) => update((draft) => { draft.practice.referenceAnswer = value; })} />
          <div className="admin-candidate-group">
            <strong>一键填充字段</strong>
            {Object.entries(candidate.practice.referenceFill).map(([key, value]) => (
              <CandidateField key={key} label={key} value={value} multiline onChange={(nextValue) => update((draft) => { draft.practice.referenceFill[key] = nextValue; })} />
            ))}
          </div>
        </>
      )}

      {stepIndex === 4 && (
        <>
          <div className="admin-candidate-fields admin-candidate-two-columns">
            <CandidateField label="上方标签" value={candidate.review.labels.primary} onChange={(value) => update((draft) => { draft.review.labels.primary = value; })} />
            <CandidateField label="下方标签" value={candidate.review.labels.secondary} onChange={(value) => update((draft) => { draft.review.labels.secondary = value; })} />
          </div>
          <div className="admin-candidate-group">
            <div className="admin-candidate-group-head">
              <strong>判断卡片</strong>
              <button type="button" onClick={() => update((draft) => { draft.review.items.push("｜"); })}>新增卡片</button>
            </div>
            {candidate.review.items.map((item, index) => {
              const [primary, secondary = ""] = item.split("｜");
              return (
                <div className="admin-candidate-object" key={index}>
                  <div className="admin-candidate-object-head">
                    <span>卡片 {index + 1}</span>
                    <button
                      type="button"
                      className="admin-candidate-remove"
                      disabled={candidate.review.items.length <= 2}
                      onClick={() => update((draft) => { draft.review.items.splice(index, 1); })}
                    >
                      删除
                    </button>
                  </div>
                  <CandidateField
                    label={candidate.review.labels.primary}
                    value={primary}
                    multiline
                    onChange={(value) => update((draft) => {
                      const [, currentSecondary = ""] = draft.review.items[index].split("｜");
                      draft.review.items[index] = value + "｜" + currentSecondary;
                    })}
                  />
                  <CandidateField
                    label={candidate.review.labels.secondary}
                    value={secondary}
                    multiline
                    onChange={(value) => update((draft) => {
                      const [currentPrimary] = draft.review.items[index].split("｜");
                      draft.review.items[index] = currentPrimary + "｜" + value;
                    })}
                  />
                </div>
              );
            })}
          </div>
          <div className="admin-candidate-group">
            <div className="admin-candidate-group-head">
              <strong>卡片下方补充说明</strong>
              <button type="button" onClick={() => update((draft) => { draft.review.knowledgeDepth.push({ title: "", text: "" }); })}>新增说明</button>
            </div>
            {candidate.review.knowledgeDepth.map((item, index) => (
              <div className="admin-candidate-object" key={index}>
                <div className="admin-candidate-object-head">
                  <span>说明 {index + 1}</span>
                  <button
                    type="button"
                    className="admin-candidate-remove"
                    disabled={candidate.review.knowledgeDepth.length <= 1}
                    onClick={() => update((draft) => { draft.review.knowledgeDepth.splice(index, 1); })}
                  >
                    删除
                  </button>
                </div>
                <CandidateField label="标题" value={item.title} onChange={(value) => update((draft) => { draft.review.knowledgeDepth[index].title = value; })} />
                <CandidateField label="正文" value={item.text} multiline onChange={(value) => update((draft) => { draft.review.knowledgeDepth[index].text = value; })} />
              </div>
            ))}
          </div>
          <CandidateStringList
            label="容易踩的坑"
            values={candidate.review.mistakes}
            structureEditing
            minItems={0}
            addLabel="新增一个坑"
            onChange={(values) => update((draft) => { draft.review.mistakes = values; })}
          />
          <CandidateStringList
            label="下一步关联"
            values={candidate.review.related}
            structureEditing
            minItems={1}
            addLabel="新增关联"
            onChange={(values) => update((draft) => { draft.review.related = values; })}
          />
        </>
      )}

      {stepIndex === 5 && (
        <>
          <div className="admin-candidate-group admin-candidate-capability-group">
            <strong>能力获得</strong>
            <CandidateField label="标题" value={candidate.capability.title} onChange={(value) => update((draft) => { draft.capability.title = value; })} />
            <div className="admin-candidate-field">
              <span>能力内容</span>
              <div className="admin-candidate-list">
                {candidate.capability.gain.map((value, index) => (
                  <textarea
                    key={index}
                    value={value}
                    onChange={(event) => update((draft) => {
                      draft.capability.gain[index] = event.target.value;
                    })}
                  />
                ))}
              </div>
            </div>
          </div>
          <CandidateStringList label="怎么知道自己真的会了" values={candidate.capability.selfAssessment} onChange={(values) => update((draft) => { draft.capability.selfAssessment = values; })} />
          <CandidateField label="遇到什么情况，我应该想到这节课？" value={candidate.capability.triggerScenario} multiline onChange={(value) => update((draft) => { draft.capability.triggerScenario = value; })} />
          <CandidateField label="下一步为什么值得继续" value={candidate.capability.nextLessonValue} multiline onChange={(value) => update((draft) => { draft.capability.nextLessonValue = value; })} />
        </>
      )}
    </div>
  );
}

export function AdminCourseRegistry() {
  const [data, setData] = useState<RegistryResponse | null>(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [view, setView] = useState<CourseView>("DETAIL");
  const [activeStep, setActiveStep] = useState(0);
  const [updateReason, setUpdateReason] = useState("");
  const [candidate, setCandidate] = useState<CandidateVersion | null>(null);
  const [candidateRecord, setCandidateRecord] = useState<CandidateRecord | null>(null);
  const [candidateCompareOpen, setCandidateCompareOpen] = useState(false);
  const [previewSnapshot, setPreviewSnapshot] = useState<CandidateVersion | null>(null);
  const [previewLabel, setPreviewLabel] = useState("");
  const [historyCompare, setHistoryCompare] = useState<CandidateRecord | null>(null);
  const [historyOverviewOpen, setHistoryOverviewOpen] = useState(false);
  const [compareOpenedFromOverview, setCompareOpenedFromOverview] = useState(false);
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null);
  const [expandedTracks, setExpandedTracks] = useState<string[]>([]);

  async function readRegistry(preserveSelection = true) {
    const response = await fetch("/api/admin/courses", { cache: "no-store" });
    if (!response.ok) throw new Error("课程目录读取失败");
    const result = (await response.json()) as RegistryResponse;
    setData(result);
    const savedKey =
      !preserveSelection && typeof window !== "undefined"
        ? window.sessionStorage.getItem("opc_admin_course_selected_key") ?? ""
        : "";
    const existing = preserveSelection
      ? result.items.find((item) => item.runtimeCourseSlug + "/" + item.runtimeLessonId === selectedKey)
      : result.items.find((item) => item.runtimeCourseSlug + "/" + item.runtimeLessonId === savedKey) ??
        result.items.find((item) => Boolean(item.maintenance?.activeCandidate));
    const target = existing ?? result.items[0];
    if (target) {
      const targetKey = target.runtimeCourseSlug + "/" + target.runtimeLessonId;
      setSelectedKey(targetKey);
      setExpandedTracks((current) =>
        current.includes(target.trackSlug) ? current : [...current, target.trackSlug]
      );
      if (!preserveSelection && target.maintenance?.activeCandidate) {
        openCandidate(target.maintenance.activeCandidate);
      }
    }
    return result;
  }

  useEffect(() => {
    readRegistry(false).catch((error) =>
      setMessage(error instanceof Error ? error.message : "课程目录读取失败")
    );
  }, []);

  useEffect(() => {
    if (selectedKey) {
      window.sessionStorage.setItem("opc_admin_course_selected_key", selectedKey);
    }
  }, [selectedKey]);

  async function postAction(payload: Record<string, unknown>) {
    setBusy(String(payload.action ?? "ACTION"));
    setActionMessage(null);
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "课程维护操作失败");
      return result;
    } finally {
      setBusy("");
    }
  }

  const grouped = useMemo(() => {
    if (!data) return [];
    const tracks = new Map<string, { index: string; title: string; stages: Map<string, { title: string; lessons: RegistryItem[] }> }>();
    for (const item of data.items) {
      if (!tracks.has(item.trackSlug)) {
        tracks.set(item.trackSlug, { index: item.trackIndex, title: item.trackTitle, stages: new Map() });
      }
      const track = tracks.get(item.trackSlug)!;
      if (!track.stages.has(item.stageId)) {
        track.stages.set(item.stageId, { title: item.stageTitle, lessons: [] });
      }
      track.stages.get(item.stageId)!.lessons.push(item);
    }
    return Array.from(tracks.entries());
  }, [data]);

  const selected = data?.items.find(
    (item) => item.runtimeCourseSlug + "/" + item.runtimeLessonId === selectedKey
  );
  const currentVersion = selected?.maintenance?.currentVersion ?? 1;
  const persistedActive = selected?.maintenance?.activeCandidate ?? null;
  const versions = selected?.maintenance?.versions ?? [];
  const versionOverview = versions.map((item) => {
    const version = item.publishedVersion ?? item.baseLessonVersion;
    const diffs = buildCandidateDiff(item.baseSnapshot, item.snapshot);
    const changedSteps = demoSteps.map((_, index) =>
      diffs.some((diff) => diff.section.startsWith(`${index + 1}. `))
    );
    return { item, version, diffs, changedSteps };
  });
  const versionEvolution = [...versionOverview].reverse();
  const candidateBase = candidateRecord?.baseSnapshot ?? persistedActive?.baseSnapshot ?? selected?.preview ?? null;
  const candidateDiffs = candidateBase && candidate ? buildCandidateDiff(candidateBase, candidate) : [];
  const candidateDiffSections = Array.from(new Set(candidateDiffs.map((item) => item.section)));
  const historyDiffs = historyCompare
    ? buildCandidateDiff(historyCompare.baseSnapshot, historyCompare.snapshot)
    : [];
  const historyDiffSections = Array.from(new Set(historyDiffs.map((item) => item.section)));
  const updatingCount = data?.items.filter((item) => item.maintenance?.activeCandidate?.status === "DRAFT").length ?? 0;
  const reviewCount = data?.items.filter((item) =>
    item.maintenance?.activeCandidate?.status === "REVIEW"
  ).length ?? 0;

  function resetForCourse(key: string, trackSlug: string) {
    setSelectedKey(key);
    setExpandedTracks((current) => current.includes(trackSlug) ? current : [...current, trackSlug]);
    setView("DETAIL");
    setActiveStep(0);
    setCandidate(null);
    setCandidateRecord(null);
    setUpdateReason("");
    setCandidateCompareOpen(false);
    setPreviewSnapshot(null);
    setPreviewLabel("");
    setHistoryCompare(null);
    setHistoryOverviewOpen(false);
    setCompareOpenedFromOverview(false);
    setPublishedVersion(null);
    setActionMessage(null);
  }

  function toggleTrack(trackSlug: string) {
    setExpandedTracks((current) => current.includes(trackSlug)
      ? current.filter((slug) => slug !== trackSlug)
      : [...current, trackSlug]);
  }

  function updateCandidate(mutator: (draft: CandidateVersion) => void) {
    setCandidate((current) => {
      if (!current) return current;
      const next = structuredClone(current);
      mutator(next);
      return next;
    });
  }

  function openCandidate(record: CandidateRecord) {
    setCandidateRecord(record);
    setCandidate(structuredClone(record.snapshot));
    setUpdateReason(record.updateReason);
    setActiveStep(0);
    setView(record.status === "DRAFT" ? "EDIT" : "REVIEW");
  }

  async function startUpdate() {
    if (!selected?.preview || !selected.maintenance) return;
    try {
      if (persistedActive) {
        openCandidate(persistedActive);
        return;
      }
      const result = await postAction({
        action: "START",
        courseSlug: selected.runtimeCourseSlug,
        lessonSlug: selected.runtimeLessonId
      });
      openCandidate(result.item as CandidateRecord);
      await readRegistry();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "发起课程更新失败");
    }
  }

  async function restoreVersion(record: CandidateRecord) {
    try {
      const result = await postAction({ action: "RESTORE", candidateId: record.id });
      openCandidate(result.item as CandidateRecord);
      setActionMessage("已基于历史正式版本创建新的候选版本");
      await readRegistry();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "恢复历史版本失败");
    }
  }

  async function saveCandidate() {
    if (!candidateRecord || !candidate) return null;
    try {
      const result = await postAction({
        action: "SAVE",
        candidateId: candidateRecord.id,
        updateReason,
        snapshot: candidate
      });
      const next = result.item as CandidateRecord;
      setCandidateRecord(next);
      setActionMessage("草稿已保存");
      await readRegistry();
      return next;
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "保存草稿失败");
      return null;
    }
  }

  async function submitForReview() {
    if (!candidateRecord || !candidate) return;
    const saved = await saveCandidate();
    if (!saved) return;
    try {
      const result = await postAction({ action: "SUBMIT", candidateId: saved.id });
      const next = result.item as CandidateRecord;
      setCandidateRecord(next);
      setCandidate(structuredClone(next.snapshot));
      setUpdateReason(next.updateReason);
      setView("REVIEW");
      setActionMessage("已提交审核");
      await readRegistry();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "提交审核失败");
    }
  }

  async function returnToEdit() {
    if (!candidateRecord) return;
    try {
      await postAction({ action: "RETURN", candidateId: candidateRecord.id });
      setCandidateRecord({ ...candidateRecord, status: "DRAFT", reviewedBy: null, reviewedAt: null });
      setView("EDIT");
      setActionMessage("已退回编辑");
      await readRegistry();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "退回编辑失败");
    }
  }

  async function cancelCandidate() {
    if (!candidateRecord) return;
    try {
      await postAction({ action: "CANCEL", candidateId: candidateRecord.id });
      setCandidateRecord(null);
      setCandidate(null);
      setUpdateReason("");
      setView("DETAIL");
      setActionMessage("已退出本次修改");
      await readRegistry();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "退出修改失败");
    }
  }

  async function approveAndPublishCandidate() {
    if (!candidateRecord) return;
    try {
      const result = await postAction({ action: "PUBLISH", candidateId: candidateRecord.id });
      setPublishedVersion(Number(result.version));
      setCandidateRecord(null);
      setCandidate(null);
      setView("DONE");
      setActionMessage(null);
      await readRegistry();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "审核或上线失败，当前正式版本未改变");
    }
  }

  function openCurrentPreview() {
    if (!selected?.preview) return;
    setPreviewSnapshot(selected.preview);
    setPreviewLabel("当前正式版本 · 第 " + currentVersion + " 版");
  }

  function openVersionPreview(record: CandidateRecord) {
    setPreviewSnapshot(record.snapshot);
    setPreviewLabel("历史正式版本 · 第 " + (record.publishedVersion ?? record.baseLessonVersion) + " 版");
  }

  if (message) return <div className="admin-empty">{message}</div>;
  if (!data) return <div className="admin-empty">正在读取课程目录…</div>;

  return (
    <>
      <div className="admin-overview-grid">
        <div className="admin-metric-card"><span>课程板块</span><strong>{data.summary.tracks}</strong><small>当前正式板块</small></div>
        <div className="admin-metric-card"><span>正式课程</span><strong>{data.summary.lessons}</strong><small>当前可维护课程</small></div>
        <div className="admin-metric-card"><span>更新中</span><strong>{updatingCount}</strong><small>正在编辑候选版本</small></div>
        <div className="admin-metric-card"><span>待审核</span><strong>{reviewCount}</strong><small>待审核或待上线</small></div>
      </div>

      <div className="admin-course-grid">
        <aside className="admin-course-tree">
          <div className="admin-panel-head">
            <div>
              <div className="kicker">课程维护</div>
              <h2>课程目录</h2>
            </div>
            <span>{data.summary.lessons} 节</span>
          </div>

          <div className="admin-tree-scroll">
            {grouped.map(([trackSlug, track]) => {
              const isExpanded = expandedTracks.includes(trackSlug);
              return (
                <div className="admin-stage-group" key={trackSlug}>
                  <button
                    type="button"
                    className="admin-track-toggle"
                    onClick={() => toggleTrack(trackSlug)}
                    aria-expanded={isExpanded}
                  >
                    <strong>{track.index} · {track.title}</strong>
                    <span>{isExpanded ? "−" : "+"}</span>
                  </button>
                  {isExpanded && Array.from(track.stages.entries()).map(([stageId, stage]) => (
                    <div className="admin-module-group" key={stageId}>
                      <small>{stage.title}</small>
                      {stage.lessons.map((item) => {
                        const key = item.runtimeCourseSlug + "/" + item.runtimeLessonId;
                        return (
                          <button
                            key={key}
                            type="button"
                            className={"admin-lesson-row " + (selectedKey === key ? "is-active" : "")}
                            onClick={() => resetForCourse(key, item.trackSlug)}
                          >
                            <span>{item.lessonTitle}</span>
                            <em className="status-published">正式</em>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </aside>

        <section className="admin-editor-panel admin-course-demo-panel">
          {!selected ? (
            <div className="admin-empty">选择一节课程开始维护。</div>
          ) : (
            <>
              <div className="admin-editor-head">
                <div>
                  <div className="kicker">{selected.trackIndex} · {selected.trackTitle} / {selected.stageTitle}</div>
                  <h1>{selected.lessonTitle}</h1>
                </div>
                <div className="admin-version">
                  <span>当前版本</span>
                  <strong>第 {currentVersion} 版</strong>
                </div>
              </div>

              {view === "DETAIL" && (
                <div className="admin-course-demo-content">
                  <div className="admin-course-summary-row">
                    <div><span>课程类型</span><strong>{lessonTypeLabel[selected.lessonType]}</strong></div>
                    <div><span>课程状态</span><strong>已上线</strong></div>
                    <div><span>最近更新</span><strong>{selected.maintenance?.lastPublishedAt ? new Date(selected.maintenance.lastPublishedAt).toLocaleDateString("zh-CN") : "2026-09-18"}</strong></div>
                  </div>

                  <div className="admin-course-demo-actions admin-course-demo-actions-end">
                    <button type="button" className="btn btn-primary" onClick={startUpdate} disabled={!selected.preview || !selected.maintenance || Boolean(busy)}>{persistedActive ? (persistedActive.status === "DRAFT" ? "继续课程更新" : "查看审核") : "发起课程更新"}</button>
                  </div>

                  {previewSnapshot && (
                    <div className="admin-course-modal-overlay" role="dialog" aria-modal="true" aria-label="课程预览">
                      <section className="admin-course-modal">
                        <div className="admin-editor-section-head">
                          <div>
                            <strong>课程预览</strong>
                            <span>{previewLabel}</span>
                          </div>
                          <button type="button" onClick={() => { setPreviewSnapshot(null); setPreviewLabel(""); }}>关闭</button>
                        </div>
                        {previewSnapshot ? (
                          <div className="admin-course-preview-overview">
                            <div className="admin-course-preview-hero">
                              <div className="kicker">OPC 引导式课程</div>
                              <h2>{previewSnapshot.courseHeader.title}</h2>
                              <p>{previewSnapshot.courseHeader.lessonPageLead}</p>
                            </div>
                            <div className="admin-course-preview-outcome">
                              <span>完成后你会获得</span>
                              <strong>{previewSnapshot.capability.gain[0]}</strong>
                            </div>
                            <div className="admin-course-preview-progress">
                              {previewSnapshot.stepMeta.map((step, index) => (
                                <div key={step.id}>
                                  <span>{index + 1}</span>
                                  <small>{step.navigationDescription}</small>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="admin-course-preview-overview">
                            <div className="admin-course-preview-hero">
                              <span>课程</span>
                              <h2>{selected.lessonTitle}</h2>
                              <p>当前示例版本用于验证历史版本查看流程。</p>
                            </div>
                          </div>
                        )}
                        {previewSnapshot ? (
                          <div className="admin-course-real-preview">
                            {[
                              ["建立直觉", previewSnapshot!.stepMeta[0]],
                              ["讲透方法", previewSnapshot!.stepMeta[1]],
                              ["检查理解", previewSnapshot!.stepMeta[2]],
                              ["实操", previewSnapshot!.stepMeta[3]],
                              ["复盘判断框架", previewSnapshot!.stepMeta[4]],
                              ["能力获得", previewSnapshot!.stepMeta[5]]
                            ].map(([label, step], index) => (
                              <section key={String(label)}>
                                <div className="admin-course-real-step-head">
                                  <b>{index + 1}</b>
                                  <div>
                                    <span>{String(label)}</span>
                                    <strong>{typeof step === "object" && step ? step.title : ""}</strong>
                                    <p>{typeof step === "object" && step ? step.objective : ""}</p>
                                  </div>
                                </div>

                                {index === 0 && (
                                  <div className="admin-course-preview-step-body">
                                    <div className="admin-course-preview-label">从一个真实场景开始</div>
                                    <h3>{previewSnapshot!.intro.title}</h3>
                                    <p className="admin-course-preview-lead">{previewSnapshot!.intro.situation}</p>
                                    <div className="admin-course-real-cards">
                                      {previewSnapshot!.intro.approaches.map((item, itemIndex) => (
                                        <div key={`${itemIndex}-${item.label}`}><strong>{item.label}</strong><p>{item.text}</p></div>
                                      ))}
                                    </div>
                                    <div className="admin-course-preview-highlight"><strong>记住这一句</strong><p>{previewSnapshot!.intro.takeaway}</p></div>
                                    {previewSnapshot!.intro.bottomDetails.length > 0 && (
                                      <div className="admin-course-preview-depth">
                                        {previewSnapshot!.intro.bottomDetails.map((item, itemIndex) => <div key={`${itemIndex}-${item.title}`}><strong>{item.title}</strong><p>{item.text}</p></div>)}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {index === 1 && (
                                  <div className="admin-course-preview-step-body">
                                    <div className="admin-course-preview-label">案例</div>
                                    <h3>{previewSnapshot!.example.title}</h3>
                                    <p className="admin-course-preview-lead">{previewSnapshot!.example.situation}</p>
                                    <div className="admin-course-preview-compare">
                                      <div><span>原来的做法</span><p>{previewSnapshot!.example.before}</p></div>
                                      <div><span>调整后的做法</span><p>{previewSnapshot!.example.after}</p></div>
                                    </div>
                                    <div className="admin-course-preview-highlight"><strong>结果</strong><p>{previewSnapshot!.example.result}</p></div>
                                    {previewSnapshot!.example.knowledgeDepth.length > 0 && (
                                      <div className="admin-course-preview-depth">
                                        {previewSnapshot!.example.knowledgeDepth.map((item, itemIndex) => <div key={`${itemIndex}-${item.title}`}><strong>{item.title}</strong><p>{item.text}</p></div>)}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {index === 2 && (
                                  <div className="admin-course-preview-step-body">
                                    {previewSnapshot!.checks.map((item, checkIndex) => (
                                      <div className="admin-course-preview-question" key={item.id}>
                                        <div className="admin-course-preview-label">理解检查 · {checkIndex + 1}/{previewSnapshot!.checks.length}</div>
                                        <h3>{item.question}</h3>
                                        <div className="admin-course-preview-options">
                                          {item.options.map((option) => <div key={option.value}><span></span><p>{option.label}</p></div>)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {index === 3 && (
                                  <div className="admin-course-preview-step-body">
                                    <div className="admin-course-preview-label">实操验收</div>
                                    <h3>{previewSnapshot!.practice.title}</h3>
                                    <p className="admin-course-preview-lead">{previewSnapshot!.practice.goal}</p>
                                    <div className="admin-course-preview-practice-fields">
                                      {previewSnapshot!.practice.instructions.map((item) => (
                                        <div key={item.key}>
                                          <strong>{item.label}</strong>
                                          <small>{item.prompt}</small>
                                          <div className="admin-course-preview-input"></div>
                                        </div>
                                      ))}
                                    </div>
                                    {previewSnapshot!.practice.hints.length > 0 && (
                                      <div className="admin-course-preview-hints">
                                        <strong>提示</strong>
                                        {previewSnapshot!.practice.hints.map((hint, hintIndex) => <p key={`${hintIndex}-${hint}`}><span>{hintIndex + 1}</span>{hint}</p>)}
                                      </div>
                                    )}
                                    <div className="admin-course-preview-activity">
                                      <span>放进你的 AI 软件试一下</span>
                                      <p>{previewSnapshot!.practice.activity.instruction}</p>
                                      <div><strong>比较两次结果</strong><p>{previewSnapshot!.practice.activity.reflection}</p></div>
                                    </div>
                                  </div>
                                )}

                                {index === 4 && (
                                  <div className="admin-course-preview-step-body">
                                    <div className="admin-course-preview-label">复盘框架</div>
                                    <h3>把这一课真正值得带走的判断留下来</h3>
                                    <div className="admin-course-preview-review-grid">
                                      {previewSnapshot!.review.items.map((item, itemIndex) => {
                                        const [primary, secondary = ""] = item.split("｜");
                                        return <div key={`${itemIndex}-${item}`}><span>{previewSnapshot!.review.labels.primary}</span><strong>{primary}</strong><span>{previewSnapshot!.review.labels.secondary}</span><p>{secondary}</p></div>;
                                      })}
                                    </div>
                                    {previewSnapshot!.review.knowledgeDepth.length > 0 && (
                                      <div className="admin-course-preview-depth">
                                        {previewSnapshot!.review.knowledgeDepth.map((item, itemIndex) => <div key={`${itemIndex}-${item.title}`}><strong>{item.title}</strong><p>{item.text}</p></div>)}
                                      </div>
                                    )}
                                    {previewSnapshot!.review.mistakes.length > 0 && (
                                      <div className="admin-course-preview-pitfalls">
                                        <strong>容易踩的坑</strong>
                                        {previewSnapshot!.review.mistakes.map((item, itemIndex) => <p key={`${itemIndex}-${item}`}><span>{itemIndex + 1}</span>{item}</p>)}
                                      </div>
                                    )}
                                    {previewSnapshot!.review.related.length > 0 && <div className="admin-course-preview-highlight"><strong>下一步关联</strong><p>{previewSnapshot!.review.related.join(" · ")}</p></div>}
                                  </div>
                                )}

                                {index === 5 && (
                                  <div className="admin-course-preview-step-body">
                                    <div className="admin-course-preview-label">能力获得</div>
                                    <h3>{previewSnapshot!.capability.title}</h3>
                                    <div className="admin-course-preview-achievements">
                                      {previewSnapshot!.capability.gain.map((item, itemIndex) => <p key={`${itemIndex}-${item}`}><span>✓</span>{item}</p>)}
                                    </div>
                                    <div className="admin-course-preview-capability-grid">
                                      <div><strong>怎么知道自己真的会了</strong>{previewSnapshot!.capability.selfAssessment.map((item, itemIndex) => <p key={`${itemIndex}-${item}`}>✓ {item}</p>)}</div>
                                      <div><strong>遇到什么情况，我应该想到这节课？</strong><p>{previewSnapshot!.capability.triggerScenario}</p></div>
                                    </div>
                                    <div className="admin-course-preview-next"><span>下一步为什么值得继续</span><strong>{previewSnapshot!.capability.nextLessonValue}</strong></div>
                                  </div>
                                )}
                              </section>
                            ))}
                          </div>
                        ) : (
                          <div className="admin-course-step-list">{demoSteps.map((step, index) => <div key={step}><b>{index + 1}</b><span>{step}</span><small>{index === 2 ? "题目、答案与解析" : index === 3 ? "实操要求与参考内容" : "该步骤正式内容"}</small></div>)}</div>
                        )}
                      </section>
                    </div>
                  )}

                  <section className="admin-course-demo-box">
                    <div className="admin-editor-section-head">
                      <div>
                        <strong>历史更新记录</strong>
                        <span>{versions.length > 0 ? "正式发布后自动留档" : "当前尚无后台发布历史"}</span>
                      </div>
                      {versions.length > 1 && <button type="button" onClick={() => setHistoryOverviewOpen(true)}>版本更新对照</button>}
                    </div>
                    <div className="admin-version-list">
                      {versions.length > 0 ? versions.map((item) => {
                        const version = item.publishedVersion ?? item.baseLessonVersion;
                        const isCurrent = version === currentVersion;
                        return (
                          <div className="admin-version-row" key={item.id}>
                            <div>
                              <strong>第 {version} 版{isCurrent ? " · 当前版本" : ""}</strong>
                              <span>{new Date(item.updatedAt).toLocaleDateString("zh-CN")} · {item.updateReason}</span>
                            </div>
                            <div>
                              <button type="button" onClick={() => openVersionPreview(item)}>查看</button>
                              {version > 1 && <button type="button" onClick={() => { setCompareOpenedFromOverview(false); setHistoryCompare(item); }}>历史版本对照</button>}
                              {!isCurrent && <button type="button" disabled={Boolean(persistedActive) || Boolean(busy)} onClick={() => restoreVersion(item)}>恢复此版本</button>}
                            </div>
                          </div>
                        );
                      }) : selected.preview ? (
                        <div className="admin-version-row">
                          <div><strong>第 {currentVersion} 版 · 当前版本</strong><span>现有正式课程</span></div>
                          <div><button type="button" onClick={openCurrentPreview}>查看</button></div>
                        </div>
                      ) : (
                        <div className="admin-empty admin-course-history-empty">当前没有可展示的正式版本。</div>
                      )}
                    </div>
                  </section>

                  {historyCompare && selected.preview && (
                    <div className="admin-course-modal-overlay" role="dialog" aria-modal="true" aria-label="历史版本对照">
                      <section className="admin-course-modal admin-candidate-compare-modal">
                        <div className="admin-editor-section-head">
                          <div>
                            <strong>历史版本对照</strong>
                            <span>第 {(historyCompare.publishedVersion ?? historyCompare.baseLessonVersion) - 1} 版 → 第 {historyCompare.publishedVersion ?? historyCompare.baseLessonVersion} 版</span>
                          </div>
                          <div className="admin-history-compare-actions">
                            {compareOpenedFromOverview && (
                              <button type="button" onClick={() => { setHistoryCompare(null); setHistoryOverviewOpen(true); setCompareOpenedFromOverview(false); }}>返回</button>
                            )}
                            <button type="button" onClick={() => { setHistoryCompare(null); setCompareOpenedFromOverview(false); }}>关闭</button>
                          </div>
                        </div>
                        <div className="admin-candidate-diff-summary">
                          <div><span>调整原因</span><strong>{historyCompare.updateReason}</strong></div>
                          <div><span>变化范围</span><strong>{historyDiffSections.length} 个区域</strong></div>
                          <div><span>变化项</span><strong>{historyDiffs.length} 项</strong></div>
                        </div>
                        {historyDiffs.length === 0 ? (
                          <div className="admin-candidate-diff-empty"><strong>与上一版本内容一致</strong><p>该版本发布时没有可展示的内容差异。</p></div>
                        ) : (
                          <div className="admin-candidate-diff-sections">
                            {historyDiffSections.map((section) => (
                              <section key={section}>
                                <div className="admin-candidate-diff-section-title">{section}</div>
                                {historyDiffs.filter((item) => item.section === section).map((item) => (
                                  <div className="admin-candidate-diff-row" key={section + "/" + item.label}>
                                    <strong>{item.label}</strong>
                                    <div className="admin-candidate-diff-grid">
                                      <div><span>上一版本</span><p>{item.before || "—"}</p></div>
                                      <div className="is-candidate"><span>本版本</span><p>{item.after || "—"}</p></div>
                                    </div>
                                  </div>
                                ))}
                              </section>
                            ))}
                          </div>
                        )}
                      </section>
                    </div>
                  )}

                  {historyOverviewOpen && (
                    <div className="admin-course-modal-overlay" role="dialog" aria-modal="true" aria-label="版本更新对照">
                      <section className="admin-course-modal admin-history-overview-modal">
                        <div className="admin-editor-section-head">
                          <div><strong>版本更新对照</strong><span>查看正式版本如何逐步演进，以及每一版具体调整了哪些步骤</span></div>
                          <button type="button" onClick={() => setHistoryOverviewOpen(false)}>关闭</button>
                        </div>

                        <div className="admin-version-overview-track">
                          {versionEvolution.map(({ item, version }, index) => (
                            <div className={"admin-version-overview-node " + (version === currentVersion ? "is-current" : "")} key={item.id}>
                              <div className="admin-version-overview-dot">{version}</div>
                              <strong>第 {version} 版</strong>
                              <span>{new Date(item.updatedAt).toLocaleDateString("zh-CN")}</span>
                              {index < versionEvolution.length - 1 && <i aria-hidden="true">→</i>}
                            </div>
                          ))}
                        </div>

                        <section className="admin-version-step-overview">
                          <div className="admin-version-overview-section-head">
                            <strong>六步变化分布</strong>
                            <span>高亮表示该正式版本发布时调整过这个步骤</span>
                          </div>
                          <div className="admin-version-step-grid">
                            <div className="admin-version-step-grid-head">
                              <span>版本</span>
                              {demoSteps.map((step, index) => <strong key={step}>{index + 1} {step}</strong>)}
                            </div>
                            {versionOverview.map(({ item, version, changedSteps }) => (
                              <div className="admin-version-step-grid-row" key={item.id}>
                                <span>第 {version} 版</span>
                                {changedSteps.map((changed, index) => (
                                  <b className={changed ? "is-changed" : ""} key={demoSteps[index]}>
                                    {changed ? "●" : "—"}
                                  </b>
                                ))}
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className="admin-version-reason-overview">
                          <div className="admin-version-overview-section-head">
                            <strong>各版本调整原因</strong>
                            <span>来自每次发起课程更新时记录的原因</span>
                          </div>
                          <div className="admin-history-version-cards">
                            {versionOverview.map(({ item, version, diffs, changedSteps }) => (
                              <div key={item.id}>
                                <div className="admin-history-version-card-head">
                                  <div><strong>第 {version} 版{version === currentVersion ? " · 当前版本" : ""}</strong><span>{new Date(item.updatedAt).toLocaleDateString("zh-CN")}</span></div>
                                </div>
                                <h4>{changedSteps.filter(Boolean).length} 个步骤 · {diffs.length} 项变化</h4>
                                <p>{item.updateReason}</p>
                                {version > 1 && (
                                  <button type="button" onClick={() => { setHistoryOverviewOpen(false); setCompareOpenedFromOverview(true); setHistoryCompare(item); }}>
                                    历史版本对照
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      </section>
                    </div>
                  )}
                </div>
              )}

              {view === "EDIT" && (
                candidate && candidateRecord ? (
                  <div className="admin-course-demo-content admin-candidate-workspace">
                    <div className="admin-course-demo-toolbar">
                      <div>
                        <span>基于正式第 {candidateRecord.baseLessonVersion} 版</span>
                        <strong>候选版本 · 编辑中</strong>
                      </div>
                      <button type="button" className="btn btn-secondary" onClick={() => setView("DETAIL")}>返回课程详情</button>
                    </div>

                    <div className="admin-candidate-notice">
                      <strong>候选版本正在编辑</strong>
                      <span>内容会保存到候选版本；在审核通过并上线前，不会影响学员正在使用的正式课程。</span>
                    </div>

                    {actionMessage && <div className="admin-candidate-notice"><span>{actionMessage}</span></div>}

                    <label className="admin-course-demo-field">
                      <span>本次更新原因</span>
                      <input value={updateReason} onChange={(event) => setUpdateReason(event.target.value)} />
                    </label>

                    <section className="admin-course-demo-box admin-candidate-auxiliary">
                      <div className="admin-editor-section-head">
                        <div><strong>课程目录 · 导航卡片</strong><span>显示位置：学习路径课程卡片，不显示在课程正文页</span></div>
                      </div>
                      <div className="admin-candidate-fields">
                        <CandidateField label="标题" value={candidate.courseHeader.catalogTitle ?? candidate.courseHeader.title} onChange={(value) => updateCandidate((draft) => { draft.courseHeader.catalogTitle = value; })} />
                        <CandidateField label="副标题" value={candidate.courseHeader.catalogSubtitle} multiline onChange={(value) => updateCandidate((draft) => { draft.courseHeader.catalogSubtitle = value; })} />
                      </div>
                    </section>

                    <section className="admin-course-demo-box">
                      <div className="admin-editor-section-head">
                        <div><strong>学员实际看到的内容 · 课程页顶部</strong><span>按照学员端从上到下的显示顺序</span></div>
                      </div>
                      <div className="admin-candidate-fields">
                        <CandidateField label="课程页主标题" value={candidate.courseHeader.title} onChange={(value) => updateCandidate((draft) => { draft.courseHeader.title = value; })} />
                        <CandidateField label="课程页顶部说明" value={candidate.courseHeader.lessonPageLead} multiline onChange={(value) => updateCandidate((draft) => { draft.courseHeader.lessonPageLead = value; })} />
                        <CandidateField
                          label="完成后你会获得（同时是第 6 步“能力获得”的第 1 条）"
                          value={candidate.capability.gain[0] ?? ""}
                          multiline
                          onChange={(value) => updateCandidate((draft) => {
                            if (draft.capability.gain.length === 0) draft.capability.gain.push(value);
                            else draft.capability.gain[0] = value;
                          })}
                        />
                      </div>
                    </section>

                    <div className="admin-course-edit-grid">
                      <nav className="admin-course-step-nav admin-candidate-step-nav">
                        {demoSteps.map((step, index) => (
                          <button key={step} type="button" className={activeStep === index ? "is-active" : ""} onClick={() => setActiveStep(index)}>
                            <span>{index + 1}</span>
                            {step}
                          </button>
                        ))}
                      </nav>
                      <section className="admin-course-demo-box admin-candidate-editor">
                        <CandidateEditorStep candidate={candidate} stepIndex={activeStep} update={updateCandidate} />
                      </section>
                    </div>

                    <div className="admin-candidate-footer">
                      <span>候选版本已持久化 · 当前 {candidateDiffs.length} 项变化</span>
                      <div className="admin-candidate-footer-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setCandidateCompareOpen(true)}>对比当前</button>
                        <button type="button" className="btn btn-secondary" disabled={Boolean(busy)} onClick={saveCandidate}>保存草稿</button>
                        <button type="button" className="btn btn-secondary" disabled={Boolean(busy)} onClick={cancelCandidate}>退出修改</button>
                        <button type="button" className="btn btn-primary" disabled={Boolean(busy)} onClick={submitForReview}>提交审核</button>
                      </div>
                    </div>

                    {candidateCompareOpen && (
                      <div className="admin-course-modal-overlay" role="dialog" aria-modal="true" aria-label="候选版本与当前正式版对比">
                        <section className="admin-course-modal admin-candidate-compare-modal">
                          <div className="admin-editor-section-head">
                            <div>
                              <strong>对比当前</strong>
                              <span>正式第 {candidateRecord.baseLessonVersion} 版 ↔ 候选版本 · 只展示发生变化的内容</span>
                            </div>
                            <button type="button" onClick={() => setCandidateCompareOpen(false)}>关闭</button>
                          </div>
                          <div className="admin-candidate-diff-summary">
                            <div><span>本次更新原因</span><strong>{updateReason || "未填写"}</strong></div>
                            <div><span>变化范围</span><strong>{candidateDiffSections.length} 个区域</strong></div>
                            <div><span>变化项</span><strong>{candidateDiffs.length} 项</strong></div>
                          </div>
                          {candidateDiffs.length === 0 ? (
                            <div className="admin-candidate-diff-empty"><strong>当前没有变化</strong><p>候选版本与发起更新时的正式版本内容一致。</p></div>
                          ) : (
                            <div className="admin-candidate-diff-sections">
                              {candidateDiffSections.map((section) => (
                                <section key={section}>
                                  <div className="admin-candidate-diff-section-title">{section}</div>
                                  {candidateDiffs.filter((item) => item.section === section).map((item) => (
                                    <div className="admin-candidate-diff-row" key={section + "/" + item.label}>
                                      <strong>{item.label}</strong>
                                      <div className="admin-candidate-diff-grid">
                                        <div><span>当前正式版</span><p>{item.before || "—"}</p></div>
                                        <div className="is-candidate"><span>候选版本</span><p>{item.after || "—"}</p></div>
                                      </div>
                                    </div>
                                  ))}
                                </section>
                              ))}
                            </div>
                          )}
                        </section>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="admin-empty">当前课程还没有可编辑候选版本。</div>
                )
              )}

              {view === "REVIEW" && candidate && candidateRecord && (
                <div className="admin-course-demo-content">
                  <div className="admin-course-demo-toolbar">
                    <div>
                      <span>第 {candidateRecord.baseLessonVersion} 版 → 第 {candidateRecord.baseLessonVersion + 1} 版</span>
                      <strong>审核与版本对比</strong>
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={() => setView("DETAIL")}>返回课程详情</button>
                  </div>

                  {actionMessage && <div className="admin-candidate-notice"><span>{actionMessage}</span></div>}

                  <div className="admin-course-review-summary">
                    <div><span>本次更新原因</span><strong>{updateReason}</strong></div>
                    <div><span>变更范围</span><strong>{candidateDiffSections.length} 个区域 / {candidateDiffs.length} 项</strong></div>
                    <div><span>上线后版本</span><strong>第 {candidateRecord.baseLessonVersion + 1} 版</strong></div>
                  </div>

                  <section className="admin-course-demo-box admin-course-compare">
                    <div className="admin-editor-section-head"><strong>版本差异</strong><span>只展示发生变化的内容</span></div>
                    {candidateDiffs.length === 0 ? (
                      <div className="admin-candidate-diff-empty"><strong>没有内容变化</strong><p>请退回编辑后再提交审核。</p></div>
                    ) : (
                      <div className="admin-candidate-diff-sections">
                        {candidateDiffSections.map((section) => (
                          <section key={section}>
                            <div className="admin-candidate-diff-section-title">{section}</div>
                            {candidateDiffs.filter((item) => item.section === section).map((item) => (
                              <div className="admin-candidate-diff-row" key={section + "/" + item.label}>
                                <strong>{item.label}</strong>
                                <div className="admin-candidate-diff-grid">
                                  <div><span>当前正式版</span><p>{item.before || "—"}</p></div>
                                  <div className="is-candidate"><span>候选版本</span><p>{item.after || "—"}</p></div>
                                </div>
                              </div>
                            ))}
                          </section>
                        ))}
                      </div>
                    )}
                  </section>

                  <div className="admin-course-demo-actions admin-course-demo-actions-end">
                    <button type="button" className="btn btn-secondary" disabled={Boolean(busy)} onClick={cancelCandidate}>退出修改</button>
                    <button type="button" className="btn btn-secondary" disabled={Boolean(busy)} onClick={returnToEdit}>退回修改</button>
                    {candidateRecord.status === "REVIEW" && (
                      <button type="button" className="btn btn-primary" disabled={Boolean(busy) || candidateDiffs.length === 0} onClick={approveAndPublishCandidate}>审核通过并上线</button>
                    )}
                  </div>
                </div>
              )}

              {view === "DONE" && (
                <div className="admin-course-demo-done">
                  <strong>第 {publishedVersion ?? currentVersion} 版已成为当前正式版本</strong>
                  <p>本次课程更新已完成，旧版本已自动保留在正式版本记录中。</p>
                  <button type="button" className="btn btn-primary" onClick={() => setView("DETAIL")}>返回课程详情</button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
