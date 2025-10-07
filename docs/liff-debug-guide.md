# LIFF デバッグガイド

## 📋 概要

このドキュメントは、LIFF SDK統合のデバッグ方法と、実装された強化機能について説明します。

**対応Issue**: #22 LIFF SDK統合（初期化・ラッパー）

---

## 🎯 実装した改善内容

### 1. LIFFモード判定の強化

**ファイル**: `app/liff/liff-provider.tsx`

#### 改善前の問題

- URLパラメータのみでLIFFモードを判定していた
- LINEアプリから直接開いた場合に検出漏れの可能性

#### 改善後の判定ロジック

```typescript
const isLiffMode = () => {
  // 1. 環境変数で強制モード切り替え（デバッグ用）
  if (process.env.NEXT_PUBLIC_FORCE_LIFF_MODE === 'true') return true
  if (process.env.NEXT_PUBLIC_FORCE_LIFF_MODE === 'false') return false

  // 2. URLパラメータチェック
  if (params.has('liff.state') || params.has('code') || params.has('liffClientId')) {
    return true
  }

  // 3. Referrerチェック（LINEから来た場合）
  if (document.referrer.includes('line.me') || document.referrer.includes('liff.line.me')) {
    localStorage.setItem('_tabiji_liff_accessed', 'true')
    return true
  }

  // 4. LocalStorageにLIFFアクセスフラグがある場合
  if (localStorage.getItem('_tabiji_liff_accessed') === 'true') {
    return true
  }

  return false
}
```

**メリット:**

- ✅ より確実なLIFFモード検出
- ✅ リロード後もLIFFモードを維持
- ✅ 環境変数で強制的にモード切り替え可能

---

### 2. デバッグログの強化

#### app/liff/liff-provider.tsx

初期化時に詳細な情報をコンソールに出力:

```typescript
addDebugLog('=== LIFF Provider 初期化開始 ===')
addDebugLog(`URL: ${window.location.href}`)
addDebugLog(`Referrer: ${document.referrer || '(なし)'}`)
addDebugLog(`User Agent: ${navigator.userAgent}`)
addDebugLog(`LIFF ID: ${process.env.NEXT_PUBLIC_LIFF_ID || 'NOT SET'}`)
addDebugLog(`isLiffMode結果: ${liffModeResult}`)
```

エラー時にデバッグ情報を画面表示:

- 詳細なログのタイムスタンプ付き一覧
- クリックで展開可能な`<details>`要素
- キャッシュクリア機能

#### lib/liff/init.ts

LIFF SDK初期化の各ステップでログ出力:

```typescript
console.log('[LIFF Init] =================================')
console.log('[LIFF Init] LIFF SDK初期化処理を開始します')
console.log('[LIFF Init] ✓ ブラウザ環境を確認')
console.log('[LIFF Init] LIFF ID取得:', liffId ? `${liffId.substring(0, 15)}...` : '(未設定)')
console.log('[LIFF Init] liff.init()を呼び出します:', initConfig)
console.log('[LIFF Init] LIFF SDK状態:')
console.log('[LIFF Init] - isInClient():', liff.isInClient())
console.log('[LIFF Init] - getOS():', liff.getOS())
console.log('[LIFF Init] - isLoggedIn():', liff.isLoggedIn())
```

---

### 3. デバッグ専用ページ

**新規作成**: `app/liff/debug/page.tsx`

#### アクセス方法

```
# ローカル開発
http://localhost:3000/liff/debug

# スマホLINEアプリ
https://liff.line.me/2008239543-7vLMjwjj/debug
```

#### 表示される情報

1. **環境変数**
   - `NEXT_PUBLIC_LIFF_ID`
   - `NEXT_PUBLIC_FORCE_LIFF_MODE`
   - `NODE_ENV`

2. **URL情報**
   - 現在のURL
   - Origin、Pathname、Search、Hash
   - URLパラメータ（JSON形式）
   - Referrer

3. **ブラウザ情報**
   - User Agent
   - Language、Platform
   - Cookie有効状態、オンライン状態

