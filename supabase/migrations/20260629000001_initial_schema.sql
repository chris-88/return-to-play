-- ─────────────────────────────────────────────────────────────────────────────
-- Initial schema — return-to-play
-- ─────────────────────────────────────────────────────────────────────────────

-- ── training_blocks ──────────────────────────────────────────────────────────
CREATE TABLE training_blocks (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  phase                 text NOT NULL,
  start_date            date NOT NULL,
  end_date              date NOT NULL,
  goal                  text,
  priority_order        jsonb,
  target_weight_min_kg  numeric,
  target_weight_max_kg  numeric,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE training_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner access" ON training_blocks FOR ALL USING (auth.uid() IS NOT NULL);

-- ── session_templates ────────────────────────────────────────────────────────
CREATE TABLE session_templates (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id              uuid NOT NULL REFERENCES training_blocks(id) ON DELETE CASCADE,
  session_code          text NOT NULL,
  name                  text NOT NULL,
  category              text NOT NULL,
  priority              integer NOT NULL DEFAULT 0,
  estimated_duration_min integer NOT NULL DEFAULT 60,
  purpose               text,
  intensity_target      text,
  default_version       jsonb NOT NULL DEFAULT '[]',
  compressed_version    jsonb,
  recovery_version      jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner access" ON session_templates FOR ALL USING (auth.uid() IS NOT NULL);

-- ── session_exercises ────────────────────────────────────────────────────────
CREATE TABLE session_exercises (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_template_id   uuid NOT NULL REFERENCES session_templates(id) ON DELETE CASCADE,
  exercise_name         text NOT NULL,
  exercise_category     text,
  sets                  integer NOT NULL DEFAULT 3,
  reps                  text,
  duration_sec          integer,
  distance_m            numeric,
  intensity             text,
  rest_seconds          integer,
  notes                 text,
  sort_order            integer NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner access" ON session_exercises FOR ALL USING (auth.uid() IS NOT NULL);

-- ── daily_checkins ───────────────────────────────────────────────────────────
CREATE TABLE daily_checkins (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date                      date NOT NULL,
  weight_kg                 numeric,
  sleep_hours               numeric,
  sleep_quality             integer CHECK (sleep_quality BETWEEN 1 AND 10),
  fatigue                   integer CHECK (fatigue BETWEEN 1 AND 10),
  soreness                  integer CHECK (soreness BETWEEN 1 AND 10),
  stress                    integer CHECK (stress BETWEEN 1 AND 10),
  readiness                 integer CHECK (readiness BETWEEN 1 AND 10),
  steps                     integer,
  water_litres              numeric,
  protein_g                 integer,
  calories                  integer,
  alcohol_units             numeric,
  creatine_taken            boolean,
  protein_supplement_taken  boolean,
  pain_area                 text,
  pain_score                integer CHECK (pain_score BETWEEN 1 AND 10),
  notes                     text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner access" ON daily_checkins FOR ALL USING (auth.uid() = user_id);

-- ── training_sessions ────────────────────────────────────────────────────────
CREATE TABLE training_sessions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date                  date NOT NULL,
  block_id              uuid REFERENCES training_blocks(id),
  session_template_id   uuid REFERENCES session_templates(id),
  session_code          text,
  session_name          text NOT NULL,
  session_category      text NOT NULL,
  planned_or_unplanned  text NOT NULL DEFAULT 'planned',
  duration_min          integer NOT NULL,
  session_rpe           integer NOT NULL CHECK (session_rpe BETWEEN 1 AND 10),
  session_load          integer NOT NULL,
  completed_status      text NOT NULL DEFAULT 'completed',
  location              text,
  warmup_completed      boolean,
  pain_during_session   boolean,
  pain_area             text,
  pain_score            integer CHECK (pain_score BETWEEN 1 AND 10),
  energy_after_session  integer CHECK (energy_after_session BETWEEN 1 AND 10),
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner access" ON training_sessions FOR ALL USING (auth.uid() = user_id);

-- ── exercise_results ─────────────────────────────────────────────────────────
CREATE TABLE exercise_results (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_session_id   uuid NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  exercise_name         text NOT NULL,
  exercise_category     text,
  set_number            integer NOT NULL,
  planned_sets          integer,
  planned_reps          text,
  actual_reps           integer,
  weight_kg             numeric,
  duration_sec          integer,
  distance_m            numeric,
  rpe                   integer CHECK (rpe BETWEEN 1 AND 10),
  completed             boolean NOT NULL DEFAULT true,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exercise_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner access" ON exercise_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM training_sessions ts
      WHERE ts.id = training_session_id AND ts.user_id = auth.uid()
    )
  );

-- ── body_metrics ─────────────────────────────────────────────────────────────
CREATE TABLE body_metrics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date            date NOT NULL,
  weight_kg       numeric,
  waist_cm        numeric,
  photo_front_url text,
  photo_side_url  text,
  photo_back_url  text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner access" ON body_metrics FOR ALL USING (auth.uid() = user_id);

-- ── watch_workouts ───────────────────────────────────────────────────────────
CREATE TABLE watch_workouts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date            date NOT NULL,
  source          text NOT NULL DEFAULT 'apple_health',
  activity_type   text,
  duration_min    numeric,
  distance_km     numeric,
  active_kcal     integer,
  avg_hr          integer,
  max_hr          integer,
  steps           integer,
  vo2max          numeric,
  resting_hr      integer,
  hrv             numeric,
  raw_payload     jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE watch_workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner access" ON watch_workouts FOR ALL USING (auth.uid() = user_id);

-- ── plan_adjustments ─────────────────────────────────────────────────────────
CREATE TABLE plan_adjustments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date            date NOT NULL,
  effective_from  date,
  source          text NOT NULL DEFAULT 'chatgpt_review',
  block_id        uuid REFERENCES training_blocks(id),
  session_code    text,
  change_type     text NOT NULL,
  field           text,
  new_value       text,
  reason          text,
  changes_json    jsonb,
  applied         boolean NOT NULL DEFAULT false,
  applied_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE plan_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner access" ON plan_adjustments FOR ALL USING (auth.uid() = user_id);

-- ── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON training_blocks    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON session_templates  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON session_exercises  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON daily_checkins     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON training_sessions  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON exercise_results   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON body_metrics       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON watch_workouts     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON plan_adjustments   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
