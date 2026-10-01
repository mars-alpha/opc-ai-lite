CREATE TABLE "content_collection_strategies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"ai_mode" text DEFAULT 'NONE' NOT NULL,
	"model_ref" text,
	"topics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"competitor_accounts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"collect_comments" boolean DEFAULT false NOT NULL,
	"filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"advanced_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"test_status" text DEFAULT 'NOT_TESTED' NOT NULL,
	"test_result" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_tested_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_collection_strategy_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strategy_id" text NOT NULL,
	"source_id" text NOT NULL,
	"role" text DEFAULT 'RESOLVED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_collection_strategy_sources" ADD CONSTRAINT "content_collection_strategy_sources_strategy_id_content_collection_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."content_collection_strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_collection_strategy_sources" ADD CONSTRAINT "content_collection_strategy_sources_source_id_content_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."content_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_collection_strategy_sources_uidx" ON "content_collection_strategy_sources" USING btree ("strategy_id","source_id");