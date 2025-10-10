import type { FollowEvent } from '@line/bot-sdk'
import { lineMessaging } from '@/lib/line/messaging'

/**
 * フォローイベントを処理
 *
 * ユーザーがBotを友だち追加した時に呼ばれます。
 * ウェルカムメッセージを送信し、tabijiの使い方を案内します。
 *
 * @param event - LINE Followイベント
 *
 * @example
 * ```typescript
 * await handleFollowEvent(event)
 * ```
 */
export async function handleFollowEvent(event: FollowEvent): Promise<void> {
  const userId = event.source.userId

  if (!userId) {
    console.error('User ID not found in follow event')
    return
  }

  console.log('Follow event received:', {
    userId,
    timestamp: event.timestamp,
  })

  // ウェルカムメッセージを作成
  const welcomeMessage = `tabijiへようこそ!🎉

このBotでは、友達との旅行プランを簡単に作成・管理できます。

📝 使い方
1. 「プラン作成」と送信
2. 日程とエリアを選択
3. 行きたいスポットを選択
4. 自動で最適なルートを生成!

さっそく「プラン作成」と送ってみてください✨`

  // ウェルカムメッセージを送信
  try {
    await lineMessaging.replyText(event.replyToken, welcomeMessage)
    console.log(`Sent welcome message to user: ${userId}`)
  } catch (error) {
    console.error('Failed to send welcome message:', error)
    // エラーが発生してもスローしない（LINEへのWebhook応答は既に返しているため）
  }
}
