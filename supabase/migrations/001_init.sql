-- =============================================================================
-- 001_init.sql  –  Initial database schema for Memory Mirror
-- =============================================================================
-- Run this migration against your Supabase project via the SQL editor or the
-- Supabase CLI:
--   supabase db push
-- =============================================================================

-- ---------------------------------------------------------------------------
-- users  (extends Supabase auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email       VARCHAR     NOT NULL,
  full_name   VARCHAR     NOT NULL DEFAULT '',
  avatar_url  VARCHAR,
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- Automatically update updated_at on every row change.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Row-level security: users can only read/write their own row.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: select own row"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users: insert own row"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users: update own row"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- journal_entries
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title       VARCHAR     NOT NULL DEFAULT '',
  content     TEXT        NOT NULL DEFAULT '',
  mood        VARCHAR,
  tags        TEXT[],
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journal_entries: select own"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "journal_entries: insert own"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journal_entries: update own"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "journal_entries: delete own"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- memory_sessions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.memory_sessions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  session_name      VARCHAR     NOT NULL DEFAULT '',
  description       TEXT,
  session_data      JSONB       NOT NULL DEFAULT '{}',
  duration_minutes  INTEGER,
  created_at        TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER memory_sessions_updated_at
  BEFORE UPDATE ON public.memory_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.memory_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "memory_sessions: select own"
  ON public.memory_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "memory_sessions: insert own"
  ON public.memory_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "memory_sessions: update own"
  ON public.memory_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "memory_sessions: delete own"
  ON public.memory_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- subscription_status
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_status (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  plan_type          VARCHAR     NOT NULL DEFAULT 'free'
                                 CHECK (plan_type IN ('free', 'pro', 'premium')),
  is_active          BOOLEAN     NOT NULL DEFAULT TRUE,
  stripe_customer_id VARCHAR,
  renewal_date       TIMESTAMP,
  created_at         TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER subscription_status_updated_at
  BEFORE UPDATE ON public.subscription_status
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.subscription_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscription_status: select own"
  ON public.subscription_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "subscription_status: insert own"
  ON public.subscription_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscription_status: update own"
  ON public.subscription_status FOR UPDATE
  USING (auth.uid() = user_id);
