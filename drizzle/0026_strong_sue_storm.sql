CREATE TABLE "content_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artifact_type" text NOT NULL,
	"schema_version" text NOT NULL,
	"event_id" uuid NOT NULL,
	"content_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"parent_artifact_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"content_hash" text NOT NULL,
	"generated_mode" text DEFAULT 'CORE' NOT NULL,
	"adapter_id" text,
	"skill_id" text,
	"skill_version" text,
	"model_profile_id" text,
	"ai_run_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_artifacts" ADD CONSTRAINT "content_artifacts_event_id_content_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."content_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_artifacts" ADD CONSTRAINT "content_artifacts_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_artifacts_event_type_version_uidx" ON "content_artifacts" USING btree ("event_id","artifact_type","version");