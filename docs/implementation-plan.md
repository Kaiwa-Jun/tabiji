# tabiji - 実装計画書

## 概要

このドキュメントは、tabijiプロジェクトの機能実装順序を定義します。
依存関係を考慮し、段階的に機能を構築していくことで、安定した開発を実現します。

**GitHub Issue作成時のラベル付けについて**:

- `[Backend]` 表記: backendラベルを付与
- `[Frontend]` 表記: frontendラベルを付与
- `[Infrastructure]` 表記: infrastructureラベルを付与

## 実装の基本方針

### 優先順位の考え方

1. **基盤となるインフラを最小限で準備**
2. **データモデルと基本的なCRUD操作を構築**
3. **コア機能（プラン作成フロー）を段階的に実装**
4. **ユーザー体験を向上させる機能を追加**
5. **将来機能は MVP リリース後に実装**

### 技術的な方針

- Server Component優先でデータ取得
- Server Actionsでデータ更新
- useEffect使用禁止（リアルタイム機能のみ例外）
- 型安全性の徹底（TypeScript strict モード）
- テストファーストではなく、重要機能に絞ってテスト追加
- 外部サービスは必要になったタイミングで準備

---

## フェーズ0：最小限の環境構築

**目的**: ローカル開発環境の準備

**期間**: 1-2日

### 完了済み項目

- [x] Next.js プロジェクトのセットアップ
- [x] TypeScript / ESLint / Prettier 設定
- [x] Tailwind CSS 導入
- [x] shadcn/ui セットアップ
- [x] Git リポジトリ作成・ブランチ戦略の確立
- [x] 基本的なディレクトリ構成の作成
- [x] 環境変数ファイルのテンプレート作成（.env.example）

**完了条件**:

- ローカル環境でNext.jsが起動できる
- 基本的なディレクトリ構成ができている

---

## フェーズ1：データベース構築

**目的**: Supabaseセットアップとテーブル作成

**期間**: 2-3日

**開発ツール**: Supabase CLI + Supabase MCP（オプション）

### [Infrastructure] 1-1. Supabase CLI セットアップ

**タスク**:

- [ ] Supabase CLI インストール
  ```bash
  npm install -g supabase
  ```
- [ ] Supabaseアカウント作成・プロジェクト作成（Web UI）
- [ ] ローカルプロジェクト初期化
  ```bash
  supabase init
  ```
- [ ] リモートプロジェクトとリンク
  ```bash
  supabase link --project-ref <project-ref>
  ```
- [ ] 環境変数の設定（.env.local）
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

**ドキュメント**: https://supabase.com/docs/guides/cli

### [Infrastructure] 1-2. Supabase MCP セットアップ（オプション）

**タスク**:

- [ ] Supabase MCP を .mcp.json に追加（Claude Codeからの操作を可能にする）
  ```json
  {
    "mcpServers": {
      "supabase": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-supabase"]
      }
    }
  }
  ```
- [ ] Claude Code再起動

**メリット**: Claude CodeからSupabaseを直接操作可能（テーブル作成、クエリ実行など）

**注意**: Supabase MCPはオプションです。Supabase CLIのみでも開発可能です。

### [Backend] 1-3. データベースマイグレーション作成

**タスク**:

- [ ] マイグレーションファイル作成
  ```bash
  supabase migration new create_initial_tables
  ```
- [ ] SQLファイル編集（`supabase/migrations/` 配下）
  - [ ] users テーブル
  - [ ] travel_plans テーブル
  - [ ] plan_days テーブル
  - [ ] spots テーブル
  - [ ] plan_spots テーブル
  - [ ] plan_members テーブル
  - [ ] line_groups テーブル
- [ ] インデックス定義
- [ ] RLS（Row Level Security）ポリシー定義

**参考**: `docs/database-schema.md`

**関連ファイル**:

- `supabase/migrations/YYYYMMDDHHMMSS_create_initial_tables.sql`

