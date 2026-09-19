CREATE TYPE "public"."lesson_check_type" AS ENUM('SINGLE_CHOICE');--> statement-breakpoint
CREATE TYPE "public"."practice_evaluator_type" AS ENUM('RULE', 'AI');--> statement-breakpoint
CREATE TYPE "public"."practice_submission_status" AS ENUM('SUBMITTED', 'NEEDS_REVISION', 'PASSED', 'EVALUATION_FAILED');--> statement-breakpoint
CREATE TABLE "lesson_check_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"check_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"answer" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"type" "lesson_check_type" DEFAULT 'SINGLE_CHOICE' NOT NULL,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_answer" text NOT NULL,
	"explanation" text NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"status" "publication_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"evaluator_type" "practice_evaluator_type" DEFAULT 'RULE' NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"result" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"practice_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"attempt" integer NOT NULL,
	"content" jsonb NOT NULL,
	"status" "practice_submission_status" DEFAULT 'SUBMITTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practices" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"title" text NOT NULL,
	"goal" text NOT NULL,
	"instructions" jsonb NOT NULL,
	"hints" jsonb NOT NULL,
	"rubric" jsonb NOT NULL,
	"pass_score" integer DEFAULT 80 NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"status" "publication_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson_check_responses" ADD CONSTRAINT "lesson_check_responses_check_id_lesson_checks_id_fk" FOREIGN KEY ("check_id") REFERENCES "public"."lesson_checks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_check_responses" ADD CONSTRAINT "lesson_check_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_checks" ADD CONSTRAINT "lesson_checks_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_evaluations" ADD CONSTRAINT "practice_evaluations_submission_id_practice_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."practice_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_submissions" ADD CONSTRAINT "practice_submissions_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_submissions" ADD CONSTRAINT "practice_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practices" ADD CONSTRAINT "practices_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_check_responses_user_check_uidx" ON "lesson_check_responses" USING btree ("user_id","check_id");--> statement-breakpoint
CREATE UNIQUE INDEX "practice_submissions_user_practice_attempt_uidx" ON "practice_submissions" USING btree ("user_id","practice_id","attempt");