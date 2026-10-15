ALTER TABLE "content_candidate_decisions"
  ADD COLUMN IF NOT EXISTS "ignore_reason" text;