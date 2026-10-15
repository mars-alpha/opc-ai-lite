CREATE TABLE IF NOT EXISTS "content_event_expansion_evidence" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_id" uuid NOT NULL,
  "raw_item_id" uuid NOT NULL,
  "expansion_run_id" uuid,
  "expansion_type" text NOT NULL,
  "media_type" text NOT NULL,
  "language" text DEFAULT 'EN_OR_OTHER' NOT NULL,
  "relevance_score" integer NOT NULL,
  "value_score" integer NOT NULL,
  "rank_score" integer NOT NULL,
  "shadow_signal_score" integer DEFAULT 0 NOT NULL,
  "query" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "content_event_expansion_evidence_event_id_content_events_id_fk"
    FOREIGN KEY ("event_id") REFERENCES "public"."content_events"("id") ON DELETE cascade,
  CONSTRAINT "content_event_expansion_evidence_raw_item_id_content_raw_items_id_fk"
    FOREIGN KEY ("raw_item_id") REFERENCES "public"."content_raw_items"("id") ON DELETE cascade,
  CONSTRAINT "content_event_expansion_evidence_expansion_run_id_content_expansion_runs_id_fk"
    FOREIGN KEY ("expansion_run_id") REFERENCES "public"."content_expansion_runs"("id") ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "content_event_expansion_evidence_event_raw_uidx"
  ON "content_event_expansion_evidence" USING btree ("event_id","raw_item_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_event_expansion_evidence_event_rank_idx"
  ON "content_event_expansion_evidence" USING btree ("event_id","rank_score");