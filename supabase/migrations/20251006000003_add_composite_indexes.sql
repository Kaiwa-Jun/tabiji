-- 複合インデックスの追加
-- RLSポリシーのサブクエリパフォーマンスを最適化するための複合インデックス

-- ============================================
-- 1. plan_members テーブル
-- ============================================

-- プランメンバー検索の最適化
-- EXISTS (SELECT 1 FROM plan_members WHERE plan_id = ? AND user_id = ?)
-- このクエリは頻繁に実行されるため、複合インデックスで大幅に高速化
CREATE INDEX IF NOT EXISTS idx_plan_members_plan_user
  ON plan_members(plan_id, user_id);

COMMENT ON INDEX idx_plan_members_plan_user IS
  'プラン参加チェック用の複合インデックス。RLSポリシーのサブクエリを高速化';

-- ユーザーの参加プラン一覧取得の最適化
CREATE INDEX IF NOT EXISTS idx_plan_members_user_plan
  ON plan_members(user_id, plan_id);

COMMENT ON INDEX idx_plan_members_user_plan IS
  'ユーザーの参加プラン一覧取得を高速化';

-- ============================================
-- 2. plan_days テーブル
-- ============================================

-- プランIDと日付での検索最適化（既存のUNIQUE制約で対応済み）
-- 追加のインデックスは不要

-- ============================================
-- 3. plan_spots テーブル
-- ============================================

-- 日程IDと順序での検索最適化（既存のUNIQUE制約で対応済み）
-- 追加のインデックスは不要

-- ============================================
-- 4. travel_plans テーブル
-- ============================================

-- 公開プランの検索最適化
CREATE INDEX IF NOT EXISTS idx_plans_public
  ON travel_plans(is_public, start_date)
  WHERE is_public = true;

COMMENT ON INDEX idx_plans_public IS
  '公開プランの検索を高速化。日付範囲検索にも対応';

-- ============================================
-- 5. plan_shares テーブル
-- ============================================

-- アクティブな共有の検索最適化（既存のidx_plan_shares_activeで対応済み）
-- 追加のインデックスは不要

-- ============================================
-- 既存インデックスの分析
-- ============================================

-- 以下のインデックスは既に存在し、適切に機能している：
-- - unique_plan_member (plan_id, user_id) - UNIQUE制約として機能
-- - unique_plan_day_number (plan_id, day_number)
-- - unique_plan_date (plan_id, date)
-- - unique_plan_day_order (plan_day_id, order_index)

-- これらのUNIQUE制約は、検索インデックスとしても機能するため、
-- 追加の複合インデックスは不要
