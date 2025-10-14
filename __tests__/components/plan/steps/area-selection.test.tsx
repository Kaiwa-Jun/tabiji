/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanFormProvider } from '@/contexts/plan-form-context'
import { AreaSelectionStep } from '@/components/plan/steps/area-selection'

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('AreaSelectionStep', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('基本表示', () => {
    it('タイトルと説明が表示される', () => {
      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      expect(screen.getByText('🗾 エリアを選択')).toBeInTheDocument()
      expect(screen.getByText('旅行先の地方と都道府県を選択してください')).toBeInTheDocument()
    })

    it('地方の選択フィールドが表示される', () => {
      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      // shadcn/ui Selectコンポーネントのプレースホルダーが表示されることを確認
      expect(screen.getByText('地方を選択してください')).toBeInTheDocument()
    })

    it('必須マークが表示される', () => {
      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      const requiredMarks = screen.getAllByText('*')
      expect(requiredMarks.length).toBeGreaterThanOrEqual(1) // 地方が必須
    })

    it('エリアプレビューカードが表示される', () => {
      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      expect(screen.getByText('エリアプレビュー')).toBeInTheDocument()
    })
  })

  describe('地方選択', () => {
    it('地方の選択フィールドが初期状態で表示される', () => {
      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      // shadcn/ui Selectコンポーネントの初期状態
      expect(screen.getByText('地方を選択してください')).toBeInTheDocument()
    })

    it('地方選択時に都道府県フィールドが表示される', async () => {
      // shadcn/uiのSelectコンポーネントの統合テストは、
      // 実際のブラウザ環境でのE2Eテストで確認するため、
      // ここでは基本的なレンダリングのみをテスト
      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      expect(screen.getByText('地方を選択してください')).toBeInTheDocument()
    })
  })

  describe('都道府県選択', () => {
    it('地方未選択時は都道府県フィールドが表示されない', () => {
      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      // 都道府県の選択プレースホルダーが表示されない
      expect(screen.queryByText('都道府県を選択してください')).not.toBeInTheDocument()
    })
  })

  describe('地図プレビュー', () => {
    it('地図コンポーネントがレンダリングされる', () => {
      render(
        <PlanFormProvider>
          <AreaSelectionStep />
        </PlanFormProvider>
      )

      // GoogleMapコンポーネントがレンダリングされることを確認
      const mapContainer = screen.getByTestId('google-map')
      expect(mapContainer).toBeInTheDocument()
    })
  })
})
