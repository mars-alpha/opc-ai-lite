CREATE TYPE "public"."content_destination" AS ENUM('IGNORE', 'DAILY_ITEM', 'KNOWLEDGE_CAPSULE', 'PRACTICE_CANDIDATE', 'COURSE_UPDATE_CANDIDATE');--> statement-breakpoint
CREATE TYPE "public"."knowledge_validity" AS ENUM('NEW', 'ACTIVE', 'WATCH', 'OUTDATED', 'DEPRECATED');--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"category" text NOT NULL,
	"destination" "content_destination" DEFAULT 'DAILY_ITEM' NOT NULL,
	"source_type" text NOT NULL,
	"source_ref" text,
	"source_url" text,
	"source_published_at" timestamp with time zone,
	"collected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewer" text,
	"reading_minutes" integer,
	"status" "publication_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_items" (
	"id" text PRIMARY KEY NOT NULL,
	"source_content_id" text,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"body" text,
	"category" text NOT NULL,
	"validity" "knowledge_validity" DEFAULT 'NEW' NOT NULL,
	"stage_id" text,
	"lesson_id" text,
	"reading_minutes" integer,
	"status" "publication_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_source_content_id_content_items_id_fk" FOREIGN KEY ("source_content_id") REFERENCES "public"."content_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;