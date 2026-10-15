import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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

export const userAccountStatus = pgEnum("user_account_status", ["ACTIVE", "DISABLED"]);
export const userRole = pgEnum("user_role", ["USER", "ADMIN"]);

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
export const lessonCheckType = pgEnum("lesson_check_type", [
  "SINGLE_CHOICE",
  "TRUE_FALSE",
  "MULTI_SELECT"
]);

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
  role: userRole("role").notNull().default("USER"),
  accountStatus: userAccountStatus("account_status").notNull().default("ACTIVE"),
  adminNote: text("admin_note"),
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
    currentStep: integer("current_step").notNull().default(1),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("lesson_progress_user_lesson_uidx").on(table.userId, table.lessonId),
    check("lesson_progress_current_step_check", sql`${table.currentStep} between 1 and 6`)
  ]
);

export const lessonChecks = pgTable("lesson_checks", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  type: lessonCheckType("type").notNull().default("SINGLE_CHOICE"),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  correctAnswers: jsonb("correct_answers"),
  explanation: text("explanation").notNull(),
  incorrectExplanation: text("incorrect_explanation"),
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
    answers: jsonb("answers"),
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

export const backgroundJobs = pgTable(
  "background_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobType: text("job_type").notNull(),
    dedupeKey: text("dedupe_key").notNull(),
    payload: jsonb("payload").notNull().default({}),
    status: text("status").notNull().default("PENDING"),
    attempts: integer("attempts").notNull().default(0),
    availableAt: timestamp("available_at", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("background_jobs_dedupe_uidx").on(table.dedupeKey)]
);

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
    note: text("note"),
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
  audience: text("audience"),
  purpose: text("purpose"),
  tags: jsonb("tags").notNull().default([]),
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
  version: integer("version").notNull().default(1),
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
  version: integer("version").notNull().default(1),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const contentSources = pgTable(
  "content_sources",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    sourceType: text("source_type").notNull(),
    canonicalUrl: text("canonical_url"),
    providerRef: text("provider_ref"),
    status: text("status").notNull().default("ACTIVE"),
    platform: text("platform").notNull().default("WEB"),
    collectionMethod: text("collection_method").notNull().default("MANUAL"),
    enabled: boolean("enabled").notNull().default(true),
    authorityScore: integer("authority_score").notNull().default(50),
    topics: jsonb("topics").notNull().default([]),
    collectionConfig: jsonb("collection_config").notNull().default({}),
    signalConfig: jsonb("signal_config").notNull().default({}),
    lastCollectedAt: timestamp("last_collected_at", { withTimezone: true }),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("content_sources_type_ref_uidx").on(table.sourceType, table.providerRef)]
);

export const contentEntities = pgTable(
  "content_entities",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(),
    canonicalName: text("canonical_name").notNull(),
    displayNameZh: text("display_name_zh").notNull(),
    aliases: jsonb("aliases").notNull().default([]),
    officialDomains: jsonb("official_domains").notNull().default([]),
    parentEntityId: text("parent_entity_id"),
    ownedByEntityId: text("owned_by_entity_id"),
    successorOfEntityId: text("successor_of_entity_id"),
    predecessorOfEntityId: text("predecessor_of_entity_id"),
    referenceStrength: text("reference_strength").notNull().default("NONE"),
    status: text("status").notNull().default("TEMPORARY"),
    mergedIntoEntityId: text("merged_into_entity_id"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("content_entities_canonical_name_uidx").on(table.entityType, table.canonicalName),
    index("content_entities_status_idx").on(table.status),
    index("content_entities_type_idx").on(table.entityType)
  ]
);

export const contentSourceConnections = pgTable(
  "content_source_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    platform: text("platform").notNull(),
    status: text("status").notNull().default("DISCONNECTED"),
    sourceMode: text("source_mode").notNull(),
    loginUrl: text("login_url").notNull(),
    pendingTokenHash: text("pending_token_hash"),
    pendingExpiresAt: timestamp("pending_expires_at", { withTimezone: true }),
    runnerTokenHash: text("runner_token_hash"),
    runnerSessionRef: text("runner_session_ref"),
    runnerClientRef: text("runner_client_ref"),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    lastErrorCode: text("last_error_code"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("content_source_connections_platform_uidx").on(table.platform)
  ]
);

