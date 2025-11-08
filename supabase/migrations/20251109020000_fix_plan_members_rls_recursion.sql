-- ============================================================================
-- Migration: Fix plan_members RLS infinite recursion
-- Description: plan_membersのRLSポリシーの無限再帰を修正
-- Issue: plan_membersのSELECTポリシーがtravel_plansを参照し、
--        travel_plansのポリシーがplan_membersを参照して無限ループ
-- ============================================================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view members of accessible plans" ON public.plan_members;

-- 新しいポリシー: シンプルな条件でplan_membersの参照を確認
-- ユーザーは以下の場合にplan_membersを参照可能:
-- 1. 自分がメンバーとして登録されているプラン
-- 2. 自分が作成したプラン（travel_plansテーブルのcreated_byで確認）
CREATE POLICY "Users can view members of their plans"
  ON public.plan_members
  FOR SELECT
  USING (
    -- 自分がメンバーとして登録されている
    user_id = auth.uid()
    OR
    -- 自分が作成したプラン（plan_membersを参照せずにtravel_plansのcreated_byで直接確認）
    EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = plan_members.plan_id
        AND travel_plans.created_by = auth.uid()
    )
  );

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON POLICY "Users can view members of their plans" ON public.plan_members IS
  'ユーザーは自分が作成したプランまたは参加しているプランのメンバー一覧を参照可能。無限再帰を防ぐためplan_membersへの再帰参照を削除。';
