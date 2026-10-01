CREATE TABLE "content_event_cluster_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cluster_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"role" text DEFAULT 'MEMBER' NOT NULL,
	"cluster_rule_version" text NOT NULL,
	"merge_reason" text NOT NULL,
	"merge_score" integer NOT NULL,
	"merge_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_event_clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canonical_title" text NOT NULL,
	"primary_event_id" uuid NOT NULL,
	"cluster_rule_version" text NOT NULL,
	"member_event_count" integer DEFAULT 1 NOT NULL,
	"raw_item_count" integer DEFAULT 0 NOT NULL,
	"source_count" integer DEFAULT 0 NOT NULL,
	"platform_count" integer DEFAULT 0 NOT NULL,
	"first_seen_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_event_cluster_members" ADD CONSTRAINT "content_event_cluster_members_cluster_id_content_event_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."content_event_clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_event_cluster_members" ADD CONSTRAINT "content_event_cluster_members_event_id_content_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."content_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_event_clusters" ADD CONSTRAINT "content_event_clusters_primary_event_id_content_events_id_fk" FOREIGN KEY ("primary_event_id") REFERENCES "public"."content_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_event_cluster_members_event_uidx" ON "content_event_cluster_members" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "content_event_cluster_members_cluster_event_uidx" ON "content_event_cluster_members" USING btree ("cluster_id","event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "content_event_clusters_primary_event_uidx" ON "content_event_clusters" USING btree ("primary_event_id");