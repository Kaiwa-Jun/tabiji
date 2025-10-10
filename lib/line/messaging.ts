import { Client, TextMessage, FlexMessage } from '@line/bot-sdk'

/**
 * LINE Messaging API クライアント
 *
 * LINE Bot SDK を使用してメッセージを送信します。
 * 環境変数からチャネルアクセストークンとシークレットを取得します。
 */
const createLineClient = (): Client => {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const channelSecret = process.env.LINE_CHANNEL_SECRET

  if (!channelAccessToken || !channelSecret) {
    throw new Error(
      'LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET must be set in environment variables'
    )
  }

  return new Client({
    channelAccessToken,
    channelSecret,
  })
}

/**
 * LINE Messaging API ラッパー
 *
 * メッセージ送信・プロフィール取得などの機能を提供します。
 *
 * @example
 * ```typescript
 * import { lineMessaging } from '@/lib/line/messaging'
 *
 * // Reply API（イベント応答）
 * await lineMessaging.replyText(replyToken, 'こんにちは')
 *
 * // Push API（任意のタイミング）
 * await lineMessaging.pushText(userId, 'プラン作成完了しました')
 * ```
 */
export const lineMessaging = {
  /**
   * Reply APIでテキストメッセージを送信
   *
   * Webhookイベントに対する応答としてテキストメッセージを送信します。
   * Reply Tokenは1回のみ使用可能です。
   *
   * @param replyToken - Webhookイベントから取得したReply Token
   * @param text - 送信するテキスト
   * @throws 無効なReply Token（400エラー）、ユーザーブロック（403エラー）など
   *
   * @example
   * ```typescript
   * await lineMessaging.replyText(event.replyToken, 'メッセージを受信しました')
   * ```
   */
  async replyText(replyToken: string, text: string): Promise<void> {
    try {
      const client = createLineClient()
      const message: TextMessage = {
        type: 'text',
        text,
      }

      await client.replyMessage(replyToken, message)
    } catch (error) {
      // エラーハンドリング
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode

        if (statusCode === 400) {
          console.error('Invalid reply token:', error)
        } else if (statusCode === 403) {
          console.error('User blocked the bot:', error)
        } else {
          console.error('Failed to reply text message:', error)
        }
      } else {
        console.error('Failed to reply text message:', error)
      }

      throw error
    }
  },

  /**
   * Push APIでテキストメッセージを送信
   *
   * 任意のタイミングでユーザーにテキストメッセージを送信します。
   * User IDは永続的に使用可能です。
   *
   * @param userId - LINE User ID
   * @param text - 送信するテキスト
   * @throws ユーザーブロック（403エラー）など
   *
   * @example
   * ```typescript
   * await lineMessaging.pushText(userId, '旅行前日のリマインダーです')
   * ```
   */
  async pushText(userId: string, text: string): Promise<void> {
    try {
      const client = createLineClient()
      const message: TextMessage = {
        type: 'text',
        text,
      }

      await client.pushMessage(userId, message)
    } catch (error) {
      // エラーハンドリング
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode

        if (statusCode === 403) {
          console.error('User blocked the bot:', error)
        } else {
          console.error('Failed to push text message:', error)
        }
      } else {
        console.error('Failed to push text message:', error)
      }

      throw error
    }
  },

  /**
   * Reply APIで複数メッセージを送信
   *
   * Webhookイベントに対する応答として複数のメッセージを送信します。
   * 最大5件まで送信可能です。
   *
   * @param replyToken - Webhookイベントから取得したReply Token
   * @param messages - 送信するメッセージ配列（TextMessage、FlexMessageなど）
   * @throws 無効なReply Token（400エラー）、ユーザーブロック（403エラー）など
   *
   * @example
   * ```typescript
   * await lineMessaging.replyMessages(event.replyToken, [
   *   { type: 'text', text: 'メッセージ1' },
   *   { type: 'text', text: 'メッセージ2' },
   * ])
   * ```
   */
  async replyMessages(
    replyToken: string,
    messages: (TextMessage | FlexMessage)[]
  ): Promise<void> {
    try {
      const client = createLineClient()
      await client.replyMessage(replyToken, messages)
    } catch (error) {
      // エラーハンドリング
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode

        if (statusCode === 400) {
          console.error('Invalid reply token:', error)
        } else if (statusCode === 403) {
          console.error('User blocked the bot:', error)
        } else {
          console.error('Failed to reply messages:', error)
        }
      } else {
        console.error('Failed to reply messages:', error)
      }

      throw error
    }
  },

  /**
   * Push APIで複数メッセージを送信
   *
   * 任意のタイミングでユーザーに複数のメッセージを送信します。
   * 最大5件まで送信可能です。
   *
   * @param userId - LINE User ID
   * @param messages - 送信するメッセージ配列（TextMessage、FlexMessageなど）
   * @throws ユーザーブロック（403エラー）など
   *
   * @example
   * ```typescript
   * await lineMessaging.pushMessages(userId, [
   *   { type: 'text', text: 'プラン作成完了' },
   *   flexMessage, // Flex Message
   * ])
   * ```
   */
  async pushMessages(
    userId: string,
    messages: (TextMessage | FlexMessage)[]
  ): Promise<void> {
    try {
      const client = createLineClient()
      await client.pushMessage(userId, messages)
    } catch (error) {
      // エラーハンドリング
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode

        if (statusCode === 403) {
          console.error('User blocked the bot:', error)
        } else {
          console.error('Failed to push messages:', error)
        }
      } else {
        console.error('Failed to push messages:', error)
      }

      throw error
    }
  },

  /**
   * ユーザープロフィールを取得
   *
   * LINE User IDからユーザーの表示名、プロフィール画像、ステータスメッセージを取得します。
   *
   * @param userId - LINE User ID
   * @returns ユーザープロフィール（displayName、userId、pictureUrl、statusMessage）
   * @throws ユーザーが存在しない、ブロック中など
   *
   * @example
   * ```typescript
   * const profile = await lineMessaging.getProfile(userId)
   * console.log(`User: ${profile.displayName}`)
   * ```
   */
  async getProfile(userId: string) {
    try {
      const client = createLineClient()
      return await client.getProfile(userId)
    } catch (error) {
      console.error('Failed to get user profile:', error)
      throw error
    }
  },
}
