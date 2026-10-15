CREATE TABLE "content_source_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" text NOT NULL,
	"status" text DEFAULT 'DISCONNECTED' NOT NULL,
	"source_mode" text NOT NULL,
	"login_url" text NOT NULL,
	"pending_token_hash" text,
	"pending_expires_at" timestamp with time zone,
	"runner_token_hash" text,
	"runner_session_ref" text,
	"runner_client_ref" text,
	"last_verified_at" timestamp with time zone,
	"last_error_code" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "content_source_connections_platform_uidx" ON "content_source_connections" USING btree ("platform");