# tabiji - 実装計画書

## 概要

このドキュメントは、tabijiプロジェクトの機能実装順序を定義します。
依存関係を考慮し、段階的に機能を構築していくことで、安定した開発を実現します。

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

### 追加で必要な作業

- [ ] 基本的なディレクトリ構成の作成
  - [ ] `app/liff/` - LIFF アプリ用ディレクトリ
  - [ ] `components/` - コンポーネント用ディレクトリ
  - [ ] `lib/` - ユーティリティ用ディレクトリ
  - [ ] `actions/` - Server Actions用ディレクトリ
  - [ ] `types/` - 型定義用ディレクトリ
- [ ] 環境変数ファイルのテンプレート作成（.env.example）

**完了条件**:

- ローカル環境でNext.jsが起動できる
- 基本的なディレクトリ構成ができている

---

## フェーズ1：データベース構築

**目的**: Supabaseセットアップとテーブル作成

**期間**: 2-3日

### 1-1. Supabase プロジェクト作成

- [ ] Supabaseアカウント作成・プロジェクト作成
- [ ] Supabase クライアントライブラリのインストール
- [ ] 環境変数の設定
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 1-2. テーブル作成

- [ ] MVP に必要なテーブルを作成
  - [ ] users テーブル
  - [ ] travel_plans テーブル
  - [ ] plan_days テーブル
  - [ ] spots テーブル
  - [ ] plan_spots テーブル
  - [ ] plan_members テーブル
  - [ ] line_groups テーブル
- [ ] インデックス設定
- [ ] RLS（Row Level Security）ポリシーの基本設定

### 1-3. Supabase クライアント実装

- [ ] Server Component用クライアント作成
- [ ] Client Component用クライアント作成
- [ ] 接続確認用のサンプルクエリ

**関連ファイル**:

- `lib/supabase/server.ts` - Server Component用クライアント
- `lib/supabase/client.ts` - Client Component用クライアント
- `types/database.ts` - データベース型定義（Supabase CLIで生成）

**完了条件**:

- Supabaseへの接続が確認できる
- テーブルが作成されている
- RLSポリシーが設定されている

---

## フェーズ2：LINE認証・Bot基盤

**目的**: LINEユーザーの認証とBot基盤の構築

**期間**: 3-5日

### 2-1. LINE Developers 設定

- [ ] LINE Developersアカウント作成
- [ ] プロバイダー作成
- [ ] Messaging API チャンネル作成
- [ ] LIFF アプリ登録（エンドポイントURL仮設定）
- [ ] 環境変数の設定
  - `LINE_CHANNEL_ACCESS_TOKEN`
  - `LINE_CHANNEL_SECRET`
  - `LIFF_ID`

### 2-2. LINE認証機能

- [ ] LIFF SDK 導入（`@line/liff`）
- [ ] LIFF 初期化処理実装
- [ ] LINE ログイン処理実装
  - [ ] ユーザー情報取得
  - [ ] Supabase へのユーザー登録・更新
- [ ] 認証状態の管理（Context API）
- [ ] ログアウト機能

**関連ファイル**:

- `lib/liff/client.ts` - LIFF クライアント初期化
- `contexts/auth-context.tsx` - 認証状態管理
- `actions/users.ts` - ユーザー登録 Server Action
- `app/liff/layout.tsx` - LIFF アプリ共通レイアウト

### 2-3. LINE Bot 基盤実装

- [ ] LINE SDK 導入（`@line/bot-sdk`）
- [ ] Webhook エンドポイント作成（`app/api/webhook/route.ts`）
- [ ] Webhook 署名検証
- [ ] メッセージイベントの基本ハンドリング
- [ ] ウェルカムメッセージ実装
- [ ] Vercelへのデプロイ（Webhook URL確定のため）
- [ ] Webhook URL設定

**関連ファイル**:

- `app/api/webhook/route.ts` - Webhook エンドポイント
- `lib/line/messaging.ts` - LINE Messaging API ラッパー
- `lib/line/validate.ts` - 署名検証

