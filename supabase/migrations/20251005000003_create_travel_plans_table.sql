-- ============================================================================
-- Table: travel_plans
-- Description: 旅行プランの基本情報を管理するテーブル
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  area VARCHAR(50),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  line_group_id VARCHAR(50),
  display_mode VARCHAR(20) NOT NULL DEFAULT 'order_only',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- 制約: 終了日は開始日以降
  CONSTRAINT check_dates CHECK (end_date >= start_date),
  -- 制約: display_modeは order_only または with_time のみ
  CONSTRAINT check_display_mode CHECK (display_mode IN ('order_only', 'with_time'))
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_plans_created_by
  ON public.travel_plans(created_by);

CREATE INDEX IF NOT EXISTS idx_plans_line_group_id
  ON public.travel_plans(line_group_id);

CREATE INDEX IF NOT EXISTS idx_plans_start_date
  ON public.travel_plans(start_date);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.travel_plans IS '旅行プランの基本情報を管理するテーブル';
COMMENT ON COLUMN public.travel_plans.id IS 'プランID';
COMMENT ON COLUMN public.travel_plans.title IS 'プランタイトル';
COMMENT ON COLUMN public.travel_plans.start_date IS '開始日';
COMMENT ON COLUMN public.travel_plans.end_date IS '終了日';
COMMENT ON COLUMN public.travel_plans.area IS 'エリア（例：東京、関西）';
COMMENT ON COLUMN public.travel_plans.created_by IS '作成者ID（usersテーブルへの外部キー）';
COMMENT ON COLUMN public.travel_plans.line_group_id IS 'LINEグループID';
COMMENT ON COLUMN public.travel_plans.display_mode IS '表示モード（order_only: 順序のみ、with_time: 時刻付き）';
COMMENT ON COLUMN public.travel_plans.is_public IS '公開フラグ';
COMMENT ON COLUMN public.travel_plans.created_at IS '作成日時';
COMMENT ON COLUMN public.travel_plans.updated_at IS '更新日時';

-- ============================================================================
-- Trigger: updated_atの自動更新
-- ============================================================================

CREATE TRIGGER update_travel_plans_updated_at
  BEFORE UPDATE ON public.travel_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
