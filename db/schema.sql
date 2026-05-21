-- ============================================================
-- Arya HR Email Studio — Core Database Schema
-- Run this against any PostgreSQL 14+ instance.
-- ============================================================

-- 1. Users / tenants
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. AI generation history
--    Stores every prompt a user submits and the full AI response
--    so you can replay, audit, or fine-tune later.
CREATE TABLE IF NOT EXISTS ai_generations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- What the user typed
  prompt        TEXT NOT NULL,
  context       TEXT,                          -- brand/company guidelines blob

  -- Which model produced the result
  provider      TEXT NOT NULL CHECK (provider IN ('gemini','groq','openrouter')),
  model_name    TEXT,                          -- e.g. "gemini-2.0-flash-001"

  -- The raw AI output (full JSON template)
  response_json JSONB NOT NULL,

  -- Quick look-up fields extracted from the response
  template_name TEXT,
  block_count   INT,

  -- Timing
  latency_ms    INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_gen_user   ON ai_generations (user_id, created_at DESC);
CREATE INDEX idx_ai_gen_prompt ON ai_generations USING gin (to_tsvector('english', prompt));

-- 3. Saved templates
--    The canonical store for every template a user keeps.
CREATE TABLE IF NOT EXISTS templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  name          TEXT NOT NULL DEFAULT 'Untitled',
  category      TEXT,                          -- e.g. "onboarding", "birthday"

  -- Full block-tree JSON (Template type from lib/blocks/types.ts)
  template_json JSONB NOT NULL,

  -- Email settings (subject, from, reply-to, etc.)
  settings_json JSONB,

  -- Optional link back to the generation that created it
  generation_id UUID REFERENCES ai_generations(id) ON DELETE SET NULL,

  is_draft      BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tpl_user ON templates (user_id, updated_at DESC);

-- 4. Data sources
--    Mirrors the localStorage DataSource model so the backend
--    can also trigger automations and mail-merge.
CREATE TABLE IF NOT EXISTS data_sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  name          TEXT NOT NULL,
  source_type   TEXT NOT NULL CHECK (source_type IN ('csv','airtable','crm')),

  -- Connection details (encrypted at rest via your infra)
  config_json   JSONB NOT NULL,                -- base_id, table, token, etc.

  -- Cached field list for quick mapping UI
  fields        TEXT[],

  -- Cached row count from last sync
  row_count     INT,
  last_synced   TIMESTAMPTZ,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ds_user ON data_sources (user_id);

-- 5. Automations / pipelines
CREATE TABLE IF NOT EXISTS automations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  name          TEXT NOT NULL DEFAULT 'Untitled automation',
  enabled       BOOLEAN NOT NULL DEFAULT false,

  -- Trigger config (type, cron, event, etc.)
  trigger_json  JSONB NOT NULL,

  -- Ordered step array
  steps_json    JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Which template does this automation send?
  template_id   UUID REFERENCES templates(id) ON DELETE SET NULL,

  -- Which data source feeds the recipients?
  data_source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_auto_user ON automations (user_id);

-- 6. Send log
--    Every email actually dispatched — for deliverability tracking.
CREATE TABLE IF NOT EXISTS send_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  automation_id UUID REFERENCES automations(id) ON DELETE SET NULL,
  template_id   UUID REFERENCES templates(id) ON DELETE SET NULL,

  recipient     TEXT NOT NULL,
  subject       TEXT,
  status        TEXT NOT NULL DEFAULT 'queued'
                  CHECK (status IN ('queued','sent','delivered','bounced','failed')),
  error_msg     TEXT,

  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_send_user   ON send_log (user_id, created_at DESC);
CREATE INDEX idx_send_auto   ON send_log (automation_id, created_at DESC);
CREATE INDEX idx_send_status ON send_log (status);

-- 7. Helper: auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated      BEFORE UPDATE ON users        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_templates_updated   BEFORE UPDATE ON templates    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_datasources_updated BEFORE UPDATE ON data_sources FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_automations_updated BEFORE UPDATE ON automations  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
