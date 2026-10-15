CREATE TABLE "content_manual_collection_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_type" text NOT NULL,
	"run_mode" text DEFAULT 'ONCE' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"source_id" text,
	"target_url" text,
	"target_raw_item_id" uuid,
	"target_event_id" uuid,
	"schedule_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"collection_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"result_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_run_at" timestamp with time zone,
	"next_run_at" timestamp with time zone,
	"created_by_email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_manual_collection_tasks" ADD CONSTRAINT "content_manual_collection_tasks_source_id_content_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."content_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_manual_collection_tasks" ADD CONSTRAINT "content_manual_collection_tasks_target_raw_item_id_content_raw_items_id_fk" FOREIGN KEY ("target_raw_item_id") REFERENCES "public"."content_raw_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_manual_collection_tasks" ADD CONSTRAINT "content_manual_collection_tasks_target_event_id_content_events_id_fk" FOREIGN KEY ("target_event_id") REFERENCES "public"."content_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_manual_collection_tasks_status_idx" ON "content_manual_collection_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "content_manual_collection_tasks_next_run_idx" ON "content_manual_collection_tasks" USING btree ("next_run_at");--> statement-breakpoint
CREATE INDEX "content_manual_collection_tasks_source_idx" ON "content_manual_collection_tasks" USING btree ("source_id");