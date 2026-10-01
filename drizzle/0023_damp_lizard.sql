CREATE TABLE "content_event_cluster_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cluster_id" uuid NOT NULL,
	"ai_run_id" uuid NOT NULL,
	"analysis_version" text NOT NULL,
	"input_hash" text NOT NULL,
	"opc_relevance_score" integer NOT NULL,
	"core_facts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"disagreements_or_uncertainties" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"why_it_matters" text NOT NULL,
	"recommended_angles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"suggested_content_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"human_review_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_runs" ADD COLUMN "status" text DEFAULT 'RUNNING' NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_runs" ADD COLUMN "error_code" text;--> statement-breakpoint
ALTER TABLE "ai_runs" ADD COLUMN "error_message" text;--> statement-breakpoint
ALTER TABLE "ai_runs" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "content_event_cluster_analyses" ADD CONSTRAINT "content_event_cluster_analyses_cluster_id_content_event_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."content_event_clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_event_cluster_analyses" ADD CONSTRAINT "content_event_cluster_analyses_ai_run_id_ai_runs_id_fk" FOREIGN KEY ("ai_run_id") REFERENCES "public"."ai_runs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_event_cluster_analyses_cluster_uidx" ON "content_event_cluster_analyses" USING btree ("cluster_id");