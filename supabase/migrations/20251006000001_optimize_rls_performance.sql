-- RLSポリシーのパフォーマンス最適化
-- auth.uid()の呼び出しを(select auth.uid())に変更して、行ごとの再評価を防ぐ

-- ============================================
-- 1. usersテーブル
-- ============================================

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can create users" ON users;

-- 最適化されたポリシーを作成
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING ((select auth.uid())::text = id::text);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING ((select auth.uid())::text = id::text);

CREATE POLICY "Authenticated users can create users"
  ON users FOR INSERT
  WITH CHECK ((select auth.uid())::text = id::text);

-- ============================================
-- 2. travel_plansテーブル
-- ============================================

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Users can view own or member plans" ON travel_plans;
DROP POLICY IF EXISTS "Authenticated users can create plans" ON travel_plans;
DROP POLICY IF EXISTS "Users can update own or member plans" ON travel_plans;
DROP POLICY IF EXISTS "Users can delete own plans" ON travel_plans;

-- 最適化されたポリシーを作成
CREATE POLICY "Users can view own or member plans"
  ON travel_plans FOR SELECT
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM plan_members
      WHERE plan_members.plan_id = travel_plans.id
        AND plan_members.user_id = (select auth.uid())
    )
    OR is_public = true
  );

CREATE POLICY "Authenticated users can create plans"
  ON travel_plans FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Users can update own or member plans"
  ON travel_plans FOR UPDATE
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM plan_members
      WHERE plan_members.plan_id = travel_plans.id
        AND plan_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own plans"
  ON travel_plans FOR DELETE
  USING (created_by = (select auth.uid()));

-- ============================================
-- 3. plan_daysテーブル
-- ============================================

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Users can view plan days of accessible plans" ON plan_days;
DROP POLICY IF EXISTS "Users can manage plan days of accessible plans" ON plan_days;

-- 最適化された統合ポリシーを作成（SELECTとALLを統合）
CREATE POLICY "Users can view plan days of accessible plans"
  ON plan_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = plan_days.plan_id
        AND (
          travel_plans.created_by = (select auth.uid())
          OR EXISTS (
            SELECT 1 FROM plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = (select auth.uid())
          )
          OR travel_plans.is_public = true
        )
    )
  );

CREATE POLICY "Users can modify plan days of accessible plans"
  ON plan_days FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = plan_days.plan_id
        AND (
          travel_plans.created_by = (select auth.uid())
          OR EXISTS (
            SELECT 1 FROM plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = (select auth.uid())
          )
        )
    )
  );

CREATE POLICY "Users can update plan days of accessible plans"
  ON plan_days FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = plan_days.plan_id
        AND (
          travel_plans.created_by = (select auth.uid())
          OR EXISTS (
            SELECT 1 FROM plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = (select auth.uid())
          )
        )
    )
  );

CREATE POLICY "Users can delete plan days of accessible plans"
  ON plan_days FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = plan_days.plan_id
        AND (
          travel_plans.created_by = (select auth.uid())
          OR EXISTS (
            SELECT 1 FROM plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = (select auth.uid())
          )
        )
    )
  );

-- ============================================
-- 4. user_settingsテーブル
-- ============================================

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can create own settings" ON user_settings;

-- 最適化されたポリシーを作成
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own settings"
  ON user_settings FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================
-- 5. spotsテーブル
-- ============================================

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Authenticated users can view spots" ON spots;
DROP POLICY IF EXISTS "Authenticated users can create spots" ON spots;

-- 最適化されたポリシーを作成
CREATE POLICY "Authenticated users can view spots"
  ON spots FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can create spots"
  ON spots FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- ============================================
-- 6. plan_spotsテーブル
-- ============================================

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Users can view plan spots of accessible plans" ON plan_spots;
DROP POLICY IF EXISTS "Users can manage plan spots of accessible plans" ON plan_spots;

