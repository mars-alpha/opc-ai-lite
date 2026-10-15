CREATE TABLE "content_media_candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" text NOT NULL,
	"outlet_name" text NOT NULL,
	"content_type" text NOT NULL,
	"original_url" text NOT NULL,
	"canonical_url" text NOT NULL,
	"original_title" text NOT NULL,
	"original_excerpt" text NOT NULL,
	"display_title_zh" text,
	"display_excerpt_zh" text,
	"original_language" text DEFAULT 'EN_OR_OTHER' NOT NULL,
	"translation_status" text DEFAULT 'UNAVAILABLE' NOT NULL,
	"author" text,
	"published_at" timestamp with time zone,
	"entities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"collected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_media_candidates" ADD CONSTRAINT "content_media_candidates_source_id_content_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."content_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_media_candidates_canonical_url_uidx" ON "content_media_candidates" USING btree ("canonical_url");--> statement-breakpoint
CREATE INDEX "content_media_candidates_published_idx" ON "content_media_candidates" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "content_media_candidates_source_idx" ON "content_media_candidates" USING btree ("source_id");