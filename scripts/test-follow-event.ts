/**
 * フォローイベントのテストスクリプト
 *
 * ローカル開発環境でフォローイベントをシミュレートします。
 * 実際のLINE Platformからではなく、直接Webhookエンドポイントにリクエストを送信します。
 *
 * 使用方法:
 * ```bash
 * npx tsx scripts/test-follow-event.ts
 * ```
 */

import crypto from 'crypto'

const WEBHOOK_URL = 'http://localhost:3000/api/webhook'

// 環境変数から取得（.env.localを読み込む）
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET

if (!LINE_CHANNEL_SECRET) {
  console.error('❌ LINE_CHANNEL_SECRET が設定されていません')
  console.error('   .env.local を確認してください')
  process.exit(1)
}

// フォローイベントのペイロード
const followEvent = {
  destination: 'Uxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  events: [
    {
      type: 'follow',
      mode: 'active',
      timestamp: Date.now(),
      source: {
        type: 'user',
        userId: 'Utest-user-id-12345',
      },
      replyToken: 'test-reply-token-12345',
      webhookEventId: 'test-webhook-event-id',
      deliveryContext: {
        isRedelivery: false,
      },
    },
  ],
}

// リクエストボディを文字列化
const requestBody = JSON.stringify(followEvent)

// HMAC-SHA256で署名を生成
const signature = crypto
  .createHmac('SHA256', LINE_CHANNEL_SECRET)
  .update(requestBody)
  .digest('base64')

console.log('📤 フォローイベントをWebhookエンドポイントに送信します...')
console.log(`   URL: ${WEBHOOK_URL}`)
console.log(`   User ID: Utest-user-id-12345`)

// Webhookエンドポイントにリクエストを送信
fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-line-signature': signature,
  },
  body: requestBody,
})
  .then((response) => {
    if (response.ok) {
      console.log('✅ リクエスト送信成功!')
      console.log('   ターミナルでログを確認してください')
      console.log('   （実際のLINEアプリには届きません - テストユーザーIDのため）')
    } else {
      console.error(`❌ リクエスト失敗: ${response.status} ${response.statusText}`)
    }
  })
  .catch((error) => {
    console.error('❌ リクエスト送信エラー:', error)
  })
