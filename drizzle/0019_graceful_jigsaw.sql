ALTER TABLE "content_event_raw_items" ADD COLUMN "cluster_rule_version" text;--> statement-breakpoint
ALTER TABLE "content_event_raw_items" ADD COLUMN "cluster_reason" text;--> statement-breakpoint
ALTER TABLE "content_event_raw_items" ADD COLUMN "cluster_score" integer;--> statement-breakpoint
ALTER TABLE "content_event_raw_items" ADD COLUMN "cluster_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;