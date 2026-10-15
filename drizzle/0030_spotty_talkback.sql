CREATE TABLE "content_intelligence_event_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"media_candidate_id" uuid NOT NULL,
	"source_id" text NOT NULL,
	"source_role" text NOT NULL,
	"outlet_name" text NOT NULL,
	"published_at" timestamp with time zone,
	"match_reason" text NOT NULL,
	"match_score" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_intelligence_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fingerprint" text NOT NULL,
	"canonical_title" text NOT NULL,
	"canonical_title_zh" text,
	"fact_summary_zh" text,
	"fact_bullets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evidence_status" text DEFAULT 'UNVERIFIED' NOT NULL,
	"event_at" timestamp with time zone,
	"first_seen_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone NOT NULL,
	"source_count" integer DEFAULT 0 NOT NULL,
	"media_source_count" integer DEFAULT 0 NOT NULL,
	"official_source_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_intelligence_event_sources" ADD CONSTRAINT "content_intelligence_event_sources_event_id_content_intelligence_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."content_intelligence_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_intelligence_event_sources" ADD CONSTRAINT "content_intelligence_event_sources_media_candidate_id_content_media_candidates_id_fk" FOREIGN KEY ("media_candidate_id") REFERENCES "public"."content_media_candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_intelligence_event_sources" ADD CONSTRAINT "content_intelligence_event_sources_source_id_content_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."content_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_intelligence_event_sources_event_candidate_uidx" ON "content_intelligence_event_sources" USING btree ("event_id","media_candidate_id");--> statement-breakpoint
CREATE INDEX "content_intelligence_event_sources_event_idx" ON "content_intelligence_event_sources" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "content_intelligence_events_fingerprint_uidx" ON "content_intelligence_events" USING btree ("fingerprint");--> statement-breakpoint
CREATE INDEX "content_intelligence_events_status_idx" ON "content_intelligence_events" USING btree ("evidence_status");--> statement-breakpoint
CREATE INDEX "content_intelligence_events_event_at_idx" ON "content_intelligence_events" USING btree ("event_at");