**完了条件**:

- LINEでBotを友だち追加するとウェルカムメッセージが表示される
- LIFFアプリでLINEログインができる
- ユーザー情報がDBに保存される

---

## フェーズ3：プラン作成UI骨格（日程入力）

**目的**: プラン作成フローの基本UIと日程入力機能

**期間**: 3-4日

### 3-1. プラン作成画面の骨格

- [ ] ステップ式UIの基本レイアウト実装
  - [ ] ヘッダー（ステップインジケーター）
  - [ ] コンテンツエリア
  - [ ] ナビゲーションボタン（戻る/次へ）
- [ ] 画面遷移ロジック（useState or URLパラメータ）
- [ ] プラン作成状態管理（Context or zustand）

**関連ファイル**:

- `app/liff/plan/new/page.tsx` - プラン作成画面
- `components/plan/step-indicator.tsx` - ステップインジケーター
- `components/plan/step-navigation.tsx` - ナビゲーションボタン
- `contexts/plan-form-context.tsx` - プラン作成状態管理

### 3-2. 日程入力フォーム（ステップ1）

- [ ] カレンダーUIコンポーネント実装（react-day-pickerなど）
  - [ ] 日付範囲選択機能
  - [ ] 開始日・終了日のハイライト表示
- [ ] 日数の自動計算（例：2泊3日）
- [ ] バリデーション（開始日 < 終了日）
- [ ] React Hook Form + Zod でフォーム管理
- [ ] LocalStorage に一時保存

**関連ファイル**:

- `components/plan/steps/date-input.tsx` - 日程入力コンポーネント
- `lib/schemas/plan.ts` - プラン入力のZodスキーマ
- `hooks/use-plan-form-storage.ts` - LocalStorage保存フック

**完了条件**:

- カレンダーUIで日程を選択できる
- 選択した日程が正しく表示される
- 次のステップへ進める
- ブラウザをリロードしても入力内容が保持される

---

## フェーズ4：Google Maps 統合・スポット選択

**目的**: Google Maps API連携とスポット選択機能

**期間**: 5-7日

### 4-1. Google Maps 準備

- [ ] Google Cloud Platformプロジェクト作成
- [ ] 以下のAPIを有効化
  - [ ] Maps JavaScript API
  - [ ] Places API
  - [ ] Directions API（フェーズ5で使用）
- [ ] APIキー作成・制限設定
- [ ] 環境変数の設定
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### 4-2. Google Maps 統合

- [ ] `@googlemaps/js-api-loader` 導入
- [ ] マップコンポーネント実装
  - [ ] 日本全体マップの初期表示
  - [ ] ズーム・パン操作
- [ ] Places API ラッパー実装
  - [ ] エリア検索
  - [ ] スポット検索（Text Search / Nearby Search）
  - [ ] スポット詳細取得（Place Details）

**関連ファイル**:

- `lib/maps/loader.ts` - Google Maps ローダー
- `components/map/google-map.tsx` - マップコンポーネント
- `lib/maps/places.ts` - Places API ラッパー
- `lib/maps/utils.ts` - 座標計算などのユーティリティ

### 4-3. エリア選択UI（ステップ2-1）

- [ ] 地方・都道府県データの定義
- [ ] 地方選択UI（ドロップダウン）
- [ ] 都道府県選択UI
- [ ] 選択エリアへのマップズーム
- [ ] おすすめスポットの取得・表示

**関連ファイル**:

- `components/plan/steps/area-selection.tsx` - エリア選択UI
- `lib/constants/areas.ts` - 地方・都道府県データ

### 4-4. スポット選択UI（ステップ2-2）

- [ ] スポットカードコンポーネント
  - [ ] 画像サムネイル
  - [ ] スポット名・概要
  - [ ] チェックボックス
- [ ] カード一覧（横スワイプ可能）
- [ ] マップ上のピン表示
- [ ] ピンとカードの選択状態同期
- [ ] カスタムスポット追加機能（テキスト入力+マップクリック）
- [ ] スポットのDB保存（spots テーブル）

