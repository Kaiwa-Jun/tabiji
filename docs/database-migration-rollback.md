# データベースマイグレーションのロールバック手順

## 概要

このドキュメントは、RLSポリシー最適化およびDB関数修正のマイグレーション（issue#17関連）に問題が発生した場合のロールバック手順を説明します。

## 対象マイグレーション

- `20251006000001_optimize_rls_performance.sql` - RLSポリシーの最適化
- `20251006000002_fix_function_search_path.sql` - update_updated_at_column関数の修正
- `20251006000003_add_composite_indexes.sql` - 複合インデックスの追加

## ロールバックが必要なケース

以下のいずれかの症状が発生した場合、ロールバックを検討してください：

1. **パフォーマンス低下**
   - クエリの実行時間が大幅に増加
   - データベース接続タイムアウトの頻発
   - CPU使用率の異常な上昇

2. **セキュリティ問題**
   - 本来アクセスできないデータへのアクセスが可能になる
   - RLSポリシーが正しく機能していない

3. **アプリケーションエラー**
   - データの作成・更新・削除が失敗する
   - `updated_at`カラムが更新されない

## ロールバック手順

### ステップ1: 問題の確認と影響範囲の特定

```bash
# Supabase Advisorで現在の警告を確認
# （Supabase MCPまたはダッシュボードを使用）

# 実行中のクエリを確認
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC;
```

### ステップ2: ロールバックの実行

#### 方法A: Supabase CLIを使用（推奨）

```bash
# ローカル環境でのロールバック
supabase db reset

# リモート環境でのロールバック（慎重に実行）
# 注意: この操作は全データを削除します
# 本番環境では使用しないでください
```

#### 方法B: 手動でマイグレーションを元に戻す

```sql
-- ============================================
-- 1. 複合インデックスを削除
-- ============================================

DROP INDEX IF EXISTS idx_plan_members_plan_user;
DROP INDEX IF EXISTS idx_plan_members_user_plan;
DROP INDEX IF EXISTS idx_plans_public;

-- ============================================
-- 2. update_updated_at_column関数を元に戻す
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- ============================================
-- 3. RLSポリシーを元の状態に戻す
-- ============================================

-- 注意: 以下のスクリプトは、最適化前の状態に戻します
-- 各テーブルごとに既存ポリシーを削除し、元のポリシーを再作成

-- ========== users テーブル ==========
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can create users" ON users;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

CREATE POLICY "Authenticated users can create users"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- ========== travel_plans テーブル ==========
DROP POLICY IF EXISTS "Users can view own or member plans" ON travel_plans;
DROP POLICY IF EXISTS "Authenticated users can create plans" ON travel_plans;
DROP POLICY IF EXISTS "Users can update own or member plans" ON travel_plans;
DROP POLICY IF EXISTS "Users can delete own plans" ON travel_plans;

CREATE POLICY "Users can view own or member plans"
  ON travel_plans FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM plan_members
      WHERE plan_members.plan_id = travel_plans.id
        AND plan_members.user_id = auth.uid()
    )
    OR is_public = true
  );

CREATE POLICY "Authenticated users can create plans"
  ON travel_plans FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own or member plans"
  ON travel_plans FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM plan_members
      WHERE plan_members.plan_id = travel_plans.id
        AND plan_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own plans"
  ON travel_plans FOR DELETE
  USING (created_by = auth.uid());

-- ========== plan_days テーブル ==========
DROP POLICY IF EXISTS "Users can view plan days of accessible plans" ON plan_days;
DROP POLICY IF EXISTS "Users can modify plan days of accessible plans" ON plan_days;
DROP POLICY IF EXISTS "Users can update plan days of accessible plans" ON plan_days;
DROP POLICY IF EXISTS "Users can delete plan days of accessible plans" ON plan_days;

CREATE POLICY "Users can view plan days of accessible plans"
  ON plan_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = plan_days.plan_id
        AND (
          travel_plans.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = auth.uid()
          )
          OR travel_plans.is_public = true
        )
    )
  );

CREATE POLICY "Users can manage plan days of accessible plans"
  ON plan_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = plan_days.plan_id
        AND (
          travel_plans.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM plan_members
            WHERE plan_members.plan_id = travel_plans.id
              AND plan_members.user_id = auth.uid()
          )
        )
    )
  );

-- ========== その他のテーブル ==========
-- 同様の手順で、spots, plan_spots, plan_members, user_settings, plan_shares, line_groups のポリシーを元に戻す
-- 詳細は supabase/migrations/20251005000010_enable_rls.sql を参照
```

### ステップ3: ロールバック後の検証

```sql
-- RLSポリシーの確認
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- インデックスの確認
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname NOT LIKE '%_pkey'
ORDER BY tablename;

-- 関数の確認
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'update_updated_at_column';
```

### ステップ4: アプリケーションの動作確認

```bash
# テストスイートを実行
npm run test

# ビルドの確認
npm run build

# 開発サーバーで動作確認
npm run dev
```

## ロールバック後の復旧手順

問題が解決したら、以下の手順で最適化を再適用できます：

```bash
# マイグレーションを再実行
supabase db push

# または個別に適用
supabase migration up --include-all
```

## 予防策

今後のマイグレーションでは、以下の対策を推奨します：

1. **段階的なデプロイ**
   - 開発環境 → ステージング環境 → 本番環境の順に適用
   - 各環境で十分な検証期間を設ける

2. **バックアップの取得**
   - マイグレーション実行前に必ずデータベースバックアップを取得
   - Supabaseダッシュボードまたは`pg_dump`を使用

3. **モニタリング**
   - マイグレーション後24時間は、パフォーマンスメトリクスを監視
   - Supabase Advisorで警告を定期的に確認

4. **カナリアデプロイ**
   - 一部のユーザーのみに適用し、問題がないことを確認してから全体に展開

## トラブルシューティング

### 問題: ロールバック中にエラーが発生する

**解決策:**

1. エラーメッセージを記録
2. Supabaseサポートに問い合わせ
3. 必要に応じてデータベースを以前のバックアップから復元

### 問題: ロールバック後もパフォーマンスが改善しない

**解決策:**

1. クエリキャッシュをクリア
2. データベース接続をリセット
3. Supabase Advisorで他の問題がないか確認

## 連絡先

問題が解決しない場合は、以下に連絡してください：

- GitHub Issue: https://github.com/Kaiwa-Jun/tabiji/issues
- Supabase サポート: https://supabase.com/dashboard/support

## 参考資料

- [Supabase Database Migrations](https://supabase.com/docs/guides/database/migrations)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
