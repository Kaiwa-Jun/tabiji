import { NextRequest, NextResponse } from 'next/server'
import { validateSignature } from '@/lib/line/validate'
import { handleFollowEvent } from '@/lib/line/handlers/follow'
import { handleMessageEvent } from '@/lib/line/handlers/message'
import type { WebhookEvent } from '@line/bot-sdk'

/**
 * LINE Bot Webhook エンドポイント
 *
 * LINE Platformから送信されるWebhookイベントを受信・処理します。
 * - 署名検証による正規性チェック
 * - イベントタイプ別の処理振り分け
 * - 10秒以内のレスポンス要件への対応
 *
 * @see https://developers.line.biz/ja/docs/messaging-api/receiving-messages/
 */
export async function POST(request: NextRequest) {
  try {
    // 1. リクエストボディとヘッダーを取得
    const body = await request.text()
    const signature = request.headers.get('x-line-signature')

    // 2. 署名ヘッダーの存在チェック
    if (!signature) {
      console.error('No signature header provided')
      return NextResponse.json({ error: 'No signature' }, { status: 401 })
    }

    // 3. 署名検証
    const channelSecret = process.env.LINE_CHANNEL_SECRET
    if (!channelSecret) {
      console.error('LINE_CHANNEL_SECRET is not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const isValid = validateSignature(body, signature, channelSecret)
    if (!isValid) {
      console.error('Invalid signature detected')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 4. イベントデータをパース
    const data = JSON.parse(body)
    const events: WebhookEvent[] = data.events

    console.log(`Received ${events.length} webhook event(s)`)

    // 5. 各イベントを非同期処理（LINEの10秒制限対応）
    // イベント処理を待たずに即座に200を返す
    events.forEach((event) => handleEvent(event).catch(console.error))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    // LINEの再送を防ぐため、エラーでも200を返す
    return NextResponse.json({ success: false }, { status: 200 })
  }
}

/**
 * Webhookイベントを処理
 *
 * イベントタイプに応じて適切なハンドラーに振り分けます。
 *
 * @param event - LINE Webhookイベント
 */
async function handleEvent(event: WebhookEvent): Promise<void> {
  console.log('Processing event:', {
    type: event.type,
    timestamp: event.timestamp,
    mode: event.mode,
  })

  switch (event.type) {
    case 'message':
      await handleMessageEvent(event)
      break

    case 'follow':
      await handleFollowEvent(event)
      break

    case 'unfollow':
      console.log('Unfollow event received:', {
        userId: event.source.userId,
      })
      // アンフォローイベント処理（将来実装）
      break

    case 'postback':
      console.log('Postback event received:', {
        data: event.postback.data,
        userId: event.source.userId,
      })
      // ポストバックイベント処理（#26で実装）
      break

    case 'join':
      console.log('Join event received:', {
        source: event.source,
      })
      // グループ参加イベント処理（#26で実装）
      break

    case 'leave':
      console.log('Leave event received:', {
        source: event.source,
      })
      // グループ退出イベント処理（#26で実装）
      break

    default:
      console.log('Unhandled event type:', event.type)
      break
  }
}

