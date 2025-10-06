-- ============================================================================
-- Row Level Security (RLS) の有効化とポリシー設定
-- Description: 各テーブルにRLSを有効化し、基本的なアクセス制御ポリシーを設定
-- ============================================================================

-- ============================================================================
-- RLSの有効化
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_shares ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- users テーブルのポリシー
-- ============================================================================

-- ユーザーは自分自身のレコードを参照可能
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- ユーザーは自分自身のレコードを更新可能
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- 認証済みユーザーは新規ユーザーレコードを作成可能
CREATE POLICY "Authenticated users can create users"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- ============================================================================
-- travel_plans テーブルのポリシー
-- ============================================================================

-- ユーザーは自分が作成したプランまたは参加しているプランを参照可能
CREATE POLICY "Users can view own or member plans"
  ON public.travel_plans
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.plan_members
      WHERE plan_members.plan_id = travel_plans.id
        AND plan_members.user_id = auth.uid()
    )
    OR is_public = TRUE
  );

-- 認証済みユーザーはプランを作成可能
CREATE POLICY "Authenticated users can create plans"
  ON public.travel_plans
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ユーザーは自分が作成したプランまたは参加しているプランを更新可能
CREATE POLICY "Users can update own or member plans"
  ON public.travel_plans
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.plan_members
      WHERE plan_members.plan_id = travel_plans.id
        AND plan_members.user_id = auth.uid()
    )
  );

-- ユーザーは自分が作成したプランのみ削除可能
CREATE POLICY "Users can delete own plans"
  ON public.travel_plans
  FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================================
-- plan_days テーブルのポリシー
-- ============================================================================

-- ユーザーは自分が参加しているプランの日程を参照可能
CREATE POLICY "Users can view plan days of accessible plans"
  ON public.plan_days
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = plan_days.plan_id
        AND (
          travel_plans.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = auth.uid()
          )
          OR travel_plans.is_public = TRUE
        )
    )
  );

-- ユーザーは自分が参加しているプランの日程を作成・更新・削除可能
CREATE POLICY "Users can manage plan days of accessible plans"
  ON public.plan_days
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = plan_days.plan_id
        AND (
          travel_plans.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = auth.uid()
          )
        )
    )
  );

-- ============================================================================
-- spots テーブルのポリシー
-- ============================================================================

-- 全ての認証済みユーザーはスポット情報を参照可能（キャッシュとして機能）
CREATE POLICY "Authenticated users can view spots"
  ON public.spots
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 全ての認証済みユーザーはスポット情報を作成可能
CREATE POLICY "Authenticated users can create spots"
  ON public.spots
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- plan_spots テーブルのポリシー
-- ============================================================================

-- ユーザーは自分が参加しているプランのスポットを参照可能
CREATE POLICY "Users can view plan spots of accessible plans"
  ON public.plan_spots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_days
      JOIN public.travel_plans ON travel_plans.id = plan_days.plan_id
      WHERE plan_days.id = plan_spots.plan_day_id
        AND (
          travel_plans.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = auth.uid()
          )
          OR travel_plans.is_public = TRUE
        )
    )
  );

-- ユーザーは自分が参加しているプランのスポットを管理可能
CREATE POLICY "Users can manage plan spots of accessible plans"
  ON public.plan_spots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_days
      JOIN public.travel_plans ON travel_plans.id = plan_days.plan_id
      WHERE plan_days.id = plan_spots.plan_day_id
        AND (
          travel_plans.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = auth.uid()
          )
        )
    )
  );

-- ============================================================================
-- plan_members テーブルのポリシー
-- ============================================================================

-- ユーザーは自分が参加しているプランのメンバーを参照可能
CREATE POLICY "Users can view members of accessible plans"
  ON public.plan_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = plan_members.plan_id
        AND (
          travel_plans.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.plan_members pm
            WHERE pm.plan_id = travel_plans.id
              AND pm.user_id = auth.uid()
          )
        )
    )
  );

-- プラン作成者のみメンバーを追加可能
CREATE POLICY "Plan creators can add members"
  ON public.plan_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = plan_members.plan_id
        AND travel_plans.created_by = auth.uid()
    )
  );

-- プラン作成者のみメンバーを削除可能
CREATE POLICY "Plan creators can remove members"
  ON public.plan_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = plan_members.plan_id
        AND travel_plans.created_by = auth.uid()
    )
  );

-- ============================================================================
-- user_settings テーブルのポリシー
-- ============================================================================

-- ユーザーは自分の設定のみ参照・更新可能
CREATE POLICY "Users can view own settings"
  ON public.user_settings
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON public.user_settings
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- plan_shares テーブルのポリシー
-- ============================================================================

-- プラン作成者のみ共有設定を管理可能
CREATE POLICY "Plan creators can manage shares"
  ON public.plan_shares
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = plan_shares.plan_id
        AND travel_plans.created_by = auth.uid()
    )
  );

-- 全ての認証済みユーザーは有効な共有トークンを参照可能
CREATE POLICY "Authenticated users can view active shares"
  ON public.plan_shares
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- ============================================================================
-- line_groups テーブルのポリシー
-- ============================================================================

-- 認証済みユーザーは全てのLINEグループ情報を参照可能
CREATE POLICY "Authenticated users can view line groups"
  ON public.line_groups
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 認証済みユーザーはLINEグループ情報を作成可能
CREATE POLICY "Authenticated users can create line groups"
  ON public.line_groups
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
