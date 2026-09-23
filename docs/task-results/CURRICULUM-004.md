# CURRICULUM-004 — Foundation Catalog Metadata Completion

Status: COMPLETE_CATALOG_READY_V1

## Result

历史上曾新增 `FOUNDATION_CATALOG_METADATA_V1.md`（旧 F-ID 7 Stage / 28 Lesson Catalog）；该文件后续已被 `TRACK01_CATALOG_METADATA_V2.md` 取代并删除，本 task-result 仅保留当时历史。

AI 基础认知现已有完整前端目录元数据：
- 7 Stages
- 28 Lessons
- 每节均包含 lessonId / title / subtitle / learnerOutcome / lessonType / estimatedMinutes / curriculumStatus / availability / stage/module/order / prerequisites / badge
- 每个 Stage 均包含 title / promise / order / lessonCount

## Status

F1-01～F1-04:
- BRIEF_READY
- COMING_SOON

其余 24 节:
- PLANNED
- COMING_SOON

当前无 Foundation Lesson = AVAILABLE。

## Catalog UI boundary

- Planned lessons can be visible.
- Coming-soon lessons cannot open an empty Lesson Runtime.
- Only AVAILABLE may navigate to formal lesson runtime.
- Catalog metadata does not make a lesson Published.
- `lib/courses.ts` remains fallback and cannot override formal catalog planning metadata.

## Next

`LEARNING-CATALOG-001 — Formal Curriculum Catalog UI`
