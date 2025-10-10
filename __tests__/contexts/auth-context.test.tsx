/**
 * AuthContextのテスト
 */

import { renderHook, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { liffClient } from '@/lib/liff/client'
import type { LiffUserProfile } from '@/types/user'

// Server Actionsのモック
const mockRegisterOrUpdateUser = jest.fn()
jest.mock('@/actions/users', () => ({
  registerOrUpdateUser: (profile: LiffUserProfile) =>
    mockRegisterOrUpdateUser(profile),
}))

// LIFF Clientのモック
jest.mock('@/lib/liff/client', () => ({
  liffClient: {
    isLoggedIn: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  },
}))

const mockLiffClient = liffClient as jest.Mocked<typeof liffClient>

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // モックのリセット
    mockLiffClient.isLoggedIn.mockReturnValue(false)
    mockLiffClient.getProfile.mockReset()
    mockLiffClient.logout.mockReset()
    mockRegisterOrUpdateUser.mockReset()
  })

  describe('初期化', () => {
    it('初期状態ではloadingがtrueでuserはnull', () => {
      mockLiffClient.isLoggedIn.mockReturnValue(false)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.user).toBeNull()
      expect(result.current.isInitialized).toBe(false)
    })
  })

  describe('ログイン状態', () => {
    it('LIFFにログイン済みの場合、ユーザー情報を取得して保存する', async () => {
      const mockProfile: LiffUserProfile = {
        userId: 'U1234567890abcdef',
        displayName: 'テストユーザー',
        pictureUrl: 'https://profile.line-scdn.net/test.jpg',
      }

      const mockUser = {
        id: 'user-id-123',
        line_user_id: 'U1234567890abcdef',
        display_name: 'テストユーザー',
        picture_url: 'https://profile.line-scdn.net/test.jpg',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      mockLiffClient.isLoggedIn.mockReturnValue(true)
      mockLiffClient.getProfile.mockResolvedValue(mockProfile)
      mockRegisterOrUpdateUser.mockResolvedValue({
        data: mockUser,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isInitialized).toBe(true)
      expect(mockLiffClient.getProfile).toHaveBeenCalledTimes(1)
      expect(mockRegisterOrUpdateUser).toHaveBeenCalledWith(mockProfile)
    })

    it('LIFFにログインしていない場合、初期化のみ完了する', async () => {
      mockLiffClient.isLoggedIn.mockReturnValue(false)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      // ログインしていない場合、初期化のみ完了する
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('エラーハンドリング', () => {
    it('プロフィール取得に失敗した場合、エラーを処理する', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      mockLiffClient.isLoggedIn.mockReturnValue(true)
      mockLiffClient.getProfile.mockRejectedValue(
        new Error('Profile fetch failed')
      )

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
      // 実装では "Failed to fetch user" というメッセージを使用
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AuthContext] Failed to fetch user:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })

    it('ユーザー登録に失敗した場合、エラーを処理する', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const mockProfile: LiffUserProfile = {
        userId: 'U1234567890abcdef',
        displayName: 'テストユーザー',
      }

      mockLiffClient.isLoggedIn.mockReturnValue(true)
      mockLiffClient.getProfile.mockResolvedValue(mockProfile)
      mockRegisterOrUpdateUser.mockResolvedValue({
        data: null,
        error: 'Database error',
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AuthContext] User registration failed:',
        'Database error'
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('ログアウト機能', () => {
    it('logout関数を呼ぶとLIFFのログアウトが実行される', async () => {
      mockLiffClient.isLoggedIn.mockReturnValue(false)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      // logout関数を実行
      result.current.logout()

      expect(mockLiffClient.logout).toHaveBeenCalledTimes(1)
    })
  })

  describe('refetch機能', () => {
    it('refetch関数を呼ぶとユーザー情報を再取得する', async () => {
      const mockProfile: LiffUserProfile = {
        userId: 'U1234567890abcdef',
        displayName: 'テストユーザー',
      }

      const mockUser = {
        id: 'user-id-123',
        line_user_id: 'U1234567890abcdef',
        display_name: 'テストユーザー',
        picture_url: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      mockLiffClient.isLoggedIn.mockReturnValue(true)
      mockLiffClient.getProfile.mockResolvedValue(mockProfile)
      mockRegisterOrUpdateUser.mockResolvedValue({
        data: mockUser,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      // 初回のプロフィール取得完了
      expect(mockLiffClient.getProfile).toHaveBeenCalledTimes(1)

      // refetch関数を実行
      await result.current.refetch()

      // 2回目のプロフィール取得
      expect(mockLiffClient.getProfile).toHaveBeenCalledTimes(2)
      expect(mockRegisterOrUpdateUser).toHaveBeenCalledTimes(2)
    })
  })
})
