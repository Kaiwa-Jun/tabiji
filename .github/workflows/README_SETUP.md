# Claude Code PRレビュー自動化 - セットアップ手順

## 必要な設定

### 1. Claude Code OAuth Tokenの取得と設定

1. **Claude Codeでトークンを生成**:
   ```bash
   claude auth github
   ```
   コマンドを実行してGitHubアカウントと連携し、OAuthトークンを生成

2. **GitHubリポジトリのSecretsに登録**:
   - GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」へ移動
   - 「New repository secret」をクリック
   - 以下の情報を入力:
     - **Name**: `CLAUDE_CODE_OAUTH_TOKEN`
     - **Value**: 取得したOAuthトークン

### 2. 権限の確認

ワークフローが正常に動作するために、以下の権限が必要です（.github/workflows/claude-pr-review.ymlに既に設定済み）:

- `contents: write` - リポジトリコンテンツの読み書き
- `pull-requests: write` - PRへのコメント投稿
- `issues: write` - Issueへのコメント投稿
- `id-token: write` - OIDC認証用
- `actions: read` - CI結果の分析用

### 3. 動作確認

#### PR自動レビュー
1. 新しいブランチを作成してPRを作成
2. 自動的にClaude Codeがレビューを開始
3. レビュー結果がPRにコメントとして投稿される

#### @claudeメンション応答
1. PRまたはIssueにコメントで「@claude」を含めて投稿
2. Claude Codeが自動的に応答

## 機能説明

### 自動PRレビュー（PR作成・更新時）

- **トリガー**: PR作成、再オープン、同期、レビュー準備完了時
- **レビュー内容**:
  - セキュリティ脆弱性のチェック
  - コード品質の評価
  - パフォーマンス問題の検出
  - ベストプラクティスの確認
  - ビジネスロジックの検証

### @claudeメンション応答

- **トリガー**: コメントに「@claude」または「@Claude」を含む
- **対応内容**:
  - コードレビューの詳細化
  - 技術的な質問への回答
  - 実装提案の提供
  - デバッグ支援

## カスタマイズ

### レビュー基準の変更

`.github/workflows/claude-pr-review.yml`のpromptセクションを編集することで、レビュー基準をカスタマイズできます。

### モデルの変更

`claude_args`セクションの`--model`パラメータを変更することで、使用するAIモデルを変更できます:
- `claude-4-0-sonnet-20250805`（現在の設定）
- `claude-opus-4-1-20250805`（より高性能）
- その他利用可能なモデル

### 使用ツールの調整

`--allowedTools`パラメータで、Claude Codeが使用できるツールを制限できます。

## トラブルシューティング

### レビューが実行されない場合

1. Secretsが正しく設定されているか確認
2. ワークフローの権限設定を確認
3. GitHub Actionsタブでワークフローのログを確認

### エラーが発生する場合

- `notify-failure`ジョブが自動的にPRにコメントを投稿
- GitHub Actionsのログで詳細なエラー情報を確認

## 注意事項

- レビューにはトークンのクォータが消費されます
- 大規模なPRの場合、処理時間が長くなる可能性があります
- `ultrathink`キーワードにより、より深い分析が行われます（処理時間が増加する可能性）