export const contentRawItems = pgTable(
  "content_raw_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: text("source_id").notNull().references(() => contentSources.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    externalId: text("external_id"),
    originalUrl: text("original_url"),
    canonicalUrl: text("canonical_url"),
    title: text("title").notNull(),
    author: text("author"),
    excerpt: text("excerpt"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    collectedAt: timestamp("collected_at", { withTimezone: true }).notNull().defaultNow(),
    contentHash: text("content_hash").notNull(),
    snapshotRef: text("snapshot_ref"),
    platformMetrics: jsonb("platform_metrics").notNull().default({}),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("content_raw_items_source_external_uidx").on(table.sourceId, table.externalId),
    uniqueIndex("content_raw_items_source_hash_uidx").on(table.sourceId, table.contentHash),
    uniqueIndex("content_raw_items_canonical_url_uidx")
      .on(table.canonicalUrl)
      .where(sql`${table.canonicalUrl} is not null`)
  ]
);

export const contentRawItemObservations = pgTable(
  "content_raw_item_observations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rawItemId: uuid("raw_item_id").notNull().references(() => contentRawItems.id, { onDelete: "cascade" }),
    sourceId: text("source_id").notNull().references(() => contentSources.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    externalId: text("external_id"),
    observedUrl: text("observed_url"),
    platformMetrics: jsonb("platform_metrics").notNull().default({}),
    metadata: jsonb("metadata").notNull().default({}),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("content_raw_item_observations_raw_source_uidx").on(table.rawItemId, table.sourceId),
    index("content_raw_item_observations_source_observed_idx").on(table.sourceId, table.observedAt),
    index("content_raw_item_observations_observed_at_idx").on(table.observedAt)
  ]
);

export const contentCollectionRuns = pgTable(
  "content_collection_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: text("source_id").references(() => contentSources.id, { onDelete: "set null" }),
    sourceName: text("source_name").notNull(),
    collectionMethod: text("collection_method").notNull(),
    requestedUrl: text("requested_url"),
    status: text("status").notNull().default("RUNNING"),
    receivedCount: integer("received_count").notNull().default(0),
    createdCount: integer("created_count").notNull().default(0),
    duplicateCount: integer("duplicate_count").notNull().default(0),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    triggeredByEmail: text("triggered_by_email"),
    metadata: jsonb("metadata").notNull().default({}),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("content_collection_runs_source_started_idx").on(table.sourceId, table.startedAt),
    index("content_collection_runs_started_at_idx").on(table.startedAt)
  ]
);

export const contentRadarSnapshots = pgTable("content_radar_snapshots", {
  key: text("key").primaryKey(),
  payload: jsonb("payload").notNull().default({}),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});