**関連ファイル**:

- `components/plan/steps/spot-selection.tsx` - スポット選択UI
- `components/plan/spot-card.tsx` - スポットカード
- `components/map/spot-marker.tsx` - マーカーコンポーネント
- `actions/spots.ts` - スポット保存 Server Action

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

### 5-1. 旅程最適化ロジック

- [ ] 訪問順序の最適化アルゴリズム実装
  - [ ] 貪欲法による簡易最適化
  - [ ] 日ごとのスポット配分ロジック
- [ ] Google Directions API 統合
  - [ ] 移動時間の計算（徒歩モード）
  - [ ] ルート情報の取得
- [ ] 滞在時間の推定ロジック
- [ ] 訪問時刻の自動計算

**関連ファイル**:

- `lib/itinerary/optimizer.ts` - 旅程最適化ロジック
- `lib/maps/directions.ts` - Directions API ラッパー
- `lib/itinerary/time-calculator.ts` - 時刻計算
- `lib/itinerary/spot-allocator.ts` - 日別スポット配分

### 5-2. プラン保存処理

- [ ] Server Action 実装
  - [ ] travel_plans 作成
  - [ ] plan_days 作成
  - [ ] plan_spots 一括作成
  - [ ] plan_members 作成（作成者を自動追加）
- [ ] トランザクション処理
- [ ] エラーハンドリング
- [ ] 保存完了後のリダイレクト

**関連ファイル**:

- `actions/plans.ts` - プラン作成 Server Action
- `types/plan.ts` - プラン関連の型定義

**完了条件**:

- 選択したスポットが効率的な順序で並ぶ
- 移動時間が計算される
- プランがDBに保存される
- 保存後に結果画面へ遷移する

---

## フェーズ6：結果画面・旅程表示

**目的**: 生成された旅程の表示機能

**期間**: 5-7日

### 6-1. 結果画面の基本レイアウト

- [ ] プラン詳細画面実装（Server Component）
- [ ] プランデータの取得
- [ ] タブ切替UI（旅程表 / マップ）
- [ ] プランタイトル表示・編集機能

**関連ファイル**:

- `app/liff/plan/[id]/page.tsx` - プラン詳細画面（Server Component）
- `components/plan/plan-result.tsx` - 結果画面コンポーネント
- `components/plan/plan-header.tsx` - ヘッダー（タイトル編集）

### 6-2. 旅程表タブ

- [ ] トグルスイッチ（順序のみ / 時間付き）
- [ ] 順序のみビュー
  - [ ] 日付ごとのスポットリスト
  - [ ] スポット名・順序番号表示
- [ ] 時間付きビュー
  - [ ] 訪問予定時刻表示
  - [ ] 移動時間表示
  - [ ] 時刻ピッカーでインライン編集
  - [ ] 時刻変更時の自動再計算

**関連ファイル**:

- `components/plan/tabs/itinerary-tab.tsx` - 旅程表タブ
- `components/plan/itinerary-list.tsx` - スポットリスト
- `components/plan/time-picker.tsx` - 時刻ピッカー
- `actions/plans.ts` - 時刻更新 Server Action

### 6-3. マップタブ

- [ ] 日ごとのルート表示
- [ ] 番号付きピン（スタート:緑 / 通常:青 / ゴール:赤）
- [ ] 日付タブ切替
  - [ ] 選択中の日は濃い線
  - [ ] 他の日は薄い線
- [ ] ピンタップでポップアップ表示
  - [ ] スポット名
  - [ ] サムネイル画像
- [ ] 自動ズーム・フォーカス

**関連ファイル**:

- `components/plan/tabs/map-tab.tsx` - マップタブ
- `components/map/route-layer.tsx` - ルート描画
- `components/map/spot-popup.tsx` - スポットポップアップ

**完了条件**:

- 旅程表が正しく表示される
- 時刻を編集できる
- マップにルートとピンが表示される
- タブ切替がスムーズ

---

## フェーズ7：保存済みプラン機能

**目的**: 過去に作成したプランの閲覧・管理

