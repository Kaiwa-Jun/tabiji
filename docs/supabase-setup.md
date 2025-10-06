# Supabase セットアップガイド

このドキュメントでは、tabijiアプリケーションのSupabase環境をセットアップする手順を説明します。

## 📋 前提条件

- [x] Node.js 18以上がインストールされていること
- [x] Supabase CLIがインストールされていること（v2.48.3以上推奨）
- [ ] [Supabase](https://supabase.com)のアカウントを持っていること

## 🚀 セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスし、サインインします
2. 「New Project」をクリック
3. 以下の情報を入力します：
   - **Name**: `tabiji`（または任意の名前）
   - **Database Password**: 安全なパスワードを設定（**必ずメモしてください**）
   - **Region**: `Northeast Asia (Tokyo)`（推奨）
4. 「Create new project」をクリック

プロジェクトの作成には数分かかります。

### 2. 環境変数の取得

プロジェクトが作成されたら、以下の手順で必要な情報を取得します：

1. Supabase Dashboardで、作成したプロジェクトを開きます
2. 左サイドバーから「Settings」>「API」を選択
3. 以下の値をメモします：
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** (`SUPABASE_SERVICE_ROLE_KEY`) ⚠️ **機密情報**

### 3. ローカル環境設定ファイルの作成

プロジェクトルートで以下のコマンドを実行し、`.env.local`ファイルを作成します：

```bash
cp .env.example .env.local
```

`.env.local`ファイルを開き、取得した値を設定します：

```env
# Supabase（フェーズ1で設定）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 以下はフェーズ2以降で設定
# LINE Developers（フェーズ2で設定）
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=
LIFF_ID=

# Google Maps API（フェーズ4で設定）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

⚠️ **重要**: `SUPABASE_SERVICE_ROLE_KEY`は絶対に公開しないでください。このキーはサーバーサイドでのみ使用します。

### 4. リモートプロジェクトとのリンク

Supabase Dashboardから **Project Reference ID** を取得します：

1. 「Settings」>「General」を選択
2. 「Reference ID」をコピー

以下のコマンドでローカルプロジェクトとリモートをリンクします：

```bash
supabase link --project-ref <your-project-ref>
```

データベースパスワードの入力を求められたら、手順1で設定したパスワードを入力します。

### 5. データベーススキーマのデプロイ

作成したマイグレーションファイルをリモートデータベースに適用します：

```bash
supabase db push
```

このコマンドにより、以下のテーブルとRLSポリシーが作成されます：

- ✅ `users` - ユーザー情報
- ✅ `line_groups` - LINEグループ情報
- ✅ `travel_plans` - 旅行プラン
- ✅ `plan_days` - 日別旅程
- ✅ `spots` - スポット情報（キャッシュ）
- ✅ `plan_spots` - プランスポット
- ✅ `plan_members` - プランメンバー
- ✅ `user_settings` - ユーザー設定
- ✅ `plan_shares` - プラン共有設定

### 6. セットアップの確認

以下のコマンドでセットアップが正しく完了したことを確認します：

```bash
supabase status
```

正常に動作していれば、以下のような出力が表示されます：

```
supabase local development setup is running.

         API URL: https://your-project-ref.supabase.co
          DB URL: postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
      Studio URL: https://supabase.com/dashboard/project/your-project-ref
    Inbucket URL: http://localhost:54324
        anon key: eyJ...
service_role key: eyJ...
```

## 🎯 次のステップ

✅ Supabaseのセットアップが完了しました!

次は以下のいずれかを進めてください：

- **Issue #16**: Supabase MCP セットアップ（オプション）
- **フェーズ2**: LINE Developers セットアップ
  - LINE Bot チャネルの作成
  - LIFF アプリの設定

## 📚 参考資料

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase CLI公式ドキュメント](https://supabase.com/docs/guides/cli)
- [Supabase Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [tabijiデータベース設計書](./database-schema.md)

## ⚠️ トラブルシューティング

### マイグレーションの適用に失敗する場合

```bash
# ローカルデータベースをリセット
supabase db reset

# 再度マイグレーションを適用
supabase db push
```

### 環境変数が読み込まれない場合

1. `.env.local`ファイルがプロジェクトルートに存在することを確認
2. Next.jsの開発サーバーを再起動
   ```bash
   npm run dev
   ```

### データベース接続エラーの場合

1. Project Reference IDが正しいか確認
2. データベースパスワードが正しいか確認
3. ネットワーク接続を確認

## 🔐 セキュリティ注意事項

- ✅ `.env.local`ファイルは`.gitignore`に含まれており、Gitにコミットされません
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY`は絶対に公開しないでください
- ⚠️ データベースパスワードは安全に管理してください
- ✅ RLS (Row Level Security) が全てのテーブルで有効化されています

---

**作成日**: 2025-10-05
**最終更新**: 2025-10-05
