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

    it('通常モードでは選択済みスポットのシートは初期状態では表示されない', () => {
      render(
        <PlanFormProvider>
          <SearchModalProvider>
            <SpotSelectionStep />
          </SearchModalProvider>
        </PlanFormProvider>
      )

      // 初期タブが'route-list'に変更されたため、シートは表示されない
      expect(screen.queryByText('選択済みスポット')).not.toBeInTheDocument()
    })
  })

  describe('スポット数の表示', () => {
    it('初期状態では選択済みスポットのシートは表示されない', () => {
      render(
        <PlanFormProvider>
          <SearchModalProvider>
            <SpotSelectionStep />
          </SearchModalProvider>
        </PlanFormProvider>
      )

      // 初期タブが'route-list'のため、シートは表示されない
      expect(screen.queryByText('選択済みスポット')).not.toBeInTheDocument()
      expect(screen.queryByText('0件')).not.toBeInTheDocument()
    })
  })
})
