ALTER TABLE "course_update_candidates" ALTER COLUMN "insight_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "course_update_candidates" ADD COLUMN "source_type" text DEFAULT 'LEARNING_INSIGHT' NOT NULL;--> statement-breakpoint
ALTER TABLE "course_update_candidates" ADD COLUMN "source_knowledge_id" text;--> statement-breakpoint
ALTER TABLE "course_update_candidates" ADD CONSTRAINT "course_update_candidates_source_knowledge_id_knowledge_items_id_fk" FOREIGN KEY ("source_knowledge_id") REFERENCES "public"."knowledge_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_update_candidates_insight_uidx" ON "course_update_candidates" USING btree ("insight_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_update_candidates_knowledge_lesson_uidx" ON "course_update_candidates" USING btree ("source_knowledge_id","lesson_id");