import { Client } from '@line/bot-sdk'
import { lineMessaging } from '@/lib/line/messaging'

// LINE Bot SDK の Client をモック化
jest.mock('@line/bot-sdk', () => ({
  Client: jest.fn(),
}))

describe('lineMessaging', () => {
  let mockClient: {
    replyMessage: jest.Mock
    pushMessage: jest.Mock
    getProfile: jest.Mock
  }

  const originalEnv = process.env

  beforeEach(() => {
    // 環境変数を設定
    process.env = {
      ...originalEnv,
      LINE_CHANNEL_ACCESS_TOKEN: 'test-access-token',
      LINE_CHANNEL_SECRET: 'test-channel-secret',
    }

    // モッククライアントの作成
    mockClient = {
      replyMessage: jest.fn().mockResolvedValue({}),
      pushMessage: jest.fn().mockResolvedValue({}),
      getProfile: jest.fn().mockResolvedValue({
        userId: 'U123456789',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/picture.jpg',
        statusMessage: 'Hello',
      }),
    }

    // Client コンストラクタのモック
    ;(Client as jest.MockedClass<typeof Client>).mockImplementation(
      () => mockClient as unknown as Client
    )

    // console.error のモック化（エラーログを抑制）
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  describe('replyText', () => {
    it('テキストメッセージを正しく返信する', async () => {
      const replyToken = 'test-reply-token'
      const text = 'こんにちは'

      await lineMessaging.replyText(replyToken, text)

      expect(mockClient.replyMessage).toHaveBeenCalledWith(replyToken, {
        type: 'text',
        text,
      })
      expect(mockClient.replyMessage).toHaveBeenCalledTimes(1)
    })

    it('無効なReply Token（400エラー）時にエラーをスローする', async () => {
      const error = { statusCode: 400, message: 'Invalid reply token' }
      mockClient.replyMessage.mockRejectedValueOnce(error)

      await expect(
        lineMessaging.replyText('invalid-token', 'test')
      ).rejects.toEqual(error)

      expect(console.error).toHaveBeenCalledWith(
        'Invalid reply token:',
        error
      )
    })

    it('ユーザーブロック時（403エラー）にエラーをスローする', async () => {
      const error = { statusCode: 403, message: 'User blocked' }
      mockClient.replyMessage.mockRejectedValueOnce(error)

      await expect(
        lineMessaging.replyText('test-token', 'test')
      ).rejects.toEqual(error)

      expect(console.error).toHaveBeenCalledWith('User blocked the bot:', error)
    })
  })

  describe('pushText', () => {
    it('テキストメッセージを正しくPushする', async () => {
      const userId = 'U123456789'
      const text = 'プラン作成完了しました'

      await lineMessaging.pushText(userId, text)

      expect(mockClient.pushMessage).toHaveBeenCalledWith(userId, {
        type: 'text',
        text,
      })
      expect(mockClient.pushMessage).toHaveBeenCalledTimes(1)
    })

    it('ユーザーブロック時（403エラー）にエラーをスローする', async () => {
      const error = { statusCode: 403, message: 'User blocked' }
      mockClient.pushMessage.mockRejectedValueOnce(error)

      await expect(
        lineMessaging.pushText('U123456789', 'test')
      ).rejects.toEqual(error)

      expect(console.error).toHaveBeenCalledWith('User blocked the bot:', error)
    })
  })

  describe('replyMessages', () => {
    it('複数メッセージを正しく返信する', async () => {
      const replyToken = 'test-reply-token'
      const messages = [
        { type: 'text' as const, text: 'メッセージ1' },
        { type: 'text' as const, text: 'メッセージ2' },
      ]

      await lineMessaging.replyMessages(replyToken, messages)

      expect(mockClient.replyMessage).toHaveBeenCalledWith(replyToken, messages)
      expect(mockClient.replyMessage).toHaveBeenCalledTimes(1)
    })

    it('無効なReply Token（400エラー）時にエラーをスローする', async () => {
      const error = { statusCode: 400, message: 'Invalid reply token' }
      mockClient.replyMessage.mockRejectedValueOnce(error)

      await expect(
        lineMessaging.replyMessages('invalid-token', [
          { type: 'text', text: 'test' },
        ])
      ).rejects.toEqual(error)

      expect(console.error).toHaveBeenCalledWith(
        'Invalid reply token:',
        error
      )
    })
  })

  describe('pushMessages', () => {
    it('複数メッセージを正しくPushする', async () => {
      const userId = 'U123456789'
      const messages = [
        { type: 'text' as const, text: 'メッセージ1' },
        { type: 'text' as const, text: 'メッセージ2' },
      ]

      await lineMessaging.pushMessages(userId, messages)

      expect(mockClient.pushMessage).toHaveBeenCalledWith(userId, messages)
      expect(mockClient.pushMessage).toHaveBeenCalledTimes(1)
    })

    it('ユーザーブロック時（403エラー）にエラーをスローする', async () => {
      const error = { statusCode: 403, message: 'User blocked' }
      mockClient.pushMessage.mockRejectedValueOnce(error)

      await expect(
        lineMessaging.pushMessages('U123456789', [
          { type: 'text', text: 'test' },
        ])
      ).rejects.toEqual(error)

      expect(console.error).toHaveBeenCalledWith('User blocked the bot:', error)
    })
  })

  describe('getProfile', () => {
    it('ユーザープロフィールを正しく取得する', async () => {
      const userId = 'U123456789'

      const profile = await lineMessaging.getProfile(userId)

      expect(mockClient.getProfile).toHaveBeenCalledWith(userId)
      expect(profile).toEqual({
        userId: 'U123456789',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/picture.jpg',
        statusMessage: 'Hello',
      })
    })

    it('エラー時にエラーをスローする', async () => {
      const error = new Error('Failed to get profile')
      mockClient.getProfile.mockRejectedValueOnce(error)

      await expect(lineMessaging.getProfile('U123456789')).rejects.toThrow(
        'Failed to get profile'
      )

      expect(console.error).toHaveBeenCalledWith(
        'Failed to get user profile:',
        error
      )
    })
  })

  describe('環境変数が未設定の場合', () => {
    it('LINE_CHANNEL_ACCESS_TOKEN が未設定の場合にエラーをスローする', async () => {
      delete process.env.LINE_CHANNEL_ACCESS_TOKEN

      await expect(
        lineMessaging.replyText('test-token', 'test')
      ).rejects.toThrow(
        'LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET must be set in environment variables'
      )
    })

    it('LINE_CHANNEL_SECRET が未設定の場合にエラーをスローする', async () => {
      delete process.env.LINE_CHANNEL_SECRET

      await expect(
        lineMessaging.replyText('test-token', 'test')
      ).rejects.toThrow(
        'LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET must be set in environment variables'
      )
    })
  })
})
