CREATE TABLE IF NOT EXISTS "content_entities" (
  "id" text PRIMARY KEY NOT NULL,
  "entity_type" text NOT NULL,
  "canonical_name" text NOT NULL,
  "display_name_zh" text NOT NULL,
  "aliases" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "official_domains" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "parent_entity_id" text,
  "owned_by_entity_id" text,
  "successor_of_entity_id" text,
  "predecessor_of_entity_id" text,
  "reference_strength" text DEFAULT 'NONE' NOT NULL,
  "status" text DEFAULT 'TEMPORARY' NOT NULL,
  "merged_into_entity_id" text,
  "first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "content_entities_canonical_name_uidx"
  ON "content_entities" USING btree ("entity_type","canonical_name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_entities_status_idx"
  ON "content_entities" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_entities_type_idx"
  ON "content_entities" USING btree ("entity_type");
--> statement-breakpoint

ALTER TABLE "content_events" ADD COLUMN IF NOT EXISTS "event_type" text DEFAULT 'INDUSTRY_HOTSPOT' NOT NULL;
--> statement-breakpoint
ALTER TABLE "content_events" ADD COLUMN IF NOT EXISTS "verification_status" text DEFAULT 'UNVERIFIED' NOT NULL;
--> statement-breakpoint
ALTER TABLE "content_events" ADD COLUMN IF NOT EXISTS "primary_entity_id" text;
--> statement-breakpoint
ALTER TABLE "content_events" ADD COLUMN IF NOT EXISTS "subject_entity_id" text;
--> statement-breakpoint
ALTER TABLE "content_events" ADD COLUMN IF NOT EXISTS "event_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "content_events" ADD COLUMN IF NOT EXISTS "generation_readiness" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "content_events" ADD COLUMN IF NOT EXISTS "policy_version" text DEFAULT 'ai-intelligence-policy-v1' NOT NULL;
--> statement-breakpoint
ALTER TABLE "content_events" ADD COLUMN IF NOT EXISTS "archived_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "content_events" ADD COLUMN IF NOT EXISTS "resurrected_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "content_events" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint

DROP TABLE IF EXISTS "content_collection_strategy_sources" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "content_collection_strategies" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "content_intelligence_event_sources" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "content_intelligence_events" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "content_media_candidates" CASCADE;
