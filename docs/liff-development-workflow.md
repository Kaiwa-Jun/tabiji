# LIFF 日常的な開発ワークフロー

## 📋 概要

このドキュメントは、LIFF開発の**日常的な開発手順**をまとめたものです。
初回セットアップが完了していることを前提としています。

---

## 🚀 基本の開発フロー（95%の時間）

### いつも通りの開発

```bash
# ターミナルでコマンド実行
npm run dev
```

**ブラウザで確認:**

```
http://localhost:3000/liff/test
http://localhost:3000/liff/plans
http://localhost:3000/liff/plan/new
```

**この方法で開発できる機能:**

- ✅ データベース操作（取得・保存・更新・削除）
- ✅ Server Actions
- ✅ フォーム処理
- ✅ UI/UX実装
- ✅ スタイリング
- ✅ 一般的なReactロジック

**開発の流れ:**

```
1. コードを編集
   ↓
2. 保存
   ↓
3. ブラウザが自動リロード
   ↓
4. 即座に確認
```

---

## 📱 LINE機能の確認（5%の時間）

### LIFF CLI を使った確認

**いつ必要？**

- LINEプロフィール取得機能を実装した時
- LINEメッセージ送信機能を実装した時
- リッチメニューからの起動を確認したい時
- 実機でのタップ感を確認したい時

**手順:**

### ステップ1: LIFF CLIサーバー起動

```bash
# ターミナル1: Next.js開発サーバー（すでに起動中）
npm run dev

# ターミナル2: LIFF CLIサーバー（追加で起動）
npm run dev:liff
```

**表示される内容:**

```
✔ Starting local proxy server...
✔ Updating LIFF app endpoint URL...
✔ LIFF app endpoint URL updated successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LIFF Development Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  LIFF ID:         2008239543-7vLMjwjj
  Proxy URL:       https://liff-proxy-xxxxx.liff.dev
  Endpoint URL:    https://liff-proxy-xxxxx.liff.dev/liff (updated)

  ✓ Ready! Access your LIFF app from LINE client
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

✅ **この時点で、LINE Developers ConsoleのエンドポイントURLが自動更新されています**

---

### ステップ2: スマホのLINEアプリでアクセス

**方法1: LINEトークから直接アクセス（推奨）**

1. LINEアプリを開く
2. Keep（自分へのメッセージ）を開く
3. 以下のURLを送信:
   ```
   https://liff.line.me/2008239543-7vLMjwjj/test
   ```
4. URLをタップ
5. LIFFアプリが開く

**方法2: リッチメニューから（実装後）**

1. tabiji公式アカウントのトークを開く
2. リッチメニューをタップ
3. LIFFアプリが開く

---

### ステップ3: 動作確認

**確認できること:**

- ✅ 実際のLINEユーザープロフィール（名前、アイコン）
- ✅ LINEメッセージ送信機能
- ✅ 実機でのUI/UX
- ✅ スマホでのタップ感

**コードを修正したら:**

```
1. PCでコードを編集
   ↓
2. 保存
   ↓
3. スマホのLINE画面を引っ張って更新（プルリフレッシュ）
   ↓
4. 変更が反映される
```

---

### ステップ4: 開発終了

両方のターミナルで `Ctrl+C` を押して終了

```bash
# ターミナル1
^C  # Next.js停止

# ターミナル2
^C  # LIFF CLI停止
```

**次回の開発時:**
同じコマンドを実行するだけでOK

---

## 📊 よくある開発パターン

### パターン1: データベース連携機能の開発

**例:** プラン一覧ページ、プラン作成ページ

```bash
# localhost:3000 だけで完結
npm run dev
```

**開発内容:**

- Server Componentでデータ取得
- Server Actionでデータ保存
- Client Componentで削除ボタン
- フォームバリデーション

**確認:**

- ✅ `http://localhost:3000/liff/plans` で動作確認
- ✅ スマホ確認は任意（同じ結果）

**所要時間:** 2-3時間（スマホ確認なし）

---

### パターン2: LIFF機能を含む開発

**例:** ユーザープロフィール表示、LINEシェア機能

**フェーズ1: localhost:3000 でUI作成（90分）**

```bash
npm run dev
```

- UIレイアウト作成
- スタイリング調整
- モックデータで動作確認

**フェーズ2: スマホ（LINE）で実データ確認（10分）**

```bash
npm run dev:liff  # 追加で起動
```

- 実際のLINEプロフィール確認
- メッセージ送信確認
- 実機でのUI確認

**所要時間:** 100分（うちスマホ確認10分）

---

## 🔧 LIFF URLの構造

### 基本構造

```
https://liff.line.me/{LIFF_ID}/{パス}
```

### 主要ページのURL

| ページ       | LIFF URL                                            | 対応するパス     |
| ------------ | --------------------------------------------------- | ---------------- |
| トップページ | `https://liff.line.me/2008239543-7vLMjwjj`          | `/liff`          |
| 動作確認     | `https://liff.line.me/2008239543-7vLMjwjj/test`     | `/liff/test`     |
| プラン一覧   | `https://liff.line.me/2008239543-7vLMjwjj/plans`    | `/liff/plans`    |
| プラン作成   | `https://liff.line.me/2008239543-7vLMjwjj/plan/new` | `/liff/plan/new` |
| プラン詳細   | `https://liff.line.me/2008239543-7vLMjwjj/plan/123` | `/liff/plan/123` |

