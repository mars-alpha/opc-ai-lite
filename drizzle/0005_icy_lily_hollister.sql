CREATE TYPE "public"."practice_access_tier" AS ENUM('INHERIT', 'FREE', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."practice_type" AS ENUM('LESSON_PRACTICE', 'STAGE_PROJECT', 'LATEST_PRACTICE');--> statement-breakpoint
ALTER TABLE "practices" ALTER COLUMN "lesson_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "practices" ADD COLUMN "type" "practice_type" DEFAULT 'LESSON_PRACTICE' NOT NULL;--> statement-breakpoint
ALTER TABLE "practices" ADD COLUMN "access_tier" "practice_access_tier" DEFAULT 'INHERIT' NOT NULL;--> statement-breakpoint
ALTER TABLE "practices" ADD COLUMN "stage_id" text;--> statement-breakpoint
ALTER TABLE "practices" ADD COLUMN "source_content_id" text;--> statement-breakpoint
ALTER TABLE "practices" ADD COLUMN "source_knowledge_id" text;--> statement-breakpoint
ALTER TABLE "practices" ADD COLUMN "submission_schema" jsonb DEFAULT '{"kind":"TASK_BRIEF_V1"}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "practices" ADD CONSTRAINT "practices_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practices" ADD CONSTRAINT "practices_source_content_id_content_items_id_fk" FOREIGN KEY ("source_content_id") REFERENCES "public"."content_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practices" ADD CONSTRAINT "practices_source_knowledge_id_knowledge_items_id_fk" FOREIGN KEY ("source_knowledge_id") REFERENCES "public"."knowledge_items"("id") ON DELETE set null ON UPDATE no action;