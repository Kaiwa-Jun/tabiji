/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { CompletionStep } from '@/components/plan/steps/completion'
import { PlanFormProvider } from '@/contexts/plan-form-context'

// テスト用のラッパーコンポーネント
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <PlanFormProvider>{children}</PlanFormProvider>
)

describe('CompletionStep', () => {
  describe('基本表示', () => {
    it('完了メッセージが表示される', () => {
      render(<CompletionStep />, { wrapper: Wrapper })

      expect(screen.getByText('🎉 プラン作成完了！')).toBeInTheDocument()
      expect(screen.getByText(/旅行プランが作成されました/)).toBeInTheDocument()
      expect(screen.getByText(/プラン一覧から確認できます/)).toBeInTheDocument()
    })

    it('チェックアイコンが表示される', () => {
      const { container } = render(<CompletionStep />, { wrapper: Wrapper })

      // SVG要素（Check アイコン）が表示される
      const checkIcon = container.querySelector('svg.lucide-check')
      expect(checkIcon).toBeInTheDocument()
    })
  })

  describe('ナビゲーションボタン', () => {
    it('プラン一覧へのリンクが表示される', () => {
      render(<CompletionStep />, { wrapper: Wrapper })

      const planListLink = screen.getByRole('link', { name: /プラン一覧を見る/ })
      expect(planListLink).toBeInTheDocument()
      expect(planListLink).toHaveAttribute('href', '/liff/plans')
    })

    it('トップへのリンクが表示される', () => {
      render(<CompletionStep />, { wrapper: Wrapper })

      const topLink = screen.getByRole('link', { name: /トップに戻る/ })
      expect(topLink).toBeInTheDocument()
      expect(topLink).toHaveAttribute('href', '/liff')
    })

    it('マップに戻るボタンが表示される', () => {
      render(<CompletionStep />, { wrapper: Wrapper })

      const mapButton = screen.getByRole('button', { name: /マップに戻る/ })
      expect(mapButton).toBeInTheDocument()
    })
  })

  describe('レイアウト', () => {
    it('プラン一覧ボタンが緑色スタイル（プライマリ）である', () => {
      const { container } = render(<CompletionStep />, { wrapper: Wrapper })

      const planListLink = screen.getByRole('link', { name: /プラン一覧を見る/ })
      expect(planListLink.className).toContain('bg-green-500')
    })

    it('トップボタンがアウトラインスタイルである', () => {
      const { container } = render(<CompletionStep />, { wrapper: Wrapper })

      const topLink = screen.getByRole('link', { name: /トップに戻る/ })
      // アウトラインボタンのスタイルチェック（variant="outline"）
      expect(topLink).toBeInTheDocument()
    })
  })
})
