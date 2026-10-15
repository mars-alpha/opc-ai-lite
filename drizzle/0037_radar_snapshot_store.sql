CREATE TABLE IF NOT EXISTS "content_radar_snapshots" (
  "key" text PRIMARY KEY NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "generated_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
