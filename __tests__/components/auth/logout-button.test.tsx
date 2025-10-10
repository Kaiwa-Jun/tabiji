/**
 * LogoutButtonコンポーネントのテスト
 */

import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { LogoutButton } from '@/components/auth/logout-button'

// useAuthフックのモック
const mockLogout = jest.fn()
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}))

describe('LogoutButton Component', () => {
  // window.confirmのモック
  let confirmSpy: jest.SpyInstance

  beforeEach(() => {
    confirmSpy = jest.spyOn(window, 'confirm')
    mockLogout.mockClear()
  })

  afterEach(() => {
    confirmSpy.mockRestore()
  })

  describe('ボタンの表示', () => {
    it('ログアウトボタンが表示される', () => {
      render(<LogoutButton />)

      const button = screen.getByRole('button', { name: /ログアウト/i })
      expect(button).toBeInTheDocument()
    })

    it('ログアウトアイコンが表示される', () => {
      render(<LogoutButton />)

      // lucide-reactのLogOutアイコンはSVG要素として表示される
      const button = screen.getByRole('button', { name: /ログアウト/i })
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('ログアウト機能', () => {
    it('確認ダイアログでOKを選択するとログアウトが実行される', () => {
      confirmSpy.mockReturnValue(true)

      render(<LogoutButton />)

      const button = screen.getByRole('button', { name: /ログアウト/i })
      fireEvent.click(button)

      // 確認ダイアログが表示される
      expect(confirmSpy).toHaveBeenCalledWith('ログアウトしますか？')

      // logout関数が呼ばれる
      expect(mockLogout).toHaveBeenCalledTimes(1)
    })

    it('確認ダイアログでキャンセルを選択するとログアウトが実行されない', () => {
      confirmSpy.mockReturnValue(false)

      render(<LogoutButton />)

      const button = screen.getByRole('button', { name: /ログアウト/i })
      fireEvent.click(button)

      // 確認ダイアログが表示される
      expect(confirmSpy).toHaveBeenCalledWith('ログアウトしますか？')

      // logout関数は呼ばれない
      expect(mockLogout).not.toHaveBeenCalled()
    })
  })

  describe('スタイリング', () => {
    it('赤色のボタンスタイルが適用されている', () => {
      render(<LogoutButton />)

      const button = screen.getByRole('button', { name: /ログアウト/i })
      expect(button).toHaveClass('bg-red-600')
      expect(button).toHaveClass('text-white')
    })

    it('ホバー時のスタイルクラスが含まれている', () => {
      render(<LogoutButton />)

      const button = screen.getByRole('button', { name: /ログアウト/i })
      expect(button).toHaveClass('hover:bg-red-700')
    })
  })
})