4. **LIFF SDK状態**
   - ログイン状態 ✅/❌
   - 実行環境（LINEアプリ内/外部ブラウザ）
   - SDKバージョン
   - アクセストークン（冒頭20文字）
   - ユーザープロフィール（表示名、ID、画像）
   - IDトークン（JWT）

5. **LocalStorage**
   - `_tabiji_liff_accessed`フラグ
   - 保存アイテム数
   - すべてのキー一覧

#### アクション

- 📋 **デバッグ情報をコピー**: JSON形式でクリップボードにコピー
- 🔄 **再読み込み**: ページをリロード
- 🗑️ **LIFFキャッシュをクリア**: LocalStorageのLIFFフラグを削除

---

### 4. package.jsonの修正

**変更内容**:

```diff
- "dev:liff": "liff-cli serve --liff-id 2008239543-7vLMjwjj --url http://localhost:3000 --inspect"
+ "dev:liff": "liff-cli serve --liff-id 2008239543-7vLMjwjj --url https://localhost:3000 --inspect"
```

**理由**: LIFF CLIはHTTPSが推奨されており、ドキュメントとの整合性を確保

---

## 🔍 デバッグ手順

### ステップ1: ローカルで基本確認

```bash
npm run dev
```

ブラウザで開く: `http://localhost:3000/liff/test`

**確認項目:**

- ✅ ページが正常に表示される（LIFF初期化はスキップされる）
- ✅ コンソールに「開発モード（LIFF初期化をスキップ）」と表示される
- ✅ モックプロフィールが表示される

### ステップ2: デバッグページで環境確認

ブラウザで開く: `http://localhost:3000/liff/debug`

**確認項目:**

- ✅ `NEXT_PUBLIC_LIFF_ID`が正しく設定されている
- ✅ ブラウザ情報が表示される
- ✅ LIFF SDK状態が「未ログイン」「外部ブラウザ」になっている

### ステップ3: LIFF CLIで実機テスト

```bash
# ターミナル1
npm run dev

# ターミナル2
npm run dev:liff
```

**ターミナル2の確認:**

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

### ステップ4: スマホLINEアプリでアクセス

1. LINEアプリを開く
2. Keep（自分へのメッセージ）に以下のURLを送信:
   ```
   https://liff.line.me/2008239543-7vLMjwjj/test
   ```
3. URLをタップしてLIFFアプリを開く

### ステップ5: LIFF Inspectorでログ確認

1. **LIFF Inspectorを開く**
   - 画面を素早く3回タップ
   - LIFF Inspectorが表示される

2. **Console Logsタブを確認**

   ```
   [LIFF Mode] ReferrerによりLIFFモードを検出: https://liff.line.me
   [12:34:56] === LIFF Provider 初期化開始 ===
   [12:34:56] URL: https://liff-proxy-xxxxx.liff.dev/test
   [12:34:56] Referrer: https://liff.line.me/...
   [12:34:56] LIFF ID: 2008239543-7vLM...
   [12:34:56] isLiffMode結果: true
   [LIFF Init] =================================
   [LIFF Init] LIFF SDK初期化処理を開始します
   [LIFF Init] ✓ ブラウザ環境を確認
   [LIFF Init] ✓ LIFF ID確認完了
   [LIFF Init] ✓ liff.init()成功
   [LIFF Init] - isInClient(): true
   [LIFF Init] - isLoggedIn(): true
   [LIFF Init] 🎉 LIFF初期化完了!
   ```

3. **エラーがある場合**
   - エラーメッセージをスクリーンショット
   - `/liff/debug`ページを開いて環境情報をスクリーンショット
   - Issue #22にエラー内容を報告

### ステップ6: デバッグページで詳細確認

スマホLINEアプリで開く:

```
https://liff.line.me/2008239543-7vLMjwjj/debug
```

**確認項目:**

- ✅ ログイン状態: 「ログイン済み ✅」
- ✅ 実行環境: 「LINEアプリ内 📱」
- ✅ ユーザープロフィール: 実際のLINE名前・アイコンが表示
- ✅ LocalStorage: `_tabiji_liff_accessed: "true"`

**デバッグ情報をコピーして保存**:

