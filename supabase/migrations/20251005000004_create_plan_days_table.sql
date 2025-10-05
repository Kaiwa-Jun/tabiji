-- ============================================================================
-- Table: plan_days
-- Description: 日別の旅程を管理するテーブル
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.travel_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  start_point JSONB,
  end_point JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- 制約: 同じプラン内で日番号は一意
  CONSTRAINT unique_plan_day_number UNIQUE (plan_id, day_number),
  -- 制約: 同じプラン内で日付は一意
  CONSTRAINT unique_plan_date UNIQUE (plan_id, date),
  -- 制約: day_numberは1以上
  CONSTRAINT check_day_number CHECK (day_number >= 1)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_plan_days_plan_id
  ON public.plan_days(plan_id);

CREATE INDEX IF NOT EXISTS idx_plan_days_date
  ON public.plan_days(date);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.plan_days IS '日別の旅程を管理するテーブル';
COMMENT ON COLUMN public.plan_days.id IS '日程ID';
COMMENT ON COLUMN public.plan_days.plan_id IS 'プランID（travel_plansテーブルへの外部キー）';
COMMENT ON COLUMN public.plan_days.day_number IS '何日目か（1, 2, 3...）';
COMMENT ON COLUMN public.plan_days.date IS '該当日付';
COMMENT ON COLUMN public.plan_days.start_point IS '開始地点（名称、座標等をJSON形式で保存）';
COMMENT ON COLUMN public.plan_days.end_point IS '終了地点（名称、座標等をJSON形式で保存）';
COMMENT ON COLUMN public.plan_days.created_at IS '作成日時';
COMMENT ON COLUMN public.plan_days.updated_at IS '更新日時';

-- ============================================================================
-- Trigger: updated_atの自動更新
-- ============================================================================

CREATE TRIGGER update_plan_days_updated_at
  BEFORE UPDATE ON public.plan_days
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
