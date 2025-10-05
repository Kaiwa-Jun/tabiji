-- ============================================================================
-- Table: user_settings
-- Description: ユーザーごとの設定を管理するテーブル
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_hours_before INTEGER NOT NULL DEFAULT 24,
  default_display_mode VARCHAR(20) NOT NULL DEFAULT 'order_only',
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- 制約: default_display_modeは order_only または with_time のみ
  CONSTRAINT check_default_display_mode CHECK (default_display_mode IN ('order_only', 'with_time')),
  -- 制約: reminder_hours_beforeは正の整数
  CONSTRAINT check_reminder_hours CHECK (reminder_hours_before > 0)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id
  ON public.user_settings(user_id);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.user_settings IS 'ユーザーごとの設定を管理するテーブル';
COMMENT ON COLUMN public.user_settings.id IS '設定ID';
COMMENT ON COLUMN public.user_settings.user_id IS 'ユーザーID（usersテーブルへの外部キー、一意）';
COMMENT ON COLUMN public.user_settings.notification_enabled IS '通知有効フラグ';
COMMENT ON COLUMN public.user_settings.reminder_enabled IS 'リマインダー有効フラグ';
COMMENT ON COLUMN public.user_settings.reminder_hours_before IS 'リマインダー時間（何時間前）';
COMMENT ON COLUMN public.user_settings.default_display_mode IS 'デフォルト表示モード（order_only/with_time）';
COMMENT ON COLUMN public.user_settings.preferences IS 'その他の設定（JSON形式）';
COMMENT ON COLUMN public.user_settings.created_at IS '作成日時';
COMMENT ON COLUMN public.user_settings.updated_at IS '更新日時';

-- ============================================================================
-- Trigger: updated_atの自動更新
-- ============================================================================

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
