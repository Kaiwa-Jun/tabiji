-- ============================================================================
-- Migration: Fix all RLS infinite recursion issues
-- Description: plan_days, plan_spotsのRLSポリシーからplan_membersへの参照を削除
-- Issue: これらのポリシーがplan_membersを参照することで無限再帰の可能性
-- Solution: created_byとis_publicのみでチェックするようシンプル化
-- ============================================================================

-- ============================================================================
-- plan_days テーブルのポリシー修正
-- ============================================================================

DROP POLICY IF EXISTS "Users can view plan days of accessible plans" ON public.plan_days;
DROP POLICY IF EXISTS "Users can manage plan days of accessible plans" ON public.plan_days;

-- 新しいSELECTポリシー
CREATE POLICY "Users can view plan days of own and public plans"
  ON public.plan_days
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = plan_days.plan_id
        AND (
          travel_plans.created_by = auth.uid()
          OR travel_plans.is_public = TRUE
        )
    )
  );

-- 新しいALLポリシー（INSERT/UPDATE/DELETE）
CREATE POLICY "Users can manage plan days of own plans"
  ON public.plan_days
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = plan_days.plan_id
        AND travel_plans.created_by = auth.uid()
    )
  );

-- ============================================================================
-- plan_spots テーブルのポリシー修正
-- ============================================================================

DROP POLICY IF EXISTS "Users can view plan spots of accessible plans" ON public.plan_spots;
DROP POLICY IF EXISTS "Users can manage plan spots of accessible plans" ON public.plan_spots;

-- 新しいSELECTポリシー
CREATE POLICY "Users can view plan spots of own and public plans"
  ON public.plan_spots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_days
      JOIN public.travel_plans ON travel_plans.id = plan_days.plan_id
      WHERE plan_days.id = plan_spots.plan_day_id
        AND (
          travel_plans.created_by = auth.uid()
          OR travel_plans.is_public = TRUE
        )
    )
  );

-- 新しいALLポリシー（INSERT/UPDATE/DELETE）
CREATE POLICY "Users can manage plan spots of own plans"
  ON public.plan_spots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_days
      JOIN public.travel_plans ON travel_plans.id = plan_days.plan_id
      WHERE plan_days.id = plan_spots.plan_day_id
        AND travel_plans.created_by = auth.uid()
    )
  );

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON POLICY "Users can view plan days of own and public plans" ON public.plan_days IS
  'ユーザーは自分が作成したプランまたは公開プランの日程を参照可能。plan_membersへの参照を削除して無限再帰を防止。';

COMMENT ON POLICY "Users can manage plan days of own plans" ON public.plan_days IS
  'プラン作成者のみ日程を管理可能。plan_membersへの参照を削除して無限再帰を防止。';

COMMENT ON POLICY "Users can view plan spots of own and public plans" ON public.plan_spots IS
  'ユーザーは自分が作成したプランまたは公開プランのスポットを参照可能。plan_membersへの参照を削除して無限再帰を防止。';

COMMENT ON POLICY "Users can manage plan spots of own plans" ON public.plan_spots IS
  'プラン作成者のみスポットを管理可能。plan_membersへの参照を削除して無限再帰を防止。';
