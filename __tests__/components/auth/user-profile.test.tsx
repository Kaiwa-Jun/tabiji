/**
 * UserProfileコンポーネントのテスト
 */

import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { UserProfile } from '@/components/auth/user-profile'
import type { User } from '@/types/user'

// useAuthフックをモック
const mockUseAuth = jest.fn()
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('UserProfile Component', () => {
  beforeEach(() => {
    mockUseAuth.mockClear()
  })

  describe('ローディング状態', () => {
    it('ローディング中はスケルトンを表示する', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        isInitialized: true,
        logout: jest.fn(),
        refetch: jest.fn(),
      })

      render(<UserProfile />)

      // スケルトン要素の確認（animate-pulseクラスを持つ要素）
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('未ログイン状態', () => {
    it('未ログインメッセージを表示する', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isInitialized: true,
        logout: jest.fn(),
        refetch: jest.fn(),
      })

      render(<UserProfile />)

      expect(screen.getByText('ログインしていません')).toBeInTheDocument()
    })
  })

  describe('ログイン済み状態', () => {
    const mockUser: User = {
      id: '12345-test-id',
      line_user_id: 'U1234567890abcdef',
      display_name: 'テストユーザー',
      picture_url: 'https://profile.line-scdn.net/test.jpg',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }

    it('ユーザー名を表示する', () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isInitialized: true,
        logout: jest.fn(),
        refetch: jest.fn(),
      })

      render(<UserProfile />)

      expect(screen.getByText('テストユーザー')).toBeInTheDocument()
    })

    it('LINE User IDを表示する', () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isInitialized: true,
        logout: jest.fn(),
        refetch: jest.fn(),
      })

      render(<UserProfile />)

      expect(screen.getByText('U1234567890abcdef')).toBeInTheDocument()
    })

    it('プロフィール画像を表示する', () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isInitialized: true,
        logout: jest.fn(),
        refetch: jest.fn(),
      })

      render(<UserProfile />)

      const image = screen.getByAltText('テストユーザー')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src')
    })

    it('プロフィール画像がない場合は代替アイコンを表示する', () => {
      const userWithoutPicture: User = {
        ...mockUser,
        picture_url: null,
      }

      mockUseAuth.mockReturnValue({
        user: userWithoutPicture,
        isLoading: false,
        isInitialized: true,
        logout: jest.fn(),
        refetch: jest.fn(),
      })

      render(<UserProfile />)

      // 代替アイコンには名前の頭文字が表示される
      expect(screen.getByText('テ')).toBeInTheDocument()
    })

    it('表示名がない場合は「名前なし」を表示する', () => {
      const userWithoutName: User = {
        ...mockUser,
        display_name: null,
      }

      mockUseAuth.mockReturnValue({
        user: userWithoutName,
        isLoading: false,
        isInitialized: true,
        logout: jest.fn(),
        refetch: jest.fn(),
      })

      render(<UserProfile />)

      expect(screen.getByText('名前なし')).toBeInTheDocument()
    })
  })
})
