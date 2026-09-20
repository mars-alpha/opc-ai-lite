import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const publicationStatus = pgEnum("publication_status", [
  "DRAFT",
  "REVIEW",
  "PUBLISHED",
  "ARCHIVED"
]);

export const enrollmentStatus = pgEnum("enrollment_status", [
  "ACTIVE",
  "COMPLETED",
  "CANCELLED"
]);

export const lessonProgressStatus = pgEnum("lesson_progress_status", [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED"
]);

export const identityProvider = pgEnum("identity_provider", [
  "EMAIL",
  "WECHAT_OFFICIAL_ACCOUNT",
  "WECHAT_MINI_PROGRAM"
]);

export const entitlementType = pgEnum("entitlement_type", [
  "COURSE_ACCESS",
  "CHAPTER_ACCESS",
  "LESSON_ACCESS",
  "MEMBERSHIP"
]);

export const entitlementSource = pgEnum("entitlement_source", [
  "REGISTRATION",
  "OFFICIAL_ACCOUNT_FOLLOW",
  "MEMBERSHIP",
  "PROMOTION",
  "ADMIN"
]);

export const lessonResourceType = pgEnum("lesson_resource_type", [
  "INTERNAL",
  "OFFICIAL",
  "FEISHU"
]);

export const contentDestination = pgEnum("content_destination", [
  "IGNORE",
  "DAILY_ITEM",
  "KNOWLEDGE_CAPSULE",
  "PRACTICE_CANDIDATE",
  "COURSE_UPDATE_CANDIDATE"
]);

export const knowledgeValidity = pgEnum("knowledge_validity", [
  "NEW",
  "ACTIVE",
  "WATCH",
  "OUTDATED",
  "DEPRECATED"
]);
export const lessonCheckType = pgEnum("lesson_check_type", ["SINGLE_CHOICE"]);

export const practiceType = pgEnum("practice_type", [
  "LESSON_PRACTICE",
  "STAGE_PROJECT",
  "LATEST_PRACTICE"
]);

export const practiceAccessTier = pgEnum("practice_access_tier", [
  "INHERIT",
  "FREE",
  "MEMBER"
]);

export const practiceSubmissionStatus = pgEnum("practice_submission_status", [
  "SUBMITTED",
  "NEEDS_REVISION",
  "PASSED",
  "EVALUATION_FAILED"
]);

export const practiceEvaluatorType = pgEnum("practice_evaluator_type", [
  "RULE",
  "AI"
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const userIdentities = pgTable(
  "user_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    provider: identityProvider("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    unionId: text("union_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("user_identities_provider_user_uidx").on(
      table.provider,
      table.providerUserId
    )
  ]
);

export const userCredentials = pgTable("user_credentials", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("sessions_token_hash_uidx").on(table.tokenHash)]
);

export const stages = pgTable(
  "stages",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    outcome: text("outcome").notNull(),
    order: integer("order").notNull(),
    status: publicationStatus("status").notNull().default("DRAFT"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("stages_slug_uidx").on(table.slug)]
);