### [Backend] 1-4. マイグレーション実行

**タスク**:

- [ ] ローカルDBでマイグレーション実行（テスト）
  ```bash
  supabase db reset
  ```
- [ ] リモートDBへマイグレーション適用
  ```bash
  supabase db push
  ```
- [ ] マイグレーション適用確認

### [Backend] 1-5. Supabase クライアント実装

**タスク**:

- [ ] Supabase クライアントライブラリのインストール
  ```bash
  npm install @supabase/supabase-js
  ```
- [ ] Server Component用クライアント作成
- [ ] Client Component用クライアント作成
- [ ] 接続確認用のサンプルクエリ

**関連ファイル**:

- `lib/supabase/server.ts`
- `lib/supabase/client.ts`

### [Backend] 1-6. 型定義生成

**タスク**:

- [ ] Supabase CLIで型定義生成
  ```bash
  supabase gen types typescript --local > types/database.ts
  ```
- [ ] 型定義の確認・調整

**関連ファイル**:

- `types/database.ts`

**完了条件**:

- Supabase CLIがセットアップされている
- マイグレーションが作成・適用されている
- Supabaseへの接続が確認できる
- テーブルが作成されている
- RLSポリシーが設定されている
- 型定義が生成されている

---

## フェーズ2：LINE認証・Bot基盤

**目的**: LINEユーザーの認証とBot基盤の構築

**期間**: 3-5日

### [Infrastructure] 2-1. LINE Developers 設定

**タスク**:

- [ ] LINE Developersアカウント作成
- [ ] プロバイダー作成
- [ ] Messaging API チャンネル作成
- [ ] LIFF アプリ登録（エンドポイントURL仮設定）
- [ ] 環境変数の設定
  - `LINE_CHANNEL_ACCESS_TOKEN`
  - `LINE_CHANNEL_SECRET`
  - `LIFF_ID`

### [Frontend] 2-2. LIFF SDK統合

**タスク**:

- [ ] LIFF SDK 導入（`@line/liff`）
- [ ] LIFF 初期化処理実装
- [ ] LIFF ラッパー関数作成

**関連ファイル**:

- `lib/liff/client.ts`

### [Frontend] 2-3. LINE認証機能（フロントエンド）

**タスク**:

- [ ] LINE ログイン処理実装
  - [ ] ユーザー情報取得
  - [ ] 認証状態の管理（Context API）
- [ ] ログアウト機能
- [ ] LIFF アプリ共通レイアウト作成

**関連ファイル**:

- `contexts/auth-context.tsx`
- `app/liff/layout.tsx`

### [Backend] 2-4. ユーザー登録 Server Action

**タスク**:

- [ ] ユーザー登録・更新 Server Action実装
- [ ] LINE ユーザー情報のDB保存処理
- [ ] エラーハンドリング

**関連ファイル**:

- `actions/users.ts`
- `types/user.ts`

### [Backend] 2-5. LINE Bot Webhook基盤

**タスク**:

- [ ] LINE SDK 導入（`@line/bot-sdk`）
- [ ] Webhook エンドポイント作成
- [ ] Webhook 署名検証実装
- [ ] メッセージイベントの基本ハンドリング

**関連ファイル**:

- `app/api/webhook/route.ts`
- `lib/line/validate.ts`

### [Backend] 2-6. LINE Messaging API ラッパー

**タスク**:

- [ ] Messaging API クライアント実装
- [ ] テキストメッセージ送信機能
- [ ] ウェルカムメッセージ実装

**関連ファイル**:

- `lib/line/messaging.ts`

### [Infrastructure] 2-7. Vercel デプロイ・Webhook設定

**タスク**:

- [ ] Vercelへの初回デプロイ
- [ ] Webhook URL確定
- [ ] LINE Developers Console でWebhook URL設定

**完了条件**:

- LINEでBotを友だち追加するとウェルカムメッセージが表示される
- LIFFアプリでLINEログインができる
- ユーザー情報がDBに保存される

