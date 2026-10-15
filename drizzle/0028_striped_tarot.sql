CREATE TABLE "content_demand_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"cluster_id" uuid,
	"demand_type" text NOT NULL,
	"title_zh" text NOT NULL,
	"summary_zh" text NOT NULL,
	"sample_count" integer DEFAULT 0 NOT NULL,
	"unique_author_count" integer DEFAULT 0 NOT NULL,
	"representative_comments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_platforms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"provenance" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"generated_mode" text DEFAULT 'AI' NOT NULL,
	"model_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_demand_signals" ADD CONSTRAINT "content_demand_signals_event_id_content_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."content_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_demand_signals" ADD CONSTRAINT "content_demand_signals_cluster_id_content_event_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."content_event_clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_demand_signals_event_idx" ON "content_demand_signals" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "content_demand_signals_cluster_idx" ON "content_demand_signals" USING btree ("cluster_id");