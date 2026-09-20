CREATE TABLE "practice_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_knowledge_id" text NOT NULL,
	"source_deep_resource_id" uuid,
	"generation_mode" text DEFAULT 'RULE' NOT NULL,
	"generation_error" text,
	"draft" jsonb NOT NULL,
	"status" text DEFAULT 'PENDING_REVIEW' NOT NULL,
	"review_note" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"result_practice_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "practice_drafts" ADD CONSTRAINT "practice_drafts_source_knowledge_id_knowledge_items_id_fk" FOREIGN KEY ("source_knowledge_id") REFERENCES "public"."knowledge_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_drafts" ADD CONSTRAINT "practice_drafts_source_deep_resource_id_knowledge_deep_resources_id_fk" FOREIGN KEY ("source_deep_resource_id") REFERENCES "public"."knowledge_deep_resources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_drafts" ADD CONSTRAINT "practice_drafts_result_practice_id_practices_id_fk" FOREIGN KEY ("result_practice_id") REFERENCES "public"."practices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "practice_drafts_knowledge_uidx" ON "practice_drafts" USING btree ("source_knowledge_id");