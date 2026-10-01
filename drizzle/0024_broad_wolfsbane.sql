CREATE TABLE "content_raw_item_observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"raw_item_id" uuid NOT NULL,
	"source_id" text NOT NULL,
	"platform" text NOT NULL,
	"external_id" text,
	"observed_url" text,
	"platform_metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "audience" text;
--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "purpose" text;
--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "content_raw_items" ADD COLUMN "canonical_url" text;
--> statement-breakpoint
ALTER TABLE "content_raw_item_observations" ADD CONSTRAINT "content_raw_item_observations_raw_item_id_content_raw_items_id_fk" FOREIGN KEY ("raw_item_id") REFERENCES "public"."content_raw_items"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "content_raw_item_observations" ADD CONSTRAINT "content_raw_item_observations_source_id_content_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."content_sources"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "content_raw_item_observations_raw_source_uidx" ON "content_raw_item_observations" USING btree ("raw_item_id","source_id");
--> statement-breakpoint

UPDATE "content_raw_items"
SET "canonical_url" = regexp_replace(split_part("original_url", '#', 1), '/$', '')
WHERE "original_url" IS NOT NULL;
--> statement-breakpoint

INSERT INTO "content_raw_item_observations" (
	"raw_item_id",
	"source_id",
	"platform",
	"external_id",
	"observed_url",
	"platform_metrics",
	"metadata",
	"observed_at",
	"created_at",
	"updated_at"
)
SELECT
	"id",
	"source_id",
	"platform",
	"external_id",
	"original_url",
	"platform_metrics",
	"metadata",
	"collected_at",
	"created_at",
	"updated_at"
FROM "content_raw_items"
ON CONFLICT ("raw_item_id","source_id") DO NOTHING;
--> statement-breakpoint

CREATE TEMP TABLE "_raw_item_merge_0024" ON COMMIT DROP AS
SELECT "id" AS "duplicate_id", "keeper_id"
FROM (
	SELECT
		"id",
		first_value("id") OVER (
			PARTITION BY "canonical_url"
			ORDER BY "collected_at" ASC, "id" ASC
		) AS "keeper_id",
		row_number() OVER (
			PARTITION BY "canonical_url"
			ORDER BY "collected_at" ASC, "id" ASC
		) AS "row_num"
	FROM "content_raw_items"
	WHERE "canonical_url" IS NOT NULL
) ranked
WHERE "row_num" > 1;
--> statement-breakpoint

INSERT INTO "content_event_raw_items" (
	"event_id",
	"raw_item_id",
	"role",
	"cluster_rule_version",
	"cluster_reason",
	"cluster_score",
	"cluster_metadata",
	"created_at"
)
SELECT
	link."event_id",
	merge_map."keeper_id",
	link."role",
	link."cluster_rule_version",
	link."cluster_reason",
	link."cluster_score",
	link."cluster_metadata",
	link."created_at"
FROM "content_event_raw_items" link
JOIN "_raw_item_merge_0024" merge_map
	ON merge_map."duplicate_id" = link."raw_item_id"
ON CONFLICT ("event_id","raw_item_id") DO NOTHING;
--> statement-breakpoint

INSERT INTO "content_raw_item_observations" (
	"raw_item_id",
	"source_id",
	"platform",
	"external_id",
	"observed_url",
	"platform_metrics",
	"metadata",
	"observed_at",
	"created_at",
	"updated_at"
)
SELECT
	merge_map."keeper_id",
	observation."source_id",
	observation."platform",
	observation."external_id",
	observation."observed_url",
	observation."platform_metrics",
	observation."metadata",
	observation."observed_at",
	observation."created_at",
	observation."updated_at"
FROM "content_raw_item_observations" observation
JOIN "_raw_item_merge_0024" merge_map
	ON merge_map."duplicate_id" = observation."raw_item_id"
ON CONFLICT ("raw_item_id","source_id") DO UPDATE SET
	"platform" = EXCLUDED."platform",
	"external_id" = COALESCE(EXCLUDED."external_id", "content_raw_item_observations"."external_id"),
	"observed_url" = COALESCE(EXCLUDED."observed_url", "content_raw_item_observations"."observed_url"),
	"platform_metrics" = EXCLUDED."platform_metrics",
	"metadata" = EXCLUDED."metadata",
	"observed_at" = GREATEST(EXCLUDED."observed_at", "content_raw_item_observations"."observed_at"),
	"updated_at" = GREATEST(EXCLUDED."updated_at", "content_raw_item_observations"."updated_at");
--> statement-breakpoint

DELETE FROM "content_raw_items"
WHERE "id" IN (SELECT "duplicate_id" FROM "_raw_item_merge_0024");
--> statement-breakpoint

CREATE UNIQUE INDEX "content_raw_items_canonical_url_uidx" ON "content_raw_items" USING btree ("canonical_url") WHERE "content_raw_items"."canonical_url" is not null;