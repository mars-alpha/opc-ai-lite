ALTER TYPE "public"."lesson_check_type" ADD VALUE 'TRUE_FALSE';--> statement-breakpoint
ALTER TYPE "public"."lesson_check_type" ADD VALUE 'MULTI_SELECT';--> statement-breakpoint
ALTER TABLE "lesson_check_responses" ADD COLUMN "answers" jsonb;--> statement-breakpoint
ALTER TABLE "lesson_checks" ADD COLUMN "correct_answers" jsonb;