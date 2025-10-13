/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MapPlaceholder } from '@/components/map/map-placeholder'

describe('MapPlaceholder', () => {
  describe('基本表示', () => {
    it('マップUIのタイトルが表示される', () => {
      render(<MapPlaceholder />)

      expect(screen.getByText('マップUI（準備中）')).toBeInTheDocument()
    })

    it('実装予定メッセージが表示される', () => {
      render(<MapPlaceholder />)

      expect(screen.getByText(/Google Maps連携は別issueで実装予定/)).toBeInTheDocument()
    })
  })

  describe('検索バー', () => {
    it('検索バーが表示される', () => {
      render(<MapPlaceholder />)

      const searchInput = screen.getByPlaceholderText('スポットを検索...')
      expect(searchInput).toBeInTheDocument()
    })

    it('検索バーが無効化されている', () => {
      render(<MapPlaceholder />)

      const searchInput = screen.getByPlaceholderText('スポットを検索...')
      expect(searchInput).toBeDisabled()
    })
  })

  describe('マップコントロール', () => {
    it('ズームインボタンが表示される', () => {
      render(<MapPlaceholder />)

      const zoomInButtons = screen.getAllByRole('button')
      const zoomInButton = zoomInButtons.find((button) => button.textContent === '+')

      expect(zoomInButton).toBeInTheDocument()
      expect(zoomInButton).toBeDisabled()
    })

    it('ズームアウトボタンが表示される', () => {
      render(<MapPlaceholder />)

      const zoomOutButtons = screen.getAllByRole('button')
      const zoomOutButton = zoomOutButtons.find((button) => button.textContent === '−')

      expect(zoomOutButton).toBeInTheDocument()
      expect(zoomOutButton).toBeDisabled()
    })

    it('位置情報ボタンが表示される', () => {
      render(<MapPlaceholder />)

      const buttons = screen.getAllByRole('button')
      // 位置情報ボタンは3つ目のボタン（+、−、位置情報）
      expect(buttons).toHaveLength(3)
      expect(buttons[2]).toBeDisabled()
    })
  })

  describe('選択済みスポット数表示', () => {
    it('選択済みスポット数が表示される', () => {
      render(<MapPlaceholder />)

      expect(screen.getByText(/選択済みスポット:/)).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText(/件/)).toBeInTheDocument()
    })

    it('ヘルプメッセージが表示される', () => {
      render(<MapPlaceholder />)

      expect(
        screen.getByText(/マップをタップしてスポットを追加できます（実装予定）/)
      ).toBeInTheDocument()
    })
  })

  describe('アイコン表示', () => {
    it('MapPinアイコンが表示される', () => {
      render(<MapPlaceholder />)

      // lucide-reactのMapPinアイコンはSVGとしてレンダリングされる
      const mapPinIcons = document.querySelectorAll('.lucide-map-pin')
      // 中央のアイコン + 位置情報ボタンのアイコン + 選択済みスポット数の横のアイコン = 3つ
      expect(mapPinIcons).toHaveLength(3)
    })

    it('Searchアイコンが表示される', () => {
      render(<MapPlaceholder />)

      // lucide-reactのSearchアイコンはSVGとしてレンダリングされる
      const searchIcon = document.querySelector('.lucide-search')
      expect(searchIcon).toBeInTheDocument()
    })
  })

  describe('スタイリング', () => {
    it('青基調のグラデーション背景が適用されている', () => {
      render(<MapPlaceholder />)

      const mapArea = document.querySelector('.bg-gradient-to-br')
      expect(mapArea).toBeInTheDocument()
      expect(mapArea).toHaveClass('from-blue-50')
      expect(mapArea).toHaveClass('via-blue-100')
      expect(mapArea).toHaveClass('to-blue-200')
    })

    it('選択済みスポット数エリアが青基調で表示される', () => {
      render(<MapPlaceholder />)

      // 選択済みスポット数のテキストの親要素（pタグ）の親要素（divタグ）を取得
      const spotCountText = screen.getByText(/選択済みスポット:/)
      const spotCountArea = spotCountText.closest('div')?.parentElement
      expect(spotCountArea).toHaveClass('bg-blue-50')
      expect(spotCountArea).toHaveClass('border-blue-200')
    })
  })
})
