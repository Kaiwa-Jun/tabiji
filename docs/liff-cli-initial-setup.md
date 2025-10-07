# LIFF CLI 初回セットアップガイド

## 📋 概要

このドキュメントは、LIFF CLI の**初回セットアップ手順**をまとめたものです。
**一度だけ実行すれば、以降は不要です。**

セットアップ後の日常的な開発については、[LIFF開発ワークフロー](./liff-development-workflow.md) を参照してください。

---

## 🔧 セットアップ手順

### ステップ1: ツールのインストール

**1-1. mkcertのインストール（SSL証明書作成ツール）**

```bash
# macOS
brew install mkcert

# インストール確認
mkcert --version
```

**1-2. LIFF CLIのインストール**

```bash
# グローバルインストール
npm install -g @line/liff-cli

# インストール確認
liff-cli --version
```

---

### ステップ2: SSL証明書の作成

ローカル開発でHTTPSを使用するため、信頼されたSSL証明書を作成します。

```bash
# ローカルCAをシステムにインストール
mkcert -install

# localhost用の証明書を作成
mkcert localhost
```

**作成されるファイル:**

- `localhost.pem`: 証明書
- `localhost-key.pem`: 秘密鍵

これらのファイルは自動的に保存されます（使用時に自動参照されます）。

---

### ステップ3: LINE Channel情報を取得

LINE Developers Consoleから必要な情報を取得します。

#### 3-1. Channel IDの確認

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. Provider「tabiji」を選択
3. Channel「tabiji-liff」を選択
4. 「Basic settings」タブを開く
5. **Channel ID** をメモ（例: `2008239543`）

#### 3-2. Channel Secretの確認

1. 同じ画面で下にスクロール
2. **Channel secret** の「Show」をクリック
3. 表示された値をメモ（次のステップで使用）

---

### ステップ4: LIFF CLIにChannelを登録

```bash
# Channel登録コマンド
liff-cli channel add 2008239543
```

**プロンプトが表示されます:**

```
? Enter the channel secret:
```

→ ステップ3-2でメモした**Channel Secret**を貼り付けてEnter

**成功時の表示:**

```
✔ Channel added successfully
```

---

### ステップ5: デフォルトChannelの設定

```bash
# デフォルトChannel設定
liff-cli channel use 2008239543
```

**成功時の表示:**

```
✔ Default channel set to 2008239543
```

---

### ステップ6: package.jsonにスクリプト追加

プロジェクトの`package.json`に開発用スクリプトを追加します。

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "dev:liff": "liff-cli serve --liff-id 2008239543-7vLMjwjj --url https://localhost:3000 --inspect"
  }
}
```

**パラメータ説明:**

- `--liff-id`: LIFF ID（`2008239543-7vLMjwjj`）
- `--url`: ローカル開発サーバーのURL（必ずHTTPS）
- `--inspect`: LIFF Inspectorを有効化（デバッグツール）

---

## ✅ セットアップ完了確認

以下のコマンドを実行して動作確認します。

```bash
# ターミナル1
npm run dev

# ターミナル2
npm run dev:liff
```

**ターミナル2の表示:**

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

✅ この表示が出たらセットアップ成功です！

---

## 🎉 セットアップ完了！

これで初回セットアップは完了です。

**次のステップ:**
[LIFF開発ワークフロー](./liff-development-workflow.md) を読んで、日常的な開発を開始してください。

---

## ❓ トラブルシューティング

### 問題1: `mkcert: command not found`

**解決策:**

```bash
brew install mkcert
```

---

### 問題2: `liff-cli: command not found`

**解決策:**

```bash
npm install -g @line/liff-cli

# それでも解決しない場合、PATHを確認
echo $PATH | grep npm
```

---

### 問題3: `Error: Channel not found`

**解決策:**

```bash
# Channelを再登録
liff-cli channel add 2008239543
```

---

### 問題4: `Error: Invalid channel secret`

**原因:** Channel Secretが間違っている

**解決策:**

1. LINE Developers Consoleで正しいChannel Secretを確認
2. Channelを削除して再登録

```bash
liff-cli channel remove 2008239543
liff-cli channel add 2008239543
```

---

## 🔒 セキュリティ

### Channel Secretの保存場所

LIFF CLIはChannel Secretを以下に保存します:

```
~/.liff-cli/config.json
```

**注意:**

- このファイルは**ローカルのみ**に存在
- Gitにコミットされない
- プロジェクトディレクトリ外なので安全

---

## 📚 参考リンク

- [LIFF CLI公式ドキュメント](https://developers.line.biz/en/docs/liff/liff-cli/)
- [mkcert GitHub](https://github.com/FiloSottile/mkcert)
- [LIFF開発ワークフロー](./liff-development-workflow.md)
