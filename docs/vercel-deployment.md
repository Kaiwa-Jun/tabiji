# Vercel デプロイガイド

このドキュメントでは、tabijiアプリケーションをVercelにデプロイする手順を説明します。

## 📋 目次

- [概要](#概要)
- [前提条件](#前提条件)
- [環境変数設定](#環境変数設定)
- [デプロイ手順](#デプロイ手順)
- [LINE Webhook設定](#line-webhook設定)
- [LIFF設定](#liff設定)
- [動作確認](#動作確認)
- [トラブルシューティング](#トラブルシューティング)

---

## 概要

### アーキテクチャ

```
[ユーザー（LINE App）]
        ↓
[LINE Platform]
        ↓
[Vercel（Next.js）]
   ├── Webhook API (/api/webhook)
   ├── LIFF App (/liff/*)
   └── Server Actions
        ↓
[Supabase]
   ├── Database（PostgreSQL）
   ├── Auth
   └── Storage
```

### デプロイ設定

- **ホスティング**: Vercel
- **リージョン**: hnd1（東京）
- **フレームワーク**: Next.js 15 (App Router)
- **自動デプロイ**: develop/mainブランチへのマージで自動実行

---

## 前提条件

以下が完了していることを確認してください：

- [ ] Vercelアカウント作成済み
- [ ] GitHubリポジトリとVercelが連携済み
- [ ] Supabaseプロジェクト作成済み（[supabase-setup.md](./supabase-setup.md)参照）
- [ ] LINE Developersアカウント作成済み（[line-setup.md](./line-setup.md)参照）
- [ ] ローカルで`.env.local`が設定済み

---

## 環境変数設定

Vercel Web UIで以下の環境変数を設定します。

### 設定手順

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. **Settings** → **Environment Variables**
4. 各環境変数を追加

### 必須環境変数一覧

#### Supabase関連

| 環境変数名                      | 説明                       | 取得方法                                                       | 公開/秘密 |
| ------------------------------- | -------------------------- | -------------------------------------------------------------- | --------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | SupabaseプロジェクトURL    | Supabase Dashboard > Project Settings > API > Project URL      | 公開      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー           | Supabase Dashboard > Project Settings > API > anon/public key  | 公開      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabaseサービスロールキー | Supabase Dashboard > Project Settings > API > service_role key | **秘密**  |

#### LINE関連

| 環境変数名                  | 説明                           | 取得方法                                                                    | 公開/秘密 |
| --------------------------- | ------------------------------ | --------------------------------------------------------------------------- | --------- |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINEチャンネルアクセストークン | LINE Developers Console > Messaging API > Channel access token (long-lived) | **秘密**  |
| `LINE_CHANNEL_SECRET`       | LINEチャンネルシークレット     | LINE Developers Console > Basic settings > Channel secret                   | **秘密**  |
| `NEXT_PUBLIC_LIFF_ID`       | LIFF ID                        | LINE Developers Console > LIFF > LIFF ID                                    | 公開      |

#### Google Maps関連（フェーズ4以降）

| 環境変数名                        | 説明                | 取得方法                                             | 公開/秘密 |
| --------------------------------- | ------------------- | ---------------------------------------------------- | --------- |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps APIキー | Google Cloud Console > APIs & Services > Credentials | 公開      |

### 環境の選択

各環境変数を追加する際、以下すべてにチェックを入れてください：

- ✅ **Production** - 本番環境（mainブランチ）
- ✅ **Preview** - プレビュー環境（PRごとに生成）
- ✅ **Development** - ローカル開発環境（Vercel CLI使用時）

### 注意事項

**重要**:

- 秘密鍵（`*_SECRET`, `*_KEY`）は絶対に公開しないでください
- `NEXT_PUBLIC_`プレフィックスは、クライアント側（ブラウザ）で必要な環境変数にのみ使用
- 秘密鍵には`NEXT_PUBLIC_`を付けない

---

## デプロイ手順

### 初回デプロイ

Vercelプロジェクトは既に設定済みのため、以下のいずれかの方法でデプロイされます。

#### 方法1: developブランチへのマージ（推奨）

```bash
# feature ブランチで作業
git checkout -b feature/xxx
# ... 実装 ...
git add .
git commit -m "実装内容"
git push origin feature/xxx

# develop ブランチにマージ
git checkout develop
git merge feature/xxx
git push origin develop
```

Vercelが自動的にビルド・デプロイを開始します。

#### 方法2: Pull Requestマージ

1. GitHubでPRを作成
2. PRをdevelopブランチにマージ
3. Vercelが自動デプロイ

### デプロイ状況の確認

1. [Vercel Dashboard](https://vercel.com/dashboard) → **Deployments**
2. 最新のデプロイを選択
3. ビルドログを確認

**成功メッセージ例**:

```
✓ Building...
✓ Build completed in 2m 34s
✓ Deployed to production
```

4. Production URLを確認
   - 例: `https://tabiji.vercel.app`

### デプロイ後のURL

デプロイ完了後、以下のURLが確定します：

- **Production URL**: `https://tabiji.vercel.app`
- **Webhook URL**: `https://tabiji.vercel.app/api/webhook`
- **LIFF App URL**: `https://tabiji.vercel.app/liff/plans`

---

## LINE Webhook設定

デプロイ完了後、LINE Developers ConsoleでWebhook URLを設定します。

### 手順

1. [LINE Developers Console](https://developers.line.biz/)にログイン
2. tabijiのMessaging APIチャンネルを選択
3. **Messaging API設定**タブをクリック
4. **Webhook設定**セクションで以下を設定：
   - **Webhook URL**: `https://tabiji.vercel.app/api/webhook`
   - **Webhookの利用**: **ON**に設定

5. **検証**ボタンをクリック
6. ✅ 「成功しました」メッセージが表示されることを確認

### Webhook検証が成功した場合

```
✓ 成功しました
Webhookへの接続が確認されました
```

### Webhook検証が失敗した場合

エラーメッセージが表示された場合は、[トラブルシューティング](#webhook検証エラー)を参照してください。

---

## LIFF設定

デプロイ完了後、LIFF Endpoint URLを更新します。

### 手順

1. [LINE Developers Console](https://developers.line.biz/)にログイン
2. tabijiのLIFFアプリを選択
3. **LIFF**タブをクリック
4. LIFFアプリを選択（または新規作成）
5. 以下を設定：
   - **Endpoint URL**: `https://tabiji.vercel.app/liff/plans`
   - **Scope**: `profile`, `openid`
   - **Bot link feature**: **On (Normal)**

6. **保存**をクリック

---

## 動作確認

デプロイ完了後、以下の手順で動作確認を行います。

### 1. Webhook動作確認

#### テスト1: フォローイベント

1. スマートフォンでLINEアプリを開く
2. tabijiのBotを友だち追加（未追加の場合）
3. ✅ ウェルカムメッセージが表示されることを確認

**期待される動作**:

```
ようこそtabijiへ！🎉
友だち追加ありがとうございます。
```

#### テスト2: メッセージイベント

1. Botにテキストメッセージを送信（例: 「こんにちは」）
2. ✅ エコーバックメッセージが返ってくることを確認

**期待される動作**:

```
あなた: こんにちは
Bot: こんにちは
```

### 2. Vercelログ確認

1. [Vercel Dashboard](https://vercel.com/dashboard) → **Deployments**
2. 最新のデプロイを選択
3. **Functions**タブ → `/api/webhook`を選択
4. ログを確認

**正常なログ例**:

```
Received 1 webhook event(s)
Processing event: { type: 'message', timestamp: 1234567890 }
```

### 3. LINE Developers Console確認

1. LINE Developers Console → Messaging API設定
2. **Webhook送信統計**セクションを確認
3. ✅ 成功率が100%であることを確認

---

## トラブルシューティング

### ビルドエラー

#### 症状

Vercelのビルドが失敗する

#### 原因と対処法

**1. 型エラー**

```bash
# ローカルで型チェック
npm run type-check
```

エラーを修正してから再デプロイ

**2. 環境変数未設定**

- Vercel Web UIで環境変数が正しく設定されているか確認
- 特に`NEXT_PUBLIC_`プレフィックスに注意

**3. ビルドコマンドエラー**

```bash
# ローカルでビルドテスト
npm run build
```

---

### Webhook検証エラー

#### 症状

LINE Developers ConsoleでWebhook検証が失敗する

#### エラーメッセージと対処法

**エラー1: 「接続できませんでした」**

```
✗ 接続できませんでした
指定したURLにアクセスできません
```

**原因**:

- デプロイが完了していない
- URLが間違っている

**対処法**:

1. Vercel Dashboardでデプロイが完了しているか確認
2. Webhook URLが正しいか確認: `https://tabiji.vercel.app/api/webhook`
3. ブラウザで直接アクセスして確認（405エラーならOK）

**エラー2: 「署名検証に失敗しました」**

```
✗ 署名検証に失敗しました
```

**原因**:

- `LINE_CHANNEL_SECRET`が間違っている
- 環境変数が設定されていない

**対処法**:

1. Vercel Web UIで`LINE_CHANNEL_SECRET`を確認
2. LINE Developers Consoleで正しいChannel Secretを取得
3. 環境変数を更新して再デプロイ

---

### LIFF起動エラー

#### 症状

LIFFアプリが起動しない、または白い画面が表示される

#### 原因と対処法

**1. LIFF ID未設定**

- Vercel Web UIで`NEXT_PUBLIC_LIFF_ID`が設定されているか確認
- `NEXT_PUBLIC_`プレフィックスが付いているか確認

**2. Endpoint URL間違い**

- LINE Developers ConsoleでEndpoint URLが正しいか確認: `https://tabiji.vercel.app/liff/plans`

**3. CORS エラー**

- LIFF設定で正しいドメインが登録されているか確認

---

### 環境変数が反映されない

#### 症状

環境変数を追加・更新したが、反映されない

#### 対処法

1. Vercel Web UIで環境変数が正しく設定されているか確認
2. **Redeploy**ボタンをクリックして再デプロイ
3. キャッシュをクリア: Vercel Dashboard → Settings → Advanced → Clear Build Cache

---

### ログの確認方法

#### Vercelログ

1. [Vercel Dashboard](https://vercel.com/dashboard)
2. **Deployments** → 最新のデプロイ
3. **Functions** → 関数を選択
4. ログを確認

#### LINE Webhookログ

1. [LINE Developers Console](https://developers.line.biz/)
2. Messaging API設定
3. **Webhook送信統計**セクション
4. 成功率とエラー内容を確認

---

## ロールバック

デプロイに問題がある場合、以前の成功したデプロイにロールバックできます。

### 手順

1. [Vercel Dashboard](https://vercel.com/dashboard) → **Deployments**
2. 以前の成功したデプロイを選択
3. **⋮** メニュー → **Promote to Production**
4. 確認して実行

---

## カスタムドメイン設定（オプション）

独自ドメインを使用する場合の手順です。

### 手順

1. Vercel Dashboard → プロジェクト → **Settings** → **Domains**
2. **Add Domain**をクリック
3. ドメイン名を入力（例: `tabiji.com`）
4. DNS設定を更新（Vercelの指示に従う）
5. SSL証明書が自動発行されるまで待つ（数分〜数時間）
6. LINE Developers ConsoleでWebhook URL/LIFF URLを更新

---

## プレビュー環境

Vercelは、ブランチごとに**プレビューURL**を自動生成します。

### プレビューURLの例

- `develop`ブランチ: `https://tabiji-git-develop.vercel.app`
- `feature/xxx`ブランチ: `https://tabiji-git-feature-xxx.vercel.app`

### 開発フロー

1. feature ブランチで開発
2. PRを作成すると自動的にプレビュー環境が生成
3. プレビューURLでテスト
4. 問題なければdevelopにマージ
5. developで最終確認
6. mainにマージして本番リリース

### LINE Webhook設定（プレビュー環境用）

開発中にプレビュー環境でLINE Botをテストする場合：

1. LINE Developers Consoleで開発用のチャンネルを作成（推奨）
2. プレビューURLでWebhook URLを設定
3. テスト完了後、本番チャンネルに戻す

---

## セキュリティベストプラクティス

### 環境変数管理

- ✅ 秘密鍵（`*_SECRET`, `*_KEY`）はGitにコミットしない
- ✅ `.env.local`は`.gitignore`に追加済み
- ✅ `.env.example`にはダミー値またはコメントのみ記載
- ✅ 実際の値はVercel Web UIで設定

### NEXT*PUBLIC*プレフィックス

- ✅ クライアント側で必要な変数のみ`NEXT_PUBLIC_`を使用
- ❌ 秘密鍵に`NEXT_PUBLIC_`を付けない
- ✅ LIFF ID、Google Maps API Keyは公開OK

### Webhook署名検証

- ✅ すべてのWebhookリクエストで署名検証を実施（実装済み）
- ✅ 署名検証失敗時は401エラーを返す（実装済み）

---

## 参考リンク

### Vercel

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables - Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

### LINE

- [LINE Messaging API](https://developers.line.biz/ja/docs/messaging-api/)
- [Webhook設定](https://developers.line.biz/ja/docs/messaging-api/building-bot/#set-webhook-url)
- [LIFF Documentation](https://developers.line.biz/ja/docs/liff/)

### プロジェクトドキュメント

- [Supabaseセットアップ](./supabase-setup.md)
- [LINE設定](./line-setup.md)
- [LIFF統合ガイド](./liff-integration-guide.md)

---

## チェックリスト

デプロイ完了後、以下を確認してください：

### Vercel設定

- [ ] 環境変数が全て設定されている（8個）
- [ ] Production, Preview, Developmentすべてにチェック
- [ ] デプロイが成功している
- [ ] Production URLにアクセスできる

### LINE設定

- [ ] Webhook URL設定完了
- [ ] Webhook検証が成功
- [ ] Webhookの利用がON
- [ ] LIFF Endpoint URL設定完了

### 動作確認

- [ ] Bot友だち追加→ウェルカムメッセージ表示
- [ ] テキストメッセージ→エコーバック確認
- [ ] Vercelログでエラーなし
- [ ] LINE Webhook送信統計で成功率100%

---

## 次のステップ

Issue #27完了後：

- **Issue #28**: プラン作成UI骨格（フェーズ3開始）
- 日程入力フォーム実装
- LIFFでのユーザー体験構築

おめでとうございます！🎉
**フェーズ2: LINE認証・Bot基盤**がすべて完了しました。
