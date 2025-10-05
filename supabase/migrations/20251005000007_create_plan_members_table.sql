-- ============================================================================
-- Table: plan_members
-- Description: 複数人でのプラン共有、プラン参加者を管理するテーブル
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plan_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.travel_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- 制約: 同じプラン内でユーザーは一意
  CONSTRAINT unique_plan_member UNIQUE (plan_id, user_id)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_plan_members_plan_id
  ON public.plan_members(plan_id);

CREATE INDEX IF NOT EXISTS idx_plan_members_user_id
  ON public.plan_members(user_id);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.plan_members IS 'プラン参加者を管理するテーブル';
COMMENT ON COLUMN public.plan_members.id IS 'メンバーID';
COMMENT ON COLUMN public.plan_members.plan_id IS 'プランID（travel_plansテーブルへの外部キー）';
COMMENT ON COLUMN public.plan_members.user_id IS 'ユーザーID（usersテーブルへの外部キー）';
COMMENT ON COLUMN public.plan_members.joined_at IS '参加日時';