1. 「📋 デバッグ情報をコピー」ボタンをタップ
2. メモアプリに貼り付けて保存
3. 必要に応じてIssueに報告

---

## 🚨 トラブルシューティング

### 問題1: LIFFが初期化されない

**症状:**

- ローディング画面のまま進まない
- エラーメッセージが表示されない

**解決方法:**

1. LIFF Inspectorでコンソールログを確認
2. `/liff/debug`ページで環境変数を確認
3. `NEXT_PUBLIC_LIFF_ID`が正しく設定されているか確認

### 問題2: 「LIFF ID is not defined」エラー

**原因:** 環境変数が設定されていない

**解決方法:**

```bash
# .env.local を確認
cat .env.local | grep LIFF

# 出力例:
NEXT_PUBLIC_LIFF_ID=2008239543-7vLMjwjj
```

なければ追加:

```bash
echo "NEXT_PUBLIC_LIFF_ID=2008239543-7vLMjwjj" >> .env.local
```

開発サーバーを再起動:

```bash
# Ctrl+C で停止してから
npm run dev
```

### 問題3: ログイン後にリダイレクトループ

**原因:** LocalStorageのフラグが破損している可能性

**解決方法:**

1. `/liff/debug`ページを開く
2. 「🗑️ LIFFキャッシュをクリア」ボタンをタップ
3. 再度アクセス

または、LIFF Inspectorから:

```javascript
localStorage.removeItem('_tabiji_liff_accessed')
location.reload()
```

### 問題4: プロフィールが取得できない

**症状:**

- モックプロフィール（「テストユーザー」）が表示される
- 実際のLINEプロフィールが表示されない

**確認項目:**

1. LIFF Inspectorで`liff.isLoggedIn()`を確認
2. `/liff/debug`ページで「ログイン状態」を確認
3. アクセストークンが取得できているか確認

**解決方法:**

```javascript
// LIFF Inspectorから手動でログイン
liff.login()
```

---

## 🎯 デバッグのベストプラクティス

### 1. 段階的な確認

```
localhost:3000 (PC開発)
  ↓ UI/DBは問題ない
npm run dev:liff (LIFF CLI)
  ↓ LIFF CLIは起動できた
スマホLINEアプリ
  ↓ ここでエラー → LIFF Inspector + /liff/debug で調査
```

### 2. ログの活用

**開発時は常にコンソールを確認:**

- Chrome DevTools（PC）
- LIFF Inspector（スマホ）

**重要なログパターン:**

```
[LIFF Mode] → LIFFモード判定の結果
[LIFF Provider] → Provider側の初期化状態
[LIFF Init] → LIFF SDK初期化の詳細
[LIFF Mock] → モックデータが使用された場合
```

### 3. デバッグページの活用

**定期的に確認:**

- 環境変数が正しいか
- LIFF SDKの状態
- LocalStorageの内容

**エラー発生時:**

- デバッグ情報をコピー
- スクリーンショットを保存
- Issueに報告

---

## 📚 関連ドキュメント

- [LIFF開発ワークフロー](./liff-development-workflow.md) - 日常的な開発手順
- [LIFF CLI初回セットアップ](./liff-cli-initial-setup.md) - 初回セットアップ手順
- [開発ガイド](../CLAUDE.md) - プロジェクト全体の開発方針

---

## ✅ Issue #22 完了条件

- [x] `@line/liff`パッケージがインストールされている
- [x] `lib/liff/init.ts`が実装されている
- [x] `lib/liff/client.ts`が実装されている
- [x] `app/liff/layout.tsx`でLIFF初期化が行われている
- [ ] **LIFFブラウザで開いたときにエラーなく動作する** ← 次のステップ
- [ ] **`liff.getProfile()`でユーザー情報が取得できる** ← 次のステップ

**次のアクション:**

1. スマホLINEアプリで実際にアクセス
2. LIFF Inspectorでログを確認
3. `/liff/debug`でデバッグ情報を確認
4. 問題があればこのガイドに従ってデバッグ
5. すべて正常に動作したらIssue #22をクローズ

---

**このドキュメントは、LIFF SDK統合のデバッグを支援するために作成されました。**
