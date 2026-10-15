CREATE INDEX IF NOT EXISTS "content_raw_item_observations_source_observed_idx"
  ON "content_raw_item_observations" USING btree ("source_id","observed_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_raw_item_observations_observed_at_idx"
  ON "content_raw_item_observations" USING btree ("observed_at");
