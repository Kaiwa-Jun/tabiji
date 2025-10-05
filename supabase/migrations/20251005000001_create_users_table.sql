-- ============================================================================
-- Table: users
-- Description: LINEユーザー情報を管理するテーブル
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_line_user_id
  ON public.users(line_user_id);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.users IS 'LINEユーザー情報を管理するテーブル';
COMMENT ON COLUMN public.users.id IS 'ユーザーID';
COMMENT ON COLUMN public.users.line_user_id IS 'LINE ユーザーID（一意）';
COMMENT ON COLUMN public.users.display_name IS 'LINE表示名';
COMMENT ON COLUMN public.users.picture_url IS 'プロフィール画像URL';
COMMENT ON COLUMN public.users.created_at IS '作成日時';
COMMENT ON COLUMN public.users.updated_at IS '更新日時';

-- ============================================================================
-- Trigger: updated_atの自動更新
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
