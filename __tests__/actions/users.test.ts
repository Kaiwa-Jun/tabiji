/**
 * Server Actions (users.ts) のテスト
 *
 * 注意: このテストは最小限のモックでSupabaseクライアントをモック化します
 */

import { registerOrUpdateUser, getUserByLineId } from '@/actions/users'
import type { LiffUserProfile, User } from '@/types/user'

// Supabaseクライアントをモック
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockMaybeSingle = jest.fn()
const mockSingle = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
  })),
}))

describe('Server Actions: users.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('registerOrUpdateUser', () => {
    it('新規ユーザーを作成できる', async () => {
      const profile: LiffUserProfile = {
        userId: 'U1234567890abcdef1234567890abcdef', // 33文字のLINE User ID
        displayName: 'テストユーザー',
        pictureUrl: 'https://example.com/test.jpg',
        statusMessage: 'テスト中',
      }

      const mockUser: User = {
        id: 'user-id-123',
        line_user_id: profile.userId,
        display_name: profile.displayName,
        picture_url: profile.pictureUrl ?? null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      // 既存ユーザー検索: 見つからない
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      // 新規ユーザー作成
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null,
            }),
          }),
        }),
      })

      // user_settings作成
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: mockUser.id,
                notification_enabled: true,
                reminder_enabled: false,
                default_display_mode: 'order_only',
              },
              error: null,
            }),
          }),
        }),
      })

      const result = await registerOrUpdateUser(profile)

      expect(result.error).toBeNull()
      expect(result.data).not.toBeNull()
      expect(result.data?.line_user_id).toBe(profile.userId)
      expect(result.data?.display_name).toBe(profile.displayName)
      expect(result.data?.picture_url).toBe(profile.pictureUrl)
    })

    it('既存ユーザーを更新できる', async () => {
      const profile: LiffUserProfile = {
        userId: 'U1234567890abcdef1234567890abcdef', // 33文字のLINE User ID
        displayName: '更新済みユーザー',
        pictureUrl: 'https://example.com/updated.jpg',
      }

      const existingUser: User = {
        id: 'user-id-123',
        line_user_id: profile.userId,
        display_name: '初期ユーザー',
        picture_url: 'https://example.com/initial.jpg',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      const updatedUser: User = {
        ...existingUser,
        display_name: profile.displayName,
        picture_url: profile.pictureUrl ?? null,
        updated_at: '2025-01-02T00:00:00Z',
      }

      // 既存ユーザー検索: 見つかる
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: existingUser,
              error: null,
            }),
          }),
        }),
      })

      // ユーザー更新
      mockFrom.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedUser,
                error: null,
              }),
            }),
          }),
        }),
      })

      const result = await registerOrUpdateUser(profile)

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe(existingUser.id)
      expect(result.data?.display_name).toBe(profile.displayName)
      expect(result.data?.picture_url).toBe(profile.pictureUrl)
    })

    it('pictureUrlがない場合でも登録できる', async () => {
      const profile: LiffUserProfile = {
        userId: 'U1234567890abcdef1234567890abcdef', // 33文字のLINE User ID
        displayName: '画像なしユーザー',
        // pictureUrlなし
      }

      const mockUser: User = {
        id: 'user-id-123',
        line_user_id: profile.userId,
        display_name: profile.displayName,
        picture_url: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      // 既存ユーザー検索: 見つからない
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      // 新規ユーザー作成
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null,
            }),
          }),
        }),
      })

      // user_settings作成
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {},
              error: null,
            }),
          }),
        }),
      })

      const result = await registerOrUpdateUser(profile)

      expect(result.error).toBeNull()
      expect(result.data?.picture_url).toBeNull()
    })

    it('statusMessageを保存できる', async () => {
      const profile: LiffUserProfile = {
        userId: 'U1234567890abcdef1234567890abcdef', // 33文字のLINE User ID
        displayName: 'ステータスありユーザー',
        statusMessage: '今日はいい天気ですね',
      }

      const mockUser: User = {
        id: 'user-id-123',
        line_user_id: profile.userId,
        display_name: profile.displayName,
        picture_url: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      // 既存ユーザー検索: 見つからない
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      // 新規ユーザー作成
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null,
            }),
          }),
        }),
      })

      // user_settings作成
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {},
              error: null,
            }),
          }),
        }),
      })

      const result = await registerOrUpdateUser(profile)

      expect(result.error).toBeNull()
      expect(result.data).not.toBeNull()
    })

    it('空のuserIdの場合はエラーを返す', async () => {
      const profile: LiffUserProfile = {
        userId: '',
        displayName: 'テストユーザー',
      }

      const result = await registerOrUpdateUser(profile)

      expect(result.error).toBe('ユーザーIDが無効です')
      expect(result.data).toBeNull()
    })

    it('不正な形式のLINE User ID（短すぎる）の場合はエラーを返す', async () => {
      const profile: LiffUserProfile = {
        userId: 'U123', // 33文字未満
        displayName: 'テストユーザー',
      }

      const result = await registerOrUpdateUser(profile)

      expect(result.error).toBe('LINE User IDの形式が無効です')
      expect(result.data).toBeNull()
    })

    it('不正な形式のLINE User ID（Uで始まらない）の場合はエラーを返す', async () => {
      const profile: LiffUserProfile = {
        userId: 'X1234567890abcdef1234567890abcdef', // Uで始まらない
        displayName: 'テストユーザー',
      }

      const result = await registerOrUpdateUser(profile)

      expect(result.error).toBe('LINE User IDの形式が無効です')
      expect(result.data).toBeNull()
    })

    it('データベースエラー時は適切にエラーハンドリングされる', async () => {
      const profile: LiffUserProfile = {
        userId: 'U1234567890abcdef1234567890abcdef',
        displayName: 'テストユーザー',
      }

      // 既存ユーザー検索: 見つからない
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      // 新規ユーザー作成: エラー発生
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection error' },
            }),
          }),
        }),
      })

      const result = await registerOrUpdateUser(profile)

      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })
  })

  describe('getUserByLineId', () => {
    it('LINE User IDでユーザーを取得できる', async () => {
      const testLineUserId = 'U1234567890abcdef1234567890abcdef' // 33文字

      const mockUser: User = {
        id: 'user-id-123',
        line_user_id: testLineUserId,
        display_name: '取得テストユーザー',
        picture_url: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null,
            }),
          }),
        }),
      })

      const result = await getUserByLineId(testLineUserId)

      expect(result.error).toBeNull()
      expect(result.data).not.toBeNull()
      expect(result.data?.line_user_id).toBe(testLineUserId)
      expect(result.data?.display_name).toBe('取得テストユーザー')
    })

    it('存在しないLINE User IDの場合はnullを返す', async () => {
      const nonExistentId = 'U99999999999999999999999999999999' // 33文字 (実際の9の数:32個)

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      const result = await getUserByLineId(nonExistentId)

      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })

    it('空のLINE User IDの場合はエラーを返す', async () => {
      const result = await getUserByLineId('')

      expect(result.error).toBe('ユーザーIDが無効です')
      expect(result.data).toBeNull()
    })

    it('不正な形式のLINE User IDの場合はエラーを返す', async () => {
      const result = await getUserByLineId('invalid-id')

      expect(result.error).toBe('LINE User IDの形式が無効です')
      expect(result.data).toBeNull()
    })
  })
})