-- 最適化された統合ポリシーを作成
CREATE POLICY "Users can view plan spots of accessible plans"
  ON plan_spots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plan_days
      JOIN travel_plans ON travel_plans.id = plan_days.plan_id
      WHERE plan_days.id = plan_spots.plan_day_id
        AND (
          travel_plans.created_by = (select auth.uid())
          OR EXISTS (
            SELECT 1 FROM plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = (select auth.uid())
          )
          OR travel_plans.is_public = true
        )
    )
  );

CREATE POLICY "Users can insert plan spots of accessible plans"
  ON plan_spots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plan_days
      JOIN travel_plans ON travel_plans.id = plan_days.plan_id
      WHERE plan_days.id = plan_spots.plan_day_id
        AND (
          travel_plans.created_by = (select auth.uid())
          OR EXISTS (
            SELECT 1 FROM plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = (select auth.uid())
          )
        )
    )
  );

CREATE POLICY "Users can update plan spots of accessible plans"
  ON plan_spots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM plan_days
      JOIN travel_plans ON travel_plans.id = plan_days.plan_id
      WHERE plan_days.id = plan_spots.plan_day_id
        AND (
          travel_plans.created_by = (select auth.uid())
          OR EXISTS (
            SELECT 1 FROM plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = (select auth.uid())
          )
        )
    )
  );

CREATE POLICY "Users can delete plan spots of accessible plans"
  ON plan_spots FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM plan_days
      JOIN travel_plans ON travel_plans.id = plan_days.plan_id
      WHERE plan_days.id = plan_spots.plan_day_id
        AND (
          travel_plans.created_by = (select auth.uid())
          OR EXISTS (
            SELECT 1 FROM plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = (select auth.uid())
          )
        )
    )
  );

-- ============================================
-- 7. plan_membersテーブル
-- ============================================

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Users can view members of accessible plans" ON plan_members;
DROP POLICY IF EXISTS "Plan creators can add members" ON plan_members;
DROP POLICY IF EXISTS "Plan creators can remove members" ON plan_members;

-- 最適化されたポリシーを作成
CREATE POLICY "Users can view members of accessible plans"
  ON plan_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = plan_members.plan_id
        AND (
          travel_plans.created_by = (select auth.uid())
          OR EXISTS (
            SELECT 1 FROM plan_members pm
            WHERE pm.plan_id = travel_plans.id
              AND pm.user_id = (select auth.uid())
          )
        )
    )
  );

CREATE POLICY "Plan creators can add members"
  ON plan_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = plan_members.plan_id
        AND travel_plans.created_by = (select auth.uid())
    )
  );

CREATE POLICY "Plan creators can remove members"
  ON plan_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = plan_members.plan_id
        AND travel_plans.created_by = (select auth.uid())
    )
  );

-- ============================================
-- 8. plan_sharesテーブル
-- ============================================

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Authenticated users can view active shares" ON plan_shares;
DROP POLICY IF EXISTS "Plan creators can manage shares" ON plan_shares;

-- 最適化された統合ポリシーを作成
CREATE POLICY "Users can view accessible shares"
  ON plan_shares FOR SELECT
  USING (
    (is_active = true AND (expires_at IS NULL OR expires_at > now()))
    OR EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = plan_shares.plan_id
        AND travel_plans.created_by = (select auth.uid())
    )
  );

CREATE POLICY "Plan creators can insert shares"
  ON plan_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = plan_shares.plan_id
        AND travel_plans.created_by = (select auth.uid())
    )
  );

CREATE POLICY "Plan creators can update shares"
  ON plan_shares FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = plan_shares.plan_id
        AND travel_plans.created_by = (select auth.uid())
    )
  );

CREATE POLICY "Plan creators can delete shares"
  ON plan_shares FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = plan_shares.plan_id
        AND travel_plans.created_by = (select auth.uid())
    )
  );

-- ============================================
-- 9. line_groupsテーブル
-- ============================================

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Authenticated users can view line groups" ON line_groups;
DROP POLICY IF EXISTS "Authenticated users can create line groups" ON line_groups;

-- 最適化されたポリシーを作成
CREATE POLICY "Authenticated users can view line groups"
  ON line_groups FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can create line groups"
  ON line_groups FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);