---

## フェーズ3：プラン作成UI骨格（日程入力）

**目的**: プラン作成フローの基本UIと日程入力機能

**期間**: 3-4日

### [Frontend] 3-1. プラン作成状態管理

**タスク**:

- [ ] プラン作成フォーム用Context作成
- [ ] LocalStorage保存フック実装

**関連ファイル**:

- `contexts/plan-form-context.tsx`
- `hooks/use-plan-form-storage.ts`

### [Frontend] 3-2. ステップ式UIコンポーネント

**タスク**:

- [ ] ステップインジケーターコンポーネント作成
- [ ] ナビゲーションボタンコンポーネント作成
- [ ] ステップ遷移ロジック実装

**関連ファイル**:

- `components/plan/step-indicator.tsx`
- `components/plan/step-navigation.tsx`

### [Frontend] 3-3. プラン作成画面レイアウト

**タスク**:

- [ ] プラン作成画面の骨格作成
- [ ] ステップコンポーネントの配置
- [ ] レスポンシブ対応

**関連ファイル**:

- `app/liff/plan/new/page.tsx`

### [Backend] 3-4. プランバリデーションスキーマ

**タスク**:

- [ ] Zodスキーマ定義（日程入力）
- [ ] 型定義作成

**関連ファイル**:

- `lib/schemas/plan.ts`
- `types/plan.ts`

### [Frontend] 3-5. 日程入力フォーム

**タスク**:

- [ ] カレンダーUIコンポーネント実装（react-day-picker）
  - [ ] 日付範囲選択機能
  - [ ] 開始日・終了日のハイライト表示
- [ ] 日数の自動計算（例：2泊3日）
- [ ] React Hook Form + Zod統合
- [ ] バリデーション実装

**関連ファイル**:

- `components/plan/steps/date-input.tsx`

**完了条件**:

- カレンダーUIで日程を選択できる
- 選択した日程が正しく表示される
- 次のステップへ進める
- ブラウザをリロードしても入力内容が保持される

---

## フェーズ4：Google Maps 統合・スポット選択

**目的**: Google Maps API連携とスポット選択機能

**期間**: 5-7日

### [Infrastructure] 4-1. Google Maps API準備

**タスク**:

- [ ] Google Cloud Platformプロジェクト作成
- [ ] 以下のAPIを有効化
  - [ ] Maps JavaScript API
  - [ ] Places API
  - [ ] Directions API
- [ ] APIキー作成・制限設定
- [ ] 環境変数の設定
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### [Frontend] 4-2. Google Maps ローダー実装

**タスク**:

- [ ] `@googlemaps/js-api-loader` 導入
- [ ] Maps ローダー実装
- [ ] 動的インポート設定

**関連ファイル**:

- `lib/maps/loader.ts`

### [Frontend] 4-3. マップコンポーネント基盤

**タスク**:

- [ ] Google Map コンポーネント作成
- [ ] 日本全体マップの初期表示
- [ ] ズーム・パン操作実装

**関連ファイル**:

- `components/map/google-map.tsx`

### [Backend] 4-4. Places API ラッパー

**タスク**:

- [ ] Places API ラッパー実装
  - [ ] エリア検索
  - [ ] スポット検索（Text Search / Nearby Search）
  - [ ] スポット詳細取得（Place Details）
- [ ] 座標計算ユーティリティ

**関連ファイル**:

- `lib/maps/places.ts`
- `lib/maps/utils.ts`

### [Frontend] 4-5. エリア選択UI

**タスク**:

- [ ] 地方・都道府県データ定義
- [ ] 地方選択ドロップダウン実装
- [ ] 都道府県選択UI実装
- [ ] 選択エリアへのマップズーム

**関連ファイル**:

- `lib/constants/areas.ts`
- `components/plan/steps/area-selection.tsx`

### [Frontend] 4-6. スポットカードコンポーネント

**タスク**:

