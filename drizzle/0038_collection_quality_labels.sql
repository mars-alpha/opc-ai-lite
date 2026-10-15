CREATE TABLE IF NOT EXISTS "content_collection_quality_labels" (
  "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "event_id" uuid NOT NULL,
  "source_id" text,
  "label" text NOT NULL CHECK ("label" IN ('POSITIVE', 'NEGATIVE', 'CLEAR')),
  "reason" text CHECK ("reason" IS NULL OR "reason" IN ('IRRELEVANT', 'DUPLICATE', 'OUTDATED', 'INCOMPLETE_BODY', 'FACTUAL_ERROR', 'OTHER')),
  "note" text,
  "actor_id" uuid,
  "actor_email" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "request_id" uuid NOT NULL,
  "request_hash" text NOT NULL,
  "sample_context" jsonb NOT NULL,
  "schema_version" text DEFAULT 'collection-quality-label-v1' NOT NULL,
  CONSTRAINT "content_collection_quality_labels_details_check" CHECK ("label" = 'NEGATIVE' OR ("reason" IS NULL AND "note" IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS "content_collection_quality_labels_request_uidx" ON "content_collection_quality_labels" ("request_id");
CREATE INDEX IF NOT EXISTS "content_collection_quality_labels_event_source_idx" ON "content_collection_quality_labels" ("event_id", "source_id", "id");
CREATE INDEX IF NOT EXISTS "content_collection_quality_labels_source_created_idx" ON "content_collection_quality_labels" ("source_id", "created_at");
