-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_onboarding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "completed_at" DATETIME,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "primary_goal" TEXT,
    "experience_level" TEXT,
    "toe_touch_score" INTEGER,
    "shoulder_reach_score" INTEGER,
    "hip_flexibility_score" INTEGER,
    "overall_flexibility_score" INTEGER,
    "flexibility_level" TEXT,
    "workout_days" TEXT,
    "preferred_workout_time" TEXT,
    "stretching_preference" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_onboarding_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_follows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "following_user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_follows_following_user_id_fkey" FOREIGN KEY ("following_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stretches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration_seconds" INTEGER NOT NULL,
    "video_url" TEXT,
    "thumbnail_url" TEXT,
    "animation_url" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "primary_muscles" TEXT NOT NULL,
    "secondary_muscles" TEXT,
    "instructions" TEXT,
    "tips" TEXT,
    "common_mistakes" TEXT,
    "equipment" TEXT,
    "tags" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "stretching_routines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "duration_seconds" INTEGER NOT NULL,
    "target_areas" TEXT,
    "tags" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "uses_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "stretching_routines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "routine_stretches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routine_id" TEXT NOT NULL,
    "stretch_id" TEXT NOT NULL,
    "position_order" INTEGER NOT NULL,
    "custom_duration_seconds" INTEGER,
    CONSTRAINT "routine_stretches_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "stretching_routines" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "routine_stretches_stretch_id_fkey" FOREIGN KEY ("stretch_id") REFERENCES "stretches" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stretching_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "routine_id" TEXT,
    "routine_name" TEXT,
    "started_at" DATETIME NOT NULL,
    "completed_at" DATETIME,
    "duration_seconds" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "linked_workout_id" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stretching_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "stretching_sessions_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "stretching_routines" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "session_stretches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "stretch_id" TEXT NOT NULL,
    "held_duration_seconds" INTEGER NOT NULL,
    "felt_tight" BOOLEAN NOT NULL DEFAULT false,
    "position_in_routine" INTEGER NOT NULL,
    "completed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "session_stretches_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "stretching_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "session_stretches_stretch_id_fkey" FOREIGN KEY ("stretch_id") REFERENCES "stretches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "flexibility_goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "goal_type" TEXT NOT NULL,
    "description" TEXT,
    "target_area" TEXT NOT NULL,
    "baseline_rom" REAL,
    "target_rom" REAL,
    "target_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "flexibility_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rom_measurements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goal_id" TEXT NOT NULL,
    "rom_degrees" REAL NOT NULL,
    "measurement_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "measurement_method" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rom_measurements_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "flexibility_goals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "progress_videos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "goal_id" TEXT,
    "video_url" TEXT NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "progress_videos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "progress_videos_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "flexibility_goals" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "equipment_needed" TEXT,
    "video_url" TEXT,
    "thumbnail_url" TEXT,
    "primary_muscles" TEXT NOT NULL,
    "secondary_muscles" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "instructions" TEXT,
    "tips" TEXT,
    "common_mistakes" TEXT,
    "is_compound" BOOLEAN NOT NULL DEFAULT false,
    "is_unilateral" BOOLEAN NOT NULL DEFAULT false,
    "force_type" TEXT,
    "mechanic" TEXT,
    "met_value" REAL,
    "is_1rm_eligible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "strength_workouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "started_at" DATETIME NOT NULL,
    "completed_at" DATETIME,
    "duration_seconds" INTEGER,
    "session_intensity_rpe" INTEGER,
    "notes" TEXT,
    "total_volume" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "strength_workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workout_exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workout_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "position_order" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workout_exercises_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "strength_workouts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "workout_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workout_sets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workout_exercise_id" TEXT NOT NULL,
    "set_number" INTEGER NOT NULL,
    "reps" INTEGER,
    "weight" REAL,
    "weight_unit" TEXT NOT NULL DEFAULT 'lbs',
    "set_type" TEXT NOT NULL DEFAULT 'normal',
    "rpe" INTEGER,
    "is_pr" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "rest_seconds" INTEGER,
    "duration_seconds" INTEGER,
    "distance_meters" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workout_sets_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "workout_exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "personal_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "record_type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "weight_unit" TEXT NOT NULL DEFAULT 'lbs',
    "achieved_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workout_id" TEXT,
    CONSTRAINT "personal_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "personal_records_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "body_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "weight" REAL,
    "weight_unit" TEXT NOT NULL DEFAULT 'lbs',
    "body_fat_percentage" REAL,
    "chest" REAL,
    "waist" REAL,
    "hips" REAL,
    "arms" REAL,
    "thighs" REAL,
    "measurement_unit" TEXT NOT NULL DEFAULT 'inches',
    "measurement_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "body_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "action_type" TEXT,
    "action_data" TEXT,
    "sent_at" DATETIME,
    "read_at" DATETIME,
    "clicked_at" DATETIME,
    "delivery_status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "stretch_reminders" BOOLEAN NOT NULL DEFAULT true,
    "workout_reminders" BOOLEAN NOT NULL DEFAULT true,
    "streak_notifications" BOOLEAN NOT NULL DEFAULT true,
    "goal_notifications" BOOLEAN NOT NULL DEFAULT true,
    "social_notifications" BOOLEAN NOT NULL DEFAULT true,
    "recovery_suggestions" BOOLEAN NOT NULL DEFAULT true,
    "inactivity_nudges" BOOLEAN NOT NULL DEFAULT false,
    "quiet_hours_enabled" BOOLEAN NOT NULL DEFAULT true,
    "quiet_hours_start" TEXT NOT NULL DEFAULT '22:00',
    "quiet_hours_end" TEXT NOT NULL DEFAULT '08:00',
    "max_daily_notifications" INTEGER NOT NULL DEFAULT 5,
    "stretch_reminder_time" TEXT NOT NULL DEFAULT '18:30',
    "workout_reminder_time" TEXT NOT NULL DEFAULT '17:00',
    "reminder_days" TEXT NOT NULL DEFAULT '["Mon","Tue","Wed","Thu","Fri"]',
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "price_paid" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME,
    "cancelled_at" DATETIME,
    "provider" TEXT,
    "provider_subscription_id" TEXT,
    "provider_customer_id" TEXT,
    "trial_started_at" DATETIME,
    "trial_ends_at" DATETIME,
    "is_trial" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_consents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "consent_type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "consented" BOOLEAN NOT NULL,
    "consented_at" DATETIME,
    "withdrawn_at" DATETIME,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "data_export_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requested_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    "expires_at" DATETIME,
    "download_url" TEXT,
    "file_size_bytes" INTEGER,
    CONSTRAINT "data_export_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deletion_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "requested_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grace_period_ends_at" DATETIME,
    "completed_at" DATETIME,
    "cancelled_at" DATETIME,
    CONSTRAINT "deletion_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_onboarding_user_id_key" ON "user_onboarding"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_follows_user_id_following_user_id_key" ON "user_follows"("user_id", "following_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "personal_records_user_id_exercise_id_record_type_key" ON "personal_records"("user_id", "exercise_id", "record_type");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");
