/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { PlanFormProvider } from '@/contexts/plan-form-context'
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
          <SpotSelectionStep />
        </PlanFormProvider>
      )

      // Google Mapのローディング表示を確認
      expect(screen.getByText('地図を準備しています...')).toBeInTheDocument()
    })

    it('検索バートリガーが表示される', () => {
      render(
        <PlanFormProvider>
          <SpotSelectionStep />
        </PlanFormProvider>
      )

      expect(screen.getByText('スポットを検索...')).toBeInTheDocument()
    })

    it('選択済みスポットのシートが表示される', () => {
      render(
        <PlanFormProvider>
          <SpotSelectionStep />
        </PlanFormProvider>
      )

      expect(screen.getByText('選択済みスポット')).toBeInTheDocument()
    })
  })

  describe('スポット数の表示', () => {
    it('初期状態では選択済みスポット数が0件と表示される', () => {
      render(
        <PlanFormProvider>
          <SpotSelectionStep />
        </PlanFormProvider>
      )

      expect(screen.getByText('選択済みスポット')).toBeInTheDocument()
      expect(screen.getByText('0件')).toBeInTheDocument()
    })
  })
})
