import type { FollowEvent } from '@line/bot-sdk'
import { handleFollowEvent } from '@/lib/line/handlers/follow'
import { lineMessaging } from '@/lib/line/messaging'

// lineMessaging をモック化
jest.mock('@/lib/line/messaging', () => ({
  lineMessaging: {
    replyText: jest.fn(),
  },
}))

describe('handleFollowEvent', () => {
  const mockReplyText = lineMessaging.replyText as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    // console のモック化（ログ出力を抑制）
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('ウェルカムメッセージを正しく送信する', async () => {
    const mockEvent: FollowEvent = {
      type: 'follow',
      mode: 'active',
      timestamp: 1234567890,
      source: {
        type: 'user',
        userId: 'U123456789',
      },
      replyToken: 'test-reply-token',
      webhookEventId: 'test-webhook-event-id',
      deliveryContext: {
        isRedelivery: false,
      },
    }

    mockReplyText.mockResolvedValueOnce(undefined)

    await handleFollowEvent(mockEvent)

    // ウェルカムメッセージが送信されたか確認
    expect(mockReplyText).toHaveBeenCalledWith(
      'test-reply-token',
      expect.stringContaining('tabijiへようこそ')
    )
    expect(mockReplyText).toHaveBeenCalledWith(
      'test-reply-token',
      expect.stringContaining('使い方')
    )
    expect(mockReplyText).toHaveBeenCalledWith(
      'test-reply-token',
      expect.stringContaining('プラン作成')
    )

    // ログが出力されたか確認
    expect(console.log).toHaveBeenCalledWith('Follow event received:', {
      userId: 'U123456789',
      timestamp: 1234567890,
    })
    expect(console.log).toHaveBeenCalledWith(
      'Sent welcome message to user: U123456789'
    )
  })

  it('User ID が存在しない場合はエラーログを出力して終了する', async () => {
    const mockEvent: FollowEvent = {
      type: 'follow',
      mode: 'active',
      timestamp: 1234567890,
      source: {
        type: 'user',
        userId: undefined as unknown as string, // userIdが存在しない場合をテスト
      },
      replyToken: 'test-reply-token',
      webhookEventId: 'test-webhook-event-id',
      deliveryContext: {
        isRedelivery: false,
      },
    }

    await handleFollowEvent(mockEvent)

    // メッセージ送信が呼ばれていないことを確認
    expect(mockReplyText).not.toHaveBeenCalled()

    // エラーログが出力されたか確認
    expect(console.error).toHaveBeenCalledWith(
      'User ID not found in follow event'
    )
  })

  it('メッセージ送信に失敗した場合はエラーログを出力する', async () => {
    const mockEvent: FollowEvent = {
      type: 'follow',
      mode: 'active',
      timestamp: 1234567890,
      source: {
        type: 'user',
        userId: 'U123456789',
      },
      replyToken: 'test-reply-token',
      webhookEventId: 'test-webhook-event-id',
      deliveryContext: {
        isRedelivery: false,
      },
    }

    const mockError = new Error('Failed to send message')
    mockReplyText.mockRejectedValueOnce(mockError)

    // エラーをスローせずに完了することを確認
    await expect(handleFollowEvent(mockEvent)).resolves.not.toThrow()

    // メッセージ送信が試行されたか確認
    expect(mockReplyText).toHaveBeenCalled()

    // エラーログが出力されたか確認
    expect(console.error).toHaveBeenCalledWith(
      'Failed to send welcome message:',
      mockError
    )
  })

  it('グループチャットへの追加の場合もウェルカムメッセージを送信する', async () => {
    const mockEvent: FollowEvent = {
      type: 'follow',
      mode: 'active',
      timestamp: 1234567890,
      source: {
        type: 'group',
        groupId: 'G123456789',
        userId: 'U123456789',
      },
      replyToken: 'test-reply-token',
      webhookEventId: 'test-webhook-event-id',
      deliveryContext: {
        isRedelivery: false,
      },
    }

    mockReplyText.mockResolvedValueOnce(undefined)

    await handleFollowEvent(mockEvent)

    // ウェルカムメッセージが送信されたか確認
    expect(mockReplyText).toHaveBeenCalledWith(
      'test-reply-token',
      expect.stringContaining('tabijiへようこそ')
    )
  })
})