- [ ] スポットカード作成
  - [ ] 画像サムネイル
  - [ ] スポット名・概要
  - [ ] チェックボックス
- [ ] カード一覧（横スワイプ）実装

**関連ファイル**:

- `components/plan/spot-card.tsx`

### [Frontend] 4-7. マップマーカー・ピン表示

**タスク**:

- [ ] スポットマーカーコンポーネント作成
- [ ] マップ上のピン表示
- [ ] ピンとカードの選択状態同期

**関連ファイル**:

- `components/map/spot-marker.tsx`

### [Frontend] 4-8. スポット選択UI統合

**タスク**:

- [ ] スポット選択画面作成
- [ ] マップとカード一覧の統合
- [ ] カスタムスポット追加機能（テキスト入力+マップクリック）

**関連ファイル**:

- `components/plan/steps/spot-selection.tsx`

### [Backend] 4-9. スポット保存 Server Action

**タスク**:

- [ ] スポット保存 Server Action実装
- [ ] Google Place ID による重複チェック
- [ ] カスタムスポット保存処理

**関連ファイル**:

- `actions/spots.ts`
- `types/spot.ts`

**完了条件**:

- マップが正しく表示される
- エリアを選択するとおすすめスポットが表示される
- スポットを選択・解除できる
- カスタムスポットを追加できる
- 選択したスポットがマップに表示される

---

## フェーズ5：旅程自動生成・保存

**目的**: 選択スポットから最適な旅程を生成しDBに保存

**期間**: 5-7日

### [Backend] 5-1. 訪問順序最適化アルゴリズム

**タスク**:

- [ ] 貪欲法による順序最適化実装
- [ ] 日ごとのスポット配分ロジック実装

**関連ファイル**:

- `lib/itinerary/optimizer.ts`
- `lib/itinerary/spot-allocator.ts`

### [Backend] 5-2. Directions API ラッパー

**タスク**:

- [ ] Directions API ラッパー実装
- [ ] 移動時間の計算（徒歩モード）
- [ ] ルート情報の取得

**関連ファイル**:

- `lib/maps/directions.ts`

### [Backend] 5-3. 時刻計算ロジック

**タスク**:

- [ ] 滞在時間の推定ロジック実装
- [ ] 訪問時刻の自動計算
- [ ] 時刻調整機能

**関連ファイル**:

- `lib/itinerary/time-calculator.ts`

### [Backend] 5-4. プラン保存 Server Action

**タスク**:

- [ ] プラン作成 Server Action実装
  - [ ] travel_plans 作成
  - [ ] plan_days 作成
  - [ ] plan_spots 一括作成
  - [ ] plan_members 作成（作成者を自動追加）
- [ ] トランザクション処理
- [ ] エラーハンドリング

**関連ファイル**:

- `actions/plans.ts`

**完了条件**:

- 選択したスポットが効率的な順序で並ぶ
- 移動時間が計算される
- プランがDBに保存される
- 保存後に結果画面へ遷移する

---

## フェーズ6：結果画面・旅程表示

**目的**: 生成された旅程の表示機能

**期間**: 5-7日

### [Backend] 6-1. プラン詳細取得クエリ

**タスク**:

- [ ] プラン詳細取得クエリ実装
- [ ] スポット・日程情報のJOIN
- [ ] 型定義作成

**関連ファイル**:

- `lib/queries/plans.ts`

### [Frontend] 6-2. プラン詳細画面（Server Component）

**タスク**:

- [ ] プラン詳細画面作成（Server Component）
- [ ] プランデータの取得・表示
- [ ] エラーハンドリング

**関連ファイル**:

- `app/liff/plan/[id]/page.tsx`

### [Frontend] 6-3. プランヘッダーコンポーネント

**タスク**:

- [ ] プランタイトル表示コンポーネント
- [ ] タイトル編集機能（インライン編集）
- [ ] タブ切替UI（旅程表 / マップ）

**関連ファイル**:

- `components/plan/plan-header.tsx`

