CREATE TABLE "content_expansion_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"source_id" text,
	"query" text NOT NULL,
	"provider" text NOT NULL,
	"window_hours" integer NOT NULL,
	"result_limit" integer NOT NULL,
	"status" text DEFAULT 'RUNNING' NOT NULL,
	"received_count" integer DEFAULT 0 NOT NULL,
	"created_count" integer DEFAULT 0 NOT NULL,
	"duplicate_count" integer DEFAULT 0 NOT NULL,
	"error_code" text,
	"error_message" text,
	"triggered_by_email" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_expansion_runs" ADD CONSTRAINT "content_expansion_runs_event_id_content_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."content_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_expansion_runs" ADD CONSTRAINT "content_expansion_runs_source_id_content_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."content_sources"("id") ON DELETE set null ON UPDATE no action;