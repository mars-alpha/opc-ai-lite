CREATE TABLE "course_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" text NOT NULL,
	"issue_key" text NOT NULL,
	"issue_category" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"distinct_user_count" integer DEFAULT 0 NOT NULL,
	"evidence" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"diagnosis" jsonb,
	"analysis_mode" text DEFAULT 'RULE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_update_candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" text NOT NULL,
	"insight_id" uuid NOT NULL,
	"disposition" text NOT NULL,
	"proposal" jsonb NOT NULL,
	"status" text DEFAULT 'PENDING_REVIEW' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" text,
	"event_name" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" text NOT NULL,
	"target_type" text DEFAULT 'LESSON' NOT NULL,
	"target_id" text,
	"issue_type" text NOT NULL,
	"issue_key" text NOT NULL,
	"resolution_status" text NOT NULL,
	"helpfulness" text,
	"reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"comment" text,
	"related_lesson_id" text,
	"quality_risk" boolean DEFAULT false NOT NULL,
	"review_status" text DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_insights" ADD CONSTRAINT "course_insights_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_update_candidates" ADD CONSTRAINT "course_update_candidates_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_update_candidates" ADD CONSTRAINT "course_update_candidates_insight_id_course_insights_id_fk" FOREIGN KEY ("insight_id") REFERENCES "public"."course_insights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_events" ADD CONSTRAINT "learning_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_events" ADD CONSTRAINT "learning_events_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_feedback" ADD CONSTRAINT "learning_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_feedback" ADD CONSTRAINT "learning_feedback_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_feedback" ADD CONSTRAINT "learning_feedback_related_lesson_id_lessons_id_fk" FOREIGN KEY ("related_lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_insights_lesson_issue_uidx" ON "course_insights" USING btree ("lesson_id","issue_key");