### [Frontend] 6-4. 旅程表タブ - 順序のみビュー

**タスク**:

- [ ] トグルスイッチコンポーネント
- [ ] 順序のみビュー実装
  - [ ] 日付ごとのスポットリスト
  - [ ] スポット名・順序番号表示

**関連ファイル**:

- `components/plan/tabs/itinerary-tab.tsx`
- `components/plan/itinerary-list.tsx`

### [Frontend] 6-5. 旅程表タブ - 時間付きビュー

**タスク**:

- [ ] 時間付きビュー実装
  - [ ] 訪問予定時刻表示
  - [ ] 移動時間表示
- [ ] 時刻ピッカーコンポーネント作成
- [ ] 時刻インライン編集機能

**関連ファイル**:

- `components/plan/time-picker.tsx`

### [Backend] 6-6. 時刻更新 Server Action

**タスク**:

- [ ] 時刻更新 Server Action実装
- [ ] 時刻変更後の自動再計算
- [ ] 楽観的更新対応

**関連ファイル**:

- `actions/plans.ts`

### [Frontend] 6-7. マップタブ - ルート表示

**タスク**:

- [ ] マップタブコンポーネント作成
- [ ] 日ごとのルート描画
- [ ] 日付タブ切替UI
  - [ ] 選択中の日は濃い線
  - [ ] 他の日は薄い線

**関連ファイル**:

- `components/plan/tabs/map-tab.tsx`
- `components/map/route-layer.tsx`

### [Frontend] 6-8. マップタブ - ピン・ポップアップ

**タスク**:

- [ ] 番号付きピン実装（スタート:緑 / 通常:青 / ゴール:赤）
- [ ] ピンタップでポップアップ表示
  - [ ] スポット名
  - [ ] サムネイル画像
- [ ] 自動ズーム・フォーカス

**関連ファイル**:

- `components/map/spot-popup.tsx`

**完了条件**:

- 旅程表が正しく表示される
- 時刻を編集できる
- マップにルートとピンが表示される
- タブ切替がスムーズ

---

## フェーズ7：保存済みプラン機能

**目的**: 過去に作成したプランの閲覧・管理

**期間**: 3-4日

### [Backend] 7-1. プラン一覧取得クエリ

**タスク**:

- [ ] プラン一覧取得クエリ実装
- [ ] スポットサマリー取得
- [ ] 開始日昇順ソート

**関連ファイル**:

- `lib/queries/plans.ts`

### [Frontend] 7-2. プランカードコンポーネント

**タスク**:

- [ ] プランカード作成
  - [ ] ヘッダー画像（固定イラスト）
  - [ ] プランタイトル
  - [ ] 日程表示
  - [ ] スポットサマリー（最大3-4件）
  - [ ] 詳細ボタン

**関連ファイル**:

- `components/plan/plan-card.tsx`

### [Frontend] 7-3. プラン一覧画面

**タスク**:

- [ ] プラン一覧画面作成（Server Component）
- [ ] カード一覧表示
- [ ] 空状態の表示

**関連ファイル**:

- `app/liff/plans/page.tsx`

### [Backend] 7-4. プラン更新・削除 Server Action

**タスク**:

- [ ] タイトル更新 Server Action
- [ ] プラン削除 Server Action（作成者チェック）
- [ ] カスケード削除処理

**関連ファイル**:

- `actions/plans.ts`

### [Frontend] 7-5. プラン削除機能

**タスク**:

- [ ] 削除確認ダイアログコンポーネント
- [ ] 削除ボタン実装（作成者のみ表示）
- [ ] 楽観的更新

**関連ファイル**:

- `components/plan/delete-plan-dialog.tsx`

**完了条件**:

- 保存したプランが一覧に表示される
- プランをタップすると詳細が表示される
- 作成者はプランを削除できる

---

## フェーズ8：LINE Bot連携強化

**目的**: BotとLIFFアプリの連携を強化

**期間**: 3-4日