export const contentEvents = pgTable(
  "content_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fingerprint: text("fingerprint").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    keywords: jsonb("keywords").notNull().default([]),
    entities: jsonb("entities").notNull().default([]),
    eventType: text("event_type").notNull().default("INDUSTRY_HOTSPOT"),
    verificationStatus: text("verification_status").notNull().default("UNVERIFIED"),
    primaryEntityId: text("primary_entity_id"),
    subjectEntityId: text("subject_entity_id"),
    eventAt: timestamp("event_at", { withTimezone: true }),
    generationReadiness: jsonb("generation_readiness").notNull().default({}),
    policyVersion: text("policy_version").notNull().default("ai-intelligence-policy-v1"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    resurrectedAt: timestamp("resurrected_at", { withTimezone: true }),
    metadata: jsonb("metadata").notNull().default({}),
    discoveryStatus: text("discovery_status").notNull().default("DISCOVERED"),
    hotnessScore: integer("hotness_score"),
    relevanceScore: integer("relevance_score"),
    noveltyScore: integer("novelty_score"),
    recommendedTypes: jsonb("recommended_types").notNull().default([]),
    aiReason: text("ai_reason"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("content_events_fingerprint_uidx").on(table.fingerprint)]
);


export const contentManualCollectionTasks = pgTable(
  "content_manual_collection_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskType: text("task_type").notNull(),
    runMode: text("run_mode").notNull().default("ONCE"),
    status: text("status").notNull().default("ACTIVE"),
    sourceId: text("source_id").references(() => contentSources.id, { onDelete: "set null" }),
    targetUrl: text("target_url"),
    targetRawItemId: uuid("target_raw_item_id").references(() => contentRawItems.id, { onDelete: "set null" }),
    targetEventId: uuid("target_event_id").references(() => contentEvents.id, { onDelete: "set null" }),
    scheduleConfig: jsonb("schedule_config").notNull().default({}),
    collectionConfig: jsonb("collection_config").notNull().default({}),
    resultSummary: jsonb("result_summary").notNull().default({}),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    nextRunAt: timestamp("next_run_at", { withTimezone: true }),
    createdByEmail: text("created_by_email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("content_manual_collection_tasks_status_idx").on(table.status),
    index("content_manual_collection_tasks_next_run_idx").on(table.nextRunAt),
    index("content_manual_collection_tasks_source_idx").on(table.sourceId)
  ]
);

export const contentEventClusters = pgTable(
  "content_event_clusters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    canonicalTitle: text("canonical_title").notNull(),
    primaryEventId: uuid("primary_event_id").notNull().references(() => contentEvents.id, { onDelete: "cascade" }),
    clusterRuleVersion: text("cluster_rule_version").notNull(),
    memberEventCount: integer("member_event_count").notNull().default(1),
    rawItemCount: integer("raw_item_count").notNull().default(0),
    sourceCount: integer("source_count").notNull().default(0),
    platformCount: integer("platform_count").notNull().default(0),
    hotnessScore: integer("hotness_score"),
    velocityScore: integer("velocity_score"),
    authorityScore: integer("authority_score"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("content_event_clusters_primary_event_uidx").on(table.primaryEventId)
  ]
);

export const contentEventClusterMembers = pgTable(
  "content_event_cluster_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clusterId: uuid("cluster_id").notNull().references(() => contentEventClusters.id, { onDelete: "cascade" }),
    eventId: uuid("event_id").notNull().references(() => contentEvents.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("MEMBER"),
    clusterRuleVersion: text("cluster_rule_version").notNull(),
    mergeReason: text("merge_reason").notNull(),
    mergeScore: integer("merge_score").notNull(),
    mergeMetadata: jsonb("merge_metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("content_event_cluster_members_event_uidx").on(table.eventId),
    uniqueIndex("content_event_cluster_members_cluster_event_uidx").on(table.clusterId, table.eventId)
  ]
);

export const contentEventClusterSignals = pgTable(
  "content_event_cluster_signals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clusterId: uuid("cluster_id").notNull().references(() => contentEventClusters.id, { onDelete: "cascade" }),
    signalType: text("signal_type").notNull(),
    score: integer("score").notNull(),
    adapterVersion: text("adapter_version").notNull(),
    rawValue: jsonb("raw_value").notNull().default({}),
    breakdown: jsonb("breakdown").notNull().default({}),
    calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("content_event_cluster_signals_cluster_type_uidx").on(table.clusterId, table.signalType)
  ]
);

export const contentExpansionRuns = pgTable("content_expansion_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => contentEvents.id, { onDelete: "cascade" }),
  sourceId: text("source_id").references(() => contentSources.id, { onDelete: "set null" }),
  query: text("query").notNull(),
  provider: text("provider").notNull(),
  windowHours: integer("window_hours").notNull(),
  resultLimit: integer("result_limit").notNull(),
  status: text("status").notNull().default("RUNNING"),
  receivedCount: integer("received_count").notNull().default(0),
  createdCount: integer("created_count").notNull().default(0),
  duplicateCount: integer("duplicate_count").notNull().default(0),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  triggeredByEmail: text("triggered_by_email"),
  metadata: jsonb("metadata").notNull().default({}),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const contentEventExpansionEvidence = pgTable(
  "content_event_expansion_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id").notNull().references(() => contentEvents.id, { onDelete: "cascade" }),
    rawItemId: uuid("raw_item_id").notNull().references(() => contentRawItems.id, { onDelete: "cascade" }),
    expansionRunId: uuid("expansion_run_id").references(() => contentExpansionRuns.id, { onDelete: "set null" }),
    expansionType: text("expansion_type").notNull(),
    mediaType: text("media_type").notNull(),
    language: text("language").notNull().default("EN_OR_OTHER"),
    relevanceScore: integer("relevance_score").notNull(),
    valueScore: integer("value_score").notNull(),
    rankScore: integer("rank_score").notNull(),
    shadowSignalScore: integer("shadow_signal_score").notNull().default(0),
    query: text("query"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("content_event_expansion_evidence_event_raw_uidx").on(table.eventId, table.rawItemId),
    index("content_event_expansion_evidence_event_rank_idx").on(table.eventId, table.rankScore)
  ]
);

export const contentEventRawItems = pgTable(
  "content_event_raw_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id").notNull().references(() => contentEvents.id, { onDelete: "cascade" }),
    rawItemId: uuid("raw_item_id").notNull().references(() => contentRawItems.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("SUPPORTING"),
    clusterRuleVersion: text("cluster_rule_version"),
    clusterReason: text("cluster_reason"),
    clusterScore: integer("cluster_score"),
    clusterMetadata: jsonb("cluster_metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("content_event_raw_items_event_raw_uidx").on(table.eventId, table.rawItemId)
  ]
);

export const contentEventSignals = pgTable("content_event_signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => contentEvents.id, { onDelete: "cascade" }),
  signalType: text("signal_type").notNull(),
  platform: text("platform"),
  score: integer("score").notNull(),
  rawValue: jsonb("raw_value").notNull().default({}),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const contentDemandSignals = pgTable(
  "content_demand_signals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id").notNull().references(() => contentEvents.id, { onDelete: "cascade" }),
    clusterId: uuid("cluster_id").references(() => contentEventClusters.id, { onDelete: "cascade" }),
    demandType: text("demand_type").notNull(),
    titleZh: text("title_zh").notNull(),
    summaryZh: text("summary_zh").notNull(),
    sampleCount: integer("sample_count").notNull().default(0),
    uniqueAuthorCount: integer("unique_author_count").notNull().default(0),
    representativeComments: jsonb("representative_comments").notNull().default([]),
    sourcePlatforms: jsonb("source_platforms").notNull().default([]),
    provenance: jsonb("provenance").notNull().default({}),
    confidence: integer("confidence").notNull().default(0),
    generatedMode: text("generated_mode").notNull().default("AI"),
    modelRef: text("model_ref"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("content_demand_signals_event_idx").on(table.eventId),
    index("content_demand_signals_cluster_idx").on(table.clusterId)
  ]
);

export const contentCandidateDecisions = pgTable("content_candidate_decisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => contentEvents.id, { onDelete: "cascade" }),
  decision: text("decision").notNull(),
  ignoreReason: text("ignore_reason"),
  selectedTypes: jsonb("selected_types").notNull().default([]),
  note: text("note"),
  decidedBy: uuid("decided_by").references(() => users.id, { onDelete: "set null" }),
  decidedByEmail: text("decided_by_email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// Append-only human labels. IDs are logical references so removal of an Event or Source does not erase a backtest sample.
export const contentCollectionQualityLabels = pgTable(
  "content_collection_quality_labels",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    eventId: uuid("event_id").notNull(),
    sourceId: text("source_id"),
    label: text("label").notNull(),
    reason: text("reason"),
    note: text("note"),
    actorId: uuid("actor_id"),
    actorEmail: text("actor_email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    requestId: uuid("request_id").notNull(),
    requestHash: text("request_hash").notNull(),
    sampleContext: jsonb("sample_context").notNull(),
    schemaVersion: text("schema_version").notNull().default("collection-quality-label-v1")
  },
  (table) => [
    uniqueIndex("content_collection_quality_labels_request_uidx").on(table.requestId),
    index("content_collection_quality_labels_event_source_idx").on(table.eventId, table.sourceId, table.id),
    index("content_collection_quality_labels_source_event_idx").on(table.sourceId, table.eventId, table.id),
    index("content_collection_quality_labels_source_created_idx").on(table.sourceId, table.createdAt)
  ]
);

export const contentArtifacts = pgTable(
  "content_artifacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    artifactType: text("artifact_type").notNull(),
    schemaVersion: text("schema_version").notNull(),
    eventId: uuid("event_id").notNull().references(() => contentEvents.id, { onDelete: "cascade" }),
    contentId: text("content_id").references(() => contentItems.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(1),
    parentArtifactIds: jsonb("parent_artifact_ids").notNull().default([]),
    payload: jsonb("payload").notNull().default({}),
    contentHash: text("content_hash").notNull(),
    generatedMode: text("generated_mode").notNull().default("CORE"),
    adapterId: text("adapter_id"),
    skillId: text("skill_id"),
    skillVersion: text("skill_version"),
    modelProfileId: text("model_profile_id"),
    aiRunId: uuid("ai_run_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("content_artifacts_event_type_version_uidx").on(
      table.eventId,
      table.artifactType,
      table.version
    )
  ]
);

export const contentEvidence = pgTable("content_evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: text("source_id").notNull().references(() => contentSources.id, { onDelete: "cascade" }),
  originalUrl: text("original_url"),
  providerRef: text("provider_ref"),
  title: text("title"),
  excerpt: text("excerpt"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  collectedAt: timestamp("collected_at", { withTimezone: true }).notNull().defaultNow(),
  contentHash: text("content_hash").notNull(),
  snapshotKey: text("snapshot_key"),
  verificationStatus: text("verification_status").notNull().default("UNVERIFIED"),
  verifiedBy: text("verified_by"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const contentItemEvidence = pgTable(
  "content_item_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: text("content_id").notNull().references(() => contentItems.id, { onDelete: "cascade" }),
    evidenceId: uuid("evidence_id").notNull().references(() => contentEvidence.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("SUPPORTING"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("content_item_evidence_content_evidence_uidx").on(table.contentId, table.evidenceId)
  ]
);

export const contentReviews = pgTable("content_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentId: text("content_id").notNull().references(() => contentItems.id, { onDelete: "cascade" }),
  contentVersion: integer("content_version").notNull(),
  decision: text("decision").notNull(),
  note: text("note"),
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
  reviewerEmail: text("reviewer_email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const contentPublishRecords = pgTable("content_publish_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  entityVersion: integer("entity_version").notNull(),
  channel: text("channel").notNull(),
  publishedBy: uuid("published_by").references(() => users.id, { onDelete: "set null" }),
  publishedByEmail: text("published_by_email").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb("metadata").notNull().default({})
});

export const adminAuditRecords = pgTable("admin_audit_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const contentAuditRecords = pgTable("content_audit_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  entityVersion: integer("entity_version"),
  before: jsonb("before"),
  after: jsonb("after"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const feishuDocumentMappings = pgTable(
  "feishu_document_mappings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    docToken: text("doc_token").notNull(),
    revision: text("revision"),
    syncStatus: text("sync_status").notNull().default("LOCAL_ONLY"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("feishu_document_mappings_entity_uidx").on(table.entityType, table.entityId)]
);

export const aiRuns = pgTable("ai_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskType: text("task_type").notNull(),
  modelProvider: text("model_provider").notNull(),
  model: text("model").notNull(),
  skillVersion: text("skill_version"),
  promptVersion: text("prompt_version"),
  rulePackVersions: jsonb("rule_pack_versions").notNull().default([]),
  contextIds: jsonb("context_ids").notNull().default([]),
  evidenceIds: jsonb("evidence_ids").notNull().default([]),
  inputHash: text("input_hash").notNull(),
  rawOutput: jsonb("raw_output"),
  validatorResult: jsonb("validator_result"),
  status: text("status").notNull().default("RUNNING"),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  humanReviewResult: jsonb("human_review_result"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const contentEventClusterAnalyses = pgTable(
  "content_event_cluster_analyses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clusterId: uuid("cluster_id").notNull().references(() => contentEventClusters.id, { onDelete: "cascade" }),
    aiRunId: uuid("ai_run_id").notNull().references(() => aiRuns.id, { onDelete: "restrict" }),
    analysisVersion: text("analysis_version").notNull(),
    inputHash: text("input_hash").notNull(),
    opcRelevanceScore: integer("opc_relevance_score").notNull(),
    coreFacts: jsonb("core_facts").notNull().default([]),
    disagreementsOrUncertainties: jsonb("disagreements_or_uncertainties").notNull().default([]),
    whyItMatters: text("why_it_matters").notNull(),
    recommendedAngles: jsonb("recommended_angles").notNull().default([]),
    suggestedContentTypes: jsonb("suggested_content_types").notNull().default([]),
    humanReviewFlags: jsonb("human_review_flags").notNull().default([]),
    calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("content_event_cluster_analyses_cluster_uidx").on(table.clusterId)
  ]
);

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

export const practiceDrafts = pgTable(
  "practice_drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceKnowledgeId: text("source_knowledge_id").notNull().references(() => knowledgeItems.id, { onDelete: "cascade" }),
    sourceDeepResourceId: uuid("source_deep_resource_id").references(() => knowledgeDeepResources.id, { onDelete: "set null" }),
    generationMode: text("generation_mode").notNull().default("RULE"),
    generationError: text("generation_error"),
    draft: jsonb("draft").notNull(),
    status: text("status").notNull().default("PENDING_REVIEW"),
    reviewNote: text("review_note"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    resultPracticeId: text("result_practice_id").references(() => practices.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("practice_drafts_knowledge_uidx").on(table.sourceKnowledgeId)
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
