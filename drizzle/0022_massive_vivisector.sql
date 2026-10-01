CREATE TABLE "content_event_cluster_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cluster_id" uuid NOT NULL,
	"signal_type" text NOT NULL,
	"score" integer NOT NULL,
	"adapter_version" text NOT NULL,
	"raw_value" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"breakdown" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_event_clusters" ADD COLUMN "hotness_score" integer;--> statement-breakpoint
ALTER TABLE "content_event_clusters" ADD COLUMN "velocity_score" integer;--> statement-breakpoint
ALTER TABLE "content_event_clusters" ADD COLUMN "authority_score" integer;--> statement-breakpoint
ALTER TABLE "content_event_cluster_signals" ADD CONSTRAINT "content_event_cluster_signals_cluster_id_content_event_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."content_event_clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_event_cluster_signals_cluster_type_uidx" ON "content_event_cluster_signals" USING btree ("cluster_id","signal_type");