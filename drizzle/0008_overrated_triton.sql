CREATE TABLE "knowledge_deep_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"knowledge_id" text NOT NULL,
	"lesson_id" text,
	"practice_id" text,
	"provider" text DEFAULT 'FEISHU' NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"resource_ref" text,
	"url" text NOT NULL,
	"status" "publication_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "knowledge_deep_resources" ADD CONSTRAINT "knowledge_deep_resources_knowledge_id_knowledge_items_id_fk" FOREIGN KEY ("knowledge_id") REFERENCES "public"."knowledge_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_deep_resources" ADD CONSTRAINT "knowledge_deep_resources_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_deep_resources" ADD CONSTRAINT "knowledge_deep_resources_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_deep_resources_knowledge_url_uidx" ON "knowledge_deep_resources" USING btree ("knowledge_id","url");