### [Backend] 8-1. Flex Message テンプレート

**タスク**:

- [ ] Flex Message テンプレート作成
  - [ ] プラン作成完了メッセージ
  - [ ] タイトル・日程・スポット概要表示
  - [ ] 詳細ボタン（LIFF起動）

**関連ファイル**:

- `lib/line/flex-messages.ts`

### [Backend] 8-2. プラン保存時のメッセージ送信

**タスク**:

- [ ] プラン保存 Server Action拡張
- [ ] トーク画面へのFlex Message投稿機能

**関連ファイル**:

- `actions/plans.ts`

### [Infrastructure] 8-3. リッチメニュー画像作成

**タスク**:

- [ ] リッチメニュー画像デザイン（Figma等）
- [ ] 6分割レイアウト
  - プラン作成を始める
  - 保存済みプラン一覧
  - ヘルプ
  - サービス概要
  - 問い合わせ/フィードバック

**関連ファイル**:

- `public/rich-menu/`

### [Backend] 8-4. リッチメニュー登録スクリプト

**タスク**:

- [ ] リッチメニューJSON作成
- [ ] リッチメニュー登録スクリプト実装

**関連ファイル**:

- `scripts/setup-rich-menu.ts`

### [Backend] 8-5. Bot コマンドハンドラー

**タスク**:

- [ ] メッセージハンドラー実装
  - [ ] 「プラン作成」→ LIFF起動Flex Message
  - [ ] 「保存済みプラン」→ プラン一覧へのLIFF起動
  - [ ] 「ヘルプ」→ ヘルプFlex Message
  - [ ] 「サービス概要」→ 概要メッセージ

**関連ファイル**:

- `lib/line/handlers/`
- `app/api/webhook/route.ts`

### [Infrastructure] 8-6. リッチメニュー登録

**タスク**:

- [ ] スクリプト実行
- [ ] リッチメニュー動作確認

**完了条件**:

- プラン保存後にトーク画面にFlex Messageが投稿される
- リッチメニューから各機能にアクセスできる
- Botがコマンドに応答する

---

## フェーズ9：ヘルプ・エラーハンドリング

**目的**: ユーザビリティの向上

**期間**: 2-3日

### [Frontend] 9-1. ヘルプステップコンポーネント

**タスク**:

- [ ] ヘルプステップコンポーネント作成
- [ ] 図解画像配置
- [ ] ステップ別説明文

**関連ファイル**:

- `components/help/help-step.tsx`

### [Frontend] 9-2. ヘルプ画面

**タスク**:

- [ ] ヘルプ画面作成
- [ ] 5ステップの使い方説明
- [ ] プラン作成ボタン配置
- [ ] FAQ セクション（オプション）

**関連ファイル**:

- `app/liff/help/page.tsx`

### [Frontend] 9-3. エラーバウンダリ

**タスク**:

- [ ] グローバルエラーバウンダリ作成
- [ ] LIFF用エラーバウンダリ作成
- [ ] エラーメッセージUI

**関連ファイル**:

- `app/error.tsx`
- `app/liff/error.tsx`

### [Frontend] 9-4. ローディング・スケルトン

**タスク**:

- [ ] ローディングスピナーコンポーネント
- [ ] スケルトンスクリーンコンポーネント（プラン一覧等）
- [ ] loading.tsx ファイル作成

**関連ファイル**:

- `components/ui/loading-spinner.tsx`
- `components/ui/skeleton.tsx`

### [Frontend] 9-5. トースト通知

**タスク**:

- [ ] react-hot-toast 導入
- [ ] トースト通知ユーティリティ作成
- [ ] 成功・エラー通知の実装

**関連ファイル**:

- `lib/toast.ts`

### [Frontend] 9-6. レスポンシブ・アクセシビリティ対応

**タスク**:

- [ ] モバイル表示の最適化
- [ ] タブレット表示対応
- [ ] タップ領域の確保（44px以上）
- [ ] 色覚異常への配慮（カラーパレット調整）
- [ ] ARIAラベルの追加

