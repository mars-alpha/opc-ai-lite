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
    const taskDecompositionLessonId = lessonId("ai-workflow", "task-decomposition");



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