**期間**: 3-4日

### 7-1. プラン一覧画面

- [ ] プラン一覧取得（Server Component）
- [ ] カードUIコンポーネント
  - [ ] ヘッダー画像（固定イラスト）
  - [ ] プランタイトル
  - [ ] 日程表示
  - [ ] スポットサマリー（最大3-4件）
  - [ ] 詳細ボタン
- [ ] 並び順（開始日昇順）

**関連ファイル**:

- `app/liff/plans/page.tsx` - プラン一覧画面（Server Component）
- `components/plan/plan-card.tsx` - プランカード
- `lib/queries/plans.ts` - プラン取得クエリ

### 7-2. プラン管理機能

- [ ] タイトル編集機能
- [ ] プラン削除機能（作成者のみ）
- [ ] 削除確認ダイアログ

**関連ファイル**:

- `actions/plans.ts` - プラン更新・削除 Server Action
- `components/plan/delete-plan-dialog.tsx` - 削除確認ダイアログ

**完了条件**:

- 保存したプランが一覧に表示される
- プランをタップすると詳細が表示される
- 作成者はプランを削除できる

---

## フェーズ8：LINE Bot連携強化

**目的**: BotとLIFFアプリの連携を強化

**期間**: 3-4日

### 8-1. Flex Message 実装

- [ ] Flex Message テンプレート作成
  - [ ] プラン作成完了時のメッセージ
  - [ ] タイトル・日程・スポット概要表示
  - [ ] 詳細ボタン（LIFF起動）
- [ ] プラン保存時にトーク画面へ投稿

**関連ファイル**:

- `lib/line/flex-messages.ts` - Flex Message テンプレート
- `actions/plans.ts` - プラン保存時にFlex Message送信

### 8-2. リッチメニュー実装

- [ ] リッチメニューJSON作成
  - [ ] プラン作成を始める
  - [ ] 保存済みプラン一覧
  - [ ] ヘルプ
  - [ ] サービス概要
  - [ ] 問い合わせ/フィードバック
- [ ] 画像デザイン作成（Figma等）
- [ ] リッチメニュー登録スクリプト作成
- [ ] リッチメニュー登録

**関連ファイル**:

- `public/rich-menu/` - リッチメニュー画像
- `scripts/setup-rich-menu.ts` - リッチメニュー登録スクリプト

### 8-3. Bot コマンド拡張

- [ ] テキストメッセージのハンドリング
  - [ ] 「プラン作成」→ LIFF起動Flex Message
  - [ ] 「保存済みプラン」→ プラン一覧へのLIFF起動
  - [ ] 「ヘルプ」→ ヘルプFlex Message
  - [ ] 「サービス概要」→ 概要メッセージ

**関連ファイル**:

- `app/api/webhook/route.ts` - Webhookハンドラー拡張
- `lib/line/handlers/` - メッセージハンドラー

**完了条件**:

- プラン保存後にトーク画面にFlex Messageが投稿される
- リッチメニューから各機能にアクセスできる
- Botがコマンドに応答する

---

## フェーズ9：ヘルプ・エラーハンドリング

**目的**: ユーザビリティの向上

**期間**: 2-3日

### 9-1. ヘルプ画面

- [ ] ヘルプ画面実装
  - [ ] ステップ別の使い方説明
  - [ ] 図解画像（スクリーンショット）
  - [ ] プラン作成ボタン
- [ ] FAQ セクション（必要に応じて）

**関連ファイル**:

- `app/liff/help/page.tsx` - ヘルプ画面
- `components/help/help-step.tsx` - ステップ説明コンポーネント

### 9-2. エラーハンドリング・ローディング

- [ ] エラーバウンダリ実装
- [ ] エラーメッセージUI
- [ ] ローディングスピナー
- [ ] スケルトンスクリーン（プラン一覧等）
- [ ] トースト通知（react-hot-toast等）

**関連ファイル**:

- `app/error.tsx` - グローバルエラーバウンダリ
- `app/liff/error.tsx` - LIFF用エラーバウンダリ
- `components/ui/loading-spinner.tsx` - ローディング
- `components/ui/skeleton.tsx` - スケルトンスクリーン
- `lib/toast.ts` - トースト通知ユーティリティ

### 9-3. レスポンシブ対応・アクセシビリティ

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

### 10-1. ユニットテスト

- [ ] 重要なユーティリティ関数のテスト
  - [ ] 旅程最適化ロジック
  - [ ] 時刻計算
  - [ ] バリデーション（Zodスキーマ）
- [ ] Server Actionsのテスト（モック使用）

**関連ファイル**:

- `__tests__/lib/itinerary/optimizer.test.ts`
- `__tests__/lib/itinerary/time-calculator.test.ts`
- `__tests__/lib/schemas/plan.test.ts`

### 10-2. コンポーネントテスト

- [ ] 主要コンポーネントのテスト
  - [ ] フォームコンポーネント
  - [ ] カードコンポーネント
  - [ ] ステップナビゲーション

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

### 11-1. パフォーマンス最適化

- [ ] 画像最適化（Next.js Image コンポーネント使用確認）
- [ ] 動的インポート（Google Maps等の大きなライブラリ）
- [ ] バンドルサイズ分析・削減
- [ ] Lighthouse スコア改善（目標: Performance 80以上）

### 11-2. セキュリティ対策

- [ ] 環境変数の確認（本番用の値設定）
- [ ] RLSポリシーの検証・強化
- [ ] CORS設定（必要に応じて）
- [ ] Rate Limiting（Vercel設定）
- [ ] 入力値のサニタイジング確認

### 11-3. 監視・ログ

- [ ] Vercel Analytics 有効化
- [ ] エラーログの確認体制構築
- [ ] 主要APIのログ出力

### 11-4. ドキュメント整備

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

### 12-1. リリース前チェック

- [ ] 全機能の動作確認（チェックリスト作成）
- [ ] 主要ブラウザでの動作確認（Chrome, Safari）
- [ ] モバイル実機テスト（iOS, Android）
- [ ] LINE Bot / LIFF 動作確認
- [ ] パフォーマンステスト

### 12-2. リリース作業

- [ ] 本番環境へのデプロイ（Vercel）
- [ ] LINE Bot 本番設定
  - [ ] Webhook URL更新
  - [ ] リッチメニュー登録
- [ ] LIFF アプリ本番登録
  - [ ] エンドポイントURL更新
  - [ ] LIFF ID取得・環境変数更新
- [ ] Google Maps API 本番キー確認

### 12-3. リリース後

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

- [ ] plan_days.start_point / end_point の活用
- [ ] ホテル・駅・空港検索UI（Places API活用）
- [ ] ルート計算への反映

### F2. 移動モード拡張

- [ ] 電車モード（Directions API）
- [ ] 車モード（Directions API）
- [ ] 移動手段切替UI
- [ ] 移動時間比較表示

### F3. リマインダー通知

- [ ] user_settings テーブルの活用
- [ ] スケジュール処理（Supabase Edge Functions / Vercel Cron）
- [ ] 旅行前日の通知送信

### F4. 複数人編集機能

- [ ] LINEグループメンバーの自動追加
- [ ] リアルタイム同期（Supabase Realtime）
- [ ] 編集競合の解決

### F5. プラン共有機能

- [ ] plan_shares テーブルの活用
- [ ] 共有トークン生成
- [ ] 共有リンクUI
- [ ] QRコード生成

### F6. SNS連携

- [ ] 旅程表の画像化（Canvas API / Puppeteer）
- [ ] SNSシェアボタン
- [ ] OGP設定

---

## まとめ

### 実装順序の概要

1. **フェーズ0**: 環境構築（1-2日）
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
フェーズ0（環境構築）
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

---

**注意事項**:

- 各フェーズ完了時に動作確認とテストを実施
- 問題が発生した場合は前のフェーズに戻って修正
- ユーザーフィードバックに応じて優先順位を調整
- 技術的負債は記録し、定期的にリファクタリング時間を確保