**完了条件**:

- ヘルプ画面で使い方を確認できる
- エラーが発生しても適切に処理される
- モバイル・タブレットで快適に操作できる

---

## フェーズ10：テスト・品質向上

**目的**: コードの品質保証

**期間**: 5-7日

### [Backend] 10-1. ユニットテスト（バックエンド）

**タスク**:

- [ ] 旅程最適化ロジックのテスト
- [ ] 時刻計算のテスト
- [ ] Zodスキーマのテスト
- [ ] Server Actionsのテスト（モック使用）

**関連ファイル**:

- `__tests__/lib/itinerary/optimizer.test.ts`
- `__tests__/lib/itinerary/time-calculator.test.ts`
- `__tests__/lib/schemas/plan.test.ts`
- `__tests__/actions/plans.test.ts`

### [Frontend] 10-2. コンポーネントテスト

**タスク**:

- [ ] フォームコンポーネントのテスト
- [ ] カードコンポーネントのテスト
- [ ] ステップナビゲーションのテスト

**関連ファイル**:

- `__tests__/components/plan/`
- `__tests__/components/ui/`

**完了条件**:

- 重要機能にテストが追加されている
- テストが全てパスする

---

## フェーズ11：本番デプロイ準備

**目的**: 本番環境へのリリース準備

**期間**: 3-4日

### [Frontend] 11-1. パフォーマンス最適化

**タスク**:

- [ ] 画像最適化（Next.js Image コンポーネント使用確認）
- [ ] 動的インポート（Google Maps等の大きなライブラリ）
- [ ] バンドルサイズ分析・削減
- [ ] Lighthouse スコア改善（目標: Performance 80以上）

### [Backend] 11-2. セキュリティ対策

**タスク**:

- [ ] 環境変数の確認（本番用の値設定）
- [ ] RLSポリシーの検証・強化
- [ ] CORS設定（必要に応じて）
- [ ] Rate Limiting（Vercel設定）
- [ ] 入力値のサニタイジング確認

### [Infrastructure] 11-3. 監視・ログ

**タスク**:

- [ ] Vercel Analytics 有効化
- [ ] エラーログの確認体制構築
- [ ] 主要APIのログ出力

### [Infrastructure] 11-4. ドキュメント整備

**タスク**:

- [ ] README更新（セットアップ手順等）
- [ ] 開発ガイド更新（CLAUDE.md）
- [ ] デプロイ手順書作成

**完了条件**:

- Lighthouseスコアが基準を満たす
- セキュリティチェックが完了
- 本番環境変数が設定されている

---

## フェーズ12：MVP リリース

**目的**: 初回リリース

**期間**: 1-2日

### [Infrastructure] 12-1. リリース前チェック

**タスク**:

- [ ] 全機能の動作確認（チェックリスト作成）
- [ ] 主要ブラウザでの動作確認（Chrome, Safari）
- [ ] モバイル実機テスト（iOS, Android）
- [ ] LINE Bot / LIFF 動作確認
- [ ] パフォーマンステスト

### [Infrastructure] 12-2. 本番環境設定

**タスク**:

- [ ] 本番環境へのデプロイ（Vercel）
- [ ] LINE Bot 本番設定
  - [ ] Webhook URL更新
  - [ ] リッチメニュー登録
- [ ] LIFF アプリ本番登録
  - [ ] エンドポイントURL更新
  - [ ] LIFF ID取得・環境変数更新
- [ ] Google Maps API 本番キー確認

### [Infrastructure] 12-3. リリース後対応

**タスク**:

- [ ] モニタリング開始
- [ ] ユーザーフィードバック収集準備（Googleフォーム等）
- [ ] バグ修正・緊急対応体制

**完了条件**:

- 本番環境で全機能が動作
- ユーザーがプラン作成から保存まで完了できる

---

## 将来機能（MVP リリース後）

