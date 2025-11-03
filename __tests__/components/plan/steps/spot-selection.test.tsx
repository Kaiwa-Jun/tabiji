/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { PlanFormProvider } from '@/contexts/plan-form-context'
import { SearchModalProvider } from '@/contexts/search-modal-context'
import { SpotSelectionStep } from '@/components/plan/steps/spot-selection'

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

describe('SpotSelectionStep', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('基本表示', () => {
    it('Google Mapコンポーネントが表示される', () => {
      render(
        <PlanFormProvider>
          <SearchModalProvider>
            <SpotSelectionStep />
          </SearchModalProvider>
        </PlanFormProvider>
      )

      // Google Mapのローディング表示を確認
      expect(screen.getByText('地図を準備しています...')).toBeInTheDocument()
    })

    it('検索バートリガーが表示される', () => {
      render(
        <PlanFormProvider>
          <SearchModalProvider>
            <SpotSelectionStep />
          </SearchModalProvider>
        </PlanFormProvider>
      )

      expect(screen.getByText('スポットを検索...')).toBeInTheDocument()
    })

    it('通常モードでは選択済みスポットのシートが表示される', () => {
      render(
        <PlanFormProvider>
          <SearchModalProvider>
            <SpotSelectionStep />
          </SearchModalProvider>
        </PlanFormProvider>
      )

      // 通常モード時はシートが常に表示される
      expect(screen.getByText('選択済みスポット')).toBeInTheDocument()
    })
  })

  describe('スポット数の表示', () => {
    it('初期状態では選択済みスポットのシートが表示される（スポット数0件）', () => {
      render(
        <PlanFormProvider>
          <SearchModalProvider>
            <SpotSelectionStep />
          </SearchModalProvider>
        </PlanFormProvider>
      )

      // 通常モード時はシートが常に表示される
      expect(screen.getByText('選択済みスポット')).toBeInTheDocument()
      expect(screen.getByText('0件')).toBeInTheDocument()
    })
  })
})
