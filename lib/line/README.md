# LINE Messaging API ラッパー

LINE Messaging API を使用したBot機能のラッパーを配置します。

## ファイル構成

```
line/
├── validate.ts         # ✅ Webhook 署名検証（実装済み）
├── handlers/           # メッセージハンドラー
│   └── message.ts      # ✅ メッセージイベントハンドラー（実装済み）
├── messaging.ts        # Messaging API ラッパー（#26で実装予定）
└── flex-messages.ts    # Flex Message テンプレート（#26で実装予定）
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
- メッセージタイプ別の識別

**今後の実装（#26）:**

- メッセージへの返信機能
- コマンド処理（「プラン作成」「ヘルプ」など）
- LIFF起動メッセージの送信

---

## 実装予定機能

### Messaging API ラッパー (`messaging.ts`) - #26

LINE Messaging APIを使用したメッセージ送信機能。

**実装予定:**

- テキストメッセージ送信
- Flex Message送信
- リプライメッセージ送信
- プッシュメッセージ送信

### Flex Message テンプレート (`flex-messages.ts`) - #26

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
- **テスト**: `__tests__/lib/line/validate.test.ts`
- **環境変数**: `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`

---

## 参考資料

- [LINE Messaging API ドキュメント](https://developers.line.biz/ja/docs/messaging-api/)
- [Webhook署名検証](https://developers.line.biz/ja/reference/messaging-api/#signature-validation)
- [LINE Bot SDK for Node.js](https://github.com/line/line-bot-sdk-nodejs)
