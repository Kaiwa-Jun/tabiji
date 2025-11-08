# 環境変数セットアップガイド

## 概要

tabijiプロジェクトでは、ローカル開発環境と本番環境で異なるデータベースを使用するため、環境変数を適切に管理する必要があります。

**重要**: tabijiプロジェクトでは、他のSupabaseプロジェクト（ses-kanriなど）との**ポート競合を回避**するため、独自のポート番号（543xx系）を使用しています。

## ファイル構成

```
tabiji/
├── .env.local              # ローカル開発環境用（ローカルSupabase）
├── .env.production.local   # 本番環境用（本番Supabase） - Gitには含めない
└── .env.example            # 環境変数のテンプレート
```

## 1. ローカル開発環境の設定

### 前提条件

- Supabase CLIがインストール済み
- `npm run dev:liff`でngrokを使用してHTTPS化している

### 手順

#### 1-1. ローカルSupabaseを起動

```bash
supabase start
```

#### 1-2. マイグレーションを適用

```bash
supabase db push --local
```

#### 1-3. `.env.local`の設定

`.env.local`はローカルSupabase用に設定されています：

```bash
# ローカルSupabase URL（tabijiプロジェクト専用ポート: 54331）
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54331

# ローカルSupabase 匿名キー（デフォルト値）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# ローカルSupabase サービスロールキー（デフォルト値）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

**重要なポイント**:

- tabijiプロジェクトは**ポート54331**を使用（ses-kanriは54321）
- 匿名キー・サービスロールキーは**Supabaseのローカル開発用デフォルトキー**で、すべてのローカルプロジェクトで共通の値です

#### 1-4. 開発サーバーを起動

```bash
# ターミナル1: Next.js開発サーバー
npm run dev

# ターミナル2: LIFF開発環境（ngrok）
npm run dev:liff
```

#### 1-5. 動作確認

スマホのLINEアプリから、ngrokが生成したHTTPS URLにアクセスして動作確認します。

## 2. 本番環境の設定

### 2-1. `.env.production.local`の確認

本番環境の設定は`.env.production.local`に保存されています：

```bash
# 本番Supabase URL
NEXT_PUBLIC_SUPABASE_URL=https://tdzaynklebpgqskleyqy.supabase.co

# 本番Supabase 匿名キー
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 本番Supabase サービスロールキー
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**注意：** このファイルは`.gitignore`に含まれており、Gitリポジトリにはコミットされません。

### 2-2. Vercelの環境変数設定

Vercelにデプロイする場合は、Vercel Dashboardで直接環境変数を設定します：

1. Vercel Dashboard > Project > Settings > Environment Variables
2. 以下の環境変数を追加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`
   - `NEXT_PUBLIC_LIFF_ID`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## 3. 環境の切り替え

### ローカル → 本番

本番環境でテストする場合：

```bash
# .env.localの内容を一時的に.env.local.backupに退避
mv .env.local .env.local.backup

# .env.production.localを.env.localとしてコピー
cp .env.production.local .env.local

# 開発サーバー再起動
npm run dev
npm run dev:liff
```

### 本番 → ローカル

```bash
# バックアップを復元
mv .env.local.backup .env.local

# 開発サーバー再起動
npm run dev
npm run dev:liff
```

## 4. トラブルシューティング

### ローカルSupabaseに接続できない

```bash
# Supabaseの状態を確認
supabase status

# 停止している場合は再起動
supabase start

# ポート番号を確認（tabijiは54331を使用）
# API URL: http://127.0.0.1:54331 であることを確認
```

### マイグレーションが適用されていない

```bash
# マイグレーションを再適用
supabase db push --local

# または、データベースをリセットして再適用
supabase db reset
```

### 認証エラーが発生する

- `.env.local`のキーが正しいか確認
- `.env.local`のURLが`http://127.0.0.1:54331`（tabijiプロジェクト専用ポート）であることを確認
- ローカルSupabaseが起動しているか確認
- `supabase status`でAPIエンドポイントが`http://127.0.0.1:54331`であることを確認

## 5. セキュリティ上の注意

✅ **安全（コミット可能）:**

- `.env.local` - ローカル開発用のデフォルトキー
- `.env.example` - テンプレートファイル

❌ **危険（コミット禁止）:**

- `.env.production.local` - 本番環境の秘密鍵が含まれる
- 本番環境の`SUPABASE_SERVICE_ROLE_KEY` - 絶対に公開しない

## 6. よくある質問

### Q: なぜローカルと本番で環境変数を分けるのか？

A: ローカル開発でテストデータを本番データベースに保存しないため、また本番環境のデータを誤って削除しないためです。

### Q: ローカルSupabaseのデータは永続化されるか？

A: はい。`supabase start`で起動したデータはDockerボリュームに保存され、停止しても保持されます。完全に削除する場合は`supabase db reset`を実行します。

### Q: チームメンバーとキーを共有するには？

A: ローカル開発キーは共通のデフォルト値なので共有不要です。本番環境のキーはVercel Dashboardで管理し、`.env.production.local`は各自で作成します。

## 7. 複数プロジェクトでの運用

### 他のSupabaseプロジェクト（ses-kanriなど）との共存

tabijiとses-kanriを同時に起動する場合、以下のポート設定になります:

| サービス       | ses-kanri | tabiji |
| -------------- | --------- | ------ |
| API            | 54321     | 54331  |
| DB             | 54322     | 54332  |
| Studio         | 54323     | 54333  |
| Inbucket       | 54324     | 54334  |
| Analytics      | 54327     | 54337  |
| Pooler         | 54329     | 54339  |
| Edge Inspector | 8083      | 8093   |

### 同時起動の手順

```bash
# 1. ses-kanriを起動
cd /path/to/ses-kanri
supabase start

# 2. tabijiを起動（別ターミナル）
cd /path/to/tabiji
supabase start

# 3. 両方の状態を確認
# ses-kanriのターミナル
supabase status
# → API URL: http://127.0.0.1:54321

# tabijiのターミナル
supabase status
# → API URL: http://127.0.0.1:54331
```

### ポート番号の規則

- ses-kanri: **543xx** 系（標準）
- tabiji: **543xx** 系（+10オフセット）
- 将来の新プロジェクト: 必要に応じて **544xx** 系などを使用

## 8. 参考リンク

- [Supabase CLI ドキュメント](https://supabase.com/docs/guides/cli)
- [Next.js 環境変数ドキュメント](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel 環境変数設定](https://vercel.com/docs/projects/environment-variables)