export const modules = pgTable(
  "modules",
  {
    id: text("id").primaryKey(),
    stageId: text("stage_id").notNull().references(() => stages.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    order: integer("order").notNull(),
    status: publicationStatus("status").notNull().default("DRAFT"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("modules_stage_slug_uidx").on(table.stageId, table.slug)
  ]
);

export const lessons = pgTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    moduleId: text("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    durationMinutes: integer("duration_minutes"),
    content: jsonb("content").notNull(),
    order: integer("order").notNull(),
    status: publicationStatus("status").notNull().default("DRAFT"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("lessons_module_slug_uidx").on(table.moduleId, table.slug)
  ]
);

export const courseEnrollments = pgTable(
  "course_enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    stageId: text("stage_id").notNull().references(() => stages.id, { onDelete: "cascade" }),
    status: enrollmentStatus("status").notNull().default("ACTIVE"),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("course_enrollments_user_stage_uidx").on(table.userId, table.stageId)
  ]
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
    status: lessonProgressStatus("status").notNull().default("NOT_STARTED"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("lesson_progress_user_lesson_uidx").on(table.userId, table.lessonId)
  ]
);

export const lessonChecks = pgTable("lesson_checks", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  type: lessonCheckType("type").notNull().default("SINGLE_CHOICE"),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  required: boolean("required").notNull().default(true),
  order: integer("order").notNull().default(0),
  status: publicationStatus("status").notNull().default("DRAFT"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const lessonCheckResponses = pgTable(
  "lesson_check_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    checkId: text("check_id").notNull().references(() => lessonChecks.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    answer: text("answer").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    attempts: integer("attempts").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("lesson_check_responses_user_check_uidx").on(table.userId, table.checkId)
  ]
);

export const practices = pgTable("practices", {
  id: text("id").primaryKey(),
  type: practiceType("type").notNull().default("LESSON_PRACTICE"),
  accessTier: practiceAccessTier("access_tier").notNull().default("INHERIT"),
  lessonId: text("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  stageId: text("stage_id").references(() => stages.id, { onDelete: "cascade" }),
  sourceContentId: text("source_content_id").references(() => contentItems.id, { onDelete: "set null" }),
  sourceKnowledgeId: text("source_knowledge_id").references(() => knowledgeItems.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  goal: text("goal").notNull(),
  instructions: jsonb("instructions").notNull(),
  hints: jsonb("hints").notNull(),
  rubric: jsonb("rubric").notNull(),
  submissionSchema: jsonb("submission_schema").notNull().default({ kind: "TASK_BRIEF_V1" }),
  passScore: integer("pass_score").notNull().default(80),
  required: boolean("required").notNull().default(false),
  status: publicationStatus("status").notNull().default("DRAFT"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const practiceSubmissions = pgTable(
  "practice_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    practiceId: text("practice_id").notNull().references(() => practices.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    attempt: integer("attempt").notNull(),
    content: jsonb("content").notNull(),
    status: practiceSubmissionStatus("status").notNull().default("SUBMITTED"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("practice_submissions_user_practice_attempt_uidx").on(
      table.userId,
      table.practiceId,
      table.attempt
    )
  ]
);

export const practiceEvaluations = pgTable("practice_evaluations", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").notNull().references(() => practiceSubmissions.id, { onDelete: "cascade" }),
  evaluatorType: practiceEvaluatorType("evaluator_type").notNull().default("RULE"),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  result: jsonb("result").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
export const learningEvents = pgTable("learning_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  eventName: text("event_name").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  properties: jsonb("properties").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const learningFeedback = pgTable("learning_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  targetType: text("target_type").notNull().default("LESSON"),
  targetId: text("target_id"),
  issueType: text("issue_type").notNull(),
  issueKey: text("issue_key").notNull(),
  resolutionStatus: text("resolution_status").notNull(),
  helpfulness: text("helpfulness"),
  reasons: jsonb("reasons").notNull().default([]),
  comment: text("comment"),
  relatedLessonId: text("related_lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  qualityRisk: boolean("quality_risk").notNull().default(false),
  reviewStatus: text("review_status").notNull().default("OPEN"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const courseInsights = pgTable(
  "course_insights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
    issueKey: text("issue_key").notNull(),
    issueCategory: text("issue_category").notNull(),
    status: text("status").notNull().default("OPEN"),
    distinctUserCount: integer("distinct_user_count").notNull().default(0),
    evidence: jsonb("evidence").notNull().default({}),
    diagnosis: jsonb("diagnosis"),
    analysisMode: text("analysis_mode").notNull().default("RULE"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("course_insights_lesson_issue_uidx").on(table.lessonId, table.issueKey)
  ]
);


export const entitlements = pgTable(
  "entitlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: entitlementType("type").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
    source: entitlementSource("source").notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("entitlements_user_resource_uidx").on(
      table.userId,
      table.type,
      table.resourceType,
      table.resourceId
    )
  ]
);

export const lessonResources = pgTable(
  "lesson_resources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
    type: lessonResourceType("type").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    sourceName: text("source_name"),
    url: text("url").notNull(),
    order: integer("order").notNull().default(0),
    status: publicationStatus("status").notNull().default("DRAFT"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  }
);


export const contentItems = pgTable("content_items", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  category: text("category").notNull(),
  destination: contentDestination("destination").notNull().default("DAILY_ITEM"),
  sourceType: text("source_type").notNull(),
  sourceRef: text("source_ref"),
  sourceUrl: text("source_url"),
  sourcePublishedAt: timestamp("source_published_at", { withTimezone: true }),
  collectedAt: timestamp("collected_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewer: text("reviewer"),
  readingMinutes: integer("reading_minutes"),
  status: publicationStatus("status").notNull().default("DRAFT"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const knowledgeItems = pgTable("knowledge_items", {
  id: text("id").primaryKey(),
  sourceContentId: text("source_content_id").references(() => contentItems.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body"),
  category: text("category").notNull(),
  validity: knowledgeValidity("validity").notNull().default("NEW"),
  stageId: text("stage_id").references(() => stages.id, { onDelete: "set null" }),
  lessonId: text("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  readingMinutes: integer("reading_minutes"),
  status: publicationStatus("status").notNull().default("DRAFT"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
export const knowledgeSourceLinks = pgTable(
  "knowledge_source_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    knowledgeId: text("knowledge_id").notNull().references(() => knowledgeItems.id, { onDelete: "cascade" }),
    contentId: text("content_id").notNull().references(() => contentItems.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("SUPPORTING"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("knowledge_source_links_knowledge_content_uidx").on(
      table.knowledgeId,
      table.contentId
    )
  ]
);

export const knowledgeDeepResources = pgTable(
  "knowledge_deep_resources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    knowledgeId: text("knowledge_id").notNull().references(() => knowledgeItems.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
    practiceId: text("practice_id").references(() => practices.id, { onDelete: "set null" }),
    provider: text("provider").notNull().default("FEISHU"),
    title: text("title").notNull(),
    summary: text("summary"),
    resourceRef: text("resource_ref"),
    url: text("url").notNull(),
    status: publicationStatus("status").notNull().default("DRAFT"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("knowledge_deep_resources_knowledge_url_uidx").on(
      table.knowledgeId,
      table.url
    )
  ]
);

export const courseUpdateCandidates = pgTable(
  "course_update_candidates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
    sourceType: text("source_type").notNull().default("LEARNING_INSIGHT"),
    insightId: uuid("insight_id").references(() => courseInsights.id, { onDelete: "cascade" }),
    sourceKnowledgeId: text("source_knowledge_id").references(() => knowledgeItems.id, { onDelete: "set null" }),
    disposition: text("disposition").notNull(),
    proposal: jsonb("proposal").notNull(),
    status: text("status").notNull().default("PENDING_REVIEW"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("course_update_candidates_insight_uidx").on(table.insightId),
    uniqueIndex("course_update_candidates_knowledge_lesson_uidx").on(
      table.sourceKnowledgeId,
      table.lessonId
    )
  ]
);