以下の機能はMVPリリース後に段階的に実装します。

### F1. スタート/ゴール地点設定

**Backend**:

- [ ] plan_days.start_point / end_point の活用
- [ ] ルート計算への反映

**Frontend**:

- [ ] ホテル・駅・空港検索UI（Places API活用）

### F2. 移動モード拡張

**Backend**:

- [ ] 電車モード（Directions API）
- [ ] 車モード（Directions API）
- [ ] 移動時間比較計算

**Frontend**:

- [ ] 移動手段切替UI
- [ ] 移動時間比較表示

### F3. リマインダー通知

**Backend**:

- [ ] user_settings テーブルの活用
- [ ] スケジュール処理（Supabase Edge Functions / Vercel Cron）
- [ ] 旅行前日の通知送信

### F4. 複数人編集機能

**Backend**:

- [ ] LINEグループメンバーの自動追加
- [ ] リアルタイム同期（Supabase Realtime）
- [ ] 編集競合の解決

### F5. プラン共有機能

**Backend**:

- [ ] plan_shares テーブルの活用
- [ ] 共有トークン生成

**Frontend**:

- [ ] 共有リンクUI
- [ ] QRコード生成

### F6. SNS連携

**Backend**:

- [ ] 旅程表の画像化（Canvas API / Puppeteer）
- [ ] OGP設定

**Frontend**:

- [ ] SNSシェアボタン

---

## まとめ

### 実装順序の概要

1. **フェーズ0**: 環境構築（1-2日）✅
2. **フェーズ1**: データベース構築（2-3日）
3. **フェーズ2**: LINE認証・Bot基盤（3-5日）
4. **フェーズ3**: 日程入力（3-4日）
5. **フェーズ4**: スポット選択（5-7日）
6. **フェーズ5**: 旅程生成（5-7日）
7. **フェーズ6**: 結果表示（5-7日）
8. **フェーズ7**: プラン一覧（3-4日）
9. **フェーズ8**: Bot連携（3-4日）
10. **フェーズ9**: ヘルプ・エラー処理（2-3日）
11. **フェーズ10**: テスト（5-7日）
12. **フェーズ11**: デプロイ準備（3-4日）
13. **フェーズ12**: リリース（1-2日）

**合計**: 約6-8週間でMVPリリース

### 依存関係マップ

```text
フェーズ0（環境構築）✅
  ↓
フェーズ1（DB構築）
  ↓
フェーズ2（LINE認証・Bot）
  ↓
フェーズ3（日程入力）
  ↓
フェーズ4（スポット選択）※Google Maps準備
  ↓
フェーズ5（旅程生成）
  ↓
フェーズ6（結果表示）
  ↓
フェーズ7（プラン一覧）
  ↓
フェーズ8（Bot連携強化）
  ↓
フェーズ9（ヘルプ・エラー処理）
  ↓
フェーズ10（テスト）
  ↓
フェーズ11（デプロイ準備）
  ↓
フェーズ12（リリース）
```

### 重要な技術的マイルストーン

- **フェーズ2完了時**: LINE認証とBot基盤が動作
- **フェーズ5完了時**: コア機能（旅程生成）が動作
- **フェーズ8完了時**: Bot連携が完成、ユーザー体験が向上
- **フェーズ10完了時**: 品質が保証され、リリース可能状態

### 外部サービス準備タイミング

- **Supabase**: フェーズ1で準備
- **LINE Developers**: フェーズ2で準備
- **Google Maps API**: フェーズ4で準備

### GitHub Issue作成時のラベル

各タスクの`[Backend]` `[Frontend]` `[Infrastructure]`表記に基づいてラベルを付与してください。

---

**注意事項**:

- 各フェーズ完了時に動作確認とテストを実施
- 問題が発生した場合は前のフェーズに戻って修正
- ユーザーフィードバックに応じて優先順位を調整
- 技術的負債は記録し、定期的にリファクタリング時間を確保
