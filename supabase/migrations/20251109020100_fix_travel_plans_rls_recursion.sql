-- ============================================================================
-- Migration: Fix travel_plans RLS infinite recursion
-- Description: travel_plansとplan_membersの相互参照による無限再帰を修正
-- Issue: travel_plansのSELECTポリシーがplan_membersを参照し、
--        plan_membersのSELECTポリシーがtravel_plansを参照して無限ループ
-- Solution: travel_plansのポリシーをシンプル化し、created_byとis_publicのみでチェック
-- ============================================================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view own or member plans" ON public.travel_plans;
DROP POLICY IF EXISTS "Users can update own or member plans" ON public.travel_plans;

-- 新しいSELECTポリシー: plan_membersを参照せず、created_byとis_publicのみでチェック
CREATE POLICY "Users can view own and public plans"
  ON public.travel_plans
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR is_public = TRUE
  );

-- 新しいUPDATEポリシー: 作成者のみ更新可能（plan_membersへの参照を削除）
CREATE POLICY "Users can update own plans"
  ON public.travel_plans
  FOR UPDATE
  USING (created_by = auth.uid());

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON POLICY "Users can view own and public plans" ON public.travel_plans IS
  'ユーザーは自分が作成したプランまたは公開プランを参照可能。無限再帰を防ぐためplan_membersへの参照を削除。';

COMMENT ON POLICY "Users can update own plans" ON public.travel_plans IS
  'プラン作成者のみプランを更新可能。無限再帰を防ぐためplan_membersへの参照を削除。';
