CREATE TABLE "content_candidate_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"decision" text NOT NULL,
	"selected_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"note" text,
	"decided_by" uuid,
	"decided_by_email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_event_raw_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"raw_item_id" uuid NOT NULL,
	"role" text DEFAULT 'SUPPORTING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_event_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"signal_type" text NOT NULL,
	"platform" text,
	"score" integer NOT NULL,
	"raw_value" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fingerprint" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"keywords" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"entities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"discovery_status" text DEFAULT 'DISCOVERED' NOT NULL,
	"hotness_score" integer,
	"relevance_score" integer,
	"novelty_score" integer,
	"recommended_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ai_reason" text,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_raw_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" text NOT NULL,
	"platform" text NOT NULL,
	"external_id" text,
	"original_url" text,
	"title" text NOT NULL,
	"author" text,
	"excerpt" text,
	"published_at" timestamp with time zone,
	"collected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"content_hash" text NOT NULL,
	"snapshot_ref" text,
	"platform_metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_sources" ADD COLUMN "platform" text DEFAULT 'WEB' NOT NULL;--> statement-breakpoint
ALTER TABLE "content_sources" ADD COLUMN "collection_method" text DEFAULT 'MANUAL' NOT NULL;--> statement-breakpoint
ALTER TABLE "content_sources" ADD COLUMN "enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "content_sources" ADD COLUMN "authority_score" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "content_sources" ADD COLUMN "topics" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "content_sources" ADD COLUMN "collection_config" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "content_sources" ADD COLUMN "signal_config" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "content_sources" ADD COLUMN "last_collected_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "content_candidate_decisions" ADD CONSTRAINT "content_candidate_decisions_event_id_content_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."content_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_candidate_decisions" ADD CONSTRAINT "content_candidate_decisions_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_event_raw_items" ADD CONSTRAINT "content_event_raw_items_event_id_content_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."content_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_event_raw_items" ADD CONSTRAINT "content_event_raw_items_raw_item_id_content_raw_items_id_fk" FOREIGN KEY ("raw_item_id") REFERENCES "public"."content_raw_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_event_signals" ADD CONSTRAINT "content_event_signals_event_id_content_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."content_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_raw_items" ADD CONSTRAINT "content_raw_items_source_id_content_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."content_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_event_raw_items_event_raw_uidx" ON "content_event_raw_items" USING btree ("event_id","raw_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "content_events_fingerprint_uidx" ON "content_events" USING btree ("fingerprint");--> statement-breakpoint
CREATE UNIQUE INDEX "content_raw_items_source_external_uidx" ON "content_raw_items" USING btree ("source_id","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "content_raw_items_source_hash_uidx" ON "content_raw_items" USING btree ("source_id","content_hash");