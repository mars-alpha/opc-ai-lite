CREATE TABLE "knowledge_source_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"knowledge_id" text NOT NULL,
	"content_id" text NOT NULL,
	"role" text DEFAULT 'SUPPORTING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "knowledge_source_links" ADD CONSTRAINT "knowledge_source_links_knowledge_id_knowledge_items_id_fk" FOREIGN KEY ("knowledge_id") REFERENCES "public"."knowledge_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_source_links" ADD CONSTRAINT "knowledge_source_links_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_source_links_knowledge_content_uidx" ON "knowledge_source_links" USING btree ("knowledge_id","content_id");
--> statement-breakpoint
INSERT INTO "knowledge_source_links" ("knowledge_id", "content_id", "role")
SELECT "id", "source_content_id", 'PRIMARY'
FROM "knowledge_items"
WHERE "source_content_id" IS NOT NULL
ON CONFLICT ("knowledge_id", "content_id") DO NOTHING;
