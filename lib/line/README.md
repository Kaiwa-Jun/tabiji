# LINE Messaging API ラッパー

LINE Messaging API を使用したBot機能のラッパーを配置します。

## ファイル構成

```
line/
├── validate.ts         # ✅ Webhook 署名検証（実装済み）
├── messaging.ts        # ✅ Messaging API ラッパー（実装済み - #26）
├── handlers/           # メッセージハンドラー
│   ├── message.ts      # ✅ メッセージイベントハンドラー（実装済み）
│   └── follow.ts       # ✅ フォローイベントハンドラー（実装済み - #26）
└── flex-messages.ts    # Flex Message テンプレート（将来実装 - #59）
```

## 実装済み機能

### 署名検証 (`validate.ts`)

LINE PlatformからのWebhookリクエストが正規のものかを検証します。

**機能:**

- HMAC-SHA256による署名検証
- チャネルシークレットを使用した検証
- 不正なリクエストの拒否

**使用例:**

```typescript
import { validateSignature } from '@/lib/line/validate'

const body = await request.text()
const signature = request.headers.get('x-line-signature')
const isValid = validateSignature(body, signature, process.env.LINE_CHANNEL_SECRET)
```

**セキュリティ:**

- 空の署名/シークレットは無効として扱う
- ハッシュ生成エラーは無効として扱う
- タイミング攻撃への耐性

**テスト:**

- ✅ 正常系: 正しい署名での検証
- ✅ 異常系: 不正な署名、空の署名、改ざんされたボディ

---

### Messaging APIラッパー (`messaging.ts`)

LINE Messaging APIを使用してメッセージを送信します。

**実装機能:**

- ✅ `replyText()` - Reply APIでテキスト送信
- ✅ `pushText()` - Push APIでテキスト送信
- ✅ `replyMessages()` - 複数メッセージのReply送信
- ✅ `pushMessages()` - 複数メッセージのPush送信
- ✅ `getProfile()` - ユーザープロフィール取得

**使用例:**

```typescript
import { lineMessaging } from '@/lib/line/messaging'

// Reply API（イベント応答）
await lineMessaging.replyText(replyToken, 'こんにちは')

// Push API（任意のタイミング）
await lineMessaging.pushText(userId, 'プラン作成完了しました')
```

**エラーハンドリング:**

- 400エラー: 無効なReply Token
- 403エラー: ユーザーブロック
- その他: サーバーエラー

**セキュリティ:**

- 環境変数から`LINE_CHANNEL_ACCESS_TOKEN`と`LINE_CHANNEL_SECRET`を取得
- 未設定時はエラーをスロー

---

### メッセージハンドラー (`handlers/message.ts`)

LINE ユーザーからのメッセージイベントを処理します。

**サポートメッセージタイプ:**

- ✅ テキストメッセージ
- ✅ 画像メッセージ
- ✅ スタンプメッセージ
- ✅ 位置情報メッセージ
- ✅ ビデオメッセージ
- ✅ 音声メッセージ
- ✅ ファイルメッセージ

**現在の処理:**

- イベント情報のログ出力
- テキストメッセージのエコーバック（テスト用）

**今後の実装:**

- コマンド処理（「プラン作成」「ヘルプ」など）
- LIFF起動メッセージの送信

---

### フォローハンドラー (`handlers/follow.ts`)

ユーザーがBotを友だち追加した時の処理を行います。

**実装機能:**

- ✅ ウェルカムメッセージ送信
- ✅ tabijiの使い方案内
- ✅ エラー時のログ出力

**ウェルカムメッセージ内容:**

- tabijiの紹介
- 基本的な使い方（3ステップ）
- プラン作成の誘導

---

## 実装予定機能

### Flex Message テンプレート (`flex-messages.ts`) - #59

旅行プラン表示用のFlex Messageテンプレート。

**実装予定:**

- プラン詳細表示
- スポット一覧表示
- アクションボタン（編集・削除など）

---

## Webhook動作フロー

```
[LINE Platform]
    ↓ POST /api/webhook
[Next.js API Route]
    ↓ 1. 署名検証 (validate.ts)
    ↓ 2. イベント振り分け
[handleMessageEvent]
    ↓ 3. メッセージ処理 (handlers/message.ts)
    ↓ 4. 応答メッセージ生成（#26で実装）
[LINE Platform]
    ↓
[ユーザーのLINE]
```

---

## 関連ファイル

- **Webhookエンドポイント**: `app/api/webhook/route.ts`
- **テスト**:
  - `__tests__/lib/line/validate.test.ts` - 署名検証テスト
  - `__tests__/lib/line/messaging.test.ts` - メッセージ送信テスト
  - `__tests__/lib/line/handlers/follow.test.ts` - フォローハンドラーテスト
  - `__tests__/app/api/webhook/route.test.ts` - Webhookエンドポイントテスト
- **環境変数**: `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`

---

## トラブルシューティング

### メッセージ送信が失敗する

**原因:**

- 環境変数が未設定
- Reply Tokenが無効（既に使用済み、または有効期限切れ）
- ユーザーがBotをブロック中

**対処法:**

1. `.env.local`に`LINE_CHANNEL_ACCESS_TOKEN`と`LINE_CHANNEL_SECRET`が設定されているか確認
2. Reply Tokenは1回のみ使用可能なため、2回目以降の送信にはPush APIを使用
3. ユーザーブロック時（403エラー）は送信不可、ログを確認

### Reply Token vs User ID

| 項目     | Reply Token            | User ID                          |
| -------- | ---------------------- | -------------------------------- |
| 取得元   | Webhookイベント        | Webhookイベント or LIFF          |
| 有効期限 | **1回のみ使用可能**    | 永続的                           |
| 使用API  | Reply API              | Push API                         |
| 用途     | イベントへの即座の応答 | 任意のタイミングでメッセージ送信 |

### メッセージ送信回数の制限

LINE Messaging APIには月間の無料送信回数制限があります（フリープランの場合）。

- **Reply API**: 無料（無制限）
- **Push API**: 月500通まで無料

できるだけReply APIを使用し、Push APIは必要最小限に。

---

## 参考資料

- [LINE Messaging API ドキュメント](https://developers.line.biz/ja/docs/messaging-api/)
- [Webhook署名検証](https://developers.line.biz/ja/reference/messaging-api/#signature-validation)
- [LINE Bot SDK for Node.js](https://github.com/line/line-bot-sdk-nodejs)