---

## 🎯 機能別の確認方法

### localhost:3000 だけでOKな機能

- [ ] Supabaseからデータ取得
- [ ] Supabaseへデータ保存
- [ ] Server Actions
- [ ] フォーム処理
- [ ] ページ遷移
- [ ] スタイリング調整
- [ ] アニメーション
- [ ] バリデーション

**確認方法:**

```bash
npm run dev
# → http://localhost:3000/liff/xxx で確認
```

---

### スマホ（LINE）確認が必要な機能

- [ ] LINEプロフィール取得
- [ ] LINEメッセージ送信
- [ ] LIFFウィンドウを閉じる
- [ ] リッチメニューからの起動
- [ ] 実機でのタップ感
- [ ] 実機でのUI最終確認

**確認方法:**

```bash
npm run dev        # ターミナル1
npm run dev:liff   # ターミナル2
# → スマホのLINEアプリでアクセス
```

---

## 💡 便利なTips

### Tip 1: LIFF URLを素早く送信

**方法1: PCからAirDrop**

1. PCでLIFF URLをコピー
2. AirDropでiPhoneに送信
3. iPhoneで受け取ってLINEに貼り付け

**方法2: メモに保存**
Keep（自分へのメッセージ）によく使うURLを保存しておく:

```
動作確認: https://liff.line.me/2008239543-7vLMjwjj/test
プラン一覧: https://liff.line.me/2008239543-7vLMjwjj/plans
プラン作成: https://liff.line.me/2008239543-7vLMjwjj/plan/new
```

---

### Tip 2: LIFF Inspector（デバッグツール）

**使い方:**

1. LINEアプリでLIFFページを開く
2. 画面を素早く3回タップ
3. LIFF Inspectorが表示される

**機能:**

- Console Logs: `console.log()`の出力
- Network Requests: APIリクエストの監視
- LIFF API Calls: LIFF SDKの呼び出し履歴
- Error Messages: エラーの詳細

---

### Tip 3: ターミナルを分割して効率化

**VS Code:**

1. ターミナルを開く
2. `Cmd+\` でターミナルを分割
3. 左側: `npm run dev`
4. 右側: `npm run dev:liff`（必要時のみ）

**iTerm2:**

1. `Cmd+D` で縦分割
2. `Cmd+Shift+D` で横分割

---

## 🔄 1日の開発例

### 午前（9:00-12:00）

```bash
npm run dev
```

**開発内容:**

- プラン一覧ページのUI作成
- プラン詳細ページのレイアウト
- フォームコンポーネント作成

**確認:** localhost:3000 のみ

---

### 午後（13:00-17:00）

```bash
npm run dev  # 継続
```

**開発内容:**

- Server Action実装
- DBへの保存処理
- バリデーション実装
- エラーハンドリング

**確認:** localhost:3000 のみ

---

### 夕方（17:00-17:30）

```bash
npm run dev        # ターミナル1（継続）
npm run dev:liff   # ターミナル2（追加）
```

**確認内容:**

- スマホでプラン一覧を確認
- 実機でタップ感を確認
- リッチメニューからの起動確認
- LINEシェア機能の動作確認

---

## ❓ よくある質問

### Q1: 毎回 `npm run dev:liff` が必要？

**A:** いいえ、LIFF機能（プロフィール取得など）を確認する時だけです。

通常のDB連携やUI開発は `npm run dev` だけでOKです。

---

### Q2: localhost:3000 とスマホで表示が違う？

**A:** UIやDBデータは同じです。

違うのは**LIFF SDK機能だけ**です:

- localhost:3000: モックデータ
- スマホ（LINE）: 実際のLINEデータ

---

### Q3: ngrokは使わない？

**A:** はい、LIFF CLIがngrokの代わりになります。

`npm run dev:liff` を実行すると:

- ✅ HTTPSプロキシサーバー起動
- ✅ エンドポイントURL自動更新
- ✅ LINE Developers Console自動設定

ngrokは不要です。

---

### Q4: 開発終了時に何かする必要は？

**A:** 両方のターミナルで `Ctrl+C` を押すだけです。

次回も同じコマンドを実行すればOKです。

---

## 📚 関連ドキュメント

- [LIFF統合実装ガイド](./liff-integration-guide.md) - 全体的な実装詳細
- [開発ガイド](../CLAUDE.md) - プロジェクト全体の開発方針

---

## ✅ チェックリスト

### 毎回の開発開始時

- [ ] `npm run dev` でNext.js起動
- [ ] `http://localhost:3000/liff/xxx` で開発
- [ ] コード編集 → 保存 → 自動リロード → 確認

### LIFF機能確認が必要な時のみ

- [ ] `npm run dev:liff` でLIFF CLIサーバー起動
- [ ] スマホのLINEアプリでLIFF URLにアクセス
- [ ] 実際のLINE機能を確認
- [ ] 開発終了時に両方のターミナルで `Ctrl+C`

---

**まとめ:** 基本は `npm run dev` だけ。LIFF機能確認時のみ `npm run dev:liff` を追加。シンプル！ 🎉
