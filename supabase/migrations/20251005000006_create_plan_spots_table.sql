-- ============================================================================
-- Table: plan_spots
-- Description: 各プランでの訪問スポットを管理するテーブル
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plan_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_day_id UUID NOT NULL REFERENCES public.plan_days(id) ON DELETE CASCADE,
  spot_id UUID REFERENCES public.spots(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL,
  arrival_time TIME,
  departure_time TIME,
  duration_minutes INTEGER,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  custom_name VARCHAR(200),
  custom_location JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- 制約: 同じ日程内で訪問順序は一意
  CONSTRAINT unique_plan_day_order UNIQUE (plan_day_id, order_index),
  -- 制約: spot_id が NULL の場合は is_custom が TRUE でなければならない
  CONSTRAINT check_custom_spot CHECK (spot_id IS NOT NULL OR is_custom = TRUE),
  -- 制約: order_indexは0以上
  CONSTRAINT check_order_index CHECK (order_index >= 0),
  -- 制約: duration_minutesは0以上
  CONSTRAINT check_duration CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  -- 制約: 出発時刻は到着時刻以降
  CONSTRAINT check_times CHECK (arrival_time IS NULL OR departure_time IS NULL OR departure_time >= arrival_time)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_plan_spots_plan_day_id
  ON public.plan_spots(plan_day_id);

CREATE INDEX IF NOT EXISTS idx_plan_spots_spot_id
  ON public.plan_spots(spot_id);

CREATE INDEX IF NOT EXISTS idx_plan_spots_order
  ON public.plan_spots(plan_day_id, order_index);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.plan_spots IS '各プランでの訪問スポットを管理するテーブル';
COMMENT ON COLUMN public.plan_spots.id IS 'プランスポットID';
COMMENT ON COLUMN public.plan_spots.plan_day_id IS '日程ID（plan_daysテーブルへの外部キー）';
COMMENT ON COLUMN public.plan_spots.spot_id IS 'スポットID（spotsテーブルへの外部キー、カスタムスポットの場合はNULL）';
COMMENT ON COLUMN public.plan_spots.order_index IS '訪問順序（0から開始）';
COMMENT ON COLUMN public.plan_spots.arrival_time IS '到着予定時刻';
COMMENT ON COLUMN public.plan_spots.departure_time IS '出発予定時刻';
COMMENT ON COLUMN public.plan_spots.duration_minutes IS '滞在時間（分）';
COMMENT ON COLUMN public.plan_spots.is_custom IS 'ユーザー手動入力フラグ';
COMMENT ON COLUMN public.plan_spots.custom_name IS 'カスタムスポット名';
COMMENT ON COLUMN public.plan_spots.custom_location IS 'カスタム位置情報（JSON形式）';
COMMENT ON COLUMN public.plan_spots.notes IS 'メモ';
COMMENT ON COLUMN public.plan_spots.created_at IS '作成日時';
COMMENT ON COLUMN public.plan_spots.updated_at IS '更新日時';

-- ============================================================================
-- Trigger: updated_atの自動更新
-- ============================================================================

CREATE TRIGGER update_plan_spots_updated_at
  BEFORE UPDATE ON public.plan_spots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
