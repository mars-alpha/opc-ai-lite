import { loadEnvConfig } from "@next/env";
import { sql } from "drizzle-orm";

loadEnvConfig(process.cwd());
import { courses } from "../../courses";
import { knowledgeItems as contentDemoItems } from "../../contentDemo";
import {
  memoryRagCheckSeed,
  taskDecompositionPracticeSeed
} from "../../learning/lesson-runtime-samples";
import { getDatabase, closeDatabase } from "./index";
import {
  contentItems,
  knowledgeItems,
  lessonChecks,
  lessons,
  modules,
  practices,
  stages
} from "./schema";

function stageId(slug: string) {
  return `stage_${slug.replace(/-/g, "_")}`;
}

function moduleId(stageSlug: string, moduleSlug: string) {
  return `module_${stageSlug.replace(/-/g, "_")}_${moduleSlug.replace(/-/g, "_")}`;
}

function lessonId(stageSlug: string, lessonSlug: string) {
  return `lesson_${stageSlug.replace(/-/g, "_")}_${lessonSlug.replace(/-/g, "_")}`;
}

function parseDurationMinutes(duration: string) {
  const match = duration.match(/(\d+)\s*分钟/);
  return match ? Number(match[1]) : null;
}

function parseReadingMinutes(value: string) {
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

async function seed() {
  const db = getDatabase();

  await db.transaction(async (tx) => {
    for (const [stageIndex, course] of courses.entries()) {
      const currentStageId = stageId(course.slug);

      await tx
        .insert(stages)
        .values({
          id: currentStageId,
          slug: course.slug,
          title: course.title,
          summary: course.summary,
          outcome: course.outcome,
          order: stageIndex + 1,
          status: "PUBLISHED",
          version: 1,
          updatedAt: sql`now()`
        })
        .onConflictDoUpdate({
          target: stages.id,
          set: {
            slug: course.slug,
            title: course.title,
            summary: course.summary,
            outcome: course.outcome,
            order: stageIndex + 1,
            status: "PUBLISHED",
            version: 1,
            updatedAt: sql`now()`
          }
        });

      for (const [moduleIndex, courseModule] of course.modules.entries()) {
        const currentModuleId = moduleId(course.slug, courseModule.id);

        await tx
          .insert(modules)
          .values({
            id: currentModuleId,
            stageId: currentStageId,
            slug: courseModule.id,
            title: courseModule.title,
            summary: courseModule.description,
            order: moduleIndex + 1,
            status: "PUBLISHED",
            updatedAt: sql`now()`
          })
          .onConflictDoUpdate({
            target: modules.id,
            set: {
              stageId: currentStageId,
              slug: courseModule.id,
              title: courseModule.title,
              summary: courseModule.description,
              order: moduleIndex + 1,
              status: "PUBLISHED",
              updatedAt: sql`now()`
            }
          });

        for (const [lessonIndex, lesson] of courseModule.lessons.entries()) {
          const currentLessonId = lessonId(course.slug, lesson.id);

          await tx
            .insert(lessons)
            .values({
              id: currentLessonId,
              moduleId: currentModuleId,
              slug: lesson.id,
              title: lesson.title,
              summary: lesson.summary,
              durationMinutes: parseDurationMinutes(lesson.duration),
              content: {
                plainExplanation: lesson.plainExplanation,
                whyItMatters: lesson.whyItMatters,
                points: lesson.points,
                content: lesson.content,
                example: lesson.example,
                guides: lesson.guides,
                practice: lesson.practice,
                mistakes: lesson.mistakes,
                related: lesson.related
              },
              order: lessonIndex + 1,
              status: "PUBLISHED",
              version: 1,
              updatedAt: sql`now()`
            })
            .onConflictDoUpdate({
              target: lessons.id,
              set: {
                moduleId: currentModuleId,
                slug: lesson.id,
                title: lesson.title,
                summary: lesson.summary,
                durationMinutes: parseDurationMinutes(lesson.duration),
                content: {
                  plainExplanation: lesson.plainExplanation,
                  whyItMatters: lesson.whyItMatters,
                  points: lesson.points,
                  content: lesson.content,
                  example: lesson.example,
                  guides: lesson.guides,
                  practice: lesson.practice,
                  mistakes: lesson.mistakes,
                  related: lesson.related
                },
                order: lessonIndex + 1,
                status: "PUBLISHED",
                version: 1,
                updatedAt: sql`now()`
              }
            });
        }
      }
    }

    const taskBriefLessonId = lessonId("chatgpt-worker", "task-brief");
    const memoryRagLessonId = lessonId("ai-literacy", "memory-rag");
    const taskDecompositionLessonId = lessonId("ai-workflow", "task-decomposition");

    await tx
      .insert(lessonChecks)
      .values({
        id: "check_task_brief_constraint",
        lessonId: taskBriefLessonId,
        type: "SINGLE_CHOICE",
        question: "在 Goal / Context / Input / Constraint / Output 中，哪一项主要负责说明 AI 不能做什么、必须遵守哪些边界？",
        options: [
          { value: "GOAL", label: "Goal" },
          { value: "CONTEXT", label: "Context" },
          { value: "CONSTRAINT", label: "Constraint" },
          { value: "OUTPUT", label: "Output" }
        ],
        correctAnswer: "CONSTRAINT",
        explanation: "Constraint 用来明确限制、禁止事项和必须遵守的规则。它能减少 AI 自行猜测和自由发挥。",
        required: true,
        order: 1,
        status: "PUBLISHED",
        updatedAt: sql`now()`
      })
      .onConflictDoUpdate({
        target: lessonChecks.id,
        set: {
          lessonId: taskBriefLessonId,
          question: "在 Goal / Context / Input / Constraint / Output 中，哪一项主要负责说明 AI 不能做什么、必须遵守哪些边界？",
          options: [
            { value: "GOAL", label: "Goal" },
            { value: "CONTEXT", label: "Context" },
            { value: "CONSTRAINT", label: "Constraint" },
            { value: "OUTPUT", label: "Output" }
          ],
          correctAnswer: "CONSTRAINT",
          explanation: "Constraint 用来明确限制、禁止事项和必须遵守的规则。它能减少 AI 自行猜测和自由发挥。",
          required: true,
          order: 1,
          status: "PUBLISHED",
          updatedAt: sql`now()`
        }
      });

    await tx
      .insert(lessonChecks)
      .values({
        ...memoryRagCheckSeed,
        lessonId: memoryRagLessonId,
        updatedAt: sql`now()`
      })
      .onConflictDoUpdate({
        target: lessonChecks.id,
        set: {
          lessonId: memoryRagLessonId,
          type: memoryRagCheckSeed.type,
          question: memoryRagCheckSeed.question,
          options: memoryRagCheckSeed.options,
          correctAnswer: memoryRagCheckSeed.correctAnswer,
          explanation: memoryRagCheckSeed.explanation,
          required: memoryRagCheckSeed.required,
          order: memoryRagCheckSeed.order,
          status: memoryRagCheckSeed.status,
          updatedAt: sql`now()`
        }
      });

    await tx
      .insert(practices)
      .values({
        id: "practice_task_brief_structured",
        lessonId: taskBriefLessonId,
        title: "把一个真实任务写成可复用任务简报",
        goal: "用自己的真实工作任务完成 Goal / Context / Input / Constraint / Output 五段简报，并根据反馈修改到通过。",
        instructions: [
          { key: "goal", label: "Goal", prompt: "你最终要 AI 帮你完成什么结果？" },
          { key: "context", label: "Context", prompt: "谁会使用这个结果？背景和用途是什么？" },
          { key: "input", label: "Input", prompt: "AI 应该基于哪些材料、数据或事实工作？" },
          { key: "constraint", label: "Constraint", prompt: "哪些规则必须遵守？哪些事情不能做？" },
          { key: "output", label: "Output", prompt: "最终结果要以什么结构、长度或格式交付？" }
        ],
        hints: [
          "先写清最终结果，而不是先想“高级提示词”应该怎么写。",
          "检查五段是否都能让一个不了解你任务的人看懂。",
          "Constraint 可以包含：不能编造、字数范围、语气、必须引用的材料或禁止事项。"
        ],
        submissionSchema: { kind: "TASK_BRIEF_V1" },
        rubric: [
          { key: "goal", label: "Goal", maxScore: 20, minScore: 12, example: "例如：把本周项目记录整理成一份管理层周报。" },
          { key: "context", label: "Context", maxScore: 20, minScore: 12, example: "例如：给部门负责人阅读，用于周一例会快速了解进展与风险。" },
          { key: "input", label: "Input", maxScore: 20, minScore: 12, example: "例如：仅根据我提供的项目记录、里程碑状态和问题清单。" },
          { key: "constraint", label: "Constraint", maxScore: 20, minScore: 12, example: "例如：不要补充材料中没有的事实；500 字以内；风险必须单独列出。" },
          { key: "output", label: "Output", maxScore: 20, minScore: 12, example: "例如：按本周进展 / 问题风险 / 下周动作 / 需协助事项四部分输出。" }
        ],
        passScore: 80,
        required: true,
        status: "PUBLISHED",
        updatedAt: sql`now()`
      })
      .onConflictDoUpdate({
        target: practices.id,
        set: {
          type: "LESSON_PRACTICE",
          accessTier: "INHERIT",
          lessonId: taskBriefLessonId,
          submissionSchema: { kind: "TASK_BRIEF_V1" },
          title: "把一个真实任务写成可复用任务简报",
          goal: "用自己的真实工作任务完成 Goal / Context / Input / Constraint / Output 五段简报，并根据反馈修改到通过。",
          instructions: [
            { key: "goal", label: "Goal", prompt: "你最终要 AI 帮你完成什么结果？" },
            { key: "context", label: "Context", prompt: "谁会使用这个结果？背景和用途是什么？" },
            { key: "input", label: "Input", prompt: "AI 应该基于哪些材料、数据或事实工作？" },
            { key: "constraint", label: "Constraint", prompt: "哪些规则必须遵守？哪些事情不能做？" },
            { key: "output", label: "Output", prompt: "最终结果要以什么结构、长度或格式交付？" }
          ],
          hints: [
            "先写清最终结果，而不是先想“高级提示词”应该怎么写。",
            "检查五段是否都能让一个不了解你任务的人看懂。",
            "Constraint 可以包含：不能编造、字数范围、语气、必须引用的材料或禁止事项。"
          ],
          rubric: [
            { key: "goal", label: "Goal", maxScore: 20, minScore: 12, example: "例如：把本周项目记录整理成一份管理层周报。" },
            { key: "context", label: "Context", maxScore: 20, minScore: 12, example: "例如：给部门负责人阅读，用于周一例会快速了解进展与风险。" },
            { key: "input", label: "Input", maxScore: 20, minScore: 12, example: "例如：仅根据我提供的项目记录、里程碑状态和问题清单。" },
            { key: "constraint", label: "Constraint", maxScore: 20, minScore: 12, example: "例如：不要补充材料中没有的事实；500 字以内；风险必须单独列出。" },
            { key: "output", label: "Output", maxScore: 20, minScore: 12, example: "例如：按本周进展 / 问题风险 / 下周动作 / 需协助事项四部分输出。" }
          ],
          passScore: 80,
          required: true,
          status: "PUBLISHED",
          updatedAt: sql`now()`
        }
      });


    await tx
      .insert(practices)
      .values({
        id: taskDecompositionPracticeSeed.id,
        type: "LESSON_PRACTICE",
        accessTier: "INHERIT",
        lessonId: taskDecompositionLessonId,
        title: taskDecompositionPracticeSeed.title,
        goal: taskDecompositionPracticeSeed.goal,
        instructions: taskDecompositionPracticeSeed.instructions,
        hints: taskDecompositionPracticeSeed.hints,
        submissionSchema: taskDecompositionPracticeSeed.submissionSchema,
        rubric: taskDecompositionPracticeSeed.rubric,
        passScore: taskDecompositionPracticeSeed.passScore,
        required: taskDecompositionPracticeSeed.required,
        status: taskDecompositionPracticeSeed.status,
        updatedAt: sql`now()`
      })
      .onConflictDoUpdate({
        target: practices.id,
        set: {
          type: "LESSON_PRACTICE",
          accessTier: "INHERIT",
          lessonId: taskDecompositionLessonId,
          title: taskDecompositionPracticeSeed.title,
          goal: taskDecompositionPracticeSeed.goal,
          instructions: taskDecompositionPracticeSeed.instructions,
          hints: taskDecompositionPracticeSeed.hints,
          submissionSchema: taskDecompositionPracticeSeed.submissionSchema,
          rubric: taskDecompositionPracticeSeed.rubric,
          passScore: taskDecompositionPracticeSeed.passScore,
          required: taskDecompositionPracticeSeed.required,
          status: taskDecompositionPracticeSeed.status,
          updatedAt: sql`now()`
        }
      });

    await tx.insert(practices).values({
      id: "practice_stage_personal_knowledge_assistant",
      type: "STAGE_PROJECT",
      accessTier: "MEMBER",
      stageId: stageId("chatgpt-worker"),
      title: "个人知识助手 · 项目任务简报",
      goal: "把个人知识助手项目整理成一份可执行、可验收的任务简报，再开始真正搭建。",
      instructions: [
        { key: "goal", label: "Goal", prompt: "这个知识助手最终必须解决什么真实问题？" },
        { key: "context", label: "Context", prompt: "谁使用、在什么场景使用、为什么现在需要它？" },
        { key: "input", label: "Input", prompt: "准备用哪些真实资料、文档或数据作为知识来源？" },
        { key: "constraint", label: "Constraint", prompt: "哪些事实边界、隐私要求和不能编造的规则必须遵守？" },
        { key: "output", label: "Output", prompt: "最终要交付什么，包括问答测试、失败案例和使用说明？" }
      ],
      hints: [
        "先写真实使用场景，不要从工具选型开始。",
        "Input 要明确资料范围，Constraint 要明确资料外问题怎么处理。",
        "Output 至少包含可验证的问答结果和一次失败案例复盘。"
      ],
      rubric: [
        { key: "goal", label: "Goal", maxScore: 20, minScore: 12, example: "例如：让我能从自己的项目资料中快速找到事实并回答工作问题。" },
        { key: "context", label: "Context", maxScore: 20, minScore: 12, example: "例如：我个人在项目复盘和客户沟通前使用。" },
        { key: "input", label: "Input", maxScore: 20, minScore: 12, example: "例如：仅使用指定的项目文档、会议纪要和知识笔记。" },
        { key: "constraint", label: "Constraint", maxScore: 20, minScore: 12, example: "例如：资料外内容必须标记未知，不得自行补充事实。" },
        { key: "output", label: "Output", maxScore: 20, minScore: 12, example: "例如：完成 5 个真实问答、1 个失败案例和 1 份使用说明。" }
      ],
      submissionSchema: { kind: "TASK_BRIEF_V1" },
      passScore: 80,
      required: false,
      status: "PUBLISHED",
      updatedAt: sql`now()`
    }).onConflictDoUpdate({
      target: practices.id,
      set: {
        type: "STAGE_PROJECT",
        accessTier: "MEMBER",
        stageId: stageId("chatgpt-worker"),
        lessonId: null,
        sourceContentId: null,
        sourceKnowledgeId: null,
        submissionSchema: { kind: "TASK_BRIEF_V1" },
        status: "PUBLISHED",
        updatedAt: sql`now()`
      }
    });
    for (const item of contentDemoItems) {
      const contentId = "content_demo_" + item.id;
      const knowledgeId = "knowledge_demo_" + item.id;
      const linkedStageId = item.courseSlug ? stageId(item.courseSlug) : null;
      const linkedLessonId =
        item.courseSlug && item.lessonId ? lessonId(item.courseSlug, item.lessonId) : null;
      const now = new Date();

      await tx
        .insert(contentItems)
        .values({
          id: contentId,
          title: item.title,
          summary: item.summary,
          category: item.category,
          destination: item.destination,
          sourceType: "DEMO",
          sourceRef: "lib/contentDemo.ts",
          collectedAt: now,
          reviewedAt: now,
          reviewer: "SYSTEM_SEED",
          readingMinutes: parseReadingMinutes(item.readingTime),
          status: "PUBLISHED",
          publishedAt: now,
          updatedAt: now
        })
        .onConflictDoNothing();

      await tx
        .insert(knowledgeItems)
        .values({
          id: knowledgeId,
          sourceContentId: contentId,
          title: item.title,
          summary: item.summary,
          category: item.category,
          validity: "ACTIVE",
          stageId: linkedStageId,
          lessonId: linkedLessonId,
          readingMinutes: parseReadingMinutes(item.readingTime),
          status: "PUBLISHED",
          publishedAt: now,
          updatedAt: now
        })
        .onConflictDoNothing();
    }
    await tx.insert(practices).values({
      id: "practice_latest_evaluation_workflow",
      type: "LATEST_PRACTICE",
      accessTier: "FREE",
      sourceContentId: "content_demo_evaluation-practice",
      sourceKnowledgeId: "knowledge_demo_evaluation-practice",
      title: "为一个 AI 工作流写 Evaluation 任务简报",
      goal: "把“工作流是否有效”变成一套可执行的验证任务，而不是只确认它能自动运行。",
      instructions: [
        { key: "goal", label: "Goal", prompt: "你要验证这个 AI 工作流是否达成什么真实结果？" },
        { key: "context", label: "Context", prompt: "谁使用这个工作流、在哪个业务场景中使用？" },
        { key: "input", label: "Input", prompt: "Evaluation 要基于哪些输入样本、历史结果或测试案例？" },
        { key: "constraint", label: "Constraint", prompt: "哪些失败条件、人工检查点和风险边界必须保留？" },
        { key: "output", label: "Output", prompt: "最终要输出哪些指标、失败记录和改进结论？" }
      ],
      hints: [
        "不要把“自动运行成功”当成业务成功。",
        "至少写一个失败条件和一个人工复核点。",
        "Output 应该能让下一次迭代知道具体要改什么。"
      ],
      rubric: [
        { key: "goal", label: "Goal", maxScore: 20, minScore: 12, example: "例如：验证内容工作流能否稳定产出可发布且事实准确的草稿。" },
        { key: "context", label: "Context", maxScore: 20, minScore: 12, example: "例如：运营团队每周用它准备 5 篇行业内容。" },
        { key: "input", label: "Input", maxScore: 20, minScore: 12, example: "例如：使用 20 个真实选题、历史优质内容和审核记录作为测试集。" },
        { key: "constraint", label: "Constraint", maxScore: 20, minScore: 12, example: "例如：事实错误直接判失败；最终发布前必须人工确认。" },
        { key: "output", label: "Output", maxScore: 20, minScore: 12, example: "例如：输出通过率、失败类型、人工复核结果和下一轮改进项。" }
      ],
      submissionSchema: { kind: "TASK_BRIEF_V1" },
      passScore: 80,
      required: false,
      status: "PUBLISHED",
      updatedAt: sql`now()`
    }).onConflictDoUpdate({
      target: practices.id,
      set: {
        type: "LATEST_PRACTICE",
        accessTier: "FREE",
        lessonId: null,
        stageId: null,
        sourceContentId: "content_demo_evaluation-practice",
        sourceKnowledgeId: "knowledge_demo_evaluation-practice",
        submissionSchema: { kind: "TASK_BRIEF_V1" },
        status: "PUBLISHED",
        updatedAt: sql`now()`
      }
    });
  });
}

seed()
  .then(async () => {
    await closeDatabase();
    console.log("OPC AI course/content/interactive seed completed.");
  })
  .catch(async (error) => {
    console.error(error);
    await closeDatabase();
    process.exitCode = 1;
  });





