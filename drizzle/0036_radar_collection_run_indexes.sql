CREATE INDEX IF NOT EXISTS "content_collection_runs_source_started_idx"
  ON "content_collection_runs" USING btree ("source_id","started_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_collection_runs_started_at_idx"
  ON "content_collection_runs" USING btree ("started_at");
