-- ============================================================================
-- Table: plan_shares
-- Description: プランの外部共有、共有リンクを管理するテーブル
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plan_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.travel_plans(id) ON DELETE CASCADE,
  share_token VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_plan_shares_plan_id
  ON public.plan_shares(plan_id);

CREATE INDEX IF NOT EXISTS idx_plan_shares_token
  ON public.plan_shares(share_token);

CREATE INDEX IF NOT EXISTS idx_plan_shares_active
  ON public.plan_shares(is_active, expires_at);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.plan_shares IS 'プランの外部共有を管理するテーブル';
COMMENT ON COLUMN public.plan_shares.id IS '共有ID';
COMMENT ON COLUMN public.plan_shares.plan_id IS 'プランID（travel_plansテーブルへの外部キー）';
COMMENT ON COLUMN public.plan_shares.share_token IS '共有トークン（一意）';
COMMENT ON COLUMN public.plan_shares.is_active IS '有効フラグ';
COMMENT ON COLUMN public.plan_shares.expires_at IS '有効期限';
COMMENT ON COLUMN public.plan_shares.created_at IS '作成日時';
